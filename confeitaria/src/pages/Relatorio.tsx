import { useEncomendas } from "../context/EncomendasContext";
import { useGastos } from "../context/GastosContext";
import { useState } from "react";

function toCSV(rows: string[][]): string {
  return rows.map(row => row.map(String).map(field => `"${field.replace(/"/g, '""')}"`).join(",")).join("\r\n");
}

function downloadCSV(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function Relatorio() {
  const { encomendas } = useEncomendas();
  const { gastos } = useGastos();

  // Filtros de período
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  // Helpers para filtro
  function inPeriodo(date: string) {
    if (!dataInicio && !dataFim) return true;
    if (dataInicio && date < dataInicio) return false;
    if (dataFim && date > dataFim) return false;
    return true;
  }

  // Exporta entradas (encomendas)
  function exportarEncomendas() {
    const filtradas = encomendas.filter(e => inPeriodo(e.data));
    const rows: string[][] = [
      [
        "Data",
        "Cliente",
        "Produtos",
        "Total",
        "Valor Pago",
        "Status Pagamento",
        "Status Encomenda",
        "Observação"
      ],
      ...filtradas.map(e => [
        e.data,
        e.cliente,
        e.produtos.map(p =>
          `${p.quantidade}x ${p.produto}${p.sabor ? ` (${p.sabor})` : ""}${p.adicionais.length > 0 ? ` + ${p.adicionais.join(", ")}` : ""} = R$${p.valorTotal.toFixed(2)}`
        ).join(" | "),
        e.valorTotal.toFixed(2),
        e.valorPago.toFixed(2),
        e.pagamentoStatus,
        e.status,
        e.observacao || ""
      ])
    ];
    downloadCSV("encomendas.csv", toCSV(rows));
  }

  // Exporta saídas (gastos)
  function exportarGastos() {
    const filtrados = gastos.filter(g => inPeriodo(g.dataCompra));
    const rows: string[][] = [
      [
        "Data da Compra",
        "Mercado/Loja",
        "Valor Total",
        "Próxima Compra (estimativa)",
        "Pagamentos",
        "Observação"
      ],
      ...filtrados.map(g => [
        g.dataCompra,
        g.mercado,
        g.valor.toFixed(2),
        g.proximaCompra,
        g.pagamentos.map(p => {
          let det = p.tipo.charAt(0).toUpperCase() + p.tipo.slice(1);
          if (p.tipo === "cartao") det += ` (${p.cartaoNome || ""} / Venc: ${p.vencimentoFatura || ""})`;
          det += `: R$${p.valor.toFixed(2)}`;
          return det;
        }).join(" | "),
        g.observacao || ""
      ])
    ];
    downloadCSV("gastos.csv", toCSV(rows));
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-8 text-pink-500 text-center">Relatório Financeiro</h2>
      <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <div>
            <label className="block font-medium text-gray-600 mb-1">Data inicial</label>
            <input
              type="date"
              className="border rounded-lg px-3 py-2 text-base focus:border-pink-400 outline-none"
              value={dataInicio}
              onChange={e => setDataInicio(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-medium text-gray-600 mb-1">Data final</label>
            <input
              type="date"
              className="border rounded-lg px-3 py-2 text-base focus:border-pink-400 outline-none"
              value={dataFim}
              onChange={e => setDataFim(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            className="bg-pink-500 text-white rounded-xl px-6 py-3 font-semibold shadow-lg hover:bg-pink-600 transition"
            onClick={exportarEncomendas}
          >
            Exportar ENTRADAS (Encomendas)
          </button>
          <button
            className="bg-blue-500 text-white rounded-xl px-6 py-3 font-semibold shadow-lg hover:bg-blue-600 transition"
            onClick={exportarGastos}
          >
            Exportar SAÍDAS (Gastos)
          </button>
        </div>
        <div className="text-xs text-gray-400 text-center mt-4">
          Os arquivos são gerados no formato CSV, pronto para abrir no Excel ou Google Planilhas.
        </div>
      </div>
    </div>
  );
}
