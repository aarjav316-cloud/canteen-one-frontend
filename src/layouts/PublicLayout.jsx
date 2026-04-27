import { Outlet, Link, NavLink } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
export default function PublicLayout() {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-luxury">
      <header className="sticky top-0 z-30 border-b border-sand-300/70 bg-ivory-50/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <Link to="/" className="font-display text-2xl text-cocoa-900">
            Canteen One
          </Link>
          <nav className="flex items-center gap-2">
            <NavLink
              to="/login"
              onClick={logout}
              className="rounded-full border border-cocoa-300 px-4 py-2 text-sm font-semibold text-cocoa-800 transition hover:border-cocoa-600"
            >
              Login
            </NavLink>
            <NavLink
              to="/register"
              onClick={logout}
              className="rounded-full bg-cocoa-900 px-4 py-2 text-sm font-semibold text-ivory-50 transition hover:bg-cocoa-700"
            >
              Get Started
            </NavLink>
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="border-t border-sand-300/80 bg-ivory-100/70 py-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start gap-1 px-4 text-sm text-cocoa-700 md:px-8">
          <p className="font-display text-lg text-cocoa-900">Canteen One</p>
          <p>Luxury ordering experience for modern college campuses.</p>
        </div>
      </footer>
    </div>
  );
}
