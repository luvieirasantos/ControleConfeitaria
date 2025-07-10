import { useState } from "react";
import { useGastos } from "../context/GastosContext";
import type { Gasto, Pagamento } from "../context/GastosContext";

function getDateNDaysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0];
}

export default function Gastos() {
  const { gastos, editarGasto, deletarGasto } = useGastos();

  // Filtros
  const [periodo, setPeriodo] = useState<"7" | "30" | "personalizado">("7");
  const [dataInicio, setDataInicio] = useState(getDateNDaysAgo(7));
  const [dataFim, setDataFim] = useState(new Date().toISOString().split("T")[0]);
  const [detalheId, setDetalheId] = useState<number | null>(null);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  // Para edição
  const [editGasto, setEditGasto] = useState<Gasto | null>(null);
  const [novoPagamentoTipo, setNovoPagamentoTipo] = useState<Pagamento["tipo"]>("dinheiro");
  const [novoPagamentoValor, setNovoPagamentoValor] = useState("");
  const [novoPagamentoCartaoNome, setNovoPagamentoCartaoNome] = useState("");
  const [novoPagamentoVenc, setNovoPagamentoVenc] = useState("");

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

  function handleDeletar(id: number) {
    if (confirm("Tem certeza que deseja deletar este gasto?")) {
      deletarGasto(id);
      setDetalheId(null);
      setEditandoId(null);
    }
  }

  function startEdit(gasto: Gasto) {
    setEditGasto({ ...gasto, pagamentos: [...gasto.pagamentos] });
    setEditandoId(gasto.id);
    setDetalheId(null);
  }

  function addPagamentoEdicao() {
    if (!novoPagamentoValor) {
      alert("Informe o valor do pagamento.");
      return;
    }
    if (novoPagamentoTipo === "cartao" && (!novoPagamentoCartaoNome || !novoPagamentoVenc)) {
      alert("Nome do cartão e vencimento obrigatórios para cartão.");
      return;
    }
    setEditGasto(editGasto => editGasto ? {
      ...editGasto,
      pagamentos: [
        ...editGasto.pagamentos,
        {
          id: Date.now(),
          tipo: novoPagamentoTipo,
          valor: Number(novoPagamentoValor),
          cartaoNome: novoPagamentoTipo === "cartao" ? novoPagamentoCartaoNome : undefined,
          vencimentoFatura: novoPagamentoTipo === "cartao" ? novoPagamentoVenc : undefined,
        }
      ]
    } : null);
    setNovoPagamentoTipo("dinheiro");
    setNovoPagamentoValor("");
    setNovoPagamentoCartaoNome("");
    setNovoPagamentoVenc("");
  }

  function removePagamentoEdicao(idx: number) {
    setEditGasto(editGasto => editGasto ? {
      ...editGasto,
      pagamentos: editGasto.pagamentos.filter((_, i) => i !== idx)
    } : null);
  }

  function salvarEdicao() {
    if (editGasto) {
      editarGasto(editGasto);
      setEditandoId(null);
      setEditGasto(null);
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
      {gastosFiltrados.length === 0 ? (
        <div className="text-gray-400 text-center mt-10">Nenhum gasto registrado neste período.</div>
      ) : (
        <div className="grid gap-4">
          {gastosFiltrados.map(g => (
            <div key={g.id} className="bg-pink-50 border-l-4 border-pink-400 rounded-xl p-4 shadow-sm relative">
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg">R$ {g.valor.toFixed(2)}</span>
                <span className="text-xs text-gray-500">{g.dataCompra}</span>
              </div>
              <div className="text-gray-700">{g.mercado}</div>
              {g.observacao && <div className="text-xs text-gray-500">Obs: {g.observacao}</div>}
              {g.proximaCompra && (
                <div className="text-xs text-blue-600">Próxima compra: {g.proximaCompra}</div>
              )}
              <div className="flex gap-2 mt-3">
                <button
                  className="text-blue-600 text-xs font-semibold underline"
                  onClick={() => {
                    setDetalheId(detalheId === g.id ? null : g.id);
                    setEditandoId(null);
                  }}
                >
                  {detalheId === g.id ? "Ocultar detalhes" : "Ver detalhes"}
                </button>
                <button
                  className="text-orange-600 text-xs font-semibold underline"
                  onClick={() => startEdit(g)}
                >
                  Editar
                </button>
                <button
                  className="text-red-600 text-xs font-semibold underline"
                  onClick={() => handleDeletar(g.id)}
                >
                  Deletar
                </button>
              </div>
              {/* Detalhes do gasto */}
              {detalheId === g.id && (
                <div className="bg-white border mt-4 rounded-xl p-3 shadow-inner">
                  <div className="mb-1 font-semibold">Pagamentos deste gasto:</div>
                  <ul>
                    {g.pagamentos.map((p, idx) => (
                      <li key={p.id || idx}>
                        {p.tipo === "dinheiro" && (
                          <>Dinheiro — <b>R$ {p.valor.toFixed(2)}</b></>
                        )}
                        {p.tipo === "pix" && (
                          <>PIX — <b>R$ {p.valor.toFixed(2)}</b></>
                        )}
                        {p.tipo === "boleto" && (
                          <>Boleto — <b>R$ {p.valor.toFixed(2)}</b></>
                        )}
                        {p.tipo === "cartao" && (
                          <>
                            Cartão: <b>{p.cartaoNome}</b> — R$ {p.valor.toFixed(2)}<br />
                            <span className="text-xs text-gray-500">Vencimento: {p.vencimentoFatura}</span>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                  <div className="text-sm mt-2">
                    Total dos pagamentos:{" "}
                    <b>
                      R$ {g.pagamentos.reduce((sum, p) => sum + p.valor, 0).toFixed(2)}
                    </b>
                  </div>
                </div>
              )}
              {/* Edição do gasto */}
              {editandoId === g.id && editGasto && (
                <div className="bg-white border mt-4 rounded-xl p-4 shadow-inner">
                  <div className="flex flex-col gap-2">
                    <input
                      className="border rounded-xl p-2"
                      value={editGasto.valor}
                      onChange={e => setEditGasto(eg => eg ? { ...eg, valor: Number(e.target.value) } : null)}
                      type="number"
                      placeholder="Valor total da nota"
                    />
                    <input
                      className="border rounded-xl p-2"
                      value={editGasto.mercado}
                      onChange={e => setEditGasto(eg => eg ? { ...eg, mercado: e.target.value } : null)}
                      placeholder="Mercado/Loja"
                    />
                    <input
                      className="border rounded-xl p-2"
                      value={editGasto.dataCompra}
                      onChange={e => setEditGasto(eg => eg ? { ...eg, dataCompra: e.target.value } : null)}
                      type="date"
                    />
                    <input
                      className="border rounded-xl p-2"
                      value={editGasto.proximaCompra}
                      onChange={e => setEditGasto(eg => eg ? { ...eg, proximaCompra: e.target.value } : null)}
                      type="date"
                    />
                    <textarea
                      className="border rounded-xl p-2"
                      value={editGasto.observacao}
                      onChange={e => setEditGasto(eg => eg ? { ...eg, observacao: e.target.value } : null)}
                      placeholder="Observações"
                    />

                    {/* Pagamentos (listagem e edição) */}
                    <div className="border-t pt-3 mt-2">
                      <div className="font-semibold mb-2">Pagamentos:</div>
                      <ul>
                        {editGasto.pagamentos.map((p, idx) => (
                          <li key={p.id || idx} className="mb-1 flex items-center gap-2">
                            {p.tipo === "dinheiro" && (
                              <>Dinheiro — <b>R$ {p.valor.toFixed(2)}</b></>
                            )}
                            {p.tipo === "pix" && (
                              <>PIX — <b>R$ {p.valor.toFixed(2)}</b></>
                            )}
                            {p.tipo === "boleto" && (
                              <>Boleto — <b>R$ {p.valor.toFixed(2)}</b></>
                            )}
                            {p.tipo === "cartao" && (
                              <>
                                Cartão: <b>{p.cartaoNome}</b> — R$ {p.valor.toFixed(2)}
                                <span className="text-xs text-gray-500 ml-2">Venc: {p.vencimentoFatura}</span>
                              </>
                            )}
                            <button
                              className="text-red-400 ml-2"
                              onClick={() => removePagamentoEdicao(idx)}
                            >Remover</button>
                          </li>
                        ))}
                      </ul>
                      {/* Novo pagamento */}
                      <div className="flex flex-wrap gap-2 items-end mt-2">
                        <select
                          className="border rounded-xl p-2"
                          value={novoPagamentoTipo}
                          onChange={e => setNovoPagamentoTipo(e.target.value as any)}
                        >
                          <option value="dinheiro">Dinheiro</option>
                          <option value="cartao">Cartão de Crédito</option>
                          <option value="pix">PIX</option>
                          <option value="boleto">Boleto</option>
                        </select>
                        <input
                          className="border rounded-xl p-2"
                          type="number"
                          min="0"
                          placeholder="Valor (R$)"
                          value={novoPagamentoValor}
                          onChange={e => setNovoPagamentoValor(e.target.value)}
                          style={{ width: 110 }}
                        />
                        {novoPagamentoTipo === "cartao" && (
                          <>
                            <input
                              className="border rounded-xl p-2"
                              placeholder="Nome do cartão"
                              value={novoPagamentoCartaoNome}
                              onChange={e => setNovoPagamentoCartaoNome(e.target.value)}
                              style={{ width: 120 }}
                            />
                            <input
                              className="border rounded-xl p-2"
                              type="date"
                              value={novoPagamentoVenc}
                              onChange={e => setNovoPagamentoVenc(e.target.value)}
                              style={{ width: 150 }}
                            />
                          </>
                        )}
                        <button
                          className="bg-blue-500 text-white rounded px-4 py-2"
                          type="button"
                          onClick={addPagamentoEdicao}
                        >
                          Adicionar Pagamento
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        className="bg-green-500 text-white rounded px-4 py-2"
                        onClick={salvarEdicao}
                      >
                        Salvar
                      </button>
                      <button
                        className="bg-gray-300 rounded px-4 py-2"
                        onClick={() => { setEditandoId(null); setEditGasto(null); }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
