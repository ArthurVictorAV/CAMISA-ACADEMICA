import { Routes, Route } from "react-router-dom";
import CatalogPage from "../pages/catalog/CatalogPage";
import ProductPage from "../pages/catalog/ProductPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import CartPage from "../pages/orders/CartPage";
import ProfilePage from "../pages/profile/ProfilePage";
import CheckoutPage from "../pages/orders/CheckoutPage";
import NotFoundPage from "../pages/errors/NotFoundPage";
import ProtectedRoute from "../components/routes/ProtectedRoute";
import AdminRoute from "../components/routes/AdminRoute";
import GuestRoute from "../components/routes/GuestRoute";
import AdminDashboard from "../pages/admin/AdminDashboard";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<CatalogPage />} />
      <Route path="/produto/:id" element={<ProductPage />} />
      <Route path="/carrinho" element={<CartPage />} />

      {/* Só para visitantes */}
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/cadastro"
        element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        }
      />

      <Route
        path="/recuperar-senha"
        element={
          <GuestRoute>
            <ForgotPasswordPage />
          </GuestRoute>
        }
      />

      {/* Exigem login */}
      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        }
      />

      {/* Exige login + conta em admins */}
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