"use client";

import { useEffect, useState } from "react";
import { supabaseClient as supabase } from "@/lib/supabase-client";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileCheck,
  User,
  Package,
  Hash,
  Calendar,
  Loader2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

export default function DetalhesValidacao() {
  const { id } = useParams();
  const router = useRouter();
  const [dados, setDados] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDetalhes() {
      setIsLoading(true);

      // Busca a movimentação e traz os dados do produto e do perfil (vendedor)
      const { data, error } = await supabase
        .from("movimentacoes_estoque")
        .select(
          `
          *,
          produtos:produto_codigo (nome),
          perfis:usuario_id (nome)
        `,
        )
        .eq("id", id)
        .single();

      if (data) {
        setDados(data);
      } else {
        console.error("Erro ao buscar detalhes:", error);
      }
      setIsLoading(false);
    }

    if (id) fetchDetalhes();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-100">
        <Loader2 className="animate-spin text-zinc-950" size={40} />
      </div>
    );
  }

  if (!dados) {
    return (
      <div className="min-h-screen p-8 text-center bg-zinc-100">
        <p className="text-zinc-950 font-black">MOVIMENTAÇÃO NÃO ENCONTRADA</p>
        <Link
          href="/movimentacoes"
          className="text-indigo-700 font-bold underline">
          Voltar ao histórico
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* VOLTAR */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-zinc-950 font-black uppercase text-sm hover:text-indigo-700 transition-colors">
          <ArrowLeft size={18} /> Voltar
        </button>

        <div className="bg-white rounded-xl shadow-xl border border-zinc-400 overflow-hidden">
          {/* CABEÇALHO DA FICHA */}
          <div className="bg-zinc-950 p-6 text-white flex justify-between items-center">
            <div>
              <h1 className="text-xl font-black uppercase tracking-tight">
                Comprovante de Saída
              </h1>
              <p className="text-zinc-400 text-xs font-bold">GEDOC INTEGRADO</p>
            </div>
            <FileCheck size={32} className="text-emerald-500" />
          </div>

          <div className="p-6 space-y-8">
            {/* GRID DE INFORMAÇÕES - RESPONSIVO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* PROTOCOLO / DOCUMENTO */}
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  <Hash size={14} /> Protocolo / Documento
                </label>
                <p className="text-zinc-950 font-black text-lg border-b-2 border-zinc-200 pb-1">
                  {dados.justificativa.replace("Saída via Documento de ", "") ||
                    "AJUSTE MANUAL"}
                </p>
              </div>

              {/* DATA DA VALIDAÇÃO */}
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  <Calendar size={14} /> Data da Validação
                </label>
                <p className="text-zinc-950 font-black text-lg border-b-2 border-zinc-200 pb-1">
                  {new Date(dados.criado_em).toLocaleString("pt-BR")}
                </p>
              </div>

              {/* VENDEDOR / RESPONSÁVEL */}
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  <User size={14} /> Vendedor / Responsável
                </label>
                <p className="text-zinc-950 font-black text-lg border-b-2 border-zinc-200 pb-1">
                  {dados.perfis?.nome || "SISTEMA / AUTOMÁTICO"}
                </p>
              </div>

              {/* QUANTIDADE QUE SAIU */}
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  <Package size={14} /> Quantidade Retirada
                </label>
                <p className="text-red-600 font-black text-3xl border-b-2 border-zinc-200 pb-1">
                  {Math.abs(dados.quantidade)} unidades
                </p>
              </div>
            </div>

            {/* PRODUTO EM DESTAQUE */}
            <div className="bg-zinc-50 border-2 border-zinc-950 p-6 rounded-lg">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">
                Produto Movimentado
              </label>
              <h2 className="text-zinc-950 font-black text-2xl uppercase leading-tight">
                {dados.produtos?.nome}
              </h2>
              <p className="text-indigo-700 font-mono font-bold mt-1">
                SKU: {dados.produto_codigo}
              </p>
            </div>

            {/* BOTÕES DE AÇÃO */}
            <div className="pt-4 flex flex-col gap-3">
              {dados.documento_url && (
                <a
                  href={dados.documento_url}
                  target="_blank"
                  className="w-full bg-indigo-700 text-white py-4 rounded-lg font-black uppercase text-sm flex items-center justify-center gap-2 hover:bg-indigo-800 transition-all">
                  <ExternalLink size={18} /> Visualizar PDF Original
                </a>
              )}

              <button
                onClick={() => window.print()}
                className="w-full bg-white border-2 border-zinc-950 text-zinc-950 py-4 rounded-lg font-black uppercase text-sm flex items-center justify-center gap-2 hover:bg-zinc-100 transition-all">
                Imprimir Comprovante
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">
          ID da Transação: {dados.id}
        </p>
      </div>
    </div>
  );
}
