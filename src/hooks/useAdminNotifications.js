import { useEffect } from "react";
import { socket } from "../lib/socket";
import { showUserCancelledOrderNotification } from "../services/adminNotificationService";

/**
 * Hook for admin to listen to order cancellation notifications
 * Usage: Call this in AdminLayout or AdminDashboard
 */
export const useAdminNotifications = () => {
  useEffect(() => {
    // Handler for user cancelled order
    const handleUserCancelledOrder = (payload) => {
      console.log("🚨 Admin: User cancelled order:", payload);

      const {
        orderIdShort,
        userName,
        totalAmount,
        itemCount,
        refundAmount,
        userEmail,
      } = payload;

      // Show toast notification
      showUserCancelledOrderNotification({
        orderIdShort,
        userName,
        totalAmount,
        itemCount,
        refundAmount,
      });

      // Optionally play sound or send desktop notification
      // if (Notification.permission === "granted") {
      //   new Notification("Order Cancelled", {
      //     body: `${userName} cancelled order #${orderIdShort}`,
      //     icon: "/notification-icon.png",
      //   });
      // }
    };

    // Listen for user cancelled order events
    socket.on("user_cancelled_order", handleUserCancelledOrder);

    return () => {
      socket.off("user_cancelled_order", handleUserCancelledOrder);
    };
  }, []);
};
