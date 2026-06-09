import toast from "react-hot-toast";
import { playNotificationSound } from "../lib/notificationSound";

/**
 * Show wallet refund toast notification
 * @param {number} amount - Refund amount
 * @param {string} refundMethod - "wallet" or "bank"
 */
export const showWalletRefundToast = (amount, refundMethod = "wallet") => {
  playNotificationSound();

  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } max-w-md w-full bg-white shadow-xl rounded-2xl pointer-events-auto flex border-2 border-green-100`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            {/* Success Icon */}
            <div className="flex-shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-5 w-5 text-green-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                  />
                </svg>
              </div>
            </div>

            {/* Content */}
            <div className="ml-3 flex-1">
              <p className="text-sm font-black text-gray-900 tracking-tight">
                Refund Successful!
              </p>
              <p className="mt-1 text-sm text-gray-600 font-semibold">
                ₹{amount} refunded successfully to your {refundMethod}
              </p>
              {refundMethod === "bank" && (
                <p className="mt-1 text-xs text-gray-400 font-medium">
                  Funds will appear in 5-7 business days
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex border-l border-gray-200">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none transition"
          >
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    ),
    {
      duration: 6000, // Show for 6 seconds
      position: "top-right",
    },
  );
};

/**
 * Show simple wallet refund toast (minimal version)
 * @param {number} amount - Refund amount
 */
export const showSimpleRefundToast = (amount) => {
  playNotificationSound();

  toast.success(`₹${amount} refunded successfully to your wallet`, {
    duration: 5000,
    position: "top-right",
    style: {
      background: "#10B981",
      color: "#fff",
      fontWeight: "bold",
    },
    icon: "💰",
  });
};
