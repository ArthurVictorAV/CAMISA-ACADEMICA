import { useState } from "react";
import { useCartStore } from "../store/useCartStore";

export const TAMANHOS_PADRAO = ["P", "M", "G", "GG"];

// O campo "imagem" pode ser uma string única ou uma lista.
export function galeriaDoProduto(produto) {
  const { imagem } = produto;
  if (Array.isArray(imagem)) return imagem.length > 0 ? imagem : ["/placeholder.png"];
  return [imagem || "/placeholder.png"];
}

// Estado e ação de "adicionar ao carrinho" compartilhados pelo card do
// catálogo, pelo modal de detalhes e pela página do produto.
export function useAdicionarAoCarrinho(produto) {
  const addItem = useCartStore((state) => state.addItem);
  const tamanhos = produto.tamanhos ?? TAMANHOS_PADRAO;
  const galeria = galeriaDoProduto(produto);

  const [tamanhoSelecionado, setTamanhoSelecionado] = useState(tamanhos[0]);
  const [adicionado, setAdicionado] = useState(false);

  const adicionar = (e) => {
    if (e) e.stopPropagation();

    // addItem espera 3 argumentos separados: (produto, tamanho, quantidade)
    addItem(
      {
        id: produto.id,
        title: produto.nome,
        price: produto.preco,
        image: galeria[0],
      },
      tamanhoSelecionado,
      1
    );

    // Feedback visual do botão
    setAdicionado(true);
    setTimeout(() => setAdicionado(false), 1500);
  };

  return { tamanhos, galeria, tamanhoSelecionado, setTamanhoSelecionado, adicionado, adicionar };
}
