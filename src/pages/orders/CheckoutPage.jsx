import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { CheckCircle2, Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { useCartStore } from "../../store/useCartStore";
import { atualizarCarrinho, useAtualizarCarrinho } from "../../hooks/useAtualizarCarrinho";
import { criarPedido } from "../../services/orderService";
import { buscarPerfil } from "../../services/userService";
import { linkWhatsAppDoPedido, numeroDoPedido } from "../../services/whatsappService";

const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

const ENDERECO_VAZIO = {
  destinatario: "",
  telefone: "",
  cep: "",
  rua: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  uf: "",
};

const apenasDigitos = (valor) => valor.replace(/\D/g, "");

function formatarCep(valor) {
  const d = apenasDigitos(valor).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

function formatarTelefone(valor) {
  const d = apenasDigitos(valor).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const formatarPreco = (valor) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);

function validarEndereco(form) {
  const erros = {};
  if (!form.destinatario.trim()) erros.destinatario = "Informe quem vai receber.";
  if (apenasDigitos(form.telefone).length < 10) erros.telefone = "Telefone inválido.";
  if (apenasDigitos(form.cep).length !== 8) erros.cep = "CEP inválido.";
  if (!form.rua.trim()) erros.rua = "Informe a rua.";
  if (!form.numero.trim()) erros.numero = "Informe o número.";
  if (!form.bairro.trim()) erros.bairro = "Informe o bairro.";
  if (!form.cidade.trim()) erros.cidade = "Informe a cidade.";
  if (!UFS.includes(form.uf)) erros.uf = "Selecione o estado.";
  return erros;
}

export default function CheckoutPage() {
  const { user } = useAuth();
  const cart = useCartStore((state) => state.cart);
  const getTotal = useCartStore((state) => state.getTotal);
  const setCart = useCartStore((state) => state.setCart);
  const sincronizado = useCartStore((state) => state.sincronizado);

  const [form, setForm] = useState(ENDERECO_VAZIO);
  const [erros, setErros] = useState({});
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [pedidoCriado, setPedidoCriado] = useState(null);

  // Confere preços/produtos com o Firestore ao abrir o checkout.
  useAtualizarCarrinho();

  // Preenche nome e telefone com os dados do perfil.
  useEffect(() => {
    let cancelado = false;
    buscarPerfil(user.uid)
      .then((perfil) => {
        if (cancelado) return;
        setForm((atual) => ({
          ...atual,
          destinatario: atual.destinatario || perfil?.nome || user.displayName || "",
          telefone: atual.telefone || formatarTelefone(perfil?.telefone ?? ""),
        }));
      })
      .catch(() => {
        // Sem problema: o cliente preenche à mão.
      });
    return () => {
      cancelado = true;
    };
  }, [user]);

  const alterarCampo = (campo, valor) => {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    setErros((atual) => ({ ...atual, [campo]: undefined }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "cep") return alterarCampo(name, formatarCep(value));
    if (name === "telefone") return alterarCampo(name, formatarTelefone(value));
    if (name === "uf") return alterarCampo(name, value.toUpperCase());
    alterarCampo(name, value);
  };

  // Preenche rua, bairro, cidade e UF a partir do CEP (ViaCEP).
  const buscarCep = async () => {
    const cep = apenasDigitos(form.cep);
    if (cep.length !== 8) return;

    setBuscandoCep(true);
    try {
      const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const dados = await resposta.json();
      if (dados.erro) {
        setErros((atual) => ({ ...atual, cep: "CEP não encontrado." }));
        return;
      }
      setForm((atual) => ({
        ...atual,
        rua: dados.logradouro || atual.rua,
        bairro: dados.bairro || atual.bairro,
        cidade: dados.localidade || atual.cidade,
        uf: dados.uf || atual.uf,
      }));
      setErros((atual) => ({ ...atual, rua: undefined, bairro: undefined, cidade: undefined, uf: undefined }));
    } catch {
      // ViaCEP fora do ar: o cliente preenche à mão.
    } finally {
      setBuscandoCep(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const novosErros = validarEndereco(form);
    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      toast.error("Confira os dados de entrega.");
      return;
    }

    setEnviando(true);
    try {
      const endereco = {
        ...form,
        destinatario: form.destinatario.trim(),
        telefone: apenasDigitos(form.telefone),
        cep: apenasDigitos(form.cep),
        rua: form.rua.trim(),
        numero: form.numero.trim(),
        complemento: form.complemento.trim(),
        bairro: form.bairro.trim(),
        cidade: form.cidade.trim(),
      };
      const pedido = await criarPedido(user.uid, cart, endereco);
      const linkWhatsApp = linkWhatsAppDoPedido({ ...pedido, endereco });
      setPedidoCriado({ ...pedido, linkWhatsApp });
      setCart([]);
      toast.success("Pedido realizado com sucesso!");

      // Leva o cliente direto ao WhatsApp para o Pix. Se o navegador bloquear
      // a nova aba, o botão da tela de confirmação continua disponível.
      if (linkWhatsApp) window.open(linkWhatsApp, "_blank", "noopener");
    } catch (erro) {
      if (erro.code === "carrinho-desatualizado") {
        // Aplica as mudanças no carrinho (com avisos) e deixa o cliente
        // conferir o novo total antes de confirmar de novo.
        await atualizarCarrinho();
        toast.error("Seu carrinho foi atualizado. Confira o resumo e confirme novamente.");
      } else {
        console.error("Erro ao criar pedido:", erro);
        toast.error("Não foi possível finalizar o pedido. Tente novamente.");
      }
    } finally {
      setEnviando(false);
    }
  };

  if (pedidoCriado) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-4">
          <CheckCircle2 size={30} className="text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Pedido realizado!</h2>
        <p className="text-slate-400 mb-1">
          Número do pedido:{" "}
          <span className="font-mono text-amber-400">
            #{numeroDoPedido(pedidoCriado.id)}
          </span>
        </p>
        <p className="text-slate-400 mb-6">
          Total: <span className="text-white font-semibold">{formatarPreco(pedidoCriado.total)}</span>
        </p>

        {pedidoCriado.linkWhatsApp ? (
          <>
            <p className="text-slate-300 mb-4 max-w-md">
              Para concluir, envie o pedido no nosso WhatsApp e faça o pagamento via Pix.
              A produção começa após a confirmação do pagamento.
            </p>
            <a
              href={pedidoCriado.linkWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-3 px-6 transition-colors mb-3"
            >
              <MessageCircle size={18} />
              Pagar via Pix no WhatsApp
            </a>
            <Link to="/" className="text-sm text-slate-400 hover:text-white transition-colors">
              Continuar comprando
            </Link>
          </>
        ) : (
          <Link
            to="/"
            className="rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold py-2.5 px-6 transition-colors"
          >
            Continuar comprando
          </Link>
        )}
      </div>
    );
  }

  // Ao recarregar a página, o carrinho ainda está vindo do Firestore.
  if (!sincronizado) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-slate-400 font-medium text-lg">Carregando carrinho...</p>
      </div>
    );
  }

  if (cart.length === 0) return <Navigate to="/carrinho" replace />;

  const total = getTotal();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">Finalizar pedido</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <form
          id="form-checkout"
          onSubmit={handleSubmit}
          noValidate
          className="lg:col-span-2 bg-slate-900 border border-amber-400/10 rounded-xl p-6 space-y-4"
        >
          <h2 className="text-lg font-bold text-white">Dados de entrega</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo label="Quem vai receber" erro={erros.destinatario}>
              <input name="destinatario" value={form.destinatario} onChange={handleChange} autoComplete="name" className={classeInput(erros.destinatario)} />
            </Campo>
            <Campo label="Telefone" erro={erros.telefone}>
              <input name="telefone" type="tel" inputMode="numeric" value={form.telefone} onChange={handleChange} autoComplete="tel" placeholder="(00) 00000-0000" className={classeInput(erros.telefone)} />
            </Campo>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Campo label="CEP" erro={erros.cep}>
              <div className="relative">
                <input name="cep" inputMode="numeric" value={form.cep} onChange={handleChange} onBlur={buscarCep} autoComplete="postal-code" placeholder="00000-000" className={classeInput(erros.cep)} />
                {buscandoCep && (
                  <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400" />
                )}
              </div>
            </Campo>
            <div className="sm:col-span-2">
              <Campo label="Rua" erro={erros.rua}>
                <input name="rua" value={form.rua} onChange={handleChange} autoComplete="address-line1" className={classeInput(erros.rua)} />
              </Campo>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Campo label="Número" erro={erros.numero}>
              <input name="numero" value={form.numero} onChange={handleChange} className={classeInput(erros.numero)} />
            </Campo>
            <div className="sm:col-span-2">
              <Campo label="Complemento (opcional)">
                <input name="complemento" value={form.complemento} onChange={handleChange} autoComplete="address-line2" placeholder="Apto, bloco, referência..." className={classeInput()} />
              </Campo>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            <div className="sm:col-span-2">
              <Campo label="Bairro" erro={erros.bairro}>
                <input name="bairro" value={form.bairro} onChange={handleChange} className={classeInput(erros.bairro)} />
              </Campo>
            </div>
            <div className="sm:col-span-2">
              <Campo label="Cidade" erro={erros.cidade}>
                <input name="cidade" value={form.cidade} onChange={handleChange} autoComplete="address-level2" className={classeInput(erros.cidade)} />
              </Campo>
            </div>
            <Campo label="UF" erro={erros.uf}>
              <select name="uf" value={form.uf} onChange={handleChange} className={classeInput(erros.uf)}>
                <option value="">--</option>
                {UFS.map((uf) => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </Campo>
          </div>
        </form>

        <div className="bg-slate-900 border border-amber-400/10 rounded-xl p-6 h-fit space-y-4">
          <h2 className="text-lg font-bold text-white">Resumo do pedido</h2>

          <ul className="space-y-3 border-b border-slate-800 pb-4">
            {cart.map((item) => (
              <li key={item.cartItemId || `${item.id}-${item.tamanho}`} className="flex justify-between gap-3 text-sm">
                <span className="text-slate-300 min-w-0">
                  <span className="block truncate">{item.title || item.nome}</span>
                  <span className="text-xs text-slate-500">
                    {item.tamanho && <>Tam. {item.tamanho} · </>}
                    {item.quantity}x {formatarPreco(Number(item.price || item.preco || 0))}
                  </span>
                </span>
                <span className="text-white whitespace-nowrap">
                  {formatarPreco(Number(item.price || item.preco || 0) * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="space-y-2 text-sm border-b border-slate-800 pb-4">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span>{formatarPreco(total)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Frete</span>
              <span className="text-emerald-400 font-medium">Grátis</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-lg font-bold text-white">
            <span>Total</span>
            <span className="text-xl text-amber-400">{formatarPreco(total)}</span>
          </div>

          <button
            type="submit"
            form="form-checkout"
            disabled={enviando}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold py-3 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {enviando && <Loader2 size={16} className="animate-spin" />}
            {enviando ? "Enviando pedido..." : "Confirmar pedido"}
          </button>

          <p className="text-xs text-center text-slate-500">
            Pagamento via Pix: após confirmar, você será direcionado ao nosso WhatsApp.
          </p>

          <Link to="/carrinho" className="block text-center text-sm text-slate-400 hover:text-white transition-colors">
            Voltar ao carrinho
          </Link>
        </div>
      </div>
    </div>
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
  return `w-full rounded-lg bg-slate-800 border px-4 py-2 text-white text-sm focus:outline-none transition-colors ${
    erro ? "border-red-500/60 focus:border-red-400" : "border-slate-700 focus:border-amber-400"
  }`;
}
