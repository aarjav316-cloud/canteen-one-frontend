import { useEffect, useState, useMemo, useRef } from "react";
import { Search, ArrowLeft, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { formatINR, titleCase } from "../../lib/format";
import { getCart, addToCart, updateCartQty } from "../../lib/cart";
import { motion } from "framer-motion";
import MenuCard from "../../components/student/MenuCard";
import api from "../../lib/api";
export default function MenuPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState(getCart());
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("focus") === "1" && searchRef.current) {
      searchRef.current.focus();
    }
  }, [location.search]);
  useEffect(() => {
    let cancelled = false;
    const loadItems = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/menu");
        if (!cancelled) {
          const list = data.data || [];
          setItems(list);
          const dbCats = [...new Set(list.map(i => titleCase(i.category)))];
          setCategories(["All", ...dbCats]);
        }
      } catch (err) {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadItems();
    return () => { cancelled = true; };
  }, []);
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchCat = selectedCategory === "All" || item.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [items, selectedCategory, searchQuery]);
  const groupedItems = useMemo(() => {
    if (selectedCategory !== "All" || searchQuery) return null;
    const groups = {};
    items.forEach((item) => {
      const cat = titleCase(item.category);
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [items, selectedCategory, searchQuery]);
  const getQty = (id) => cart.find((i) => i._id === id)?.quantity || 0;
  const totalCartCount = cart.reduce((s, i) => s + i.quantity, 0);
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
  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24 font-sans">
      
      <div className="sticky top-0 z-30 bg-[#F5F5F5] relative">
        
        <div className="px-4 pt-6 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="transition active:scale-90">
              <ArrowLeft size={22} className="text-cocoa-900" />
            </button>
            <div>
              <h1 className="text-xl font-display font-black text-cocoa-900 tracking-tight leading-tight">Explore Menu</h1>
              <div className="h-[2px] w-full bg-gradient-to-r from-cocoa-900/30 to-transparent mt-0.5" />
            </div>
          </div>
          
          <button onClick={() => navigate("/student/cart")} className="relative transition active:scale-90">
            <ShoppingBag size={22} className="text-cocoa-900" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-black text-white">
                {totalCartCount > 9 ? "9+" : totalCartCount}
              </span>
            )}
          </button>
        </div>
        
        <div className="px-4">
          <div className="relative flex items-center">
            <Search size={16} className="absolute left-3 z-10 text-rose-500" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search your menu..."
              className="w-full rounded-[0.5rem] border-none bg-white py-3 pl-10 pr-4 text-xs font-semibold text-cocoa-900 shadow-sm outline-none placeholder:text-cocoa-900/30 focus:ring-2 focus:ring-rose-500/10 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="mt-3 relative">
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-[#F5F5F5] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-[#F5F5F5] to-transparent z-10 pointer-events-none" />
          <div className="flex gap-2 overflow-x-auto pb-3 pt-1 px-6 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap rounded-[1rem] px-5 py-2 text-xs font-black tracking-wide transition-all ${
                  selectedCategory === cat
                    ? "bg-[#1A1A1A] text-white scale-105"
                    : "bg-white text-cocoa-900/50 shadow-sm"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none translate-y-full"
          style={{background:"linear-gradient(to bottom, #F5F5F5, transparent)"}}
        />
      </div>
      
      <div className="mt-6 px-4 grid gap-3">
        {loading ? (
          <>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-[1.5rem] bg-white p-3 shadow-sm">
                
                <div className="h-16 w-16 flex-shrink-0 rounded-[1rem] bg-[#F0F0F0] animate-pulse" />
                <div className="flex flex-1 flex-col gap-2">
                  
                  <div className="h-2 w-12 rounded-full bg-[#F0F0F0] animate-pulse" />
                  
                  <div className="h-3 w-32 rounded-full bg-[#EBEBEB] animate-pulse" />
                  
                  <div className="h-2 w-40 rounded-full bg-[#F5F5F5] animate-pulse" />
                  <div className="flex items-center justify-between mt-1">
                    
                    <div className="h-4 w-10 rounded-full bg-[#EBEBEB] animate-pulse" />
                    
                    <div className="h-6 w-14 rounded-[0.75rem] bg-[#F0F0F0] animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : filteredItems.length > 0 ? (
          groupedItems ? (
            <>
              
              <div className="contents">
                <div className="flex items-center gap-4 mt-2 mb-1">
                  <div className="h-[2px] flex-1 bg-gradient-to-l from-sand-300 to-transparent" />
                  <h2 className="font-display text-base font-black text-cocoa-900 whitespace-nowrap tracking-tight uppercase">Trending</h2>
                  <div className="h-[2px] flex-1 bg-gradient-to-r from-sand-300 to-transparent" />
                </div>
                {Object.values(groupedItems).flat().map((item) => {
                  const qty = getQty(item._id);
                  return (
                    <MenuCard key={item._id} item={item} qty={qty} onAdd={handleAdd} onIncrease={handleIncrease} onDecrease={handleDecrease} />
                  );
                })}
              </div>
            </>
          ) : (
            <>
              {selectedCategory !== "All" && !searchQuery && (
                <div className="flex items-center gap-4 mt-2 mb-1">
                  <div className="h-[2px] flex-1 bg-gradient-to-l from-sand-300 to-transparent" />
                  <h2 className="font-display text-base font-black text-cocoa-900 whitespace-nowrap tracking-tight uppercase">{selectedCategory}</h2>
                  <div className="h-[2px] flex-1 bg-gradient-to-r from-sand-300 to-transparent" />
                </div>
              )}
              {filteredItems.map((item) => {
                const qty = getQty(item._id);
                return (
                  <MenuCard key={item._id} item={item} qty={qty} onAdd={handleAdd} onIncrease={handleIncrease} onDecrease={handleDecrease} />
                );
              })}
            </>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <UtensilsCrossed size={40} className="text-cocoa-900/20" />
            <p className="text-sm font-black text-cocoa-900/30 uppercase tracking-wide">No Items Found</p>
            <p className="text-xs text-cocoa-900/20">No {selectedCategory !== "All" ? selectedCategory.toLowerCase() : ""} items available right now.</p>
          </div>
        )}
      </div>
      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  );
}
