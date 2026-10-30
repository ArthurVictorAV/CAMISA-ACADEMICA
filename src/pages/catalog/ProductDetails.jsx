import { useState } from "react";
import { Link } from "react-router-dom";
import { X, ShoppingCart, Check, Share2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const formatarPreco = (valor) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor || 0);

// Compartilha o link da página do produto (menu nativo no celular; no
// computador, copia o link).
async function compartilhar(produto) {
  const url = `${window.location.origin}/produto/${produto.id}`;
  if (navigator.share) {
    try {
      await navigator.share({ title: produto.nome, url });
    } catch {
      // Usuário fechou o menu de compartilhamento.
    }
    return;
  }
  try {
    await navigator.clipboard.writeText(url);
    toast.success("Link do produto copiado!");
  } catch {
    toast.error("Não foi possível copiar o link.");
  }
}

// Detalhes do produto (galeria com zoom, tamanhos, adicionar ao carrinho).
// Com "onFechar" é exibido como modal sobre o catálogo; sem ele, como
// conteúdo da página /produto/:id.
// "carrinho" vem de useAdicionarAoCarrinho(produto).
export default function ProductDetails({ produto, carrinho, onFechar }) {
  const { nome, preco, precoOriginal, descricao } = produto;
  const { tamanhos, galeria: imagens, tamanhoSelecionado, setTamanhoSelecionado, adicionado, adicionar } = carrinho;
  const modal = Boolean(onFechar);

  const [imagemAtiva, setImagemAtiva] = useState(0);
  const [zoomStyle, setZoomStyle] = useState({});
  const [zoomAtivo, setZoomAtivo] = useState(false);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%` });
  };

  const conteudo = (
    <div
      className={`relative flex w-full flex-col overflow-x-hidden rounded-2xl bg-slate-900 md:flex-row ${
        modal
          ? "max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl md:max-h-[85vh]"
          : "border border-amber-400/10"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {modal && (
        <button
          onClick={onFechar}
          aria-label="Fechar"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-950/70 text-white hover:bg-amber-400 hover:text-slate-950 transition-colors"
        >
          <X size={18} />
        </button>
      )}

      <div className="flex w-full flex-col gap-3 bg-slate-800 p-4 md:w-1/2">
        <div
          className="relative aspect-square cursor-zoom-in overflow-hidden rounded-xl"
          onMouseEnter={() => setZoomAtivo(true)}
          onMouseLeave={() => setZoomAtivo(false)}
          onMouseMove={handleMouseMove}
        >
          <img
            src={imagens[imagemAtiva]}
            alt={nome}
            style={zoomStyle}
            className={`h-full w-full object-cover transition-transform duration-200 ${
              zoomAtivo ? "scale-[2.2]" : "scale-100"
            }`}
          />
        </div>

        {imagens.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {imagens.map((img, i) => (
              <button
                key={i}
                onClick={() => setImagemAtiva(i)}
                className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                  imagemAtiva === i ? "border-amber-400" : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex w-full flex-col gap-4 p-6 md:w-1/2">
        {modal ? (
          <h2 className="text-xl font-bold text-white pr-10">{nome}</h2>
        ) : (
          <h1 className="text-2xl font-bold text-white">{nome}</h1>
        )}

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-amber-400">{formatarPreco(preco)}</span>
          {precoOriginal && (
            <span className="text-sm text-slate-500 line-through">{formatarPreco(precoOriginal)}</span>
          )}
        </div>

        {descricao && (
          <p className="text-sm leading-relaxed text-slate-400">{descricao}</p>
        )}

        <div>
          <p className="mb-2 text-sm text-slate-300">Tamanho</p>
          <div className="flex flex-wrap gap-2">
            {tamanhos.map((tamanho) => (
              <button
                key={tamanho}
                onClick={() => setTamanhoSelecionado(tamanho)}
                className={`flex h-10 min-w-10 px-2 items-center justify-center rounded-md border text-sm font-medium transition-colors ${
                  tamanhoSelecionado === tamanho
                    ? "border-amber-400 bg-amber-400 text-slate-950"
                    : "border-slate-700 text-slate-300 hover:border-amber-400/50"
                }`}
              >
                {tamanho}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto space-y-3">
          <button
            onClick={adicionar}
            disabled={adicionado}
            className={`flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold transition-colors ${
              adicionado
                ? "bg-emerald-500 text-white"
                : "bg-amber-400 text-slate-950 hover:bg-amber-300"
            }`}
          >
            {adicionado ? (
              <>
                <Check size={16} /> Adicionado
              </>
            ) : (
              <>
                <ShoppingCart size={16} /> Adicionar ao carrinho
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-5 text-sm">
            <button
              onClick={() => compartilhar(produto)}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
            >
              <Share2 size={15} /> Compartilhar
            </button>
            {modal && (
              <Link
                to={`/produto/${produto.id}`}
                className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
              >
                <ExternalLink size={15} /> Abrir página do produto
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (!modal) return conteudo;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
      onClick={onFechar}
    >
      {conteudo}
    </div>
  );
}
