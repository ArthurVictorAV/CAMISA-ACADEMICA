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
async function lerCarrinhoFirestoreComRetry(uid, tentativas = 3, delayMs = 400) {
  for (let i = 0; i < tentativas; i++) {
    try {
      return await lerCarrinhoFirestore(uid);
    } catch (erro) {
      const ultimaTentativa = i === tentativas - 1;
      // Só faz retry se for especificamente erro de permissão (race condition
      // conhecida do Firebase logo após login); outros erros propagam na hora.
      if (erro.code !== "permission-denied" || ultimaTentativa) {
        throw erro;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

async function salvarCarrinhoFirestore(uid, cart) {
  const ref = doc(db, "carrinhos", uid);
  await setDoc(ref, { cart }, { merge: true });
}

// Cliques seguidos em +/− geram várias mudanças no carrinho. Em vez de gravar
// no Firestore a cada uma, esperamos o usuário parar por um instante e
// gravamos só o estado final.
const ATRASO_GRAVACAO_MS = 500;
let gravacaoPendente = null; // { uid, cart, timer }

function agendarGravacaoFirestore(uid, cart) {
  if (gravacaoPendente) clearTimeout(gravacaoPendente.timer);
  const timer = setTimeout(salvarCarrinhoPendente, ATRASO_GRAVACAO_MS);
  gravacaoPendente = { uid, cart, timer };
}

function descartarGravacaoPendente() {
  if (gravacaoPendente) clearTimeout(gravacaoPendente.timer);
  gravacaoPendente = null;
}

// Grava imediatamente o que estiver aguardando. Deve ser chamada antes do
// logout (depois dele o Firestore recusa a gravação) e quando a aba é
// escondida/fechada.
export async function salvarCarrinhoPendente() {
  if (!gravacaoPendente) return;
  const { uid, cart } = gravacaoPendente;
  descartarGravacaoPendente();

  try {
    await salvarCarrinhoFirestore(uid, cart);
  } catch {
    toast.error("Não foi possível salvar seu carrinho.");
  }
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

    try {
      if (user && !estadoAnterior) {
        // LOGIN (visitante -> logado, ou app abriu já logado)
        const carrinhoLocal = lerCarrinhoLocal();
        const carrinhoFirestore = await lerCarrinhoFirestoreComRetry(user.uid);
        const carrinhoMesclado = mesclarCarrinhos(carrinhoLocal, carrinhoFirestore);

        ignorarProximaGravacao.current = true;
        useCartStore.getState().setCart(carrinhoMesclado);

        await salvarCarrinhoFirestore(user.uid, carrinhoMesclado);
        limparCarrinhoLocal();
      } else if (!user && estadoAnterior) {
        // LOGOUT: zera em memória e no localStorage (Firestore do uid permanece intacto)
        descartarGravacaoPendente();
        ignorarProximaGravacao.current = true;
        useCartStore.getState().setCart([]);
        limparCarrinhoLocal();
      } else if (!user && estadoAnterior === undefined) {
        // Primeiro carregamento, ainda visitante: recupera do localStorage
        ignorarProximaGravacao.current = true;
        useCartStore.getState().setCart(lerCarrinhoLocal());
      }
    } catch (erro) {
      console.error("Erro ao sincronizar carrinho:", erro);
      toast.error("Não foi possível sincronizar seu carrinho. Tente recarregar a página.");
    } finally {
      // Sempre atualiza, mesmo se a sincronização falhou, para não travar
      // o hook num estado inconsistente (achando que ninguém está logado).
      uidAnterior.current = user ? user.uid : null;
      // Avisa as telas (ex.: checkout) que o carrinho já foi carregado.
      useCartStore.setState({ sincronizado: true });
    }
  }

  sincronizar();
}, [user, carregando]);

  // Reage a mudanças no carrinho e persiste no lugar certo
  useEffect(() => {
    const unsubscribe = useCartStore.subscribe((state, anterior) => {
      // Só interessa mudança no carrinho (ignora, por exemplo, "sincronizado").
      if (state.cart === anterior.cart) return;

      if (ignorarProximaGravacao.current) {
        ignorarProximaGravacao.current = false;
        return;
      }

      if (uidAnterior.current) {
        agendarGravacaoFirestore(uidAnterior.current, state.cart);
      } else {
        salvarCarrinhoLocal(state.cart);
      }
    });

    // Aba escondida ou fechando: grava o que estiver pendente.
    const aoMudarVisibilidade = () => {
      if (document.visibilityState === "hidden") salvarCarrinhoPendente();
    };
    document.addEventListener("visibilitychange", aoMudarVisibilidade);

    return () => {
      unsubscribe();
      document.removeEventListener("visibilitychange", aoMudarVisibilidade);
    };
  }, []);
}