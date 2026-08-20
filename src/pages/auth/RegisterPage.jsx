import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { registrar } from "../../services/userService";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome: "", email: "", senha: "", confirmarSenha: "" });
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");

    if (form.senha !== form.confirmarSenha) {
      const mensagem = "As senhas não coincidem.";
      setErro(mensagem);
      toast.error(mensagem);
      return;
    }

    if (form.senha.length < 6) {
      const mensagem = "A senha precisa ter pelo menos 6 caracteres.";
      setErro(mensagem);
      toast.error(mensagem);
      return;
    }

    setCarregando(true);
    try {
      await registrar({ nome: form.nome, email: form.email, senha: form.senha });
      toast.success("Conta criada com sucesso!");
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
        <h1 className="text-2xl font-bold text-white mb-1">Criar conta</h1>
        <p className="text-slate-400 text-sm mb-6">
          Cadastre-se para acompanhar seus pedidos.
        </p>

        {erro && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-2">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            <label className="block text-sm text-slate-300 mb-1">Senha</label>
            <input
              type="password"
              name="senha"
              required
              value={form.senha}
              onChange={handleChange}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Confirmar senha</label>
            <input
              type="password"
              name="confirmarSenha"
              required
              value={form.confirmarSenha}
              onChange={handleChange}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
              placeholder="Repita a senha"
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="mt-2 rounded-lg bg-amber-400 text-slate-950 font-semibold py-2.5 text-sm hover:bg-amber-300 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {carregando ? "Criando conta..." : "Criar conta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Já tem conta?{" "}
          <Link to="/login" className="text-amber-400 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}

function mensagemDeErro(code) {
  switch (code) {
    case "auth/email-already-in-use":
      return "Esse e-mail já está cadastrado.";
    case "auth/invalid-email":
      return "E-mail inválido.";
    case "auth/weak-password":
      return "Senha muito fraca.";
    default:
      return "Erro ao criar conta. Tente novamente.";
  }
}