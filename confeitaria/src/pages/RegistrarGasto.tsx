import { useState } from "react";
import { useGastos } from "../context/GastosContext";

type PagamentoInput = {
  tipo: "dinheiro" | "cartao" | "pix" | "boleto";
  valor: string;
  cartaoNome?: string;
  vencimentoFatura?: string;
};

export default function RegistrarGasto() {
  const { adicionarGasto } = useGastos();
  const [valor, setValor] = useState("");
  const [mercado, setMercado] = useState("");
  const [dataCompra, setDataCompra] = useState("");
  const [proximaCompra, setProximaCompra] = useState("");
  const [observacao, setObservacao] = useState("");

  const [pagamentos, setPagamentos] = useState<PagamentoInput[]>([]);

  // Campos para pagamento temporário
  const [pagTipo, setPagTipo] = useState<"dinheiro" | "cartao" | "pix" | "boleto">("dinheiro");
  const [pagValor, setPagValor] = useState("");
  const [pagCartaoNome, setPagCartaoNome] = useState("");
  const [pagVencimento, setPagVencimento] = useState("");

  // Adiciona pagamento à lista temporária
  function adicionarPagamentoTemp() {
    if (!pagValor) {
      alert("Informe o valor do pagamento.");
      return;
    }
    if (pagTipo === "cartao" && (!pagCartaoNome || !pagVencimento)) {
      alert("Informe o nome do cartão e a data de vencimento.");
      return;
    }
    setPagamentos((prev) => [
      ...prev,
      {
        tipo: pagTipo,
        valor: pagValor,
        cartaoNome: pagTipo === "cartao" ? pagCartaoNome : undefined,
        vencimentoFatura: pagTipo === "cartao" ? pagVencimento : undefined,
      }
    ]);
    setPagTipo("dinheiro");
    setPagValor("");
    setPagCartaoNome("");
    setPagVencimento("");
  }

  function removerPagamentoTemp(idx: number) {
    setPagamentos(pagamentos.filter((_, i) => i !== idx));
  }

  function salvarGasto() {
    if (!valor || !mercado || !dataCompra) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }
    adicionarGasto({
      id: Date.now(),
      valor: Number(valor.replace(",", ".")),
      mercado,
      dataCompra,
      proximaCompra,
      observacao,
      pagamentos: pagamentos.map((p, idx) => ({
        id: idx + 1,
        tipo: p.tipo,
        valor: Number(p.valor.replace(",", ".")),
        cartaoNome: p.cartaoNome,
        vencimentoFatura: p.vencimentoFatura
      }))
    });
    setValor("");
    setMercado("");
    setDataCompra("");
    setProximaCompra("");
    setObservacao("");
    setPagamentos([]);
    alert("Gasto cadastrado!");
  }

  const somaPag = pagamentos.reduce((sum, p) => sum + Number(p.valor.replace(",", ".")), 0);

  return (
    <div className="max-w-xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6 text-pink-500">Registrar Gasto</h2>
      <div className="flex flex-col gap-4 bg-white rounded-2xl shadow-xl p-8">
        <input
          className="border rounded-xl p-3 text-lg"
          placeholder="Valor total da nota (R$)"
          value={valor}
          onChange={e => setValor(e.target.value)}
          type="number"
          min="0"
        />
        <input
          className="border rounded-xl p-3 text-lg"
          placeholder="Mercado/Loja"
          value={mercado}
          onChange={e => setMercado(e.target.value)}
        />
        <label className="font-semibold">Data da Compra:</label>
        <input
          className="border rounded-xl p-3 text-lg"
          value={dataCompra}
          onChange={e => setDataCompra(e.target.value)}
          type="date"
        />
        <label className="font-semibold">Estimativa da Próxima Compra:</label>
        <input
          className="border rounded-xl p-3 text-lg"
          value={proximaCompra}
          onChange={e => setProximaCompra(e.target.value)}
          type="date"
        />
        <textarea
          className="border rounded-xl p-3 text-lg"
          placeholder="Observações (opcional)"
          value={observacao}
          onChange={e => setObservacao(e.target.value)}
        />

        {/* Adição de Pagamentos */}
        <div className="border-t pt-4 mt-4">
          <h3 className="text-lg font-bold mb-2">Pagamentos deste gasto</h3>
          <div className="flex flex-wrap gap-2 items-end mb-2">
            <select
              className="border rounded-xl p-2"
              value={pagTipo}
              onChange={e => setPagTipo(e.target.value as any)}
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
              value={pagValor}
              onChange={e => setPagValor(e.target.value)}
              style={{ width: 110 }}
            />
            {pagTipo === "cartao" && (
              <>
                <input
                  className="border rounded-xl p-2"
                  placeholder="Nome do cartão"
                  value={pagCartaoNome}
                  onChange={e => setPagCartaoNome(e.target.value)}
                  style={{ width: 120 }}
                />
                <input
                  className="border rounded-xl p-2"
                  type="date"
                  value={pagVencimento}
                  onChange={e => setPagVencimento(e.target.value)}
                  style={{ width: 150 }}
                />
              </>
            )}
            <button
              className="bg-blue-500 text-white rounded px-4 py-2"
              type="button"
              onClick={adicionarPagamentoTemp}
            >
              Adicionar Pagamento
            </button>
          </div>

          {/* Lista dos pagamentos inseridos */}
          {pagamentos.length > 0 && (
            <ul className="mb-2">
              {pagamentos.map((p, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="text-gray-800">
                    {p.tipo === "dinheiro" && "Dinheiro"}
                    {p.tipo === "cartao" && `Cartão (${p.cartaoNome || "?"}) — venc: ${p.vencimentoFatura || "?"}`}
                    {p.tipo === "pix" && "PIX"}
                    {p.tipo === "boleto" && "Boleto"}
                    <b> — R$ {Number(p.valor).toFixed(2)}</b>
                  </span>
                  <button
                    className="ml-2 text-red-500 font-bold"
                    type="button"
                    onClick={() => removerPagamentoTemp(idx)}
                  >Remover</button>
                </li>
              ))}
            </ul>
          )}

          <div className="text-sm text-gray-600 mt-2">
            Total já informado: <span className="font-bold">R$ {somaPag.toFixed(2)}</span>
            {valor && somaPag !== Number(valor.replace(",", ".")) && (
              <span className="ml-3 text-orange-600 font-semibold">
                {somaPag > Number(valor.replace(",", ".")) ? "Atenção: soma maior que valor da nota!" : "Atenção: soma menor que valor da nota!"}
              </span>
            )}
          </div>
        </div>
        <button
          className="bg-pink-500 text-white rounded-xl py-3 text-lg hover:bg-pink-600 transition-all"
          onClick={salvarGasto}
        >
          Salvar Gasto
        </button>
      </div>
    </div>
  );
}
