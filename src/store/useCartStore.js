import { create } from 'zustand';
import { toast } from 'sonner';

export const useCartStore = create((set, get) => ({
  // Estado inicial: lista de itens vazia
  cart: [],

  // Adicionar item ao carrinho
  addItem: (produto, tamanho, quantidade = 1) => {
  set((state) => {
    // Chave única = id do produto + tamanho escolhido
    const existingItem = state.cart.find(
      (item) => item.id === produto.id && item.tamanho === tamanho
    );

    if (existingItem) {
      // Já existe esse produto NESSE tamanho -> só incrementa quantidade
      return {
        cart: state.cart.map((item) =>
          item.id === produto.id && item.tamanho === tamanho
            ? { ...item, quantity: (item.quantity || 1) + quantidade }
            : item
        ),
      };
    }

    // Produto novo OU mesmo produto em tamanho diferente -> nova entrada
    return {
      cart: [
        ...state.cart,
        {
          ...produto,
          tamanho,
          quantity: quantidade,
          cartItemId: `${produto.id}-${tamanho}`, // útil para key no React e remoção
        },
      ],
    };
  });
},
  // Remover um item pelo ID
  removeItem: (productId) => {
    const item = get().cart.find((i) => i.id === productId);
    set({
      cart: get().cart.filter((item) => item.id !== productId),
    });
    if (item) {
      toast(`${item.title || item.nome || 'Item'} removido do carrinho`, { icon: '🗑️' });
    }
  },

  // Alterar a quantidade de um item (+1 ou -1)
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set({
      cart: get().cart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      ),
    });
  },

  // Limpar todo o carrinho
  clearCart: () => {
    set({ cart: [] });
    toast('Carrinho esvaziado', { icon: '🧹' });
  },

  // Calcular o total acumulado
  getTotal: () => {
    return get().cart.reduce((total, item) => total + item.price * item.quantity, 0);
  },
}));