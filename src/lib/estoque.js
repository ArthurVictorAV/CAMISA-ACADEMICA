// O estoque é um número por produto (campo "estoque"), somando todos os
// tamanhos. Produtos sem esse campo são tratados como estoque ilimitado.
export function estoqueDisponivel(produto) {
  return typeof produto?.estoque === "number"
    ? Math.max(0, Math.floor(produto.estoque))
    : Infinity;
}

// Quantas unidades de um produto já estão no carrinho (todos os tamanhos).
// Passe "ignorarTamanho" para não contar a linha que está sendo alterada.
export function quantidadeNoCarrinho(cart, produtoId, ignorarTamanho) {
  return cart
    .filter((item) => item.id === produtoId && item.tamanho !== ignorarTamanho)
    .reduce((soma, item) => soma + (item.quantity || 1), 0);
}
