import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { getProdutos } from "../../services/productsServices";
import ProductCard from "./ProductCard";
import ProductGridSkeleton from "../../components/ui/ProductGridSkeleton";

export default function CatalogPage() {
  const {
    data: produtos,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["produtos"],
    queryFn: getProdutos,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8 text-center">
        Catálogo de Produtos
      </h1>

      {isLoading ? (
        <ProductGridSkeleton />
      ) : isError ? (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-slate-400">
            Não foi possível carregar os produtos. Tente novamente.
          </p>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-300 disabled:opacity-60"
          >
            <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
            Tentar novamente
          </button>
        </div>
      ) : produtos.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          Nenhum produto cadastrado até o momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {produtos.map((produto) => (
            <ProductCard key={produto.id || produto.nome} produto={produto} />
          ))}
        </div>
      )}
    </div>
  );
}
