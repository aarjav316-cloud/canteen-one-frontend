import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, LogOut, Camera, HelpCircle, ChevronRight, 
  Settings, User, MapPin, Building2, Save, Check, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/useAuth";
import api from "../../lib/api";
export default function AdminProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [canteenName, setCanteenName] = useState(() => localStorage.getItem("canteenName") || "Admin Canteen");
  const [collegeName, setCollegeName] = useState(() => localStorage.getItem("collegeName") || "");
  const [canteenDP, setCanteenDP] = useState(() => localStorage.getItem("canteenDP") || null);
  const [editMode, setEditMode] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings');
        if (data && data.data) {
           setCanteenName(data.data.canteenName);
           setCollegeName(data.data.collegeName);
           setCanteenDP(data.data.canteenDP || null);
           localStorage.setItem("canteenName", data.data.canteenName);
           localStorage.setItem("collegeName", data.data.collegeName);
           if (data.data.canteenDP) localStorage.setItem("canteenDP", data.data.canteenDP);
        }
      } catch (err) {
        console.error("Failed to fetch settings", err);
      }
    };
    fetchSettings();
  }, []);
  const handleSave = async (e) => {
    e.preventDefault();
    try {
       await api.patch('/settings', { canteenName, collegeName });
       localStorage.setItem("canteenName", canteenName);
       localStorage.setItem("collegeName", collegeName);
       setEditMode(false);
       setSaveSuccess(true);
       setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
       console.error("Failed to save settings", err);
    }
  };
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;
        setCanteenDP(base64String);
        localStorage.setItem("canteenDP", base64String);
        try {
           await api.patch('/settings', { canteenDP: base64String });
        } catch (err) {
           console.error("Failed to save DP", err);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24 font-sans text-cocoa-900">
      
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-sand-200 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
           <Link to="/admin" className="flex h-10 w-10 items-center justify-center rounded-full bg-sand-100 hover:bg-sand-200 transition-colors active:scale-95">
              <ArrowLeft size={20} />
           </Link>
           <div>
              <h1 className="font-display text-xl font-black tracking-tight leading-none">Canteen Profile</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-cocoa-900/40">Manage Identity</p>
           </div>
        </div>
        <button 
           onClick={() => setEditMode(!editMode)}
           className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black transition-all active:scale-95 ${
             editMode ? "bg-rose-100 text-rose-600" : "bg-[#1A1A1A] text-white shadow-md"
           }`}
        >
           {editMode ? <X size={14} /> : <Settings size={14} />}
           {editMode ? "Cancel" : "Edit"}
        </button>
      </header>
      <main className="mx-auto w-full max-w-xl px-4 pt-8">
        
        <section className="flex flex-col items-center">
          <div className="relative group">
            <div className="h-32 w-32 rounded-[2rem] overflow-hidden bg-white shadow-xl border-4 border-white">
              {canteenDP ? (
                <img src={canteenDP} alt="Canteen" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-sand-100 text-cocoa-900/20">
                  <Building2 size={48} />
                </div>
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#1A1A1A] text-white shadow-lg transition active:scale-90 hover:scale-105 border-4 border-[#F5F5F5]">
              <Camera size={16} />
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </label>
          </div>
          <div className="mt-6 text-center">
             <h2 className="font-display text-2xl font-black text-cocoa-900 tracking-tight">{canteenName}</h2>
             <p className="flex items-center justify-center gap-1.5 mt-1 text-xs font-semibold text-cocoa-900/40">
                <MapPin size={12} className="text-rose-500" />
                {collegeName}
             </p>
          </div>
        </section>
        
        <div className="mt-10 space-y-4">
          <AnimatePresence mode="wait">
            {editMode ? (
              <motion.form 
                key="edit-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onSubmit={handleSave} 
                className="rounded-[1.5rem] bg-white p-6 shadow-sm border border-sand-100 space-y-4"
              >
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-cocoa-900/30 ml-1">Canteen Name</label>
                    <input
                      type="text"
                      className="mt-1.5 w-full rounded-[1rem] bg-[#F5F5F5] px-4 py-3.5 text-sm font-semibold text-cocoa-900 outline-none focus:ring-2 focus:ring-cocoa-900/10 transition-all border border-transparent"
                      value={canteenName}
                      onChange={(e) => setCanteenName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-cocoa-900/30 ml-1">College Name</label>
                    <input
                      type="text"
                      className="mt-1.5 w-full rounded-[1rem] bg-[#F5F5F5] px-4 py-3.5 text-sm font-semibold text-cocoa-900 outline-none focus:ring-2 focus:ring-cocoa-900/10 transition-all border border-transparent"
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="w-full flex items-center justify-center gap-2 rounded-[1rem] bg-[#1A1A1A] py-4 text-sm font-black text-white hover:bg-black transition-all active:scale-[0.98] shadow-lg shadow-black/10">
                  <Save size={16} />
                  Save Changes
                </button>
              </motion.form>
            ) : (
              <motion.div 
                key="options"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3"
              >
                {saveSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-center gap-2 rounded-xl bg-green-50 py-3 text-xs font-black text-green-600 border border-green-100 mb-4"
                  >
                    <Check size={14} strokeWidth={3} /> Changes Saved Successfully
                  </motion.div>
                )}
                <div className="bg-white rounded-[1.5rem] p-2 shadow-sm border border-sand-100">
                  <Link to="/admin/help" className="w-full flex items-center justify-between p-4 rounded-[1.25rem] hover:bg-sand-50 transition-colors group">
                    <div className="flex items-center gap-4">
                       <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-500 transition-transform group-active:scale-90">
                          <HelpCircle size={20} />
                       </div>
                       <div className="text-left">
                          <p className="text-sm font-black text-cocoa-900">Help Centre</p>
                          <p className="text-[10px] font-semibold text-cocoa-900/40 uppercase tracking-widest">Support & Guides</p>
                       </div>
                    </div>
                    <ChevronRight size={18} className="text-sand-300" />
                  </Link>
                  <div className="h-px bg-sand-100 mx-4" />
                  <Link to="/admin/settings" className="w-full flex items-center justify-between p-4 rounded-[1.25rem] hover:bg-sand-50 transition-colors group">
                    <div className="flex items-center gap-4">
                       <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500 transition-transform group-active:scale-90">
                          <Settings size={20} />
                       </div>
                       <div className="text-left">
                          <p className="text-sm font-black text-cocoa-900">Account Settings</p>
                          <p className="text-[10px] font-semibold text-cocoa-900/40 uppercase tracking-widest">Privacy & Security</p>
                       </div>
                    </div>
                    <ChevronRight size={18} className="text-sand-300" />
                  </Link>
                </div>
                <div className="bg-white rounded-[1.5rem] p-2 shadow-sm border border-sand-100">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between p-4 rounded-[1.25rem] hover:bg-rose-50 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                       <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-500 transition-transform group-active:scale-90">
                          <LogOut size={20} />
                       </div>
                       <div className="text-left">
                          <p className="text-sm font-black text-rose-600">Logout</p>
                          <p className="text-[10px] font-semibold text-rose-300 uppercase tracking-widest">Sign out of session</p>
                       </div>
                    </div>
                    <ChevronRight size={18} className="text-rose-200" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <style>{`
        .font-display { font-family: 'Satoshi', sans-serif; }
      `}</style>
    </div>
  );
}
