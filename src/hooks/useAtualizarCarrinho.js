import { useEffect } from "react";
import { toast } from "sonner";
import { validarCarrinho } from "../services/orderService";
import { useCartStore } from "../store/useCartStore";

const formatarPreco = (valor) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);

const chaveDoItem = (id, tamanho) => `${id}-${tamanho ?? null}`;

// O carrinho guarda uma cópia de nome, preço e imagem de quando o produto foi
// adicionado. Ao abrir o carrinho, conferimos com o Firestore e:
//   - removemos produtos que não existem mais ou tamanhos que saíram de linha;
//   - atualizamos preço, nome e imagem, avisando o cliente se o preço mudou.
export function useAtualizarCarrinho() {
  const cart = useCartStore((state) => state.cart);

  // Só revalida quando muda o conjunto de produtos/tamanhos (não a cada +/−).
  const chaves = cart.map((item) => chaveDoItem(item.id, item.tamanho)).sort().join("|");

  useEffect(() => {
    if (!chaves) return;
    let cancelado = false;

    async function atualizar() {
      let resultado;
      try {
        resultado = await validarCarrinho(useCartStore.getState().cart);
      } catch (erro) {
        // Sem conexão, por exemplo. O checkout valida de novo antes do pedido.
        console.warn("Não foi possível conferir o carrinho:", erro);
        return;
      }
      if (cancelado) return;

      const { itens, problemas } = resultado;
      const atuais = new Map(itens.map((item) => [chaveDoItem(item.produtoId, item.tamanho), item]));
      const removidos = new Set(
        problemas
          .filter((p) => p.tipo === "removido" || p.tipo === "tamanho")
          .map((p) => chaveDoItem(p.item.id, p.item.tamanho))
      );

      // Aplica sobre o estado atual da store (o usuário pode ter mexido no
      // carrinho enquanto a consulta estava em andamento).
      const carrinhoAtual = useCartStore.getState().cart;
      let mudou = false;
      const novoCarrinho = carrinhoAtual
        .filter((item) => {
          const remover = removidos.has(chaveDoItem(item.id, item.tamanho));
          if (remover) mudou = true;
          return !remover;
        })
        .map((item) => {
          const atual = atuais.get(chaveDoItem(item.id, item.tamanho));
          if (!atual) return item;
          const imagem = atual.imagem || item.image;
          if (item.price === atual.preco && item.title === atual.nome && item.image === imagem) {
            return item;
          }
          mudou = true;
          return { ...item, price: atual.preco, title: atual.nome, image: imagem };
        });

      if (mudou) useCartStore.getState().setCart(novoCarrinho);

      for (const problema of problemas) {
        const nome = problema.item.title || problema.item.nome || "Um produto";
        if (problema.tipo === "removido") {
          toast.warning(`${nome} não está mais disponível e foi removido do carrinho.`);
        } else if (problema.tipo === "tamanho") {
          toast.warning(`${nome} (tamanho ${problema.item.tamanho}) não está mais disponível e foi removido do carrinho.`);
        } else if (problema.tipo === "preco") {
          toast.info(`O preço de ${nome} mudou para ${formatarPreco(problema.precoAtual)}.`);
        }
      }
    }

    atualizar();
    return () => {
      cancelado = true;
    };
  }, [chaves]);
}
