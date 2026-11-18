import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Plus,
  UtensilsCrossed,
  Calendar,
  DollarSign,
  Edit2,
  Clock,
  Sparkles,
  Info,
  X,
  ChevronRight,
  Filter
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RegistroRefeicao, TipoRefeicao, TIPO_REFEICAO_LABELS } from '../types';
import { formatarMoeda, formatarData, formatarDataIso } from '../utils/converters';
import { ModalNovaRefeicao } from './ModalNovaRefeicao';
import { ModalDetalhesRefeicao } from './ModalDetalhesRefeicao';
import { ModalEditarRefeicao } from './ModalEditarRefeicao';
import { ProductIcon } from './ProductIcon';

export const ScreenHistoricoRefeicoes: React.FC = () => {
  const {
    navegarPara,
    refeicoes,
    registrarRefeicao,
    editarRefeicao,
    inventarioAgrupado,
    estoqueLotes
  } = useApp();

  const [cardInfoAberto, setCardInfoAberto] = useState(false);
  const [modalNovaRefeicaoAberto, setModalNovaRefeicaoAberto] = useState(false);
  const [refeicaoParaDetalhes, setRefeicaoParaDetalhes] = useState<RegistroRefeicao | null>(null);
  const [refeicaoParaEditar, setRefeicaoParaEditar] = useState<RegistroRefeicao | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');

  // Filtro de 30 dias
  const trintaDiasAtrasMs = Date.now() - 30 * 24 * 60 * 60 * 1000;
  
  const refeicoes30Dias = useMemo(() => {
    return refeicoes
      .filter(r => r.dataRefeicao >= trintaDiasAtrasMs)
      .filter(r => filtroTipo === 'TODOS' || r.tipo === filtroTipo)
      .sort((a, b) => b.dataRefeicao - a.dataRefeicao);
  }, [refeicoes, filtroTipo]);

  // Agrupamento segmentado por data
  const refeicoesSegmentadasPorData = useMemo(() => {
    const grupos = new Map<string, { dataFormatada: string; dataTimestamp: number; itens: RegistroRefeicao[] }>();

    refeicoes30Dias.forEach(r => {
      const dataIso = formatarDataIso(new Date(r.dataRefeicao));
      const grupo = grupos.get(dataIso) || {
        dataFormatada: formatarData(r.dataRefeicao),
        dataTimestamp: r.dataRefeicao,
        itens: []
      };
      grupo.itens.push(r);
      grupos.set(dataIso, grupo);
    });

    return Array.from(grupos.values()).sort((a, b) => b.dataTimestamp - a.dataTimestamp);
  }, [refeicoes30Dias]);

  const totalGastoRefeicoes = refeicoes30Dias.reduce((acc, r) => acc + r.custoTotalRefeicao, 0);

  // Helper de badges por tipo de refeição
  const getBadgeStyle = (tipo: TipoRefeicao) => {
    switch (tipo) {
      case TipoRefeicao.CAFE_DA_MANHA:
        return 'bg-amber-200 text-black border-2 border-black';
      case TipoRefeicao.ALMOCO:
        return 'bg-yellow-300 text-black border-2 border-black';
      case TipoRefeicao.JANTAR:
        return 'bg-sky-200 text-black border-2 border-black';
      case TipoRefeicao.LANCHE:
        return 'bg-purple-200 text-black border-2 border-black';
    }
  };

  return (
    <div className="space-y-6 pb-28 animate-in fade-in duration-200">
      {/* Cabeçalho */}
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
              Histórico de Refeições
            </h1>
            <p className="text-xs font-medium text-gray-500">
              Consumo dos últimos 30 dias com dedução proporcional exata via PEPS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-yellow-300 border-2 border-black px-3.5 py-1.5 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] self-start sm:self-auto">
          <span className="text-[10px] uppercase font-black text-black tracking-wider">Custo Total (30d):</span>
          <span className="text-base font-black font-mono text-black">
            {formatarMoeda(totalGastoRefeicoes)}
          </span>
        </div>
      </header>

      {/* Regra PEPS Banner Explicativo - Componente Colapsável (Inicia minimizado em botão Info) */}
      {!cardInfoAberto ? (
        <div className="flex items-center">
          <button
            onClick={() => setCardInfoAberto(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-white hover:bg-neutral-800 border-2 border-black rounded-xl text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
            title="Ver cálculo proporcional PEPS"
          >
            <Info size={14} className="stroke-[3] text-yellow-400" />
            <span>Info PEPS / FIFO</span>
          </button>
        </div>
      ) : (
        <div className="p-4 bg-black text-white rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-start justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <Sparkles size={20} className="text-yellow-400 shrink-0 mt-0.5 stroke-[2.5]" />
            <div className="space-y-1 text-xs">
              <p className="font-black uppercase tracking-wider text-yellow-300">
                Cálculo Proporcional Exato de Custo (PEPS / FIFO)
              </p>
              <p className="text-gray-300 leading-relaxed font-medium">
                O preço do ingrediente consumido é calculado com base no primeiro lote adicionado à despensa. Regra de 3:{' '}
                <code className="bg-neutral-800 text-yellow-300 px-1.5 py-0.5 rounded border border-neutral-700 font-mono font-bold">
                  (quantidadeConsumida / volumeTotalLote) * (precoUnitario * quantidadeComprada)
                </code>
              </p>
            </div>
          </div>
          <button
            onClick={() => setCardInfoAberto(false)}
            className="p-1 rounded-lg border border-neutral-600 text-white hover:bg-neutral-800 transition-colors shrink-0 cursor-pointer"
            title="Fechar card explicativo"
          >
            <X size={16} className="stroke-[3]" />
          </button>
        </div>
      )}

      {/* Filtro por Tipo de Refeição */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <button
            onClick={() => setFiltroTipo('TODOS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border-2 border-black cursor-pointer ${
              filtroTipo === 'TODOS'
                ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            Todas ({refeicoes.length})
          </button>
          {Object.entries(TIPO_REFEICAO_LABELS).map(([key, label]) => {
            const count = refeicoes.filter(r => r.tipo === key).length;
            return (
              <button
                key={key}
                onClick={() => setFiltroTipo(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border-2 border-black cursor-pointer ${
                  filtroTipo === key
                    ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Visualização das refeições segmentadas por data */}
      <div className="space-y-6">
        {refeicoesSegmentadasPorData.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-yellow-100 border-2 border-black text-black flex items-center justify-center mx-auto shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <UtensilsCrossed size={32} className="stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase text-black">Nenhuma refeição registrada nos últimos 30 dias</h3>
              <p className="text-xs text-gray-600 max-w-sm mx-auto mt-1 font-medium">
                Registre uma refeição para consumir ingredientes da sua despensa com a regra PEPS e rastrear o custo alimentar.
              </p>
            </div>
            <button
              onClick={() => setModalNovaRefeicaoAberto(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-300 hover:bg-yellow-400 text-black font-black uppercase tracking-wider text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
            >
              <Plus size={16} className="stroke-[3]" /> Registrar Primeira Refeição
            </button>
          </div>
        ) : (
          refeicoesSegmentadasPorData.map(secao => (
            <div key={secao.dataFormatada} className="space-y-3">
              {/* Cabeçalho da Seção de Data */}
              <div className="flex items-center gap-2 text-xs font-black text-black uppercase tracking-wider">
                <Calendar size={14} className="stroke-[2.5]" />
                <span>{secao.dataFormatada}</span>
                <span className="text-[10px] font-bold text-gray-500 lowercase">
                  ({secao.itens.length} refeição{secao.itens.length > 1 ? 'ões' : ''})
                </span>
                <div className="h-0.5 flex-1 bg-black ml-2" />
              </div>

              {/* Grid de Cards de Refeição (Mantido estritamente o botão Editar, botão Excluir removido) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {secao.itens.map(refeicao => (
                  <div
                    key={refeicao.idRefeicao}
                    className="bg-white p-4 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top: Tipo de Refeição e Botão Editar Card (Sem botão Excluir) */}
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded-lg ${getBadgeStyle(
                            refeicao.tipo
                          )}`}
                        >
                          {TIPO_REFEICAO_LABELS[refeicao.tipo]}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {/* Botão estrito para editar card */}
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              setRefeicaoParaEditar(refeicao);
                            }}
                            className="p-1.5 text-black hover:bg-yellow-200 border-2 border-black rounded-lg transition-colors cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px]"
                            title="Editar informações da refeição"
                          >
                            <Edit2 size={13} className="stroke-[2.5]" />
                          </button>
                        </div>
                      </div>

                      {/* Nome da Receita e Descrição */}
                      <div
                        onClick={() => setRefeicaoParaDetalhes(refeicao)}
                        className="mt-3 cursor-pointer"
                      >
                        <h4 className="text-base font-black text-black leading-tight">
                          {refeicao.receitaRealizada || 'Refeição Preparada'}
                        </h4>
                        {refeicao.observacao && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-1 font-medium">
                            {refeicao.observacao}
                          </p>
                        )}
                      </div>

                      {/* Lista resumida de ingredientes */}
                      <div
                        onClick={() => setRefeicaoParaDetalhes(refeicao)}
                        className="mt-3 flex flex-wrap gap-1.5 cursor-pointer"
                      >
                        {refeicao.ingredientes.map((ing, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-[10px] bg-gray-100 border border-black text-black px-2 py-0.5 rounded-md font-bold"
                          >
                            {ing.nomeProduto}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom: Preço Total da Refeição & Botão Detalhes */}
                    <div
                      onClick={() => setRefeicaoParaDetalhes(refeicao)}
                      className="mt-4 pt-3 border-t-2 border-black flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <span className="text-[9px] text-gray-500 uppercase tracking-wider block font-black">
                          Custo Total PEPS
                        </span>
                        <span className="text-base font-black font-mono text-emerald-700">
                          {formatarMoeda(refeicao.custoTotalRefeicao)}
                        </span>
                      </div>

                      <button className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        <span>Ver Detalhes</span>
                        <ChevronRight size={14} className="stroke-[3]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Botão "Adicionar Refeição" centralizado na parte inferior da tela */}
      <div className="fixed bottom-20 sm:bottom-20 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
        <button
          onClick={() => setModalNovaRefeicaoAberto(true)}
          className="pointer-events-auto px-7 py-3.5 bg-yellow-300 hover:bg-yellow-400 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] text-black font-black uppercase tracking-wider rounded-2xl text-xs sm:text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2.5 border-2 border-black cursor-pointer"
        >
          <Plus size={18} className="stroke-[3]" />
          <span>Adicionar Refeição</span>
        </button>
      </div>

      {/* Modal de Adicionar Refeição */}
      <ModalNovaRefeicao
        isOpen={modalNovaRefeicaoAberto}
        onClose={() => setModalNovaRefeicaoAberto(false)}
        inventarioAgrupado={inventarioAgrupado}
        todosOsLotes={estoqueLotes}
        onRegistrar={registrarRefeicao}
      />

      {/* Modal de Detalhes da Refeição */}
      <ModalDetalhesRefeicao
        isOpen={!!refeicaoParaDetalhes}
        onClose={() => setRefeicaoParaDetalhes(null)}
        refeicao={refeicaoParaDetalhes}
      />

      {/* Modal de Edição da Refeição */}
      <ModalEditarRefeicao
        isOpen={!!refeicaoParaEditar}
        onClose={() => setRefeicaoParaEditar(null)}
        refeicao={refeicaoParaEditar}
        onSalvar={editarRefeicao}
      />
    </div>
  );
};
