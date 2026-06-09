import toast from "react-hot-toast";
import { playNotificationSound } from "../lib/notificationSound";

/**
 * Admin notification service for handling admin-specific notifications
 */

/**
 * Show notification when user cancels order
 */
export const showUserCancelledOrderNotification = ({
  orderIdShort,
  userName,
  totalAmount,
  itemCount,
  refundAmount,
}) => {
  playNotificationSound();

  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } max-w-md w-full bg-white shadow-xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-4 border-orange-500`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            {/* Warning Icon */}
            <div className="flex-shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                <svg
                  className="h-6 w-6 text-orange-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </div>
            </div>

            {/* Content */}
            <div className="ml-3 flex-1">
              <p className="text-sm font-black text-gray-900 tracking-tight">
                User Cancelled Order
              </p>
              <p className="mt-1 text-sm text-gray-700 font-semibold">
                {userName} cancelled order #{orderIdShort}
              </p>
              <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                <span className="font-medium">💰 ₹{totalAmount}</span>
                <span className="font-medium">
                  📦 {itemCount} {itemCount === 1 ? "item" : "items"}
                </span>
                {refundAmount > 0 && (
                  <span className="font-medium text-orange-600">
                    🔄 Refund: ₹{refundAmount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex border-l border-gray-200">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none transition"
          >
            ✕
          </button>
        </div>
      </div>
    ),
    {
      duration: 7000, // Show for 7 seconds
      position: "top-right",
    },
  );
};

/**
 * Show order status update notification for admin
 */
export const showAdminOrderStatusNotification = ({
  orderId,
  status,
  message,
}) => {
  const statusConfig = {
    accepted: { icon: "✅", color: "green", title: "Order Accepted" },
    preparing: { icon: "👨‍🍳", color: "orange", title: "Order Preparing" },
    ready: { icon: "🎉", color: "purple", title: "Order Ready" },
    completed: { icon: "✨", color: "blue", title: "Order Completed" },
    cancelled: { icon: "❌", color: "rose", title: "Order Cancelled" },
  };

  const config = statusConfig[status] || statusConfig.accepted;
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
                {message || `Order #${orderIdShort} is now ${status}`}
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
 * Show generic admin notification
 */
export const showAdminNotification = ({
  title,
  message,
  icon = "🔔",
  type = "info",
}) => {
  playNotificationSound();

  const borderColors = {
    info: "border-blue-500",
    success: "border-green-500",
    warning: "border-orange-500",
    error: "border-rose-500",
  };

  const bgColors = {
    info: "bg-blue-100",
    success: "bg-green-100",
    warning: "bg-orange-100",
    error: "bg-rose-100",
  };

  const textColors = {
    info: "text-blue-600",
    success: "text-green-600",
    warning: "text-orange-600",
    error: "text-rose-600",
  };

  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } max-w-md w-full bg-white shadow-lg rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-4 ${borderColors[type]}`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${bgColors[type]}`}
              >
                <span className={`text-xl ${textColors[type]}`}>{icon}</span>
              </div>
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
