import React from 'react';
import { X, Calendar, Utensils, FileText, ShoppingBag, Layers, Clock } from 'lucide-react';
import { RegistroRefeicao, TIPO_REFEICAO_LABELS } from '../types';
import { formatarMoeda, formatarData, formatarVolume } from '../utils/converters';
import { ProductIcon } from './ProductIcon';

interface ModalDetalhesRefeicaoProps {
  isOpen: boolean;
  onClose: () => void;
  refeicao: RegistroRefeicao | null;
}

export const ModalDetalhesRefeicao: React.FC<ModalDetalhesRefeicaoProps> = ({
  isOpen,
  onClose,
  refeicao
}) => {
  if (!isOpen || !refeicao) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-2 border-black overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b-2 border-black flex items-center justify-between bg-yellow-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-300 border-2 border-black text-black flex items-center justify-center font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Utensils size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-black bg-yellow-300 px-2 py-0.5 rounded-md border border-black">
                {TIPO_REFEICAO_LABELS[refeicao.tipo]}
              </span>
              <h2 className="text-lg font-black text-black uppercase mt-1">
                {refeicao.receitaRealizada || 'Refeição Registrada'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border-2 border-black text-black hover:bg-yellow-200 transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
          >
            <X size={18} className="stroke-[3]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-gray-50 rounded-xl border-2 border-black text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 text-black">
              <Calendar size={15} className="text-black stroke-[2.5]" />
              <span>Data: <strong className="font-mono">{formatarData(refeicao.dataRefeicao)}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-black">
              <Layers size={15} className="text-black stroke-[2.5]" />
              <span>Ingredientes: <strong>{refeicao.ingredientes.length} itens</strong></span>
            </div>
          </div>

          {/* Descrição / Observação */}
          {refeicao.observacao && (
            <div className="p-3.5 bg-yellow-100 border-2 border-black rounded-xl text-xs text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <span className="font-black uppercase tracking-wider block mb-0.5 text-black flex items-center gap-1.5">
                <FileText size={14} className="stroke-[2.5]" /> Observação da Refeição:
              </span>
              <p className="text-gray-800 font-medium">{refeicao.observacao}</p>
            </div>
          )}

          {/* Detalhamento dos Ingredientes e Lotes PEPS */}
          <div>
            <h3 className="text-xs font-black text-black uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Ingredientes e Rastreabilidade PEPS</span>
              <span className="text-gray-500 font-bold">Lote de Origem</span>
            </h3>

            <div className="space-y-2.5">
              {refeicao.ingredientes.map((ing, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-yellow-100 border border-black text-black flex items-center justify-center">
                        <ProductIcon size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-black">{ing.nomeProduto}</p>
                        <p className="text-[11px] text-gray-600 font-mono font-bold">
                          Consumido: {formatarVolume(ing.quantidadeConsumida, ing.baseUnidade, false)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] text-gray-500 uppercase font-black block">Custo proporcional</span>
                      <span className="text-xs font-black font-mono text-emerald-700">
                        {formatarMoeda(ing.custoCalculo)}
                      </span>
                    </div>
                  </div>

                  {/* Informações do Lote de Origem PEPS */}
                  <div className="pt-2 border-t border-gray-200 flex flex-wrap items-center justify-between text-[11px] text-black gap-2 bg-gray-50 p-2 rounded-lg border border-black font-medium">
                    <div className="flex items-center gap-1.5 font-bold">
                      <ShoppingBag size={13} className="text-black stroke-[2.5]" />
                      <span>{ing.mercadoOrigemLote || 'Mercado de Origem'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-bold">
                      <Clock size={13} className="text-black stroke-[2.5]" />
                      <span>Comprado em: {formatarData(ing.dataLoteCompra)}</span>
                    </div>
                    <span className="font-mono text-[10px] text-black bg-yellow-300 px-1.5 py-0.5 rounded border border-black font-black">
                      ID: {ing.idLoteOrigem.substring(0, 14)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custo Total */}
          <div className="p-4 bg-black text-white rounded-2xl border-2 border-black flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div>
              <p className="text-[10px] uppercase font-black text-yellow-300 tracking-wider">Preço Total da Refeição:</p>
              <p className="text-xs text-gray-300 font-medium">Soma calculada pela regra PEPS</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black font-mono text-yellow-400">
                {formatarMoeda(refeicao.custoTotalRefeicao)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t-2 border-black flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-black text-white text-xs font-black uppercase tracking-wider hover:bg-neutral-800 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
          >
            Fechar Detalhes
          </button>
        </div>
      </div>
    </div>
  );
};
