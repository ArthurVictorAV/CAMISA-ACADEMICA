import { useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import ProductForm from "./ProductForm";
import {
  atualizarProduto,
  criarProduto,
  excluirProduto,
} from "../../services/productsServices";

const formatarPreco = (valor) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor || 0);

const capa = (produto) =>
  (Array.isArray(produto.imagem) ? produto.imagem[0] : produto.imagem) || "";

export default function AdminProducts({ produtos, carregando, erro, onRecarregar }) {
  // null = formulário fechado; "novo" = cadastro; objeto = edição
  const [editando, setEditando] = useState(null);
  const [excluindo, setExcluindo] = useState(null);

  const salvar = async (dados) => {
    try {
      if (editando === "novo") {
        await criarProduto(dados);
        toast.success("Produto cadastrado.");
      } else {
        await atualizarProduto(editando.id, dados);
        toast.success("Produto atualizado.");
      }
      setEditando(null);
      onRecarregar();
    } catch (e) {
      console.error("Erro ao salvar produto:", e);
      toast.error(
        e.code === "permission-denied"
          ? "Sem permissão. Confira se sua conta está em admins no Firestore."
          : "Não foi possível salvar o produto."
      );
    }
  };

  const excluir = async (produto) => {
    if (!window.confirm(`Excluir "${produto.nome}"? Pedidos já feitos não são afetados.`)) return;

    setExcluindo(produto.id);
    try {
      await excluirProduto(produto.id);
      toast.success("Produto excluído.");
      onRecarregar();
    } catch (e) {
      console.error("Erro ao excluir produto:", e);
      toast.error("Não foi possível excluir o produto.");
    } finally {
      setExcluindo(null);
    }
  };

  return (
    <div>
      {editando ? (
        <div className="mb-6 rounded-xl border border-amber-400/20 bg-slate-900 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">
              {editando === "novo" ? "Novo produto" : `Editar: ${editando.nome}`}
            </h3>
            <button onClick={() => setEditando(null)} aria-label="Fechar" className="text-slate-400 hover:text-white">
              <X size={18} />
            </button>
          </div>
          <ProductForm
            key={editando === "novo" ? "novo" : editando.id}
            produto={editando === "novo" ? null : editando}
            onSalvar={salvar}
            onCancelar={() => setEditando(null)}
          />
        </div>
      ) : (
        <button
          onClick={() => setEditando("novo")}
          className="mb-6 flex items-center gap-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-sm px-4 py-2 transition-colors"
        >
          <Plus size={16} /> Novo produto
        </button>
      )}

      {carregando ? (
        <p className="text-slate-400 text-sm">Carregando produtos...</p>
      ) : erro ? (
        <div className="text-center py-10">
          <p className="text-red-400 text-sm mb-3">Não foi possível carregar os produtos.</p>
          <button onClick={onRecarregar} className="rounded-lg bg-amber-400 text-slate-950 font-semibold text-sm px-4 py-2">
            Tentar novamente
          </button>
        </div>
      ) : produtos.length === 0 ? (
        <p className="text-slate-500 text-sm py-10 text-center">Nenhum produto cadastrado.</p>
      ) : (
        <ul className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-900">
          {produtos.map((produto) => (
            <li key={produto.id} className="flex items-center gap-4 p-3">
              <div className="h-14 w-12 shrink-0 overflow-hidden rounded-md bg-slate-800">
                {capa(produto) && <img src={capa(produto)} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{produto.nome}</p>
                <p className="text-xs text-slate-500 truncate">
                  {formatarPreco(produto.preco)}
                  {produto.tamanhos?.length > 0 && ` · ${produto.tamanhos.join(", ")}`}
                  {produto.categoria && ` · ${produto.categoria}`}
                </p>
              </div>
              <button
                onClick={() => setEditando(produto)}
                aria-label={`Editar ${produto.nome}`}
                className="rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => excluir(produto)}
                disabled={excluindo === produto.id}
                aria-label={`Excluir ${produto.nome}`}
                className="rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors disabled:opacity-50"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
