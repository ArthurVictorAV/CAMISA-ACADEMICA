import { Routes, Route } from "react-router-dom";
import CatalogPage from "../pages/catalog/CatalogPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import CartPage from "../pages/orders/CartPage";
import ProfilePage from "../pages/profile/ProfilePage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<CatalogPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />
      <Route path="/carrinho" element={<CartPage />} />
      <Route path="/perfil" element={<ProfilePage />} />
    </Routes>
  );
}