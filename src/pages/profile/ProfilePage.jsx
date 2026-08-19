import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Lock, Package, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  alterarSenha,
  atualizarPerfil,
  buscarPerfil,
} from "../../services/userService";

const ABAS = [
  { id: "dados", label: "Meus dados", icon: User },
  { id: "seguranca", label: "Segurança", icon: Lock },
  { id: "pedidos", label: "Meus pedidos", icon: Package },
];

export default function ProfilePage() {
  const { user, carregando: carregandoAuth } = useAuth();
  const [abaAtiva, setAbaAtiva] = useState("dados");

  if (carregandoAuth) return null;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-1">Minha conta</h1>
        <p className="text-slate-400 text-sm mb-8">
          Gerencie suas informações, segurança e pedidos.
        </p>

        <div className="flex flex-col md:flex-row gap-6">
          <nav className="flex md:flex-col gap-1 md:w-56 shrink-0 overflow-x-auto md:overflow-visible">
            {ABAS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setAbaAtiva(id)}
                className={`flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
                  abaAtiva === id
                    ? "bg-amber-400/10 text-amber-400 border border-amber-400/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </nav>

          <div className="flex-1 bg-slate-900 border border-amber-400/10 rounded-xl p-6 sm:p-8 shadow-xl">
            {abaAtiva === "dados" && <AbaDados user={user} />}
            {abaAtiva === "seguranca" && <AbaSeguranca />}
            {abaAtiva === "pedidos" && <AbaPedidos />}
          </div>
        </div>
      </div>
    </div>
  );
}

function AbaDados({ user }) {
  const [form, setForm] = useState({ nome: "", telefone: "" });
  const [criadoEm, setCriadoEm] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      try {
        const perfil = await buscarPerfil(user.uid);
        setForm({
          nome: perfil?.nome ?? user.displayName ?? "",
          telefone: perfil?.telefone ?? "",
        });
        setCriadoEm(perfil?.criadoEm ?? null);
      } catch {
        setErro("Não foi possível carregar seus dados. Tente novamente.");
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (!form.nome.trim()) {
      setErro("O nome não pode ficar em branco.");
      return;
    }

    setSalvando(true);
    try {
      await atualizarPerfil(user.uid, {
        nome: form.nome.trim(),
        telefone: form.telefone.trim(),
      });
      setSucesso("Dados atualizados com sucesso.");
    } catch {
      setErro("Erro ao salvar suas alterações. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-1">Meus dados</h2>
      <p className="text-slate-400 text-sm mb-6">
        Informações pessoais associadas à sua conta.
      </p>

      {erro && (
        <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-2">
          {erro}
        </div>
      )}

      {sucesso && (
        <div className="mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm px-4 py-2">
          {sucesso}
        </div>
      )}

      {carregando ? (
        <p className="text-slate-400 text-sm">Carregando...</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
          <div>
            <label className="block text-sm text-slate-300 mb-1">E-mail</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full rounded-lg bg-slate-800/50 border border-slate-800 px-4 py-2 text-slate-500 text-sm cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Nome</label>
            <input
              type="text"
              name="nome"
              required
              value={form.nome}
              onChange={handleChange}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
              placeholder="Seu nome completo"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Telefone</label>
            <input
              type="tel"
              name="telefone"
              value={form.telefone}
              onChange={handleChange}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
              placeholder="(00) 00000-0000"
            />
          </div>

          {criadoEm && (
            <p className="text-xs text-slate-500">
              Membro desde{" "}
              {new Date(criadoEm).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}

          <button
            type="submit"
            disabled={salvando}
            className="mt-2 self-start rounded-lg bg-amber-400 text-slate-950 font-semibold px-6 py-2.5 text-sm hover:bg-amber-300 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {salvando ? "Salvando..." : "Salvar alterações"}
          </button>
        </form>
      )}
    </div>
  );
}

function AbaSeguranca() {
  const [form, setForm] = useState({
    senhaAtual: "",
    novaSenha: "",
    confirmarSenha: "",
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (form.novaSenha.length < 6) {
      setErro("A nova senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (form.novaSenha !== form.confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setSalvando(true);
    try {
      await alterarSenha(form.senhaAtual, form.novaSenha);
      setSucesso("Senha alterada com sucesso.");
      setForm({ senhaAtual: "", novaSenha: "", confirmarSenha: "" });
    } catch (err) {
      setErro(mensagemDeErroSenha(err.code));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-1">Segurança</h2>
      <p className="text-slate-400 text-sm mb-6">
        Altere sua senha de acesso periodicamente para manter sua conta segura.
      </p>

      {erro && (
        <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-2">
          {erro}
        </div>
      )}

      {sucesso && (
        <div className="mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm px-4 py-2">
          {sucesso}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
        <div>
          <label className="block text-sm text-slate-300 mb-1">
            Senha atual
          </label>
          <input
            type="password"
            name="senhaAtual"
            required
            value={form.senhaAtual}
            onChange={handleChange}
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-1">
            Nova senha
          </label>
          <input
            type="password"
            name="novaSenha"
            required
            value={form.novaSenha}
            onChange={handleChange}
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-1">
            Confirmar nova senha
          </label>
          <input
            type="password"
            name="confirmarSenha"
            required
            value={form.confirmarSenha}
            onChange={handleChange}
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={salvando}
          className="mt-2 self-start rounded-lg bg-amber-400 text-slate-950 font-semibold px-6 py-2.5 text-sm hover:bg-amber-300 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {salvando ? "Alterando..." : "Alterar senha"}
        </button>
      </form>
    </div>
  );
}

function AbaPedidos() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-1">Meus pedidos</h2>
      <p className="text-slate-400 text-sm mb-6">
        Acompanhe o histórico e o status dos seus pedidos.
      </p>

      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-700 py-16 text-center">
        <Package size={32} className="text-slate-600" />
        <p className="text-slate-400 text-sm max-w-xs">
          Em breve você poderá acompanhar seus pedidos por aqui.
        </p>
      </div>
    </div>
  );
}

function mensagemDeErroSenha(code) {
  switch (code) {
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Senha atual incorreta.";
    case "auth/weak-password":
      return "A nova senha é muito fraca.";
    case "auth/too-many-requests":
      return "Muitas tentativas. Tente novamente mais tarde.";
    case "auth/requires-recent-login":
      return "Por segurança, faça login novamente antes de trocar a senha.";
    default:
      return "Erro ao alterar a senha. Tente novamente.";
  }
}