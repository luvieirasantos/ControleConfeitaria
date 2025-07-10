import { useNavigate } from "react-router-dom";
import { HiOutlineClipboardList, HiOutlineCurrencyDollar, HiOutlineChartBar } from "react-icons/hi";
import { FaBagShopping, FaRegFloppyDisk, FaRegFolderOpen, FaRegChartBar } from "react-icons/fa6";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-blue-100 flex flex-col items-center justify-start py-6 md:py-12 px-2">
      <div className="bg-white/95 rounded-2xl shadow-lg max-w-3xl w-full mx-0 md:mx-4 p-4 md:p-10 flex flex-col items-center mb-6 md:mb-10 border border-gray-200">
        <h1 className="text-xl md:text-3xl font-bold text-gray-800 font-sans mb-1 tracking-tight">Painel de Controle</h1>
        <p className="text-sm md:text-base text-gray-500 mb-4 md:mb-6 text-center">
          Bem-vindo ao sistema de gestão da confeitaria
        </p>
        <div className="flex flex-col md:flex-row gap-2 md:gap-4 mb-2 w-full justify-center">
          <button
            className="flex items-center gap-2 border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 font-medium px-4 md:px-5 py-2 rounded-lg shadow-sm transition-all text-sm md:text-base w-full md:w-auto justify-center"
            onClick={() => alert("Funcionalidade de backup ainda não implementada.")}
          >
            <FaRegFloppyDisk className="text-lg" /> Fazer Backup
          </button>
          <button
            className="flex items-center gap-2 border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 font-medium px-4 md:px-5 py-2 rounded-lg shadow-sm transition-all text-sm md:text-base w-full md:w-auto justify-center"
            onClick={() => alert("Funcionalidade de restauração ainda não implementada.")}
          >
            <FaRegFolderOpen className="text-lg" /> Restaurar Backup
          </button>
        </div>
      </div>
      <div className="flex flex-col md:flex-row flex-wrap gap-3 md:gap-6 w-full max-w-3xl justify-center">
        <NavCard
          icon={<HiOutlineChartBar className="text-2xl" />}
          label="Resumo Geral"
          onClick={() => navigate("/")}
        />
        <NavCard
          icon={<FaBagShopping className="text-2xl" />}
          label="Encomendas"
          onClick={() => navigate("/encomendas")}
        />
        <NavCard
          icon={<HiOutlineCurrencyDollar className="text-2xl" />}
          label="Gastos"
          onClick={() => navigate("/gastos")}
        />
        <NavCard
          icon={<FaRegChartBar className="text-2xl" />}
          label="Relatórios"
          onClick={() => navigate("/relatorio")}
        />
      </div>
    </div>
  );
}

function NavCard({
  icon,
  label,
  onClick,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      className={`flex items-center gap-2 md:gap-3 px-4 md:px-8 py-4 md:py-5 rounded-xl shadow-sm text-base md:text-lg font-medium font-sans border border-gray-200 transition-all w-full md:w-auto justify-center
        ${active ? "bg-blue-600 text-white" : "bg-white hover:bg-blue-50 text-gray-900"}
      `}
      onClick={onClick}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
