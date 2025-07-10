import { createContext, useContext, useEffect, useState, ReactNode } from "react";

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
  dataCompra: string;
  proximaCompra: string;
  observacao?: string;
  pagamentos: Pagamento[]; // NOVO!
};

type GastosContextType = {
  gastos: Gasto[];
  adicionarGasto: (gasto: Gasto) => void;
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

  return (
    <GastosContext.Provider value={{ gastos, adicionarGasto }}>
      {children}
    </GastosContext.Provider>
  );
}

export function useGastos() {
  const context = useContext(GastosContext);
  if (!context) throw new Error("useGastos precisa estar dentro do GastosProvider");
  return context;
}
