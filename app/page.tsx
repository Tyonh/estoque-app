"use client";

import { useState, useEffect } from "react";
// Importando os ícones que combinam com o padrão da empresa
import {
  LayoutList,
  ArrowRightLeft,
  PackagePlus,
  History,
  ArrowLeft,
  Building2,
} from "lucide-react";

interface Produto {
  codigo: string;
  nome: string;
  estoque_atual: number;
  estoque_minimo: number;
}

export default function Home() {
  // Controle de qual tela estamos vendo: 'hub', 'visao_geral', 'movimentar'
  const [telaAtual, setTelaAtual] = useState("hub");

  // Estados da tabela
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);

  // A função que já criamos e funciona!
  const buscarProdutos = async () => {
    setCarregando(true);
    try {
      const resposta = await fetch("/api/produtos");
      const dados = await resposta.json();
      if (Array.isArray(dados)) {
        setProdutos(dados);
      } else {
        setProdutos([]);
      }
    } catch (erro) {
      console.error("Erro:", erro);
      setProdutos([]);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (telaAtual === "visao_geral") {
      buscarProdutos();
    }
  }, [telaAtual]);

  // ==========================================
  // COMPONENTE 1: O HUB CENTRAL (Igual à imagem)
  // ==========================================
  const renderHub = () => (
    <div className="max-w-6xl mx-auto pt-12 pb-24 px-4 sm:px-6 lg:px-8">
      {/* Cabeçalho do Hub */}
      <div className="text-center mb-16">
        <div className="flex justify-center items-center gap-4 mb-4">
          {/* Substitua pelo logo do Grupo 3G se tiver a imagem na pasta public */}
          <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center">
            <Building2 className="text-white" size={24} />
          </div>
          <h1 className="text-4xl font-extrabold text-[#1e293b]">
            Sistema de Estoque
          </h1>
        </div>
        <p className="text-lg text-slate-500">
          Selecione o módulo desejado para gerir os produtos e movimentações da
          empresa.
        </p>
      </div>

      {/* Grid de Cartões */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Cartão 1: Visão Geral */}
        <div
          onClick={() => setTelaAtual("visao_geral")}
          className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-slate-100 p-8 flex flex-col items-center text-center cursor-pointer group">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <LayoutList className="text-green-600" size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-3">Visão Geral</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Consulte o saldo atualizado, alertas de estoque mínimo e a lista
            completa de produtos.
          </p>
        </div>

        {/* Cartão 2: Movimentações */}
        <div
          onClick={() => setTelaAtual("movimentar")}
          className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-slate-100 p-8 flex flex-col items-center text-center cursor-pointer group">
          <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <ArrowRightLeft className="text-orange-600" size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-3">
            Movimentações
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Registre entradas de mercadorias ou dê baixa em produtos
            especificando o motivo.
          </p>
        </div>

        {/* Cartão 3: Histórico */}
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-slate-100 p-8 flex flex-col items-center text-center cursor-pointer group opacity-70 hover:opacity-100">
          <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <History className="text-purple-600" size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-3">
            Histórico (Logs)
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Auditoria completa. Rastreie todas as entradas e saídas registradas
            no sistema.
          </p>
        </div>
      </div>
    </div>
  );

  // ==========================================
  // COMPONENTE 2: A TABELA (Sua Visão Geral)
  // ==========================================
  const renderVisaoGeral = () => (
    <div className="max-w-6xl mx-auto pt-8 pb-24 px-4 sm:px-6 lg:px-8">
      <button
        onClick={() => setTelaAtual("hub")}
        className="flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors">
        <ArrowLeft size={20} className="mr-2" /> Voltar ao Hub
      </button>

      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Visão Geral do Estoque
          </h1>
          <p className="text-slate-500">Acompanhamento de saldos e limites</p>
        </div>
        <button
          onClick={() => setTelaAtual("movimentar")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow font-medium transition-colors">
          Nova Movimentação
        </button>
      </header>

      {/* A sua Tabela Original com um tapinha no design */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {carregando ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            Carregando produtos...
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                <th className="p-4 font-semibold uppercase tracking-wider">
                  Código (SKU)
                </th>
                <th className="p-4 font-semibold uppercase tracking-wider">
                  Produto
                </th>
                <th className="p-4 font-semibold text-center uppercase tracking-wider">
                  Estoque Atual
                </th>
                <th className="p-4 font-semibold text-center uppercase tracking-wider">
                  Estoque Mín.
                </th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((produto) => (
                <tr
                  key={produto.codigo}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-slate-500 font-mono text-sm">
                    {produto.codigo}
                  </td>
                  <td className="p-4 text-slate-800 font-medium">
                    {produto.nome}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-bold ${
                        produto.estoque_atual < produto.estoque_minimo
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}>
                      {produto.estoque_atual}
                    </span>
                  </td>
                  <td className="p-4 text-center text-slate-400 font-medium">
                    {produto.estoque_minimo}
                  </td>
                </tr>
              ))}
              {produtos.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-500">
                    Nenhum produto cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  // ==========================================
  // RENDERIZAÇÃO PRINCIPAL
  // ==========================================
  return (
    // Fundo clarinho cinza padrão de dashboards corporativos
    <main className="min-h-screen bg-[#f8fafc]">
      {telaAtual === "hub" && renderHub()}
      {telaAtual === "visao_geral" && renderVisaoGeral()}
      {telaAtual === "movimentar" && (
        <div className="p-12 text-center">
          <button
            onClick={() => setTelaAtual("hub")}
            className="mb-4 text-blue-600 font-bold underline">
            Voltar
          </button>
          <h1 className="text-2xl font-bold text-slate-800">
            Tela de Movimentação em Construção 🚧
          </h1>
        </div>
      )}
    </main>
  );
}
