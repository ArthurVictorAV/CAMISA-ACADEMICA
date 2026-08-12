import { useEffect, useState } from "react";
import { getProdutos } from "../../services/productsServices";
import ProductCard from "./ProductCard";

export default function CatalogPage() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProdutos()
      .then((data) => setProdutos(data || []))
      .catch((error) => console.error("Erro ao carregar produtos:", error))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-slate-400 font-medium text-lg">
          Carregando produtos...
        </p>
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