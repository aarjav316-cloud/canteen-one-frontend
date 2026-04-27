import { useState } from "react";
import { ArrowLeft, User, Bell, Shield, Check, Eye, EyeOff, Save, KeyRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";
import { motion } from "framer-motion";
import api from "../../lib/api";
export default function AdminAccountSettingsPage() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [nameSaved, setNameSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwSaved, setPwSaved] = useState(false);
  const handleSaveName = async () => {
    if (!displayName.trim()) return;
    try {
      const res = await api.patch('/auth/profile', { name: displayName });
      setNameSaved(true);
      if (res.data.token) {
         login(res.data.token);
      }
      setTimeout(() => setNameSaved(false), 2000);
    } catch (err) {
      console.error("Failed to update name", err);
    }
  };
  const handleChangePassword = async () => {
    if (!currentPw || !newPw || newPw.length < 6) return;
    try {
      await api.patch('/auth/profile', { 
         currentPassword: currentPw, 
         newPassword: newPw 
      });
      setPwSaved(true);
      setCurrentPw("");
      setNewPw("");
      setTimeout(() => setPwSaved(false), 2000);
    } catch (err) {
      console.error("Failed to update password", err);
      alert(err.response?.data?.message || "Failed to update password. Check current password.");
    }
  };
  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24 font-sans text-cocoa-900">
      
      <div className="px-4 pt-6 pb-3 flex items-center gap-3 text-cocoa-900">
        <button onClick={() => navigate(-1)} className="transition active:scale-90 bg-white p-2 rounded-full shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-display font-black tracking-tight leading-tight">Admin Settings</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-cocoa-900/40">Personal Console Access</p>
        </div>
      </div>
      <main className="mx-auto w-full max-w-xl px-4 mt-6">
        
        <section>
          <div className="flex items-center gap-2 mb-2 px-1">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50">
              <User size={13} className="text-blue-500" strokeWidth={2.5} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-cocoa-900/40">Administrator Identity</p>
          </div>
          <div className="rounded-[1.5rem] bg-white p-5 shadow-sm space-y-4 ring-1 ring-black/5">
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-cocoa-900/30 ml-1">Display Name</label>
              <div className="mt-1.5 flex gap-2">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => { setDisplayName(e.target.value); setNameSaved(false); }}
                  className="flex-1 rounded-[1rem] bg-[#F5F5F5] px-4 py-3 text-xs font-bold text-cocoa-900 outline-none focus:ring-2 focus:ring-cocoa-900/5 transition-all"
                />
                <button
                  onClick={handleSaveName}
                  className={`flex items-center gap-2 rounded-[1rem] px-5 py-3 text-[10px] font-black transition-all active:scale-95 ${
                    nameSaved ? "bg-green-500 text-white" : "bg-[#1A1A1A] text-white"
                  }`}
                >
                  {nameSaved ? <Check size={14} /> : <Save size={14} />}
                  {nameSaved ? "Saved" : "Update"}
                </button>
              </div>
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-cocoa-900/30 ml-1">Email Address (Primary)</label>
              <div className="mt-1.5 flex items-center justify-between rounded-[1rem] bg-[#F5F5F5] px-4 py-3 border border-transparent">
                <span className="text-xs font-bold text-cocoa-900/50">{user?.email}</span>
                <span className="text-[8px] font-black uppercase tracking-widest text-cocoa-900/20">Secured</span>
              </div>
            </div>
          </div>
        </section>
        
        <section className="mt-8">
          <div className="flex items-center gap-2 mb-2 px-1">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-50">
              <Shield size={13} className="text-red-500" strokeWidth={2.5} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-cocoa-900/40">Security & Credentials</p>
          </div>
          <div className="rounded-[1.5rem] bg-white p-5 shadow-sm space-y-4 ring-1 ring-black/5">
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-cocoa-900/30 ml-1">Current Password</label>
              <div className="mt-1.5 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter current password"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  className="w-full rounded-[1rem] bg-[#F5F5F5] px-4 py-3.5 pr-12 text-xs font-bold text-cocoa-900 outline-none focus:ring-2 focus:ring-cocoa-900/5 transition-all"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-cocoa-900/30 transition active:scale-90"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-cocoa-900/30 ml-1">New Secure Password</label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 8 characters"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                className="mt-1.5 w-full rounded-[1rem] bg-[#F5F5F5] px-4 py-3.5 text-xs font-bold text-cocoa-900 outline-none focus:ring-2 focus:ring-cocoa-900/5 transition-all"
              />
            </div>
            <button
              onClick={handleChangePassword}
              disabled={!currentPw || newPw.length < 6}
              className={`w-full flex items-center justify-center gap-2 rounded-[1rem] py-4 text-xs font-black transition-all active:scale-[0.98] disabled:opacity-40 ${
                pwSaved ? "bg-green-500 text-white shadow-green-200" : "bg-[#1A1A1A] text-white shadow-black/20"
              } shadow-lg`}
            >
              <KeyRound size={16} />
              {pwSaved ? "Password Updated" : "Protect Account"}
            </button>
          </div>
        </section>
        
        <section className="mt-8">
          <div className="flex items-center gap-2 mb-2 px-1">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-50">
              <Bell size={13} className="text-orange-500" strokeWidth={2.5} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-cocoa-900/40">Console Notifications</p>
          </div>
          <div className="rounded-[1.5rem] bg-white overflow-hidden divide-y divide-[#F5F5F5] shadow-sm ring-1 ring-black/5">
             <div className="flex items-center justify-between px-5 py-4">
                <div className="flex flex-col">
                   <span className="text-xs font-black text-cocoa-900">New Order Alerts</span>
                   <span className="text-[10px] font-semibold text-cocoa-900/40">Push & sound on incoming queue items</span>
                </div>
                <div className="h-6 w-11 rounded-full bg-[#1A1A1A] relative shadow-inner">
                   <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm" />
                </div>
             </div>
             <div className="flex items-center justify-between px-5 py-4">
                <div className="flex flex-col">
                   <span className="text-xs font-black text-cocoa-900">Weekly Analytics</span>
                   <span className="text-[10px] font-semibold text-cocoa-900/40">Monday briefings on total revenue</span>
                </div>
                <div className="h-6 w-11 rounded-full bg-[#E5E5E5] relative shadow-inner">
                   <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm" />
                </div>
             </div>
          </div>
        </section>
      </main>
    </div>
  );
}
