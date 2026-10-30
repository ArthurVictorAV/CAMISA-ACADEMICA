import { useAuth } from "../../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import NotFoundPage from "../../pages/errors/NotFoundPage";

// Só admins veem a página. Visitantes vão para o login; usuários comuns
// recebem a página 404 (não revelamos que a área existe).
export default function AdminRoute({ children }) {
  return (
    <ProtectedRoute>
      <SomenteAdmin>{children}</SomenteAdmin>
    </ProtectedRoute>
  );
}

function SomenteAdmin({ children }) {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <NotFoundPage />;
  return children;
}
