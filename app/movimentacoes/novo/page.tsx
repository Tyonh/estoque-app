"use client";

import { useState, useEffect, useRef } from "react";
import { supabaseClient as supabase } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowDownRight,
  ArrowUpRight,
  Save,
  Loader2,
  Search,
  Check,
  X,
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

  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(
    null,
  );
  const [tipo, setTipo] = useState<"ENTRADA" | "SAIDA">("SAIDA");
  const [quantidade, setQuantidade] = useState<number | "">("");
  const [justificativaSelect, setJustificativaSelect] = useState("");
  const [justificativaCustom, setJustificativaCustom] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const { data } = await supabase
        .from("produtos")
        .select("codigo, nome, estoque_atual")
        .order("nome");
      if (data) setProdutos(data);
      setIsLoadingProdutos(false);
    }
    carregarProdutos();

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const produtosFiltrados = produtos.filter(
    (p) =>
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codigo.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!produtoSelecionado || !quantidade || !justificativaSelect) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }
    setIsSubmitting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const motivoFinal =
        justificativaSelect === "Outros..."
          ? justificativaCustom
          : justificativaSelect;
      const qtdFinal =
        tipo === "SAIDA"
          ? -Math.abs(Number(quantidade))
          : Math.abs(Number(quantidade));

      const { error: insertError } = await supabase
        .from("movimentacoes_estoque")
        .insert({
          produto_codigo: produtoSelecionado.codigo,
          quantidade: qtdFinal,
          tipo: `AJUSTE_${tipo}`,
          justificativa: motivoFinal,
          usuario_id: session?.user.id || null,
        });

      if (insertError) throw insertError;
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-zinc-900 hover:text-indigo-700 mb-6 font-bold transition-colors">
          <ArrowLeft size={20} /> Voltar ao Dashboard
        </Link>

        <div className="bg-white rounded-xl shadow-md border border-zinc-300 overflow-hidden">
          <div className="bg-indigo-700 p-6 text-white border-b border-indigo-800">
            <h1 className="text-xl font-bold">Ajuste de Estoque</h1>
            <p className="text-white text-sm opacity-90">
              Controle de entradas e saídas
            </p>
          </div>

          <form onSubmit={handleSalvar} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 text-red-900 p-4 rounded-lg text-sm font-bold border border-red-200">
                {error}
              </div>
            )}

            {/* SELEÇÃO DO PRODUTO */}
            <div className="relative" ref={dropdownRef}>
              <label className="text-sm font-bold text-zinc-900 mb-2 block">
                Produto
              </label>

              {produtoSelecionado ? (
                <div className="flex items-center justify-between bg-zinc-50 border-2 border-zinc-900 p-4 rounded-lg">
                  <div>
                    <p className="text-zinc-950 font-bold">
                      {produtoSelecionado.nome}
                    </p>
                    <p className="text-xs text-zinc-800 font-bold">
                      CÓDIGO: {produtoSelecionado.codigo}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setProdutoSelecionado(null);
                      setSearchTerm("");
                    }}
                    className="p-2 hover:bg-zinc-200 rounded-full text-zinc-950">
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-950"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="DIGITE O NOME OU CÓDIGO DO PRODUTO..."
                    className="w-full pl-10 pr-4 py-3 bg-white border-2 border-zinc-400 rounded-lg focus:border-indigo-600 outline-none text-zinc-950 font-bold placeholder:text-zinc-500"
                    value={searchTerm}
                    onFocus={() => setIsDropdownOpen(true)}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                  />
                </div>
              )}

              {isDropdownOpen && !produtoSelecionado && (
                <div className="absolute z-50 w-full mt-1 bg-white border-2 border-zinc-400 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                  {produtosFiltrados.length > 0 ? (
                    produtosFiltrados.map((p) => (
                      <button
                        key={p.codigo}
                        type="button"
                        className="w-full text-left p-4 hover:bg-indigo-700 hover:text-white flex justify-between items-center border-b border-zinc-200 last:border-0"
                        onClick={() => {
                          setProdutoSelecionado(p);
                          setSearchTerm("");
                          setIsDropdownOpen(false);
                        }}>
                        <div className="text-zinc-950 group-hover:text-white">
                          <p className="font-bold">{p.nome}</p>
                          <p className="text-xs font-semibold">
                            SKU: {p.codigo}
                          </p>
                        </div>
                        <Check size={18} />
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-zinc-900 font-bold">
                      Nenhum produto encontrado.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* BOTÕES DE TIPO */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setTipo("SAIDA")}
                className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                  tipo === "SAIDA"
                    ? "border-red-700 bg-red-700 text-white"
                    : "border-zinc-300 text-zinc-900 bg-zinc-50"
                }`}>
                <ArrowDownRight size={24} />{" "}
                <span className="font-bold text-xs uppercase">
                  Retirar Estoque
                </span>
              </button>
              <button
                type="button"
                onClick={() => setTipo("ENTRADA")}
                className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                  tipo === "ENTRADA"
                    ? "border-emerald-700 bg-emerald-700 text-white"
                    : "border-zinc-300 text-zinc-900 bg-zinc-50"
                }`}>
                <ArrowUpRight size={24} />{" "}
                <span className="font-bold text-xs uppercase">
                  Adicionar Estoque
                </span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* QUANTIDADE */}
              <div className="space-y-1">
                <label className="text-sm font-bold text-zinc-900 mb-2 block uppercase">
                  Qtd
                </label>
                <input
                  type="number"
                  required
                  value={quantidade}
                  onChange={(e) => setQuantidade(Number(e.target.value))}
                  className="w-full p-3 bg-white border-2 border-zinc-400 rounded-lg outline-none text-zinc-950 font-bold text-lg focus:border-indigo-600"
                />
              </div>

              {/* MOTIVO */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-bold text-zinc-900 mb-2 block uppercase">
                  Motivo
                </label>
                <select
                  required
                  value={justificativaSelect}
                  onChange={(e) => setJustificativaSelect(e.target.value)}
                  className="w-full p-3 bg-white border-2 border-zinc-400 rounded-lg outline-none text-zinc-950 font-bold text-base focus:border-indigo-600">
                  <option value="">-- SELECIONE O MOTIVO --</option>
                  {(tipo === "SAIDA" ? motivosSaida : motivosEntrada).map(
                    (m) => (
                      <option
                        key={m}
                        value={m}
                        className="text-zinc-950 font-bold">
                        {m}
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>

            {justificativaSelect === "Outros..." && (
              <div className="space-y-1">
                <label className="text-sm font-bold text-zinc-900 mb-2 block uppercase">
                  Descrição
                </label>
                <textarea
                  required
                  rows={3}
                  value={justificativaCustom}
                  onChange={(e) => setJustificativaCustom(e.target.value)}
                  className="w-full p-3 bg-white border-2 border-zinc-400 rounded-lg outline-none text-zinc-950 font-bold"
                  placeholder="DIGITE O MOTIVO DETALHADO..."
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-zinc-950 text-white rounded-lg font-bold uppercase hover:bg-black transition-all flex items-center justify-center gap-2">
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <Save size={20} /> Confirmar Ajuste
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
