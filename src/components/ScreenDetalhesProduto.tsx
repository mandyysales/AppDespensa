import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Store,
  Tag,
  DollarSign,
  Layers,
  Clock,
  ShieldCheck,
  Sparkles,
  Edit2,
  Info,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CategoriaItem, CATEGORIA_LABELS, ItemLoteEstoque } from '../types';
import { formatarMoeda, formatarData, formatarVolume } from '../utils/converters';
import { ProductIcon } from './ProductIcon';
import { ModalEditarLote } from './ModalEditarLote';

export const ScreenDetalhesProduto: React.FC = () => {
  const {
    produtoSelecionadoNome,
    navegarPara,
    inventarioAgrupado,
    atualizarCategoriaProduto,
    atualizarLote
  } = useApp();

  const [cardInfoAberto, setCardInfoAberto] = useState(false);
  const [loteParaEditar, setLoteParaEditar] = useState<ItemLoteEstoque | null>(null);

  const produto = inventarioAgrupado.find(
    p => p.nomeProduto.toLowerCase() === (produtoSelecionadoNome || '').toLowerCase()
  );

  if (!produto) {
    return (
      <div className="bg-white p-8 rounded-2xl border-2 border-black text-center space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <p className="text-gray-700 font-bold">Nenhum produto selecionado ou produto não encontrado no estoque.</p>
        <button
          onClick={() => navegarPara('ESTOQUE')}
          className="px-4 py-2 bg-yellow-300 text-black border-2 border-black rounded-xl text-sm font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
        >
          Voltar para a Despensa
        </button>
      </div>
    );
  }

  // Lotes ordenados por data de compra (Mais antigo primeiro - Regra PEPS)
  const lotesOrdenados = [...produto.lotes].sort((a, b) => a.dataCompra - b.dataCompra);
  
  // Primeiro lote com estoque restante é o "Próximo na fila PEPS"
  const primeiroLoteAtivoIndex = lotesOrdenados.findIndex(l => l.volumeRestante > 0.001);

  const handleMudarCategoria = (novaCat: string) => {
    if (novaCat) {
      atualizarCategoriaProduto(produto.nomeProduto, novaCat as CategoriaItem);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Cabeçalho Requisito: Botão "Voltar" e texto "Gestão de Lotes" acima do nome do produto */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navegarPara('ESTOQUE')}
            className="p-2 rounded-xl bg-white border-2 border-black text-black hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            title="Voltar para Sua Despensa"
          >
            <ArrowLeft size={18} className="stroke-[2.5]" />
          </button>
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-gray-400">
              Gestão de Lotes
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-black uppercase">
              Produto {produto.nomeProduto}
            </h1>
            <p className="text-xs font-medium text-gray-500">Histórico de lotes, datas de compra e consumo FIFO</p>
          </div>
        </div>

        {/* Adicionar / Alterar Categoria */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <Tag size={16} className="text-black shrink-0 ml-1 stroke-[2.5]" />
          <span className="text-xs font-black text-black uppercase tracking-wider whitespace-nowrap hidden sm:inline">Categoria:</span>
          <select
            value={produto.categoria || ''}
            onChange={e => handleMudarCategoria(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 border-2 border-black rounded-lg text-xs text-black font-bold focus:outline-none focus:ring-2 focus:ring-black transition-all cursor-pointer"
          >
            <option value="">Selecione uma Categoria...</option>
            {Object.entries(CATEGORIA_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </header>

      {/* Resumo Consolidado do Produto */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-100 border-2 border-black text-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <ProductIcon icone={produto.icone} categoria={produto.categoria} size={24} />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 block font-black uppercase tracking-wider">Total Disponível</span>
            <span className="text-xl font-black font-mono text-black">
              {formatarVolume(produto.quantidadeTotalDisponivel, produto.baseUnidade)}
            </span>
            <span className="text-xs text-gray-600 block font-mono font-medium">
              ≈ {produto.totalItensRestantes.toFixed(1)} pacotes
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-200 border-2 border-black text-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Layers size={24} className="stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 block font-black uppercase tracking-wider">Lotes Cadastrados</span>
            <span className="text-xl font-black font-mono text-black">
              {produto.lotes.length} lotes
            </span>
            <span className="text-xs text-gray-600 block font-medium">
              {lotesOrdenados.filter(l => l.volumeRestante > 0.001).length} com saldo positivo
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-200 border-2 border-black text-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <DollarSign size={24} className="stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 block font-black uppercase tracking-wider">Valor em Estoque</span>
            <span className="text-xl font-black font-mono text-emerald-700">
              {formatarMoeda(produto.valorTotalEstoque)}
            </span>
            <span className="text-xs text-gray-600 block font-medium">
              Custo proporcional PEPS
            </span>
          </div>
        </div>
      </div>

      {/* Regra PEPS Explicação Visual - Componente Colapsável (Inicia minimizado em botão Info) */}
      {!cardInfoAberto ? (
        <div className="flex items-center">
          <button
            onClick={() => setCardInfoAberto(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-300 hover:bg-yellow-400 text-black border-2 border-black rounded-xl text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
            title="Ver explicação sobre a fila PEPS"
          >
            <Info size={14} className="stroke-[3]" />
            <span>Info PEPS</span>
          </button>
        </div>
      ) : (
        <div className="p-4 bg-[#FFEB3B]/20 border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-start justify-between gap-3 text-xs text-black animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <ShieldCheck size={20} className="text-black shrink-0 mt-0.5 stroke-[2.5]" />
            <div className="space-y-1">
              <p className="font-black uppercase text-black tracking-wide">
                Fila de Consumo PEPS (Primeiro que Entra, Primeiro que Sai)
              </p>
              <p className="text-gray-800 leading-relaxed font-medium">
                Ao registrar refeições, o sistema consome primeiro os ingredientes do <strong>Lote #{primeiroLoteAtivoIndex >= 0 ? primeiroLoteAtivoIndex + 1 : '1'} (mais antigo)</strong>. Quando este lote for totalmente esgotado, o consumo continuará automaticamente no lote seguinte.
              </p>
            </div>
          </div>
          <button
            onClick={() => setCardInfoAberto(false)}
            className="p-1 rounded-lg border-2 border-black text-black hover:bg-yellow-300 transition-colors shrink-0 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
            title="Fechar card explicativo"
          >
            <X size={16} className="stroke-[3]" />
          </button>
        </div>
      )}

      {/* Segmentação por Lotes de Compra */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black text-gray-500 uppercase tracking-wider">
            Segmentação por Lotes de Compra ({lotesOrdenados.length})
          </h2>
          <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">
            Cronológico: Mais antigo ➔ Mais recente
          </span>
        </div>

        <div className="space-y-3">
          {lotesOrdenados.map((lote, index) => {
            const isProximoPEPS = index === primeiroLoteAtivoIndex;
            const isEsgotado = lote.volumeRestante <= 0.001;
            const porcentagemRestante = lote.volumeTotalOriginal > 0
              ? Math.round((lote.volumeRestante / lote.volumeTotalOriginal) * 100)
              : 0;

            const pacotesRestantes = lote.tamanhoVolumeOriginal > 0
              ? (lote.volumeRestante / lote.tamanhoVolumeOriginal)
              : 0;

            return (
              <div
                key={lote.idLote}
                className={`bg-white rounded-2xl border-2 border-black p-5 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4 ${
                  isProximoPEPS
                    ? 'ring-2 ring-yellow-400 bg-yellow-50/30'
                    : isEsgotado
                    ? 'opacity-60 bg-gray-50'
                    : ''
                }`}
              >
                {/* Header do Lote com numeração sequencial legível (# 1, # 2...) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-black text-white font-black text-xs flex items-center justify-center font-mono border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                      # {index + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-black text-black flex items-center gap-1.5">
                          <Store size={15} className="stroke-[2.5]" />
                          {lote.mercadoOrigem}
                        </span>
                        {isProximoPEPS && (
                          <span className="text-[10px] font-black uppercase text-black bg-yellow-300 border border-black px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Sparkles size={12} className="stroke-[3]" /> Próximo na Fila PEPS
                          </span>
                        )}
                        {isEsgotado && (
                          <span className="text-[10px] font-black uppercase text-gray-500 bg-gray-200 border border-gray-400 px-2 py-0.5 rounded-md">
                            Lote Esgotado
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Data da Compra */}
                  <div className="flex items-center gap-2 text-xs text-black font-bold bg-gray-100 px-3 py-1.5 rounded-xl border border-black self-start sm:self-auto">
                    <Calendar size={14} className="stroke-[2.5]" />
                    <span>Data de Compra: <strong className="font-mono">{formatarData(lote.dataCompra)}</strong></span>
                  </div>
                </div>

                {/* Grid de Informações: Data, Nome Mercado, Preço Pago e Quantidade Restante */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-gray-50 rounded-xl border-2 border-black text-xs">
                  <div>
                    <span className="text-gray-500 block font-black text-[9px] uppercase tracking-wider">Preço Pago (Unitário)</span>
                    <span className="text-sm font-black font-mono text-black">
                      {formatarMoeda(lote.precoUnitarioPago)}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono block">
                      Total: {formatarMoeda(lote.precoUnitarioPago * lote.quantidadeComprada)}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-500 block font-black text-[9px] uppercase tracking-wider">Qtd Comprada Original</span>
                    <span className="text-sm font-black font-mono text-black">
                      {lote.quantidadeComprada} un. ({formatarVolume(lote.volumeTotalOriginal, lote.baseUnidade, false)})
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono block">
                      {formatarVolume(lote.tamanhoVolumeOriginal, lote.baseUnidade, false)}/un
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-500 block font-black text-[9px] uppercase tracking-wider">Volume Consumido</span>
                    <span className="text-sm font-black font-mono text-amber-700">
                      {formatarVolume(lote.volumeConsumido || 0, lote.baseUnidade, false)}
                    </span>
                    <span className="text-[10px] text-gray-500 block font-medium">
                      Registrado em refeições
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-500 block font-black text-[9px] uppercase tracking-wider">Quantidade Restante</span>
                    <span className="text-sm font-black font-mono text-emerald-700">
                      {formatarVolume(lote.volumeRestante, lote.baseUnidade)}
                    </span>
                    <span className="text-[10px] text-black font-mono font-bold block">
                      {pacotesRestantes.toFixed(2)} un.
                    </span>
                  </div>
                </div>

                {/* Barra de Progresso do Volume Restante do Lote */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                    <span>Nível de Estoque do Lote:</span>
                    <span className="font-mono font-black text-black">{porcentagemRestante}% disponível</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden border border-black">
                    <div
                      className={`h-full transition-all duration-300 ${
                        porcentagemRestante > 50
                          ? 'bg-emerald-500'
                          : porcentagemRestante > 20
                          ? 'bg-yellow-400'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, porcentagemRestante))}%` }}
                    />
                  </div>
                </div>

                {/* Validade do Lote (se cadastrado) e Botão de Ação "Editar" na parte inferior do Lote */}
                <div className="pt-2 border-t border-gray-200 flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    {lote.dataValidade ? (
                      <div className="text-xs text-gray-600 flex items-center gap-1.5 font-medium">
                        <Clock size={14} className="stroke-[2.5]" />
                        <span>Data de Validade: <strong className="font-mono text-black">{formatarData(lote.dataValidade)}</strong></span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-400 font-medium">Sem data de validade</span>
                    )}
                  </div>

                  <button
                    onClick={() => setLoteParaEditar(lote)}
                    className="px-3 py-1.5 bg-yellow-100 hover:bg-yellow-200 border-2 border-black rounded-xl text-black text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer transition-all ml-auto"
                    title="Editar informações do lote"
                  >
                    <Edit2 size={13} className="stroke-[2.5]" />
                    <span>Editar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de Edição do Lote */}
      <ModalEditarLote
        isOpen={!!loteParaEditar}
        onClose={() => setLoteParaEditar(null)}
        lote={loteParaEditar}
        onSalvar={atualizarLote}
      />
    </div>
  );
};
