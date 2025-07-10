// src/pages/Produtos.tsx

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

type Produto = {
  id: number;
  nome: string;
  tipo: "bolo-recheado" | "bolo-caseiro" | "brigadeiro" | "adicional";
  preco: number;
};

export default function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<Produto["tipo"]>("bolo-recheado");
  const [preco, setPreco] = useState("");

  function adicionarProduto() {
    if (!nome || !preco) return;
    setProdutos([
      ...produtos,
      { id: Date.now(), nome, tipo, preco: Number(preco.replace(",", ".")) },
    ]);
    setNome("");
    setPreco("");
  }

  return (
    <div>
      <Card className="mb-8 shadow-2xl">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold mb-4 text-pink-500">Cadastrar Produto</h2>
          <div className="flex flex-col gap-4">
            <Input
              placeholder="Nome do produto"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="text-lg"
            />
            <select
              className="border rounded-xl p-3 text-lg focus:outline-pink-500"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as Produto["tipo"])}
            >
              <option value="bolo-recheado">Bolo Recheado (kg)</option>
              <option value="bolo-caseiro">Bolo Caseiro (unidade)</option>
              <option value="brigadeiro">Brigadeiro (unidade)</option>
              <option value="adicional">Adicional/Decoração</option>
            </select>
            <Input
              placeholder="Preço (R$)"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              type="number"
              min="0"
              className="text-lg"
            />
            <Button
              className="bg-pink-500 text-white rounded-xl py-3 text-lg hover:bg-pink-600 transition-all"
              onClick={adicionarProduto}
            >
              Adicionar Produto
            </Button>
          </div>
        </CardContent>
      </Card>
      <h3 className="text-xl font-semibold mb-3">Produtos cadastrados</h3>
      <div className="grid gap-2">
        {produtos.map((p) => (
          <Card key={p.id} className="rounded-2xl border-pink-200">
            <CardContent className="flex justify-between items-center py-3 px-5">
              <span>
                <strong className="text-pink-600">{p.nome}</strong>{" "}
                <span className="text-xs text-gray-500">({p.tipo})</span>
              </span>
              <span className="font-bold text-lg">R$ {p.preco.toFixed(2)}</span>
            </CardContent>
          </Card>
        ))}
        {produtos.length === 0 && (
          <span className="text-gray-400">Nenhum produto cadastrado ainda.</span>
        )}
      </div>
    </div>
  );
}
