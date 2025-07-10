import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

// Tipos
export type Sabor = {
  id: number;
  nome: string;
  preco: number;
};

export type Produto = {
  id: number;
  nome: string;
  tipo: "bolo" | "brigadeiro" | "adicional";
  personalizavel: boolean;
  sabores: Sabor[]; // Para produto simples, 1 sabor = ele mesmo
};

type ProdutosContextType = {
  produtos: Produto[];
  adicionarProduto: (produto: Produto) => void;
  adicionarSabor: (produtoId: number, sabor: Sabor) => void;
};

const ProdutosContext = createContext<ProdutosContextType | undefined>(undefined);

export function ProdutosProvider({ children }: { children: ReactNode }) {
  const [produtos, setProdutos] = useState<Produto[]>([]);

  // Carrega do localStorage ao iniciar
  useEffect(() => {
    const data = localStorage.getItem("produtos");
    if (data) setProdutos(JSON.parse(data));
  }, []);

  // Salva no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem("produtos", JSON.stringify(produtos));
  }, [produtos]);

  function adicionarProduto(produto: Produto) {
    setProdutos((prev) => [...prev, produto]);
  }

  function adicionarSabor(produtoId: number, sabor: Sabor) {
    setProdutos((prev) =>
      prev.map((p) =>
        p.id === produtoId
          ? { ...p, sabores: [...p.sabores, sabor] }
          : p
      )
    );
  }

  return (
    <ProdutosContext.Provider value={{ produtos, adicionarProduto, adicionarSabor }}>
      {children}
    </ProdutosContext.Provider>
  );
}

export function useProdutos() {
  const context = useContext(ProdutosContext);
  if (!context) throw new Error("useProdutos precisa estar dentro do ProdutosProvider");
  return context;
}
