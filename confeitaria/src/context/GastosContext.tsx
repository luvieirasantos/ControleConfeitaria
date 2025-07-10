import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { supabase } from '../lib/supabaseClient';

export type Pagamento = {
  id: number;
  tipo: "dinheiro" | "cartao" | "pix" | "boleto";
  valor: number;
  cartaoNome?: string;
  vencimentoFatura?: string;
  parcela?: number; // número da parcela, se for parcelado
  totalParcelas?: number; // total de parcelas, se for parcelado
};

export type Gasto = {
  id: number;
  valor: number;
  mercado: string;
  dataCompra: string;        // yyyy-mm-dd
  proximaCompra: string;     // yyyy-mm-dd (estimativa)
  observacao?: string;
  pagamentos: Pagamento[];   // Vários pagamentos possíveis!
};

type GastosContextType = {
  gastos: Gasto[];
  adicionarGasto: (gasto: Gasto) => Promise<void>;
  editarGasto: (gasto: Gasto) => Promise<void>;
  deletarGasto: (id: number) => Promise<void>;
};

const GastosContext = createContext<GastosContextType | undefined>(undefined);

export function GastosProvider({ children }: { children: ReactNode }) {
  const [gastos, setGastos] = useState<Gasto[]>([]);

  // Buscar gastos e pagamentos do Supabase ao carregar
  useEffect(() => {
    async function fetchGastos() {
      const { data: gastosData, error: gastosError } = await supabase
        .from('gastos')
        .select('*')
        .order('id', { ascending: false });
      if (gastosError) return;
      const { data: pagamentosData } = await supabase
        .from('pagamentos')
        .select('*');
      // Relacionar pagamentos aos gastos
      const gastosComPagamentos = (gastosData || []).map(g => ({
        ...g,
        pagamentos: (pagamentosData || []).filter(p => p.gasto_id === g.id)
      }));
      setGastos(gastosComPagamentos);
    }
    fetchGastos();
  }, []);

  // Adicionar gasto e pagamentos no Supabase
  async function adicionarGasto(gasto: Gasto) {
    // Inserir gasto
    const { data: insertedGasto, error: gastoError } = await supabase
      .from('gastos')
      .insert([{
        valor: gasto.valor,
        mercado: gasto.mercado,
        data_compra: gasto.dataCompra,
        proxima_compra: gasto.proximaCompra,
        observacao: gasto.observacao
      }])
      .select()
      .single();
    if (gastoError || !insertedGasto) return;
    // Inserir pagamentos
    const pagamentosToInsert = gasto.pagamentos.map(p => ({
      gasto_id: insertedGasto.id,
      tipo: p.tipo,
      valor: p.valor,
      cartao_nome: p.cartaoNome,
      vencimento_fatura: p.vencimentoFatura,
      parcela: p.parcela,
      total_parcelas: p.totalParcelas
    }));
    const { data: insertedPagamentos } = await supabase
      .from('pagamentos')
      .insert(pagamentosToInsert)
      .select();
    setGastos(prev => [{
      ...insertedGasto,
      dataCompra: insertedGasto.data_compra,
      proximaCompra: insertedGasto.proxima_compra,
      pagamentos: insertedPagamentos || []
    }, ...prev]);
  }

  // Editar gasto e pagamentos
  async function editarGasto(gasto: Gasto) {
    await supabase
      .from('gastos')
      .update({
        valor: gasto.valor,
        mercado: gasto.mercado,
        data_compra: gasto.dataCompra,
        proxima_compra: gasto.proximaCompra,
        observacao: gasto.observacao
      })
      .eq('id', gasto.id);
    // Deletar pagamentos antigos
    await supabase.from('pagamentos').delete().eq('gasto_id', gasto.id);
    // Inserir novos pagamentos
    const pagamentosToInsert = gasto.pagamentos.map(p => ({
      gasto_id: gasto.id,
      tipo: p.tipo,
      valor: p.valor,
      cartao_nome: p.cartaoNome,
      vencimento_fatura: p.vencimentoFatura,
      parcela: p.parcela,
      total_parcelas: p.totalParcelas
    }));
    await supabase.from('pagamentos').insert(pagamentosToInsert);
    // Atualizar local
    setGastos(prev => prev.map(g => g.id === gasto.id ? gasto : g));
  }

  // Deletar gasto e pagamentos
  async function deletarGasto(id: number) {
    await supabase.from('pagamentos').delete().eq('gasto_id', id);
    await supabase.from('gastos').delete().eq('id', id);
    setGastos(prev => prev.filter(g => g.id !== id));
  }

  return (
    <GastosContext.Provider value={{ gastos, adicionarGasto, editarGasto, deletarGasto }}>
      {children}
    </GastosContext.Provider>
  );
}

export function useGastos() {
  const context = useContext(GastosContext);
  if (!context) throw new Error("useGastos precisa estar dentro do GastosProvider");
  return context;
}
