import { useState } from "react";
import { useProdutos } from "../context/ProdutosContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function Produtos() {
  const { produtos, adicionarProduto, adicionarSabor, editarProduto, deletarProduto } = useProdutos();
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<"bolo" | "brigadeiro" | "adicional">("bolo");
  const [personalizavel, setPersonalizavel] = useState(false);
  const [preco, setPreco] = useState(""); // Para produto simples

  // para cadastro de sabor
  const [saborNome, setSaborNome] = useState("");
  const [saborPreco, setSaborPreco] = useState("");
  const [selectedProdutoId] = useState<number | null>(null);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editProduto, setEditProduto] = useState<any>(null);

  function handleAdicionarProduto() {
    if (!nome || (!personalizavel && !preco)) return;
    const novoProduto = {
      id: Date.now(),
      nome,
      tipo,
      personalizavel,
      sabores: personalizavel
        ? []
        : [{
            id: Date.now(),
            nome,
            preco: Number(preco.replace(",", "."))
          }],
    };
    adicionarProduto(novoProduto);
    setNome("");
    setTipo("bolo");
    setPersonalizavel(false);
    setPreco("");
  }

  function handleAdicionarSabor(produtoId: number) {
    if (!saborNome || !saborPreco) return;
    adicionarSabor(produtoId, {
      id: Date.now(),
      nome: saborNome,
      preco: Number(saborPreco.replace(",", ".")),
    });
    setSaborNome("");
    setSaborPreco("");
  }

  function startEdit(produto: any) {
    setEditandoId(produto.id);
    setEditProduto({ ...produto });
  }

  function salvarEdicao() {
    if (editProduto) {
      editarProduto(editProduto);
      setEditandoId(null);
      setEditProduto(null);
    }
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setEditProduto(null);
  }

  function handleDeletar(id: number) {
    if (confirm("Tem certeza que deseja deletar este produto?")) {
      deletarProduto(id);
    }
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
              onChange={(e) => setTipo(e.target.value as any)}
            >
              <option value="bolo">Bolo</option>
              <option value="brigadeiro">Brigadeiro</option>
              <option value="adicional">Adicional/Decoração</option>
            </select>
            {tipo !== "adicional" && (
              <div className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  checked={personalizavel}
                  onChange={e => setPersonalizavel(e.target.checked)}
                  id="personalizavel"
                />
                <label htmlFor="personalizavel" className="text-gray-700">
                  Esse produto pode ter sabores/recheios?
                </label>
              </div>
            )}
            {/* Se NÃO for personalizável, pede preço direto */}
            {(!personalizavel || tipo === "adicional") && (
              <Input
                placeholder="Preço (R$)"
                value={preco}
                onChange={e => setPreco(e.target.value)}
                type="number"
                min="0"
                className="text-lg"
              />
            )}
            <Button
              className="bg-pink-500 text-white rounded-xl py-3 text-lg hover:bg-pink-600 transition-all"
              onClick={handleAdicionarProduto}
            >
              Adicionar Produto
            </Button>
          </div>
        </CardContent>
      </Card>

      <h3 className="text-xl font-semibold mb-3">Produtos cadastrados</h3>
      <div className="grid gap-4">
        {produtos.map((p) => (
          <Card key={p.id} className="rounded-2xl border-pink-200 mb-2">
            <CardContent>
              {editandoId === p.id ? (
                <div className="flex flex-col gap-2 py-2">
                  <Input
                    value={editProduto.nome}
                    onChange={e => setEditProduto((ep: any) => ({ ...ep, nome: e.target.value }))}
                    className="text-lg"
                  />
                  <select
                    className="border rounded-xl p-3 text-lg focus:outline-pink-500"
                    value={editProduto.tipo}
                    onChange={e => setEditProduto((ep: any) => ({ ...ep, tipo: e.target.value }))}
                  >
                    <option value="bolo">Bolo</option>
                    <option value="brigadeiro">Brigadeiro</option>
                    <option value="adicional">Adicional/Decoração</option>
                  </select>
                  <div className="flex gap-2 items-center">
                    <input
                      type="checkbox"
                      checked={editProduto.personalizavel}
                      onChange={e => setEditProduto((ep: any) => ({ ...ep, personalizavel: e.target.checked }))}
                      id={`personalizavel-edit-${p.id}`}
                    />
                    <label htmlFor={`personalizavel-edit-${p.id}`} className="text-gray-700">
                      Esse produto pode ter sabores/recheios?
                    </label>
                  </div>
                  {/* Se NÃO for personalizável, pede preço direto */}
                  {(!editProduto.personalizavel || editProduto.tipo === "adicional") && (
                    <Input
                      value={editProduto.sabores[0]?.preco ?? ""}
                      onChange={e => setEditProduto((ep: any) => ({
                        ...ep,
                        sabores: [{ ...ep.sabores[0], preco: Number(e.target.value) }]
                      }))}
                      type="number"
                      min="0"
                      className="text-lg"
                    />
                  )}
                  <div className="flex gap-2 mt-2">
                    <Button className="bg-pink-500 text-white hover:bg-pink-600" onClick={salvarEdicao}>Salvar</Button>
                    <Button className="bg-pink-100 text-pink-600 hover:bg-pink-200" onClick={cancelarEdicao}>Cancelar</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between py-2">
                  <div>
                    <strong className="text-pink-600">{p.nome}</strong>
                    <span className="text-xs text-gray-500 ml-2">({p.tipo}{p.personalizavel ? " — personalizável" : ""})</span>
                  </div>
                  <div className="flex gap-2">
                    <Button className="bg-pink-500 text-white hover:bg-pink-600 text-xs" onClick={() => startEdit(p)}>Editar</Button>
                    <Button className="bg-pink-100 text-pink-600 hover:bg-pink-200 text-xs border border-pink-300" onClick={() => handleDeletar(p.id)}>Deletar</Button>
                  </div>
                </div>
              )}
              {/* Cadastro de sabores/recheios */}
              {selectedProdutoId === p.id && p.personalizavel && (
                <div className="mt-4 bg-pink-50 p-4 rounded-xl">
                  <div className="flex gap-3 items-end mb-2">
                    <Input
                      placeholder="Nome do sabor/recheio"
                      value={saborNome}
                      onChange={(e) => setSaborNome(e.target.value)}
                    />
                    <Input
                      placeholder="Preço (R$)"
                      value={saborPreco}
                      onChange={(e) => setSaborPreco(e.target.value)}
                      type="number"
                      min="0"
                      className="w-32"
                    />
                    <Button
                      onClick={() => handleAdicionarSabor(p.id)}
                      className="bg-pink-400 text-white"
                    >
                      Adicionar
                    </Button>
                  </div>
                  <div>
                    {p.sabores.length === 0 ? (
                      <span className="text-xs text-gray-400">Nenhum sabor cadastrado.</span>
                    ) : (
                      <ul className="list-disc ml-5">
                        {p.sabores.map((s) => (
                          <li key={s.id} className="mb-1">
                            <span className="font-medium">{s.nome}</span>{" "}
                            <span className="text-xs text-gray-500">
                              — R$ {s.preco.toFixed(2)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
              {/* Para simples/adicional, mostra preço direto */}
              {!p.personalizavel && p.sabores[0] && (
                <div className="text-sm text-gray-700 mt-2">
                  Preço: <span className="font-bold">R$ {p.sabores[0].preco.toFixed(2)}</span>
                </div>
              )}
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
