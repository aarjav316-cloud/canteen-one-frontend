import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  ChefHat,
  PackageCheck,
  ReceiptText,
  QrCode,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { showOrderNotification } from "../../services/notificationService.jsx";
import { formatINR } from "../../lib/format";
import { connectSocket, socket } from "../../lib/socket";
import { useAuth } from "../../contexts/useAuth";
import api from "../../lib/api";
import CancelOrderModal from "../../components/student/CancelOrderModal";
const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    dot: "bg-blue-400",
    icon: Clock,
  },
  paid: {
    label: "Pending",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    dot: "bg-blue-400",
    icon: Clock,
  },
  accepted: {
    label: "Accepted",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-400",
    icon: CheckCircle2,
  },
  preparing: {
    label: "Preparing",
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
    dot: "bg-orange-400",
    icon: ChefHat,
  },
  ready: {
    label: "Ready",
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
    dot: "bg-green-500",
    icon: PackageCheck,
  },
  completed: {
    label: "Completed",
    color: "text-gray-500",
    bg: "bg-gray-50",
    border: "border-gray-200",
    dot: "bg-gray-300",
    icon: ReceiptText,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-rose-500",
    bg: "bg-rose-50",
    border: "border-rose-200",
    dot: "bg-rose-400",
    icon: XCircle,
  },
};
const STEPS = ["Pending", "Accepted", "Preparing", "Ready"];
const STEP_STATUS = {
  pending: 0,
  paid: 0,
  accepted: 1,
  preparing: 2,
  ready: 3,
};
function OrderCard({ order, cfg, isReady, isActive, currentStep, onCancel }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = cfg.icon;

  // Determine if order can be cancelled
  const canCancel = ["pending", "paid", "accepted"].includes(order.status);

  return (
    <div
      className={`rounded-[1.25rem] bg-white overflow-hidden shadow-sm border ${isActive ? "border-black/8" : "border-black/5"}`}
    >
      {isActive && (
        <div className="h-[3px] w-full bg-gray-100">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`h-full rounded-full ${order.status === "ready" ? "bg-green-500" : "bg-[#1A1A1A]"}`}
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-black text-black tracking-tight">
                #{order._id.slice(-4).toUpperCase()}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${cfg.color} ${cfg.bg}`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${cfg.dot} inline-block`}
                />
                {cfg.label}
              </span>
            </div>
            <span className="text-[9px] text-gray-400 font-medium">
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              })}
              {" · "}
              {new Date(order.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
              {" · "}
              {order.items.length} {order.items.length === 1 ? "item" : "items"}
            </span>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-sm font-black text-black">
              {formatINR(order.totalAmount)}
            </span>
            <span className="text-[9px] text-gray-300 font-medium capitalize">
              {order.paymentMethod || "wallet"}
            </span>
          </div>
        </div>

        {isActive && (
          <div className="mt-4 flex items-center gap-0">
            {STEPS.map((step, i) => {
              const done = i <= currentStep;
              const active = i === currentStep;
              return (
                <div
                  key={step}
                  className="flex items-center flex-1 last:flex-none"
                >
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-black transition-all
                      ${
                        done
                          ? active && order.status === "ready"
                            ? "bg-green-500 text-white"
                            : done
                              ? "bg-[#1A1A1A] text-white"
                              : "bg-gray-100 text-gray-300"
                          : "bg-gray-100 text-gray-300"
                      }`}
                    >
                      {done ? "✓" : i + 1}
                    </div>
                    <span
                      className={`text-[8px] font-bold whitespace-nowrap ${done ? "text-black" : "text-gray-300"}`}
                    >
                      {step}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-[1.5px] mx-1 mb-4 rounded-full ${i < currentStep ? "bg-[#1A1A1A]" : "bg-gray-100"}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {isReady && (
          <div className="mt-3 rounded-[0.875rem] bg-green-50 border border-green-100 px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.15em] text-green-600/60 mb-1">
                Pickup Code
              </p>
              <p className="text-2xl font-black text-green-700 tracking-[0.25em] leading-none">
                {order.pickupCodePlain || "----"}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
              <QrCode size={18} className="text-green-600" />
            </div>
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
          <div className="flex gap-1.5">
            {(order.items || []).slice(0, 3).map((item, i) => (
              <span
                key={i}
                className="rounded-full bg-gray-50 px-2 py-0.5 text-[9px] font-semibold text-gray-500 border border-gray-100 truncate max-w-[80px]"
              >
                {item.name}
              </span>
            ))}
            {order.items.length > 3 && (
              <span className="rounded-full bg-gray-50 px-2 py-0.5 text-[9px] font-semibold text-gray-400 border border-gray-100">
                +{order.items.length - 3}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[9px] font-black text-gray-400 uppercase tracking-widest transition active:scale-95 flex-shrink-0 ml-2"
          >
            {isExpanded ? "Less ↑" : "More ↓"}
          </button>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-1.5">
                {(order.items || []).map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-gray-300 w-5">
                        {item.quantity}×
                      </span>
                      <span className="text-[11px] font-semibold text-gray-600">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-gray-800">
                      {formatINR(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    Total
                  </span>
                  <span className="text-[12px] font-black text-black">
                    {formatINR(order.totalAmount)}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cancel Order Button */}
        {canCancel && (
          <button
            onClick={() => onCancel(order)}
            className="mt-3 w-full rounded-xl border-2 border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-black text-rose-600 transition hover:bg-rose-100 hover:border-rose-300 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Trash2 size={14} strokeWidth={2.5} />
            Cancel Order
          </button>
        )}
      </div>
    </div>
  );
}
export default function OrdersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [selectedTab, setSelectedTab] = useState("Active");
  const [loading, setLoading] = useState(true);

  // Cancel order state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/orders/my");
      if (data.success) setOrders(data.data);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle cancel order button click
  const handleCancelClick = (order) => {
    setOrderToCancel(order);
    setShowCancelModal(true);
  };

  // Handle confirm cancellation
  const handleConfirmCancel = async () => {
    if (!orderToCancel) return;

    setIsCancelling(true);
    try {
      const { data } = await api.delete(`/orders/${orderToCancel._id}/cancel`);

      if (data.success) {
        // Show success toast
        toast.success("Order cancelled successfully", {
          duration: 4000,
          position: "top-center",
          style: {
            background: "#10B981",
            color: "#fff",
            fontWeight: "bold",
          },
        });

        // Note: Refund toast will be shown automatically via socket event (wallet_refund)
        // No need to manually trigger it here to avoid duplicates

        // Update orders list
        setOrders((prev) =>
          prev.map((o) =>
            o._id === orderToCancel._id ? { ...o, status: "cancelled" } : o,
          ),
        );

        // Close modal
        setShowCancelModal(false);
        setOrderToCancel(null);

        // Refresh orders to get updated data
        setTimeout(() => {
          fetchOrders();
        }, 1000);
      }
    } catch (err) {
      console.error("Failed to cancel order:", err);
      toast.error(
        err?.response?.data?.message ||
          "Failed to cancel order. Please try again.",
        {
          duration: 5000,
          position: "top-center",
        },
      );
    } finally {
      setIsCancelling(false);
    }
  };

  // Handle close modal
  const handleCloseModal = () => {
    if (!isCancelling) {
      setShowCancelModal(false);
      setOrderToCancel(null);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);
  useEffect(() => {
    if (!user) return;
    connectSocket();
    socket.emit("join_user_room", user.id);
    const onStatusUpdate = (payload) => {
      console.log("📦 Order status updated:", payload);

      // Update order in list
      setOrders((prev) =>
        prev.map((o) =>
          o._id === payload.orderId
            ? {
                ...o,
                status: payload.status,
                pickupCodePlain: payload.pickupCodePlain || o.pickupCodePlain,
              }
            : o,
        ),
      );

      // Show toast notification
      showOrderNotification({
        orderId: payload.orderId,
        status: payload.status,
        pickupCode: payload.pickupCodePlain,
        cancelledBy: payload.cancelledBy, // Pass who cancelled the order
      });
    };
    socket.on("order_status_updated", onStatusUpdate);
    return () => socket.off("order_status_updated", onStatusUpdate);
  }, [user]);
  const activeOrders = orders.filter((o) =>
    ["pending", "paid", "accepted", "preparing", "ready"].includes(o.status),
  );
  const pastOrders = orders.filter((o) =>
    ["completed", "cancelled"].includes(o.status),
  );
  const displayOrders = selectedTab === "Active" ? activeOrders : pastOrders;
  const getStepIndex = (status) => {
    if (status === "pending" || status === "paid") return 0;
    if (status === "accepted") return 1;
    if (status === "preparing") return 2;
    if (status === "ready") return 3;
    return -1;
  };
  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24 font-sans">
      <div className="sticky top-0 z-30 bg-[#F5F5F5] relative">
        <div className="px-4 pt-6 pb-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="transition active:scale-90"
          >
            <ArrowLeft size={22} className="text-cocoa-900" />
          </button>
          <div>
            <h1 className="text-xl font-display font-black text-cocoa-900 tracking-tight leading-tight">
              My Orders
            </h1>
            <div className="h-[2px] w-full bg-gradient-to-r from-cocoa-900/30 to-transparent mt-0.5" />
          </div>
        </div>

        <div className="px-4 pb-3">
          <div className="flex w-full rounded-[0.75rem] bg-white p-1 shadow-sm">
            {["Active", "Past"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-[0.5rem] py-2.5 text-xs font-black tracking-wide transition-all ${
                  selectedTab === tab
                    ? "bg-[#1A1A1A] text-white shadow-sm"
                    : "text-cocoa-900/40"
                }`}
              >
                {tab}
                {tab === "Active" && activeOrders.length > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] text-white font-black">
                    {activeOrders.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none translate-y-full"
          style={{
            background: "linear-gradient(to bottom, #F5F5F5, transparent)",
          }}
        />
      </div>

      <div className="px-4 mt-6 space-y-4">
        <div className="flex items-center gap-4 mb-2">
          <div className="h-[2px] flex-1 bg-gradient-to-l from-sand-300 to-transparent" />
          <h2 className="font-display text-base font-black text-cocoa-900 whitespace-nowrap tracking-tight uppercase">
            {selectedTab === "Active" ? "All Orders" : "Past Orders"}
          </h2>
          <div className="h-[2px] flex-1 bg-gradient-to-r from-sand-300 to-transparent" />
        </div>
        {displayOrders.length > 0 ? (
          <>
            {displayOrders.map((order) => {
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const isReady = order.status === "ready";
              const isActive = [
                "pending",
                "paid",
                "accepted",
                "preparing",
                "ready",
              ].includes(order.status);
              const currentStep = getStepIndex(order.status);
              return (
                <OrderCard
                  key={order._id}
                  order={order}
                  cfg={cfg}
                  isReady={isReady}
                  isActive={isActive}
                  currentStep={currentStep}
                  onCancel={handleCancelClick}
                />
              );
            })}

            {selectedTab === "Past" && (
              <div className="flex items-center gap-4 py-4">
                <div className="h-[1.5px] flex-1 bg-gradient-to-l from-sand-300 to-transparent" />
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-cocoa-900/20 whitespace-nowrap">
                  No more past orders
                </p>
                <div className="h-[1.5px] flex-1 bg-gradient-to-r from-sand-300 to-transparent" />
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-white text-cocoa-900/10 shadow-sm">
              <PackageCheck size={32} strokeWidth={1.5} />
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cocoa-900/20">
              {selectedTab === "Active" ? "No active orders" : "No past orders"}
            </p>
          </div>
        )}
      </div>

      {/* Cancel Order Modal */}
      <CancelOrderModal
        isOpen={showCancelModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmCancel}
        order={orderToCancel}
        isLoading={isCancelling}
      />
    </div>
  );
}
