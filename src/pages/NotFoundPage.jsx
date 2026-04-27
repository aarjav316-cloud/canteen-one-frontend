import { Link } from "react-router-dom";
export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-luxury px-4">
      <div className="lux-card max-w-lg text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-cocoa-500">404</p>
        <h1 className="mt-2 font-display text-4xl text-cocoa-900">Page not found</h1>
        <p className="mt-3 text-cocoa-700">The page you requested does not exist in this canteen experience.</p>
        <Link to="/" className="mt-6 inline-flex rounded-full bg-cocoa-900 px-5 py-2.5 text-sm font-semibold text-ivory-50">
          Return to home
        </Link>
      </div>
    </div>
  );
}
