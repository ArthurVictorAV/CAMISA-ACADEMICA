import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { login } from "../../services/userService";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", senha: "" });
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      await login({ email: form.email, senha: form.senha });
      toast.success("Login realizado com sucesso!");
      navigate("/");
    } catch (err) {
      const mensagem = mensagemDeErro(err.code);
      setErro(mensagem);
      toast.error(mensagem);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900 border border-amber-400/10 rounded-xl p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-white mb-1">Entrar</h1>
        <p className="text-slate-400 text-sm mb-6">
          Acesse sua conta para continuar.
        </p>

        {erro && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-2">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">E-mail</label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-slate-300">Senha</label>
              <Link
                to="/recuperar-senha"
                className="text-xs text-amber-400 hover:underline"
              >
                Esqueceu a senha?
              </Link>
            </div>
            <input
              type="password"
              name="senha"
              required
              value={form.senha}
              onChange={handleChange}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
              placeholder="Sua senha"
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="mt-2 rounded-lg bg-amber-400 text-slate-950 font-semibold py-2.5 text-sm hover:bg-amber-300 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Ainda não tem conta?{" "}
          <Link to="/cadastro" className="text-amber-400 hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}

function mensagemDeErro(code) {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "E-mail ou senha incorretos.";
    case "auth/invalid-email":
      return "E-mail inválido.";
    case "auth/too-many-requests":
      return "Muitas tentativas. Tente novamente mais tarde.";
    default:
      return "Erro ao entrar. Tente novamente.";
  }
}