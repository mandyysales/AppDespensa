import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  ChevronRight,
  Filter,
  Package,
  Layers,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CategoriaItem, CATEGORIA_LABELS } from '../types';
import { formatarMoeda, formatarVolume } from '../utils/converters';
import { ProductIcon } from './ProductIcon';

export const ScreenEstoque: React.FC = () => {
  const { navegarPara, inventarioAgrupado } = useApp();
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('TODAS');

  const produtosFiltrados = inventarioAgrupado.filter(p => {
    const matchBusca = p.nomeProduto.toLowerCase().includes(busca.toLowerCase());
    const matchCategoria = categoriaFiltro === 'TODAS' || p.categoria === categoriaFiltro;
    return matchBusca && matchCategoria;
  });

  const totalEmEstoqueValor = inventarioAgrupado.reduce((acc, p) => acc + p.valorTotalEstoque, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Cabeçalho Requisito: Botão "Voltar" e nome "Sua dispensa" */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navegarPara('HOME')}
            className="p-2 rounded-xl bg-white border-2 border-black text-black hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            title="Voltar para o Início"
          >
            <ArrowLeft size={18} className="stroke-[2.5]" />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-black uppercase">
              Sua Dispensa
            </h1>
            <p className="text-xs font-medium text-gray-500">Visão unificada do estoque com múltiplos lotes agrupados</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-yellow-300 border-2 border-black px-3.5 py-1.5 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] self-start sm:self-auto">
          <span className="text-[10px] uppercase font-black text-black tracking-wider">Total em Estoque:</span>
          <span className="text-base font-black font-mono text-black">
            {formatarMoeda(totalEmEstoqueValor)}
          </span>
        </div>
      </header>

      {/* Barra de Busca e Filtro de Categorias */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 text-black stroke-[2.5]" size={18} />
          <input
            type="text"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar produto na sua dispensa..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-black rounded-xl text-sm font-bold text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
          />
        </div>

        <div className="flex items-center gap-2 sm:w-64">
          <Filter size={16} className="text-black shrink-0 stroke-[2.5]" />
          <select
            value={categoriaFiltro}
            onChange={e => setCategoriaFiltro(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border-2 border-black rounded-xl text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-black transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
          >
            <option value="TODAS">Todas as Categorias</option>
            {Object.entries(CATEGORIA_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Visualização de todos os produtos: Lista contendo cartões unificados (card agrupados) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-black text-gray-500 uppercase tracking-wider">
            Produtos Cadastrados ({produtosFiltrados.length})
          </h2>
          <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">
            Clique no cartão para acompanhar os detalhes de consumo
          </span>
        </div>

        {produtosFiltrados.length === 0 ? (
          inventarioAgrupado.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-yellow-100 border-2 border-black text-black flex items-center justify-center mx-auto shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <Package size={32} className="stroke-[2.5]" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-black text-black uppercase">
                  Sua dispensa está vazia. Adicione uma nova compra para começar!
                </p>
                <p className="text-xs text-gray-600 max-w-md mx-auto font-medium">
                  Cadastre os produtos comprados no supermercado para acompanhar lotes, validades e dedução automática PEPS nas suas refeições.
                </p>
              </div>
              <button
                onClick={() => navegarPara('CARRINHO')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-300 hover:bg-yellow-400 text-black font-black uppercase tracking-wider text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
              >
                Adicionar Nova Compra
              </button>
            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3">
              <Package size={36} className="mx-auto text-gray-400" />
              <p className="text-sm font-black text-black uppercase">Nenhum produto encontrado</p>
              <p className="text-xs text-gray-600 max-w-sm mx-auto font-medium">
                Tente alterar a busca ou os filtros de categoria selecionados.
              </p>
              <button
                onClick={() => {
                  setBusca('');
                  setCategoriaFiltro('TODAS');
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black text-xs font-black uppercase rounded-xl border-2 border-black cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                Limpar Filtros
              </button>
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {produtosFiltrados.map((item, idx) => {
              const temEstoque = item.quantidadeTotalDisponivel > 0.001;
              const lotesAtivos = item.lotes.filter(l => l.volumeRestante > 0.001);

              return (
                <div
                  key={idx}
                  onClick={() => navegarPara('DETALHES_PRODUTO', item.nomeProduto)}
                  className={`bg-white rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-5 flex flex-col justify-between cursor-pointer hover:bg-yellow-50/40 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all group ${
                    temEstoque ? '' : 'opacity-70 bg-gray-50'
                  }`}
                >
                  {/* Top: Ícone IA e Categoria */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-yellow-100 border-2 border-black text-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                          <ProductIcon icone={item.icone} categoria={item.categoria} size={24} />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-black leading-tight">
                            {item.nomeProduto}
                          </h3>
                          {item.categoria && (
                            <span className="inline-block text-[10px] font-black uppercase text-black bg-gray-100 border border-black px-2 py-0.5 rounded-md mt-1">
                              {CATEGORIA_LABELS[item.categoria]}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Botão "Detalhes" (ícone: seta) Requisito */}
                      <button
                        className="p-2 rounded-xl bg-white border-2 border-black text-black group-hover:bg-yellow-300 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-colors shrink-0"
                        title="Ver detalhes dos lotes"
                      >
                        <ChevronRight size={16} className="stroke-[3]" />
                      </button>
                    </div>

                    {/* Lotes Metadata */}
                    <div className="mt-4 pt-3 border-t-2 border-gray-100 flex items-center justify-between text-xs text-gray-600 font-medium">
                      <span className="flex items-center gap-1">
                        <Layers size={14} className="text-black stroke-[2.5]" />
                        <strong>{item.lotes.length}</strong> lote(s)
                      </span>
                      <span className="font-mono text-black font-bold text-[11px] bg-gray-100 px-2 py-0.5 rounded border border-gray-300">
                        {lotesAtivos.length} ativo(s)
                      </span>
                    </div>
                  </div>

                  {/* Bottom: Quantidades e Valor */}
                  <div className="mt-4 pt-3 border-t-2 border-black flex items-end justify-between">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-gray-500 block font-black">
                        Total Disponível
                      </span>
                      <div className="text-base font-black font-mono text-black">
                        {temEstoque ? (
                          formatarVolume(item.quantidadeTotalDisponivel, item.baseUnidade)
                        ) : (
                          <span className="text-rose-600 text-xs uppercase font-black">Esgotado</span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono font-bold">
                        ≈ {item.totalItensRestantes.toFixed(1)} un.
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] uppercase tracking-wider text-gray-500 block font-black">
                        Valor Restante
                      </span>
                      <span className="text-base font-black font-mono text-emerald-700">
                        {formatarMoeda(item.valorTotalEstoque)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
