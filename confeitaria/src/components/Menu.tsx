import { Link, useLocation } from "react-router-dom";
import { HiOutlineHome, HiOutlineShoppingBag, HiOutlinePlusCircle, HiOutlineClipboardList, HiOutlineCurrencyDollar, HiOutlineChartBar } from "react-icons/hi";

const navs = [
  { label: "Dashboard", to: "/", icon: <HiOutlineHome size={20} /> },
  { label: "Produtos", to: "/produtos", icon: <HiOutlineShoppingBag size={20} /> },
  { label: "Nova Encomenda", to: "/nova-encomenda", icon: <HiOutlinePlusCircle size={20} /> },
  { label: "Encomendas", to: "/encomendas", icon: <HiOutlineClipboardList size={20} /> },
  { label: "Registrar Gasto", to: "/registrar-gasto", icon: <HiOutlineCurrencyDollar size={20} /> },
  { label: "Resumo", to: "/resumo", icon: <HiOutlineChartBar size={20} /> },
];

export default function Menu() {
  const location = useLocation();
  return (
    <aside className="min-h-[calc(100vh-80px)] w-64 bg-white border-r shadow-lg pt-10 px-6 flex flex-col gap-4 sticky top-0 font-sans">
      <nav className="flex flex-col gap-3">
        {navs.map((nav) => (
          <Link
            key={nav.to}
            to={nav.to}
            className={`rounded-xl py-3 px-5 text-lg font-medium flex items-center gap-4 transition-all duration-200
              ${location.pathname === nav.to
                ? "bg-pink-500 text-white shadow-lg"
                : "hover:bg-pink-100 text-gray-700"}
            `}
            aria-current={location.pathname === nav.to ? "page" : undefined}
          >
            <span>{nav.icon}</span>
            <span>{nav.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
