import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import encomendas from "../encomendas.json"; // ajuste o caminho se necessário

// Tipo para produto da encomenda, permitindo 'sabor' opcional
interface ProdutoEncomenda {
  id: number;
  produto: string;
  quantidade: number;
  adicionais?: any[];
  valorUnitario: number;
  valorTotal: number;
  sabor?: string;
}

export default function MigrarEncomendas() {
  useEffect(() => {
    async function migrate() {
      // 0. Criar todos os produtos do JSON que não existem no Supabase
      const produtosUnicos = Array.from(
        new Set(
          encomendas.flatMap((e) => e.produtos.map((p: ProdutoEncomenda) => p.produto))
        )
      );
      for (const nomeProduto of produtosUnicos) {
        const { data: existente } = await supabase
          .from("produtos")
          .select("id")
          .eq("nome", nomeProduto)
          .single();
        if (!existente) {
          await supabase.from("produtos").insert([{ nome: nomeProduto }]);
        }
      }

      for (const encomenda of encomendas) {
        // 1. Verifica se todos os produtos existem
        let todosProdutosExistem = true;
        for (const prod of encomenda.produtos as ProdutoEncomenda[]) {
          const { data: produtoExistente } = await supabase
            .from("produtos")
            .select("id")
            .eq("nome", prod.produto)
            .single();
          if (!produtoExistente) {
            todosProdutosExistem = false;
            console.warn(
              `Produto "${prod.produto}" da encomenda de ${encomenda.cliente} não existe no banco.`
            );
            break;
          }
        }
        if (!todosProdutosExistem) continue;

        // 2. Cria a encomenda
        const { data: inserted, error } = await supabase
          .from("encomendas")
          .insert([
            {
              cliente: encomenda.cliente,
              telefone: encomenda.telefone || null,
              valor_total: encomenda.valorTotal,
              valor_pago: encomenda.valorPago,
              pagamento_status: encomenda.pagamentoStatus,
              observacao: encomenda.observacao || null,
              status: encomenda.status,
              data: encomenda.data,
            },
          ])
          .select()
          .single();

        if (error) {
          console.error("Erro ao inserir encomenda:", encomenda, error);
          continue;
        }

        // 3. Cria os produtos_encomenda
        for (const prod of encomenda.produtos as ProdutoEncomenda[]) {
          const insertObj: any = {
            encomenda_id: inserted.id,
            produto: prod.produto,
            quantidade: prod.quantidade,
            adicionais: JSON.stringify(prod.adicionais || []),
            valor_unitario: prod.valorUnitario,
            valor_total: prod.valorTotal,
          };
          if (prod.sabor !== undefined) insertObj.sabor = prod.sabor;
          await supabase.from("produtos_encomenda").insert([insertObj]);
        }
      }
      alert("Migração concluída!");
    }

    migrate();
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-pink-500">Migrando encomendas...</h2>
      <p>Veja o console para detalhes.</p>
    </div>
  );
}