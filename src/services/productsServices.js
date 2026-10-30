import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";

export async function getProdutos() {
  const snapshot = await getDocs(collection(db, "produtos"));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

// Um produto pelo ID, ou null se não existir.
export async function getProduto(id) {
  const snap = await getDoc(doc(db, "produtos", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// As funções abaixo só funcionam para admins (regra em firestore.rules).

export async function criarProduto(dados) {
  const referencia = await addDoc(collection(db, "produtos"), {
    ...dados,
    criadoEm: serverTimestamp(),
  });
  return referencia.id;
}

export async function atualizarProduto(id, dados) {
  await updateDoc(doc(db, "produtos", id), {
    ...dados,
    atualizadoEm: serverTimestamp(),
  });
}

export async function excluirProduto(id) {
  await deleteDoc(doc(db, "produtos", id));
}
