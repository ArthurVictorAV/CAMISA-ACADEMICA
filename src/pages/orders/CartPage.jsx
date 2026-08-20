import { Link } from "react-router-dom";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCartStore } from "../../store/useCartStore";

export default function CartPage() {
  const { cart, removeItem, updateQuantity, clearCart, getTotal } =
    useCartStore();

  const total = getTotal();

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 border border-amber-400/10 mb-4">
          <ShoppingBag size={28} className="text-slate-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Seu carrinho está vazio
        </h2>
        <p className="text-slate-400 mb-6 max-w-md">
          Você ainda não adicionou nenhum item ao seu carrinho.
        </p>
        <Link
          to="/"
          className="rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold py-2.5 px-6 transition-colors"
        >
          Ver produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">
        Carrinho de compras
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row items-center gap-4 rounded-xl border border-amber-400/10 bg-slate-900 p-4"
            >
              {item.image && (
                <img
                  src={item.image}
                  alt={item.title || item.nome}
                  className="h-20 w-20 shrink-0 rounded-lg object-cover border border-slate-800"
                />
              )}

              <div className="flex-1 text-center sm:text-left min-w-0">
                <h3 className="font-semibold text-white truncate">
                  {item.title || item.nome || "Item sem nome"}
                </h3>
                {item.tamanho && (
                  <p className="text-slate-500 text-xs mt-0.5">
                    Tamanho: {item.tamanho}
                  </p>
                )}
                <p className="text-slate-400 text-sm mt-1">
                  R${" "}
                  {Number(item.price || item.preco || 0)
                    .toFixed(2)
                    .replace(".", ",")}{" "}
                  un.
                </p>
              </div>

              <div className="flex items-center gap-4 sm:gap-6">
                <div className="flex items-center rounded-lg border border-slate-700 overflow-hidden">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="flex h-8 w-8 items-center justify-center text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    aria-label="Diminuir quantidade"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold text-white">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="flex h-8 w-8 items-center justify-center text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    aria-label="Aumentar quantidade"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <span className="font-bold text-amber-400 whitespace-nowrap">
                  R${" "}
                  {((item.price || item.preco || 0) * item.quantity)
                    .toFixed(2)
                    .replace(".", ",")}
                </span>

                <button
                  onClick={() => removeItem(item.id)}
                  className="text-slate-500 hover:text-red-400 transition-colors"
                  aria-label="Remover item"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={clearCart}
            className="text-sm text-slate-500 hover:text-red-400 transition-colors underline"
          >
            Esvaziar carrinho
          </button>
        </div>

        <div className="bg-slate-900 border border-amber-400/10 rounded-xl p-6 h-fit space-y-4">
          <h2 className="text-lg font-bold text-white">Resumo do pedido</h2>

          <div className="space-y-2 text-sm border-b border-slate-800 pb-4">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span>R$ {total.toFixed(2).replace(".", ",")}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Frete</span>
              <span className="text-emerald-400 font-medium">Grátis</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-lg font-bold text-white">
            <span>Total</span>
            <span className="text-xl text-amber-400">
              R$ {total.toFixed(2).replace(".", ",")}
            </span>
          </div>

          <Link
            to="/checkout"
            className="block w-full text-center rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold py-3 transition-colors"
          >
            Avançar para checkout
          </Link>
        </div>
      </div>
    </div>
  );
}