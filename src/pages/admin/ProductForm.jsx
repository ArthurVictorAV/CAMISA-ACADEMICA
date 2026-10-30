import { useState } from "react";
import { Loader2 } from "lucide-react";

const TAMANHOS_DISPONIVEIS = ["PP", "P", "M", "G", "GG", "XG"];

function paraFormulario(produto) {
  const imagens = Array.isArray(produto?.imagem)
    ? produto.imagem
    : produto?.imagem
    ? [produto.imagem]
    : [];

  return {
    nome: produto?.nome ?? "",
    preco: produto?.preco != null ? String(produto.preco).replace(".", ",") : "",
    precoOriginal:
      produto?.precoOriginal != null ? String(produto.precoOriginal).replace(".", ",") : "",
    descricao: produto?.descricao ?? "",
    categoria: produto?.categoria ?? "",
    destaque: produto?.destaque ?? "",
    tamanhos: produto?.tamanhos ?? ["P", "M", "G", "GG"],
    imagens: imagens.join("\n"),
  };
}

// "1.049,90" / "49,90" / "49.90" -> número ; vazio -> null ; inválido -> NaN
function lerPreco(texto) {
  const valor = texto.trim();
  if (!valor) return null;
  // Com vírgula, o padrão é brasileiro: ponto = milhar, vírgula = decimal.
  const normalizado = valor.includes(",")
    ? valor.replace(/\./g, "").replace(",", ".")
    : valor;
  const numero = Number(normalizado);
  return Number.isFinite(numero) ? Math.round(numero * 100) / 100 : NaN;
}

