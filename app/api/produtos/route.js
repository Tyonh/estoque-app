// app/api/produtos/route.js
import { NextResponse } from "next/server";
import { createSupabaseServer } from "../../../lib/supabase";

export async function GET() {
  try {
    const supabase = await createSupabaseServer();
    // Busca todos os produtos e ordena pelo nome
    const { data: produtos, error } = await supabase
      .from("produtos")
      .select("*")
      .order("nome", { ascending: true });

    if (error) {
      throw error;
    }

    // Retorna a lista de produtos com status 200 (OK)
    return NextResponse.json(produtos, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return NextResponse.json(
      { erro: "Falha ao buscar os produtos", detalhes: error.message },
      { status: 500 },
    );
  }
}
