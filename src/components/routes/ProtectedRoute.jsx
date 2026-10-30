import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Só renderiza a página para usuários logados. Visitantes vão para o login,
// levando o endereço atual em state.from para voltar depois de entrar.
export default function ProtectedRoute({ children }) {
  const { user, carregando } = useAuth();
  const location = useLocation();

  if (carregando) return null;

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  return children;
}
