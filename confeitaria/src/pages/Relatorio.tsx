import { useEncomendas } from "../context/EncomendasContext";
import { useGastos } from "../context/GastosContext";
import { useState } from "react";
// @ts-ignore
import jsPDF from "jspdf";
// @ts-ignore
import autoTable from "jspdf-autotable";

function formatCurrency(valor: number) {
  return `R$ ${valor.toFixed(2)}`;
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

  // Exporta entradas (encomendas) em PDF
  function exportarEncomendasPDF() {
    // Só considera encomendas não canceladas
    const filtradas = encomendas.filter(e => e.status !== "cancelada" && inPeriodo(e.data));
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Relatório de ENTRADAS (Encomendas)", 14, 16);
    doc.setFontSize(10);
    doc.text(`Período: ${dataInicio || "início"} a ${dataFim || "hoje"}`, 14, 23);
    // Totais no cabeçalho
    const totalVendido = filtradas.reduce((sum, e) => sum + (e.produtos?.reduce((s, p) => s + (p.valorTotal || 0), 0) || 0), 0);
    const totalRecebido = filtradas.reduce((sum, e) => sum + (e.valorPago || 0), 0);
    doc.setFontSize(12);
    doc.text(`Total vendido: ${formatCurrency(totalVendido)}`, 14, 30);
    doc.text(`Total recebido: ${formatCurrency(totalRecebido)}`, 14, 37);
    autoTable(doc, {
      startY: 43,
      head: [[
        "Data",
        "Cliente",
        "Produtos",
        "Total",
        "Valor Pago",
        "Status Pagamento",
        "Status Encomenda",
        "Observação"
      ]],
      body: filtradas.map(e => [
        e.data,
        e.cliente,
        e.produtos.map(p =>
          `${p.quantidade}x ${p.produto}${p.sabor ? ` (${p.sabor})` : ""}${p.adicionais.length > 0 ? ` + ${p.adicionais.join(", ")}` : ""} = ${formatCurrency(p.valorTotal)}`
        ).join(" | "),
        formatCurrency(e.valorTotal),
        formatCurrency(e.valorPago),
        e.pagamentoStatus,
        e.status,
        e.observacao || ""
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [236, 72, 153] },
      theme: 'striped',
    });
    doc.save("relatorio_encomendas.pdf");
  }

  // Exporta saídas (gastos) em PDF
  function exportarGastosPDF() {
    // Filtra pagamentos do período
    const filtrados = gastos
      .map(g => {
        // Filtra pagamentos (parcelas) do gasto pelo vencimentoFatura
        const pagamentosFiltrados = g.pagamentos.filter(p => {
          // Se não houver vencimentoFatura, usa dataCompra
          const dataParcela = p.vencimentoFatura || g.dataCompra;
          return inPeriodo(dataParcela);
        });
        return { ...g, pagamentos: pagamentosFiltrados };
      })
      // Só inclui gastos que tenham pelo menos uma parcela no período
      .filter(g => g.pagamentos.length > 0);
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Relatório de SAÍDAS (Gastos)", 14, 16);
    doc.setFontSize(10);
    doc.text(`Período: ${dataInicio || "início"} a ${dataFim || "hoje"}`, 14, 23);
    // Total gasto no cabeçalho
    const totalGasto = filtrados.reduce((sum, g) => sum + (g.valor || 0), 0);
    doc.setFontSize(12);
    doc.text(`Total gasto: ${formatCurrency(totalGasto)}`, 14, 30);
    autoTable(doc, {
      startY: 36,
      head: [[
        "Data da Compra",
        "Mercado/Loja",
        "Valor Total",
        "Forma de Pagamento",
        "Pagamentos",
        "Observação"
      ]],
      body: filtrados.map(g => [
        g.dataCompra,
        g.mercado,
        formatCurrency(g.valor),
        g.pagamentos.map(p => {
          let det = p.tipo.charAt(0).toUpperCase() + p.tipo.slice(1);
          if (p.tipo === "cartao") det += ` (${p.cartaoNome || ""} / Venc: ${p.vencimentoFatura || ""})`;
          return det;
        }).join(" | "),
        g.pagamentos.map(p => `R$${p.valor.toFixed(2)}`).join(" | "),
        g.observacao || ""
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
      theme: 'striped',
    });
    doc.save("relatorio_gastos.pdf");
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
            onClick={exportarEncomendasPDF}
          >
            Exportar ENTRADAS (Encomendas) PDF
          </button>
          <button
            className="bg-blue-500 text-white rounded-xl px-6 py-3 font-semibold shadow-lg hover:bg-blue-600 transition"
            onClick={exportarGastosPDF}
          >
            Exportar SAÍDAS (Gastos) PDF
          </button>
        </div>
        <div className="text-xs text-gray-400 text-center mt-4">
          Os arquivos são gerados no formato PDF, prontos para impressão ou envio digital.<br/>
          Relatórios incluem todos os detalhes das entradas e saídas do período selecionado.
        </div>
      </div>
    </div>
  );
}
