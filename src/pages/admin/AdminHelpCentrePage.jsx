import { useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Search,
  Package,
  ShoppingBag,
  Users,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
const FAQS = [
  {
    category: "Order Management",
    icon: ShoppingBag,
    color: "bg-blue-50 text-blue-500",
    items: [
      {
        q: "How do I accept a new order?",
        a: "When a new order arrives, it appears in your 'Live Queue' card on the dashboard. Tap the 'Accept' button to move it to 'Preparing' status.",
      },
      {
        q: "What is OTP Verification?",
        a: "When an order is ready, the student provides a 6-digit OTP. You must enter this code in the order details (or verify it via the Orders Tab) to mark the order as 'Completed'.",
      },
      {
        q: "Can I cancel an order as an admin?",
        a: "Yes, you can change an order's status to 'Cancelled' from the Orders History page if there's an issue with the dish or payment.",
      },
    ],
  },
  {
    category: "Menu & Inventory",
    icon: Package,
    color: "bg-orange-50 text-orange-500",
    items: [
      {
        q: "How do I add a new dish to the menu?",
        a: "Go to the Menu tab and tap the '+ Add' button. Fill in the dish name, price, category, and a short description, then tap 'Publish'.",
      },
      {
        q: "How can I mark an item as out-of-stock?",
        a: "In the Menu Catalogue, find the item and tap the 'Available' button. It will turn into 'Out of Stock' and won't be visible to students.",
      },
      {
        q: "How do I delete a menu item permanently?",
        a: "Tap the red Trash icon on any menu card to remove it from your catalogue permanently.",
      },
    ],
  },
  {
    category: "Staff & Users",
    icon: Users,
    color: "bg-purple-50 text-purple-500",
    items: [
      {
        q: "How do I create a Kitchen Terminal account?",
        a: "Go to the 'Users' tab, tap '+ Staff', and enter the name, email, and a secure password for your kitchen staff member.",
      },
      {
        q: "Can I manage student accounts?",
        a: "You can view all registered students and their details in the 'Users' tab for oversight purposes.",
      },
    ],
  },
  {
    category: "Canteen Settings",
    icon: Settings,
    color: "bg-gray-50 text-gray-500",
    items: [
      {
        q: "How do I change my canteen's name?",
        a: "Go to Profile → Edit. You can update your Canteen's display name there. College name is fixed to MEDICAPS UNIVERSITY.",
      },
      {
        q: "How do I upload a canteen logo or cover?",
        a: "In the Profile section, tap the Camera icon on the profile card to upload a new base64 image as your Canteen identity.",
      },
    ],
  },
];
export default function AdminHelpCentrePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [openItem, setOpenItem] = useState(null);
  const toggle = (key) => setOpenItem((prev) => (prev === key ? null : key));
  const filteredFaqs = FAQS.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase()),
    ),
  })).filter((cat) => cat.items.length > 0);
  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24 font-sans text-cocoa-900">
      <div className="px-4 pt-6 pb-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="transition active:scale-90 bg-white p-2 rounded-full shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-display font-black tracking-tight leading-tight">
            Admin Support
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-cocoa-900/40">
            Canteen Help Centre
          </p>
        </div>
      </div>

      <div className="mx-4 mt-4">
        <div className="relative flex items-center">
          <Search
            size={15}
            className="absolute left-4 text-cocoa-900/30 z-10"
          />
          <input
            type="text"
            placeholder="Search help topics..."
            className="w-full rounded-[1.25rem] border-none bg-white py-4 pl-11 pr-4 text-xs font-semibold shadow-sm outline-none placeholder:text-cocoa-900/30 focus:ring-2 focus:ring-cocoa-900/5 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="mx-4 mt-6 space-y-5">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((cat, ci) => {
            const Icon = cat.icon;
            return (
              <div key={ci}>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-lg ${cat.color}`}
                  >
                    <Icon size={13} strokeWidth={2.5} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-cocoa-900/40">
                    {cat.category}
                  </p>
                </div>
                <div className="rounded-[1.5rem] bg-white overflow-hidden divide-y divide-[#F5F5F5] shadow-sm ring-1 ring-black/5">
                  {cat.items.map((item, ii) => {
                    const key = `${ci}-${ii}`;
                    const isOpen = openItem === key;
                    return (
                      <div key={ii}>
                        <button
                          onClick={() => toggle(key)}
                          className="flex w-full items-center justify-between px-4 py-4 text-left transition active:bg-[#F5F5F5]"
                        >
                          <span className="text-xs font-black text-cocoa-900 pr-4 leading-snug">
                            {item.q}
                          </span>
                          {isOpen ? (
                            <ChevronUp
                              size={15}
                              className="text-cocoa-900/30"
                            />
                          ) : (
                            <ChevronDown
                              size={15}
                              className="text-cocoa-900/30"
                            />
                          )}
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <p className="px-4 pb-4 text-xs font-medium text-cocoa-900/50 leading-relaxed italic border-l-2 border-[#1A1A1A] ml-4">
                                {item.a}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center text-xs font-bold text-cocoa-900/20">
            No matching help topics.
          </div>
        )}
      </div>
    </div>
  );
}
