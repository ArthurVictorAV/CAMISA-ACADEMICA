import { WHATSAPP_NUMERO } from "../config/loja";

const formatarPreco = (valor) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);

const formatarCep = (cep) => cep.replace(/^(\d{5})(\d{3})$/, "$1-$2");

// Número curto mostrado ao cliente (primeiros 8 caracteres do ID do pedido).
export function numeroDoPedido(id) {
  return id.slice(0, 8).toUpperCase();
}

// Monta o link do WhatsApp da loja com a mensagem do pedido já escrita, para
// o cliente combinar o pagamento via Pix. Retorna null se o número da loja
// não estiver configurado em src/config/loja.js.
export function linkWhatsAppDoPedido({ id, itens, total, endereco }) {
  const numero = WHATSAPP_NUMERO.replace(/\D/g, "");
  if (!numero) return null;

  const linhasItens = itens.map((item) => {
    const tamanho = item.tamanho ? ` (${item.tamanho})` : "";
    return `• ${item.quantidade}x ${item.nome}${tamanho} — ${formatarPreco(item.preco * item.quantidade)}`;
  });

  const complemento = endereco.complemento ? `, ${endereco.complemento}` : "";

  const mensagem = [
    `Olá! Acabei de fazer o pedido *#${numeroDoPedido(id)}* no site. Quero combinar o frete e pagar via Pix.`,
    "",
    "*Itens:*",
    ...linhasItens,
    "",
    `*Total dos produtos:* ${formatarPreco(total)}`,
    "*Frete:* a combinar",
    "",
    "*Entrega:*",
    endereco.destinatario,
    `${endereco.rua}, ${endereco.numero}${complemento}`,
    `${endereco.bairro} — ${endereco.cidade}/${endereco.uf}`,
    `CEP ${formatarCep(endereco.cep)}`,
  ].join("\n");

  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}
