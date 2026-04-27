import { NavLink } from "react-router-dom";
export default function RoleTabs({ items }) {
  return (
    <nav className="mx-auto flex w-full max-w-7xl gap-2 overflow-x-auto px-4 py-3 md:px-8" aria-label="Role navigation">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition flex items-center gap-2 ${
              isActive
                ? "border-cocoa-900 bg-cocoa-900 text-ivory-50"
                : "border-cocoa-300 bg-white text-cocoa-800 hover:border-cocoa-500"
            }`
          }
        >
          {({ isActive }) => (
            <>
              {item.label}
              {item.badge != null && item.badge > 0 && (
                <span className={`inline-flex items-center justify-center min-w-[20px] h-5 rounded-full px-1.5 text-xs font-bold ${
                  isActive
                    ? "bg-ivory-50 text-cocoa-900"
                    : "bg-cocoa-900 text-ivory-50"
                }`}>
                  {item.badge}
                </span>
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
