import { useCallback, useEffect, useState } from "react";
import { Package, Shirt } from "lucide-react";
import AdminOrders from "./AdminOrders";
import AdminProducts from "./AdminProducts";
import { getProdutos } from "../../services/productsServices";

const ABAS = [
  { id: "pedidos", label: "Pedidos", icon: Package },
  { id: "produtos", label: "Produtos", icon: Shirt },
];

export default function AdminDashboard() {
  const [abaAtiva, setAbaAtiva] = useState("pedidos");

  // Os produtos são usados nas duas abas: na de pedidos, para conferir se o
  // preço do pedido bate com o catálogo.
  const [produtos, setProdutos] = useState([]);
  const [carregandoProdutos, setCarregandoProdutos] = useState(true);
  const [erroProdutos, setErroProdutos] = useState(false);

  const carregarProdutos = useCallback(() => {
    setCarregandoProdutos(true);
    setErroProdutos(false);
    getProdutos()
      .then((lista) => setProdutos(lista.sort((a, b) => (a.nome ?? "").localeCompare(b.nome ?? ""))))
      .catch((e) => {
        console.error("Erro ao carregar produtos:", e);
        setErroProdutos(true);
      })
      .finally(() => setCarregandoProdutos(false));
  }, []);

  useEffect(() => {
    carregarProdutos();
  }, [carregarProdutos]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-1">Painel admin</h1>
      <p className="text-slate-400 text-sm mb-6">Gerencie pedidos e produtos da loja.</p>

      <div className="flex gap-1 mb-6 border-b border-slate-800">
        {ABAS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setAbaAtiva(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              abaAtiva === id
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {abaAtiva === "pedidos" ? (
        <AdminOrders produtos={produtos} />
      ) : (
        <AdminProducts
          produtos={produtos}
          carregando={carregandoProdutos}
          erro={erroProdutos}
          onRecarregar={carregarProdutos}
        />
      )}
    </div>
  );
}
