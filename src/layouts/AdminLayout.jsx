import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import RoleHeader from "../components/common/RoleHeader";
import RoleTabs from "../components/common/RoleTabs";
import api from "../lib/api";
import { connectSocket, socket } from "../lib/socket";
export default function AdminLayout() {
  const [orderCount, setOrderCount] = useState(0);
  const fetchCount = async () => {
    try {
      const { data } = await api.get("/orders");
      const pending = (data.data || []).filter((o) => o.status === "pending").length;
      setOrderCount(pending);
    } catch {
    }
  };
  useEffect(() => {
    fetchCount();
    connectSocket();
    socket.emit("join_admin_dashboard");
    const onNewOrder = () => {
      setOrderCount((prev) => prev + 1);
    };
    socket.on("new_order", onNewOrder);
    return () => {
      socket.off("new_order", onNewOrder);
    };
  }, []);
  const adminNav = [
    { to: "/admin", label: "Dashboard", end: true },
    { to: "/admin/orders", label: "Orders", badge: orderCount },
    { to: "/admin/menu", label: "Menu" },
    { to: "/admin/staff", label: "Staff & Users" },
  ];
  return (
    <div className="min-h-screen bg-luxury">
      <RoleHeader title="Admin Console" subtitle="Balanced operations and analytics view" />
      <RoleTabs items={adminNav} />
      <main className="mx-auto w-full max-w-7xl px-4 pb-10 md:px-8">
        <Outlet />
      </main>
    </div>
  );
}
