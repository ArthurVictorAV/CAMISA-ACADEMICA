import { create } from 'zustand';
import { toast } from 'sonner';

export const useCartStore = create((set, get) => ({
  // Estado inicial: lista de itens vazia
  cart: [],

  // Adicionar item ao carrinho
  addItem: (product) => {
    const currentCart = get().cart;
    // Verifica se o item já está no carrinho
    const existingIndex = currentCart.findIndex((item) => item.id === product.id);

    if (existingIndex > -1) {
      // Se já existe, apenas aumenta a quantidade
      const updatedCart = [...currentCart];
      updatedCart[existingIndex].quantity += 1;
      set({ cart: updatedCart });
    } else {
      // Se é novo, adiciona com quantidade 1
      set({ cart: [...currentCart, { ...product, quantity: 1 }] });
    }

    toast.success(`${product.title || product.nome || 'Item'} adicionado ao carrinho`);
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