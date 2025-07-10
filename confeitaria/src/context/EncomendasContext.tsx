import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type EncomendaStatus = "fazendo" | "entregue" | "cancelada";
export type PagamentoStatus = "nao-pago" | "pago-parcial" | "pago-total";

export type Encomenda = {
  id: number;
  cliente: string;
  telefone?: string;
  produto: string;
  sabor?: string;
  quantidade: number;
  adicionais: string[];
  valorTotal: number;
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
    const data = localStorage.getItem("encomendas");
    if (data) setEncomendas(JSON.parse(data));
  }, []);

  useEffect(() => {
    localStorage.setItem("encomendas", JSON.stringify(encomendas));
  }, [encomendas]);

  function adicionarEncomenda(encomenda: Encomenda) {
    setEncomendas((prev) => [encomenda, ...prev]);
  }

  function atualizarStatus(
    id: number,
    status: EncomendaStatus,
    pagamentoStatus?: PagamentoStatus,
    valorPago?: number
  ) {
    setEncomendas((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              status,
              pagamentoStatus: pagamentoStatus ?? e.pagamentoStatus,
              valorPago: valorPago !== undefined ? valorPago : e.valorPago
            }
          : e
      )
    );
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
