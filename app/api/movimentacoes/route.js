// app/api/movimentacoes/route.js
import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

export async function POST(request) {
  try {
    // 1. Recebe os dados do corpo da requisição (frontend)
    const { codigo_produto, tipo, quantidade, motivo } = await request.json();

    // Validação básica de segurança
    if (!codigo_produto || !tipo || !quantidade) {
      return NextResponse.json({ erro: "Dados incompletos" }, { status: 400 });
    }

    // 2. Busca o estoque atual do produto
    const { data: produto, error: erroBusca } = await supabase
      .from("produtos")
      .select("estoque_atual")
      .eq("codigo", codigo_produto)
      .single();

    if (erroBusca || !produto) {
      return NextResponse.json(
        { erro: "Produto não encontrado" },
        { status: 404 },
      );
    }

    // 3. Calcula o novo estoque
    let novoEstoque = produto.estoque_atual;
    const qtdNumber = Number(quantidade);

    if (tipo === "entrada") {
      novoEstoque += qtdNumber;
    } else if (tipo === "saida") {
      novoEstoque -= qtdNumber;

      // 4. Regra de Segurança: Impede estoque negativo
      if (novoEstoque < 0) {
        return NextResponse.json(
          { erro: "Estoque insuficiente para esta saída" },
          { status: 400 },
        );
      }
    } else {
      return NextResponse.json(
        { erro: "Tipo de movimentação inválido" },
        { status: 400 },
      );
    }

    // 5. Atualiza o produto e insere a movimentação

    // 5.1 Atualiza o saldo na tabela 'produtos'
    const { error: erroAtualizacao } = await supabase
      .from("produtos")
      .update({ estoque_atual: novoEstoque })
      .eq("codigo", codigo_produto);

    if (erroAtualizacao) throw erroAtualizacao;

    // 5.2 Grava o log na tabela 'movimentacoes'
    const { error: erroLog } = await supabase.from("movimentacoes").insert([
      {
        codigo_produto,
        tipo,
        quantidade: qtdNumber,
        motivo: motivo || "Não informado",
      },
    ]);

    if (erroLog) throw erroLog;

    // Tudo deu certo, retorna sucesso para o frontend
    return NextResponse.json(
      {
        mensagem: "Movimentação registrada com sucesso!",
        novo_estoque: novoEstoque,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro na movimentação:", error);
    return NextResponse.json(
      { erro: "Erro interno no servidor", detalhes: error.message },
      { status: 500 },
    );
  }
}
