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
        <p className="text-gray-500 font-medium text-lg">Carregando produtos...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
        Catálogo de Documentos Estudantis
      </h1>

      {produtos.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          Nenhum produto cadastrado até o momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {produtos.map((produto) => (
            <ProductCard key={produto.id} produto={produto} />
          ))}
        </div>
      )}
    </div>
  );
}