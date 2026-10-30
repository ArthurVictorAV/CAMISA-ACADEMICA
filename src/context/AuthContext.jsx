import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

const AuthContext = createContext(null);

// Admin = existe o documento admins/{uid} (ver firestore.rules).
// Isso só controla o que aparece na tela; quem protege os dados são as regras.
async function verificarAdmin(uid, tentativas = 3) {
  for (let i = 0; i < tentativas; i++) {
    try {
      const snap = await getDoc(doc(db, "admins", uid));
      return snap.exists();
    } catch (erro) {
      // Logo após o login o Firestore às vezes ainda não recebeu o token e
      // responde permission-denied; tenta de novo rapidamente.
      if (erro.code !== "permission-denied" || i === tentativas - 1) {
        console.error("Erro ao verificar admin:", erro);
        return false;
      }
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  }
  return false;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      const admin = currentUser ? await verificarAdmin(currentUser.uid) : false;
      setUser(currentUser);
      setIsAdmin(admin);
      setCarregando(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAdmin, carregando }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
