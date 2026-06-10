import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import { formatINR, titleCase } from "../../lib/format";
import { connectSocket, socket } from "../../lib/socket";
import {
  ArrowLeft,
  X,
  Package,
  Clock,
  User,
  ChevronRight,
  ClipboardList,
  Search,
  CheckCircle2,
  XCircle,
  Flame,
  Gift,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function OrdersManagementPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("incoming");
  const [notification, setNotification] = useState(null);
  const loadOrders = async () => {
    try {
      const { data } = await api.get("/orders");
      setOrders(data.data || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadOrders();
    connectSocket();
    socket.emit("join_admin_dashboard");
    const onNewOrder = () => {
      setNotification("New incoming order!");
      loadOrders();
      setTimeout(() => setNotification(null), 4000);
    };
    socket.on("order_status_updated", loadOrders);
    socket.on("new_order", onNewOrder);
    return () => {
      socket.off("order_status_updated", loadOrders);
      socket.off("new_order", onNewOrder);
    };
  }, []);
  const updateStatus = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      loadOrders();
    } catch (error) {
      alert("Status update failed");
    }
  };
  const verifyOrder = async (orderId, pickupCode) => {
    try {
      await api.post(`/orders/${orderId}/verify`, { pickupCode });
      loadOrders();
      setNotification("OTP Verified & Completed!");
      setTimeout(() => setNotification(null), 4000);
    } catch (error) {
      alert(error?.response?.data?.message || "Invalid OTP code.");
    }
  };

  const sections = useMemo(() => {
    const search = searchQuery.toLowerCase();
    const filtered = orders.filter(
      (o) =>
        o._id.toLowerCase().includes(search) ||
        o.user?.name?.toLowerCase().includes(search),
    );
    return {
      incoming: filtered.filter((o) => o.status === "pending"),
      kitchen: filtered.filter(
        (o) =>
          o.status === "accepted" ||
          o.status === "preparing" ||
          o.status === "paid",
      ),
      pickup: filtered.filter((o) => o.status === "ready"),
    };
  }, [orders, searchQuery]);
  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24 font-sans text-cocoa-900">
      <div className="bg-[#F5F5F5] flex items-center justify-between pt-6 px-4 pb-3 border-b border-sand-200/60">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="transition active:scale-90">
            <ArrowLeft size={22} className="text-cocoa-900" />
          </Link>
          <div>
            <h1 className="text-xl font-display font-black text-cocoa-900 tracking-tight leading-tight">
              Order Hub
            </h1>
            <div className="h-[2px] w-full bg-gradient-to-r from-cocoa-900/30 to-transparent mt-0.5" />
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-50 bg-[#F5F5F5]/90 backdrop-blur-md pt-3 border-b border-sand-200/40">
        <div className="px-4 pb-3">
          <div className="relative flex items-center">
            <Search size={16} className="absolute left-3 z-10 text-rose-500" />
            <input
              type="text"
              placeholder="Search ID or Name..."
              className="w-full rounded-[0.75rem] border-none bg-white py-2.5 pl-10 pr-4 text-[10px] font-bold text-cocoa-900 shadow-sm outline-none placeholder:text-cocoa-900/30 transition-all focus:ring-2 focus:ring-cocoa-900/10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex px-4 pb-2">
          <div className="flex w-full bg-sand-100/50 p-1 rounded-full border border-sand-100">
            {[
              {
                id: "incoming",
                label: "Accept",
                icon: Package,
                count: sections.incoming.length,
              },
              {
                id: "kitchen",
                label: "Preparing",
                icon: Flame,
                count: sections.kitchen.length,
              },
              {
                id: "pickup",
                label: "Pickup",
                icon: Gift,
                count: sections.pickup.length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-1 items-center justify-center gap-1.5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-tighter transition-all ${
                  activeTab === tab.id
                    ? "bg-[#1A1A1A] text-white shadow-lg"
                    : "text-cocoa-900/40"
                }`}
              >
                <tab.icon size={12} />
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[7px] ${activeTab === tab.id ? "bg-white text-black" : "bg-sand-200 text-cocoa-900"}`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      <main className="mx-auto w-full max-w-xl px-4 mt-6">
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="mb-4 bg-[#1A1A1A] p-4 rounded-[1rem] shadow-xl flex items-center justify-between text-white"
            >
              <p className="text-[10px] font-black uppercase tracking-widest">
                🔔 {notification}
              </p>
              <button onClick={() => setNotification(null)}>
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="space-y-4">
          {sections[activeTab].length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-20">
              <Package size={48} strokeWidth={1} />
              <p className="text-[10px] font-black uppercase tracking-widest">
                No {activeTab} orders
              </p>
            </div>
          ) : (
            sections[activeTab].map((order) => (
              <motion.article
                layout
                key={order._id}
                className="group relative overflow-hidden rounded-[1.5rem] bg-white p-4 shadow-sm border border-sand-100 transition-none"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black uppercase text-cocoa-900">
                        ID #{order._id.slice(-4)}
                      </span>
                      <span className="text-[8px] font-bold text-cocoa-900/30 flex items-center gap-1">
                        <Clock size={9} />{" "}
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] font-black text-rose-500 uppercase tracking-widest">
                      {order.user?.name || "Guest"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-display font-black text-cocoa-900 leading-none">
                      {formatINR(order.totalAmount)}
                    </p>
                    <p className="text-[8px] font-black text-cocoa-900/30 uppercase tracking-widest mt-0.5">
                      Payable
                    </p>
                  </div>
                </div>

                <div className="bg-sand-50/50 rounded-[1rem] p-3 space-y-1.5 border border-sand-50">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-[11px] font-semibold"
                    >
                      <span className="text-cocoa-900/40">
                        <span className="text-cocoa-900 font-black">
                          {item.quantity}x
                        </span>{" "}
                        {item.name}
                      </span>
                      <ChevronRight size={10} className="text-cocoa-900/10" />
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  {activeTab === "incoming" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatus(order._id, "accepted")}
                        className="flex-1 rounded-[1rem] bg-emerald-500 py-3 text-[10px] font-black text-white uppercase tracking-widest flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={14} /> Accept
                      </button>
                      <button
                        onClick={() => updateStatus(order._id, "cancelled")}
                        className="px-6 rounded-[1rem] bg-rose-50 text-rose-500 py-3 text-[10px] font-black uppercase tracking-widest"
                      >
                        <XCircle size={14} />
                      </button>
                    </div>
                  )}
                  {activeTab === "kitchen" &&
                    (order.status === "accepted" ? (
                      <button
                        onClick={() => updateStatus(order._id, "preparing")}
                        className="w-full rounded-[1rem] bg-orange-500 py-3.5 text-[10px] font-black text-white uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg"
                      >
                        <Flame size={14} /> Start Preparing
                      </button>
                    ) : (
                      <button
                        onClick={() => updateStatus(order._id, "ready")}
                        className="w-full rounded-[1rem] bg-amber-500 py-3.5 text-[10px] font-black text-white uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg"
                      >
                        <CheckCircle2 size={14} /> Mark as Ready
                      </button>
                    ))}
                  {activeTab === "pickup" && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-[1rem] border border-emerald-100">
                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                          Pickup Code
                        </span>
                        <span className="text-sm font-black text-emerald-700 tracking-[0.2em] font-mono">
                          {order.pickupCodePlain || "0000"}
                        </span>
                      </div>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const code = new FormData(e.target).get("pickupCode");
                          verifyOrder(order._id, code);
                        }}
                        className="flex items-center gap-2"
                      >
                        <input
                          name="pickupCode"
                          placeholder="Enter 6-digit OTP"
                          required
                          className="flex-1 rounded-[1rem] bg-white px-4 py-3.5 text-[10px] font-black text-[#1A1A1A] outline-none border border-sand-200 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-cocoa-900/30 shadow-sm"
                        />
                        <button
                          type="submit"
                          className="rounded-[1rem] bg-[#1A1A1A] px-5 py-3.5 text-[10px] font-black text-white uppercase tracking-widest flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                          <Gift size={14} /> Verify
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </motion.article>
            ))
          )}
        </div>
      </main>
      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  );
}
