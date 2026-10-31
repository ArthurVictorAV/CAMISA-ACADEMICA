import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertTriangle, Search, X } from "lucide-react";
import { getProdutos } from "../../services/productsServices";
import ProductCard from "./ProductCard";
import { ORDENACOES, categoriasDosProdutos, filtrarProdutos } from "./filtrarProdutos";

export default function CatalogPage() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);

  // Filtros ficam na URL (?q=...&categoria=...&ordem=...) para poder
  // compartilhar uma busca e voltar a ela com o botão "voltar".
  const [searchParams, setSearchParams] = useSearchParams();
  const busca = searchParams.get("q") ?? "";
  const categoria = searchParams.get("categoria") ?? "";
  const ordem = ORDENACOES[searchParams.get("ordem")] ? searchParams.get("ordem") : "relevancia";

  const alterarFiltro = (chave, valor) => {
    setSearchParams(
      (atuais) => {
        const novos = new URLSearchParams(atuais);
        if (valor && !(chave === "ordem" && valor === "relevancia")) novos.set(chave, valor);
        else novos.delete(chave);
        return novos;
      },
      { replace: true }
    );
  };

  const limparFiltros = () => setSearchParams({}, { replace: true });

  const categorias = useMemo(() => categoriasDosProdutos(produtos), [produtos]);
  const visiveis = useMemo(
    () => filtrarProdutos(produtos, { busca, categoria, ordem }),
    [produtos, busca, categoria, ordem]
  );
  const temFiltro = Boolean(busca || categoria);

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
        <>
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="search"
                  value={busca}
                  onChange={(e) => alterarFiltro("q", e.target.value)}
                  placeholder="Buscar por curso, universidade, modelo..."
                  aria-label="Buscar produtos"
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
              <select
                value={ordem}
                onChange={(e) => alterarFiltro("ordem", e.target.value)}
                aria-label="Ordenar produtos"
                className="rounded-lg bg-slate-900 border border-slate-700 px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400"
              >
                {Object.entries(ORDENACOES).map(([valor, label]) => (
                  <option key={valor} value={valor}>{label}</option>
                ))}
              </select>
            </div>

            {categorias.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {["", ...categorias].map((cat) => (
                  <button
                    key={cat || "todas"}
                    onClick={() => alterarFiltro("categoria", cat)}
                    aria-pressed={categoria === cat}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                      categoria === cat
                        ? "border-amber-400 bg-amber-400 text-slate-950"
                        : "border-slate-700 text-slate-300 hover:border-amber-400/50"
                    }`}
                  >
                    {cat || "Todas"}
                  </button>
                ))}
              </div>
            )}

            {temFiltro && (
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <span>
                  {visiveis.length} {visiveis.length === 1 ? "produto encontrado" : "produtos encontrados"}
                </span>
                <button
                  onClick={limparFiltros}
                  className="flex items-center gap-1 text-amber-400 hover:underline"
                >
                  <X size={14} /> Limpar filtros
                </button>
              </div>
            )}
          </div>

          {visiveis.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              Nenhum produto encontrado para essa busca.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {visiveis.map((produto) => (
                <ProductCard key={produto.id || produto.nome} produto={produto} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}