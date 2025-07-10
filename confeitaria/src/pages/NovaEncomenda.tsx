import { useState } from "react";
import { useProdutos } from "../context/ProdutosContext";
import { useEncomendas } from "../context/EncomendasContext";

export default function NovaEncomenda() {
  const { produtos } = useProdutos();
  const { adicionarEncomenda } = useEncomendas();

  // Dados do cliente e pagamento
  const [cliente, setCliente] = useState("");
  const [telefone, setTelefone] = useState("");
  const [pagamentoStatus, setPagamentoStatus] = useState<"nao-pago" | "pago-parcial" | "pago-total">("nao-pago");
  const [valorAdiantado, setValorAdiantado] = useState("");
  const [observacao, setObservacao] = useState("");

  // Produtos adicionados à encomenda
  const [produtosEncomenda, setProdutosEncomenda] = useState<any[]>([]);

  // Para o formulário de novo produto
  const [produtoId, setProdutoId] = useState<number | null>(null);
  const [saborId, setSaborId] = useState<number | null>(null);
  const [quantidade, setQuantidade] = useState("");
  const [adicionais, setAdicionais] = useState<number[]>([]);
  const [valorManual, setValorManual] = useState("");

  const produtosPrincipais = produtos.filter(p => p.tipo !== "adicional");
  const produto = produtosPrincipais.find(p => p.id === produtoId);
  const sabores = produto?.sabores || [];
  const adicionaisDisponiveis = produtos.filter(p => p.tipo === "adicional");

  // Calcula o preço do produto atual
  let valorUnitario = 0;
  if (produto) {
    if (produto.personalizavel && saborId) {
      const sabor = sabores.find(s => s.id === saborId);
      valorUnitario += sabor?.preco || 0;
    } else if (!produto.personalizavel && produto.sabores[0]) {
      valorUnitario += produto.sabores[0].preco || 0;
    }
  }
  for (const adicionalId of adicionais) {
    const adicional = adicionaisDisponiveis.find(a => a.id === adicionalId);
    valorUnitario += adicional?.sabores[0]?.preco || 0;
  }

  const quantidadeProduto = Number(quantidade) || 1;
  let valorTotalProduto = valorUnitario * quantidadeProduto;
  if (valorManual) valorTotalProduto = Number(valorManual);

  // Soma o valor de todos os produtos da encomenda
  const valorTotalEncomenda = produtosEncomenda.reduce((sum, p) => sum + p.valorTotal, 0);

  // Adiciona produto à lista da encomenda
  function adicionarProduto() {
    if (!produto) {
      alert("Selecione um produto!");
      return;
    }
    setProdutosEncomenda(prev => [
      ...prev,
      {
        id: Date.now() + Math.floor(Math.random() * 1000),
        produto: produto.nome,
        sabor: produto.personalizavel && saborId ? sabores.find(s => s.id === saborId)?.nome : undefined,
        quantidade: quantidadeProduto,
        adicionais: adicionaisDisponiveis.filter(a => adicionais.includes(a.id)).map(a => a.nome),
        valorUnitario,
        valorTotal: valorTotalProduto,
      }
    ]);
    // Limpa campos do produto
    setProdutoId(null);
    setSaborId(null);
    setQuantidade("");
    setAdicionais([]);
    setValorManual("");
  }

  function removerProduto(idx: number) {
    setProdutosEncomenda(produtosEncomenda.filter((_, i) => i !== idx));
  }

  // Ao salvar encomenda
  function salvarEncomenda() {
    if (!cliente || produtosEncomenda.length === 0) {
      alert("Preencha o nome do cliente e adicione pelo menos um produto!");
      return;
    }
    let valorPagoFinal = 0;
    if (pagamentoStatus === "pago-total") valorPagoFinal = valorTotalEncomenda;
    else if (pagamentoStatus === "pago-parcial") valorPagoFinal = Number(valorAdiantado) || 0;
    else valorPagoFinal = 0;

    adicionarEncomenda({
      id: Date.now(),
      cliente,
      telefone,
      produtos: produtosEncomenda,
      valorTotal: valorTotalEncomenda,
      valorPago: valorPagoFinal,
      pagamentoStatus,
      observacao,
      status: "fazendo",
      data: new Date().toISOString().split('T')[0]
    });

    // Limpa tudo
    setCliente("");
    setTelefone("");
    setProdutosEncomenda([]);
    setPagamentoStatus("nao-pago");
    setValorAdiantado("");
    setObservacao("");
    alert("Encomenda cadastrada!");
  }

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-8">
      <h2 className="text-3xl font-bold mb-8 text-pink-500 text-center tracking-tight">
        Nova Encomenda
      </h2>
      <div className="bg-white rounded-3xl shadow-2xl px-6 sm:px-10 py-8 flex flex-col gap-10">
        {/* Dados do cliente */}
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Nome da cliente*</label>
              <input
                className="border border-gray-300 rounded-lg w-full px-4 py-3 text-lg focus:border-pink-400 outline-none"
                placeholder="Nome da cliente"
                value={cliente}
                onChange={e => setCliente(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Telefone (opcional)</label>
              <input
                className="border border-gray-300 rounded-lg w-full px-4 py-3 text-lg focus:border-pink-400 outline-none"
                placeholder="Telefone (opcional)"
                value={telefone}
                onChange={e => setTelefone(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Produtos adicionados */}
        <div>
          <label className="block font-semibold mb-1 text-gray-700">Produtos na encomenda:</label>
          {produtosEncomenda.length === 0 ? (
            <div className="text-gray-400 text-sm mb-2">Nenhum produto adicionado ainda.</div>
          ) : (
            <ul className="mb-2 space-y-1">
              {produtosEncomenda.map((p, idx) => (
                <li key={p.id} className="flex gap-2 items-center text-base bg-pink-50 rounded-lg px-2 py-1 shadow-sm">
                  <span className="flex-1">
                    <span className="font-semibold">{p.quantidade}x</span> {p.produto}{p.sabor ? ` (${p.sabor})` : ""} {p.adicionais.length > 0 && `+ ${p.adicionais.join(", ")}`}
                  </span>
                  <span className="font-semibold text-pink-600">R$ {p.valorTotal.toFixed(2)}</span>
                  <button
                    onClick={() => removerProduto(idx)}
                    className="ml-2 px-2 text-xs rounded text-red-600 border border-red-300 hover:bg-red-100 transition"
                    title="Remover produto"
                  >
                    Remover
                  </button>
                </li>
              ))}
            </ul>
          )}
          {produtosEncomenda.length > 0 && (
            <div className="text-right text-pink-700 font-bold text-lg mt-2">
              Total: R$ {valorTotalEncomenda.toFixed(2)}
            </div>
          )}
        </div>

        {/* Formulário para adicionar produto */}
        <div className="pt-2">
          <label className="block font-semibold text-pink-700 mb-2 text-lg">Adicionar produto</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-1 flex flex-col gap-2">
              <label className="text-sm text-gray-700">Produto</label>
              <select
                className="border rounded-lg px-3 py-2 text-base focus:border-pink-400 outline-none"
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
            </div>
            {produto?.personalizavel && (
              <div className="col-span-1 flex flex-col gap-2">
                <label className="text-sm text-gray-700">Sabor / Recheio</label>
                <select
                  className="border rounded-lg px-3 py-2 text-base focus:border-pink-400 outline-none"
                  value={saborId ?? ""}
                  onChange={e => setSaborId(Number(e.target.value))}
                >
                  <option value="">Selecione o sabor</option>
                  {sabores.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nome} — R$ {s.preco.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {produto && (
              <div className="col-span-1 flex flex-col gap-2">
                <label className="text-sm text-gray-700">{produto.personalizavel ? "Peso (kg) ou Quantidade" : "Quantidade"}</label>
                <input
                  className="border rounded-lg px-3 py-2 text-base focus:border-pink-400 outline-none"
                  type="number"
                  min="1"
                  placeholder={produto.personalizavel ? "Peso/Quantidade" : "Quantidade"}
                  value={quantidade}
                  onChange={e => setQuantidade(e.target.value)}
                />
              </div>
            )}
            <div className="col-span-1 flex flex-col gap-2">
              <label className="text-sm text-gray-700">Adicionais</label>
              <div className="flex gap-2 flex-wrap">
                {adicionaisDisponiveis.map(a => (
                  <label key={a.id} className="flex items-center gap-1 text-xs bg-gray-100 rounded-md px-2 py-1">
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
                    {a.nome}
                  </label>
                ))}
              </div>
            </div>
            <div className="col-span-1 flex flex-col gap-2">
              <label className="text-sm text-gray-700">Valor manual (opcional)</label>
              <input
                className="border rounded-lg px-3 py-2 text-base focus:border-pink-400 outline-none"
                placeholder="R$"
                value={valorManual}
                onChange={e => setValorManual(e.target.value)}
                type="number"
                min="0"
              />
            </div>
            <div className="col-span-1 flex items-end">
              <button
                className="bg-blue-500 text-white rounded-lg px-6 py-2 font-semibold hover:bg-blue-600 transition-all"
                onClick={adicionarProduto}
                type="button"
              >
                Adicionar
              </button>
            </div>
          </div>
          {produto && (
            <div className="text-sm mt-2 text-right">
              <span className="font-semibold text-pink-600">Valor deste produto:</span> R$ {valorTotalProduto.toFixed(2)}
            </div>
          )}
        </div>

        {/* Pagamento e finalização */}
        <div className="border-t pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Status do Pagamento:</label>
              <select
                className="border rounded-lg px-3 py-2 text-base w-full focus:border-pink-400 outline-none"
                value={pagamentoStatus}
                onChange={e => setPagamentoStatus(e.target.value as any)}
              >
                <option value="nao-pago">Ainda não pagou</option>
                <option value="pago-parcial">Adiantou parte do valor</option>
                <option value="pago-total">Já pagou tudo</option>
              </select>
              {pagamentoStatus === "pago-parcial" && (
                <input
                  className="border rounded-lg px-3 py-2 text-base w-full mt-2 focus:border-pink-400 outline-none"
                  placeholder="Valor adiantado (R$)"
                  value={valorAdiantado}
                  onChange={e => setValorAdiantado(e.target.value)}
                  type="number"
                  min="0"
                  max={valorTotalEncomenda}
                />
              )}
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Observações</label>
              <textarea
                className="border rounded-lg px-3 py-2 text-base w-full min-h-[48px] max-h-[100px] focus:border-pink-400 outline-none"
                placeholder="Observações"
                value={observacao}
                onChange={e => setObservacao(e.target.value)}
              />
            </div>
          </div>
        </div>

        <button
          className="w-full bg-pink-500 text-white rounded-2xl py-4 text-lg font-bold tracking-wide hover:bg-pink-600 transition-all mt-4 shadow-xl"
          onClick={salvarEncomenda}
        >
          Salvar Encomenda
        </button>
      </div>
    </div>
  );
}
