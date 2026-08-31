import React, { useState, useEffect } from 'react';
import { X, Edit3, Loader2 } from 'lucide-react';
import { RegistroRefeicao, TipoRefeicao, TIPO_REFEICAO_LABELS } from '../types';

interface ModalEditarRefeicaoProps {
  isOpen: boolean;
  onClose: () => void;
  refeicao: RegistroRefeicao | null;
  onSalvar: (idRefeicao: string, dados: { receitaRealizada?: string; observacao?: string; tipo?: TipoRefeicao }) => Promise<void> | void;
}

export const ModalEditarRefeicao: React.FC<ModalEditarRefeicaoProps> = ({
  isOpen,
  onClose,
  refeicao,
  onSalvar
}) => {
  const [tipo, setTipo] = useState<TipoRefeicao>(TipoRefeicao.ALMOCO);
  const [receita, setReceita] = useState('');
  const [observacao, setObservacao] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (refeicao) {
      setTipo(refeicao.tipo);
      setReceita(refeicao.receitaRealizada || '');
      setObservacao(refeicao.observacao || '');
    }
  }, [refeicao, isOpen]);

  if (!isOpen || !refeicao) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSalvando(true);
      await onSalvar(refeicao.idRefeicao, {
        tipo,
        receitaRealizada: receita.trim(),
        observacao: observacao.trim()
      });
      onClose();
    } catch (err) {
      console.error('Erro ao salvar alteração da refeição:', err);
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
            <h3 className="font-black text-black uppercase tracking-tight text-base">Editar Refeição</h3>
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
              Tipo de Refeição
            </label>
            <select
              value={tipo}
              onChange={e => setTipo(e.target.value as TipoRefeicao)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border-2 border-black rounded-xl text-sm text-black font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-black cursor-pointer"
            >
              <option value={TipoRefeicao.CAFE_DA_MANHA}>{TIPO_REFEICAO_LABELS[TipoRefeicao.CAFE_DA_MANHA]}</option>
              <option value={TipoRefeicao.ALMOCO}>{TIPO_REFEICAO_LABELS[TipoRefeicao.ALMOCO]}</option>
              <option value={TipoRefeicao.JANTAR}>{TIPO_REFEICAO_LABELS[TipoRefeicao.JANTAR]}</option>
              <option value={TipoRefeicao.LANCHE}>{TIPO_REFEICAO_LABELS[TipoRefeicao.LANCHE]}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-black uppercase tracking-wider mb-1.5">
              Receita / Nome do Prato
            </label>
            <input
              type="text"
              value={receita}
              onChange={e => setReceita(e.target.value)}
              placeholder="Ex: Omelete de Queijo"
              className="w-full px-3.5 py-2.5 bg-gray-50 border-2 border-black rounded-xl text-sm font-bold text-black focus:outline-none focus:bg-white focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-black uppercase tracking-wider mb-1.5">
              Descrição / Observação
            </label>
            <textarea
              value={observacao}
              onChange={e => setObservacao(e.target.value)}
              rows={3}
              placeholder="Notas adicionais sobre o preparo..."
              className="w-full px-3.5 py-2.5 bg-gray-50 border-2 border-black rounded-xl text-sm font-bold text-black focus:outline-none focus:bg-white focus:ring-2 focus:ring-black resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
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
