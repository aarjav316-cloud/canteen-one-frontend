import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle } from "lucide-react";
import { formatINR } from "../../lib/format";

/**
 * Confirmation modal for order cancellation
 */
export default function CancelOrderModal({
  isOpen,
  onClose,
  onConfirm,
  order,
  isLoading,
}) {
  if (!order) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-[210] rounded-t-[2rem] bg-white p-6 pb-8 shadow-2xl md:mx-auto md:max-w-md md:rounded-[2rem] md:mb-12"
          >
            {/* Handle Bar */}
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-200" />

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-rose-100">
                  <AlertCircle size={20} className="text-rose-600" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-gray-900 tracking-tight">
                    Cancel Order?
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5 font-medium">
                    Order #{order._id.slice(-4).toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 active:scale-90 disabled:opacity-50"
              >
                <X size={16} />
              </button>
            </div>

            {/* Order Details */}
            <div className="mb-6 rounded-xl bg-gray-50 p-4 border border-gray-100">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">
                    Items
                  </span>
                  <span className="text-xs font-bold text-gray-900">
                    {order.items?.length || 0} item
                    {order.items?.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">
                    Total Amount
                  </span>
                  <span className="text-sm font-black text-gray-900">
                    {formatINR(order.totalAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">
                    Payment Method
                  </span>
                  <span className="text-xs font-bold text-gray-900 capitalize">
                    {order.paymentMethod || "wallet"}
                  </span>
                </div>
              </div>
            </div>

            {/* Warning Message */}
            {order.isPaid && (
              <div className="mb-6 rounded-xl bg-green-50 border border-green-100 p-3">
                <p className="text-xs font-semibold text-green-700 leading-relaxed">
                  💰 {formatINR(order.totalAmount)} will be refunded to your{" "}
                  {order.paymentMethod === "wallet" ? "wallet" : "account"}{" "}
                  {order.paymentMethod === "wallet"
                    ? "instantly"
                    : "in 5-7 business days"}
                  .
                </p>
              </div>
            )}

            {/* Confirmation Text */}
            <p className="text-sm text-gray-600 mb-6 font-medium leading-relaxed">
              Are you sure you want to cancel this order? This action cannot be
              undone.
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-black text-gray-700 transition hover:bg-gray-50 active:scale-[0.98] disabled:opacity-50"
              >
                Keep Order
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 rounded-xl bg-rose-500 px-4 py-3 text-sm font-black text-white transition hover:bg-rose-600 active:scale-[0.98] disabled:opacity-50 disabled:bg-rose-400"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Cancelling...
                  </span>
                ) : (
                  "Yes, Cancel"
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
