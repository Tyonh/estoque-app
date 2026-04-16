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

      // Simplificamos a busca para garantir que não trave em relações inexistentes
      const { data, error } = await supabase
        .from("movimentacoes_estoque")
        .select(
          `
          *,
          produtos:produto_codigo (nome)
        `,
        )
        .eq("id", id)
        .single();

      if (data) {
        setDados(data);
      } else if (error) {
        // Log detalhado para identificar o problema real no banco
        console.error("Erro Supabase:", error.message, error.details);
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
        <p className="text-zinc-950 font-black uppercase">
          Movimentação não encontrada
        </p>
        <Link
          href="/movimentacoes"
          className="text-indigo-700 font-bold underline mt-4 block">
          Voltar ao histórico
        </Link>
      </div>
    );
  }

  // Lógica para extrair informações da justificativa (Formato do Trigger)
  const extrairInfo = (chave: string) => {
    if (!dados.justificativa || !dados.justificativa.includes("|")) return null;
    const partes = dados.justificativa.split("|");
    const parte = partes.find((p: string) => p.includes(chave));
    return parte ? parte.split(":")[1]?.trim() : null;
  };

  const protocolo =
    extrairInfo("Prot") ||
    dados.justificativa.replace("Saída via Documento de ", "");
  const vendedor = extrairInfo("Vendedor") || "SISTEMA / AUTOMÁTICO";

  return (
    <div className="min-h-screen bg-zinc-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-zinc-950 font-black uppercase text-sm hover:text-indigo-700 transition-colors">
          <ArrowLeft size={18} /> Voltar
        </button>

        <div className="bg-white rounded-xl shadow-xl border border-zinc-400 overflow-hidden">
          <div className="bg-zinc-950 p-6 text-white flex justify-between items-center">
            <div>
              <h1 className="text-xl font-black uppercase tracking-tight italic">
                Comprovante de Saída
              </h1>
              <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">
                GEDOC Integrado
              </p>
            </div>
            <FileCheck size={32} className="text-emerald-500" />
          </div>

          <div className="p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* PROTOCOLO */}
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  <Hash size={14} /> Protocolo
                </label>
                <p className="text-zinc-950 font-black text-lg border-b-2 border-zinc-200 pb-1 uppercase">
                  {protocolo}
                </p>
              </div>

              {/* DATA */}
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  <Calendar size={14} /> Data da Validação
                </label>
                <p className="text-zinc-950 font-black text-lg border-b-2 border-zinc-200 pb-1">
                  {new Date(dados.criado_em).toLocaleString("pt-BR")}
                </p>
              </div>

              {/* VENDEDOR */}
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  <User size={14} /> Vendedor / Responsável
                </label>
                <p className="text-zinc-950 font-black text-lg border-b-2 border-zinc-200 pb-1 uppercase">
                  {vendedor}
                </p>
              </div>

              {/* QUANTIDADE */}
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  <Package size={14} /> Qtd. Movimentada
                </label>
                <p
                  className={`text-3xl font-black border-b-2 border-zinc-200 pb-1 ${dados.quantidade < 0 ? "text-red-600" : "text-emerald-600"}`}>
                  {Math.abs(dados.quantidade)} UN
                </p>
              </div>
            </div>

            {/* PRODUTO */}
            <div className="bg-zinc-50 border-2 border-zinc-950 p-6 rounded-lg">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">
                Identificação do Produto
              </label>
              <h2 className="text-zinc-950 font-black text-2xl uppercase leading-tight">
                {dados.produtos?.nome || "PRODUTO NÃO IDENTIFICADO"}
              </h2>
              <p className="text-indigo-700 font-mono font-bold mt-1 uppercase text-sm tracking-tighter">
                SKU: {dados.produto_codigo}
              </p>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              {dados.documento_url && (
                <a
                  href={dados.documento_url}
                  target="_blank"
                  className="w-full bg-indigo-700 text-white py-4 rounded-lg font-black uppercase text-sm flex items-center justify-center gap-2 hover:bg-indigo-800 transition-all shadow-lg">
                  <ExternalLink size={18} /> Abrir PDF Original
                </a>
              )}

              <button
                onClick={() => window.print()}
                className="w-full bg-white border-2 border-zinc-950 text-zinc-950 py-4 rounded-lg font-black uppercase text-sm flex items-center justify-center gap-2 hover:bg-zinc-100 transition-all">
                Imprimir Ficha
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
          Ref. Transação: {dados.id}
        </p>
      </div>
    </div>
  );
}
