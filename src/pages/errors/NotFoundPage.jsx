import { Link } from "react-router-dom";
import { SearchX } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 border border-amber-400/10 mb-4">
        <SearchX size={28} className="text-slate-500" />
      </div>
      <p className="text-amber-400 font-semibold mb-1">Erro 404</p>
      <h2 className="text-2xl font-bold text-white mb-2">
        Página não encontrada
      </h2>
      <p className="text-slate-400 mb-6 max-w-md">
        O endereço que você acessou não existe ou foi removido.
      </p>
      <Link
        to="/"
        className="rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold py-2.5 px-6 transition-colors"
      >
        Voltar ao catálogo
      </Link>
    </div>
  );
}
