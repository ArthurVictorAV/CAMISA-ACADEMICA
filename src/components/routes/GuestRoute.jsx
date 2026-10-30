import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { destinoAposLogin } from "../../routes/destinoAposLogin";

// Páginas só para visitantes (login, cadastro). Quem já está logado é levado
// para onde ia (state.from) ou para o catálogo.
export default function GuestRoute({ children }) {
  const { user, carregando } = useAuth();
  const location = useLocation();

  if (carregando) return null;
  if (user) return <Navigate to={destinoAposLogin(location)} replace />;

  return children;
}
