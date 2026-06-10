import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingBag,
  CreditCard,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Phone,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "../../contexts/useAuth";
import { getOrders } from "../../lib/cart";
export default function StudentProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const orders = getOrders();
  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === "completed").length;
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  return (
    <div className="min-h-screen bg-[#F2F2F7] pb-24 font-sans">
      <div className="bg-[#F2F2F7] px-4 pt-6 pb-2 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="transition active:scale-90 self-start mt-1"
        >
          <ArrowLeft size={22} className="text-cocoa-900" />
        </button>
        <div className="flex flex-col">
          <h1 className="text-xl font-display font-black text-cocoa-900 tracking-tight leading-tight">
            My Profile
          </h1>
          <div className="h-[2px] w-full bg-gradient-to-r from-cocoa-900/30 to-transparent mt-0.5" />
        </div>
      </div>

      <div className="mx-4 mt-4 rounded-[1.5rem] bg-white p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-[#F2F2F7] text-2xl font-black text-cocoa-900 overflow-hidden border border-sand-200">
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
            <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 border-2 border-white shadow-sm">
              <ShieldCheck size={10} className="text-white" strokeWidth={3} />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-cocoa-900 tracking-tight truncate">
                {user?.name || "User"}
              </h2>
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <GraduationCap
                size={11}
                className="text-cocoa-900/30 flex-shrink-0"
              />
              <span className="text-[10px] font-semibold text-cocoa-900/40 truncate">
                MEDICAPS UNIVERSITY
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-1.5">
              <Phone size={11} className="text-cocoa-900/30 flex-shrink-0" />
              <span className="text-[10px] font-semibold text-cocoa-900/40">
                {user?.mobile || "Mobile number unknown"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-[#F2F2F7] grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center">
            <span className="text-lg font-display font-black text-cocoa-900">
              {totalOrders}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-cocoa-900/30">
              Orders
            </span>
          </div>
          <div className="flex flex-col items-center border-x border-[#F2F2F7]">
            <span className="text-lg font-display font-black text-cocoa-900">
              {completedOrders}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-cocoa-900/30">
              Completed
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-display font-black text-cocoa-900">
              {totalOrders > 0
                ? Math.round((completedOrders / totalOrders) * 100)
                : 0}
              %
            </span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-cocoa-900/30">
              Score
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 mt-4">
        <p className="mb-2 px-1 text-[10px] font-display font-black uppercase tracking-[0.18em] text-cocoa-900/40">
          Dashboard Options
        </p>
        <div className="rounded-[1.5rem] bg-white overflow-hidden divide-y divide-[#F2F2F7]">
          <button
            onClick={() => navigate("/student/orders")}
            className="flex w-full items-center justify-between px-4 py-4 transition active:bg-[#F2F2F7]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F2F2F7]">
                <ShoppingBag size={17} className="text-cocoa-900" />
              </div>
              <span className="text-sm font-bold text-cocoa-900">
                My Orders
              </span>
            </div>
            <ChevronRight size={16} className="text-cocoa-900/25" />
          </button>
          <button
            onClick={() => navigate("/student/wallet")}
            className="flex w-full items-center justify-between px-4 py-4 transition active:bg-[#F2F2F7]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F2F2F7]">
                <CreditCard size={17} className="text-cocoa-900" />
              </div>
              <span className="text-sm font-bold text-cocoa-900">
                Payments & Wallets
              </span>
            </div>
            <ChevronRight size={16} className="text-cocoa-900/25" />
          </button>
          <button
            className="flex w-full items-center justify-between px-4 py-4 transition active:bg-[#F2F2F7]"
            onClick={() => navigate("/student/settings")}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F2F2F7]">
                <Settings size={17} className="text-cocoa-900" />
              </div>
              <span className="text-sm font-bold text-cocoa-900">
                Account Settings
              </span>
            </div>
            <ChevronRight size={16} className="text-cocoa-900/25" />
          </button>
        </div>
      </div>

      <div className="px-4 mt-6">
        <p className="mb-2 px-1 text-[10px] font-display font-black uppercase tracking-[0.18em] text-cocoa-900/40">
          Support & Info
        </p>
        <div className="rounded-[1.5rem] bg-white overflow-hidden">
          <button
            className="flex w-full items-center justify-between px-4 py-4 transition active:bg-[#F2F2F7]"
            onClick={() => navigate("/student/help")}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F2F2F7]">
                <HelpCircle size={17} className="text-cocoa-900" />
              </div>
              <span className="text-sm font-bold text-cocoa-900">
                Help Center
              </span>
            </div>
            <ChevronRight size={16} className="text-cocoa-900/25" />
          </button>
        </div>
      </div>

      <div className="px-4 mt-6">
        <div className="rounded-[1.5rem] bg-white overflow-hidden">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-between px-4 py-4 transition active:bg-[#F2F2F7]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50">
                <LogOut size={17} className="text-rose-500" />
              </div>
              <span className="text-sm font-bold text-rose-500">Sign Out</span>
            </div>
            <ChevronRight size={16} className="text-rose-300" />
          </button>
        </div>
      </div>
    </div>
  );
}
