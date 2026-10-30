import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import ProductDetails from "./ProductDetails";
import NotFoundPage from "../errors/NotFoundPage";
import { getProduto } from "../../services/productsServices";
import { useAdicionarAoCarrinho } from "../../hooks/useAdicionarAoCarrinho";

// Página própria do produto (/produto/:id), com link que pode ser compartilhado.
export default function ProductPage() {
  const { id } = useParams();
  const [produto, setProduto] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  const carregar = useCallback(() => {
    setCarregando(true);
    setErro(false);
    getProduto(id)
      .then(setProduto)
      .catch((e) => {
        console.error("Erro ao carregar produto:", e);
        setErro(true);
      })
      .finally(() => setCarregando(false));
  }, [id]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Nome do produto na aba do navegador.
  useEffect(() => {
    if (!produto) return;
    const tituloAnterior = document.title;
    document.title = `${produto.nome} | ${tituloAnterior}`;
    return () => {
      document.title = tituloAnterior;
    };
  }, [produto]);

  if (carregando) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-slate-400 font-medium text-lg">Carregando produto...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <AlertTriangle size={28} className="text-red-400 mb-3" />
        <h2 className="text-xl font-bold text-white mb-4">Não foi possível carregar o produto</h2>
        <button
          onClick={carregar}
          className="rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold py-2.5 px-6 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!produto) return <NotFoundPage />;

  // "key" recria o estado (tamanho escolhido) ao navegar para outro produto.
  return <ConteudoProduto key={produto.id} produto={produto} />;
}

function ConteudoProduto({ produto }) {
  const carrinho = useAdicionarAoCarrinho(produto);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={16} /> Voltar ao catálogo
      </Link>
      <ProductDetails produto={produto} carrinho={carrinho} />
    </div>
  );
}
