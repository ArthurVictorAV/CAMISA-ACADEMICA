// Para onde mandar o usuário depois de entrar ou criar conta.
// Aceita apenas caminhos internos (começando com "/") vindos de state.from.
export function destinoAposLogin(location) {
  const from = location.state?.from;
  return typeof from === "string" && from.startsWith("/") && !from.startsWith("//")
    ? from
    : "/";
}
