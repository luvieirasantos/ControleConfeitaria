import { useState } from "react";
import { useGastos } from "../context/GastosContext";

function getDateNDaysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0];
}

export default function Gastos() {
  const { gastos } = useGastos();

  // Filtros
  const [periodo, setPeriodo] = useState<"7" | "30" | "personalizado">("7");
  const [dataInicio, setDataInicio] = useState(getDateNDaysAgo(7));
  const [dataFim, setDataFim] = useState(new Date().toISOString().split("T")[0]);

  function filtrarGastos() {
    let inicio = dataInicio;
    let fim = dataFim;
    if (periodo === "7") {
      inicio = getDateNDaysAgo(7);
      fim = new Date().toISOString().split("T")[0];
    }
    if (periodo === "30") {
      inicio = getDateNDaysAgo(30);
      fim = new Date().toISOString().split("T")[0];
    }
    return gastos.filter(g =>
      g.dataCompra >= inicio && g.dataCompra <= fim
    );
  }

  const gastosFiltrados = filtrarGastos();
  const totalPeriodo = gastosFiltrados.reduce((sum, g) => sum + g.valor, 0);

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6 text-pink-500">Gastos</h2>
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <select
          className="border rounded-xl p-3 text-lg"
          value={periodo}
          onChange={e => setPeriodo(e.target.value as any)}
        >
          <option value="7">Últimos 7 dias</option>
          <option value="30">Últimos 30 dias</option>
          <option value="personalizado">Personalizado</option>
        </select>
        {periodo === "personalizado" && (
          <div className="flex gap-2 items-center">
            <span>de</span>
            <input
              type="date"
              value={dataInicio}
              onChange={e => setDataInicio(e.target.value)}
              className="border rounded-xl p-2"
            />
            <span>até</span>
            <input
              type="date"
              value={dataFim}
              onChange={e => setDataFim(e.target.value)}
              className="border rounded-xl p-2"
            />
          </div>
        )}
      </div>
      <div className="bg-white rounded-xl p-4 shadow flex flex-col gap-2 mb-6">
        <div className="font-semibold text-gray-700">Total no período selecionado:</div>
        <div className="text-2xl font-bold text-pink-600">R$ {totalPeriodo.toFixed(2)}</div>
      </div>
      {gastosFiltrados.length === 0 ? (
        <div className="text-gray-400 text-center mt-10">Nenhum gasto registrado neste período.</div>
      ) : (
        <div className="grid gap-4">
          {gastosFiltrados.map(g => (
            <div key={g.id} className="bg-pink-50 border-l-4 border-pink-400 rounded-xl p-4 flex flex-col gap-1 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg">R$ {g.valor.toFixed(2)}</span>
                <span className="text-xs text-gray-500">{g.dataCompra}</span>
              </div>
              <div className="text-gray-700">{g.mercado}</div>
              {g.observacao && <div className="text-xs text-gray-500">Obs: {g.observacao}</div>}
              {g.proximaCompra && (
                <div className="text-xs text-blue-600">Próxima compra: {g.proximaCompra}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
