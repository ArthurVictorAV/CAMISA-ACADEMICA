import { useState } from "react";
import { X, ShoppingCart, Check } from "lucide-react";

export default function ProductDetails({
  produto,
  tamanhoSelecionado,
  onTamanhoChange,
  onAdicionarCarrinho,
  adicionado,
  onFechar,
}) {
  const { nome, preco, imagens, tamanhos = ["P", "M", "G", "GG"], descricao } = produto;
  const [imagemAtiva, setImagemAtiva] = useState(0);
  const [zoomStyle, setZoomStyle] = useState({});
  const [zoomAtivo, setZoomAtivo] = useState(false);

  const precoFormatado = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(preco);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%` });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
      onClick={onFechar}
    >
      <div
        className="relative flex w-full max-w-4xl max-h-[92vh] flex-col overflow-x-hidden overflow-y-auto rounded-2xl bg-slate-900 shadow-2xl md:max-h-[85vh] md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onFechar}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-950/70 text-white hover:bg-amber-400 hover:text-slate-950 transition-colors"
        >
          <X size={18} />
        </button>

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
          <h2 className="text-xl font-bold text-white">{nome}</h2>
          <span className="text-2xl font-bold text-amber-400">{precoFormatado}</span>

          {descricao && (
            <p className="text-sm leading-relaxed text-slate-400">{descricao}</p>
          )}

          <div>
            <p className="mb-2 text-sm text-slate-300">Tamanho</p>
            <div className="flex gap-2">
              {tamanhos.map((tamanho) => (
                <button
                  key={tamanho}
                  onClick={() => onTamanhoChange(tamanho)}
                  className={`flex h-10 w-10 items-center justify-center rounded-md border text-sm font-medium transition-colors ${
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

          <button
            onClick={onAdicionarCarrinho}
            disabled={adicionado}
            className={`mt-auto flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold transition-colors ${
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
        </div>
      </div>
    </div>
  );
}