import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, MessageCircle, Package } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import {
  STATUS_PEDIDO,
  cancelarPedido,
  listarMeusPedidos,
} from "../../services/orderService";
import { linkWhatsAppDoPedido, numeroDoPedido } from "../../services/whatsappService";

// Classes fixas (o Tailwind não gera classes montadas dinamicamente).
const CLASSES_STATUS = {
  pendente: "bg-amber-400/10 text-amber-400 border-amber-400/30",
  pago: "bg-sky-400/10 text-sky-400 border-sky-400/30",
  enviado: "bg-violet-400/10 text-violet-400 border-violet-400/30",
  entregue: "bg-emerald-400/10 text-emerald-400 border-emerald-400/30",
  cancelado: "bg-slate-700/40 text-slate-400 border-slate-600",
};

const formatarPreco = (valor) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);

const formatarData = (data) =>
  data
    ? data.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
    : "";

// Lista de pedidos do cliente logado. Usada na aba "Meus pedidos" do perfil.
export default function OrderHistory() {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [cancelando, setCancelando] = useState(null);

  const carregar = useCallback(() => {
    setCarregando(true);
    setErro(false);
    listarMeusPedidos(user.uid)
      .then(setPedidos)
      .catch((e) => {
        console.error("Erro ao carregar pedidos:", e);
        setErro(true);
      })
      .finally(() => setCarregando(false));
  }, [user]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const handleCancelar = async (pedido) => {
    const confirmado = window.confirm(
      `Cancelar o pedido #${numeroDoPedido(pedido.id)}? Essa ação não pode ser desfeita.`
    );
    if (!confirmado) return;

    setCancelando(pedido.id);
    try {
      await cancelarPedido(pedido.id);
      setPedidos((atuais) =>
        atuais.map((p) => (p.id === pedido.id ? { ...p, status: "cancelado" } : p))
      );
      toast.success("Pedido cancelado.");
    } catch (e) {
      console.error("Erro ao cancelar pedido:", e);
      toast.error("Não foi possível cancelar. Se o pagamento já foi feito, fale conosco no WhatsApp.");
    } finally {
      setCancelando(null);
    }
  };

  if (carregando) {
    return <p className="text-slate-400 text-sm">Carregando pedidos...</p>;
  }

  if (erro) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-red-500/30 py-12 text-center">
        <AlertTriangle size={28} className="text-red-400" />
        <p className="text-slate-400 text-sm">Não foi possível carregar seus pedidos.</p>
        <button
          onClick={carregar}
          className="rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-sm py-2 px-4 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (pedidos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-700 py-16 text-center">
        <Package size={32} className="text-slate-600" />
        <p className="text-slate-400 text-sm max-w-xs">Você ainda não fez nenhum pedido.</p>
        <Link to="/" className="text-sm text-amber-400 hover:underline">
          Ver produtos
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {pedidos.map((pedido) => {
        const linkWhatsApp =
          pedido.status === "pendente" ? linkWhatsAppDoPedido(pedido) : null;

        return (
          <li key={pedido.id} className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <p className="font-mono text-amber-400 font-semibold">
                  #{numeroDoPedido(pedido.id)}
                </p>
                <p className="text-xs text-slate-500">{formatarData(pedido.criadoEm)}</p>
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-medium ${
                  CLASSES_STATUS[pedido.status] ?? CLASSES_STATUS.cancelado
                }`}
              >
                {STATUS_PEDIDO[pedido.status] ?? pedido.status}
              </span>
            </div>

            <ul className="space-y-1 text-sm border-t border-slate-800 pt-3">
              {pedido.itens.map((item, i) => (
                <li key={i} className="flex justify-between gap-3">
                  <span className="text-slate-300 min-w-0 truncate">
                    {item.quantidade}x {item.nome}
                    {item.tamanho && <span className="text-slate-500"> · {item.tamanho}</span>}
                  </span>
                  <span className="text-slate-400 whitespace-nowrap">
                    {formatarPreco(item.preco * item.quantidade)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex justify-between items-center border-t border-slate-800 mt-3 pt-3">
              <span className="text-xs text-slate-500 min-w-0 truncate pr-3">
                {pedido.endereco?.cidade && `Entrega em ${pedido.endereco.cidade}/${pedido.endereco.uf}`}
              </span>
              <span className="font-bold text-white whitespace-nowrap">
                {formatarPreco(pedido.total)}
              </span>
            </div>

            {pedido.status === "pendente" && (
              <div className="flex flex-wrap items-center gap-3 mt-4">
                {linkWhatsApp && (
                  <a
                    href={linkWhatsApp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm py-2 px-4 transition-colors"
                  >
                    <MessageCircle size={16} />
                    Pagar via Pix no WhatsApp
                  </a>
                )}
                <button
                  onClick={() => handleCancelar(pedido)}
                  disabled={cancelando === pedido.id}
                  className="text-sm text-slate-500 hover:text-red-400 underline transition-colors disabled:opacity-50"
                >
                  {cancelando === pedido.id ? "Cancelando..." : "Cancelar pedido"}
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
