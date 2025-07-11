import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { supabase } from "../lib/supabaseClient";

export type EncomendaStatus = "fazendo" | "entregue" | "cancelada";
export type PagamentoStatus = "nao-pago" | "pago-parcial" | "pago-total";

export type ProdutoEncomenda = {
  id: number;
  produto: string;
  sabor?: string;
  quantidade: number;
  adicionais: string[];
  valorUnitario: number;
  valorTotal: number;
};

export type Encomenda = {
  id: number;
  cliente: string;
  telefone?: string;
  produtos: ProdutoEncomenda[];  // AGORA UM ARRAY
  valorTotal: number;             // Soma de todos os produtos
  valorPago: number;
  pagamentoStatus: PagamentoStatus;
  observacao?: string;
  status: EncomendaStatus;
  data: string;
};

type EncomendasContextType = {
  encomendas: Encomenda[];
  adicionarEncomenda: (encomenda: Encomenda) => void;
  atualizarStatus: (
    id: number,
    status: EncomendaStatus,
    pagamentoStatus?: PagamentoStatus,
    valorPago?: number
  ) => void;
};

const EncomendasContext = createContext<EncomendasContextType | undefined>(undefined);

export function EncomendasProvider({ children }: { children: ReactNode }) {
  const [encomendas, setEncomendas] = useState<Encomenda[]>([]);

  useEffect(() => {
    async function fetchEncomendas() {
      // Busca encomendas
      const { data: encomendasData, error: encomendasError } = await supabase
        .from("encomendas")
        .select();
      if (encomendasError) {
        console.error("Erro ao buscar encomendas:", encomendasError);
        return;
      }
      // Busca produtos_encomenda
      const { data: produtosData, error: produtosError } = await supabase
        .from("produtos_encomenda")
        .select();
      if (produtosError) {
        console.error("Erro ao buscar produtos_encomenda:", produtosError);
        return;
      }
      // Monta as encomendas com seus produtos
      const encomendasComProdutos: Encomenda[] = (encomendasData || []).map((e: any) => ({
        id: e.id,
        cliente: e.cliente,
        telefone: e.telefone,
        valorTotal: Number(e.valor_total),
        valorPago: Number(e.valor_pago),
        pagamentoStatus: e.pagamento_status,
        observacao: e.observacao,
        status: e.status,
        data: e.data,
        produtos: (produtosData || [])
          .filter((p: any) => p.encomenda_id === e.id)
          .map((p: any) => ({
            id: p.id,
            produto: p.produto,
            sabor: p.sabor || undefined,
            quantidade: Number(p.quantidade),
            adicionais: p.adicionais ? JSON.parse(p.adicionais) : [],
            valorUnitario: Number(p.valor_unitario),
            valorTotal: Number(p.valor_total),
          })),
      }));
      setEncomendas(encomendasComProdutos);
    }
    fetchEncomendas();
  }, []);

  // As funções abaixo ainda só atualizam localmente. Para produção, adapte para atualizar no Supabase também.
  async function adicionarEncomenda(encomenda: Encomenda) {
    // 1. Insere encomenda
    const { data: encomendaData, error: encomendaError } = await supabase
      .from("encomendas")
      .insert([
        {
          id: encomenda.id,
          cliente: encomenda.cliente,
          telefone: encomenda.telefone,
          valor_total: encomenda.valorTotal,
          valor_pago: encomenda.valorPago,
          pagamento_status: encomenda.pagamentoStatus,
          observacao: encomenda.observacao,
          status: encomenda.status,
          data: encomenda.data,
        },
      ])
      .select()
      .single();
    if (encomendaError || !encomendaData) {
      alert("Erro ao salvar encomenda no banco!");
      return;
    }
    // 2. Insere produtos_encomenda
    for (const p of encomenda.produtos) {
      await supabase.from("produtos_encomenda").insert([
        {
          encomenda_id: encomendaData.id,
          produto: p.produto,
          sabor: p.sabor || null,
          quantidade: p.quantidade,
          adicionais: JSON.stringify(p.adicionais || []),
          valor_unitario: p.valorUnitario,
          valor_total: p.valorTotal,
        },
      ]);
    }
    // 3. Atualiza estado local (refaz fetch)
    const { data: encomendasData, error: encomendasError } = await supabase
      .from("encomendas")
      .select();
    const { data: produtosData, error: produtosError } = await supabase
      .from("produtos_encomenda")
      .select();
    if (!encomendasError && !produtosError) {
      const encomendasComProdutos: Encomenda[] = (encomendasData || []).map((e: any) => ({
        id: e.id,
        cliente: e.cliente,
        telefone: e.telefone,
        valorTotal: Number(e.valor_total),
        valorPago: Number(e.valor_pago),
        pagamentoStatus: e.pagamento_status,
        observacao: e.observacao,
        status: e.status,
        data: e.data,
        produtos: (produtosData || [])
          .filter((p: any) => p.encomenda_id === e.id)
          .map((p: any) => ({
            id: p.id,
            produto: p.produto,
            sabor: p.sabor || undefined,
            quantidade: Number(p.quantidade),
            adicionais: p.adicionais ? JSON.parse(p.adicionais) : [],
            valorUnitario: Number(p.valor_unitario),
            valorTotal: Number(p.valor_total),
          })),
      }));
      setEncomendas(encomendasComProdutos);
    }
  }

  async function atualizarStatus(
    id: number,
    status: EncomendaStatus,
    pagamentoStatus?: PagamentoStatus,
    valorPago?: number
  ) {
    // Atualiza no banco
    const { error } = await supabase
      .from("encomendas")
      .update({
        status,
        pagamento_status: pagamentoStatus,
        valor_pago: valorPago,
      })
      .eq("id", id);
    if (error) {
      alert("Erro ao atualizar encomenda no banco!");
      return;
    }
    // Atualiza estado local (refaz fetch)
    const { data: encomendasData, error: encomendasError } = await supabase
      .from("encomendas")
      .select();
    const { data: produtosData, error: produtosError } = await supabase
      .from("produtos_encomenda")
      .select();
    if (!encomendasError && !produtosError) {
      const encomendasComProdutos: Encomenda[] = (encomendasData || []).map((e: any) => ({
        id: e.id,
        cliente: e.cliente,
        telefone: e.telefone,
        valorTotal: Number(e.valor_total),
        valorPago: Number(e.valor_pago),
        pagamentoStatus: e.pagamento_status,
        observacao: e.observacao,
        status: e.status,
        data: e.data,
        produtos: (produtosData || [])
          .filter((p: any) => p.encomenda_id === e.id)
          .map((p: any) => ({
            id: p.id,
            produto: p.produto,
            sabor: p.sabor || undefined,
            quantidade: Number(p.quantidade),
            adicionais: p.adicionais ? JSON.parse(p.adicionais) : [],
            valorUnitario: Number(p.valor_unitario),
            valorTotal: Number(p.valor_total),
          })),
      }));
      setEncomendas(encomendasComProdutos);
    }
  }

  return (
    <EncomendasContext.Provider value={{ encomendas, adicionarEncomenda, atualizarStatus }}>
      {children}
    </EncomendasContext.Provider>
  );
}

export function useEncomendas() {
  const context = useContext(EncomendasContext);
  if (!context) throw new Error("useEncomendas precisa estar dentro do EncomendasProvider");
  return context;
}
