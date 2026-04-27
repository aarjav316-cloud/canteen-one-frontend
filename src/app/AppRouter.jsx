import { Navigate, Route, Routes } from "react-router-dom";
import { RequireAuth, RequireRole } from "./RouteGuards";
import StudentLayout from "../layouts/StudentLayout";
import StaffLayout from "../layouts/StaffLayout";
import AdminLayout from "../layouts/AdminLayout";
import StudentHomePage from "../pages/student/StudentHomePage";
import MenuPage from "../pages/student/MenuPage";
import CartPage from "../pages/student/CartPage";
import OrdersPage from "../pages/student/OrdersPage";
import StudentProfilePage from "../pages/student/StudentProfilePage";
import WalletPage from "../pages/student/WalletPage";
import HelpCentrePage from "../pages/student/HelpCentrePage";
import AccountSettingsPage from "../pages/student/AccountSettingsPage";
import KitchenPage from "../pages/staff/KitchenPage";
import StaffOrdersPage from "../pages/staff/StaffOrdersPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import OrdersManagementPage from "../pages/admin/OrdersManagementPage";
import MenuManagementPage from "../pages/admin/MenuManagementPage";
import AdminOrderHistoryPage from "../pages/admin/AdminOrderHistoryPage";
import AdminProfilePage from "../pages/admin/AdminProfilePage";
import AdminAccountSettingsPage from "../pages/admin/AdminAccountSettingsPage";
import AdminHelpCentrePage from "../pages/admin/AdminHelpCentrePage";
import NotFoundPage from "../pages/NotFoundPage";
export default function AppRouter() {
  return (
    <Routes>
      
      <Route element={<StudentLayout />}>
        <Route path="/" element={<StudentHomePage />} />
        <Route path="/student/menu" element={<MenuPage />} />
        <Route path="/student/cart" element={<CartPage />} />
      </Route>
      
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/register" element={<Navigate to="/" replace />} />
      
      <Route element={<RequireAuth />}>
        <Route element={<RequireRole roles={["student"]} />}>
          <Route element={<StudentLayout />}>
            <Route path="/student" element={<StudentHomePage />} />
            <Route path="/student/orders" element={<OrdersPage />} />
            <Route path="/student/profile" element={<StudentProfilePage />} />
            <Route path="/student/wallet" element={<WalletPage />} />
            <Route path="/student/help" element={<HelpCentrePage />} />
            <Route path="/student/settings" element={<AccountSettingsPage />} />
          </Route>
        </Route>
        <Route element={<RequireRole roles={["staff"]} />}>
          <Route element={<StaffLayout />}>
            <Route path="/staff" element={<KitchenPage />} />
            <Route path="/staff/orders" element={<StaffOrdersPage />} />
          </Route>
        </Route>
        <Route element={<RequireRole roles={["admin"]} />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/orders" element={<OrdersManagementPage />} />
          <Route path="/admin/menu" element={<MenuManagementPage />} />
          <Route path="/admin/history" element={<AdminOrderHistoryPage />} />
          <Route path="/admin/profile" element={<AdminProfilePage />} />
          <Route path="/admin/settings" element={<AdminAccountSettingsPage />} />
          <Route path="/admin/help" element={<AdminHelpCentrePage />} />
        </Route>
      </Route>
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
