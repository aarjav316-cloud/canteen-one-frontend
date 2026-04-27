import { useState, useEffect } from "react";
import { ArrowLeft, ShoppingBag, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatINR, titleCase } from "../../lib/format";
import { getCart, updateCartQty, removeFromCart, clearCart, placeLocalOrder, updateOrderStatus } from "../../lib/cart";
import { useAuth } from "../../contexts/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../lib/api";
import MenuCard from "../../components/student/MenuCard";
export default function CartPage() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [cart, setCart] = useState(getCart());
  const [placing, setPlacing] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState("signin");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "" });
  const [registerError, setRegisterError] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const { data } = await api.post("/auth/login", loginForm);
      login(data.token);
      setShowAuthModal(false);
      setLoginForm({ email: "", password: "" });
    } catch (err) {
      setLoginError(err?.response?.data?.message || "Login failed.");
    } finally {
      setLoginLoading(false);
    }
  };
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError("");
    setRegisterLoading(true);
    try {
      await api.post("/auth/register", registerForm);
      const registeredEmail = registerForm.email;
      setRegisterSuccess(true);
      setTimeout(() => {
        setRegisterSuccess(false);
        setAuthTab("signin");
        setLoginForm({ email: registeredEmail, password: "" });
        setRegisterForm({ name: "", email: "", password: "" });
      }, 1500);
    } catch (err) {
      setRegisterError(err?.response?.data?.message || "Registration failed.");
    } finally {
      setRegisterLoading(false);
    }
  };
  const handleGoogleAuth = () => {
    const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    window.location.href = `${BASE_URL}/api/auth/google`;
  };
  const handleUpdateQty = (id, qty) => {
    const updated = updateCartQty(id, qty);
    setCart([...updated]);
  };
  const handleRemove = (id) => {
    const updated = removeFromCart(id);
    setCart([...updated]);
  };
  const [showPayModal, setShowPayModal] = useState(false);
  const [walletBalance, setWalletBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [payError, setPayError] = useState("");
  useEffect(() => {
    const isOpen = showPayModal || showAuthModal;
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showPayModal, showAuthModal]);
  const openPaymentModal = async () => {
    if (!user) { setShowAuthModal(true); return; }
    setPayError("");
    setShowPayModal(true);
    setLoadingBalance(true);
    try {
      const { data } = await api.get("/wallet");
      if (data.success) setWalletBalance(data.walletBalance);
    } catch { setWalletBalance(0); }
    finally { setLoadingBalance(false); }
  };
  const payWithWallet = async () => {
    setPlacing(true);
    setPayError("");
    try {
      const payload = {
        items: cart.map(item => ({ _id: item._id, quantity: item.quantity })),
        paymentMethod: "wallet"
      };
      const { data } = await api.post("/orders", payload);
      if (data.success) {
        clearCart();
        setCart([]);
        setShowPayModal(false);
        setFeedback("success");
        setTimeout(() => navigate("/student/orders"), 1200);
      }
    } catch (error) {
      setPayError(error?.response?.data?.message || "Failed to place order.");
    } finally {
      setPlacing(false);
    }
  };
  const payWithRazorpay = async () => {
    setPlacing(true);
    setPayError("");
    try {
      const payload = {
        items: cart.map(item => ({ _id: item._id, quantity: item.quantity })),
        paymentMethod: "razorpay"
      };
      const { data } = await api.post("/orders", payload);
      if (!data.razorpayOrderId) {
        setPayError("Payment gateway error. Try wallet.");
        setPlacing(false);
        return;
      }
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://checkout.razorpay.com/v1/checkout.js";
          s.onload = resolve;
          s.onerror = reject;
          document.head.appendChild(s);
        });
      }
      const options = {
        key: data.razorpayKeyId,
        amount: data.amount,
        currency: "INR",
        name: "Campus Canteen",
        description: `Order #${data.orderId.toString().slice(-4).toUpperCase()}`,
        order_id: data.razorpayOrderId,
        handler: async (response) => {
          try {
            await api.post("/orders/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            clearCart();
            setCart([]);
            setShowPayModal(false);
            setFeedback("success");
            setTimeout(() => navigate("/student/orders"), 1200);
          } catch {
            setPayError("Payment verification failed. Contact support.");
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: { color: "#1A1A1A" },
        modal: { ondismiss: () => setPlacing(false) },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      setPayError(error?.response?.data?.message || "Failed to initiate payment.");
      setPlacing(false);
    }
  };
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-36 font-sans">
      
      <div className="sticky top-0 z-30 bg-[#F5F5F5] relative">
        <div className="px-4 pt-6 pb-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="transition active:scale-90">
            <ArrowLeft size={22} className="text-cocoa-900" />
          </button>
          <div>
            <h1 className="text-xl font-display font-black text-cocoa-900 tracking-tight leading-tight">Your Cart</h1>
            <div className="h-[2px] w-full bg-gradient-to-r from-cocoa-900/30 to-transparent mt-0.5" />
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none translate-y-full"
          style={{background:"linear-gradient(to bottom, #F5F5F5, transparent)"}}
        />
      </div>
      {cart.length > 0 ? (
        <>
          
          <div className="px-4 mt-6 grid gap-3">
            {cart.map((item) => (
              <MenuCard 
                 key={item._id} 
                 item={item} 
                 qty={item.quantity} 
                 isCartView={true}
                 onIncrease={handleUpdateQty ? () => handleUpdateQty(item._id, item.quantity + 1) : null} 
                 onDecrease={handleUpdateQty ? () => handleUpdateQty(item._id, item.quantity - 1) : null}
              />
            ))}
          </div>
          
          <div className="mx-4 mt-4 rounded-[1.5rem] bg-white p-4 shadow-sm">
            <p className="text-[9px] font-display font-black uppercase tracking-[0.2em] text-cocoa-900/40">Order Summary</p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cocoa-900/50">Items ({totalItems})</span>
                <span className="text-xs font-black text-cocoa-900">{formatINR(total)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cocoa-900/50">Platform Fee</span>
                <span className="text-xs font-black text-green-600">FREE</span>
              </div>
            </div>
            <div className="mt-3 h-[1px] bg-[#F5F5F5]" />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm font-black text-cocoa-900">Total</span>
              <span className="text-sm font-black text-cocoa-900">{formatINR(total)}</span>
            </div>
          </div>
          {feedback === "success" && (
            <div className="mx-4 mt-3 rounded-[0.75rem] bg-green-50 px-4 py-3 text-xs font-bold text-green-600">
              ✓ Order placed! Redirecting...
            </div>
          )}
          
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#F5F5F5] px-4 pb-6 pt-3">
            {!user ? (
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-full flex items-center justify-between rounded-[1.5rem] bg-[#1A1A1A] px-6 py-4 text-sm font-black text-white transition active:scale-[0.98] shadow-[0_0_0_3px_rgba(59,130,246,0.4),0_8px_32px_rgba(59,130,246,0.25)] ring-2 ring-blue-400/60"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </span>
                  <span>Login to Place Order</span>
                </div>
                <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Sign In</span>
              </button>
            ) : (
              <button
                onClick={openPaymentModal}
                disabled={placing}
                className="w-full flex items-center justify-between rounded-[1.5rem] bg-[#1A1A1A] px-6 py-4 text-sm font-black text-white transition active:scale-[0.98] disabled:opacity-50"
              >
                <span>{placing ? "Placing Order..." : "Place Order"}</span>
                <div className="flex items-center gap-2">
                  <span className="text-white/60 text-xs">{formatINR(total)}</span>
                  <ArrowRight size={16} strokeWidth={3} />
                </div>
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-cocoa-900/20">
            <ShoppingBag size={32} />
          </div>
          <p className="text-sm font-black text-cocoa-900/30 uppercase tracking-wide">Cart is Empty</p>
          <p className="text-xs text-cocoa-900/20">Add items from the menu to get started</p>
          <button
            onClick={() => navigate("/student/menu")}
            className="mt-3 flex items-center gap-2 rounded-[1rem] bg-[#1A1A1A] px-6 py-2.5 text-xs font-bold text-white transition active:scale-[0.97]"
          >
            Browse Menu <ArrowRight size={14} strokeWidth={3} />
          </button>
        </div>
      )}
      
      <AnimatePresence>
        {showAuthModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="fixed inset-0 z-[110] bg-cocoa-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-[120] rounded-t-[2rem] bg-white p-5 pb-10 shadow-2xl md:mx-auto md:max-w-md md:rounded-[2rem] md:mb-12"
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#F5F5F5]" />
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-2xl font-black text-cocoa-900 tracking-tight">
                  {authTab === "signin" ? "Sign In" : "Create Account"}
                </h2>
                <button onClick={() => setShowAuthModal(false)} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F5F5] text-cocoa-900 transition active:scale-90">
                  <ArrowLeft size={18} />
                </button>
              </div>
              
              <div className="flex gap-2 mb-5 bg-[#F5F5F5] rounded-[1rem] p-1">
                <button onClick={() => { setAuthTab("signin"); setLoginError(""); }}
                  className={`flex-1 rounded-[0.75rem] py-2.5 text-xs font-black transition-all ${authTab === "signin" ? "bg-white text-cocoa-900 shadow-sm" : "text-cocoa-900/40"}`}>
                  Sign In</button>
                <button onClick={() => { setAuthTab("signup"); setRegisterError(""); }}
                  className={`flex-1 rounded-[0.75rem] py-2.5 text-xs font-black transition-all ${authTab === "signup" ? "bg-white text-cocoa-900 shadow-sm" : "text-cocoa-900/40"}`}>
                  Create Account</button>
              </div>
              
              <button type="button" onClick={handleGoogleAuth}
                className="flex w-full items-center justify-center gap-2 rounded-[1rem] border border-[#E5E5E5] bg-white py-3 text-xs font-bold text-cocoa-900 transition active:scale-[0.98] mb-4">
                <svg width="14" height="14" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                </svg>
                Continue with Google
              </button>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-[#F5F5F5]" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-cocoa-900/30">or</span>
                <div className="h-px flex-1 bg-[#F5F5F5]" />
              </div>
              <AnimatePresence mode="wait">
                {authTab === "signin" ? (
                  <motion.form key="signin" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
                    onSubmit={handleLoginSubmit} className="space-y-3">
                    <input type="email" placeholder="Email address" required value={loginForm.email}
                      onChange={(e) => setLoginForm(p => ({ ...p, email: e.target.value }))}
                      className="w-full rounded-[1rem] bg-[#F5F5F5] px-4 py-3.5 text-sm font-semibold text-cocoa-900 outline-none focus:ring-2 focus:ring-cocoa-900/10 transition-all placeholder:text-cocoa-900/30" />
                    <input type="password" placeholder="Password" required value={loginForm.password}
                      onChange={(e) => setLoginForm(p => ({ ...p, password: e.target.value }))}
                      className="w-full rounded-[1rem] bg-[#F5F5F5] px-4 py-3.5 text-sm font-semibold text-cocoa-900 outline-none focus:ring-2 focus:ring-cocoa-900/10 transition-all placeholder:text-cocoa-900/30" />
                    {loginError && <p className="text-[11px] font-bold text-rose-500 text-center">{loginError}</p>}
                    <button type="submit" disabled={loginLoading}
                      className="w-full rounded-[1rem] bg-[#1A1A1A] py-3.5 text-sm font-black text-white transition active:scale-[0.98] disabled:opacity-50">
                      {loginLoading ? "Signing in..." : "Sign In"}
                    </button>
                  </motion.form>
                ) : (
                  <motion.form key="signup" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
                    onSubmit={handleRegisterSubmit} className="space-y-3">
                    <input type="text" placeholder="Your Name" required value={registerForm.name}
                      onChange={(e) => setRegisterForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full rounded-[1rem] bg-[#F5F5F5] px-4 py-3.5 text-sm font-semibold text-cocoa-900 outline-none focus:ring-2 focus:ring-cocoa-900/10 transition-all placeholder:text-cocoa-900/30" />
                    <input type="email" placeholder="Email address" required value={registerForm.email}
                      onChange={(e) => setRegisterForm(p => ({ ...p, email: e.target.value }))}
                      className="w-full rounded-[1rem] bg-[#F5F5F5] px-4 py-3.5 text-sm font-semibold text-cocoa-900 outline-none focus:ring-2 focus:ring-cocoa-900/10 transition-all placeholder:text-cocoa-900/30" />
                    <input type="password" placeholder="Create Password (min. 6 chars)" required minLength={6} value={registerForm.password}
                      onChange={(e) => setRegisterForm(p => ({ ...p, password: e.target.value }))}
                      className="w-full rounded-[1rem] bg-[#F5F5F5] px-4 py-3.5 text-sm font-semibold text-cocoa-900 outline-none focus:ring-2 focus:ring-cocoa-900/10 transition-all placeholder:text-cocoa-900/30" />
                    {registerError && <p className="text-[11px] font-bold text-rose-500 text-center">{registerError}</p>}
                    {registerSuccess && <p className="text-[11px] font-bold text-green-500 text-center">✓ Account created! Switching to sign in...</p>}
                    <button type="submit" disabled={registerLoading || registerSuccess}
                      className="w-full rounded-[1rem] bg-[#1A1A1A] py-3.5 text-sm font-black text-white transition active:scale-[0.98] disabled:opacity-50">
                      {registerLoading ? "Creating..." : "Create Account"}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showPayModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !placing && setShowPayModal(false)}
              className="fixed inset-0 z-[130] bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 320 }}
              className="fixed inset-x-0 bottom-0 z-[140] rounded-t-[1.5rem] bg-white px-4 pt-4 pb-8 shadow-2xl md:mx-auto md:max-w-sm md:rounded-[1.5rem] md:mb-10"
            >
              
              <div className="mx-auto mb-4 h-1 w-8 rounded-full bg-gray-200" />
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-black text-black tracking-tight">Payment</h2>
                  <p className="text-[10px] text-gray-400 mt-0.5">Total: <span className="font-bold text-black">{formatINR(total)}</span></p>
                </div>
                <button
                  onClick={() => !placing && setShowPayModal(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition active:scale-90"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              {payError && (
                <div className="mb-3 rounded-xl bg-rose-50 px-3 py-2.5 text-[11px] font-semibold text-rose-500 border border-rose-100 flex items-center gap-2">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-white text-[9px] flex-shrink-0 font-black">!</span>
                  {payError}
                </div>
              )}
              <div className="space-y-2.5">
                
                <button
                  onClick={payWithWallet}
                  disabled={placing || loadingBalance || (walletBalance !== null && walletBalance < total)}
                  className="w-full rounded-[1.25rem] bg-[#1A1A1A] px-4 py-3.5 transition-all active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-white">Campus Wallet</p>
                        {loadingBalance ? (
                          <div className="mt-0.5 h-3 w-16 bg-white/10 animate-pulse rounded" />
                        ) : (
                          <p className={`text-[10px] font-semibold mt-0.5 ${walletBalance !== null && walletBalance < total ? "text-rose-400" : "text-white/50"}`}>
                            Balance: {formatINR(walletBalance || 0)}
                          </p>
                        )}
                      </div>
                    </div>
                    {walletBalance !== null && walletBalance < total ? (
                      <span className="text-[10px] font-bold text-rose-400">Insufficient</span>
                    ) : (
                      <ArrowRight size={14} className="text-white/60" strokeWidth={2.5} />
                    )}
                  </div>
                </button>
                
                <div className="flex items-center gap-3 px-1">
                  <div className="h-px flex-1 bg-gray-100" />
                  <span className="text-[10px] font-semibold text-gray-300">or pay online</span>
                  <div className="h-px flex-1 bg-gray-100" />
                </div>
                
                <button
                  onClick={payWithRazorpay}
                  disabled={placing}
                  className="w-full rounded-[1.25rem] border border-gray-100 bg-white px-4 py-3.5 transition-all active:scale-[0.98] disabled:opacity-50 hover:border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#072654] flex-shrink-0">
                        
                        <svg role="img" viewBox="0 0 24 24" className="h-5 w-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22.436 0l-11.91 7.773-1.174 4.276 6.625-4.297L11.65 24h4.391l6.395-24zM14.26 10.098L3.389 17.166 1.564 24h9.12l3.576-13.902z"/>
                        </svg>
                      </div>
                      
                      <div className="text-left">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[15px] font-black tracking-tight" style={{color:"#072654", letterSpacing:"-0.02em"}}>razorpay</span>
                          <span className="flex h-1.5 w-1.5 rounded-full bg-green-500" />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">UPI · Cards · Net Banking · Wallets</p>
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-[#3395FF]" strokeWidth={2.5} />
                  </div>
                </button>
              </div>
              
              <p className="mt-4 text-center text-[9px] text-gray-300 font-medium">
                🔒 Payments are 100% secure & encrypted
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
