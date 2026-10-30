import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { MailCheck } from "lucide-react";
import { toast } from "sonner";
import { enviarEmailRedefinicaoSenha } from "../../services/userService";

export default function ForgotPasswordPage() {
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      await enviarEmailRedefinicaoSenha(email.trim());
      setEnviado(true);
    } catch (err) {
      // Por segurança, não contamos se o e-mail tem conta ou não: para
      // "usuário não encontrado" mostramos a mesma tela de sucesso.
      if (err.code === "auth/user-not-found") {
        setEnviado(true);
      } else {
        const mensagem = mensagemDeErro(err.code);
        setErro(mensagem);
        toast.error(mensagem);
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900 border border-amber-400/10 rounded-xl p-8 shadow-xl">
        {enviado ? (
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-4">
              <MailCheck size={26} className="text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Verifique seu e-mail</h1>
            <p className="text-slate-400 text-sm mb-6">
              Se existir uma conta com <span className="text-white">{email.trim()}</span>, você
              vai receber um link para criar uma nova senha. Confira também a caixa de spam.
            </p>
            <Link
              to="/login"
              state={location.state}
              className="inline-block rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold py-2.5 px-6 text-sm transition-colors"
            >
              Voltar para o login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-white mb-1">Esqueceu a senha?</h1>
            <p className="text-slate-400 text-sm mb-6">
              Informe o e-mail da sua conta e enviaremos um link para criar uma nova senha.
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
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
                  placeholder="seu@email.com"
                />
              </div>

              <button
                type="submit"
                disabled={carregando}
                className="mt-2 rounded-lg bg-amber-400 text-slate-950 font-semibold py-2.5 text-sm hover:bg-amber-300 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {carregando ? "Enviando..." : "Enviar link"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              Lembrou a senha?{" "}
              <Link to="/login" state={location.state} className="text-amber-400 hover:underline">
                Entrar
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function mensagemDeErro(code) {
  switch (code) {
    case "auth/invalid-email":
    case "auth/missing-email":
      return "E-mail inválido.";
    case "auth/too-many-requests":
      return "Muitas tentativas. Tente novamente mais tarde.";
    case "auth/network-request-failed":
      return "Sem conexão. Verifique sua internet.";
    default:
      return "Não foi possível enviar o e-mail. Tente novamente.";
  }
}
