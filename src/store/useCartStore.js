import { create } from 'zustand';
import { toast } from 'sonner';
import { estoqueDisponivel, quantidadeNoCarrinho } from '../lib/estoque';

function avisarLimite(limite) {
  toast.error(
    limite <= 0
      ? 'Produto esgotado.'
      : `Só temos ${limite} unidade(s) deste produto em estoque.`
  );
}

export const useCartStore = create((set, get) => ({
  cart: [],

  // Retorna quantas unidades foram realmente adicionadas (0 se não havia
  // estoque suficiente).
  addItem: (produto, tamanho, quantidade = 1) => {
    const limite = estoqueDisponivel(produto);
    const adicionar = Math.min(
      quantidade,
      limite - quantidadeNoCarrinho(get().cart, produto.id)
    );

    if (adicionar <= 0) {
      avisarLimite(limite);
      return 0;
    }

    set((state) => {
      const existingItem = state.cart.find(
        (item) => item.id === produto.id && item.tamanho === tamanho
      );

      if (existingItem) {
        return {
          cart: state.cart.map((item) =>
            item.id === produto.id && item.tamanho === tamanho
              ? { ...item, estoque: produto.estoque, quantity: (item.quantity || 1) + adicionar }
              : item
          ),
        };
      }

      return {
        cart: [
          ...state.cart,
          {
            ...produto,
            tamanho,
            quantity: adicionar,
            cartItemId: `${produto.id}-${tamanho}`,
          },
        ],
      };
    });

    if (adicionar < quantidade) avisarLimite(limite);
    return adicionar;
  },

  removeItem: (id, tamanho) => {
    set((state) => ({
      cart: state.cart.filter(
        (item) => !(item.id === id && item.tamanho === tamanho)
      ),
    }));
  },

  updateQuantity: (id, tamanho, novaQuantidade) => {
    const { cart } = get();
    const linha = cart.find((item) => item.id === id && item.tamanho === tamanho);
    if (!linha) return;

    const limite = estoqueDisponivel(linha);
    const maximo = limite - quantidadeNoCarrinho(cart, id, tamanho);
    const quantidade = Math.max(1, Math.min(novaQuantidade, maximo));

    if (novaQuantidade > quantidade) avisarLimite(limite);
    if (quantidade === linha.quantity) return;

    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === id && item.tamanho === tamanho
          ? { ...item, quantity: quantidade }
          : item
      ),
    }));
  },

  clearCart: () => {
    set({ cart: [] });
    toast('Carrinho esvaziado', { icon: '🧹' });
  },

  // NOVO: substitui o carrinho inteiro sem toast — usado pela sincronização
  setCart: (novoCarrinho) => set({ cart: novoCarrinho }),

  getTotal: () => {
    return get().cart.reduce(
      (total, item) => total + Number(item.price || item.preco || 0) * item.quantity,
      0
    );
  },
  
}));