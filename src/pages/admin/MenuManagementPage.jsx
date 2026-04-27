import { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import { formatINR, titleCase } from "../../lib/format";
import { 
  ArrowLeft, Plus, Archive, Trash2, Camera, 
  X, Check, RotateCcw, LayoutGrid, ChevronRight,
  UtensilsCrossed, Search, Pencil
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Cropper from "react-easy-crop";
const DEFAULT_CATEGORIES = ["breakfast", "lunch", "dinner", "snacks", "beverages"];
const DESCRIPTION_WORD_LIMIT = 20;
const defaultForm = {
  name: "",
  description: "",
  price: "",
  category: "breakfast",
  image: null
};
export default function MenuManagementPage() {
  const [menu, setMenu] = useState([]);
  const [activeCategory, setActiveCategory] = useState("breakfast");
  const [form, setForm] = useState(defaultForm);
  const [feedback, setFeedback] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [initialForm, setInitialForm] = useState(null);
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem("canteenCategories");
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const loadMenu = async () => {
    try {
      const { data } = await api.get("/menu?all=true");
      if (data && data.data) {
        setMenu(data.data);
        const dbCats = [...new Set(data.data.map(i => i.category.toLowerCase()))];
        setCategories(prev => {
           const merged = [...new Set([...prev, ...dbCats])];
           localStorage.setItem("canteenCategories", JSON.stringify(merged));
           return merged;
        });
      } else {
        setMenu([]);
      }
    } catch {
      setMenu([]);
    }
  };
  useEffect(() => {
    loadMenu();
  }, []);
  useEffect(() => {
    const lock = showAddForm || showCropper || showAddCat;
    if (lock) {
      document.body.style.overflow = "hidden";
      document.body.style.height = "100vh";
      document.body.style.touchAction = "none";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      document.body.style.height = "unset";
      document.body.style.touchAction = "unset";
      document.documentElement.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      document.body.style.height = "unset";
      document.body.style.touchAction = "unset";
      document.documentElement.style.overflow = "unset";
    };
  }, [showAddForm, showCropper, showAddCat]);
  const onCropComplete = useCallback((_croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);
  const createCroppedImage = async () => {
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      setForm(prev => ({ ...prev, image: croppedImage }));
      setShowCropper(false);
      setImageSrc(null);
    } catch (e) {
      console.error(e);
    }
  };
  const onFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl);
      setShowCropper(true);
    }
  };
  const submitCreate = async (event) => {
    event.preventDefault();
    const words = form.description.trim().split(/\s+/).filter(Boolean).length;
    if (words > DESCRIPTION_WORD_LIMIT) {
      setFeedback(`Description too long (${words}/${DESCRIPTION_WORD_LIMIT} words)`);
      return;
    }
    setFeedback("");
    try {
      if (isEditMode) {
        await api.put(`/menu/${editingItemId}`, {
          ...form,
          price: Number(form.price),
        });
        setFeedback("✓ Item updated successfully");
      } else {
        await api.post("/menu", {
          ...form,
          price: Number(form.price),
        });
        setFeedback("✓ Item added successfully");
      }
      setForm(defaultForm);
      setShowAddForm(false);
      setIsEditMode(false);
      setEditingItemId(null);
      loadMenu();
      setTimeout(() => setFeedback(""), 3000);
    } catch (error) {
      setFeedback(error?.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} item.`);
    }
  };
  const handleEditItem = (item) => {
    const itemForm = {
      name: item.name,
      description: item.description,
      price: String(item.price),
      category: item.category,
      image: item.image,
      isAvailable: item.isAvailable
    };
    setForm(itemForm);
    setInitialForm(itemForm);
    setEditingItemId(item._id);
    setIsEditMode(true);
    setShowAddForm(true);
  };
  const isFormChanged = useMemo(() => {
    if (!isEditMode) return true;
    return JSON.stringify(form) !== JSON.stringify(initialForm);
  }, [form, initialForm, isEditMode]);
  const submitAddCategory = (e) => {
    e.preventDefault();
    const cleanName = newCatName.trim().toLowerCase();
    if (cleanName && !categories.includes(cleanName)) {
      const updated = [...categories, cleanName];
      setCategories(updated);
      localStorage.setItem("canteenCategories", JSON.stringify(updated));
      setActiveCategory(cleanName);
    }
    setNewCatName("");
    setShowAddCat(false);
  };
  const toggleAvailability = async (id) => {
    try {
      await api.patch(`/menu/${id}/toggle`);
      loadMenu();
    } catch (error) {
      alert("Unable to toggle availability.");
    }
  };
  const deleteItem = async (id) => {
    if(!window.confirm("Delete this dish?")) return;
    try {
      await api.delete(`/menu/${id}`);
      loadMenu();
    } catch (error) {
       alert("Unable to delete item.");
    }
  };
  const filteredItems = useMemo(() => {
    return menu.filter(item => {
      const matchCat = item.category === activeCategory;
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [menu, activeCategory, searchQuery]);
  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24 font-sans text-cocoa-900">
      
      <div className="bg-[#F5F5F5] flex items-center justify-between pt-6 px-4 pb-3">
         <div className="flex items-center gap-3">
            <Link to="/admin" className="transition active:scale-90">
               <ArrowLeft size={22} className="text-cocoa-900" />
            </Link>
            <div>
               <h1 className="text-xl font-display font-black text-cocoa-900 tracking-tight leading-tight">Menu Lab</h1>
               <div className="h-[2px] w-full bg-gradient-to-r from-cocoa-900/30 to-transparent mt-0.5" />
            </div>
         </div>
         <button 
            onClick={() => {
              setForm(prev => ({ ...prev, category: activeCategory }));
              setShowAddForm(true);
            }}
            className="flex h-9 items-center gap-1.5 rounded-full bg-[#1A1A1A] pr-4 pl-3 text-[11px] font-black text-white active:scale-95 transition-all shadow-sm"
         >
            <Plus size={14} />
            Add Item
         </button>
      </div>
      
      <div className="sticky top-0 z-40 bg-[#F5F5F5]/90 backdrop-blur-md pt-2 border-b border-sand-200/40">
        
        <div className="px-4 mt-1">
          <div className="relative flex items-center">
            <Search size={16} className="absolute left-3 z-10 text-rose-500" />
            <input
              type="text"
              placeholder="Search dishes..."
              className="w-full rounded-[0.5rem] border-none bg-white py-2.5 pl-10 pr-4 text-[10px] font-bold text-cocoa-900 shadow-sm outline-none placeholder:text-cocoa-900/30 transition-all focus:ring-2 focus:ring-cocoa-900/5"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="relative mt-2">
          <div className="flex gap-2 overflow-x-auto pb-3 pt-1 px-4 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap rounded-[1rem] px-5 py-2 text-xs font-black tracking-wide transition-all ${
                  activeCategory === cat
                    ? "bg-[#1A1A1A] text-white scale-105 shadow-sm"
                    : "bg-white text-cocoa-900/50 shadow-sm"
                }`}
              >
                {titleCase(cat)}
              </button>
            ))}
            <button
              onClick={() => setShowAddCat(true)}
              className="flex-shrink-0 flex items-center gap-1 px-4 py-2 rounded-[1rem] text-xs font-black bg-emerald-500/10 text-emerald-600 transition-all active:scale-95"
            >
              <Plus size={12} strokeWidth={3} />
              New
            </button>
          </div>
        </div>
      </div>
      <main className="mx-auto w-full max-w-xl px-4 mt-4">
        <AnimatePresence>
          {feedback && (
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="mb-4 text-center text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 py-3 rounded-[1rem] border border-emerald-100 shadow-sm">
                {feedback}
             </motion.div>
          )}
        </AnimatePresence>
        <div className="grid gap-3">
          {filteredItems.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-24 gap-3">
                <UtensilsCrossed size={40} className="text-cocoa-900/20" />
                <p className="text-sm font-black text-cocoa-900/30 uppercase tracking-wide text-center">No dishes in {activeCategory}</p>
             </div>
          ) : (
             filteredItems.map((item) => (
               <motion.div 
                 layout
                 key={item._id} 
                 className={`group flex items-center gap-3 rounded-[1.5rem] bg-white p-3 shadow-sm transition-all ${item.isAvailable ? '' : 'opacity-60 grayscale-[0.5]'}`}
               >
                 
                 <div className="relative h-16 w-16 flex-shrink-0 items-center justify-center rounded-[1rem] bg-[#F5F5F5] overflow-hidden transition group-hover:scale-105">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-3xl">🍱</span>
                    )}
                    {!item.isAvailable && (
                       <div className="absolute inset-0 bg-rose-500/10 flex items-center justify-center">
                          <Archive size={16} className="text-rose-500" />
                       </div>
                    )}
                 </div>
                 
                 <div className="flex flex-1 flex-col">
                    <div className="flex items-center justify-between">
                       <p className="text-[8px] font-black uppercase tracking-[0.15em] text-rose-500">{titleCase(item.category)}</p>
                       <div className="flex gap-2">
                          <button onClick={() => handleEditItem(item)} className="text-cocoa-900/30 transition hover:text-[#1A1A1A] active:scale-90">
                             <Pencil size={14} />
                          </button>
                          <button onClick={() => deleteItem(item._id)} className="text-cocoa-900/30 transition hover:text-rose-500 active:scale-90">
                             <Trash2 size={14} />
                          </button>
                       </div>
                    </div>
                    <h4 className="mt-0.5 font-display text-xs font-black text-cocoa-900 leading-tight">{item.name}</h4>
                    <p className="mt-0.5 text-[10px] font-medium text-cocoa-900/40 line-clamp-1 italic">{item.description}</p>
                    <div className="mt-2 flex items-center justify-between">
                       <span className="text-sm font-black text-cocoa-900">{formatINR(item.price)}</span>
                       <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${item.isAvailable ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                          {item.isAvailable ? 'Live' : 'Hidden'}
                       </span>
                    </div>
                 </div>
               </motion.div>
             ))
          )}
        </div>
      </main>
      
      <AnimatePresence>
        {showAddCat && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setShowAddCat(false)}
               className="absolute inset-0 bg-cocoa-900/60 backdrop-blur-md" 
            />
            <motion.form
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              onSubmit={submitAddCategory}
              className="relative w-full max-w-sm bg-white p-5 pb-8 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                 <div>
                    <h2 className="font-display text-xl font-black text-cocoa-900">New Category</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40 mt-1">Add to Catalogue</p>
                 </div>
                 <button type="button" onClick={() => setShowAddCat(false)} className="bg-sand-50 p-2 rounded-full text-cocoa-900 active:scale-90"><X size={18} /></button>
              </div>
              <div className="space-y-4">
                 <div>
                    <div className="flex justify-between items-center ml-1">
                       <label className="text-[10px] font-black uppercase tracking-widest text-cocoa-900/30">Category Name</label>
                       <span className={`text-[9px] font-black uppercase ${newCatName.length > 15 ? 'text-rose-500' : 'text-cocoa-900/20'}`}>
                          {newCatName.length} / 15 Chars
                       </span>
                    </div>
                    <input
                      className="mt-1.5 w-full rounded-[1.25rem] bg-[#F5F5F5] px-4 py-4 text-sm font-bold text-cocoa-900 outline-none focus:ring-2 focus:ring-cocoa-900/5 transition-all"
                      placeholder="e.g. Desserts"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      maxLength={15}
                      required
                    />
                 </div>
                 <button 
                    type="submit" 
                    disabled={!newCatName.trim() || newCatName.length > 15}
                    className="w-full rounded-[1.25rem] bg-emerald-500 py-3.5 text-xs font-black text-white hover:bg-emerald-600 transition-all active:scale-[0.98] shadow-md disabled:opacity-50"
                 >
                    Create Category
                 </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setShowAddForm(false)}
               className="absolute inset-0 bg-cocoa-900/60 backdrop-blur-md" 
            />
            <motion.form
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              onSubmit={submitCreate}
              className="relative w-full max-w-sm bg-white p-4 pb-6 rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-y-auto max-h-[85vh]"
            >
              <div className="flex items-center justify-between mb-4">
                 <div>
                    <h2 className="font-display text-lg font-black text-cocoa-900">{isEditMode ? 'Edit Product' : 'Add New'}</h2>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-[#1A1A1A]/40">Catalogue Section</p>
                 </div>
                 <button type="button" onClick={() => { setShowAddForm(false); setIsEditMode(false); }} className="bg-sand-50 p-1.5 rounded-full text-cocoa-900 active:scale-90"><X size={16} /></button>
              </div>
              
              <div className="mb-4 flex items-center justify-between p-3 bg-[#F5F5F5] rounded-[1rem] border border-sand-200">
                 <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-cocoa-900">Visibility</p>
                    <p className="text-[8px] font-bold text-cocoa-900/40">{form.isAvailable ? 'Live on Store' : 'Hidden from Store'}</p>
                 </div>
                 <button 
                  type="button"
                  onClick={() => setForm(p => ({ ...p, isAvailable: !p.isAvailable }))}
                  className={`h-5 w-9 rounded-full relative transition-colors duration-300 ${form.isAvailable ? 'bg-emerald-500' : 'bg-rose-500'}`}
                 >
                    <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-300 ${form.isAvailable ? 'right-0.5' : 'left-0.5'}`} />
                 </button>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-3 py-2">
                   <div className="relative h-32 w-full rounded-[1.5rem] bg-[#F5F5F5] border-2 border-dashed border-sand-200 flex flex-col items-center justify-center overflow-hidden group cursor-pointer transition-colors hover:border-[#1A1A1A]/20">
                      {form.image ? (
                        <img src={form.image} alt="Preview" className="h-full w-full object-cover" />
                      ) : (
                        <div className="text-center">
                           <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm mx-auto mb-2 text-cocoa-900/40">
                              <Camera size={24} />
                           </div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-cocoa-900/30">Upload Dish Photo</p>
                        </div>
                      )}
                      <input type="file" onChange={onFileChange} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                   </div>
                   {form.image && <button type="button" onClick={() => setForm(prev => ({ ...prev, image: null }))} className="text-[10px] font-black text-rose-500 uppercase flex items-center gap-1"><RotateCcw size={10} /> Reset Photo</button>}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                   <div>
                      <label className="text-[9px] font-black uppercase tracking-widest text-cocoa-900/30 ml-1">Dish Name</label>
                      <input
                        className="mt-1 w-full rounded-[0.75rem] bg-[#F5F5F5] px-3 py-3 text-[11px] font-bold text-cocoa-900 outline-none focus:ring-2 focus:ring-cocoa-900/5 transition-all"
                        placeholder="e.g. Butter Paneer"
                        value={form.name}
                        onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                        required
                      />
                   </div>
                   <div>
                      <label className="text-[9px] font-black uppercase tracking-widest text-cocoa-900/30 ml-1">Price (₹)</label>
                      <input
                        className="mt-1 w-full rounded-[0.75rem] bg-[#F5F5F5] px-3 py-3 text-[11px] font-bold text-cocoa-900 outline-none focus:ring-2 focus:ring-cocoa-900/5 transition-all"
                        placeholder="0.00"
                        type="number"
                        value={form.price}
                        onChange={(e) => setForm(p => ({ ...p, price: e.target.value }))}
                        required
                      />
                   </div>
                </div>
                <div>
                   <div className="flex justify-between items-center ml-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-cocoa-900/30">Description</label>
                      <span className={`text-[8px] font-black uppercase ${form.description.trim().split(/\s+/).filter(Boolean).length > DESCRIPTION_WORD_LIMIT ? 'text-rose-500' : 'text-cocoa-900/20'}`}>
                         {form.description.trim().split(/\s+/).filter(Boolean).length} / {DESCRIPTION_WORD_LIMIT}
                      </span>
                   </div>
                   <textarea
                     className="mt-1 w-full rounded-[0.75rem] bg-[#F5F5F5] px-3 py-3 text-[11px] font-medium text-cocoa-900 outline-none focus:ring-2 focus:ring-cocoa-900/5 transition-all min-h-[80px] resize-none"
                     placeholder="Dish details..."
                     value={form.description}
                     onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                     required
                   />
                </div>
                <div className="hidden">
                  <select value={form.category} onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))}>
                     {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <button 
                  type="submit" 
                  disabled={!isFormChanged}
                  className="w-full rounded-[1.25rem] bg-[#1A1A1A] py-3.5 text-xs font-black text-white hover:bg-black transition-all active:scale-[0.98] shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                >
                   {isEditMode ? 'Update Product' : 'Publish Dish'}
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showCropper && (
          <div className="fixed inset-0 z-[200] bg-black flex flex-col">
            <div className="flex items-center justify-between p-6 text-white z-10 bg-gradient-to-b from-black/80 to-transparent">
               <h2 className="text-lg font-black tracking-tight">Crop Dish Image</h2>
               <button onClick={() => { setShowCropper(false); setImageSrc(null); }} className="p-2 active:scale-90"><X size={24} /></button>
            </div>
            <div className="relative flex-1 bg-[#111]">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={4 / 3}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="p-8 bg-black/90 backdrop-blur-md flex flex-col gap-6">
               <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Zoom</span>
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => setZoom(e.target.value)}
                    className="flex-1 accent-white"
                  />
               </div>
               <button 
                  onClick={createCroppedImage}
                  className="w-full rounded-[1.25rem] bg-white py-4 text-sm font-black text-black hover:bg-white active:scale-95 transition-all shadow-xl"
               >
                  Confirm Crop
               </button>
            </div>
          </div>
        )}
      </AnimatePresence>
      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  );
}
async function readFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result), false);
    reader.readAsDataURL(file);
  });
}
function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}
async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );
  return canvas.toDataURL("image/jpeg");
}
