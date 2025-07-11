import { useEncomendas } from "../context/EncomendasContext";

export default function Resumo() {
  const { encomendas } = useEncomendas();

  // Só considera encomendas não canceladas
  const validas = encomendas.filter(e => e.status !== "cancelada");

  // Soma correta: soma o valorTotal de todos os produtos de todas as encomendas válidas
  const totalVendido = validas.reduce(
    (sum, e) => sum + (e.produtos?.reduce((s, p) => s + (p.valorTotal || 0), 0) || 0),
    0
  );
  const totalRecebido = validas.reduce((sum, e) => sum + (e.valorPago || 0), 0);
  const totalPendente = totalVendido - totalRecebido;

  const totalEntregues = validas.filter(e => e.status === "entregue").length;
  const totalFazendo = validas.filter(e => e.status === "fazendo").length;
  const totalCanceladas = encomendas.filter(e => e.status === "cancelada").length;

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h2 className="text-2xl font-bold mb-6 text-pink-500">Resumo Financeiro</h2>
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
          <li>* <b>Total vendido:</b> soma de todos os pedidos não cancelados</li>
          <li>* <b>Total recebido:</b> soma de todos os pagamentos já feitos</li>
          <li>* <b>A receber:</b> diferença entre total vendido e recebido</li>
        </ul>
      </div>
    </div>
  );
}
