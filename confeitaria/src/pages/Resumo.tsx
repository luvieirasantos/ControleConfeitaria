import { useEncomendas } from "../context/EncomendasContext";
import { useState } from "react";
import type { Encomenda } from "../context/EncomendasContext";

function filtrarPorPeriodo(encomendas: Encomenda[], periodo: string, dataInicio?: string, dataFim?: string): Encomenda[] {
  const hoje = new Date();
  let dataLimite: Date | null = null;
  if (periodo === "7") {
    dataLimite = new Date(hoje);
    dataLimite.setDate(hoje.getDate() - 6);
  } else if (periodo === "30") {
    dataLimite = new Date(hoje);
    dataLimite.setDate(hoje.getDate() - 29);
  } else if (periodo === "mes") {
    dataLimite = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  } else if (periodo === "personalizado" && dataInicio && dataFim) {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    return encomendas.filter((e) => {
      const dataE = new Date(e.data);
      return dataE >= inicio && dataE <= fim;
    });
  }
  if (!dataLimite) return encomendas;
  return encomendas.filter((e) => {
    const dataE = new Date(e.data);
    return dataE >= dataLimite && dataE <= hoje;
  });
}

export default function Resumo() {
  const { encomendas } = useEncomendas();
  const [periodo, setPeriodo] = useState<string>("7");
  const [dataInicio, setDataInicio] = useState<string>("");
  const [dataFim, setDataFim] = useState<string>("");

  // Só considera encomendas não canceladas
  const validas = encomendas.filter((e) => e.status !== "cancelada");
  const filtradas = filtrarPorPeriodo(validas, periodo, dataInicio, dataFim);

  // Soma correta: soma o valorTotal de todos os produtos de todas as encomendas válidas
  const totalVendido = filtradas.reduce(
    (sum: number, e: Encomenda) => sum + (e.produtos?.reduce((s: number, p) => s + (p.valorTotal || 0), 0) || 0),
    0
  );
  const totalRecebido = filtradas.reduce((sum: number, e: Encomenda) => sum + (e.valorPago || 0), 0);
  const totalPendente = totalVendido - totalRecebido;

  const totalEntregues = filtradas.filter((e) => e.status === "entregue").length;
  const totalFazendo = filtradas.filter((e) => e.status === "fazendo").length;
  const totalCanceladas = encomendas.filter((e) => e.status === "cancelada").length;

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h2 className="text-2xl font-bold mb-6 text-pink-500">Resumo Financeiro</h2>
      <div className="mb-6 flex gap-4 items-center flex-wrap">
        <label className="font-semibold text-gray-700">Período:</label>
        <select
          className="border rounded px-3 py-2"
          value={periodo}
          onChange={e => setPeriodo(e.target.value)}
        >
          <option value="7">Últimos 7 dias</option>
          <option value="30">Últimos 30 dias</option>
          <option value="mes">Mês atual</option>
          <option value="todos">Todos</option>
          <option value="personalizado">Personalizado</option>
        </select>
        {periodo === "personalizado" && (
          <>
            <input
              type="date"
              className="border rounded px-2 py-1"
              value={dataInicio}
              onChange={e => setDataInicio(e.target.value)}
              placeholder="Início"
            />
            <span>a</span>
            <input
              type="date"
              className="border rounded px-2 py-1"
              value={dataFim}
              onChange={e => setDataFim(e.target.value)}
              placeholder="Fim"
            />
          </>
        )}
      </div>
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl p-5 shadow flex flex-col">
          <span className="text-gray-500 text-sm mb-1">Total vendido (sem canceladas)</span>
          <span className="text-2xl font-bold text-pink-600">R$ {totalVendido.toFixed(2)}</span>
        </div>
        <div className="bg-white rounded-xl p-5 shadow flex flex-col">
          <span className="text-gray-500 text-sm mb-1">Total recebido</span>
          <span className="text-2xl font-bold text-green-600">R$ {totalRecebido.toFixed(2)}</span>
        </div>
        <div className="bg-white rounded-xl p-5 shadow flex flex-col">
          <span className="text-gray-500 text-sm mb-1">A receber</span>
          <span className={`text-2xl font-bold ${totalPendente > 0 ? "text-orange-600" : "text-green-700"}`}>
            R$ {totalPendente.toFixed(2)}
          </span>
        </div>
        <div className="bg-white rounded-xl p-5 shadow flex flex-col">
          <span className="text-gray-500 text-sm mb-1">Encomendas Entregues</span>
          <span className="text-2xl font-bold">{totalEntregues}</span>
        </div>
        <div className="bg-white rounded-xl p-5 shadow flex flex-col">
          <span className="text-gray-500 text-sm mb-1">Em produção</span>
          <span className="text-2xl font-bold">{totalFazendo}</span>
        </div>
        <div className="bg-white rounded-xl p-5 shadow flex flex-col">
          <span className="text-gray-500 text-sm mb-1">Canceladas</span>
          <span className="text-2xl font-bold text-red-500">{totalCanceladas}</span>
        </div>
      </div>
      <div className="text-sm text-gray-400">
        <ul>
          <li>* <b>Total vendido:</b> soma de todos os pedidos não cancelados do período</li>
          <li>* <b>Total recebido:</b> soma de todos os pagamentos já feitos do período</li>
          <li>* <b>A receber:</b> diferença entre total vendido e recebido do período</li>
        </ul>
      </div>
    </div>
  );
}
