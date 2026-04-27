import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import { ArrowLeft, UserPlus, Users, X, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
export default function StaffManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [formLoading, setFormLoading] = useState(false);
  const [feedback, setFeedback] = useState({ text: "", isError: false });
  const [showAddForm, setShowAddForm] = useState(false);
  const loadUsers = async () => {
    try {
      const { data } = await api.get("/auth/users");
      setUsers(data.data || []);
    } catch (e) {
      console.error("Failed to load users", e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadUsers();
  }, []);
  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const onSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ text: "", isError: false });
    setFormLoading(true);
    try {
      await api.post("/auth/create-staff", form);
      setFeedback({ text: `✓ Staff account for ${form.name} established`, isError: false });
      setForm({ name: "", email: "", password: "" });
      setShowAddForm(false);
      loadUsers();
      setTimeout(() => setFeedback({ text: "", isError: false }), 4000);
    } catch (err) {
      setFeedback({ text: err?.response?.data?.message || "Failed to create account.", isError: true });
    } finally {
      setFormLoading(false);
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
              <h1 className="font-display text-xl font-black tracking-tight leading-none">Team & Users</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-cocoa-900/40">Access Control</p>
           </div>
        </div>
        <button 
           onClick={() => setShowAddForm(!showAddForm)}
           className="flex items-center gap-2 rounded-full bg-purple-100 p-2 pr-4 text-xs font-black text-purple-700 shadow-sm active:scale-95 transition-all"
        >
           <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-200">
              <UserPlus size={14} />
           </div>
           {showAddForm ? "Close" : "Staff"}
        </button>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 pt-6">
        <AnimatePresence>
          {showAddForm && (
            <motion.form 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={onSubmit} 
              className="mb-6 rounded-[1.5rem] bg-white p-5 shadow-sm border border-purple-100 overflow-hidden"
            >
              <h2 className="font-display text-lg font-black text-cocoa-900">Add Staff Account</h2>
              <p className="text-[10px] uppercase font-bold text-cocoa-900/40 mt-1 mb-4">Secured Kitchen Terminal Access</p>
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  type="text" name="name" 
                  className="w-full rounded-[1rem] bg-[#F5F5F5] px-4 py-3.5 text-sm font-semibold text-cocoa-900 outline-none focus:ring-2 focus:ring-purple-500/20 transition-all placeholder:text-cocoa-900/30"
                  placeholder="Staff Name"
                  value={form.name} onChange={onChange} required
                />
                <input
                  type="email" name="email" 
                  className="w-full rounded-[1rem] bg-[#F5F5F5] px-4 py-3.5 text-sm font-semibold text-cocoa-900 outline-none focus:ring-2 focus:ring-purple-500/20 transition-all placeholder:text-cocoa-900/30"
                  placeholder="Email Address"
                  value={form.email} onChange={onChange} required
                />
                <input
                  type="password" name="password" minLength={6} 
                  className="w-full rounded-[1rem] bg-[#F5F5F5] px-4 py-3.5 text-sm font-semibold text-cocoa-900 outline-none focus:ring-2 focus:ring-purple-500/20 transition-all placeholder:text-cocoa-900/30 md:col-span-2"
                  placeholder="Terminal Password (min 6 chars)"
                  value={form.password} onChange={onChange} required
                />
              </div>
              <button 
                 disabled={formLoading} 
                 type="submit" 
                 className="mt-4 w-full rounded-[1rem] bg-purple-600 py-3.5 text-sm font-black text-white hover:bg-purple-700 transition-colors active:scale-[0.98] disabled:opacity-50"
              >
                {formLoading ? "Generating..." : "Generate Staff Identity"}
              </button>
            </motion.form>
          )}
          {feedback.text && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
               className={`mb-6 flex items-center justify-between rounded-[1rem] ${feedback.isError ? "bg-rose-100 text-rose-700 border-rose-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"} px-4 py-3 text-sm font-bold shadow-sm border`}
            >
              {feedback.text}
              <button onClick={() => setFeedback({ text: "", isError: false })}><X size={16}/></button>
            </motion.div>
          )}
        </AnimatePresence>
        {loading ? (
           <div className="py-12 text-center font-bold text-cocoa-900/20 text-xs">Loading accounts...</div>
        ) : (
           <div className="grid gap-3">
             <div className="flex items-center gap-2 mb-2 px-2">
                <Users size={16} className="text-cocoa-900/30" />
                <span className="text-xs font-black uppercase tracking-widest text-cocoa-900/40">Total Database: {users.length}</span>
             </div>
             {users.map(user => (
               <article key={user._id} className="rounded-[1.25rem] bg-white p-4 shadow-sm border border-sand-100 flex items-center justify-between transition-all hover:shadow-md">
                  <div className="flex items-center gap-4">
                     <div className={`flex h-12 w-12 items-center justify-center rounded-[0.75rem] font-black text-lg ${
                        user.role === 'admin' ? 'bg-amber-100 text-amber-700' :
                        user.role === 'staff' ? 'bg-purple-100 text-purple-700' :
                        'bg-sand-100 text-cocoa-900'
                     }`}>
                        {user.name.charAt(0).toUpperCase()}
                     </div>
                     <div>
                        <h3 className="font-display text-lg font-black leading-none text-cocoa-900">{user.name}</h3>
                        <p className="mt-1 text-[11px] font-semibold text-cocoa-900/40">{user.email}</p>
                     </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                     <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        user.role === 'admin' ? 'bg-amber-100 text-amber-700' :
                        user.role === 'staff' ? 'bg-purple-100 text-purple-700' :
                        'bg-sand-100 text-cocoa-900/50'
                     }`}>
                        {user.role}
                     </span>
                     <span className="text-[9px] font-bold text-cocoa-900/30 flex items-center gap-1">
                        {user.authType === 'google' ? "Google Account" : "Registered"}
                     </span>
                  </div>
               </article>
             ))}
             {users.length === 0 && (
                <div className="py-12 text-center font-bold text-cocoa-900/20 text-xs">No users found.</div>
             )}
           </div>
        )}
      </main>
    </div>
  );
}
