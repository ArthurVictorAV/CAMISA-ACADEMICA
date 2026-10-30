import { useCallback, useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { getProdutos } from "../../services/productsServices";
import ProductCard from "./ProductCard";

export default function CatalogPage() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);

  const carregarProdutos = useCallback(() => {
    setLoading(true);
    setErro(false);
    getProdutos()
      .then((data) => setProdutos(data || []))
      .catch((error) => {
        console.error("Erro ao carregar produtos:", error);
        setErro(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    carregarProdutos();
  }, [carregarProdutos]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-slate-400 font-medium text-lg">
          Carregando produtos...
        </p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 border border-red-500/20 mb-4">
          <AlertTriangle size={28} className="text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Não foi possível carregar os produtos
        </h2>
        <p className="text-slate-400 mb-6 max-w-md">
          Verifique sua conexão com a internet e tente novamente.
        </p>
        <button
          onClick={carregarProdutos}
          className="rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold py-2.5 px-6 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8 text-center">
        Catálogo de Produtos
      </h1>

      {produtos.length === 0 ? (
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