import { create } from 'zustand';
import { toast } from 'sonner';

export const useCartStore = create((set, get) => ({
  cart: [],

  addItem: (produto, tamanho, quantidade = 1) => {
    set((state) => {
      const existingItem = state.cart.find(
        (item) => item.id === produto.id && item.tamanho === tamanho
      );

      if (existingItem) {
        return {
          cart: state.cart.map((item) =>
            item.id === produto.id && item.tamanho === tamanho
              ? { ...item, quantity: (item.quantity || 1) + quantidade }
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
            quantity: quantidade,
            cartItemId: `${produto.id}-${tamanho}`,
          },
        ],
      };
    });
  },

  removeItem: (id, tamanho) => {
    set((state) => ({
      cart: state.cart.filter(
        (item) => !(item.id === id && item.tamanho === tamanho)
      ),
    }));
  },

  updateQuantity: (id, tamanho, novaQuantidade) => {
    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === id && item.tamanho === tamanho
          ? { ...item, quantity: Math.max(1, novaQuantidade) }
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