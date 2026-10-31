// Busca sem diferenciar maiúsculas nem acentos ("medicina" acha "Medicína").
export function normalizar(texto) {
  return String(texto ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export const ORDENACOES = {
  relevancia: "Mais relevantes",
  "menor-preco": "Menor preço",
  "maior-preco": "Maior preço",
  nome: "Nome (A–Z)",
};

// Categorias existentes nos produtos, em ordem alfabética.
export function categoriasDosProdutos(produtos) {
  const categorias = new Set(
    produtos.map((p) => (p.categoria ?? "").trim()).filter(Boolean)
  );
  return [...categorias].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export function filtrarProdutos(produtos, { busca = "", categoria = "", ordem = "relevancia" }) {
  const termos = normalizar(busca).split(/\s+/).filter(Boolean);

  const filtrados = produtos.filter((produto) => {
    if (categoria && produto.categoria?.trim() !== categoria) return false;
    if (termos.length === 0) return true;
    const texto = normalizar(`${produto.nome} ${produto.categoria} ${produto.descricao}`);
    // Todas as palavras digitadas precisam aparecer.
    return termos.every((termo) => texto.includes(termo));
  });

  const preco = (p) => Number(p.preco) || 0;
  switch (ordem) {
    case "menor-preco":
      return [...filtrados].sort((a, b) => preco(a) - preco(b));
    case "maior-preco":
      return [...filtrados].sort((a, b) => preco(b) - preco(a));
    case "nome":
      return [...filtrados].sort((a, b) => (a.nome ?? "").localeCompare(b.nome ?? "", "pt-BR"));
    default:
      // Destaques primeiro, mantendo a ordem original entre os demais.
      return [...filtrados].sort((a, b) => Number(Boolean(b.destaque)) - Number(Boolean(a.destaque)));
  }
}
