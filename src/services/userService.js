import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

export async function registrar({ nome, email, senha }) {
  const credencial = await createUserWithEmailAndPassword(auth, email, senha);
  const user = credencial.user;

  await updateProfile(user, { displayName: nome });

  await setDoc(doc(db, "usuarios", user.uid), {
    nome,
    email,
    criadoEm: new Date().toISOString(),
  });

  return user;
}

export async function login({ email, senha }) {
  const credencial = await signInWithEmailAndPassword(auth, email, senha);
  return credencial.user;
}

export async function logout() {
  await signOut(auth);
}

export async function buscarPerfil(uid) {
  const referencia = doc(db, "usuarios", uid);
  const snapshot = await getDoc(referencia);

  if (!snapshot.exists()) {
    return null;
  }

  return { id: snapshot.id, ...snapshot.data() };
}

export async function atualizarPerfil(uid, { nome, telefone }) {
  const referencia = doc(db, "usuarios", uid);

  await updateDoc(referencia, {
    nome,
    telefone: telefone ?? "",
    atualizadoEm: new Date().toISOString(),
  });

  if (auth.currentUser && auth.currentUser.displayName !== nome) {
    await updateProfile(auth.currentUser, { displayName: nome });
  }
}

export async function alterarSenha(senhaAtual, novaSenha) {
  const user = auth.currentUser;
  const credencial = EmailAuthProvider.credential(user.email, senhaAtual);

  await reauthenticateWithCredential(user, credencial);
  await updatePassword(user, novaSenha);
}