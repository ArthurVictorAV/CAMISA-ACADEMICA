import { Link } from "react-router-dom";
import { Construction } from "lucide-react";

// Página provisória: o checkout completo (endereço, resumo e criação do
// pedido via orderService.criarPedido) será feito no item 13.
export default function CheckoutPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 border border-amber-400/10 mb-4">
        <Construction size={28} className="text-slate-500" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">
        Checkout em construção
      </h2>
      <p className="text-slate-400 mb-6 max-w-md">
        Em breve você poderá finalizar sua compra por aqui.
      </p>
      <Link
        to="/carrinho"
        className="rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold py-2.5 px-6 transition-colors"
      >
        Voltar ao carrinho
      </Link>
    </div>
  );
}
