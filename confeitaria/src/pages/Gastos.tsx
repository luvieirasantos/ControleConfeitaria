import { useState } from "react";
import { useGastos } from "../context/GastosContext";
import type { Gasto, Pagamento } from "../context/GastosContext";

function getDateNDaysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0];
}

export default function Gastos() {
  const { gastos, deletarGasto } = useGastos();

  // Filtros
  const [periodo, setPeriodo] = useState<"7" | "30" | "personalizado">("7");
  const [dataInicio, setDataInicio] = useState(getDateNDaysAgo(7));
  const [dataFim, setDataFim] = useState(new Date().toISOString().split("T")[0]);

  function filtrarPagamentosPorPeriodo(gastos: Gasto[], inicio: string, fim: string) {
    // Retorna lista de objetos: { gasto, pagamento }
    return gastos.flatMap(g =>
      g.pagamentos
        .filter(p => {
          // Se não houver vencimentoFatura, usa dataCompra
          const data = p.vencimentoFatura || g.dataCompra;
          return data >= inicio && data <= fim;
        })
        .map(p => ({ gasto: g, pagamento: p }))
    );
  }

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

  const pagamentosFiltrados = filtrarPagamentosPorPeriodo(gastos, inicio, fim);
  const totalPeriodo = pagamentosFiltrados.reduce((sum, { pagamento }) => sum + pagamento.valor, 0);

  function handleDeletar(id: number) {
    if (confirm("Tem certeza que deseja deletar este gasto?")) {
      deletarGasto(id);
    }
  }

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
      {pagamentosFiltrados.length === 0 ? (
        <div className="text-gray-400 text-center mt-10">Nenhum gasto registrado neste período.</div>
      ) : (
        <div className="grid gap-4">
          {pagamentosFiltrados.map(({ gasto: g, pagamento: p }, idx) => (
            <div
              key={g.id + '-' + (p.id || idx)}
              className="bg-white border border-gray-200 rounded-2xl shadow-md p-5 flex flex-col md:flex-row md:items-center gap-4 relative hover:shadow-lg transition-shadow"
            >
              {/* Ícone do tipo de pagamento */}
              <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-full bg-pink-100">
                {p.tipo === 'cartao' && <span className="text-pink-500 text-2xl">💳</span>}
                {p.tipo === 'dinheiro' && <span className="text-green-500 text-2xl">💵</span>}
                {p.tipo === 'pix' && <span className="text-blue-500 text-2xl">⚡</span>}
                {p.tipo === 'boleto' && <span className="text-gray-500 text-2xl">🏷️</span>}
              </div>
              {/* Conteúdo principal */}
              <div className="flex-1 flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-2xl font-bold text-pink-600">R$ {p.valor.toFixed(2)}</span>
                  {p.tipo === 'cartao' && p.parcela && p.totalParcelas && (
                    <span className="bg-pink-100 text-pink-700 text-xs font-semibold px-2 py-1 rounded-full ml-2">Parcela {p.parcela} de {p.totalParcelas}</span>
                  )}
                </div>
                <div className="text-lg font-semibold text-gray-800 truncate">{g.mercado}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">Vencimento:</span>
                  <span className="text-sm font-medium text-gray-700">{p.vencimentoFatura || g.dataCompra}</span>
                </div>
                {g.observacao && <div className="text-xs text-gray-400 mt-1">Obs: {g.observacao}</div>}
                {g.proximaCompra && (
                  <div className="text-xs text-blue-600 mt-1">Próxima compra: {g.proximaCompra}</div>
                )}
              </div>
              {/* Ações */}
              <div className="flex flex-col gap-2 items-end md:items-center justify-center">
                <button
                  className="text-blue-500 text-xs font-semibold underline hover:text-blue-700"
                  onClick={() => {
                    // setDetalheId(g.id); // Removido
                    // setEditandoId(null); // Removido
                  }}
                >
                  Ver detalhes
                </button>
                <button
                  className="text-orange-500 text-xs font-semibold underline hover:text-orange-700"
                  onClick={() => {
                    // setEditGasto({ ...g, pagamentos: [...g.pagamentos] }); // Removido
                    // setNovoPagamentoTipo("dinheiro"); // Removido
                    // setNovoPagamentoValor(""); // Removido
                    // setNovoPagamentoCartaoNome(""); // Removido
                    // setNovoPagamentoVenc(""); // Removido
                  }}
                >
                  Editar
                </button>
                <button
                  className="text-red-500 text-xs font-semibold underline hover:text-red-700"
                  onClick={() => handleDeletar(g.id)}
                >
                  Deletar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
