import React from 'react';
import { ShoppingCart, Package, UtensilsCrossed, Home } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AppNavbar: React.FC = () => {
  const { telaAtual, navegarPara, carrinhoItens } = useApp();

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b-2 border-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand / Logo */}
          <div
            onClick={() => navegarPara('HOME')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:bg-yellow-400 group-hover:text-black transition-all">
              <ShoppingCart size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="font-black text-black text-base sm:text-lg tracking-tighter block leading-none">
                LISTA DE SUPERMERCADO
              </span>
              <span className="text-[9px] sm:text-[10px] text-gray-500 font-bold tracking-wider uppercase mt-1 block">
                Gestão Financeira & PEPS
              </span>
            </div>
          </div>

          {/* Quick Cart Summary Badge on Top Right */}
          <div
            onClick={() => navegarPara('CARRINHO')}
            className="flex items-center gap-2 bg-yellow-300 border-2 border-black px-3 py-1.5 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer hover:bg-yellow-400 active:translate-x-[1px] active:translate-y-[1px] transition-all"
            title="Abrir Carrinho"
          >
            <ShoppingCart size={15} className="stroke-[2.5] text-black" />
            <span className="text-xs font-black text-black uppercase tracking-wider">
              {carrinhoItens.length} {carrinhoItens.length === 1 ? 'item' : 'itens'}
            </span>
          </div>
        </div>
      </header>

      {/* Fixed Bottom Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t-2 border-black px-2 sm:px-6 py-2 shadow-[0px_-4px_12px_rgba(0,0,0,0.08)]">
        <div className="max-w-md sm:max-w-lg mx-auto flex items-center justify-between gap-1 sm:gap-2">
          {/* 1. Início */}
          <button
            onClick={() => navegarPara('HOME')}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-2 ${
              telaAtual === 'HOME'
                ? 'bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                : 'text-gray-700 border-transparent hover:bg-gray-100'
            }`}
          >
            <Home size={18} className="stroke-[2.5] mb-0.5" />
            <span>Início</span>
          </button>

          {/* 2. Carrinho */}
          <button
            onClick={() => navegarPara('CARRINHO')}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-2 relative ${
              telaAtual === 'CARRINHO'
                ? 'bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                : 'text-gray-700 border-transparent hover:bg-gray-100'
            }`}
          >
            <div className="relative">
              <ShoppingCart size={18} className="stroke-[2.5] mb-0.5" />
              {carrinhoItens.length > 0 && (
                <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-yellow-400 text-black text-[8px] font-black flex items-center justify-center border border-black">
                  {carrinhoItens.length}
                </span>
              )}
            </div>
            <span>Carrinho</span>
          </button>

          {/* 3. Despensa */}
          <button
            onClick={() => navegarPara('ESTOQUE')}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-2 ${
              telaAtual === 'ESTOQUE' || telaAtual === 'DETALHES_PRODUTO'
                ? 'bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                : 'text-gray-700 border-transparent hover:bg-gray-100'
            }`}
          >
            <Package size={18} className="stroke-[2.5] mb-0.5" />
            <span>Despensa</span>
          </button>

          {/* 4. Refeições */}
          <button
            onClick={() => navegarPara('REFEICOES')}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-2 ${
              telaAtual === 'REFEICOES'
                ? 'bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                : 'text-gray-700 border-transparent hover:bg-gray-100'
            }`}
          >
            <UtensilsCrossed size={18} className="stroke-[2.5] mb-0.5" />
            <span>Refeições</span>
          </button>
        </div>
      </nav>
    </>
  );
};
