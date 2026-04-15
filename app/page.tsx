"use client";

import { useEffect, useState } from "react";
import { supabaseClient as supabase } from "@/lib/supabase-client";
import {
  Package,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  LayoutDashboard,
  History,
  PlusCircle,
  Loader2,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";

interface Produto {
  codigo: string;
  nome: string;
  estoque_atual: number;
  estoque_minimo: number;
}

export default function DashboardEstoque() {
  const [produtosCriticos, setProdutosCriticos] = useState<Produto[]>([]);
  const [stats, setStats] = useState({ total: 0, alerta: 0, ok: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true);

      // Busca todos os produtos para calcular as estatísticas
      const { data, error } = await supabase
        .from("produtos")
        .select("codigo, nome, estoque_atual, estoque_minimo");

      if (data) {
        const total = data.length;
        const emAlerta = data.filter(
          (p) => (p.estoque_atual || 0) <= (p.estoque_minimo || 0),
        );

        setStats({
          total,
          alerta: emAlerta.length,
          ok: total - emAlerta.length,
        });

        // Ordena os mais críticos (mais abaixo do mínimo) para mostrar primeiro
        const criticos = emAlerta.sort(
          (a, b) => (a.estoque_atual || 0) - (b.estoque_atual || 0),
        );
        setProdutosCriticos(criticos.slice(0, 5)); // Mostra apenas os 5 mais urgentes
      }

      setIsLoading(false);
    }

    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* HEADER DE NAVEGAÇÃO RÁPIDA */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Package className="text-white" size={20} />
            </div>
            <span className="font-bold text-gray-800 text-lg">Estoque 3G</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-indigo-600 font-bold text-sm">
              Dashboard
            </Link>
            <Link
              href="/produtos"
              className="text-gray-500 hover:text-indigo-600 font-medium text-sm transition-colors">
              Produtos
            </Link>
            <Link
              href="/movimentacoes"
              className="text-gray-500 hover:text-indigo-600 font-medium text-sm transition-colors">
              Histórico
            </Link>
          </nav>

          <Link
            href="/movimentacoes/novo"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition flex items-center gap-2 shadow-sm">
            <PlusCircle size={18} />
            Novo Ajuste
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8">
        {/* TITULO E STATUS DO SISTEMA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800">
              Visão Geral
            </h1>
            <p className="text-gray-500 text-sm">
              Monitorização em tempo real do inventário Grupo 3G.
            </p>
          </div>
        </div>

        {/* CARDS DE RESUMO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Package size={24} />
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                Total
              </span>
            </div>
            <p className="text-gray-500 text-sm font-medium">
              Itens no Catálogo
            </p>
            <h3 className="text-3xl font-black text-gray-800">
              {isLoading ? "..." : stats.total}
            </h3>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                <TrendingDown size={24} />
              </div>
              <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md">
                Urgente
              </span>
            </div>
            <p className="text-gray-500 text-sm font-medium">
              Abaixo do Mínimo
            </p>
            <h3 className="text-3xl font-black text-gray-800">
              {isLoading ? "..." : stats.alerta}
            </h3>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sm:col-span-2 lg:col-span-1">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <LayoutDashboard size={24} />
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                Status
              </span>
            </div>
            <p className="text-gray-500 text-sm font-medium">Itens em Dia</p>
            <h3 className="text-3xl font-black text-gray-800">
              {isLoading ? "..." : stats.ok}
            </h3>
          </div>
        </div>

        {/* ÁREA DE ALERTAS E ÚLTIMAS AÇÕES */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LISTA DE REPOSIÇÃO (ALERTA VERMELHO) */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-amber-500" size={20} />
                <h2 className="font-bold text-gray-800">
                  Necessitam de Reposição
                </h2>
              </div>
              <Link
                href="/produtos"
                className="text-xs font-bold text-indigo-600 hover:underline">
                Ver Todos
              </Link>
            </div>

            {isLoading ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="animate-spin text-gray-300" size={32} />
              </div>
            ) : produtosCriticos.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {produtosCriticos.map((p) => (
                  <div
                    key={p.codigo}
                    className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-700">
                        {p.nome}
                      </span>
                      <span className="text-xs text-gray-400">
                        SKU: {p.codigo}
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs text-gray-400 uppercase font-bold">
                          Atual
                        </p>
                        <p className="text-lg font-black text-red-600">
                          {p.estoque_atual}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400 uppercase font-bold">
                          Mínimo
                        </p>
                        <p className="text-sm font-bold text-gray-600">
                          {p.estoque_minimo}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-400">
                <p>Nenhum produto em estado crítico no momento. 🙌</p>
              </div>
            )}
          </div>

          {/* ACÇÕES RÁPIDAS */}
          <div className="space-y-6">
            <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-100">
              <h3 className="font-bold mb-2">Relatórios Rápidos</h3>
              <p className="text-indigo-100 text-xs mb-4">
                Veja quem retirou produtos validados pelo GEDOC recentemente.
              </p>
              <Link
                href="/movimentacoes"
                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-bold transition-all w-full justify-center">
                <History size={16} />
                Ver Histórico de Saídas
              </Link>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4 text-sm">
                Integração GEDOC
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <ArrowDownRight className="text-red-500" size={18} />
                  <span className="text-xs text-gray-600 leading-tight">
                    Saídas automáticas via validação de documentos comerciais.
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <ArrowUpRight className="text-emerald-500" size={18} />
                  <span className="text-xs text-gray-600 leading-tight">
                    Entradas manuais justificadas por fornecedores ou devolução.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
