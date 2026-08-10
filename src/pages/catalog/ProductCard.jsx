import { useCartStore } from "../../store/useCartStore";
import { useNavigate } from "react-router-dom";

export default function ProductCard({ produto }) {
  const addItem = useCartStore((state) => state.addItem);
  const navigate = useNavigate();

  const handleAddToCart = () => {
    addItem({
      id: produto.id,
      title: produto.nome || produto.title,
      price: produto.preco || produto.price || 0,
      image: produto.imagem || produto.image,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/carrinho");
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
      {/* Imagem do Produto (se houver) */}
      {produto.imagem || produto.image ? (
        <img
          src={produto.imagem || produto.image}
          alt={produto.nome}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
          Sem imagem
        </div>
      )}

      {/* Detalhes do Produto */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="font-bold text-lg text-gray-800 mb-1">
            {produto.nome || "Produto sem nome"}
          </h3>
          {produto.descricao && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {produto.descricao}
            </p>
          )}
        </div>

        <div>
          <div className="text-xl font-extrabold text-blue-600 mb-4">
            R$ {Number(produto.preco || produto.price || 0).toFixed(2).replace(".", ",")}
          </div>

          <div className="space-y-2">
            <button
              onClick={handleAddToCart}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
            >
              Adicionar ao Carrinho
            </button>

            <button
              onClick={handleBuyNow}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
            >
              Comprar Agora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}