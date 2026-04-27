import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import RoleHeader from "../components/common/RoleHeader";
import RoleTabs from "../components/common/RoleTabs";
import api from "../lib/api";
import { connectSocket, socket } from "../lib/socket";
export default function StaffLayout() {
  const [pendingCount, setPendingCount] = useState(0);
  const fetchCount = async () => {
    try {
      const { data } = await api.get("/orders");
      const pending = (data.data || []).filter((o) => o.status === "pending").length;
      setPendingCount(pending);
    } catch {
    }
  };
  useEffect(() => {
    fetchCount();
    connectSocket();
    socket.emit("join_kitchen_room");
    const onNewOrder = () => {
      setPendingCount((prev) => prev + 1);
    };
    socket.on("new_order", onNewOrder);
    return () => {
      socket.off("new_order", onNewOrder);
    };
  }, []);
  const staffNav = [
    { to: "/staff", label: "Kitchen Live", end: true },
    { to: "/staff/orders", label: "Orders", badge: pendingCount },
  ];
  return (
    <div className="min-h-screen bg-luxury">
      <RoleHeader title="Staff Workspace" subtitle="Live kitchen queue and order management" />
      <RoleTabs items={staffNav} />
      <main className="mx-auto w-full max-w-7xl px-4 pb-10 md:px-8">
        <Outlet />
      </main>
    </div>
  );
}
