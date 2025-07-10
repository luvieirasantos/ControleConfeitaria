// src/pages/Dashboard.tsx
import { HiOutlineClipboardList, HiOutlineCurrencyDollar, HiOutlineChartBar } from "react-icons/hi";
import { FaBagShopping, FaFloppyDisk, FaFolderOpen, FaChartBar } from "react-icons/fa6";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 via-purple-400 to-blue-400 flex flex-col items-center justify-start py-12">
      <div className="bg-white/90 rounded-3xl shadow-xl max-w-3xl w-full mx-4 p-10 flex flex-col items-center mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-5xl">🍰</span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 font-sans">GeCakes - Controle da Confeitaria</h1>
        </div>
        <p className="text-lg text-gray-500 mb-6">Sistema de Gestão Completo</p>
        <div className="flex gap-4 mb-2 flex-wrap justify-center">
          <button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-2 rounded-lg shadow transition-all text-base">
            <FaFloppyDisk /> Fazer Backup
          </button>
          <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg shadow transition-all text-base">
            <FaFolderOpen /> Restaurar Backup
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-6 justify-center">
        <NavCard icon={<HiOutlineChartBar className="text-2xl" />} label="Resumo Geral" active={false} />
        <NavCard icon={<FaBagShopping className="text-2xl" />} label="Encomendas" active={false} />
        <NavCard icon={<HiOutlineCurrencyDollar className="text-2xl" />} label="Gastos" active={true} />
        <NavCard icon={<FaChartBar className="text-2xl" />} label="Relatórios" active={false} />
      </div>
    </div>
  );
}

function NavCard({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <button
      className={`flex items-center gap-3 px-8 py-5 rounded-2xl shadow-md text-lg font-medium font-sans transition-all
        ${active ? "bg-blue-500 text-white" : "bg-white hover:bg-blue-100 text-gray-900"}
      `}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
  