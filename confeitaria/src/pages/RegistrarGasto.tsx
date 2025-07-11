import React, { useState } from "react";
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
  const [pagDiaVirada, setPagDiaVirada] = useState<number | "">("");

  // Adição dos estados para parcelamento
  const [parcelado, setParcelado] = useState(false);
  const [qtdParcelas, setQtdParcelas] = useState(2);

  // Adiciona pagamento à lista temporária
  function adicionarPagamentoTemp() {
    if (!pagValor) {
      alert("Informe o valor do pagamento.");
      return;
    }
    // Para cartão de crédito parcelado
    if (pagTipo === "cartao" && parcelado && qtdParcelas > 1) {
      if (!pagCartaoNome || !pagDiaVirada) {
        alert("Informe o nome do cartão e o dia de virada.");
        return;
      }
      const dataCompraDate = new Date(dataCompra);
      const diaVirada = typeof pagDiaVirada === 'number' ? pagDiaVirada : 1;
      let mesPrimeiraParcela = dataCompraDate.getMonth();
      let anoPrimeiraParcela = dataCompraDate.getFullYear();
      if (dataCompraDate.getDate() > diaVirada) {
        mesPrimeiraParcela++;
        if (mesPrimeiraParcela > 11) {
          mesPrimeiraParcela = 0;
          anoPrimeiraParcela++;
        }
      }
      const valorParcela = (Number(pagValor.replace(",", ".")) / qtdParcelas);
      const novasParcelas = Array.from({ length: qtdParcelas }, (_, i) => {
        let mes = mesPrimeiraParcela + i;
        let ano = anoPrimeiraParcela;
        while (mes > 11) {
          mes -= 12;
          ano++;
        }
        const venc = new Date(ano, mes, diaVirada as number);
        return {
          tipo: pagTipo,
          valor: valorParcela.toFixed(2),
          cartaoNome: pagCartaoNome,
          vencimentoFatura: venc.toISOString().split("T")[0],
          parcela: i + 1,
          totalParcelas: qtdParcelas
        };
      });
      setPagamentos((prev: PagamentoInput[]) => [...prev, ...novasParcelas]);
    } else if (pagTipo === "cartao") {
      // Cartão de crédito à vista
      if (!pagCartaoNome || !pagDiaVirada) {
        alert("Informe o nome do cartão e o dia de virada.");
        return;
      }
      const dataCompraDate = new Date(dataCompra);
      const diaVirada = typeof pagDiaVirada === 'number' ? pagDiaVirada : 1;
      let mesParcela = dataCompraDate.getMonth();
      let anoParcela = dataCompraDate.getFullYear();
      if (dataCompraDate.getDate() > diaVirada) {
        mesParcela++;
        if (mesParcela > 11) {
          mesParcela = 0;
          anoParcela++;
        }
      }
      const venc = new Date(anoParcela, mesParcela, diaVirada as number);
      setPagamentos((prev: PagamentoInput[]) => [
        ...prev,
        {
          tipo: pagTipo,
          valor: pagValor,
          cartaoNome: pagCartaoNome,
          vencimentoFatura: venc.toISOString().split("T")[0],
        }
      ]);
    } else {
      // Dinheiro, Pix, Boleto: vencimento é a data da compra
      setPagamentos((prev: PagamentoInput[]) => [
        ...prev,
        {
          tipo: pagTipo,
          valor: pagValor,
          vencimentoFatura: dataCompra, // para filtro mensal
        }
      ]);
    }
    setPagTipo("dinheiro");
    setPagValor("");
    setPagCartaoNome("");
    setPagVencimento("");
    setPagDiaVirada("");
    setParcelado(false);
    setQtdParcelas(2);
  }

  function removerPagamentoTemp(idx: number) {
    setPagamentos((pagamentos: PagamentoInput[]) => pagamentos.filter((_, i) => i !== idx));
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
      pagamentos: pagamentos.map((p: PagamentoInput, idx: number) => ({
        id: idx + 1,
        tipo: p.tipo,
        valor: Number(p.valor.replace(",", ".")),
        cartaoNome: p.cartaoNome,
        vencimentoFatura: p.vencimentoFatura,
        parcela: (p as any).parcela,
        totalParcelas: (p as any).totalParcelas
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

  const somaPag = pagamentos.reduce((sum: number, p: PagamentoInput) => sum + Number(p.valor.replace(",", ".")), 0);

  return (
    <div className="max-w-xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6 text-pink-500">Registrar Gasto</h2>
      <div className="flex flex-col gap-4 bg-white rounded-2xl shadow-xl p-8">
        <input
          className="border rounded-xl p-3 text-lg"
          placeholder="Valor total da nota (R$)"
          value={valor}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValor(e.target.value)}
          type="number"
          min="0"
        />
        <input
          className="border rounded-xl p-3 text-lg"
          placeholder="Mercado/Loja"
          value={mercado}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMercado(e.target.value)}
        />
        <label className="font-semibold">Data da Compra:</label>
        <input
          className="border rounded-xl p-3 text-lg"
          value={dataCompra}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDataCompra(e.target.value)}
          type="date"
        />
        <label className="font-semibold">Estimativa da Próxima Compra:</label>
        <input
          className="border rounded-xl p-3 text-lg"
          value={proximaCompra}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProximaCompra(e.target.value)}
          type="date"
        />
        <textarea
          className="border rounded-xl p-3 text-lg"
          placeholder="Observações (opcional)"
          value={observacao}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setObservacao(e.target.value)}
        />

        {/* Adição de Pagamentos */}
        <div className="border-t pt-6 mt-8">
          <h3 className="text-xl font-bold mb-4 text-pink-500">Adicionar Pagamento</h3>
          <div className="bg-gray-50 rounded-2xl shadow-inner p-6 flex flex-col gap-4 max-w-2xl mx-auto">
            <div className="flex flex-wrap gap-4 items-end">
              {/* Tipo de pagamento com ícones */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-1">Tipo</label>
                <select
                  className="border rounded-xl p-3 text-lg min-w-[140px]"
                  value={pagTipo}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPagTipo(e.target.value as any)}
                >
                  <option value="dinheiro">💵 Dinheiro</option>
                  <option value="cartao">💳 Cartão de Crédito</option>
                  <option value="pix">⚡ PIX</option>
                  <option value="boleto">🏷️ Boleto</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-1">Valor (R$)</label>
                <input
                  className="border rounded-xl p-3 text-lg"
                  type="number"
                  min="0"
                  placeholder="Valor"
                  value={pagValor}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPagValor(e.target.value)}
                  style={{ width: 120 }}
                />
              </div>
              {pagTipo === "cartao" && (
                <>
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold mb-1">Nome do cartão</label>
                    <input
                      className="border rounded-xl p-3 text-lg"
                      placeholder="Ex: Nubank"
                      value={pagCartaoNome}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPagCartaoNome(e.target.value)}
                      style={{ width: 140 }}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold mb-1">Dia de virada do cartão</label>
                    <input
                      className="border rounded-xl p-3 text-lg"
                      type="number"
                      min="1"
                      max="28"
                      placeholder="Ex: 9"
                      value={pagDiaVirada || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPagDiaVirada(Number(e.target.value))}
                      style={{ width: 120 }}
                    />
                  </div>
                  <div className="flex flex-col items-center justify-end">
                    <label className="text-sm font-semibold mb-1">Parcelar?</label>
                    <label className="inline-flex items-center cursor-pointer">
                      <span className="mr-2 text-gray-600">Não</span>
                      <input
                        type="checkbox"
                        checked={parcelado}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setParcelado(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-pink-400 transition-all"></div>
                      <div className="absolute w-5 h-5 bg-white border rounded-full left-1 top-1 peer-checked:translate-x-5 transition-transform"></div>
                      <span className="ml-2 text-pink-600">Sim</span>
                    </label>
                  </div>
                  {parcelado && (
                    <div className="flex flex-col">
                      <label className="text-sm font-semibold mb-1">Qtd. parcelas</label>
                      <input
                        className="border rounded-xl p-3 text-lg"
                        type="number"
                        min="2"
                        max="24"
                        placeholder="Parcelas"
                        value={qtdParcelas}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQtdParcelas(Number(e.target.value))}
                        style={{ width: 100 }}
                      />
                    </div>
                  )}
                </>
              )}
              <button
                className="bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl px-6 py-3 shadow transition-all mt-6"
                type="button"
                onClick={adicionarPagamentoTemp}
              >
                Adicionar Pagamento
              </button>
            </div>
          </div>
          {/* Lista dos pagamentos inseridos */}
          {pagamentos.length > 0 && (
            <div className="mt-8 grid gap-4">
              {pagamentos.map((p, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-white border border-gray-200 rounded-2xl shadow p-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-pink-100">
                    {p.tipo === "dinheiro" && <span className="text-green-500 text-xl">💵</span>}
                    {p.tipo === "cartao" && <span className="text-pink-500 text-xl">💳</span>}
                    {p.tipo === "pix" && <span className="text-blue-500 text-xl">⚡</span>}
                    {p.tipo === "boleto" && <span className="text-gray-500 text-xl">🏷️</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-pink-600">R$ {Number(p.valor).toFixed(2)}</span>
                      {p.tipo === "cartao" && (p as any).parcela && (p as any).totalParcelas && (
                        <span className="bg-pink-100 text-pink-700 text-xs font-semibold px-2 py-1 rounded-full ml-2">Parcela {(p as any).parcela} de {(p as any).totalParcelas}</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-700">
                      {p.tipo === "cartao" && p.cartaoNome && (
                        <span className="mr-2">{p.cartaoNome}</span>
                      )}
                      {p.tipo === "cartao" && p.vencimentoFatura && (
                        <span className="mr-2">Venc: {p.vencimentoFatura}</span>
                      )}
                    </div>
                  </div>
                  <button
                    className="ml-2 text-red-500 font-bold hover:underline"
                    type="button"
                    onClick={() => removerPagamentoTemp(idx)}
                  >Remover</button>
                </div>
              ))}
            </div>
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
