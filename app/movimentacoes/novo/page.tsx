"use client";

import { useState, useEffect } from "react";
import { supabaseClient as supabase } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowDownRight,
  ArrowUpRight,
  Save,
  Loader2,
  PackageSearch,
} from "lucide-react";
import Link from "next/link";

interface Produto {
  codigo: string;
  nome: string;
  estoque_atual: number;
}

export default function NovoAjuste() {
  const router = useRouter();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [isLoadingProdutos, setIsLoadingProdutos] = useState(true);

  // Estados do Formulário
  const [produtoCodigo, setProdutoCodigo] = useState("");
  const [tipo, setTipo] = useState<"ENTRADA" | "SAIDA">("SAIDA");
  const [quantidade, setQuantidade] = useState<number | "">("");
  const [justificativaSelect, setJustificativaSelect] = useState("");
  const [justificativaCustom, setJustificativaCustom] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Motivos Rápidos
  const motivosSaida = [
    "Material Danificado/Avaria",
    "Uso Interno (Escritório)",
    "Correção de Contagem",
    "Amostra Manual (Sem GEDOC)",
    "Outros...",
  ];
  const motivosEntrada = [
    "Chegada de Fornecedor",
    "Devolução de Cliente",
    "Correção de Contagem",
    "Outros...",
  ];

  useEffect(() => {
    async function carregarProdutos() {
      const { data, error } = await supabase
        .from("produtos")
        .select("codigo, nome, estoque_atual")
        .order("nome");

      if (data) setProdutos(data);
      setIsLoadingProdutos(false);
    }
    carregarProdutos();
  }, []);

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!produtoCodigo || !quantidade || !justificativaSelect) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    if (justificativaSelect === "Outros..." && !justificativaCustom.trim()) {
      setError("Por favor, descreva o motivo no campo de texto.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Pega o ID de quem está logado
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // 2. Prepara os dados
      const motivoFinal =
        justificativaSelect === "Outros..."
          ? justificativaCustom
          : justificativaSelect;
      // Se for saída, garante que o número é negativo
      const qtdFinal =
        tipo === "SAIDA"
          ? -Math.abs(Number(quantidade))
          : Math.abs(Number(quantidade));

      // 3. Insere a movimentação (O Gatilho SQL atualiza o produto automaticamente!)
      const { error: insertError } = await supabase
        .from("movimentacoes_estoque")
        .insert({
          produto_codigo: produtoCodigo,
          quantidade: qtdFinal,
          tipo: `AJUSTE_${tipo}`,
          justificativa: motivoFinal,
          usuario_id: session?.user.id || null,
        });

      if (insertError) throw insertError;

      // Sucesso! Volta para o Dashboard
      router.refresh();
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Erro ao salvar o ajuste.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const motivosAtuais = tipo === "SAIDA" ? motivosSaida : motivosEntrada;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-4 md:p-8">
      <div className="max-w-2xl mx-auto w-full">
        {/* Cabeçalho Voltar */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-6 font-medium transition-colors">
          <ArrowLeft size={18} /> Voltar ao Dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Topo do Formulário */}
          <div className="bg-indigo-600 p-6 md:p-8 text-white">
            <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-3">
              <PackageSearch size={32} className="opacity-80" />
              Ajuste Manual de Estoque
            </h1>
            <p className="text-indigo-100 mt-2 text-sm md:text-base">
              Registe entradas ou saídas que não passaram pelo GEDOC.
            </p>
          </div>

          <form onSubmit={handleSalvar} className="p-6 md:p-8 space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm font-medium">
                {error}
              </div>
            )}

            {/* SELEÇÃO DO TIPO (ENTRADA / SAÍDA) */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setTipo("SAIDA");
                  setJustificativaSelect("");
                }}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                  tipo === "SAIDA"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-100 hover:border-gray-200 text-gray-500"
                }`}>
                <ArrowDownRight
                  size={24}
                  className={tipo === "SAIDA" ? "text-red-500" : ""}
                />
                <span className="font-bold">Registar Saída</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTipo("ENTRADA");
                  setJustificativaSelect("");
                }}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                  tipo === "ENTRADA"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-gray-100 hover:border-gray-200 text-gray-500"
                }`}>
                <ArrowUpRight
                  size={24}
                  className={tipo === "ENTRADA" ? "text-emerald-500" : ""}
                />
                <span className="font-bold">Registar Entrada</span>
              </button>
            </div>

            {/* SELEÇÃO DE PRODUTO */}
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">Produto</label>
              <select
                required
                value={produtoCodigo}
                onChange={(e) => setProdutoCodigo(e.target.value)}
                disabled={isLoadingProdutos}
                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-gray-800">
                <option value="">Selecione o produto...</option>
                {produtos.map((p) => (
                  <option key={p.codigo} value={p.codigo}>
                    [{p.codigo}] {p.nome} (Atual: {p.estoque_atual || 0})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* QUANTIDADE */}
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">
                  Quantidade
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={quantidade}
                  onChange={(e) => setQuantidade(Number(e.target.value))}
                  placeholder="Ex: 5"
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-gray-800"
                />
              </div>

              {/* MOTIVO RÁPIDO */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-bold text-gray-700">
                  Justificativa Rápida
                </label>
                <select
                  required
                  value={justificativaSelect}
                  onChange={(e) => setJustificativaSelect(e.target.value)}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-gray-800">
                  <option value="">Selecione um motivo...</option>
                  {motivosAtuais.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* JUSTIFICATIVA CUSTOMIZADA (Só aparece se escolher "Outros...") */}
            {justificativaSelect === "Outros..." && (
              <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
                <label className="text-sm font-bold text-gray-700">
                  Detalhes da Movimentação
                </label>
                <textarea
                  required
                  rows={3}
                  value={justificativaCustom}
                  onChange={(e) => setJustificativaCustom(e.target.value)}
                  placeholder="Descreva o que aconteceu..."
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-gray-800 resize-none"
                />
              </div>
            )}

            {/* BOTÃO DE SUBMIT */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70">
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />A Salvar...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Confirmar {tipo === "SAIDA" ? "Saída" : "Entrada"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
