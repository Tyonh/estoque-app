"use client";

import { useEffect, useState } from "react";
import { supabaseClient as supabase } from "@/lib/supabase-client";
import {
  History,
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Search,
  Loader2,
  Calendar,
  Filter,
  Eye, // Adicionado apenas o ícone
} from "lucide-react";
import Link from "next/link";

interface Movimentacao {
  id: string;
  produto_codigo: string;
  quantidade: number;
  tipo: string;
  justificativa: string;
  documento_url?: string;
  criado_em: string;
  produtos: {
    nome: string;
  };
}

export default function HistoricoMovimentacoes() {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [filtro, setFiltro] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchHistorico() {
      setIsLoading(true);

      // Busca as movimentações e faz o JOIN com a tabela produtos para pegar o nome
      const { data, error } = await supabase
        .from("movimentacoes_estoque")
        .select(
          `
          *,
          produtos:produto_codigo (nome)
        `,
        )
        .order("criado_em", { ascending: false });

      if (data) {
        setMovimentacoes(data as any);
      }

      setIsLoading(false);
    }

    fetchHistorico();
  }, []);

  // Lógica de pesquisa local
  const movimentacoesFiltradas = movimentacoes.filter(
    (m) =>
      m.produtos?.nome.toLowerCase().includes(filtro.toLowerCase()) ||
      m.produto_codigo.toLowerCase().includes(filtro.toLowerCase()) ||
      m.justificativa.toLowerCase().includes(filtro.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-4 md:p-8">
      <div className="max-w-7xl mx-auto w-full space-y-6">
        {/* CABEÇALHO */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-2">
              <ArrowLeft size={16} /> Voltar ao Dashboard
            </Link>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-3">
              <History className="text-indigo-600" />
              Histórico de Movimentações
            </h1>
          </div>

          {/* BARRA DE PESQUISA */}
          <div className="relative w-full md:w-96">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Pesquisar por produto, código ou motivo..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>
        </div>

        {/* TABELA DE DADOS */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="p-20 flex justify-center">
              <Loader2 className="animate-spin text-indigo-600" size={40} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Data / Hora
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Produto
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Qtd
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Justificativa
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {movimentacoesFiltradas.length > 0 ? (
                    movimentacoesFiltradas.map((mov) => (
                      <tr
                        key={mov.id}
                        className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-700">
                              {new Date(mov.criado_em).toLocaleDateString(
                                "pt-PT",
                              )}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(mov.criado_em).toLocaleTimeString(
                                "pt-PT",
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-800">
                              {mov.produtos?.nome || "Produto Removido"}
                            </span>
                            <span className="text-xs text-indigo-500 font-mono">
                              {mov.produto_codigo}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {mov.quantidade > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600">
                              <ArrowUpRight size={14} /> Entrada
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600">
                              <ArrowDownRight size={14} /> Saída
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`text-sm font-black ${mov.quantidade > 0 ? "text-emerald-600" : "text-red-600"}`}>
                            {mov.quantidade > 0
                              ? `+${mov.quantidade}`
                              : mov.quantidade}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p
                            className="text-sm text-gray-600 max-w-xs truncate md:max-w-md"
                            title={mov.justificativa}>
                            {mov.justificativa}
                          </p>
                        </td>

                        {/* COLUNA DE AÇÕES ATUALIZADA - SEM ALTERAR SEU DESIGN */}
                        <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                          <Link
                            href={`/movimentacoes/${mov.id}`}
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-bold text-xs bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors">
                            <Eye size={14} />
                            Ver Detalhes
                          </Link>

                          {mov.documento_url && (
                            <a
                              href={mov.documento_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Baixar PDF do GEDOC"
                              className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-bold text-xs bg-indigo-50 px-3 py-2 rounded-lg transition-colors">
                              <FileText size={14} />
                              PDF
                            </a>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-gray-400">
                        Nenhuma movimentação encontrada para o termo pesquisado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RESUMO DE CORES */}
        <div className="flex gap-6 text-xs font-medium text-gray-400 px-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span>Entradas (Fornecedores / Devoluções)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Saídas (Vendas / Amostras / Avarias)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
