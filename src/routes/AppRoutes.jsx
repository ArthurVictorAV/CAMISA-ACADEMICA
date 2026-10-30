import { Routes, Route } from "react-router-dom";
import CatalogPage from "../pages/catalog/CatalogPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import CartPage from "../pages/orders/CartPage";
import ProfilePage from "../pages/profile/ProfilePage";
import CheckoutPage from "../pages/orders/CheckoutPage";
import NotFoundPage from "../pages/errors/NotFoundPage";
import ProtectedRoute from "../components/routes/ProtectedRoute";
import AdminRoute from "../components/routes/AdminRoute";
import AdminDashboard from "../pages/admin/AdminDashboard";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<CatalogPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />
      <Route path="/carrinho" element={<CartPage />} />
      <Route path="/perfil" element={<ProfilePage />} />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}