import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, X, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { logout } from "../../services/userService"; 
import { useCartStore } from "../../store/useCartStore";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Conecta diretamente com o Zustand para somar a quantidade total
  const items = useCartStore((state) => state.cart);
  const cartCount = items.reduce((acc, item) => acc + (item.quantity || 1), 0);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    navigate("/");
  };

  const navLinkClass = ({ isActive }) =>
    `relative py-1 transition-colors duration-200 ${
      isActive ? "text-white" : "text-slate-300 hover:text-white"
    } after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-amber-400 after:transition-all after:duration-300 ${
      isActive ? "after:w-full" : "after:w-0 hover:after:w-full"
    }`;

  const links = [
    { to: "/", label: "Catálogo" },
    { to: "/carrinho", label: "Carrinho" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-slate-950/90 backdrop-blur-md shadow-lg shadow-black/20"
          : "bg-slate-950"
      } border-b border-amber-400/10`}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="group flex items-center gap-2 text-xl font-bold tracking-tight"
          >
            <img
              src="/logo.png"
              alt="Logo"
              className="h-16 w-16 object-cover transition-transform duration-300 group-hover:rotate-12"
            />
            <span className="text-white">
              Camiseta
              <span className="text-amber-400">Acadêmica</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className={navLinkClass}>
                {link.label}
              </NavLink>
            ))}

            <Link
              to="/carrinho"
              className="relative flex items-center text-slate-300 hover:text-white transition-colors"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-slate-950">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/perfil"
                  className="text-slate-300 text-sm max-w-[120px] truncate hover:text-white transition-colors"
                >
                  {user.displayName || user.email}
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-full border border-amber-400/40 px-4 py-1.5 text-amber-400 transition-colors duration-200 hover:bg-amber-400 hover:text-slate-950"
                >
                  Sair
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 rounded-full border border-amber-400/40 px-4 py-1.5 text-amber-400 transition-colors duration-200 hover:bg-amber-400 hover:text-slate-950"
              >
                <User size={16} />
                Entrar
              </Link>
            )}
          </nav>

          <button
            className="md:hidden text-white"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Abrir menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          mobileOpen ? "max-h-60 border-t border-amber-400/10" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col gap-1 px-4 py-3 text-sm font-medium">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="py-2 text-slate-300 hover:text-white transition-colors"
            >
              {link.label}
            </NavLink>
          ))}

          {user ? (
            <>
              <Link
                to="/perfil"
                onClick={() => setMobileOpen(false)}
                className="py-2 text-slate-300 hover:text-white transition-colors"
              >
                Meu perfil
              </Link>
              <button
                onClick={handleLogout}
                className="mt-1 flex items-center gap-1.5 py-2 text-amber-400"
              >
                <User size={16} />
                Sair ({user.displayName || user.email})
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="mt-1 flex items-center gap-1.5 py-2 text-amber-400"
            >
              <User size={16} />
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}