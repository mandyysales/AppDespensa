import React from 'react';
import {
  ShoppingCart,
  PackageCheck,
  UtensilsCrossed,
  ArrowRight,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatarMoeda, formatarVolume } from '../utils/converters';
import { ProductIcon } from './ProductIcon';
import { TIPO_REFEICAO_LABELS } from '../types';

export const ScreenHome: React.FC = () => {
  const {
    navegarPara,
    inventarioAgrupado,
    estoqueLotes,
    refeicoes,
    carrinhoItens
  } = useApp();

  // Métricas
  const totalProdutosCadastrados = inventarioAgrupado.length;
  const produtosComEstoque = inventarioAgrupado.filter(p => p.quantidadeTotalDisponivel > 0).length;
  const totalLotesAtivos = estoqueLotes.filter(l => l.volumeRestante > 0.01).length;
  
  const valorTotalEstoque = inventarioAgrupado.reduce((acc, p) => acc + p.valorTotalEstoque, 0);
  const totalGastoRefeicoes = refeicoes.reduce((acc, r) => acc + r.custoTotalRefeicao, 0);
  const subtotalCarrinho = carrinhoItens.reduce((acc, item) => acc + item.precoTotalItem, 0);
  const mediaPorRefeicao = refeicoes.length > 0 ? totalGastoRefeicoes / refeicoes.length : 0;

  const ultimasRefeicoes = refeicoes.slice(0, 3);
  const itensDestaqueEstoque = inventarioAgrupado.slice(0, 3);

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden animate-in fade-in duration-300">
      {/* Bento Header */}
      <header className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 bg-white p-4 sm:p-5 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-yellow-300 text-black text-[10px] font-black uppercase tracking-wider border border-black mb-2">
            <Sparkles size={12} className="stroke-[3]" />
            PEPS & CONVERSÃO AUTOMÁTICA
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-black">
            PAINEL DE CONTROLE
          </h1>
          <p className="text-xs sm:text-sm font-medium text-gray-500">
            Gestão Financeira, Estoque em Lotes & Consumo Inteligente
          </p>
        </div>

        <div className="flex items-center gap-6 sm:gap-8 self-start sm:self-auto">
          <div className="text-left sm:text-right">
            <p className="text-[10px] uppercase font-black tracking-wider text-gray-400">Total em Dispensa</p>
            <p className="text-xl sm:text-2xl font-black font-mono text-emerald-600">
              {formatarMoeda(valorTotalEstoque)}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-[10px] uppercase font-black tracking-wider text-gray-400">Gasto em Refeições</p>
            <p className="text-xl sm:text-2xl font-black font-mono text-black">
              {formatarMoeda(totalGastoRefeicoes)}
            </p>
          </div>
        </div>
      </header>

      {/* 3 Cards de Acesso com Alinhamento Horizontal: [Ícone] -> [Nome Centralizado] -> [Seta] */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Card 1: Add Nova Compra */}
        <button
          onClick={() => navegarPara('CARRINHO')}
          className="w-full bg-white hover:bg-yellow-50 p-4 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer flex items-center justify-between gap-3 group"
        >
          <div className="w-10 h-10 shrink-0 rounded-xl bg-yellow-300 text-black flex items-center justify-center font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <ShoppingCart size={20} className="stroke-[2.5]" />
          </div>
          <span className="text-sm font-black text-black text-center flex-1">
            Add Nova Compra
          </span>
          <div className="w-8 h-8 shrink-0 flex items-center justify-center">
            <ArrowRight size={18} className="text-black group-hover:translate-x-1 transition-transform stroke-[2.5]" />
          </div>
        </button>

        {/* Card 2: Ver estoque */}
        <button
          onClick={() => navegarPara('ESTOQUE')}
          className="w-full bg-white hover:bg-sky-50 p-4 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer flex items-center justify-between gap-3 group"
        >
          <div className="w-10 h-10 shrink-0 rounded-xl bg-sky-300 text-black flex items-center justify-center font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <PackageCheck size={20} className="stroke-[2.5]" />
          </div>
          <span className="text-sm font-black text-black text-center flex-1">
            Ver estoque
          </span>
          <div className="w-8 h-8 shrink-0 flex items-center justify-center">
            <ArrowRight size={18} className="text-black group-hover:translate-x-1 transition-transform stroke-[2.5]" />
          </div>
        </button>

        {/* Card 3: Histórico de Refeição */}
        <button
          onClick={() => navegarPara('REFEICOES')}
          className="w-full bg-white hover:bg-emerald-50 p-4 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer flex items-center justify-between gap-3 group"
        >
          <div className="w-10 h-10 shrink-0 rounded-xl bg-emerald-300 text-black flex items-center justify-center font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <UtensilsCrossed size={20} className="stroke-[2.5]" />
          </div>
          <span className="text-sm font-black text-black text-center flex-1">
            Histórico de Refeição
          </span>
          <div className="w-8 h-8 shrink-0 flex items-center justify-center">
            <ArrowRight size={18} className="text-black group-hover:translate-x-1 transition-transform stroke-[2.5]" />
          </div>
        </button>
      </div>

      {/* Grid Bento Principal (Responsivo Mobile: flex-col / grid-cols-1 até lg:grid-cols-12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Coluna 1 (Esquerda): Carrinho Ativo & Histórico de Refeições */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          {/* Card: Carrinho Ativo */}
          <section className="bg-white rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between overflow-hidden">
            <div className="p-4 border-b-2 border-black bg-yellow-50 flex justify-between items-center">
              <div>
                <h2 className="font-black text-base uppercase tracking-tight">Carrinho Ativo</h2>
                <p className="text-[10px] font-bold text-gray-600">Conversão Automática (L/KG ↔ ml/g)</p>
              </div>
              <span className="text-[10px] font-black bg-black text-white px-2 py-0.5 rounded-full uppercase">
                {carrinhoItens.length} itens
              </span>
            </div>

            <div className="p-4 space-y-2.5 overflow-hidden flex-1">
              {carrinhoItens.length === 0 ? (
                <div className="text-center py-6 space-y-2">
                  <ShoppingCart size={32} className="mx-auto text-gray-300" />
                  <p className="text-xs font-bold text-gray-600">Nenhum item adicionado no carrinho</p>
                  <button
                    onClick={() => navegarPara('CARRINHO')}
                    className="px-3 py-1.5 bg-black text-white text-xs font-black rounded-lg border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-800 cursor-pointer"
                  >
                    Abrir Nova Compra
                  </button>
                </div>
              ) : (
                carrinhoItens.slice(0, 3).map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => navegarPara('CARRINHO')}
                    className="flex justify-between items-center p-2.5 border-2 border-black rounded-xl bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-bold text-xs text-black truncate">{item.nomeProduto}</p>
                      <p className="text-[10px] text-gray-500 font-mono">
                        {formatarVolume(item.quantidadeComprada * item.volumeTotalUnidade, item.baseUnidade)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black text-xs font-mono">{formatarMoeda(item.precoTotalItem)}</p>
                      <span className="bg-black text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                        {item.quantidadeComprada} UN
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div
              onClick={() => navegarPara('CARRINHO')}
              className="p-3.5 bg-black text-white flex justify-between items-center cursor-pointer hover:bg-neutral-800 transition-colors"
            >
              <div>
                <span className="text-[10px] font-black uppercase text-gray-400 block">Subtotal do Carrinho</span>
                <span className="text-base font-black font-mono text-white">{formatarMoeda(subtotalCarrinho)}</span>
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-yellow-300 flex items-center gap-1">
                Ver Carrinho <ArrowRight size={14} className="stroke-[3]" />
              </span>
            </div>
          </section>

          {/* Painel: Histórico de Refeições */}
          <section className="bg-white rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-5 flex flex-col justify-between overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-black text-base uppercase tracking-tight">Histórico de Refeições</h2>
                <span className="text-[9px] font-black bg-yellow-300 text-black px-2 py-0.5 rounded border border-black uppercase">
                  Regra PEPS
                </span>
              </div>

              <p className="text-xs text-gray-600 mb-3 font-medium">
                Registre suas refeições, e tenha um controle exato do consumo dos itens da sua dispensa.
              </p>

              {ultimasRefeicoes.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {ultimasRefeicoes.map(r => (
                    <div
                      key={r.idRefeicao}
                      onClick={() => navegarPara('REFEICOES')}
                      className="p-2.5 bg-gray-50 border-2 border-black rounded-xl flex items-center justify-between cursor-pointer hover:bg-yellow-50 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[9px] font-black uppercase bg-black text-white px-2 py-0.5 rounded shrink-0">
                          {TIPO_REFEICAO_LABELS[r.tipo]}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-black truncate">{r.receitaRealizada || 'Refeição preparada'}</p>
                          <p className="text-[10px] text-gray-500 font-mono">{r.ingredientes.length} ingrediente(s)</p>
                        </div>
                      </div>
                      <span className="text-xs font-black font-mono text-emerald-700 shrink-0 ml-2">
                        {formatarMoeda(r.custoTotalRefeicao)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-center text-xs text-gray-500 mb-4 font-medium">
                  Nenhuma refeição registrada ainda.
                </div>
              )}
            </div>

            <button
              onClick={() => navegarPara('REFEICOES')}
              className="w-full bg-black text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-neutral-800 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <UtensilsCrossed size={16} className="stroke-[2.5]" />
              <span>Registrar Consumo</span>
            </button>
          </section>
        </div>

        {/* Coluna 2 (Direita): Dispensa & Métricas (Posicionado diretamente abaixo da Dispensa) */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          {/* Card: Dispensa */}
          <section className="bg-white rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <div className="mb-3">
                <h2 className="font-black text-base uppercase tracking-tight">Dispensa</h2>
                <p className="text-[10px] text-gray-500 font-bold">Produtos disponíveis na dispensa</p>
              </div>

              <div className="space-y-3">
                {itensDestaqueEstoque.length === 0 ? (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center space-y-2">
                    <p className="text-xs font-bold text-gray-700">Sua dispensa está vazia.</p>
                    <p className="text-[10px] text-gray-500 font-medium">Cadastre compras para acompanhar o estoque e lotes.</p>
                    <button
                      onClick={() => navegarPara('CARRINHO')}
                      className="px-3 py-1 bg-yellow-300 hover:bg-yellow-400 text-black text-xs font-black uppercase rounded-lg border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                    >
                      Nova Compra
                    </button>
                  </div>
                ) : (
                  itensDestaqueEstoque.map((prod, idx) => (
                    <div
                      key={idx}
                      onClick={() => navegarPara('DETALHES_PRODUTO', prod.nomeProduto)}
                      className="border-l-4 border-black pl-3 py-1 cursor-pointer hover:bg-gray-50 rounded-r-lg transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 min-w-0">
                          <ProductIcon icone={prod.icone} categoria={prod.categoria} size={16} />
                          <p className="font-bold text-xs text-black truncate">{prod.nomeProduto}</p>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-gray-500 shrink-0 ml-2">
                          {prod.lotes.length} lote(s)
                        </span>
                      </div>

                      <div className="flex gap-2 mt-1.5">
                        <div className="flex-1 bg-gray-100 p-1.5 rounded-lg border border-gray-300">
                          <p className="text-[8px] uppercase text-gray-500 font-black">Disponível Total</p>
                          <p className="text-xs font-black font-mono">
                            {formatarVolume(prod.quantidadeTotalDisponivel, prod.baseUnidade)}
                          </p>
                        </div>
                        <div className="flex-1 bg-yellow-50 p-1.5 rounded-lg border border-yellow-200">
                          <p className="text-[8px] uppercase text-amber-700 font-black">Valor Total</p>
                          <p className="text-xs font-black font-mono text-emerald-700">
                            {formatarMoeda(prod.valorTotalEstoque)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-3 border-t-2 border-gray-100 mt-4 flex justify-between items-center">
              <span className="text-[11px] font-bold text-gray-500">
                {produtosComEstoque} itens em estoque
              </span>
              <button
                onClick={() => navegarPara('ESTOQUE')}
                className="text-xs font-black uppercase text-black hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
              >
                Explorar Dispensa <ChevronRight size={14} className="stroke-[3]" />
              </button>
            </div>
          </section>

          {/* Card: Métricas (Orientação Horizontal, Posicionado diretamente abaixo do Card da Dispensa) */}
          <section className="bg-purple-600 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-5 text-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-black text-base uppercase tracking-tight text-white">Métricas</h2>
                <div className="flex items-center gap-1 text-[10px] text-purple-100 font-bold">
                  <span>Precisão: 100% PEPS</span>
                  <Sparkles size={14} className="text-yellow-300" />
                </div>
              </div>

              {/* Orientação Horizontal do Conteúdo Interno */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-purple-700/70 p-3 rounded-xl border border-purple-400/40">
                  <p className="text-[9px] uppercase font-black tracking-wider text-purple-200">Total de Produtos</p>
                  <p className="text-xl sm:text-2xl font-black">{totalProdutosCadastrados}</p>
                  <p className="text-[9px] text-purple-200 font-medium">{totalLotesAtivos} lotes no sistema</p>
                </div>

                <div className="bg-purple-700/70 p-3 rounded-xl border border-purple-400/40">
                  <p className="text-[9px] uppercase font-black tracking-wider text-purple-200">Custo Médio / Refeição</p>
                  <p className="text-xl sm:text-2xl font-black font-mono">{formatarMoeda(mediaPorRefeicao)}</p>
                  <p className="text-[9px] text-purple-200 font-medium">Calculado via PEPS</p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-purple-400/30 flex justify-between items-center text-[10px] text-purple-100 font-bold">
              <span>Gestão Inteligente de Lotes</span>
              <span className="bg-purple-800 px-2 py-0.5 rounded font-mono font-black text-yellow-300 border border-purple-400/30">
                {produtosComEstoque} com estoque
              </span>
            </div>
          </section>
        </div>
      </div>

      {/* Footer Info Bento Style */}
      <div className="p-4 bg-white rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-black shrink-0" />
          <span className="font-medium">
            Sistema com regras matemáticas de <strong>Conversão de Unidades</strong> e <strong>PEPS (FIFO)</strong>.
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
          <span>Banco em nuvem sincronizado</span>
        </div>
      </div>
    </div>
  );
};
