import { useState } from "react";
import { ShoppingCart, Check, ZoomIn } from "lucide-react";
import ProductDetails from "./ProductDetails";
import { useCartStore } from "../../store/useCartStore";

export default function ProductCard({ produto, onAdicionarCarrinho }) {
  const addItem = useCartStore((state) => state.addItem);

  const {
    id,
    nome,
    preco,
    precoOriginal,
    imagem = [],
    tamanhos = ["P", "M", "G", "GG"],
    destaque,
  } = produto;

  const [tamanhoSelecionado, setTamanhoSelecionado] = useState(tamanhos[0]);
  const [adicionado, setAdicionado] = useState(false);
  const [productDetailsAberto, setProductDetailsAberto] = useState(false);

  // Trata caso imagem seja uma string única ou um array
  const galeria = Array.isArray(imagem)
    ? imagem.length > 0 ? imagem : ["/placeholder.png"]
    : [imagem || "/placeholder.png"];

  const precoFormatado = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(preco || 0);

  const precoOriginalFormatado = precoOriginal
    ? new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(precoOriginal)
    : null;

  const handleAdicionar = (e) => {
    if (e) e.stopPropagation();

    // 1. Adiciona à nossa store do Zustand
    addItem({
      id: id || produto.id,
      title: nome,
      price: preco,
      image: galeria[0],
      tamanho: tamanhoSelecionado,
    });

    // 2. Chama callback antigo se a pai estiver escutando
    onAdicionarCarrinho?.({ ...produto, tamanho: tamanhoSelecionado });

    // 3. Feedback visual do botão
    setAdicionado(true);
    setTimeout(() => setAdicionado(false), 1500);
  };

  return (
    <>
      <div className="group flex flex-col overflow-hidden rounded-2xl border border-amber-400/10 bg-slate-900 transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/30 hover:shadow-xl hover:shadow-black/40">
        <div
          className="relative aspect-[4/5] cursor-zoom-in overflow-hidden bg-slate-800"
          onClick={() => setProductDetailsAberto(true)}
        >
          <img
            src={galeria[0]}
            alt={nome}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {destaque && (
            <span className="absolute left-3 top-3 rounded-full bg-amber-400 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-950">
              {destaque}
            </span>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              setProductDetailsAberto(true);
            }}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-slate-950/70 text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100 hover:bg-amber-400 hover:text-slate-950"
            aria-label="Ver detalhes do produto"
          >
            <ZoomIn size={16} />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <h3 className="text-sm font-semibold leading-snug text-white line-clamp-2">
            {nome}
          </h3>

          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-amber-400">
              {precoFormatado}
            </span>
            {precoOriginalFormatado && (
              <span className="text-xs text-slate-500 line-through">
                {precoOriginalFormatado}
              </span>
            )}
          </div>

          <div className="flex gap-1.5">
            {tamanhos.map((tamanho) => (
              <button
                key={tamanho}
                onClick={() => setTamanhoSelecionado(tamanho)}
                className={`flex h-8 w-8 items-center justify-center rounded-md border text-xs font-medium transition-colors duration-200 ${
                  tamanhoSelecionado === tamanho
                    ? "border-amber-400 bg-amber-400 text-slate-950"
                    : "border-slate-700 text-slate-300 hover:border-amber-400/50"
                }`}
              >
                {tamanho}
              </button>
            ))}
          </div>

          <button
            onClick={handleAdicionar}
            disabled={adicionado}
            className={`mt-auto flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-colors duration-200 ${
              adicionado
                ? "bg-emerald-500 text-white"
                : "bg-amber-400 text-slate-950 hover:bg-amber-300"
            }`}
          >
            {adicionado ? (
              <>
                <Check size={16} />
                Adicionado
              </>
            ) : (
              <>
                <ShoppingCart size={16} />
                Adicionar ao carrinho
              </>
            )}
          </button>
        </div>
      </div>

      {productDetailsAberto && (
        <ProductDetails
          produto={{ ...produto, imagens: galeria }}
          tamanhoSelecionado={tamanhoSelecionado}
          onTamanhoChange={setTamanhoSelecionado}
          onAdicionarCarrinho={handleAdicionar}
          adicionado={adicionado}
          onFechar={() => setProductDetailsAberto(false)}
        />
      )}
    </>
  );
}