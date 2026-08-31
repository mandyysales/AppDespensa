import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Sparkles, AlertCircle, Calendar } from 'lucide-react';
import { ItemCarrinho, PesoVolume, HistoricoProduto } from '../types';
import { converterParaUnidadeBase, inferirCategoriaEIcone, formatarMoeda, formatarVolume, formatarDataIso, parseDataIsoParaTimestamp } from '../utils/converters';

interface ModalItemCarrinhoProps {
  isOpen: boolean;
  onClose: () => void;
  onSalvar: (item: ItemCarrinho) => void;
  itemEmEdicao?: ItemCarrinho | null;
  historicoProdutos: HistoricoProduto[];
}

export const ModalItemCarrinho: React.FC<ModalItemCarrinhoProps> = ({
  isOpen,
  onClose,
  onSalvar,
  itemEmEdicao,
  historicoProdutos
}) => {
  const [nome, setNome] = useState('');
  const [unidade, setUnidade] = useState<PesoVolume>(PesoVolume.KG);
  const [valorVolume, setValorVolume] = useState<string>('1');
  const [precoUnit, setPrecoUnit] = useState<string>('');
  const [quantidade, setQuantidade] = useState<string>('1');
  const [dataValidadeStr, setDataValidadeStr] = useState<string>('');
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const autocompleteRef = useRef<HTMLDivElement>(null);

  // Inicializa com dados de edição ou padrões limpos
  useEffect(() => {
    if (itemEmEdicao) {
      setNome(itemEmEdicao.nome);
      setUnidade(itemEmEdicao.unidadeSelecionada || (itemEmEdicao.baseUnidade === 'ml' ? PesoVolume.ML : PesoVolume.G));
      setValorVolume(
        itemEmEdicao.valorDigitadoVolume !== undefined
          ? String(itemEmEdicao.valorDigitadoVolume)
          : String(itemEmEdicao.tamanhoVolumeOriginal)
      );
      setPrecoUnit(String(itemEmEdicao.precoUnit));
      setQuantidade(String(itemEmEdicao.quantidade));
      if (itemEmEdicao.dataValidade) {
        setDataValidadeStr(formatarDataIso(new Date(itemEmEdicao.dataValidade)));
      } else {
        setDataValidadeStr('');
      }
    } else {
      setNome('');
      setUnidade(PesoVolume.KG);
      setValorVolume('1');
      setPrecoUnit('');
      setQuantidade('1');
      setDataValidadeStr('');
    }
    setErro(null);
    setMostrarSugestoes(false);
  }, [itemEmEdicao, isOpen]);

  // Fechar autocomplete ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setMostrarSugestoes(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  // Filtrar histórico para autocomplete
  const sugestoesFiltradas = historicoProdutos.filter(h =>
    nome.trim().length > 0 &&
    h.nome.toLowerCase().includes(nome.toLowerCase()) &&
    h.nome.toLowerCase() !== nome.toLowerCase()
  );

  const selecionarSugestao = (sugestao: HistoricoProduto) => {
    setNome(sugestao.nome);
    const { unidadeSugerida, volumeSugerido } = inferirCategoriaEIcone(sugestao.nome);
    setUnidade(unidadeSugerida);
    setValorVolume(String(volumeSugerido));
    setMostrarSugestoes(false);
  };

  // Quando o usuário digita o nome e sai do campo ou pausa, sugerir unidade se estiver vazio
  const handleNomeBlur = () => {
    setTimeout(() => {
      if (nome.trim() && !itemEmEdicao && !precoUnit) {
        const { unidadeSugerida, volumeSugerido } = inferirCategoriaEIcone(nome);
        setUnidade(unidadeSugerida);
        setValorVolume(String(volumeSugerido));
      }
    }, 200);
  };

  // Cálculos dinâmicos
  const numVolume = parseFloat(valorVolume.replace(',', '.')) || 0;
  const numPreco = parseFloat(precoUnit.replace(',', '.')) || 0;
  const numQuantidade = parseInt(quantidade, 10) || 0;

  // Conversão de L/KG para ml/g
  const { volumeEmBase, baseUnidade } = converterParaUnidadeBase(numVolume, unidade);
  const precoTotalItem = numQuantidade * numPreco;

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      setErro('Digite o nome do produto.');
      return;
    }
    if (numVolume <= 0) {
      setErro('Informe o peso/volume unitário do item.');
      return;
    }
    if (numPreco <= 0) {
      setErro('Informe um preço unitário válido.');
      return;
    }
    if (numQuantidade <= 0) {
      setErro('A quantidade de pacotes/unidades deve ser no mínimo 1.');
      return;
    }

    const dataValidade = dataValidadeStr ? parseDataIsoParaTimestamp(dataValidadeStr) : null;

    const item: ItemCarrinho = {
      id: itemEmEdicao ? itemEmEdicao.id : `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      nome: nome.trim(),
      quantidade: numQuantidade,
      tamanhoVolumeOriginal: volumeEmBase, // SEMPRE CONVERTIDO PARA 'g' ou 'ml'
      unidadeSelecionada: unidade,
      valorDigitadoVolume: numVolume,
      baseUnidade,
      precoUnit: numPreco,
      precoTotalItem,
      dataValidade
    };

    onSalvar(item);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-2 border-black overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b-2 border-black flex items-center justify-between bg-yellow-50">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-black uppercase tracking-tight">
              {itemEmEdicao ? 'Editar Item da Compra' : 'Adicionar Item ao Carrinho'}
            </h2>
            <p className="text-xs text-gray-600 font-medium mt-0.5">
              Converte automaticamente L e KG para ml e g para o estoque
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border-2 border-black text-black hover:bg-yellow-200 transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
          >
            <X size={18} className="stroke-[3]" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSalvar} className="p-6 space-y-4 overflow-y-auto flex-1">
          {erro && (
            <div className="p-3 bg-rose-100 border-2 border-black rounded-xl text-xs font-bold text-rose-950 flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <AlertCircle size={16} className="shrink-0 stroke-[2.5]" />
              <span>{erro}</span>
            </div>
          )}

          {/* Nome do Produto com Autocomplete */}
          <div className="relative" ref={autocompleteRef}>
            <label className="block text-xs font-black text-black uppercase tracking-wider mb-1.5">
              Nome do Produto <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={nome}
                onChange={e => {
                  setNome(e.target.value);
                  setMostrarSugestoes(true);
                  setErro(null);
                }}
                onFocus={() => setMostrarSugestoes(true)}
                onBlur={handleNomeBlur}
                placeholder="Ex: Arroz Branco, Leite Integral, Peito de Frango..."
                className="w-full pl-3.5 pr-10 py-2.5 bg-gray-50 border-2 border-black rounded-xl text-sm font-bold text-black placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-black transition-all"
                autoFocus
              />
              <Search className="absolute right-3.5 top-3 text-black stroke-[2.5]" size={18} />
            </div>

            {/* Dropdown Autocomplete */}
            {mostrarSugestoes && sugestoesFiltradas.length > 0 && (
              <div className="absolute z-20 left-0 right-0 mt-1 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden max-h-48 overflow-y-auto">
                <div className="p-2 text-[10px] font-black uppercase text-black bg-yellow-300 border-b-2 border-black flex items-center gap-1.5">
                  <Sparkles size={13} className="stroke-[3]" />
                  Sugestões do seu Histórico
                </div>
                {sugestoesFiltradas.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selecionarSugestao(item)}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-yellow-50 transition-colors flex items-center justify-between border-b border-gray-100 last:border-0 cursor-pointer"
                  >
                    <span className="text-xs font-bold text-black">{item.nome}</span>
                    <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded font-mono font-bold">
                      {item.quantidadeMedia}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tamanho/Volume e Tipo de Unidade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-black uppercase tracking-wider mb-1.5">
                Tamanho / Volume do Pacote <span className="text-rose-600">*</span>
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                value={valorVolume}
                onChange={e => setValorVolume(e.target.value)}
                placeholder="Ex: 1 ou 500"
                className="w-full px-3.5 py-2.5 bg-gray-50 border-2 border-black rounded-xl text-sm font-bold text-black focus:outline-none focus:bg-white focus:ring-2 focus:ring-black transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-black uppercase tracking-wider mb-1.5">
                Unidade de Medida <span className="text-rose-600">*</span>
              </label>
              <select
                value={unidade}
                onChange={e => setUnidade(e.target.value as PesoVolume)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border-2 border-black rounded-xl text-sm font-bold text-black focus:outline-none focus:bg-white focus:ring-2 focus:ring-black transition-all"
              >
                <option value={PesoVolume.KG}>KG (Quilogramas) ➔ Salva em g</option>
                <option value={PesoVolume.G}>G (Gramas)</option>
                <option value={PesoVolume.L}>L (Litros) ➔ Salva em ml</option>
                <option value={PesoVolume.ML}>ML (Mililitros)</option>
              </select>
            </div>
          </div>

          {/* Banner de Conversão em Tempo Real */}
          <div className="p-3 bg-yellow-100 border-2 border-black rounded-xl text-xs text-black flex items-center justify-between shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <span className="font-bold">Conversão para Estoque:</span>
            <span className="font-black font-mono text-black bg-white px-2 py-0.5 rounded border border-black">
              {numVolume > 0 ? `${volumeEmBase.toLocaleString('pt-BR')} ${baseUnidade} por unidade` : '0'}
            </span>
          </div>

          {/* Preço Unitário e Quantidade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-black uppercase tracking-wider mb-1.5">
                Preço Unitário (R$) <span className="text-rose-600">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={precoUnit}
                onChange={e => setPrecoUnit(e.target.value)}
                placeholder="Ex: 14.90"
                className="w-full px-3.5 py-2.5 bg-gray-50 border-2 border-black rounded-xl text-sm font-bold text-black focus:outline-none focus:bg-white focus:ring-2 focus:ring-black transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-black uppercase tracking-wider mb-1.5">
                Qtd de Pacotes / Unid. <span className="text-rose-600">*</span>
              </label>
              <input
                type="number"
                step="1"
                min="1"
                value={quantidade}
                onChange={e => setQuantidade(e.target.value)}
                placeholder="Ex: 1, 2, 3..."
                className="w-full px-3.5 py-2.5 bg-gray-50 border-2 border-black rounded-xl text-sm font-bold text-black focus:outline-none focus:bg-white focus:ring-2 focus:ring-black transition-all font-mono"
              />
            </div>
          </div>

          {/* Data de Validade (Requisito para o Lote) */}
          <div>
            <label className="block text-xs font-black text-black uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Data de Validade (Opcional)</span>
              <span className="text-[10px] font-bold text-gray-500">Controle do lote</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={dataValidadeStr}
                onChange={e => setDataValidadeStr(e.target.value)}
                className="w-full pl-3.5 pr-10 py-2.5 bg-gray-50 border-2 border-black rounded-xl text-sm font-bold text-black focus:outline-none focus:bg-white focus:ring-2 focus:ring-black transition-all font-mono"
              />
              <Calendar className="absolute right-3.5 top-3 text-black pointer-events-none stroke-[2.5]" size={18} />
            </div>
          </div>

          {/* Resumo do Valor Total do Item */}
          <div className="mt-2 p-4 bg-black text-white rounded-xl border-2 border-black flex items-center justify-between shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <div>
              <p className="text-[10px] uppercase font-black tracking-wider text-yellow-300">Total do Item:</p>
              <p className="text-xs text-gray-300 font-mono font-medium">
                {numQuantidade} unid. × {formatarMoeda(numPreco)} = {formatarVolume(numQuantidade * volumeEmBase, baseUnidade)}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xl font-black font-mono text-yellow-400">
                {formatarMoeda(precoTotalItem)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border-2 border-black text-xs font-black uppercase tracking-wider text-black bg-white hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-xs font-black uppercase tracking-wider text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
            >
              {itemEmEdicao ? 'Salvar Alterações' : 'Adicionar ao Carrinho'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
