import { LogOut } from "lucide-react";
import { useAuth } from "../../contexts/useAuth";
const labels = {
  student: "Student",
  staff: "Staff",
  admin: "Admin",
};
export default function RoleHeader({ title, subtitle }) {
  const { role, logout } = useAuth();
  return (
    <header className="sticky top-0 z-20 border-b border-sand-300/80 bg-ivory-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cocoa-500">
            {labels[role] || "Portal"}
          </p>
          <h1 className="font-display text-2xl text-cocoa-900 md:text-3xl">{title}</h1>
          {subtitle ? <p className="text-sm text-cocoa-700">{subtitle}</p> : null}
        </div>
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-full border border-cocoa-300 bg-white px-4 py-2 text-sm font-semibold text-cocoa-800 transition hover:bg-cocoa-900 hover:text-ivory-50"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </header>
  );
}
