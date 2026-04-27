import { useState } from "react";
import { ArrowLeft, ChevronDown, ChevronUp, Search, BookOpen, ShoppingBag, Wallet, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
const FAQS = [
  {
    category: "Orders",
    icon: ShoppingBag,
    color: "bg-blue-50 text-blue-500",
    items: [
      {
        q: "How do I place an order?",
        a: "Go to the Menu page, add items to your cart, then tap 'Place Order' on the Cart page. You'll get a pickup code once your order is ready.",
      },
      {
        q: "Can I cancel my order after placing it?",
        a: "Orders can only be cancelled before the kitchen starts preparing them. Once the status moves to 'Preparing', cancellation is not possible. Contact the canteen counter directly.",
      },
      {
        q: "How do I track my order status?",
        a: "Go to the Orders page. Your active order shows a live progress bar — Accepted → Preparing → Ready. You'll also see a toast on the home screen.",
      },
      {
        q: "What does each order status mean?",
        a: "Accepted: Order received. Preparing: Kitchen is cooking. Ready: Your food is at the counter. Completed: Picked up successfully.",
      },
    ],
  },
  {
    category: "Wallet & Payments",
    icon: Wallet,
    color: "bg-green-50 text-green-500",
    items: [
      {
        q: "How do I add money to my wallet?",
        a: "Go to Profile → Payments & Wallet. Tap 'Add Money', choose a preset amount or enter a custom amount, then confirm.",
      },
      {
        q: "Is my wallet balance refundable?",
        a: "Wallet balance is non-refundable once added. It can only be used for canteen orders within the app.",
      },
      {
        q: "Why was my wallet debited but order failed?",
        a: "This is rare. If it happens, the amount is automatically reversed within 24 hours. Contact support if it persists.",
      },
    ],
  },
  {
    category: "Account",
    icon: BookOpen,
    color: "bg-purple-50 text-purple-500",
    items: [
      {
        q: "How do I update my name or email?",
        a: "Go to Profile → Account Settings. You can update your display name there. Email changes require contacting support.",
      },
      {
        q: "I forgot my password. What do I do?",
        a: "On the login screen, tap 'Forgot Password' and enter your registered email. You'll receive a reset link.",
      },
      {
        q: "How do I delete my account?",
        a: "Go to Profile → Account Settings → scroll to the bottom → tap 'Delete Account'. This action is permanent and cannot be undone.",
      },
    ],
  },
  {
    category: "General",
    icon: Clock,
    color: "bg-orange-50 text-orange-500",
    items: [
      {
        q: "What are the canteen timings?",
        a: "The canteen is open Monday–Saturday, 8:00 AM to 8:00 PM. Timings may vary on holidays.",
      },
      {
        q: "The app is not loading. What should I do?",
        a: "Check your internet connection. Try refreshing the page. If the issue persists, clear your browser cache or contact support.",
      },
    ],
  },
];
export default function HelpCentrePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [openItem, setOpenItem] = useState(null);
  const toggle = (key) => setOpenItem((prev) => (prev === key ? null : key));
  const filteredFaqs = FAQS.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0);
  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24 font-sans">
      
      <div className="px-4 pt-6 pb-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="transition active:scale-90">
          <ArrowLeft size={22} className="text-cocoa-900" />
        </button>
        <div>
          <h1 className="text-xl font-display font-black text-cocoa-900 tracking-tight leading-tight">Help Centre</h1>
          <div className="h-[2px] w-full bg-gradient-to-r from-cocoa-900/30 to-transparent mt-0.5" />
        </div>
      </div>
      
      <div className="mx-4 mt-4">
        <div className="relative flex items-center">
          <Search size={15} className="absolute left-4 text-cocoa-900/30 z-10" />
          <input
            type="text"
            placeholder="Search your question..."
            className="w-full rounded-[1rem] border-none bg-white py-3.5 pl-11 pr-4 text-xs font-semibold text-cocoa-900 shadow-sm outline-none placeholder:text-cocoa-900/30 focus:ring-2 focus:ring-cocoa-900/10 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      
      <div className="mx-4 mt-5 space-y-4">
        {filteredFaqs.length > 0 ? filteredFaqs.map((cat, ci) => {
          const Icon = cat.icon;
          return (
            <div key={ci}>
              <div className="flex items-center gap-2 mb-2 px-1">
                <div className={`flex h-6 w-6 items-center justify-center rounded-lg ${cat.color}`}>
                  <Icon size={13} strokeWidth={2.5} />
                </div>
                <p className="text-[10px] font-display font-black uppercase tracking-[0.18em] text-cocoa-900/40">{cat.category}</p>
              </div>
              <div className="rounded-[1.5rem] bg-white overflow-hidden divide-y divide-[#F5F5F5] shadow-sm">
                {cat.items.map((item, ii) => {
                  const key = `${ci}-${ii}`;
                  const isOpen = openItem === key;
                  return (
                    <div key={ii}>
                      <button
                        onClick={() => toggle(key)}
                        className="flex w-full items-center justify-between px-4 py-4 text-left transition active:bg-[#F5F5F5]"
                      >
                        <span className="text-xs font-black text-cocoa-900 pr-4 leading-snug">{item.q}</span>
                        {isOpen
                          ? <ChevronUp size={15} className="text-cocoa-900/30 flex-shrink-0" />
                          : <ChevronDown size={15} className="text-cocoa-900/30 flex-shrink-0" />
                        }
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <p className="px-4 pb-4 text-xs font-medium text-cocoa-900/50 leading-relaxed">{item.a}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }) : (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-cocoa-900/20">
              <Search size={28} />
            </div>
            <p className="text-sm font-black text-cocoa-900/30 uppercase tracking-wide">No Results</p>
            <p className="text-xs text-cocoa-900/20">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );
}
