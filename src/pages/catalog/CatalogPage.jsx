import { useEffect, useState } from "react";
import { getProdutos } from "../../services/productsServices";
import ProductCard from "./ProductCard";

export default function CatalogPage() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProdutos()
      .then(setProdutos)
      .finally(() => setLoading(false));
  }, []);

  const handleAdicionarCarrinho = (produtoComTamanho) => {
    console.log("Adicionar ao carrinho:", produtoComTamanho);
  };

  if (loading) {
    return (
      <p className="text-center text-slate-400 py-12">
        Carregando produtos...
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-5 py-8 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
      {produtos.map((produto) => (
        <ProductCard
          key={produto.id}
          produto={produto}
          onAdicionarCarrinho={handleAdicionarCarrinho}
        />
      ))}
    </div>
  );
}