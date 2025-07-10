import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export type Pagamento = {
  id: number;
  tipo: "dinheiro" | "cartao" | "pix" | "boleto";
  valor: number;
  cartaoNome?: string;
  vencimentoFatura?: string;
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
  adicionarGasto: (gasto: Gasto) => void;
  editarGasto: (gasto: Gasto) => void;
  deletarGasto: (id: number) => void;
};

const GastosContext = createContext<GastosContextType | undefined>(undefined);

export function GastosProvider({ children }: { children: ReactNode }) {
  const [gastos, setGastos] = useState<Gasto[]>([]);

  useEffect(() => {
    const data = localStorage.getItem("gastos");
    if (data) setGastos(JSON.parse(data));
  }, []);

  useEffect(() => {
    localStorage.setItem("gastos", JSON.stringify(gastos));
  }, [gastos]);

  function adicionarGasto(gasto: Gasto) {
    setGastos((prev) => [gasto, ...prev]);
  }

  function editarGasto(gasto: Gasto) {
    setGastos((prev) => prev.map(g => g.id === gasto.id ? gasto : g));
  }

  function deletarGasto(id: number) {
    setGastos((prev) => prev.filter(g => g.id !== id));
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
