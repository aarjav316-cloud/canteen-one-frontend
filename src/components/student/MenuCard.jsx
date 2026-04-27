import { motion } from "framer-motion";
import { formatINR, titleCase } from "../../lib/format";
export const EMOJI_MAP = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("burger")) return "🍔";
  if (n.includes("pizza")) return "🍕";
  if (n.includes("sandwich")) return "🥪";
  if (n.includes("tea")) return "☕";
  if (n.includes("coffee")) return "☕";
  if (n.includes("idli")) return "🍚";
  if (n.includes("dosa")) return "🥞";
  if (n.includes("samosa")) return "🥟";
  if (n.includes("juice")) return "🧃";
  if (n.includes("shake") || n.includes("lassi")) return "🥤";
  if (n.includes("rice")) return "🍛";
  if (n.includes("noodle") || n.includes("maggi")) return "🍜";
  if (n.includes("paratha")) return "🫓";
  if (n.includes("chai")) return "🍵";
  return "🍱";
};
export default function MenuCard({
  item,
  qty = 0,
  isCartView = false,
  onAdd,
  onIncrease,
  onDecrease
}) {
  const containerSize = isCartView ? "h-14 w-14 text-2xl" : "h-16 w-16 text-3xl transition group-hover:scale-105";
  return (
    <motion.div
      layout
      key={item._id}
      className={`flex items-center gap-3.5 rounded-[1.25rem] bg-white p-3 shadow-sm border border-[#F0F0F0] transition ${
        !isCartView && "group hover:shadow-lg hover:border-black/5"
      }`}
    >
      <div className={`flex flex-shrink-0 items-center justify-center rounded-[0.85rem] bg-[#F8F8F8] border border-black/5 overflow-hidden ${containerSize}`}>
        {item.image ? (
          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          EMOJI_MAP(item.name)
        )}
      </div>
      <div className="flex flex-1 flex-col justify-center min-w-0">
        <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
                <p className="text-[8px] font-black uppercase tracking-widest text-rose-500 mb-0.5 truncate">
                  {titleCase(item.category)}
                </p>
                <h4 className="font-display text-sm font-black text-cocoa-900 leading-tight truncate">
                  {item.name}
                </h4>
            </div>
        </div>
        {!isCartView && item.description && (
          <p className="mt-0.5 text-[10px] font-medium text-cocoa-900/40 line-clamp-1 pr-4">
            {item.description}
          </p>
        )}
        <div className="mt-2.5 flex items-center justify-between">
           <div className="flex items-baseline gap-1.5">
              <span className="text-[13px] font-black text-cocoa-900">
                {formatINR(isCartView ? item.price * qty : item.price)}
              </span>
              {isCartView && qty > 1 && (
                  <span className="text-[9px] font-bold text-cocoa-900/40">
                    ({formatINR(item.price)} ea)
                  </span>
              )}
           </div>
          {qty > 0 ? (
            <div className="flex items-center gap-1.5 ml-2">
              <button
                onClick={(e) => { e.preventDefault(); onDecrease(item); }}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F5F5F5] text-cocoa-900 border border-black/5 font-black text-sm transition active:scale-90"
              >
                −
              </button>
              <span className="text-[11px] font-black text-cocoa-900 w-3 text-center">{qty}</span>
              <button
                onClick={(e) => { e.preventDefault(); onIncrease(item); }}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1A1A1A] text-white font-black text-sm transition active:scale-90 shadow-sm"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => { e.preventDefault(); onAdd(item); }}
              className="rounded-lg bg-[#1A1A1A] px-5 py-[7px] text-[10px] font-black tracking-widest text-white transition active:scale-90 shadow-md shadow-black/10"
            >
              ADD
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