function validar(form) {
  const erros = {};
  const preco = lerPreco(form.preco);
  const precoOriginal = lerPreco(form.precoOriginal);
  const imagens = form.imagens.split("\n").map((l) => l.trim()).filter(Boolean);

  if (!form.nome.trim()) erros.nome = "Informe o nome.";
  if (preco == null || Number.isNaN(preco) || preco <= 0) erros.preco = "Preço inválido.";
  if (Number.isNaN(precoOriginal) || (precoOriginal != null && precoOriginal <= (preco ?? 0))) {
    erros.precoOriginal = "Deve ser maior que o preço (ou deixe vazio).";
  }
  if (form.tamanhos.length === 0) erros.tamanhos = "Selecione pelo menos um tamanho.";
  if (imagens.length === 0) erros.imagens = "Informe pelo menos uma imagem.";
  if (imagens.some((url) => !/^https?:\/\//.test(url) && !url.startsWith("/"))) {
    erros.imagens = "Cada linha deve ser um endereço de imagem (https://...).";
  }

  return {
    erros,
    dados: {
      nome: form.nome.trim(),
      preco,
      precoOriginal: precoOriginal ?? null,
      descricao: form.descricao.trim(),
      categoria: form.categoria.trim(),
      destaque: form.destaque.trim() || null,
      // Mantém a ordem padrão de tamanhos, não a ordem em que foram clicados.
      tamanhos: TAMANHOS_DISPONIVEIS.filter((t) => form.tamanhos.includes(t)),
      imagem: imagens,
    },
  };
}

export default function ProductForm({ produto, onSalvar, onCancelar }) {
  const [form, setForm] = useState(() => paraFormulario(produto));
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((atual) => ({ ...atual, [name]: value }));
    setErros((atual) => ({ ...atual, [name]: undefined }));
  };

  const alternarTamanho = (tamanho) => {
    setForm((atual) => ({
      ...atual,
      tamanhos: atual.tamanhos.includes(tamanho)
        ? atual.tamanhos.filter((t) => t !== tamanho)
        : [...atual.tamanhos, tamanho],
    }));
    setErros((atual) => ({ ...atual, tamanhos: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { erros: novosErros, dados } = validar(form);
    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    setSalvando(true);
    try {
      await onSalvar(dados);
    } finally {
      setSalvando(false);
    }
  };

  const primeiraImagem = form.imagens.split("\n").map((l) => l.trim()).find(Boolean);

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4">
        <div className="space-y-4">
          <Campo label="Nome" erro={erros.nome}>
            <input name="nome" value={form.nome} onChange={handleChange} className={classeInput(erros.nome)} placeholder="Camisa Medicina UFPE" />
          </Campo>

          <div className="grid grid-cols-2 gap-4">
            <Campo label="Preço (R$)" erro={erros.preco}>
              <input name="preco" inputMode="decimal" value={form.preco} onChange={handleChange} className={classeInput(erros.preco)} placeholder="79,90" />
            </Campo>
            <Campo label="Preço antigo (opcional)" erro={erros.precoOriginal}>
              <input name="precoOriginal" inputMode="decimal" value={form.precoOriginal} onChange={handleChange} className={classeInput(erros.precoOriginal)} placeholder="99,90" />
            </Campo>
          </div>
        </div>

        <div className="hidden sm:block h-36 w-28 overflow-hidden rounded-lg border border-slate-700 bg-slate-800">
          {primeiraImagem && (
            <img src={primeiraImagem} alt="Prévia" className="h-full w-full object-cover" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Campo label="Categoria (opcional)">
          <input name="categoria" value={form.categoria} onChange={handleChange} className={classeInput()} placeholder="Saúde, Exatas..." />
        </Campo>
        <Campo label="Selo de destaque (opcional)">
          <input name="destaque" value={form.destaque} onChange={handleChange} className={classeInput()} placeholder="Novo, Mais vendido..." />
        </Campo>
      </div>

      <Campo label="Descrição (opcional)">
        <textarea name="descricao" rows={3} value={form.descricao} onChange={handleChange} className={classeInput()} />
      </Campo>

      <div>
        <span className="block text-sm text-slate-300 mb-1">Tamanhos</span>
        <div className="flex flex-wrap gap-2">
          {TAMANHOS_DISPONIVEIS.map((tamanho) => {
            const ativo = form.tamanhos.includes(tamanho);
            return (
              <button
                key={tamanho}
                type="button"
                onClick={() => alternarTamanho(tamanho)}
                aria-pressed={ativo}
                className={`h-9 min-w-9 px-2 rounded-md border text-sm font-medium transition-colors ${
                  ativo
                    ? "border-amber-400 bg-amber-400 text-slate-950"
                    : "border-slate-700 text-slate-300 hover:border-amber-400/50"
                }`}
              >
                {tamanho}
              </button>
            );
          })}
        </div>
        {erros.tamanhos && <span className="block text-xs text-red-400 mt-1">{erros.tamanhos}</span>}
      </div>

      <Campo label="Imagens (um endereço por linha; a primeira é a capa)" erro={erros.imagens}>
        <textarea name="imagens" rows={3} value={form.imagens} onChange={handleChange} className={`${classeInput(erros.imagens)} font-mono text-xs`} placeholder="https://..." />
      </Campo>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancelar} className="rounded-lg px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors">
          Cancelar
        </button>
        <button
          type="submit"
          disabled={salvando}
          className="flex items-center gap-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-sm px-5 py-2 transition-colors disabled:opacity-60"
        >
          {salvando && <Loader2 size={14} className="animate-spin" />}
          {produto ? "Salvar alterações" : "Cadastrar produto"}
        </button>
      </div>
    </form>
  );
}

function Campo({ label, erro, children }) {
  return (
    <label className="block">
      <span className="block text-sm text-slate-300 mb-1">{label}</span>
      {children}
      {erro && <span className="block text-xs text-red-400 mt-1">{erro}</span>}
    </label>
  );
}

function classeInput(erro) {
  return `w-full rounded-lg bg-slate-800 border px-3 py-2 text-white text-sm focus:outline-none transition-colors ${
    erro ? "border-red-500/60 focus:border-red-400" : "border-slate-700 focus:border-amber-400"
  }`;
}
