import { useState, useMemo, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatINR } from "../../lib/format";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../lib/api";
const ADD_AMOUNTS = [50, 100, 200, 500];
const FILTERS = ["All", "Today", "This Week", "Credits", "Debits"];
const isToday = (dateStr) => {
  const d = new Date(dateStr);
  const t = new Date();
  return (
    d.getDate() === t.getDate() &&
    d.getMonth() === t.getMonth() &&
    d.getFullYear() === t.getFullYear()
  );
};
const isThisWeek = (dateStr) => {
  const d = new Date(dateStr);
  const now = new Date();
  const weekAgo = new Date(now - 7 * 86400000);
  return d >= weekAgo && d <= now;
};
const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (isToday(dateStr))
    return `Today, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  const yesterday = new Date(now - 86400000);
  if (
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth()
  )
    return `Yesterday, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  return (
    d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) +
    `, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
  );
};
export default function WalletPage() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("All");
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [adding, setAdding] = useState(false);
  const [successAnim, setSuccessAnim] = useState(false);
  const [loading, setLoading] = useState(true);
  const fetchWallet = async () => {
    try {
      const { data } = await api.get("/wallet");
      if (data.success) {
        setBalance(data.walletBalance);
        const formattedTxs = data.transactions.map((t) => ({
          id: t._id,
          type: t.type,
          label: t.description,
          amount: t.amount,
          date: t.createdAt,
          note: t.status === "success" ? "Completed" : t.status,
        }));
        setTransactions(formattedTxs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchWallet();

    // Listen for wallet refund events to refresh balance
    const handleWalletRefund = (event) => {
      console.log("💰 Wallet refund received on WalletPage, refreshing...");
      // Refresh wallet data when refund is received
      fetchWallet();
    };

    window.addEventListener("wallet_refund", handleWalletRefund);

    return () => {
      window.removeEventListener("wallet_refund", handleWalletRefund);
    };
  }, []);
  const filteredTx = useMemo(() => {
    return transactions.filter((tx) => {
      if (filter === "Today") return isToday(tx.date);
      if (filter === "This Week") return isThisWeek(tx.date);
      if (filter === "Credits") return tx.type === "credit";
      if (filter === "Debits") return tx.type === "debit";
      return true;
    });
  }, [transactions, filter]);
  const totalSpent = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "debit")
        .reduce((s, t) => s + t.amount, 0),
    [transactions],
  );
  const totalAdded = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "credit")
        .reduce((s, t) => s + t.amount, 0),
    [transactions],
  );
  const handleAddMoney = async () => {
    const amt = selectedAmount || parseFloat(customAmount);
    if (!amt || amt <= 0 || isNaN(amt)) return;

    setAdding(true);
    try {
      // 1. Create Wallet Order in Backend
      const { data } = await api.post("/wallet/create-order", { amount: amt });

      if (!data.success)
        throw new Error(data.message || "Failed to initiate top-up");

      const options = {
        key: data.razorpayKeyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "Pre-Canteen Wallet",
        description: `Top-up for ${import.meta.env.VITE_APP_NAME || "Pre-Canteen"}`,
        order_id: data.razorpayOrderId,
        handler: async (response) => {
          try {
            setAdding(true);
            const verifyRes = await api.post("/wallet/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: data.amount, // passing paise for calculation
            });

            if (verifyRes.data.success) {
              setBalance(verifyRes.data.walletBalance);
              setTransactions((prev) => [
                {
                  id: verifyRes.data.transaction._id,
                  type: "credit",
                  label: "Wallet recharge via Razorpay",
                  amount: verifyRes.data.transaction.amount,
                  date: verifyRes.data.transaction.createdAt,
                  note: "Completed",
                },
                ...prev,
              ]);

              setSuccessAnim(true);
              setShowAddMoney(false);
              setCustomAmount("");
              setSelectedAmount(null);
              setTimeout(() => setSuccessAnim(false), 1800);
            }
          } catch (err) {
            alert(
              "Verification failed. If amount was debited, it will be credited soon.",
            );
          } finally {
            setAdding(false);
          }
        },
        prefill: {
          name: localStorage.getItem("user")
            ? JSON.parse(localStorage.getItem("user")).name
            : "",
          email: localStorage.getItem("user")
            ? JSON.parse(localStorage.getItem("user")).email
            : "",
        },
        theme: { color: "#1A1A1A" },
        modal: {
          ondismiss: () => setAdding(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to add money");
      setAdding(false);
    }
  };
  const amountToAdd = selectedAmount || parseFloat(customAmount) || 0;
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] pb-24 font-sans flex items-center justify-center font-bold text-cocoa-900/40">
        Loading Database...
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24 font-sans">
      <div className="px-4 pt-6 pb-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="transition active:scale-90"
        >
          <ArrowLeft size={22} className="text-cocoa-900" />
        </button>
        <div>
          <h1 className="text-xl font-display font-black text-cocoa-900 tracking-tight leading-tight">
            Payments & Wallet
          </h1>
          <div className="h-[2px] w-full bg-gradient-to-r from-cocoa-900/30 to-transparent mt-0.5" />
        </div>
      </div>

      <div className="mx-4 mt-2">
        <motion.div
          animate={successAnim ? { scale: [1, 1.03, 1] } : {}}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-[2rem] bg-[#1A1A1A] p-6 shadow-2xl shadow-black/20"
        >
          <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/5" />
          <div className="absolute -bottom-10 -left-6 h-32 w-32 rounded-full bg-white/5" />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">
                  <Wallet size={16} className="text-white" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                  Canteen Wallet
                </span>
              </div>
              <AnimatePresence>
                {successAnim && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="rounded-full bg-green-500/20 px-3 py-1 text-[10px] font-black text-green-400"
                  >
                    ✓ Money Added!
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="mt-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                Available Balance
              </p>
              <motion.p
                key={balance}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 text-4xl font-display font-black text-white tracking-tight"
              >
                {formatINR(balance)}
              </motion.p>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <div className="flex gap-4">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/30">
                    Total Added
                  </p>
                  <p className="mt-0.5 text-sm font-black text-green-400">
                    {formatINR(totalAdded)}
                  </p>
                </div>
                <div className="w-[1px] bg-white/10" />
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/30">
                    Total Spent
                  </p>
                  <p className="mt-0.5 text-sm font-black text-rose-400">
                    {formatINR(totalSpent)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddMoney(true)}
                className="flex items-center gap-1.5 rounded-[1rem] bg-white px-4 py-2.5 text-[11px] font-black text-cocoa-900 shadow-lg transition active:scale-95"
              >
                <Plus size={13} strokeWidth={3} />
                Add Money
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mx-4 mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-[1.5rem] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-green-50">
              <ArrowDownLeft
                size={15}
                className="text-green-500"
                strokeWidth={2.5}
              />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-cocoa-900/40">
              Credits
            </span>
          </div>
          <p className="mt-2 text-lg font-display font-black text-cocoa-900">
            {formatINR(totalAdded)}
          </p>
          <p className="text-[9px] font-bold text-cocoa-900/30">
            {transactions.filter((t) => t.type === "credit").length}{" "}
            transactions
          </p>
        </div>
        <div className="rounded-[1.5rem] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50">
              <ArrowUpRight
                size={15}
                className="text-rose-500"
                strokeWidth={2.5}
              />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-cocoa-900/40">
              Debits
            </span>
          </div>
          <p className="mt-2 text-lg font-display font-black text-cocoa-900">
            {formatINR(totalSpent)}
          </p>
          <p className="text-[9px] font-bold text-cocoa-900/30">
            {transactions.filter((t) => t.type === "debit").length} transactions
          </p>
        </div>
      </div>

      <div className="mx-4 mt-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-display font-black uppercase tracking-[0.18em] text-cocoa-900/40">
            Transactions
          </p>
          <span className="text-[9px] font-bold text-cocoa-900/30">
            {filteredTx.length} records
          </span>
        </div>

        <div className="relative mb-4">
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-[#F5F5F5] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-[#F5F5F5] to-transparent z-10 pointer-events-none" />
          <div className="flex gap-2 overflow-x-auto pb-1 px-6 no-scrollbar">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`whitespace-nowrap rounded-[1rem] px-4 py-2 text-xs font-black tracking-wide transition-all ${
                  filter === f
                    ? "bg-[#1A1A1A] text-white scale-105"
                    : "bg-white text-cocoa-900/50 shadow-sm"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-2">
          {filteredTx.length > 0 ? (
            filteredTx.map((tx) => (
              <motion.div
                layout
                key={tx.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 rounded-[1.5rem] bg-white p-3.5 shadow-sm"
              >
                <div
                  className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[1rem] ${
                    tx.type === "credit" ? "bg-green-50" : "bg-rose-50"
                  }`}
                >
                  {tx.type === "credit" ? (
                    <ArrowDownLeft
                      size={18}
                      className="text-green-500"
                      strokeWidth={2.5}
                    />
                  ) : (
                    <ShoppingBag
                      size={18}
                      className="text-rose-500"
                      strokeWidth={2.5}
                    />
                  )}
                </div>
                <div className="flex flex-1 flex-col min-w-0">
                  <p className="text-xs font-black text-cocoa-900 leading-tight truncate">
                    {tx.label}
                  </p>
                  <p className="mt-0.5 text-[10px] font-medium text-cocoa-900/40 truncate">
                    {tx.note}
                  </p>
                  <p className="mt-0.5 text-[9px] font-bold text-cocoa-900/25">
                    {formatDate(tx.date)}
                  </p>
                </div>
                <div className="flex flex-col items-end flex-shrink-0">
                  <span
                    className={`text-sm font-black ${tx.type === "credit" ? "text-green-500" : "text-rose-500"}`}
                  >
                    {tx.type === "credit" ? "+" : "−"}
                    {formatINR(tx.amount)}
                  </span>
                  <span
                    className={`mt-0.5 rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-wide ${
                      tx.type === "credit"
                        ? "bg-green-50 text-green-600"
                        : "bg-rose-50 text-rose-500"
                    }`}
                  >
                    {tx.type === "credit" ? "Credit" : "Debit"}
                  </span>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-cocoa-900/20">
                <TrendingUp size={28} />
              </div>
              <p className="text-sm font-black text-cocoa-900/30 uppercase tracking-wide">
                No Transactions
              </p>
              <p className="text-xs text-cocoa-900/20">
                Nothing here for this filter
              </p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showAddMoney && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddMoney(false)}
              className="fixed inset-0 z-[110] bg-cocoa-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-[120] rounded-t-[2rem] bg-white p-5 pb-10 shadow-2xl"
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#F5F5F5]" />
              <h2 className="font-display text-xl font-black text-cocoa-900 tracking-tight">
                Add Money
              </h2>
              <p className="mt-0.5 text-xs font-medium text-cocoa-900/40">
                Choose an amount or enter custom
              </p>

              <div className="mt-5 grid grid-cols-4 gap-2">
                {ADD_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => {
                      setSelectedAmount(amt);
                      setCustomAmount("");
                    }}
                    className={`rounded-[1rem] py-3 text-sm font-black transition-all active:scale-95 ${
                      selectedAmount === amt
                        ? "bg-[#1A1A1A] text-white scale-105"
                        : "bg-[#F5F5F5] text-cocoa-900"
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              <div className="mt-3 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-cocoa-900/40">
                  ₹
                </span>
                <input
                  type="number"
                  placeholder="Enter custom amount"
                  className="w-full rounded-[1rem] bg-[#F5F5F5] py-3.5 pl-8 pr-4 text-sm font-black text-cocoa-900 outline-none focus:ring-2 focus:ring-cocoa-900/10 transition-all"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedAmount(null);
                  }}
                />
              </div>
              <button
                onClick={handleAddMoney}
                disabled={adding || amountToAdd <= 0}
                className="mt-4 w-full flex items-center justify-between rounded-[1.5rem] bg-[#1A1A1A] px-6 py-4 text-sm font-black text-white transition active:scale-[0.98] disabled:opacity-40"
              >
                <span>
                  {adding
                    ? "Adding..."
                    : `Add ${amountToAdd > 0 ? formatINR(amountToAdd) : "Money"}`}
                </span>
                <Plus size={16} strokeWidth={3} />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  );
}
