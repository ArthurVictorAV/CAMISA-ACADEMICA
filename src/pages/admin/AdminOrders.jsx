import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, MessageCircle, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import {
  STATUS_PEDIDO,
  atualizarStatusPedido,
  listarTodosPedidos,
} from "../../services/orderService";
import { numeroDoPedido } from "../../services/whatsappService";

const CLASSES_STATUS = {
  pendente: "bg-amber-400/10 text-amber-400 border-amber-400/30",
  pago: "bg-sky-400/10 text-sky-400 border-sky-400/30",
  enviado: "bg-violet-400/10 text-violet-400 border-violet-400/30",
  entregue: "bg-emerald-400/10 text-emerald-400 border-emerald-400/30",
  cancelado: "bg-slate-700/40 text-slate-400 border-slate-600",
};

const formatarPreco = (valor) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);

const formatarDataHora = (data) =>
  data
    ? data.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })
    : "";

function formatarTelefone(digitos = "") {
  if (digitos.length === 11) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
  if (digitos.length === 10) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  return digitos;
}

// Avisos para o admin conferir antes de confirmar o pagamento. As regras do
// Firestore não conseguem validar os preços de cada item, então um pedido
// criado fora do site poderia ter valores errados.
function conferirPedido(pedido, produtosPorId) {
  const avisos = [];
  const somaItens =
    Math.round(pedido.itens.reduce((s, item) => s + item.preco * item.quantidade, 0) * 100) / 100;

  if (somaItens !== pedido.total) {
    avisos.push(`O total (${formatarPreco(pedido.total)}) não bate com a soma dos itens (${formatarPreco(somaItens)}).`);
  }
  for (const item of pedido.itens) {
    const produto = produtosPorId.get(item.produtoId);
    if (produto && Number(produto.preco) !== item.preco) {
      avisos.push(`${item.nome}: preço no pedido ${formatarPreco(item.preco)}, no catálogo hoje ${formatarPreco(Number(produto.preco))}.`);
    }
  }
  return avisos;
}

