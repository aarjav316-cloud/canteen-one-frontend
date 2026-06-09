import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  MapPin,
  ChevronDown,
  X,
  ShoppingCart,
  History,
  ArrowRight,
  LogOut,
  Settings,
  CircleCheck,
  CookingPot,
  ReceiptText,
  Clock,
  LayoutDashboard,
  UtensilsCrossed,
  User,
  Eye,
  EyeOff,
  GraduationCap,
  Phone,
  QrCode,
} from "lucide-react";
import { getCart, addToCart, updateCartQty } from "../../lib/cart";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../lib/api";
import { connectSocket, socket } from "../../lib/socket";
import { useAuth } from "../../contexts/useAuth";
import { formatINR, titleCase } from "../../lib/format";
import MenuCard from "../../components/student/MenuCard";
import {
  showOrderNotification,
  showPaymentNotification,
} from "../../services/notificationService.jsx";
const activeStates = ["pending", "paid", "preparing", "ready"];
const DUMMY_ITEMS = [
  {
    _id: "d1",
    name: "Masala Dosa",
    category: "breakfast",
    description: "Crispy dosa with spicy potato filling",
    price: 60,
  },
  {
    _id: "d2",
    name: "Veg Burger",
    category: "snacks",
    description: "Juicy veggie patty with fresh veggies",
    price: 80,
  },
  {
    _id: "d3",
    name: "Paneer Rice",
    category: "meals",
    description: "Fragrant basmati rice with paneer",
    price: 120,
  },
  {
    _id: "d4",
    name: "Masala Chai",
    category: "beverages",
    description: "Hot spiced Indian tea",
    price: 20,
  },
  {
    _id: "d5",
    name: "Veg Maggi",
    category: "snacks",
    description: "Classic instant noodles with veggies",
    price: 40,
  },
  {
    _id: "d6",
    name: "Samosa (2 pcs)",
    category: "snacks",
    description: "Crispy fried pastry with spiced filling",
    price: 30,
  },
  {
    _id: "d7",
    name: "Idli Sambhar",
    category: "breakfast",
    description: "Soft steamed rice cakes with lentil soup",
    price: 50,
  },
  {
    _id: "d8",
    name: "Cold Coffee",
    category: "beverages",
    description: "Chilled blended coffee with milk",
    price: 60,
  },
  {
    _id: "d9",
    name: "Dal Rice",
    category: "meals",
    description: "Comforting lentil curry with steamed rice",
    price: 90,
  },
  {
    _id: "d10",
    name: "Veg Sandwich",
    category: "snacks",
    description: "Toasted sandwich with fresh vegetables",
    price: 50,
  },
  {
    _id: "d11",
    name: "Aloo Paratha",
    category: "breakfast",
    description: "Stuffed flatbread with spiced potato",
    price: 55,
  },
  {
    _id: "d12",
    name: "Mango Lassi",
    category: "beverages",
    description: "Thick yogurt drink with mango pulp",
    price: 45,
  },
];
export default function StudentHomePage() {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState("signin");

  // Mobile-based authentication
  const [loginForm, setLoginForm] = useState({ mobile: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [registerForm, setRegisterForm] = useState({
    name: "",
    mobile: "",
    password: "",
  });
  const [registerError, setRegisterError] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // OTP Verification state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpForm, setOtpForm] = useState({ mobile: "", otp: "" });
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState("Loading Campus...");
  const [canteenName, setCanteenName] = useState("Your Canteen");
  const [notificationTab, setNotificationTab] = useState("Today");
  const [isCanteenOpen, setIsCanteenOpen] = useState(true);
  const [cart, setCart] = useState(getCart());
  const getQty = (id) => cart.find((i) => i._id === id)?.quantity || 0;
  const handleAdd = (item) => {
    const updated = addToCart(item);
    setCart([...updated]);
  };
  const handleIncrease = (item) => {
    const qty = getQty(item._id);
    const updated = updateCartQty(item._id, qty + 1);
    setCart([...updated]);
  };
  const handleDecrease = (item) => {
    const qty = getQty(item._id);
    const updated = updateCartQty(item._id, qty - 1);
    setCart([...updated]);
  };
  const [toastMessage, setToastMessage] = useState(null);
  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    if (toastMessage) {
      playNotificationSound();
      const timer = setTimeout(() => setToastMessage(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);
  const [demoOrder, setDemoOrder] = useState(() => ({
    _id: "DEMO" + Math.random().toString(36).slice(2, 8).toUpperCase(),
    status: "pending",
    totalAmount: 140,
  }));
  useEffect(() => {
    if (user) return;
    const progression = [
      { status: "pending", delay: 0 },
      { status: "preparing", delay: 5000 },
      { status: "ready", delay: 12000 },
    ];
    const timers = progression.map(({ status, delay }) =>
      setTimeout(() => setDemoOrder((o) => ({ ...o, status })), delay),
    );
    return () => timers.forEach(clearTimeout);
  }, [user]);
  const activeOrder = useMemo(
    () =>
      user
        ? orders.find((order) => activeStates.includes(order.status))
        : demoOrder,
    [orders, user, demoOrder],
  );
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const menuRes = await api.get("/menu");
        const menuData = menuRes.data.data || [];
        setMenuItems(menuData.length > 0 ? menuData : DUMMY_ITEMS);
        try {
          const settingsRes = await api.get("/settings");
          if (settingsRes.data.success) {
            setIsCanteenOpen(settingsRes.data.data.isOpen);
            if (settingsRes.data.data.canteenName) {
              setCanteenName(settingsRes.data.data.canteenName);
            }
            if (settingsRes.data.data.collegeName) {
              setSelectedCollege(settingsRes.data.data.collegeName);
            }
          }
        } catch (e) {
          console.error(e);
        }
        if (user) {
          const [ordersRes, notifRes] = await Promise.all([
            api.get("/orders/my"),
            api.get("/notifications/my"),
          ]);
          setOrders(ordersRes.data.data || []);
          if (notifRes.data.success) {
            const formattedNotifs = notifRes.data.data.map((n) => ({
              id: n._id,
              time: new Date(n.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              message: n.message,
              title: n.title,
              isRead: n.isRead,
              type: n.type,
            }));
            setNotifications(formattedNotifs);
          }
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
        setMenuItems(DUMMY_ITEMS);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id]);
  useEffect(() => {
    connectSocket();
    if (user?.id) socket.emit("join_user_room", user.id);
    const onStatusUpdate = (payload) => {
      setOrders((prev) =>
        prev.map((order) =>
          order._id === payload.orderId
            ? {
                ...order,
                status: payload.status,
                pickupCodePlain:
                  payload.pickupCodePlain || order.pickupCodePlain,
              }
            : order,
        ),
      );
      let msg = `Order #${payload.orderId.slice(-4).toUpperCase()} is now ${payload.status}!`;
      if (payload.status === "ready" && payload.pickupCodePlain) {
        msg = `Order is ready! Pickup Code: ${payload.pickupCodePlain}`;
      }
      setNotifications((prev) => [
        {
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          message: msg,
          title:
            payload.status === "ready" ? "Ready for Pickup" : "Order Update",
          type: "order",
        },
        ...prev,
      ]);

      // Show toast notification
      showOrderNotification({
        orderId: payload.orderId,
        status: payload.status,
        pickupCode: payload.pickupCodePlain,
        cancelledBy: payload.cancelledBy, // Pass who cancelled the order
      });
    };

    const onPaymentSuccess = (payload) => {
      showPaymentNotification({
        orderId: payload.orderId,
        pickupCode: payload.pickupCode,
      });
    };

    const onCanteenStatusUpdate = (payload) => {
      setIsCanteenOpen(payload.isOpen);
    };
    socket.on("order_status_updated", onStatusUpdate);
    socket.on("payment_success", onPaymentSuccess);
    socket.on("canteen_status_update", onCanteenStatusUpdate);
    return () => {
      socket.off("order_status_updated", onStatusUpdate);
      socket.off("payment_success", onPaymentSuccess);
      socket.off("canteen_status_update", onCanteenStatusUpdate);
    };
  }, [user?.id]);
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" ||
        item.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  const availableCategories = useMemo(() => {
    const cats = new Set(menuItems.map((item) => titleCase(item.category)));
    return ["All", ...Array.from(cats)];
  }, [menuItems]);
  useEffect(() => {
    if (isNotificationModalOpen || isProfileModalOpen || isLoginModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isNotificationModalOpen, isProfileModalOpen, isLoginModalOpen]);
  const [barVisible, setBarVisible] = useState(true);
  useEffect(() => {
    let timer;
    const onScroll = () => {
      setBarVisible(false);
      clearTimeout(timer);
      timer = setTimeout(() => setBarVisible(true), 5000);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, []);
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  // Login Handler (Mobile + Password)
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");

    // Validate mobile number
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(loginForm.mobile)) {
      setLoginError(
        "Invalid mobile number. Must be 10 digits starting with 6-9",
      );
      return;
    }

    setLoginLoading(true);
    try {
      const { data } = await api.post("/auth/login", loginForm);
      login(data.token);
      const payload = JSON.parse(
        atob(data.token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
      );
      const byRolePath = {
        student: "/student",
        staff: "/staff",
        admin: "/admin",
      };
      setIsLoginModalOpen(false);
      setLoginForm({ mobile: "", password: "" });
      if (payload.role && payload.role !== "student") {
        navigate(byRolePath[payload.role] || "/student", { replace: true });
      }
    } catch (err) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message;
      if (status === 429) setLoginError("Too many attempts. Please wait.");
      else setLoginError(message || "Login failed.");
    } finally {
      setLoginLoading(false);
    }
  };

  // Register Handler (Send OTP)
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError("");

    // Validate mobile number
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(registerForm.mobile)) {
      setRegisterError(
        "Invalid mobile number. Must be 10 digits starting with 6-9",
      );
      return;
    }

    if (registerForm.password.length < 6) {
      setRegisterError("Password must be at least 6 characters");
      return;
    }

    setRegisterLoading(true);
    try {
      const { data } = await api.post("/auth/register", registerForm);
      setRegisterSuccess(true);

      // Open OTP modal
      setTimeout(() => {
        setRegisterSuccess(false);
        setIsLoginModalOpen(false);
        setShowOtpModal(true);
        setOtpForm({ mobile: registerForm.mobile, otp: "" });
        setRegisterForm({ name: "", mobile: "", password: "" });
        startResendCooldown();
      }, 1000);
    } catch (err) {
      setRegisterError(err?.response?.data?.message || "Registration failed.");
    } finally {
      setRegisterLoading(false);
    }
  };

  // OTP Verification Handler
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setOtpError("");

    if (otpForm.otp.length !== 6) {
      setOtpError("Please enter 6-digit OTP");
      return;
    }

    setOtpLoading(true);
    try {
      const { data } = await api.post("/auth/verify-otp", otpForm);
      login(data.token);
      setShowOtpModal(false);
      setOtpForm({ mobile: "", otp: "" });
      // Success notification handled by toast
    } catch (err) {
      setOtpError(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  // Resend OTP Handler
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    setResendLoading(true);
    setOtpError("");
    try {
      await api.post("/auth/resend-otp", { mobile: otpForm.mobile });
      startResendCooldown();
    } catch (err) {
      setOtpError(err?.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  // Resend Cooldown Timer
  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleGoogleAuth = () => {
    const BASE_URL =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    window.location.href = `${BASE_URL}/api/auth/google`;
  };
  const closeAuthModal = () => {
    setIsLoginModalOpen(false);
    setLoginError("");
    setRegisterError("");
    setRegisterSuccess(false);
  };
  return (
    <div className="relative min-h-screen pb-24 font-sans bg-[#F5F5F5]">
      <AnimatePresence>
        {toastMessage && !(activeOrder && barVisible) && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 400 }}
            style={{
              position: "fixed",
              bottom: 24,
              left: 0,
              right: 0,
              zIndex: 200,
              display: "flex",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <div
              style={{ pointerEvents: "auto" }}
              className="w-auto max-w-[90%] sm:max-w-sm"
            >
              <div className="relative overflow-hidden rounded-full bg-[#1A1A1A]/95 backdrop-blur-xl px-5 py-3 text-white shadow-[0_8px_30px_rgba(0,0,0,0.25)] flex items-center gap-3">
                <span className="h-2 w-2 flex-shrink-0 rounded-full bg-green-400 animate-pulse" />
                <p className="text-[11px] font-semibold leading-tight">
                  {toastMessage}
                </p>
                <button
                  onClick={() => setToastMessage(null)}
                  className="ml-1 flex-shrink-0 text-white/30 hover:text-white/60 transition active:scale-90"
                >
                  <X size={13} />
                </button>

                <motion.div
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: 4.5, ease: "linear" }}
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/15 origin-left rounded-full"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-0 left-0 right-0 h-[500px] w-full">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url(/banner.webp)",
            backgroundPosition: "center top",
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#F5F5F5]" />
      </div>

      <div className="relative px-3 pt-4 z-20">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center bg-transparent text-white">
              <MapPin size={20} fill="currentColor" fillOpacity={0.3} />
            </div>
            <div className="flex flex-col">
              {loading ? (
                <div className="flex flex-col gap-1.5 py-1">
                  <div className="h-4 w-24 rounded bg-white/20 animate-pulse" />
                  <div className="h-2 w-32 rounded bg-white/10 animate-pulse" />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-black text-white tracking-tight drop-shadow-lg whitespace-nowrap">
                      {selectedCollege.split(" ")[0]}
                    </span>
                  </div>
                  <p className="text-[9px] font-bold tracking-wide text-white/80 uppercase drop-shadow-lg whitespace-nowrap">
                    {selectedCollege.length > 20
                      ? selectedCollege.slice(0, 20) + "..."
                      : selectedCollege}
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNotificationModalOpen(true)}
              className="relative flex h-8 w-8 items-center justify-center rounded-[0.5rem] bg-transparent transition active:scale-90"
            >
              <Bell size={16} className="text-white" />
              {notifications.length > 0 && (
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full border border-white bg-rose-500 shadow-sm" />
              )}
            </button>
            <button
              onClick={() => {
                if (user) {
                  setIsProfileModalOpen(true);
                } else {
                  setIsLoginModalOpen(true);
                }
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white shadow-lg transition active:scale-95 overflow-hidden border border-white/20"
            >
              {user ? (
                user.dp ? (
                  <img
                    src={user.dp}
                    className="h-full w-full object-cover"
                    alt="Profile"
                  />
                ) : (
                  <span className="font-black text-xs uppercase">
                    {user?.name?.charAt(0) || "U"}
                  </span>
                )
              ) : (
                <User size={15} />
              )}
            </button>
          </div>
        </header>

        <div className="mt-4">
          <div
            className="relative flex items-center group"
            onClick={() => navigate("/student/menu?focus=1")}
          >
            <Search size={16} className="absolute left-3 z-10 text-white" />
            <div className="w-full rounded-[0.5rem] border-none bg-white/20 backdrop-blur-md py-3 pl-10 pr-4 text-xs font-semibold text-white/70 shadow-xl shadow-black/10 cursor-pointer select-none">
              Search for "Samosa"
            </div>
          </div>
        </div>
      </div>

      <section className="mt-0 px-0 relative z-10">
        <div className="relative overflow-hidden rounded-none bg-transparent p-4 pt-8 pb-6 shadow-none">
          <div className="relative z-10 flex flex-col items-center text-center">
            {isCanteenOpen ? (
              <div className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-[8px] font-black uppercase tracking-[0.15em] text-green-600">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                Kitchen Online
              </div>
            ) : (
              <div className="flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-[8px] font-black uppercase tracking-[0.15em] text-rose-500">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                Kitchen Offline
              </div>
            )}
            <h1 className="mt-3 font-display text-2xl font-black leading-[1.1] tracking-tight text-white drop-shadow-lg">
              {canteenName}
            </h1>
            <p className="mt-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/90 drop-shadow-lg">
              Order Ahead & Skip Queues
            </p>
            <Link
              to="/student/menu"
              className="mt-5 flex items-center gap-2 rounded-[1rem] bg-black/40 backdrop-blur-xl border border-white/20 px-6 py-2.5 text-xs font-bold text-white hover:bg-black/50 transition-all active:scale-[0.97]"
            >
              Order Now <ArrowRight size={14} strokeWidth={3} />
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-5 px-3 space-y-2.5">
        <Link
          to="/student/menu"
          className="relative flex items-center justify-between overflow-hidden rounded-[0.875rem] bg-gradient-to-r from-[#FDF8FF] to-[#F0E6FF] px-5 py-4 shadow-sm transition active:scale-[0.98]"
        >
          <div className="relative z-10 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-[0.625rem] bg-white shadow-sm text-violet-500">
              <CookingPot size={18} strokeWidth={2} />
            </div>
            <div>
              <h3 className="font-display text-sm font-black text-cocoa-900 leading-none">
                Explore Menu
              </h3>
              <p className="mt-0.5 text-[11px] font-semibold text-cocoa-900/40">
                Breakfast to beverages
              </p>
            </div>
          </div>
          <ArrowRight
            size={16}
            strokeWidth={2.5}
            className="text-cocoa-900/20 flex-shrink-0"
          />
        </Link>

        <div className="grid grid-cols-2 gap-2.5">
          <Link
            to="/student/cart"
            className="relative flex flex-col justify-between overflow-hidden rounded-[0.875rem] bg-[#FFF5F4] px-4 py-4 shadow-sm transition active:scale-[0.98] h-[96px]"
          >
            <div>
              <h3 className="font-display text-xs font-black text-cocoa-900 leading-none">
                Open Cart
              </h3>
              <p className="mt-0.5 text-[10px] font-semibold text-cocoa-900/40">
                Checkout items
              </p>
            </div>
            <div className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-[0.625rem] bg-white text-rose-400 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
              <ReceiptText size={17} strokeWidth={1.75} />
            </div>
          </Link>
          <div
            onClick={() =>
              user
                ? navigate("/student/orders")
                : (setIsLoginModalOpen(true), setAuthTab("signin"))
            }
            className="relative flex flex-col justify-between overflow-hidden rounded-[0.875rem] bg-[#F4F9FF] px-4 py-4 shadow-sm transition active:scale-[0.98] cursor-pointer h-[96px]"
          >
            <div>
              <h3 className="font-display text-xs font-black text-cocoa-900 leading-none">
                Order History
              </h3>
              <p className="mt-0.5 text-[10px] font-semibold text-cocoa-900/40">
                Past orders
              </p>
            </div>
            <div className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-[0.625rem] bg-white text-blue-400 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
              <CircleCheck size={17} strokeWidth={1.75} />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 px-3">
        <div className="flex items-center gap-4">
          <div className="h-[2px] flex-1 bg-gradient-to-l from-sand-300 to-transparent" />
          <h2 className="font-display text-base font-black text-cocoa-900 whitespace-nowrap tracking-tight uppercase">
            Fresh from Kitchen
          </h2>
          <div className="h-[2px] flex-1 bg-gradient-to-r from-sand-300 to-transparent" />
        </div>

        <div className="mt-4 relative">
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-[#F5F5F5] to-transparent z-10 pointer-events-none" />

          <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-[#F5F5F5] to-transparent z-10 pointer-events-none" />
          <div className="flex gap-2 overflow-x-auto pb-4 pt-2 px-6 no-scrollbar">
            {availableCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap rounded-[1rem] px-5 py-2 text-xs font-black tracking-wide transition-all ${
                  selectedCategory === cat
                    ? "bg-[#1A1A1A] text-white scale-105"
                    : "bg-white text-cocoa-900/50 hover:bg-white hover:text-cocoa-900 shadow-sm"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-2 grid gap-3">
          {loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex h-[110px] items-center gap-4 rounded-[1.5rem] bg-white p-3 shadow-sm border border-black/5"
                >
                  <div className="h-full w-[90px] flex-shrink-0 animate-pulse rounded-[1rem] bg-cocoa-900/5" />
                  <div className="flex h-full flex-1 flex-col justify-center py-1">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-cocoa-900/10 mb-2" />
                    <div className="h-2 w-1/2 animate-pulse rounded bg-cocoa-900/5 mb-auto" />
                    <div className="flex items-center justify-between mt-2">
                      <div className="h-4 w-12 animate-pulse rounded bg-cocoa-900/10" />
                      <div className="h-8 w-20 animate-pulse rounded-full bg-[#F5F5F5]" />
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const qty = getQty(item._id);
              return (
                <MenuCard
                  key={item._id}
                  item={item}
                  qty={qty}
                  onAdd={handleAdd}
                  onIncrease={handleIncrease}
                  onDecrease={handleDecrease}
                />
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <UtensilsCrossed size={40} className="text-cocoa-900/20" />
              <p className="text-sm font-black text-cocoa-900/30 uppercase tracking-wide">
                No Items Found
              </p>
              <p className="text-xs text-cocoa-900/20">
                No{" "}
                {selectedCategory !== "All"
                  ? selectedCategory.toLowerCase()
                  : ""}{" "}
                items available right now.
              </p>
            </div>
          )}
        </div>
      </section>

      {activeOrder && (
        <motion.div
          animate={{ y: barVisible ? 0 : "calc(100% + 2rem)" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 z-[100] rounded-2xl bg-white border border-black/5 px-4 py-3 flex items-center justify-between gap-3"
          style={{
            boxShadow:
              "0 8px 40px rgba(0,0,0,0.18), 0 2px 12px rgba(0,0,0,0.10)",
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F5F5F5] text-base flex-shrink-0">
              {activeOrder.status === "ready" ? "📦" : "🍳"}
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-[11px] font-black uppercase tracking-widest text-[#1A1A1A] leading-none mb-0.5">
                {activeOrder.status === "ready"
                  ? "Ready for Pickup"
                  : "Now Preparing"}
              </p>
              <p className="text-[9px] font-semibold text-cocoa-900/30 truncate">
                Order #{activeOrder._id.slice(-4).toUpperCase()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {activeOrder.status === "ready" ? (
              <>
                <div className="bg-green-50 px-3 py-1.5 rounded-xl border border-green-100">
                  <span className="text-[13px] font-display font-black text-green-600 tracking-[0.2em]">
                    {activeOrder.pickupCodePlain || "----"}
                  </span>
                </div>
                <Link
                  to="/student/orders"
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F5F5F5] text-[#1A1A1A]"
                >
                  <ArrowRight size={14} strokeWidth={3} />
                </Link>
              </>
            ) : (
              <Link
                to="/student/orders"
                className="flex items-center gap-1.5 rounded-xl bg-[#1A1A1A] px-3 py-1.5 text-white"
              >
                <span className="text-[10px] font-black uppercase tracking-wider">
                  Track
                </span>
                <ArrowRight size={12} strokeWidth={3} />
              </Link>
            )}
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {isNotificationModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNotificationModalOpen(false)}
              className="fixed inset-0 z-[110] bg-cocoa-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-[120] max-h-[90vh] overflow-hidden rounded-t-[2rem] bg-white p-5 pb-8 shadow-2xl md:mx-auto md:max-w-xl md:rounded-[2rem] md:mb-12"
            >
              <div className="flex items-center justify-between px-2">
                <h2 className="font-display text-2xl font-black text-cocoa-900 tracking-tight">
                  Notifications
                </h2>
                <button
                  onClick={() => setIsNotificationModalOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F9FAFB] text-cocoa-900 transition active:scale-90"
                >
                  <X size={18} />
                </button>
              </div>
              {!user ? (
                /* Guest state */
                <div className="mt-6 flex flex-col items-center text-center gap-4 py-8 px-2">
                  <div className="flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-[#F5F5F5] text-3xl">
                    🔔
                  </div>
                  <div>
                    <h3 className="font-display text-base font-black text-cocoa-900 leading-tight">
                      Sign in to get notified
                    </h3>
                    <p className="mt-1.5 text-xs font-medium text-cocoa-900/50 leading-relaxed max-w-[240px] mx-auto">
                      Order from {canteenName}, skip the queue and get real-time
                      pickup alerts.
                    </p>
                  </div>
                  <div className="w-full space-y-2 mt-1">
                    <div className="flex items-center gap-3 rounded-[1.25rem] bg-[#F5F5F5] px-4 py-3">
                      <span className="text-lg">🍱</span>
                      <p className="text-xs font-semibold text-cocoa-900/60 text-left">
                        Order ahead &amp; skip the canteen queue
                      </p>
                    </div>
                    <div className="flex items-center gap-3 rounded-[1.25rem] bg-[#F5F5F5] px-4 py-3">
                      <span className="text-lg">📍</span>
                      <p className="text-xs font-semibold text-cocoa-900/60 text-left">
                        Pick up from {canteenName}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 rounded-[1.25rem] bg-[#F5F5F5] px-4 py-3">
                      <span className="text-lg">⚡</span>
                      <p className="text-xs font-semibold text-cocoa-900/60 text-left">
                        Live status — Accepted → Preparing → Ready
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsNotificationModalOpen(false);
                      setIsLoginModalOpen(true);
                      setAuthTab("signin");
                    }}
                    className="w-full rounded-[1rem] bg-[#1A1A1A] py-3.5 text-sm font-black text-white transition active:scale-[0.98]"
                  >
                    Sign In to Continue
                  </button>
                  <button
                    onClick={() => {
                      setIsNotificationModalOpen(false);
                      setIsLoginModalOpen(true);
                      setAuthTab("signup");
                    }}
                    className="text-xs font-black text-cocoa-900/50 underline underline-offset-2"
                  >
                    New here? Create account
                  </button>
                </div>
              ) : (
                /* Logged in — show real notifications */
                <>
                  <div className="mt-4 flex gap-2">
                    {["Today", "This Week", "Older"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setNotificationTab(tab)}
                        className={`rounded-[1rem] px-5 py-2 text-xs font-black tracking-wide transition-all ${
                          notificationTab === tab
                            ? "bg-[#1A1A1A] text-white scale-105"
                            : "bg-[#F9FAFB] text-cocoa-900/50 hover:text-cocoa-900"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                  <div className="mt-5 relative">
                    <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
                    <div className="flex flex-col gap-3 h-[50vh] overflow-y-auto no-scrollbar pb-4 px-1 pt-2">
                      {notifications.length > 0 ? (
                        notifications.map((notification, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 rounded-[1.5rem] border-2 border-[#F9FAFB] bg-[#F9FAFB] p-4 transition-all hover:border-sand-100"
                          >
                            <div
                              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white ${notification.type === "wallet" ? "text-green-600" : "text-cocoa-900/40"}`}
                            >
                              {notification.type === "wallet" ? (
                                <CircleCheck size={20} />
                              ) : (
                                <Clock size={20} />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <h3
                                  className={`text-xs font-black ${notification.type === "wallet" ? "text-green-700" : "text-cocoa-900"}`}
                                >
                                  {notification.title}
                                </h3>
                                <span className="text-[10px] font-bold text-cocoa-900/40">
                                  {notification.time}
                                </span>
                              </div>
                              <p className="mt-1 text-[11px] font-medium text-cocoa-900/60">
                                {notification.message}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full gap-3">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F9FAFB] text-cocoa-900/20">
                            <Bell size={32} />
                          </div>
                          <p className="text-sm font-bold text-cocoa-900/30 uppercase tracking-wide">
                            No notifications found
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isProfileModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileModalOpen(false)}
              className="fixed inset-0 z-[110] bg-cocoa-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-[120] rounded-t-[2rem] bg-white p-5 pb-8 shadow-2xl md:mx-auto md:max-w-md md:rounded-[2rem] md:mb-12"
            >
              <div className="flex items-center justify-between px-2">
                <h2 className="font-display text-2xl font-black text-cocoa-900 tracking-tight">
                  Your Profile
                </h2>
                <button
                  onClick={() => setIsProfileModalOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F9FAFB] text-cocoa-900 active:scale-90 transition-all"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="mt-4 rounded-[1.5rem] bg-[#F9FAFB] p-4 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="relative flex h-12 w-12 flex-shrink-0 overflow-hidden items-center justify-center rounded-[0.75rem] bg-cocoa-900 border border-sand-200 text-base font-black text-white shadow-lg shadow-cocoa-900/30">
                      {user?.dp ? (
                        <img
                          src={user?.dp}
                          className="h-full w-full object-cover"
                          alt="Profile"
                        />
                      ) : (
                        user?.name?.charAt(0)?.toUpperCase() || "U"
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <h3 className="text-sm font-black text-cocoa-900 tracking-tight leading-none truncate max-w-[150px]">
                        {user?.name || "User"}
                      </h3>
                      <p className="text-[10px] font-bold text-cocoa-900/40 truncate max-w-[150px] tracking-tight flex items-center gap-1">
                        <GraduationCap size={9} />{" "}
                        {user?.college
                          ? user.college.split(" ").slice(0, 2).join(" ")
                          : "No College"}
                      </p>
                      <p className="text-[10px] font-bold text-cocoa-900/40 truncate max-w-[150px] tracking-tight flex items-center gap-1">
                        <Phone size={9} /> {user?.mobile || "No Mobile"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      navigate("/student/profile");
                      setIsProfileModalOpen(false);
                    }}
                    className="rounded-[0.75rem] p-2.5 bg-white text-cocoa-200 hover:text-cocoa-900 shadow-sm transition active:scale-90"
                  >
                    <Settings size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <button
                  onClick={() => {
                    navigate("/student/orders");
                    setIsProfileModalOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-[1.5rem] bg-white p-3.5 shadow-sm border-2 border-[#F9FAFB] transition active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
                      <History size={16} strokeWidth={2.5} />
                    </div>
                    <span className="text-xs font-black text-cocoa-900">
                      My Orders
                    </span>
                  </div>
                  <ArrowRight size={14} className="text-sand-300" />
                </button>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-[1.5rem] bg-white p-3.5 text-rose-500 border-2 border-rose-50 transition active:scale-[0.98]"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50">
                    <LogOut size={16} strokeWidth={2.5} />
                  </div>
                  <span className="text-xs font-black tracking-tight">
                    Sign Out
                  </span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLoginModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeAuthModal}
              className="fixed inset-0 z-[110] bg-cocoa-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-[120] rounded-t-[2rem] bg-white p-5 pb-10 shadow-2xl md:mx-auto md:max-w-md md:rounded-[2rem] md:mb-12"
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#F5F5F5]" />

              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-2xl font-black text-cocoa-900 tracking-tight">
                  {authTab === "signin" ? "Sign In" : "Create Account"}
                </h2>
                <button
                  onClick={closeAuthModal}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F5F5] text-cocoa-900 transition active:scale-90"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex gap-2 mb-5 bg-[#F5F5F5] rounded-[1rem] p-1">
                <button
                  onClick={() => {
                    setAuthTab("signin");
                    setLoginError("");
                  }}
                  className={`flex-1 rounded-[0.75rem] py-2.5 text-xs font-black transition-all ${authTab === "signin" ? "bg-white text-cocoa-900 shadow-sm" : "text-cocoa-900/40"}`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setAuthTab("signup");
                    setRegisterError("");
                  }}
                  className={`flex-1 rounded-[0.75rem] py-2.5 text-xs font-black transition-all ${authTab === "signup" ? "bg-white text-cocoa-900 shadow-sm" : "text-cocoa-900/40"}`}
                >
                  Create Account
                </button>
              </div>

              <button
                type="button"
                onClick={handleGoogleAuth}
                className="flex w-full items-center justify-center gap-2 rounded-[1rem] border border-[#E5E5E5] bg-white py-3 text-xs font-bold text-cocoa-900 transition active:scale-[0.98] mb-4"
              >
                <svg width="14" height="14" viewBox="0 0 48 48">
                  <path
                    fill="#FFC107"
                    d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                  />
                </svg>
                Continue with Google
              </button>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-[#F5F5F5]" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-cocoa-900/30">
                  or
                </span>
                <div className="h-px flex-1 bg-[#F5F5F5]" />
              </div>

              <AnimatePresence mode="wait">
                {authTab === "signin" ? (
                  <motion.form
                    key="signin"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18, ease: "easeInOut" }}
                    onSubmit={handleLoginSubmit}
                    className="space-y-3"
                  >
                    <input
                      type="tel"
                      placeholder="Mobile Number"
                      required
                      maxLength="10"
                      value={loginForm.mobile}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        setLoginForm((p) => ({ ...p, mobile: value }));
                      }}
                      className="w-full rounded-[1rem] bg-[#F5F5F5] px-4 py-3.5 text-sm font-semibold text-cocoa-900 outline-none focus:ring-2 focus:ring-cocoa-900/10 transition-all placeholder:text-cocoa-900/30"
                    />
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        required
                        value={loginForm.password}
                        onChange={(e) =>
                          setLoginForm((p) => ({
                            ...p,
                            password: e.target.value,
                          }))
                        }
                        className="w-full rounded-[1rem] bg-[#F5F5F5] px-4 py-3.5 pr-12 text-sm font-semibold text-cocoa-900 outline-none focus:ring-2 focus:ring-cocoa-900/10 transition-all placeholder:text-cocoa-900/30"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-cocoa-900/40 hover:text-cocoa-900 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    <AnimatePresence>
                      {loginError && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-[11px] font-bold text-rose-500 text-center"
                        >
                          {loginError}
                        </motion.p>
                      )}
                    </AnimatePresence>
                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="w-full rounded-[1rem] bg-[#1A1A1A] py-3.5 text-sm font-black text-white transition active:scale-[0.98] disabled:opacity-50"
                    >
                      {loginLoading ? "Signing in..." : "Sign In"}
                    </button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="signup"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18, ease: "easeInOut" }}
                    onSubmit={handleRegisterSubmit}
                    className="space-y-3"
                  >
                    <input
                      type="text"
                      placeholder="Your Name"
                      required
                      value={registerForm.name}
                      onChange={(e) =>
                        setRegisterForm((p) => ({ ...p, name: e.target.value }))
                      }
                      className="w-full rounded-[1rem] bg-[#F5F5F5] px-4 py-3.5 text-sm font-semibold text-cocoa-900 outline-none focus:ring-2 focus:ring-cocoa-900/10 transition-all placeholder:text-cocoa-900/30"
                    />
                    <input
                      type="tel"
                      placeholder="Mobile Number"
                      required
                      maxLength="10"
                      value={registerForm.mobile}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        setRegisterForm((p) => ({ ...p, mobile: value }));
                      }}
                      className="w-full rounded-[1rem] bg-[#F5F5F5] px-4 py-3.5 text-sm font-semibold text-cocoa-900 outline-none focus:ring-2 focus:ring-cocoa-900/10 transition-all placeholder:text-cocoa-900/30"
                    />
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create Password (min. 6 chars)"
                        required
                        minLength={6}
                        value={registerForm.password}
                        onChange={(e) =>
                          setRegisterForm((p) => ({
                            ...p,
                            password: e.target.value,
                          }))
                        }
                        className="w-full rounded-[1rem] bg-[#F5F5F5] px-4 py-3.5 pr-12 text-sm font-semibold text-cocoa-900 outline-none focus:ring-2 focus:ring-cocoa-900/10 transition-all placeholder:text-cocoa-900/30"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-cocoa-900/40 hover:text-cocoa-900 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    <AnimatePresence>
                      {registerError && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-[11px] font-bold text-rose-500 text-center"
                        >
                          {registerError}
                        </motion.p>
                      )}
                      {registerSuccess && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-[11px] font-bold text-green-500 text-center"
                        >
                          ✓ Account created! Switching to sign in...
                        </motion.p>
                      )}
                    </AnimatePresence>
                    <button
                      type="submit"
                      disabled={registerLoading || registerSuccess}
                      className="w-full rounded-[1rem] bg-[#1A1A1A] py-3.5 text-sm font-black text-white transition active:scale-[0.98] disabled:opacity-50"
                    >
                      {registerLoading ? "Creating..." : "Create Account"}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* OTP Verification Modal */}
      <AnimatePresence>
        {showOtpModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOtpModal(false)}
              className="fixed inset-0 z-[110] bg-cocoa-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-[120] max-h-[85vh] overflow-y-auto rounded-t-[2rem] bg-white px-6 pb-8 pt-6 shadow-2xl"
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#F5F5F5]" />
              <h2 className="font-display text-xl font-black text-cocoa-900 tracking-tight">
                Verify Mobile Number
              </h2>
              <p className="mt-1 text-xs font-medium text-cocoa-900/40">
                Enter the 6-digit OTP sent to {otpForm.mobile}
              </p>

              <form onSubmit={handleOtpSubmit} className="mt-6 space-y-4">
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  required
                  maxLength="6"
                  value={otpForm.otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setOtpForm((p) => ({ ...p, otp: value }));
                  }}
                  className="w-full rounded-[1rem] bg-[#F5F5F5] px-4 py-3.5 text-center text-2xl font-black text-cocoa-900 tracking-widest outline-none focus:ring-2 focus:ring-cocoa-900/10 transition-all placeholder:text-cocoa-900/20 placeholder:text-sm placeholder:tracking-normal"
                />

                {otpError && (
                  <p className="text-xs font-semibold text-rose-500">
                    {otpError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={otpLoading || otpForm.otp.length !== 6}
                  className="w-full rounded-[1.5rem] bg-[#1A1A1A] px-6 py-4 text-sm font-black text-white transition active:scale-[0.98] disabled:opacity-40"
                >
                  {otpLoading ? "Verifying..." : "Verify OTP"}
                </button>

                <div className="text-center">
                  {resendCooldown > 0 ? (
                    <p className="text-xs font-semibold text-cocoa-900/40">
                      Resend OTP in {resendCooldown}s
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendLoading}
                      className="text-xs font-black text-cocoa-900 underline underline-offset-2 disabled:opacity-40"
                    >
                      {resendLoading ? "Sending..." : "Resend OTP"}
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toastMessage && !activeOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white via-white to-transparent z-[140] pointer-events-none"
            />
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              className="fixed bottom-10 left-0 right-0 z-[150] flex justify-center px-6 pointer-events-none"
            >
              <div className="flex items-center gap-2.5 rounded-full bg-[#1A1A1A] pl-1.5 pr-4 py-1.5 shadow-xl pointer-events-auto">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white">
                  <Bell size={13} strokeWidth={3} />
                </div>
                <p className="text-[10px] font-black text-white tracking-tight whitespace-nowrap">
                  {toastMessage}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @font-face {
          font-family: 'Satoshi';
          src: url('https://cdn.fontshare.com/wf/TTNW4FOWYDX3Y6Z3S7S7YDX3Y6Z3S7S7/4S7YDX3Y6Z3S7S7YDX3Y6Z3S7S7/Satoshi-Black.woff2') format('woff2');
          font-weight: 900;
          font-style: normal;
        }
      `}</style>
    </div>
  );
}
