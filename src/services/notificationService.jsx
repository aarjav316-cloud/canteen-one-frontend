import toast from "react-hot-toast";
import { playNotificationSound } from "../lib/notificationSound";

/**
 * Centralized notification service for handling real-time notifications
 */

const STATUS_CONFIG = {
  accepted: {
    icon: "✅",
    title: "Order Accepted!",
    getMessage: (orderId) =>
      `Great news! The canteen has accepted your order #${orderId}.`,
    color: "#10B981",
  },
  preparing: {
    icon: "👨‍🍳",
    title: "Order Being Prepared",
    getMessage: (orderId) =>
      `Your delicious food is being prepared! Order #${orderId} will be ready soon.`,
    color: "#F59E0B",
  },
  ready: {
    icon: "🎉",
    title: "Your Food is Ready!",
    getMessage: (orderId, pickupCode) =>
      pickupCode
        ? `Order #${orderId} is ready for pickup!\n🎫 Pickup Code: ${pickupCode}`
        : `Order #${orderId} is ready for pickup!`,
    color: "#8B5CF6",
  },
  completed: {
    icon: "✨",
    title: "Order Completed",
    getMessage: (orderId) =>
      `Thank you! Order #${orderId} has been completed. Enjoy your meal! 🍽️`,
    color: "#06B6D4",
  },
  cancelled: {
    icon: "❌",
    title: "Order Cancelled",
    getMessage: (orderId, cancelledBy) => {
      if (cancelledBy === "student") {
        return `You cancelled order #${orderId}. Any payment will be refunded.`;
      } else if (cancelledBy === "admin") {
        return `Order #${orderId} was cancelled by the canteen. Any payment will be refunded.`;
      }
      return `Order #${orderId} has been cancelled. Any payment will be refunded.`;
    },
    color: "#EF4444",
  },
  payment_success: {
    icon: "💰",
    title: "Payment Successful",
    color: "#10B981",
  },
  wallet: {
    icon: "💳",
    title: "Wallet Updated",
    color: "#10B981",
  },
};

/**
 * Show order status notification
 */
export const showOrderNotification = ({
  orderId,
  status,
  pickupCode,
  message,
  cancelledBy, // NEW: track who cancelled the order
}) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.accepted;
  const orderIdShort = orderId?.toString().slice(-4).toUpperCase() || "XXXX";

  let notificationMessage = message;

  if (!notificationMessage) {
    if (status === "ready" && pickupCode) {
      notificationMessage = `Order #${orderIdShort} is ready for pickup!\nPickup Code: ${pickupCode}`;
    } else if (status === "cancelled") {
      // Different messages based on who cancelled
      if (cancelledBy === "student") {
        notificationMessage = `You cancelled order #${orderIdShort}`;
      } else if (cancelledBy === "admin") {
        notificationMessage = `Order #${orderIdShort} has been cancelled by the canteen`;
      } else {
        notificationMessage = `Order #${orderIdShort} has been cancelled`;
      }
    } else {
      notificationMessage = `Order #${orderIdShort} is now ${status}`;
    }
  }

  // Play sound
  playNotificationSound();

  // Show toast with custom styling
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } max-w-md w-full bg-white shadow-lg rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <span className="text-2xl">{config.icon}</span>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-black text-gray-900">{config.title}</p>
              <p className="mt-1 text-xs text-gray-500 whitespace-pre-line">
                {notificationMessage}
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none"
          >
            ✕
          </button>
        </div>
      </div>
    ),
    {
      duration: status === "ready" ? 8000 : 5000, // Ready orders stay longer
      position: "top-right",
    },
  );
};

/**
 * Show wallet notification
 */
export const showWalletNotification = ({ amount, type, message }) => {
  const config = STATUS_CONFIG.wallet;

  const notificationMessage =
    message ||
    `₹${amount} ${type === "credit" ? "added to" : "deducted from"} your wallet`;

  playNotificationSound();

  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } max-w-md w-full bg-white shadow-lg rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <span className="text-2xl">{config.icon}</span>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-black text-gray-900">{config.title}</p>
              <p className="mt-1 text-xs text-gray-500">
                {notificationMessage}
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none"
          >
            ✕
          </button>
        </div>
      </div>
    ),
    {
      duration: 4000,
      position: "top-right",
    },
  );
};

/**
 * Show payment success notification
 */
export const showPaymentNotification = ({ orderId, pickupCode }) => {
  const config = STATUS_CONFIG.payment_success;
  const orderIdShort = orderId?.toString().slice(-4).toUpperCase() || "XXXX";

  playNotificationSound();

  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } max-w-md w-full bg-white shadow-lg rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <span className="text-2xl">{config.icon}</span>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-black text-gray-900">{config.title}</p>
              <p className="mt-1 text-xs text-gray-500">
                Order #{orderIdShort} placed successfully!
                {pickupCode && `\nPickup Code: ${pickupCode}`}
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none"
          >
            ✕
          </button>
        </div>
      </div>
    ),
    {
      duration: 6000,
      position: "top-right",
    },
  );
};

/**
 * Show generic notification
 */
export const showGenericNotification = ({ title, message, icon = "🔔" }) => {
  playNotificationSound();

  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } max-w-md w-full bg-white shadow-lg rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <span className="text-2xl">{icon}</span>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-black text-gray-900">{title}</p>
              <p className="mt-1 text-xs text-gray-500">{message}</p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none"
          >
            ✕
          </button>
        </div>
      </div>
    ),
    {
      duration: 5000,
      position: "top-right",
    },
  );
};
