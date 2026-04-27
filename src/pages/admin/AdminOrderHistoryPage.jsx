import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import { formatINR, titleCase } from "../../lib/format";
import { 
  ArrowLeft, Search, Clock, CheckCircle2, 
  XCircle, PackageCheck, ClipboardList, ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
export default function AdminOrderHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDateFilter, setActiveDateFilter] = useState("All");
  const loadHistory = async () => {
    try {
      const { data } = await api.get("/orders");
      const allOrders = data.data || [];
      const pastOrders = allOrders.filter(o => o.status === "completed" || o.status === "cancelled");
      setHistory(pastOrders);
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadHistory();
  }, []);
  const filteredHistory = useMemo(() => {
    return history.filter(o => {
      const matchSearch = o._id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          o.user?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const orderDate = new Date(o.createdAt);
      const now = new Date();
      let matchDate = true;
      if (activeDateFilter === "Today") {
        matchDate = orderDate.toDateString() === now.toDateString();
      } else if (activeDateFilter === "7D") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        matchDate = orderDate >= sevenDaysAgo;
      } else if (activeDateFilter === "Month") {
        matchDate = orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      }
      return matchSearch && matchDate;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [history, searchQuery, activeDateFilter]);
  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24 font-sans text-cocoa-900">
      
      <div className="bg-[#F5F5F5] flex items-center justify-between pt-6 px-4 pb-3 border-b border-sand-200/60">
         <div className="flex items-center gap-3">
            <Link to="/admin" className="transition active:scale-90">
               <ArrowLeft size={22} className="text-cocoa-900" />
            </Link>
            <div>
               <h1 className="text-xl font-display font-black text-cocoa-900 tracking-tight leading-tight">Order Logs</h1>
               <div className="h-[2px] w-full bg-gradient-to-r from-cocoa-900/30 to-transparent mt-0.5" />
            </div>
         </div>
      </div>
      
      <div className="sticky top-0 z-50 bg-[#F5F5F5]/90 backdrop-blur-md py-3 border-b border-sand-200/40">
        <div className="px-4">
          <div className="relative flex items-center">
            <Search size={16} className="absolute left-3 z-10 text-rose-500" />
            <input
              type="text"
              placeholder="Search previous orders..."
              className="w-full rounded-[0.75rem] border-none bg-white py-2.5 pl-10 pr-4 text-[10px] font-bold text-cocoa-900 shadow-sm outline-none placeholder:text-cocoa-900/30 transition-all focus:ring-2 focus:ring-cocoa-900/5"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-2 overflow-x-auto px-4 mt-3 no-scrollbar">
           {[
             { id: "All", label: "All Time" },
             { id: "Today", label: "Today" },
             { id: "7D", label: "Last 7 Days" },
             { id: "Month", label: "This Month" }
           ].map((f) => (
             <button
               key={f.id}
               onClick={() => setActiveDateFilter(f.id)}
               className={`whitespace-nowrap px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                 activeDateFilter === f.id 
                   ? "bg-[#1A1A1A] text-white shadow-lg scale-105" 
                   : "bg-white text-cocoa-900/40 border border-sand-100"
               }`}
             >
               {f.label}
             </button>
           ))}
        </div>
      </div>
      <main className="mx-auto w-full max-w-xl px-4 mt-6">
        <div className="space-y-3">
          {filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-20">
               <PackageCheck size={48} strokeWidth={1} />
               <p className="text-[10px] font-black uppercase tracking-widest">Trash is empty</p>
            </div>
          ) : (
            filteredHistory.map((order) => (
              <motion.article 
                layout
                key={order._id}
                className="group relative overflow-hidden rounded-[1.5rem] bg-white p-4 shadow-sm border border-sand-100 transition-none"
              >
                <div className="flex items-center justify-between mb-3">
                   <div>
                      <div className="flex items-center gap-1.5">
                         <span className="text-[10px] font-black uppercase text-cocoa-900">#{order._id.slice(-6).toUpperCase()}</span>
                         <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${
                           order.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
                         }`}>
                           {order.status === 'completed' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                           {order.status}
                         </div>
                      </div>
                      <p className="mt-1 text-[11px] font-black text-cocoa-900/40 uppercase tracking-widest">{order.user?.name || "Guest"}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-base font-display font-black text-cocoa-900">{formatINR(order.totalAmount)}</p>
                      <p className="text-[8px] font-bold text-cocoa-900/20 uppercase tracking-widest leading-none mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </p>
                   </div>
                </div>
                
                <div className="py-2 border-t border-sand-50">
                   {order.items.map((item, idx) => (
                     <p key={idx} className="text-[10px] font-semibold text-cocoa-900/60">
                        <span className="font-black text-cocoa-900">{item.quantity}x</span> {item.name}
                     </p>
                   ))}
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
