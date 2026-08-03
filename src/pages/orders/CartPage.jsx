import { useCartStore } from '../../context/useCartStore';
import { Link } from 'react-router-dom';

export default function CartPage() {
  const { cart, removeItem, updateQuantity, clearCart, getTotal } = useCartStore();

  const total = getTotal();

  // Se o carrinho estiver vazio
  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Seu carrinho está vazio</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          Você ainda não adicionou nenhuma carteirinha ou item ao seu carrinho.
        </p>
        <Link
          to="/"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors shadow-sm"
        >
          Ver Produtos / Serviços
        </Link>
      </div>
    );
  }

  // Se houver itens no carrinho
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Carrinho de Compras</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista dos Itens */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-200 gap-4"
            >
              {/* Imagem (se houver) */}
              {item.image && (
                <img
                  src={item.image}
                  alt={item.title || item.nome}
                  className="w-20 h-20 object-cover rounded-lg border border-gray-100"
                />
              )}

              {/* Informações do Item */}
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-semibold text-gray-800 text-lg">
                  {item.title || item.nome || 'Item sem nome'}
                </h3>
                <p className="text-gray-500 text-sm">
                  R$ {Number(item.price || item.preco || 0).toFixed(2).replace('.', ',')} un.
                </p>
              </div>

              {/* Controles de Quantidade */}
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold transition-colors"
                >
                  -
                </button>
                <span className="px-4 py-1 font-semibold text-gray-800">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold transition-colors"
                >
                  +
                </button>
              </div>

              {/* Subtotal do Item e Botão de Remover */}
              <div className="flex items-center gap-4">
                <span className="font-bold text-gray-900">
                  R$ {((item.price || item.preco || 0) * item.quantity).toFixed(2).replace('.', ',')}
                </span>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={clearCart}
              className="text-sm text-gray-500 hover:text-red-600 transition-colors underline"
            >
              Esvaziar carrinho
            </button>
          </div>
        </div>

        {/* Resumo do Pedido */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 h-fit space-y-4">
          <h2 className="text-xl font-bold text-gray-800">Resumo do Pedido</h2>

          <div className="space-y-2 text-sm border-b border-gray-200 pb-4">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>R$ {total.toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Taxa de Emissão</span>
              <span className="text-green-600 font-medium">Grátis</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-lg font-bold text-gray-900">
            <span>Total</span>
            <span className="text-xl text-blue-600">
              R$ {total.toFixed(2).replace('.', ',')}
            </span>
          </div>

          <Link
            to="/checkout"
            className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md transition-colors"
          >
            Avançar para Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}