export default function AdminOrders({ produtos }) {
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [filtro, setFiltro] = useState("pendente");
  const [busca, setBusca] = useState("");
  const [salvando, setSalvando] = useState(null);

  const carregar = useCallback(() => {
    setCarregando(true);
    setErro(false);
    listarTodosPedidos()
      .then(setPedidos)
      .catch((e) => {
        console.error("Erro ao carregar pedidos:", e);
        setErro(true);
      })
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const produtosPorId = useMemo(
    () => new Map(produtos.map((p) => [p.id, p])),
    [produtos]
  );

  const contagem = useMemo(() => {
    const c = { todos: pedidos.length };
    for (const status of Object.keys(STATUS_PEDIDO)) c[status] = 0;
    for (const p of pedidos) c[p.status] = (c[p.status] ?? 0) + 1;
    return c;
  }, [pedidos]);

  const termo = busca.trim().toLowerCase().replace(/^#/, "");
  const visiveis = pedidos.filter((p) => {
    if (filtro !== "todos" && p.status !== filtro) return false;
    if (!termo) return true;
    return (
      numeroDoPedido(p.id).toLowerCase().includes(termo) ||
      (p.endereco?.destinatario ?? "").toLowerCase().includes(termo)
    );
  });

  const mudarStatus = async (pedido, novoStatus) => {
    if (novoStatus === pedido.status) return;
    if (
      novoStatus === "cancelado" &&
      !window.confirm(`Cancelar o pedido #${numeroDoPedido(pedido.id)}?`)
    ) {
      return;
    }

    setSalvando(pedido.id);
    try {
      await atualizarStatusPedido(pedido.id, novoStatus);
      setPedidos((atuais) =>
        atuais.map((p) => (p.id === pedido.id ? { ...p, status: novoStatus } : p))
      );
      toast.success(`Pedido #${numeroDoPedido(pedido.id)}: ${STATUS_PEDIDO[novoStatus]}.`);
    } catch (e) {
      console.error("Erro ao atualizar status:", e);
      toast.error("Não foi possível atualizar o status.");
    } finally {
      setSalvando(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {["pendente", "pago", "enviado", "entregue", "cancelado", "todos"].map((status) => (
          <button
            key={status}
            onClick={() => setFiltro(status)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              filtro === status
                ? "border-amber-400 bg-amber-400 text-slate-950"
                : "border-slate-700 text-slate-300 hover:border-amber-400/50"
            }`}
          >
            {status === "todos" ? "Todos" : STATUS_PEDIDO[status]} ({contagem[status] ?? 0})
          </button>
        ))}
        <button
          onClick={carregar}
          className="ml-auto flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <RefreshCw size={14} /> Atualizar
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por número do pedido ou nome do cliente"
          className="w-full rounded-lg bg-slate-800 border border-slate-700 pl-9 pr-4 py-2 text-white text-sm focus:outline-none focus:border-amber-400"
        />
      </div>

      {carregando ? (
        <p className="text-slate-400 text-sm">Carregando pedidos...</p>
      ) : erro ? (
        <div className="text-center py-10">
          <p className="text-red-400 text-sm mb-3">Não foi possível carregar os pedidos.</p>
          <button onClick={carregar} className="rounded-lg bg-amber-400 text-slate-950 font-semibold text-sm px-4 py-2">
            Tentar novamente
          </button>
        </div>
      ) : visiveis.length === 0 ? (
        <p className="text-slate-500 text-sm py-10 text-center">Nenhum pedido encontrado.</p>
      ) : (
        <ul className="space-y-4">
          {visiveis.map((pedido) => {
            const avisos = conferirPedido(pedido, produtosPorId);
            const e = pedido.endereco ?? {};
            const telefone = e.telefone ?? "";

            return (
              <li key={pedido.id} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-mono text-amber-400 font-semibold">#{numeroDoPedido(pedido.id)}</p>
                    <p className="text-xs text-slate-500">{formatarDataHora(pedido.criadoEm)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${CLASSES_STATUS[pedido.status] ?? ""}`}>
                      {STATUS_PEDIDO[pedido.status] ?? pedido.status}
                    </span>
                    <select
                      value={pedido.status}
                      disabled={salvando === pedido.id}
                      onChange={(ev) => mudarStatus(pedido, ev.target.value)}
                      aria-label="Alterar status"
                      className="rounded-lg bg-slate-800 border border-slate-700 px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-400 disabled:opacity-50"
                    >
                      {Object.entries(STATUS_PEDIDO).map(([valor, label]) => (
                        <option key={valor} value={valor}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {avisos.length > 0 && (
                  <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300 space-y-1">
                    <p className="flex items-center gap-1.5 font-semibold">
                      <AlertTriangle size={14} /> Confira antes de confirmar o pagamento:
                    </p>
                    {avisos.map((aviso, i) => <p key={i}>• {aviso}</p>)}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <ul className="space-y-1">
                    {pedido.itens.map((item, i) => (
                      <li key={i} className="flex justify-between gap-3">
                        <span className="text-slate-300 min-w-0 truncate">
                          {item.quantidade}x {item.nome}
                          {item.tamanho && <span className="text-amber-400 font-medium"> · {item.tamanho}</span>}
                        </span>
                        <span className="text-slate-400 whitespace-nowrap">{formatarPreco(item.preco * item.quantidade)}</span>
                      </li>
                    ))}
                    <li className="flex justify-between border-t border-slate-800 pt-2 mt-2 font-bold text-white">
                      <span>Total</span>
                      <span>{formatarPreco(pedido.total)}</span>
                    </li>
                  </ul>

                  <div className="text-slate-400 space-y-0.5 md:border-l md:border-slate-800 md:pl-4">
                    <p className="text-white font-medium">{e.destinatario}</p>
                    <p>{e.rua}, {e.numero}{e.complemento ? `, ${e.complemento}` : ""}</p>
                    <p>{e.bairro} — {e.cidade}/{e.uf}</p>
                    <p>CEP {e.cep?.replace(/^(\d{5})(\d{3})$/, "$1-$2")}</p>
                    {telefone && (
                      <a
                        href={`https://wa.me/55${telefone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 pt-1 text-emerald-400 hover:underline"
                      >
                        <MessageCircle size={14} /> {formatarTelefone(telefone)}
                      </a>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
