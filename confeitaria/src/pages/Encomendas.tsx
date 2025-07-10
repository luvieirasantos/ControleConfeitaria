import { useState } from "react";
import { useEncomendas } from "../context/EncomendasContext";

const STATUS_LABEL = {
  fazendo: "Fazendo",
  entregue: "Entregue",
  cancelada: "Cancelada"
};

const PAGAMENTO_LABEL = {
  "nao-pago": "Ainda não pagou",
  "pago-parcial": "Pago parcial",
  "pago-total": "Pago total"
};

export default function Encomendas() {
  const { encomendas, atualizarStatus } = useEncomendas();
  const [editandoPagamentoId, setEditandoPagamentoId] = useState<number | null>(null);
  const [novoStatusPagamento, setNovoStatusPagamento] = useState<"nao-pago" | "pago-parcial" | "pago-total">("nao-pago");
  const [novoValorPago, setNovoValorPago] = useState("");

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6 text-pink-500">Encomendas</h2>
      {encomendas.length === 0 && (
        <div className="text-gray-400 text-center my-16 text-lg">Nenhuma encomenda cadastrada ainda.</div>
      )}
      <div className="grid gap-6">
        {encomendas.map((e) => (
          <div key={e.id} className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-xl text-pink-700">{e.cliente}</div>
                <div className="text-xs text-gray-500">{e.data}</div>
              </div>
              <span className={`rounded-xl px-3 py-1 text-sm font-bold`}>
                {STATUS_LABEL[e.status]}
              </span>
            </div>
            <div className="text-gray-800 font-medium">{e.produto}
              {e.sabor ? ` — ${e.sabor}` : ""}
              {" "}x{e.quantidade}
            </div>
            {e.adicionais.length > 0 && (
              <div className="text-sm text-gray-600">
                Adicionais: {e.adicionais.join(", ")}
              </div>
            )}
            <div className="text-sm text-gray-600">
              Valor total: <span className="font-semibold text-gray-800">R$ {e.valorTotal.toFixed(2)}</span>
              <br />
              Pago: <span className={e.valorPago > 0 ? "text-green-700 font-semibold" : "text-red-500 font-semibold"}>R$ {e.valorPago.toFixed(2)}</span>
              <br />
              <span>Status do pagamento: {PAGAMENTO_LABEL[e.pagamentoStatus]}</span>
            </div>
            {e.observacao && (
              <div className="text-xs text-gray-500">Obs: {e.observacao}</div>
            )}

            {/* Botões para editar pagamento */}
            <div className="flex gap-2 mt-2">
              <button
                className="rounded-lg px-3 py-1 bg-blue-100 border border-blue-300 text-blue-800 text-xs font-bold"
                onClick={() => {
                  setEditandoPagamentoId(e.id);
                  setNovoStatusPagamento(e.pagamentoStatus);
                  setNovoValorPago(e.valorPago.toString());
                }}
              >
                Atualizar pagamento
              </button>
              {/* Status da encomenda */}
              <button
                className="rounded-lg px-3 py-1 bg-yellow-100 border border-yellow-300 text-yellow-800 text-xs font-bold"
                onClick={() => atualizarStatus(e.id, "fazendo", e.pagamentoStatus, e.valorPago)}
                disabled={e.status === "fazendo"}
              >
                Fazendo
              </button>
              <button
                className="rounded-lg px-3 py-1 bg-green-100 border border-green-300 text-green-800 text-xs font-bold"
                onClick={() => atualizarStatus(e.id, "entregue", e.pagamentoStatus, e.valorPago)}
                disabled={e.status === "entregue"}
              >
                Entregue
              </button>
              <button
                className="rounded-lg px-3 py-1 bg-red-100 border border-red-300 text-red-800 text-xs font-bold"
                onClick={() => atualizarStatus(e.id, "cancelada", e.pagamentoStatus, e.valorPago)}
                disabled={e.status === "cancelada"}
              >
                Cancelada
              </button>
            </div>

            {/* Modal/inplace para edição do pagamento */}
            {editandoPagamentoId === e.id && (
              <div className="bg-gray-50 rounded-xl p-3 mt-2 flex flex-col gap-2">
                <label>Status do Pagamento:</label>
                <select
                  value={novoStatusPagamento}
                  onChange={ev => setNovoStatusPagamento(ev.target.value as any)}
                  className="border rounded p-2"
                >
                  <option value="nao-pago">Ainda não pagou</option>
                  <option value="pago-parcial">Adiantou parte do valor</option>
                  <option value="pago-total">Já pagou tudo</option>
                </select>
                {novoStatusPagamento === "pago-parcial" && (
                  <input
                    value={novoValorPago}
                    onChange={ev => setNovoValorPago(ev.target.value)}
                    type="number"
                    min={0}
                    max={e.valorTotal}
                    placeholder="Valor adiantado (R$)"
                    className="border rounded p-2"
                  />
                )}
                <div className="flex gap-2 mt-2">
                  <button
                    className="bg-green-500 text-white rounded px-4 py-1 font-bold"
                    onClick={() => {
                      atualizarStatus(
                        e.id,
                        e.status,
                        novoStatusPagamento,
                        novoStatusPagamento === "pago-total"
                          ? e.valorTotal
                          : novoStatusPagamento === "pago-parcial"
                          ? Number(novoValorPago) || 0
                          : 0
                      );
                      setEditandoPagamentoId(null);
                    }}
                  >
                    Salvar
                  </button>
                  <button
                    className="bg-gray-300 text-gray-800 rounded px-4 py-1 font-bold"
                    onClick={() => setEditandoPagamentoId(null)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
