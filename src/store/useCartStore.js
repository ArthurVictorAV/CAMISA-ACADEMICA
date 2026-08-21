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

  // Limpar todo o carrinho
  clearCart: () => {
    set({ cart: [] });
    toast('Carrinho esvaziado', { icon: '🧹' });
  },

  // Calcular o total acumulado
  getTotal: () => {
  return get().cart.reduce(
    (total, item) => total + Number(item.price || item.preco || 0) * item.quantity,
      0
    );
  },
}));