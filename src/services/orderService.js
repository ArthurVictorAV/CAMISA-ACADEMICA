import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";

const QUANTIDADE_MAXIMA_POR_ITEM = 99;

function arredondar(valor) {
  return Math.round(valor * 100) / 100;
}

function primeiraImagem(imagem) {
  if (Array.isArray(imagem)) return imagem[0] ?? "";
  return imagem ?? "";
}

// O carrinho fica no navegador (localStorage/Firestore do próprio usuário),
// então o preço salvo nele não é confiável: pode estar desatualizado ou ter
// sido editado. Aqui buscamos cada produto no Firestore e montamos os itens
// com o preço oficial.
//
// Retorna:
//   itens        -> itens prontos para o pedido, com preço atual
//   total        -> soma calculada com os preços atuais
//   problemas    -> lista do que mudou em relação ao carrinho
//                   ({ tipo: "removido" | "preco" | "tamanho", item, precoAtual? })
export async function validarCarrinho(cart) {
  const idsUnicos = [...new Set(cart.map((item) => item.id))];

  const snapshots = await Promise.all(
    idsUnicos.map((id) => getDoc(doc(db, "produtos", id)))
  );
  const produtos = new Map(
    snapshots
      .filter((snap) => snap.exists())
      .map((snap) => [snap.id, snap.data()])
  );

  const itens = [];
  const problemas = [];

  for (const item of cart) {
    const produto = produtos.get(item.id);

    if (!produto) {
      problemas.push({ tipo: "removido", item });
      continue;
    }

    if (
      Array.isArray(produto.tamanhos) &&
      item.tamanho &&
      !produto.tamanhos.includes(item.tamanho)
    ) {
      problemas.push({ tipo: "tamanho", item });
      continue;
    }

    const precoAtual = Number(produto.preco);
    const precoCarrinho = Number(item.price ?? item.preco);

    if (precoAtual !== precoCarrinho) {
      problemas.push({ tipo: "preco", item, precoAtual });
    }

    const quantidade = Math.min(
      Math.max(1, Math.floor(Number(item.quantity) || 1)),
      QUANTIDADE_MAXIMA_POR_ITEM
    );

    itens.push({
      produtoId: item.id,
      nome: produto.nome,
      preco: precoAtual,
      tamanho: item.tamanho ?? null,
      quantidade,
      imagem: primeiraImagem(produto.imagem),
    });
  }

  const total = arredondar(
    itens.reduce((soma, item) => soma + item.preco * item.quantidade, 0)
  );

  return { itens, total, problemas };
}

// Cria o pedido usando SEMPRE os preços do Firestore.
// Se algo mudou desde que o cliente viu o carrinho (produto removido, preço
// ou tamanho diferente), o pedido não é criado e o erro traz os problemas
// para a tela de checkout mostrar ao cliente.
export async function criarPedido(uid, cart, endereco) {
  if (!cart || cart.length === 0) {
    const erro = new Error("Carrinho vazio.");
    erro.code = "carrinho-vazio";
    throw erro;
  }

  const { itens, total, problemas } = await validarCarrinho(cart);

  if (problemas.length > 0) {
    const erro = new Error("O carrinho está desatualizado.");
    erro.code = "carrinho-desatualizado";
    erro.problemas = problemas;
    throw erro;
  }

  const referencia = await addDoc(collection(db, "pedidos"), {
    userId: uid,
    itens,
    total,
    endereco,
    status: "pendente",
    criadoEm: serverTimestamp(),
  });

  return { id: referencia.id, itens, total };
}

// Status possíveis de um pedido (os mesmos aceitos em firestore.rules) e o
// texto mostrado ao cliente e ao admin.
export const STATUS_PEDIDO = {
  pendente: "Aguardando pagamento",
  pago: "Pagamento confirmado",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

function converterPedido(snap) {
  const dados = snap.data();
  return {
    id: snap.id,
    ...dados,
    criadoEm: dados.criadoEm?.toDate?.() ?? null,
    atualizadoEm: dados.atualizadoEm?.toDate?.() ?? null,
  };
}

// Pedidos do cliente, do mais recente para o mais antigo.
// A ordenação é feita aqui (e não com orderBy no Firestore) para não precisar
// de índice composto; cada cliente tem poucos pedidos.
export async function listarMeusPedidos(uid) {
  const snapshot = await getDocs(
    query(collection(db, "pedidos"), where("userId", "==", uid))
  );
  return snapshot.docs
    .map(converterPedido)
    .sort((a, b) => (b.criadoEm?.getTime() ?? 0) - (a.criadoEm?.getTime() ?? 0));
}

// O cliente só pode cancelar pedidos ainda pendentes (regra no Firestore).
export async function cancelarPedido(pedidoId) {
  await updateDoc(doc(db, "pedidos", pedidoId), {
    status: "cancelado",
    atualizadoEm: serverTimestamp(),
  });
}
