import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Bell, MapPin, X, History, ArrowRight, LogOut, Settings, 
  CircleCheck, ReceiptText, Clock, Activity, Coins, 
  PackageCheck, ShoppingBasket, TrendingUp, ChefHat, Edit2,
  CheckCircle2, User, ChevronRight, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../lib/api";
import { connectSocket, socket } from "../../lib/socket";
import { useAuth } from "../../contexts/useAuth";
import { formatINR, titleCase } from "../../lib/format";
export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [canteenName, setCanteenName] = useState(() => localStorage.getItem("canteenName") || "Admin Canteen");
  const [canteenDP, setCanteenDP] = useState(() => localStorage.getItem("canteenDP") || null);
  const [isOpen, setIsOpen] = useState(() => localStorage.getItem("canteenOpen") === "true");
  const [todayRevenue, setTodayRevenue] = useState(0);
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/orders");
        if (!cancelled) {
          const allOrders = data.data || [];
          setOrders(allOrders);
          const today = new Date().toDateString();
          const revenue = allOrders
            .filter(o => new Date(o.createdAt).toDateString() === today && ["completed", "ready", "paid", "preparing"].includes(o.status))
            .reduce((sum, o) => sum + o.totalAmount, 0);
          setTodayRevenue(revenue);
          try {
             const settingsRes = await api.get('/settings');
             if (settingsRes.data?.data) {
                setCanteenName(settingsRes.data.data.canteenName);
                localStorage.setItem("canteenName", settingsRes.data.data.canteenName);
                if (settingsRes.data.data.canteenDP) {
                   setCanteenDP(settingsRes.data.data.canteenDP);
                   localStorage.setItem("canteenDP", settingsRes.data.data.canteenDP);
                }
                if (settingsRes.data.data.isOpen !== undefined) {
                   setIsOpen(settingsRes.data.data.isOpen);
                   localStorage.setItem("canteenOpen", settingsRes.data.data.isOpen);
                }
             }
          } catch (e) {
             console.error("Failed to sync settings", e);
          }
        }
      } catch (err) {
        if (!cancelled) setOrders([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    connectSocket();
    socket.emit("join_admin_dashboard");
    socket.emit("join_kitchen_room");
    const onStatusUpdate = (payload) => {
      setOrders((prev) => 
        prev.map(order => 
          order._id === payload.orderId ? { ...order, status: payload.status } : order
        )
      );
    };
    const onNewOrder = (payload) => {
      setNotification(`🔔 New Order! #${payload.orderId?.slice(-8)} — ₹${payload.totalAmount}`);
      api.get("/orders").then(({ data }) => setOrders(data.data || []));
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
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
    } catch (err) {
      console.error(err);
    }
  };
  const activeOrders = useMemo(() => {
    return orders.filter(o => ["pending", "paid", "preparing", "ready"].includes(o.status));
  }, [orders]);
  return (
    <div className="relative min-h-screen pb-24 font-sans bg-[#F5F5F5]">
      
      <div className="absolute top-0 left-0 right-0 h-[300px] w-full z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/banner.webp)',
            backgroundPosition: 'center top'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-cocoa-900/80 via-cocoa-900/60 to-[#F5F5F5]" />
      </div>
      
      <div className="relative px-4 pt-6 z-20">
        <header className="flex items-center justify-between">
          <div 
            onClick={() => navigate("/admin/profile")}
            className="flex cursor-pointer items-center gap-2 group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-[0.75rem] bg-white/20 backdrop-blur-md text-white transition active:scale-90 overflow-hidden border-2 border-white/10">
              {canteenDP ? (
                 <img src={canteenDP} alt="Canteen" className="h-full w-full object-cover" />
              ) : (
                 <ChefHat size={18} fill="currentColor" fillOpacity={0.3} />
              )}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-white tracking-tight drop-shadow-lg whitespace-nowrap">
                  {canteenName}
                </span>
              </div>
              <p className="text-[9px] font-bold tracking-wide text-white/80 uppercase drop-shadow-lg whitespace-nowrap">
                Admin Console
              </p>
            </div>
          </div>
          
        </header>
        
        <div className="mt-8 flex items-end justify-between text-white drop-shadow-lg">
           <div>
              <h1 className="font-display text-3xl font-black tracking-tight leading-none">Operations</h1>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/80 mt-1.5">Live Restaurant Hub</p>
           </div>
           <div className="flex flex-col items-end gap-2 mb-1">
              <span className={`text-[10px] font-black uppercase tracking-[0.1em] ${isOpen ? 'text-green-400' : 'text-rose-400'}`}>
                 {isOpen ? "Store Open" : "Store Closed"}
              </span>
              <button 
                 onClick={async () => {
                   const newState = !isOpen;
                   setIsOpen(newState);
                   localStorage.setItem("canteenOpen", newState);
                   try {
                     await api.patch('/settings', { isOpen: newState });
                   } catch (err) {
                     setIsOpen(isOpen);
                     localStorage.setItem("canteenOpen", isOpen);
                     console.error("Failed to sync open status", err);
                   }
                 }}
                 className={`relative h-7 w-14 rounded-full p-1 transition-colors duration-300 ${isOpen ? 'bg-green-500' : 'bg-rose-500'} shadow-lg border border-white/20`}
              >
                 <motion.div 
                    animate={{ x: isOpen ? 28 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="h-5 w-5 rounded-full bg-white shadow-sm flex items-center justify-center"
                 >
                    <div className={`h-1.5 w-1.5 rounded-full ${isOpen ? 'bg-green-500' : 'bg-rose-500'}`} />
                 </motion.div>
              </button>
           </div>
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-3">
           <div className="rounded-[1.5rem] bg-white/95 backdrop-blur-xl p-4 shadow-xl shadow-black/5 relative overflow-hidden border border-white/40">
              <div className="absolute top-0 right-0 p-3 opacity-5">
                 <Coins size={44} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-green-600">Today's Earnings</p>
              <p className="mt-1 font-display text-2xl font-black text-cocoa-900">{formatINR(todayRevenue)}</p>
           </div>
           <div className="rounded-[1.5rem] bg-white/95 backdrop-blur-xl p-4 shadow-xl shadow-black/5 relative overflow-hidden border border-white/40">
              <div className="absolute top-0 right-0 p-3 opacity-5">
                 <Activity size={44} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-rose-500">Active Queue</p>
              <p className="mt-1 font-display text-2xl font-black text-cocoa-900">{activeOrders.length}</p>
           </div>
        </div>
      </div>
      {notification && (
        <div className="relative z-20 mt-4 mx-4">
          <div className="flex items-center justify-between rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 shadow-md animate-pulse">
            <p className="text-sm font-semibold text-amber-900">{notification}</p>
            <button 
              onClick={() => setNotification(null)} 
              className="ml-4 rounded-full bg-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-900 hover:bg-amber-300 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      <section className="relative z-20 mt-6 space-y-3 px-3">
         <div className="flex items-center gap-4 px-2 mb-3">
            <div className="h-[2px] w-6 bg-sand-300 rounded-full" />
            <h2 className="font-display text-sm font-black text-cocoa-900 uppercase tracking-widest">Management</h2>
            <div className="h-[2px] flex-1 bg-gradient-to-r from-sand-300 to-transparent rounded-full" />
         </div>
         <div className="grid grid-cols-3 gap-3">
            <Link to="/admin/orders" className="flex flex-col items-center justify-center gap-2 rounded-[1.25rem] bg-gradient-to-b from-[#FDF8FF] to-[#F5EBFF] p-4 shadow-sm border border-[#E3D4F4] transition active:scale-95">
               <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-purple-500 shadow-sm">
                  <History size={18} strokeWidth={2.5} />
               </div>
               <span className="text-[10px] font-black text-cocoa-900 uppercase tracking-wide">Orders</span>
            </Link>
            <Link to="/admin/menu" className="flex flex-col items-center justify-center gap-2 rounded-[1.25rem] bg-gradient-to-b from-[#FFF5F4] to-[#FFE8E6] p-4 shadow-sm border border-[#F4C8C5] transition active:scale-95">
               <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-rose-500 shadow-sm">
                  <ShoppingBasket size={18} strokeWidth={2.5} />
               </div>
               <span className="text-[10px] font-black text-cocoa-900 uppercase tracking-wide">Menu</span>
            </Link>
            <Link to="/admin/history" className="flex flex-col items-center justify-center gap-2 rounded-[1.25rem] bg-gradient-to-b from-[#F4F9FF] to-[#E6F0FF] p-4 shadow-sm border border-[#CDE0FF] transition active:scale-95">
               <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-blue-500 shadow-sm">
                  <PackageCheck size={18} strokeWidth={2.5} />
               </div>
               <span className="text-[10px] font-black text-cocoa-900 uppercase tracking-wide">History</span>
            </Link>
         </div>
      </section>
      
      <section className="relative z-20 mt-8 px-4">
         <div className="flex items-center justify-between mb-5 px-1">
            <h2 className="font-display text-sm font-black text-cocoa-900 uppercase tracking-[0.2em]">Live Updates</h2>
            <div className="flex h-5 items-center px-2.5 rounded-full bg-[#1A1A1A] text-[9px] font-black text-white">
               {activeOrders.length} Active
            </div>
         </div>
         <div className="space-y-3">
            <AnimatePresence initial={false}>
               
               {activeOrders.map(order => (
                  <motion.div 
                     layout
                     initial={{ opacity: 0, height: 0, scale: 0.8, y: -20 }}
                     animate={{ opacity: 1, height: 'auto', scale: 1, y: 0 }}
                     exit={{ opacity: 0, height: 0, scale: 0.9, transition: { duration: 0.2 } }}
                     transition={{ type: "spring", stiffness: 400, damping: 25, mass: 0.8 }}
                     key={order._id}
                     className="overflow-hidden mb-3"
                  >
                     <div 
                        onClick={() => navigate("/admin/orders")}
                        className="group flex items-center justify-between rounded-[1.25rem] bg-white p-4 shadow-sm border border-sand-100 transition-all active:scale-[0.98]"
                     >
                        <div className="flex items-center gap-4">
                           <div className="relative">
                              <div className="h-10 w-10 rounded-full bg-sand-50 flex items-center justify-center text-rose-500">
                                 <ShoppingBasket size={18} strokeWidth={2.5} />
                              </div>
                              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-rose-500 border-2 border-white animate-pulse" />
                           </div>
                           <div>
                              <p className="text-[12px] font-black text-rose-500 uppercase tracking-tighter italic">Incoming Order</p>
                              <p className="text-[9px] font-bold text-cocoa-900/40 uppercase tracking-widest mt-0.5">
                                 By {order.user?.name || "Guest"} • #{order._id.slice(-4)}
                              </p>
                           </div>
                        </div>
                        <ChevronRight size={14} className="text-cocoa-900/10" />
                     </div>
                  </motion.div>
               ))}
                {activeOrders.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-20 border-2 border-dashed border-sand-200 rounded-[1.5rem]">
                    <Clock size={40} strokeWidth={1.5} />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">No updates available</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
      </section>
    </div>
  );
}
