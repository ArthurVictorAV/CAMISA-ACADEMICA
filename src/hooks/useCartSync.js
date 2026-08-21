import { useEffect, useRef } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { useCartStore } from "../store/useCartStore";

const LOCAL_STORAGE_KEY = "carrinho_visitante";

function lerCarrinhoLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function salvarCarrinhoLocal(cart) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // localStorage indisponível (modo privado, storage cheio, etc.)
  }
}

function limparCarrinhoLocal() {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch {
    // ignora
  }
}

async function lerCarrinhoFirestore(uid) {
  const ref = doc(db, "carrinhos", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data().cart || [] : [];
}

async function salvarCarrinhoFirestore(uid, cart) {
  const ref = doc(db, "carrinhos", uid);
  await setDoc(ref, { cart }, { merge: true });
}

function mesclarCarrinhos(carrinhoA, carrinhoB) {
  const mapa = new Map();

  for (const item of [...carrinhoA, ...carrinhoB]) {
    const chave = item.cartItemId || `${item.id}-${item.tamanho}`;
    const existente = mapa.get(chave);

    mapa.set(chave, existente
      ? { ...existente, quantity: (existente.quantity || 1) + (item.quantity || 1) }
      : { ...item, cartItemId: chave }
    );
  }

  return Array.from(mapa.values());
}

export function useCartSync() {
  const { user, carregando } = useAuth();
  const uidAnterior = useRef(undefined); // undefined = ainda não resolvido
  const ignorarProximaGravacao = useRef(false);

  // Reage a login / logout / carregamento inicial
  useEffect(() => {
    if (carregando) return;

    async function sincronizar() {
      const estadoAnterior = uidAnterior.current;

      if (user && !estadoAnterior) {
        // LOGIN (visitante -> logado, ou app abriu já logado)
        const carrinhoLocal = lerCarrinhoLocal();
        const carrinhoFirestore = await lerCarrinhoFirestore(user.uid);
        const carrinhoMesclado = mesclarCarrinhos(carrinhoLocal, carrinhoFirestore);

        ignorarProximaGravacao.current = true;
        useCartStore.getState().setCart(carrinhoMesclado);

        await salvarCarrinhoFirestore(user.uid, carrinhoMesclado);
        limparCarrinhoLocal();
      } else if (!user && estadoAnterior) {
        // LOGOUT: zera em memória e no localStorage (Firestore do uid permanece intacto)
        ignorarProximaGravacao.current = true;
        useCartStore.getState().setCart([]);
        limparCarrinhoLocal();
      } else if (!user && estadoAnterior === undefined) {
        // Primeiro carregamento, ainda visitante: recupera do localStorage
        ignorarProximaGravacao.current = true;
        useCartStore.getState().setCart(lerCarrinhoLocal());
      }

      uidAnterior.current = user ? user.uid : null;
    }

    sincronizar();
  }, [user, carregando]);

  // Reage a mudanças no carrinho e persiste no lugar certo
  useEffect(() => {
    const unsubscribe = useCartStore.subscribe((state) => {
      if (ignorarProximaGravacao.current) {
        ignorarProximaGravacao.current = false;
        return;
      }

      if (uidAnterior.current) {
        salvarCarrinhoFirestore(uidAnterior.current, state.cart).catch(() => {
          toast.error("Não foi possível salvar seu carrinho.");
        });
      } else {
        salvarCarrinhoLocal(state.cart);
      }
    });

    return unsubscribe;
  }, []);
}