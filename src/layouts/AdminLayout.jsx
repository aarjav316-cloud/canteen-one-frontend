import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import RoleHeader from "../components/common/RoleHeader";
import RoleTabs from "../components/common/RoleTabs";
import api from "../lib/api";
import { connectSocket, socket } from "../lib/socket";
import { useAdminNotifications } from "../hooks/useAdminNotifications";

export default function AdminLayout() {
  const [orderCount, setOrderCount] = useState(0);

  // Listen for admin notifications (order cancellations, etc.)
  useAdminNotifications();

  const fetchCount = async () => {
    try {
      const { data } = await api.get("/orders");
      const pending = (data.data || []).filter(
        (o) => o.status === "pending",
      ).length;
      setOrderCount(pending);
    } catch {}
  };
  useEffect(() => {
    fetchCount();
    connectSocket();
    socket.emit("join_admin_dashboard");

    const onNewOrder = () => {
      setOrderCount((prev) => prev + 1);
    };

    const onOrderStatusUpdate = (payload) => {
      // Refresh count when order status changes
      // This ensures cancelled orders update the pending count
      if (payload.status === "accepted" || payload.status === "cancelled") {
        fetchCount();
      }
    };

    socket.on("new_order", onNewOrder);
    socket.on("order_status_updated", onOrderStatusUpdate);

    return () => {
      socket.off("new_order", onNewOrder);
      socket.off("order_status_updated", onOrderStatusUpdate);
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
      <RoleHeader
        title="Admin Console"
        subtitle="Balanced operations and analytics view"
      />
      <RoleTabs items={adminNav} />
      <main className="mx-auto w-full max-w-7xl px-4 pb-10 md:px-8">
        <Outlet />
      </main>
    </div>
  );
}
