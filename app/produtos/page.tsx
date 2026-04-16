"use client";

import { useEffect, useState } from "react";
import { supabaseClient as supabase } from "@/lib/supabase-client";
import {
  Package,
  Plus,
  Search,
  Edit3,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

interface Produto {
  codigo: string;
  nome: string;
  estoque_atual: number;
  estoque_minimo: number;
}

export default function GestaoProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [filtro, setFiltro] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Estados para Edição de Estoque Mínimo
  const [editando, setEditando] = useState<string | null>(null);
  const [novoMinimo, setNovoMinimo] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProdutos();
  }, []);

  async function fetchProdutos() {
    setIsLoading(true);
    const { data } = await supabase.from("produtos").select("*").order("nome");
    if (data) setProdutos(data);
    setIsLoading(true);
    setIsLoading(false);
  }

  const handleSalvarMinimo = async (codigo: string) => {
    setIsSaving(true);
    const { error } = await supabase
      .from("produtos")
      .update({ estoque_minimo: novoMinimo })
      .eq("codigo", codigo);

    if (!error) {
      setProdutos(
        produtos.map((p) =>
          p.codigo === codigo ? { ...p, estoque_minimo: novoMinimo } : p,
        ),
      );
      setEditando(null);
    }
    setIsSaving(false);
  };

  const produtosFiltrados = produtos.filter(
    (p) =>
      p.nome.toLowerCase().includes(filtro.toLowerCase()) ||
      p.codigo.toLowerCase().includes(filtro.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 mb-2 transition-colors">
              <ArrowLeft size={16} /> Voltar ao Dashboard
            </Link>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              <Package className="text-indigo-600" />
              Gestão de Catálogo
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Pesquisar produto..."
                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-64"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
            </div>
            {/* Aqui poderíamos ter um botão de "Adicionar Produto" via Modal mais tarde */}
          </div>
        </div>

        {/* TABELA */}
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
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">
                      Código (SKU)
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">
                      Nome do Produto
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">
                      Estoque Atual
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">
                      Estoque Mínimo
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {produtosFiltrados.map((p) => {
                    const emAlerta =
                      (p.estoque_atual || 0) <= (p.estoque_minimo || 0);

                    return (
                      <tr
                        key={p.codigo}
                        className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-indigo-600">
                          {p.codigo}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-800">
                          {p.nome}
                        </td>
                        <td
                          className={`px-6 py-4 font-black ${emAlerta ? "text-red-600" : "text-gray-700"}`}>
                          {p.estoque_atual || 0}
                        </td>
                        <td className="px-6 py-4">
                          {editando === p.codigo ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                className="w-20 p-1 border rounded-md outline-none focus:ring-1 focus:ring-indigo-500"
                                value={novoMinimo}
                                onChange={(e) =>
                                  setNovoMinimo(Number(e.target.value))
                                }
                                autoFocus
                              />
                              <button
                                onClick={() => handleSalvarMinimo(p.codigo)}
                                className="text-emerald-600 hover:bg-emerald-50 p-1 rounded transition-colors">
                                <CheckCircle2 size={18} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 group">
                              <span className="text-gray-500">
                                {p.estoque_minimo}
                              </span>
                              <button
                                onClick={() => {
                                  setEditando(p.codigo);
                                  setNovoMinimo(p.estoque_minimo);
                                }}
                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-indigo-600 transition-all">
                                <Edit3 size={14} />
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {emAlerta ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600">
                              <AlertCircle size={14} /> Comprar
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600">
                              <CheckCircle2 size={14} /> Em Dia
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
