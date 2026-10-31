// criar-admin.js — torna uma conta do site admin (ou remove/lista admins).
//
// Uso:
//   node criar-admin.js email@exemplo.com            -> torna admin
//   node criar-admin.js --remover email@exemplo.com  -> remove o admin
//   node criar-admin.js --listar                     -> lista os admins
//
// Precisa do serviceAccountKey.json na raiz (o mesmo do seed.js). Ele está
// no .gitignore: nunca faça commit dele.
//
// A conta precisa já existir (cadastrada pelo site). Depois de rodar, saia
// e entre de novo no site para o link "Admin" aparecer.
import { readFileSync } from "fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const serviceAccount = JSON.parse(
  readFileSync("./serviceAccountKey.json", "utf-8")
);

initializeApp({ credential: cert(serviceAccount) });

const auth = getAuth();
const db = getFirestore();

async function buscarConta(email) {
  try {
    return await auth.getUserByEmail(email);
  } catch (erro) {
    if (erro.code === "auth/user-not-found") {
      console.error(`Nenhuma conta com o e-mail ${email}. Cadastre-se primeiro pelo site.`);
      process.exit(1);
    }
    throw erro;
  }
}

async function tornarAdmin(email) {
  const conta = await buscarConta(email);
  await db.collection("admins").doc(conta.uid).set({
    nome: conta.displayName ?? "",
    email: conta.email,
    criadoEm: FieldValue.serverTimestamp(),
  });
  console.log(`✔ ${conta.email} agora é admin (UID ${conta.uid}).`);
  console.log("  Saia e entre de novo no site para ver o link Admin.");
}

async function removerAdmin(email) {
  const conta = await buscarConta(email);
  await db.collection("admins").doc(conta.uid).delete();
  console.log(`✔ ${conta.email} não é mais admin.`);
}

async function listarAdmins() {
  const snapshot = await db.collection("admins").get();
  if (snapshot.empty) {
    console.log("Nenhum admin cadastrado.");
    return;
  }
  for (const documento of snapshot.docs) {
    let descricao;
    try {
      const conta = await auth.getUser(documento.id);
      descricao = conta.email;
    } catch {
      // Ajuda a achar documentos criados com UID errado (espaço, cópia
      // incompleta etc.).
      descricao = "⚠ UID não corresponde a nenhuma conta";
    }
    console.log(`- "${documento.id}" → ${descricao}`);
  }
}

const args = process.argv.slice(2);
console.log(`Projeto: ${serviceAccount.project_id}`);

try {
  if (args[0] === "--listar") await listarAdmins();
  else if (args[0] === "--remover" && args[1]) await removerAdmin(args[1].trim());
  else if (args[0] && !args[0].startsWith("--")) await tornarAdmin(args[0].trim());
  else {
    console.log("Uso: node criar-admin.js email@exemplo.com | --remover email | --listar");
    process.exit(1);
  }
} catch (erro) {
  console.error("Erro:", erro.message);
  process.exit(1);
}
