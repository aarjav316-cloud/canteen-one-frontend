import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  User,
  Bell,
  Shield,
  Trash2,
  ChevronRight,
  Check,
  Eye,
  EyeOff,
  LogOut,
  Phone,
  GraduationCap,
  Camera,
  RotateCcw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../lib/api";
const NOTIF_SETTINGS = [
  {
    key: "orderUpdates",
    label: "Order Updates",
    desc: "Status changes for your orders",
  },
  {
    key: "promotions",
    label: "Promotions & Offers",
    desc: "Deals and discount alerts",
  },
  {
    key: "menuReminders",
    label: "Meal Reminders",
    desc: "Timely nudges to order ahead",
  },
];
export default function AccountSettingsPage() {
  const navigate = useNavigate();
  const { user, logout, login } = useAuth();
  const fileInputRef = useRef(null);
  const [prefs, setPrefs] = useState({
    orderUpdates: true,
    promotions: true,
    menuReminders: true,
  });
  const [refundPreference, setRefundPreference] = useState("wallet");
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [college, setCollege] = useState(user?.college || "");
  const [mobile, setMobile] = useState(user?.mobile || "");
  const [dp, setDp] = useState(user?.dp || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwSaved, setPwSaved] = useState(false);
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/auth/profile");
        if (data?.user) {
          setDisplayName(data.user.name || "");
          setCollege(data.user.college || "");
          setMobile(data.user.mobile || "");
          setDp(data.user.dp || "");
          if (data.user.notificationPreferences) {
            setPrefs(data.user.notificationPreferences);
          }
          if (data.user.refundPreference) {
            setRefundPreference(data.user.refundPreference);
          }
        }
      } catch (error) {
        console.error("Failed to load profile", error);
      }
    };
    fetchProfile();
  }, []);
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Img = reader.result;
        setDp(base64Img);
        try {
          const { data } = await api.patch("/auth/profile", { dp: base64Img });
          if (data.token) {
            login(data.token);
          }
        } catch (err) {
          alert("Unable to save photo");
        }
      };
      reader.readAsDataURL(file);
    }
  };
  const togglePref = async (key) => {
    const updatedPrefs = { ...prefs, [key]: !prefs[key] };
    setPrefs(updatedPrefs);
    try {
      await api.patch("/auth/profile", {
        notificationPreferences: updatedPrefs,
      });
    } catch {
      setPrefs(prefs);
    }
  };
  const handleRefundPreferenceChange = async (newPref) => {
    setRefundPreference(newPref);
    try {
      await api.patch("/auth/profile", { refundPreference: newPref });
    } catch {
      setRefundPreference(refundPreference);
    }
  };
  const handleSaveProfile = async () => {
    if (!displayName.trim()) return;
    setIsSavingProfile(true);
    try {
      const { data } = await api.patch("/auth/profile", {
        name: displayName,
        college,
        mobile,
      });
      if (data.token) {
        login(data.token);
      }
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2000);
    } catch (error) {
      alert("Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };
  const handleChangePassword = async () => {
    if (!currentPw || !newPw || newPw.length < 6) return;
    try {
      const { data } = await api.patch("/auth/profile", {
        currentPassword: currentPw,
        newPassword: newPw,
      });
      if (data.token) {
        login(data.token);
      }
      setPwSaved(true);
      setCurrentPw("");
      setNewPw("");
      setTimeout(() => setPwSaved(false), 2000);
    } catch (error) {
      alert(error?.response?.data?.message || "Password change failed");
    }
  };
  const handleDeleteAccount = async () => {
    if (deleteInput !== "DELETE") return;
    try {
      await api.delete("/auth/profile");
      logout();
      navigate("/");
    } catch (error) {
      alert("Unable to delete account.");
    }
  };
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
            Account Settings
          </h1>
          <div className="h-[2px] w-full bg-gradient-to-r from-cocoa-900/30 to-transparent mt-0.5" />
        </div>
      </div>

      <div className="mx-4 mt-2 rounded-[1.5rem] bg-white p-4 shadow-sm relative overflow-hidden transition-all group">
        <div className="absolute top-0 right-0 h-24 w-24 translate-x-4 -translate-y-4 rounded-full bg-blue-50/50 opacity-20" />
        <div className="flex items-center gap-4 relative z-10">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative flex h-16 w-16 flex-shrink-0 cursor-pointer overflow-hidden items-center justify-center rounded-[1.25rem] bg-[#F5F5F5] text-2xl font-black text-cocoa-900 border border-sand-200"
          >
            {dp ? (
              <img
                src={dp}
                className="h-full w-full object-cover"
                alt="Profile"
              />
            ) : (
              user?.name?.charAt(0)?.toUpperCase() || "U"
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera size={18} className="text-white" />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-black text-cocoa-900 tracking-tight truncate">
              {displayName || "User"}
            </h2>
            <div className="mt-1 flex items-center gap-1.5">
              <GraduationCap
                size={11}
                className="text-cocoa-900/30 flex-shrink-0"
              />
              <span className="text-[10px] font-semibold text-cocoa-900/50 truncate leading-tight">
                {college || "College unknown"}
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-1.5">
              <Phone size={11} className="text-cocoa-900/30 flex-shrink-0" />
              <span className="text-[10px] font-semibold text-cocoa-900/50">
                {mobile || "Mobile number unknown"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-4 mt-5">
        <div className="flex items-center gap-2 mb-2 px-1">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50">
            <User size={13} className="text-blue-500" strokeWidth={2.5} />
          </div>
          <p className="text-[10px] font-display font-black uppercase tracking-[0.18em] text-cocoa-900/40">
            Profile
          </p>
        </div>
        <div className="rounded-[1.5rem] bg-white p-4 shadow-sm space-y-4">
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-cocoa-900/40">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                setNameSaved(false);
              }}
              className="mt-1.5 w-full rounded-[0.75rem] bg-[#F5F5F5] px-3 py-2.5 text-xs font-bold text-cocoa-900 outline-none focus:ring-2 focus:ring-cocoa-900/10 transition-all"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-cocoa-900/40">
                College
              </label>
              <input
                type="text"
                value={college}
                onChange={(e) => {
                  setCollege(e.target.value);
                  setNameSaved(false);
                }}
                placeholder="e.g. Current University"
                className="mt-1.5 w-full rounded-[0.75rem] bg-[#F5F5F5] px-3 py-2.5 text-xs font-bold text-cocoa-900 outline-none focus:ring-2 focus:ring-cocoa-900/10 transition-all"
              />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-cocoa-900/40">
                Mobile
              </label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => {
                  setMobile(e.target.value);
                  setNameSaved(false);
                }}
                placeholder="+91..."
                className="mt-1.5 w-full rounded-[0.75rem] bg-[#F5F5F5] px-3 py-2.5 text-xs font-bold text-cocoa-900 outline-none focus:ring-2 focus:ring-cocoa-900/10 transition-all"
              />
            </div>
          </div>
          <div>
            <button
              onClick={handleSaveProfile}
              disabled={isSavingProfile}
              className={`w-full flex items-center justify-center gap-1.5 rounded-[0.75rem] py-3 text-[10px] font-black transition-all active:scale-[0.98] mt-1 ${
                nameSaved
                  ? "bg-green-500 text-white"
                  : "bg-[#1A1A1A] text-white disabled:opacity-50"
              }`}
            >
              {nameSaved ? (
                <>
                  <Check size={12} strokeWidth={3} /> Saved
                </>
              ) : (
                "Commit Changes"
              )}
            </button>
          </div>
          <div className="pt-2 border-t border-sand-100">
            <label className="text-[9px] font-black uppercase tracking-widest text-cocoa-900/40">
              Email Address
            </label>
            <div className="mt-1.5 flex items-center gap-2 rounded-[0.75rem] bg-[#F5F5F5] px-3 py-2.5">
              <span className="flex-1 text-xs font-bold text-cocoa-900/50">
                {user?.email}
              </span>
              <span className="text-[8px] font-black uppercase tracking-widest text-cocoa-900/25">
                Read only
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-4 mt-5">
        <div className="flex items-center gap-2 mb-2 px-1">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-50">
            <Shield size={13} className="text-purple-500" strokeWidth={2.5} />
          </div>
          <p className="text-[10px] font-display font-black uppercase tracking-[0.18em] text-cocoa-900/40">
            Security
          </p>
        </div>
        <div className="rounded-[1.5rem] bg-white p-4 shadow-sm space-y-3">
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-cocoa-900/40">
              Current Password
            </label>
            <div className="mt-1.5 relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter current password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                className="w-full rounded-[0.75rem] bg-[#F5F5F5] px-3 py-2.5 pr-10 text-xs font-bold text-cocoa-900 outline-none focus:ring-2 focus:ring-cocoa-900/10 transition-all"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cocoa-900/30 transition active:scale-90"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-cocoa-900/40">
              New Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Min. 6 characters"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              className="mt-1.5 w-full rounded-[0.75rem] bg-[#F5F5F5] px-3 py-2.5 text-xs font-bold text-cocoa-900 outline-none focus:ring-2 focus:ring-cocoa-900/10 transition-all"
            />
          </div>
          <button
            onClick={handleChangePassword}
            disabled={!currentPw || newPw.length < 6}
            className={`w-full rounded-[0.75rem] py-3 text-xs font-black transition-all active:scale-[0.98] disabled:opacity-40 ${
              pwSaved ? "bg-green-500 text-white" : "bg-[#1A1A1A] text-white"
            }`}
          >
            {pwSaved ? "✓ Password Updated" : "Update Password"}
          </button>
        </div>
      </div>

      <div className="mx-4 mt-5">
        <div className="flex items-center gap-2 mb-2 px-1">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-50">
            <Bell size={13} className="text-orange-500" strokeWidth={2.5} />
          </div>
          <p className="text-[10px] font-display font-black uppercase tracking-[0.18em] text-cocoa-900/40">
            Notifications
          </p>
        </div>
        <div className="rounded-[1.5rem] bg-white overflow-hidden divide-y divide-[#F5F5F5] shadow-sm">
          {NOTIF_SETTINGS.map((n) => (
            <div
              key={n.key}
              className="flex items-center justify-between px-4 py-4"
            >
              <div className="flex flex-col">
                <span className="text-xs font-black text-cocoa-900">
                  {n.label}
                </span>
                <span className="text-[10px] font-medium text-cocoa-900/40">
                  {n.desc}
                </span>
              </div>
              <button
                onClick={() => togglePref(n.key)}
                className={`relative h-6 w-11 rounded-full transition-all duration-300 ${
                  prefs[n.key] ? "bg-[#1A1A1A]" : "bg-[#E5E5E5]"
                }`}
              >
                <motion.div
                  animate={{ x: prefs[n.key] ? 20 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm"
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Refund Preference */}
      <div className="mx-4 mt-5">
        <div className="flex items-center gap-2 mb-2 px-1">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-green-50">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-green-600"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              <line x1="10" x2="10" y1="11" y2="17" />
              <line x1="14" x2="14" y1="11" y2="17" />
            </svg>
          </div>
          <p className="text-[10px] font-display font-black uppercase tracking-[0.18em] text-cocoa-900/40">
            Refund Preference
          </p>
        </div>
        <div className="rounded-[1.5rem] bg-white overflow-hidden shadow-sm p-4">
          <p className="text-[10px] font-medium text-cocoa-900/60 mb-3">
            Choose how you want to receive refunds for cancelled orders
          </p>
          <div className="space-y-2">
            <button
              onClick={() => handleRefundPreferenceChange("wallet")}
              className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 transition ${
                refundPreference === "wallet"
                  ? "border-[#1A1A1A] bg-[#1A1A1A]/5"
                  : "border-[#F5F5F5] bg-white"
              }`}
            >
              <div
                className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 mt-0.5 ${
                  refundPreference === "wallet"
                    ? "border-[#1A1A1A] bg-[#1A1A1A]"
                    : "border-[#E5E5E5]"
                }`}
              >
                {refundPreference === "wallet" && (
                  <Check size={12} className="text-white" strokeWidth={3} />
                )}
              </div>
              <div className="flex-1 text-left">
                <p className="text-xs font-black text-cocoa-900">
                  Wallet (Instant)
                </p>
                <p className="text-[10px] font-medium text-cocoa-900/50 mt-0.5">
                  Get refunds instantly in your wallet for immediate use
                </p>
              </div>
            </button>
            <button
              onClick={() => handleRefundPreferenceChange("original")}
              className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 transition ${
                refundPreference === "original"
                  ? "border-[#1A1A1A] bg-[#1A1A1A]/5"
                  : "border-[#F5F5F5] bg-white"
              }`}
            >
              <div
                className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 mt-0.5 ${
                  refundPreference === "original"
                    ? "border-[#1A1A1A] bg-[#1A1A1A]"
                    : "border-[#E5E5E5]"
                }`}
              >
                {refundPreference === "original" && (
                  <Check size={12} className="text-white" strokeWidth={3} />
                )}
              </div>
              <div className="flex-1 text-left">
                <p className="text-xs font-black text-cocoa-900">
                  Bank Account (5-7 days)
                </p>
                <p className="text-[10px] font-medium text-cocoa-900/50 mt-0.5">
                  Refund to your original payment method (UPI/Card)
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-4 mt-5">
        <div className="rounded-[1.5rem] bg-white overflow-hidden shadow-sm">
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="flex w-full items-center gap-3 px-4 py-4 transition active:bg-[#F5F5F5]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50">
              <LogOut size={16} className="text-rose-500" />
            </div>
            <span className="text-sm font-bold text-rose-500">Sign Out</span>
          </button>
        </div>
      </div>

      <div className="mx-4 mt-5">
        <div className="flex items-center gap-2 mb-2 px-1">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-50">
            <Trash2 size={13} className="text-rose-500" strokeWidth={2.5} />
          </div>
          <p className="text-[10px] font-display font-black uppercase tracking-[0.18em] text-rose-400">
            Danger Zone
          </p>
        </div>
        <div className="rounded-[1.5rem] bg-white overflow-hidden shadow-sm border border-rose-100">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex w-full items-center justify-between px-4 py-4 transition active:bg-rose-50"
          >
            <div className="flex flex-col items-start">
              <span className="text-xs font-black text-rose-500">
                Delete Account
              </span>
              <span className="text-[10px] font-medium text-cocoa-900/40">
                Permanently remove your account and data
              </span>
            </div>
            <ChevronRight size={16} className="text-rose-300" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showDeleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowDeleteConfirm(false);
                setDeleteInput("");
              }}
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
              <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-rose-50 mb-3">
                <Trash2 size={22} className="text-rose-500" />
              </div>
              <h2 className="font-display text-xl font-black text-cocoa-900 tracking-tight">
                Delete Account?
              </h2>
              <p className="mt-1 text-xs font-medium text-cocoa-900/50 leading-relaxed">
                This will permanently delete your account, wallet balance, and
                all order history. This cannot be undone.
              </p>
              <div className="mt-5">
                <label className="text-[9px] font-black uppercase tracking-widest text-cocoa-900/40">
                  Type <span className="text-rose-500">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  placeholder="DELETE"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  className="mt-1.5 w-full rounded-[0.75rem] bg-[#F5F5F5] px-4 py-3 text-sm font-black text-cocoa-900 outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
                />
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteInput("");
                  }}
                  className="flex-1 rounded-[1rem] bg-[#F5F5F5] py-3.5 text-xs font-black text-cocoa-900 transition active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteInput !== "DELETE"}
                  className="flex-1 rounded-[1rem] bg-rose-500 py-3.5 text-xs font-black text-white transition active:scale-[0.98] disabled:opacity-40"
                >
                  Delete Forever
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
