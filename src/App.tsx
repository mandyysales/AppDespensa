import React from 'react';
import { Loader2 } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { AppNavbar } from './components/AppNavbar';
import { ScreenHome } from './components/ScreenHome';
import { ScreenCarrinho } from './components/ScreenCarrinho';
import { ScreenEstoque } from './components/ScreenEstoque';
import { ScreenDetalhesProduto } from './components/ScreenDetalhesProduto';
import { ScreenHistoricoRefeicoes } from './components/ScreenHistoricoRefeicoes';

const MainContent: React.FC = () => {
  const { telaAtual, loading } = useApp();

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-28">
      {/* Indicador de carregamento e sincronização com o Firestore */}
      {loading && (
        <div className="mb-4 bg-yellow-300 border-2 border-black p-3 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between gap-3 text-xs font-black uppercase text-black animate-pulse">
          <div className="flex items-center gap-2">
            <Loader2 size={16} className="animate-spin stroke-[3]" />
            <span>Sincronizando com o Firebase Firestore (Offline-First Ativo)...</span>
          </div>
          <span className="bg-black text-white px-2 py-0.5 rounded text-[10px]">Persistência Nuvem</span>
        </div>
      )}

      {telaAtual === 'HOME' && <ScreenHome />}
      {telaAtual === 'CARRINHO' && <ScreenCarrinho />}
      {telaAtual === 'ESTOQUE' && <ScreenEstoque />}
      {telaAtual === 'DETALHES_PRODUTO' && <ScreenDetalhesProduto />}
      {telaAtual === 'REFEICOES' && <ScreenHistoricoRefeicoes />}
    </main>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-[#F3F4F6] text-[#111827] flex flex-col font-sans selection:bg-yellow-200 selection:text-black">
        <AppNavbar />
        <div className="flex-1">
          <MainContent />
        </div>
      </div>
    </AppProvider>
  );
}
