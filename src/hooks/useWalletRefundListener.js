import { useEffect, useRef } from "react";
import { socket } from "../lib/socket";
import { showWalletRefundToast } from "../services/walletNotificationService";

/**
 * Global hook to listen for wallet refund events via Socket.IO
 * Shows toast notification whenever a refund is processed
 *
 * Usage: Call this hook once in a root component (e.g., StudentLayout or App)
 */
export const useWalletRefundListener = () => {
  const processedRefunds = useRef(new Set()); // Track processed refunds to prevent duplicates

  useEffect(() => {
    const handleWalletRefund = (payload) => {
      console.log("💰 Wallet refund received:", payload);

      const { amount, orderId, refundMethod, message } = payload;

      // Create unique ID for this refund
      const refundId = `${orderId}_${amount}_${Date.now()}`;

      // Check if we've already processed this refund (prevent duplicates)
      if (processedRefunds.current.has(orderId)) {
        console.log("⚠️ Duplicate refund event ignored:", orderId);
        return;
      }

      // Mark as processed
      processedRefunds.current.add(orderId);

      // Clean up old entries after 60 seconds (prevent memory leak)
      setTimeout(() => {
        processedRefunds.current.delete(orderId);
      }, 60000);

      // Show toast notification
      showWalletRefundToast(amount, refundMethod || "wallet");

      // Optionally dispatch custom event for other components to listen
      window.dispatchEvent(
        new CustomEvent("wallet_refund", {
          detail: { amount, orderId, refundMethod },
        }),
      );
    };

    // Listen for wallet refund events
    socket.on("wallet_refund", handleWalletRefund);

    return () => {
      socket.off("wallet_refund", handleWalletRefund);
    };
  }, []);
};
