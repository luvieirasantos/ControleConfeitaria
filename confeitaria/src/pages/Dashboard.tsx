// src/pages/Dashboard.tsx
import { HiOutlineClipboardList, HiOutlineCurrencyDollar, HiOutlineChartBar } from "react-icons/hi";
import { FaBagShopping, FaRegFloppyDisk, FaRegFolderOpen, FaRegChartBar } from "react-icons/fa6";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-blue-100 flex flex-col items-center justify-start py-12">
      <div className="bg-white/95 rounded-2xl shadow-lg max-w-3xl w-full mx-4 p-10 flex flex-col items-center mb-10 border border-gray-200">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 font-sans mb-1 tracking-tight">Painel de Controle</h1>
        <p className="text-base text-gray-500 mb-6">Bem-vindo ao sistema de gestão da confeitaria</p>
        <div className="flex gap-4 mb-2 flex-wrap justify-center">
          <button className="flex items-center gap-2 border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 font-medium px-5 py-2 rounded-lg shadow-sm transition-all text-base">
            <FaRegFloppyDisk className="text-lg" /> Fazer Backup
          </button>
          <button className="flex items-center gap-2 border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 font-medium px-5 py-2 rounded-lg shadow-sm transition-all text-base">
            <FaRegFolderOpen className="text-lg" /> Restaurar Backup
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-6 justify-center">
        <NavCard icon={<HiOutlineChartBar className="text-2xl" />} label="Resumo Geral" active={true} />
        <NavCard icon={<FaBagShopping className="text-2xl" />} label="Encomendas" />
        <NavCard icon={<HiOutlineCurrencyDollar className="text-2xl" />} label="Gastos" />
        <NavCard icon={<FaRegChartBar className="text-2xl" />} label="Relatórios" />
      </div>
    </div>
  );
}

function NavCard({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <button
      className={`flex items-center gap-3 px-8 py-5 rounded-xl shadow-sm text-lg font-medium font-sans border border-gray-200 transition-all
        ${active ? "bg-blue-600 text-white" : "bg-white hover:bg-blue-50 text-gray-900"}
      `}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
  