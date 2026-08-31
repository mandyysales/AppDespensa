import React, { useState, useEffect } from 'react';
import { X, Edit3, Calendar, Store, Loader2 } from 'lucide-react';
import { ItemLoteEstoque } from '../types';
import { formatarDataIso, parseDataIsoParaTimestamp } from '../utils/converters';

interface ModalEditarLoteProps {
  isOpen: boolean;
  onClose: () => void;
  lote: ItemLoteEstoque | null;
  onSalvar: (idLote: string, dados: Partial<ItemLoteEstoque>) => Promise<void> | void;
}

export const ModalEditarLote: React.FC<ModalEditarLoteProps> = ({
  isOpen,
  onClose,
  lote,
  onSalvar
}) => {
  const [mercado, setMercado] = useState('');
  const [precoUnitario, setPrecoUnitario] = useState('');
  const [dataValidadeStr, setDataValidadeStr] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (lote) {
      setMercado(lote.mercadoOrigem || '');
      setPrecoUnitario(String(lote.precoUnitarioPago || ''));
      if (lote.dataValidade) {
        setDataValidadeStr(formatarDataIso(new Date(lote.dataValidade)));
      } else {
        setDataValidadeStr('');
      }
    }
  }, [lote, isOpen]);

  if (!isOpen || !lote) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const preco = parseFloat(precoUnitario.replace(',', '.'));
    try {
      setSalvando(true);
      await onSalvar(lote.idLote, {
        mercadoOrigem: mercado.trim() || lote.mercadoOrigem,
        precoUnitarioPago: isNaN(preco) || preco <= 0 ? lote.precoUnitarioPago : preco,
        dataValidade: dataValidadeStr ? parseDataIsoParaTimestamp(dataValidadeStr) : undefined
      });
      onClose();
    } catch (err) {
      console.error('Erro ao salvar dados do lote:', err);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-2 border-black overflow-hidden">
        <div className="px-6 py-4 border-b-2 border-black flex items-center justify-between bg-yellow-50">
          <div className="flex items-center gap-2">
            <Edit3 size={18} className="text-black stroke-[2.5]" />
            <h3 className="font-black text-black uppercase tracking-tight text-base">Editar Lote</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border-2 border-black text-black hover:bg-yellow-200 transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
          >
            <X size={18} className="stroke-[3]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-black text-black uppercase tracking-wider mb-1.5">
              Supermercado / Origem
            </label>
            <div className="relative">
              <Store size={16} className="absolute left-3.5 top-3 text-black stroke-[2.5]" />
              <input
                type="text"
                value={mercado}
                onChange={e => setMercado(e.target.value)}
                placeholder="Nome do mercado"
                className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border-2 border-black rounded-xl text-sm font-bold text-black focus:outline-none focus:bg-white focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-black uppercase tracking-wider mb-1.5">
              Preço Unitário Pago (R$)
            </label>
            <input
              type="number"
              step="0.01"
              value={precoUnitario}
              onChange={e => setPrecoUnitario(e.target.value)}
              placeholder="0.00"
              className="w-full px-3.5 py-2.5 bg-gray-50 border-2 border-black rounded-xl text-sm font-bold text-black focus:outline-none focus:bg-white focus:ring-2 focus:ring-black font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-black uppercase tracking-wider mb-1.5">
              Data de Validade (Opcional)
            </label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3.5 top-3 text-black stroke-[2.5]" />
              <input
                type="date"
                value={dataValidadeStr}
                onChange={e => setDataValidadeStr(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border-2 border-black rounded-xl text-sm font-bold text-black focus:outline-none focus:bg-white focus:ring-2 focus:ring-black cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={salvando}
              onClick={onClose}
              className="px-4 py-2 rounded-xl border-2 border-black text-xs font-black uppercase tracking-wider text-black bg-white hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="px-5 py-2 rounded-xl bg-yellow-300 hover:bg-yellow-400 text-xs font-black uppercase tracking-wider text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer transition-all flex items-center gap-1.5"
            >
              {salvando ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <span>Salvar Alterações</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
