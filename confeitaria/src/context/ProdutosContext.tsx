import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { supabase } from '../lib/supabaseClient';

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
  adicionarProduto: (produto: Produto) => Promise<void>;
  adicionarSabor: (produtoId: number, sabor: Sabor) => Promise<void>;
  editarProduto: (produto: Produto) => Promise<void>;
  deletarProduto: (produtoId: number) => Promise<void>;
};

const ProdutosContext = createContext<ProdutosContextType | undefined>(undefined);

export function ProdutosProvider({ children }: { children: ReactNode }) {
  const [produtos, setProdutos] = useState<Produto[]>([]);

  // Buscar produtos e sabores do Supabase ao carregar
  useEffect(() => {
    async function fetchProdutos() {
      const { data: produtosData, error: produtosError } = await supabase
        .from('produtos')
        .select('*')
        .order('id', { ascending: true });
      if (produtosError) return;
      const { data: saboresData } = await supabase
        .from('sabores')
        .select('*');
      // Relacionar sabores aos produtos
      const produtosComSabores = (produtosData || []).map(prod => ({
        ...prod,
        sabores: (saboresData || []).filter(s => s.produto_id === prod.id)
      }));
      setProdutos(produtosComSabores);
    }
    fetchProdutos();
  }, []);

  // Adicionar produto e seus sabores
  async function adicionarProduto(produto: Produto) {
    // Inserir produto
    const { data: insertedProduto, error: produtoError } = await supabase
      .from('produtos')
      .insert([{
        nome: produto.nome,
        tipo: produto.tipo,
        personalizavel: produto.personalizavel
      }])
      .select()
      .single();
    if (produtoError || !insertedProduto) return;
    // Inserir sabores
    const saboresToInsert = produto.sabores.map(s => ({
      produto_id: insertedProduto.id,
      nome: s.nome,
      preco: s.preco
    }));
    const { data: insertedSabores } = await supabase
      .from('sabores')
      .insert(saboresToInsert)
      .select();
    setProdutos(prev => [
      ...prev,
      {
        ...insertedProduto,
        sabores: insertedSabores || []
      }
    ]);
  }

  // Adicionar sabor a um produto
  async function adicionarSabor(produtoId: number, sabor: Sabor) {
    const { data: insertedSabor, error } = await supabase
      .from('sabores')
      .insert([{ produto_id: produtoId, nome: sabor.nome, preco: sabor.preco }])
      .select()
      .single();
    if (error || !insertedSabor) return;
    setProdutos(prev => prev.map(p =>
      p.id === produtoId ? { ...p, sabores: [...p.sabores, insertedSabor] } : p
    ));
  }

  // Editar produto e seus sabores
  async function editarProduto(produto: Produto) {
    await supabase
      .from('produtos')
      .update({
        nome: produto.nome,
        tipo: produto.tipo,
        personalizavel: produto.personalizavel
      })
      .eq('id', produto.id);
    // Deletar sabores antigos
    await supabase.from('sabores').delete().eq('produto_id', produto.id);
    // Inserir novos sabores
    const saboresToInsert = produto.sabores.map(s => ({
      produto_id: produto.id,
      nome: s.nome,
      preco: s.preco
    }));
    const { data: insertedSabores } = await supabase
      .from('sabores')
      .insert(saboresToInsert)
      .select();
    setProdutos(prev => prev.map(p =>
      p.id === produto.id ? { ...produto, sabores: insertedSabores || [] } : p
    ));
  }

  // Deletar produto e seus sabores
  async function deletarProduto(produtoId: number) {
    await supabase.from('sabores').delete().eq('produto_id', produtoId);
    await supabase.from('produtos').delete().eq('id', produtoId);
    setProdutos(prev => prev.filter(p => p.id !== produtoId));
  }

  return (
    <ProdutosContext.Provider value={{ produtos, adicionarProduto, adicionarSabor, editarProduto, deletarProduto }}>
      {children}
    </ProdutosContext.Provider>
  );
}

export function useProdutos() {
  const context = useContext(ProdutosContext);
  if (!context) throw new Error("useProdutos precisa estar dentro do ProdutosProvider");
  return context;
}
