import { useState } from "react";
import { useProdutos } from "../context/ProdutosContext";
import { useEncomendas } from "../context/EncomendasContext";

export default function NovaEncomenda() {
  const { produtos } = useProdutos();
  const { adicionarEncomenda } = useEncomendas();

  const [cliente, setCliente] = useState("");
  const [telefone, setTelefone] = useState("");
  const [produtoId, setProdutoId] = useState<number | null>(null);
  const [saborId, setSaborId] = useState<number | null>(null);
  const [quantidade, setQuantidade] = useState("");
  const [adicionais, setAdicionais] = useState<number[]>([]);
  const [valorManual, setValorManual] = useState("");
  const [observacao, setObservacao] = useState("");

  const [pagamentoStatus, setPagamentoStatus] = useState<"nao-pago" | "pago-parcial" | "pago-total">("nao-pago");
  const [valorAdiantado, setValorAdiantado] = useState("");
  const [valorPago, setValorPago] = useState("");

  const produtosPrincipais = produtos.filter(p => p.tipo !== "adicional");
  const produto = produtosPrincipais.find(p => p.id === produtoId);
  const sabores = produto?.sabores || [];
  const adicionaisDisponiveis = produtos.filter(p => p.tipo === "adicional");

  // Calcule o preço
  let valorTotal = 0;
  if (produto) {
    if (produto.personalizavel && saborId) {
      const sabor = sabores.find(s => s.id === saborId);
      valorTotal += (sabor?.preco || 0) * Number(quantidade || 1);
    } else if (!produto.personalizavel && produto.sabores[0]) {
      valorTotal += (produto.sabores[0].preco || 0) * Number(quantidade || 1);
    }
  }
  for (const adicionalId of adicionais) {
    const adicional = adicionaisDisponiveis.find(a => a.id === adicionalId);
    valorTotal += adicional?.sabores[0]?.preco || 0;
  }
  if (valorManual) valorTotal = Number(valorManual);

  function salvarEncomenda() {
    if (!cliente || !produto) return alert("Preencha os dados da encomenda!");
    let valorPagoFinal = 0;
    if (pagamentoStatus === "pago-total") valorPagoFinal = valorTotal;
    else if (pagamentoStatus === "pago-parcial") valorPagoFinal = Number(valorAdiantado) || 0;
    else valorPagoFinal = 0;

    adicionarEncomenda({
      id: Date.now(),
      cliente,
      telefone,
      produto: produto.nome,
      sabor: produto.personalizavel && saborId ? sabores.find(s => s.id === saborId)?.nome : undefined,
      quantidade: Number(quantidade) || 1,
      adicionais: adicionaisDisponiveis.filter(a => adicionais.includes(a.id)).map(a => a.nome),
      valorTotal,
      valorPago: valorPagoFinal,
      pagamentoStatus,
      observacao,
      status: "fazendo",
      data: new Date().toISOString().split('T')[0]
    });

    setCliente("");
    setTelefone("");
    setProdutoId(null);
    setSaborId(null);
    setQuantidade("");
    setAdicionais([]);
    setValorManual("");
    setValorPago("");
    setObservacao("");
    setPagamentoStatus("nao-pago");
    setValorAdiantado("");
    alert("Encomenda cadastrada!");
  }

  return (
    <div className="max-w-xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6 text-pink-500">Nova Encomenda</h2>
      <div className="flex flex-col gap-4 bg-white rounded-2xl shadow-xl p-8">
        <input
          className="border rounded-xl p-3 text-lg"
          placeholder="Nome da cliente"
          value={cliente}
          onChange={e => setCliente(e.target.value)}
        />
        <input
          className="border rounded-xl p-3 text-lg"
          placeholder="Telefone (opcional)"
          value={telefone}
          onChange={e => setTelefone(e.target.value)}
        />
        <select
          className="border rounded-xl p-3 text-lg"
          value={produtoId ?? ""}
          onChange={e => {
            setProdutoId(Number(e.target.value));
            setSaborId(null);
          }}
        >
          <option value="">Selecione o produto</option>
          {produtosPrincipais.map(p => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>
        {produto?.personalizavel && (
          <select
            className="border rounded-xl p-3 text-lg"
            value={saborId ?? ""}
            onChange={e => setSaborId(Number(e.target.value))}
          >
            <option value="">Selecione o sabor/recheio</option>
            {sabores.map(s => (
              <option key={s.id} value={s.id}>
                {s.nome} — R$ {s.preco.toFixed(2)}
              </option>
            ))}
          </select>
        )}
        {produto && (
          <input
            className="border rounded-xl p-3 text-lg"
            placeholder={
              produto.personalizavel
                ? "Peso (kg) ou quantidade"
                : "Quantidade (unidades ou kg)"
            }
            type="number"
            min="1"
            value={quantidade}
            onChange={e => setQuantidade(e.target.value)}
          />
        )}
        <div>
          <span className="block font-semibold mb-2">Adicionais:</span>
          <div className="flex gap-2 flex-wrap">
            {adicionaisDisponiveis.map(a => (
              <label key={a.id} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={adicionais.includes(a.id)}
                  onChange={() =>
                    setAdicionais(prev =>
                      prev.includes(a.id)
                        ? prev.filter(id => id !== a.id)
                        : [...prev, a.id]
                    )
                  }
                />
                {a.nome} ({a.sabores[0]?.preco
                  ? `R$ ${a.sabores[0].preco.toFixed(2)}`
                  : "sem preço"})
              </label>
            ))}
          </div>
        </div>
        <input
          className="border rounded-xl p-3 text-lg"
          placeholder={`Valor manual (opcional, sobrescreve cálculo)`}
          value={valorManual}
          onChange={e => setValorManual(e.target.value)}
        />
        <div>
          <label className="block font-semibold mb-1">Status do Pagamento:</label>
          <select
            className="border rounded-xl p-3 text-lg mb-2"
            value={pagamentoStatus}
            onChange={e => setPagamentoStatus(e.target.value as any)}
          >
            <option value="nao-pago">Ainda não pagou</option>
            <option value="pago-parcial">Adiantou parte do valor</option>
            <option value="pago-total">Já pagou tudo</option>
          </select>
          {pagamentoStatus === "pago-parcial" && (
            <input
              className="border rounded-xl p-3 text-lg"
              placeholder="Valor adiantado (R$)"
              value={valorAdiantado}
              onChange={e => setValorAdiantado(e.target.value)}
              type="number"
              min="0"
              max={valorTotal}
            />
          )}
        </div>
        <textarea
          className="border rounded-xl p-3 text-lg"
          placeholder="Observações"
          value={observacao}
          onChange={e => setObservacao(e.target.value)}
        />
        <div className="text-right">
          <span className="text-lg font-bold text-pink-600">
            Valor total: R$ {valorTotal.toFixed(2)}
          </span>
        </div>
        <button
          className="bg-pink-500 text-white rounded-xl py-3 text-lg hover:bg-pink-600 transition-all"
          onClick={salvarEncomenda}
        >
          Salvar Encomenda
        </button>
      </div>
    </div>
  );
}
