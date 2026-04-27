import { useEffect, useState } from "react";
import api from "../../lib/api";
import { formatINR, titleCase } from "../../lib/format";
import { connectSocket, socket } from "../../lib/socket";
const statuses = [
  "pending",
  "paid",
  "preparing",
  "ready",
  "cancelled",
];
const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  paid: "bg-blue-100 text-blue-800 border-blue-300",
  preparing: "bg-orange-100 text-orange-800 border-orange-300",
  ready: "bg-green-100 text-green-800 border-green-300",
  completed: "bg-emerald-100 text-emerald-800 border-emerald-300",
  cancelled: "bg-red-100 text-red-800 border-red-300",
};
export default function StaffOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ text: "", isError: false });
  const [notification, setNotification] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/orders");
        if (!cancelled) setOrders(data.data || []);
      } catch {
        if (!cancelled) {
          setOrders([]);
          setFeedback({ text: "Failed to load orders.", isError: true });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [reloadKey]);
  useEffect(() => {
    connectSocket();
    socket.emit("join_kitchen_room");
    const onStatusUpdate = (payload) => {
      setOrders((prev) => 
        prev.map(order => 
          order._id === payload.orderId ? { ...order, status: payload.status } : order
        )
      );
    };
    const onNewOrder = (payload) => {
      setNotification(`🔔 New order received! #${payload.orderId?.slice(-8)} — ₹${payload.totalAmount}`);
      setReloadKey((k) => k + 1);
      setTimeout(() => setNotification(null), 6000);
    };
    socket.on("order_status_updated", onStatusUpdate);
    socket.on("new_order", onNewOrder);
    return () => {
      socket.off("order_status_updated", onStatusUpdate);
      socket.off("new_order", onNewOrder);
    };
  }, []);
  const updateStatus = async (orderId, status) => {
    setFeedback({ text: "", isError: false });
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      setFeedback({
        text: `Order #${orderId.slice(-8)} updated to ${titleCase(status)}.`,
        isError: false,
      });
      setReloadKey((k) => k + 1);
    } catch (error) {
      setFeedback({
        text: error?.response?.data?.message || "Could not update order.",
        isError: true,
      });
    }
  };
  const verifyOrder = async (orderId, pickupCode) => {
    setFeedback({ text: "", isError: false });
    try {
      await api.post(`/orders/${orderId}/verify`, { pickupCode });
      setFeedback({
        text: `Order #${orderId.slice(-8)} verified & completed via OTP.`,
        isError: false,
      });
      setReloadKey((k) => k + 1);
    } catch (error) {
      setFeedback({
        text: error?.response?.data?.message || "Invalid OTP code.",
        isError: true,
      });
    }
  };
  return (
    <section className="space-y-5 pt-2 md:pt-4">
      {notification && (
        <div className="flex items-center justify-between rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 shadow-md animate-pulse">
          <p className="text-sm font-semibold text-amber-900">{notification}</p>
          <button 
            onClick={() => setNotification(null)} 
            className="ml-4 rounded-full bg-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-900 hover:bg-amber-300 transition-colors"
          >
            ✕
          </button>
        </div>
      )}
      <div className="lux-card">
        <p className="text-xs uppercase tracking-[0.25em] text-cocoa-500">
          Kitchen Orders
        </p>
        <h2 className="mt-1 font-display text-3xl text-cocoa-900">
          Order management
        </h2>
        {feedback.text ? (
          <p className={`mt-3 text-sm font-semibold ${feedback.isError ? "text-red-600" : "text-green-700"}`}>
            {feedback.text}
          </p>
        ) : null}
      </div>
      {loading ? (
        <div className="lux-card text-cocoa-700">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="lux-card text-cocoa-700">No orders found.</div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <article
              key={order._id}
              className="lux-card"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-cocoa-900">
                    #{order._id.slice(-8)}
                  </p>
                  <p className="text-xs text-cocoa-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <div className="mt-2 space-y-1">
                    {order.items?.map((item, idx) => (
                      <p key={idx} className="text-xs text-cocoa-700">
                        {item.quantity}x {item.name}
                      </p>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-cocoa-900">
                    {order.user?.name || "Unknown"}
                  </p>
                  <p className="text-sm text-cocoa-700">
                    {order.user?.email || "-"}
                  </p>
                </div>
                <p className="font-display text-2xl text-cocoa-900">
                  {formatINR(order.totalAmount)}
                </p>
                <div>
                  <p className="font-mono text-2xl font-bold text-cocoa-900">
                    {order.pickupCodePlain || "N/A"}
                  </p>
                  <p className="text-xs text-cocoa-500">Pickup OTP</p>
                </div>
              </div>
              <div className="mt-4 border-t border-sand-200 pt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-cocoa-500">
                  Current: <span className={`ml-1 inline-block rounded-full border px-2 py-0.5 text-xs font-bold ${statusColors[order.status] || ""}`}>{titleCase(order.status)}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {statuses.map((status) => (
                    <button
                      key={status}
                      type="button"
                      disabled={order.status === status || order.status === "completed"}
                      onClick={() => updateStatus(order._id, status)}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
                        order.status === status
                          ? "bg-cocoa-900 text-ivory-50 border-cocoa-900 cursor-default"
                          : order.status === "completed"
                            ? "border-cocoa-200 text-cocoa-400 bg-sand-50 cursor-not-allowed"
                            : "border-cocoa-300 text-cocoa-700 hover:bg-cocoa-900 hover:text-ivory-50 hover:border-cocoa-900"
                      }`}
                    >
                      {titleCase(status)}
                    </button>
                  ))}
                </div>
                {order.status === "ready" && (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const code = new FormData(e.target).get("pickupCode");
                      verifyOrder(order._id, code);
                    }}
                    className="mt-4 flex items-center gap-3 border-t border-sand-200 pt-4"
                  >
                    <input 
                      name="pickupCode" 
                      placeholder="Enter 6-digit OTP" 
                      required 
                      className="lux-input py-1.5 px-3 text-sm h-auto max-w-[150px]" 
                    />
                    <button type="submit" className="lux-button py-1.5 px-4 text-xs font-semibold">
                      Verify & Complete
                    </button>
                  </form>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
