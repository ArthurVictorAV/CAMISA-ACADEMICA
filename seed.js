// seed.js — cadastra produtos de EXEMPLO no Firestore.
//
// Uso: node seed.js
// Precisa do arquivo serviceAccountKey.json (Firebase Console > Configurações
// do projeto > Contas de serviço > Gerar nova chave privada). Ele está no
// .gitignore: nunca faça commit dele.
//
// Os produtos usam IDs fixos começando com "exemplo-", então rodar o script
// de novo só atualiza esses produtos (não cria duplicados). Para apagá-los,
// use o painel admin ou o console do Firebase.
import { readFileSync } from "fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const serviceAccount = JSON.parse(
  readFileSync("./serviceAccountKey.json", "utf-8")
);

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

// Fotos de exemplo (picsum.photos): troque pelas fotos reais no painel admin.
const foto = (semente) => `https://picsum.photos/seed/${semente}/800/1000`;

const produtosMock = [
  {
    id: "exemplo-camisa-medicina",
    nome: "Camisa Medicina",
    preco: 79.9,
    precoOriginal: 99.9,
    descricao: "Camisa 100% algodão com o brasão do curso de Medicina bordado no peito.",
    categoria: "Saúde",
    tamanhos: ["P", "M", "G", "GG"],
    destaque: "Mais vendido",
    imagem: [foto("medicina-1"), foto("medicina-2")],
  },
  {
    id: "exemplo-camisa-enfermagem",
    nome: "Camisa Enfermagem",
    preco: 69.9,
    descricao: "Camisa de malha leve com estampa do curso de Enfermagem.",
    categoria: "Saúde",
    tamanhos: ["PP", "P", "M", "G", "GG"],
    imagem: [foto("enfermagem")],
  },
  {
    id: "exemplo-camisa-direito",
    nome: "Camisa Direito",
    preco: 74.9,
    descricao: "Camisa com a balança da Justiça e o nome do curso nas costas.",
    categoria: "Humanas",
    tamanhos: ["P", "M", "G", "GG", "XG"],
    destaque: "Novo",
    imagem: [foto("direito")],
  },
  {
    id: "exemplo-camisa-psicologia",
    nome: "Camisa Psicologia",
    preco: 69.9,
    descricao: "Camisa com o símbolo Psi estampado em silk.",
    categoria: "Humanas",
    tamanhos: ["PP", "P", "M", "G", "GG"],
    imagem: [foto("psicologia")],
  },
  {
    id: "exemplo-camisa-engenharia",
    nome: "Camisa Engenharia",
    preco: 74.9,
    descricao: "Camisa com engrenagem e o nome do curso — personalize com sua habilitação.",
    categoria: "Exatas",
    tamanhos: ["P", "M", "G", "GG", "XG"],
    imagem: [foto("engenharia-1"), foto("engenharia-2")],
  },
  {
    id: "exemplo-moletom-computacao",
    nome: "Moletom Ciência da Computação",
    preco: 149.9,
    descricao: "Moletom flanelado com capuz e estampa do curso de Computação.",
    categoria: "Exatas",
    tamanhos: ["P", "M", "G", "GG"],
    imagem: [foto("computacao")],
  },
];

async function seed() {
  console.log(`Projeto: ${serviceAccount.project_id}`);

  const batch = db.batch();
  for (const { id, ...produto } of produtosMock) {
    batch.set(db.collection("produtos").doc(id), {
      ...produto,
      precoOriginal: produto.precoOriginal ?? null,
      destaque: produto.destaque ?? null,
      atualizadoEm: FieldValue.serverTimestamp(),
    });
  }
  await batch.commit();
  console.log(`${produtosMock.length} produtos de exemplo gravados (IDs "exemplo-...").`);
}

seed().catch((erro) => {
  console.error("Erro ao gravar produtos:", erro);
  process.exit(1);
});
