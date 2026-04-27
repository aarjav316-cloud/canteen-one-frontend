import { Outlet, useLocation } from "react-router-dom";
import RoleHeader from "../components/common/RoleHeader";
import RoleTabs from "../components/common/RoleTabs";
const studentNav = [
  { to: "/student", label: "Track", end: true },
  { to: "/student/menu", label: "Menu" },
  { to: "/student/cart", label: "Cart" },
  { to: "/student/orders", label: "Orders" },
];
export default function StudentLayout() {
  const location = useLocation();
  const isDashboard = location.pathname === "/student" || location.pathname === "/student/" || location.pathname === "/" || location.pathname === "";
  const isProfile = location.pathname === "/student/profile";
  const isMenu = location.pathname === "/student/menu";
  const isCart = location.pathname === "/student/cart";
  const isOrders = location.pathname === "/student/orders";
  const isWallet = location.pathname === "/student/wallet";
  const isHelp = location.pathname === "/student/help";
  const isSettings = location.pathname === "/student/settings";
  const hideChrome = isDashboard || isProfile || isMenu || isCart || isOrders || isWallet || isHelp || isSettings;
  return (
    <div className="min-h-screen bg-luxury">
      {!hideChrome && (
        <>
          <RoleHeader title="Student Hub" subtitle="Fast ordering with real-time pickup tracking" />
          <RoleTabs items={studentNav} />
        </>
      )}
      <main className={`mx-auto w-full max-w-7xl ${hideChrome ? 'pb-10' : 'px-4 pb-10 md:px-8'}`}>
        <Outlet />
      </main>
    </div>
  );
}
