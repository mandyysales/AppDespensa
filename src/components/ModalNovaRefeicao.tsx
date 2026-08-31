import React, { useState } from 'react';
import { X, Plus, Trash2, Calendar, AlertCircle, Info, ChefHat, Sparkles, Loader2 } from 'lucide-react';
import { TipoRefeicao, TIPO_REFEICAO_LABELS, ItemLoteEstoque, CardInventarioAgrupado } from '../types';
import { formatarMoeda, formatarVolume, formatarDataIso, parseDataIsoParaTimestamp } from '../utils/converters';
import { estimarCustoPEPS } from '../utils/peps';
import { ProductIcon } from './ProductIcon';

interface ItemConsumoTemp {
  id: string;
  nomeProduto: string;
  quantidade: number;
  baseUnidade: 'g' | 'ml';
  custoEstimado: number;
  detalhesLotes: { idLote: string; quantidade: number; custo: number; dataCompra: number }[];
}

interface ModalNovaRefeicaoProps {
  isOpen: boolean;
  onClose: () => void;
  inventarioAgrupado: CardInventarioAgrupado[];
  todosOsLotes: ItemLoteEstoque[];
  onRegistrar: (dados: {
    dataRefeicao: number;
    tipo: TipoRefeicao;
    receitaRealizada?: string;
    observacao?: string;
    itensConsumo: { nomeProduto: string; quantidade: number }[];
  }) => Promise<{ sucesso: boolean; mensagem?: string }>;
}

export const ModalNovaRefeicao: React.FC<ModalNovaRefeicaoProps> = ({
  isOpen,
  onClose,
  inventarioAgrupado,
  todosOsLotes,
  onRegistrar
}) => {
  const [dataIso, setDataIso] = useState(formatarDataIso(new Date()));
  const [tipo, setTipo] = useState<TipoRefeicao>(TipoRefeicao.ALMOCO);
  const [receita, setReceita] = useState('');
  const [observacao, setObservacao] = useState('');
  
  // Seleção de ingrediente atual
  const [produtoSelecionado, setProdutoSelecionado] = useState<string>('');
  const [quantidadeDigitada, setQuantidadeDigitada] = useState<string>('');
  const [erroItem, setErroItem] = useState<string | null>(null);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  // Lista de ingredientes adicionados à refeição
  const [ingredientesTemp, setIngredientesTemp] = useState<ItemConsumoTemp[]>([]);

  if (!isOpen) return null;

  // Produtos disponíveis com estoque positivo (> 0)
  const produtosComEstoque = inventarioAgrupado.filter(p => p.quantidadeTotalDisponivel > 0);

  // Produto atualmente em foco no seletor
  const cardProdutoAtual = inventarioAgrupado.find(p => p.nomeProduto === produtoSelecionado);
  const baseUnidadeAtual = cardProdutoAtual?.baseUnidade || 'g';
  const estoqueDisponivelAtual = cardProdutoAtual?.quantidadeTotalDisponivel || 0;

  // Quantidade já comprometida deste produto na refeição atual
  const jaAdicionadoDesteProduto = ingredientesTemp
    .filter(i => i.nomeProduto === produtoSelecionado)
    .reduce((acc, i) => acc + i.quantidade, 0);

  const saldoDisponivelReal = Math.max(0, estoqueDisponivelAtual - jaAdicionadoDesteProduto);

  // Estimativa em tempo real do item sendo digitado
  const qtdNum = parseFloat(quantidadeDigitada.replace(',', '.')) || 0;
  let estimativaAtual: { custo: number; detalheLotes: any[]; erro?: string } | null = null;
  
  if (produtoSelecionado && qtdNum > 0) {
    estimativaAtual = estimarCustoPEPS(produtoSelecionado, qtdNum + jaAdicionadoDesteProduto, todosOsLotes);
  }

  const handleAdicionarIngrediente = () => {
    setErroItem(null);
    if (!produtoSelecionado) {
      setErroItem('Selecione um produto da dispensa.');
      return;
    }
    if (qtdNum <= 0) {
      setErroItem('Informe uma quantidade válida maior que zero.');
      return;
    }
    if (qtdNum > saldoDisponivelReal) {
      setErroItem(`Quantidade excede o disponível na dispensa (${formatarVolume(saldoDisponivelReal, baseUnidadeAtual)}).`);
      return;
    }

    // Calcula a dedução PEPS considerando o que já foi adicionado
    const estimativa = estimarCustoPEPS(produtoSelecionado, qtdNum, todosOsLotes);
    if (estimativa.erro) {
      setErroItem(estimativa.erro);
      return;
    }

    const novoItemTemp: ItemConsumoTemp = {
      id: `ing-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      nomeProduto: produtoSelecionado,
      quantidade: qtdNum,
      baseUnidade: baseUnidadeAtual,
      custoEstimado: estimativa.custo,
      detalhesLotes: estimativa.detalheLotes
    };

    setIngredientesTemp(prev => [...prev, novoItemTemp]);
    
    // Limpa os campos de inserção conforme o requisito
    setQuantidadeDigitada('');
    setErroItem(null);
  };

  const handleRemoverIngrediente = (id: string) => {
    setIngredientesTemp(prev => prev.filter(i => i.id !== id));
  };

  // Custo total da refeição (soma de todos os ingredientes calculados via PEPS)
  const custoTotalRefeicao = ingredientesTemp.reduce((acc, i) => acc + i.custoEstimado, 0);

  const handleSalvarRefeicao = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroGeral(null);

    if (ingredientesTemp.length === 0) {
      setErroGeral('Adicione pelo menos 1 ingrediente à refeição antes de salvar.');
      return;
    }

    try {
      setSalvando(true);
      const timestamp = parseDataIsoParaTimestamp(dataIso);
      const resultado = await onRegistrar({
        dataRefeicao: timestamp,
        tipo,
        receitaRealizada: receita.trim() || undefined,
        observacao: observacao.trim() || undefined,
        itensConsumo: ingredientesTemp.map(i => ({
          nomeProduto: i.nomeProduto,
          quantidade: i.quantidade
        }))
      });

      if (resultado.sucesso) {
        onClose();
      } else {
        setErroGeral(resultado.mensagem || 'Ocorreu um erro ao registrar a refeição no Firestore.');
      }
    } catch (err: any) {
      setErroGeral('Erro de conexão ao registrar refeição no banco de dados.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-2 border-black overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b-2 border-black flex items-center justify-between bg-yellow-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-300 border-2 border-black text-black flex items-center justify-center font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <ChefHat size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-black uppercase tracking-tight">Registrar Refeição & Consumo</h2>
              <p className="text-xs text-gray-600 font-medium">
                Aplica a regra <strong className="text-black underline font-black">PEPS / FIFO</strong> (lotes mais antigos consumidos primeiro)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border-2 border-black text-black hover:bg-yellow-200 transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
          >
            <X size={18} className="stroke-[3]" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSalvarRefeicao} className="p-6 space-y-5 overflow-y-auto flex-1">
          {erroGeral && (
            <div className="p-3 bg-rose-100 border-2 border-black rounded-xl text-xs font-bold text-rose-950 flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <AlertCircle size={16} className="shrink-0 stroke-[2.5]" />
              <span>{erroGeral}</span>
            </div>
          )}

          {/* Dados Gerais da Refeição */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-black uppercase tracking-wider mb-1.5">
                Data da Refeição <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dataIso}
                  onChange={e => setDataIso(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 bg-gray-50 border-2 border-black rounded-xl text-sm font-bold text-black focus:outline-none focus:bg-white focus:ring-2 focus:ring-black transition-all font-mono"
                  required
                />
                <Calendar className="absolute right-3.5 top-3 text-black pointer-events-none stroke-[2.5]" size={18} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-black uppercase tracking-wider mb-1.5">
                Tipo de Refeição <span className="text-rose-600">*</span>
              </label>
              <select
                value={tipo}
                onChange={e => setTipo(e.target.value as TipoRefeicao)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border-2 border-black rounded-xl text-sm font-bold text-black focus:outline-none focus:bg-white focus:ring-2 focus:ring-black transition-all cursor-pointer"
              >
                <option value={TipoRefeicao.CAFE_DA_MANHA}>{TIPO_REFEICAO_LABELS[TipoRefeicao.CAFE_DA_MANHA]}</option>
                <option value={TipoRefeicao.ALMOCO}>{TIPO_REFEICAO_LABELS[TipoRefeicao.ALMOCO]}</option>
                <option value={TipoRefeicao.JANTAR}>{TIPO_REFEICAO_LABELS[TipoRefeicao.JANTAR]}</option>
                <option value={TipoRefeicao.LANCHE}>{TIPO_REFEICAO_LABELS[TipoRefeicao.LANCHE]}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-black uppercase tracking-wider mb-1.5">
                Nome da Receita / Prato (Opcional)
              </label>
              <input
                type="text"
                value={receita}
                onChange={e => setReceita(e.target.value)}
                placeholder="Ex: Frango com Arroz e Salada..."
                className="w-full px-3.5 py-2.5 bg-gray-50 border-2 border-black rounded-xl text-sm font-bold text-black placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-black transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-black uppercase tracking-wider mb-1.5">
                Observação / Descrição
              </label>
              <input
                type="text"
                value={observacao}
                onChange={e => setObservacao(e.target.value)}
                placeholder="Ex: Para 2 pessoas, almoço de domingo..."
                className="w-full px-3.5 py-2.5 bg-gray-50 border-2 border-black rounded-xl text-sm font-bold text-black placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-black transition-all"
              />
            </div>
          </div>

          {/* Adicionar Ingredientes do Estoque */}
          <div className="p-4 bg-yellow-50/60 border-2 border-black rounded-2xl space-y-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-black stroke-[2.5]" />
                Adicionar Ingrediente do Estoque
              </span>
              <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">
                PEPS proporcional automático
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              {/* Seleção do Produto */}
              <div className="sm:col-span-6">
                <label className="block text-[10px] font-black uppercase text-black mb-1">
                  Produto Disponível na Dispensa
                </label>
                <select
                  value={produtoSelecionado}
                  onChange={e => {
                    setProdutoSelecionado(e.target.value);
                    setErroItem(null);
                  }}
                  className="w-full px-3 py-2 bg-white border-2 border-black rounded-xl text-xs font-bold text-black focus:outline-none focus:ring-2 focus:ring-black transition-all cursor-pointer"
                >
                  <option value="">Selecione um produto...</option>
                  {produtosComEstoque.map((p, idx) => (
                    <option key={idx} value={p.nomeProduto}>
                      {p.nomeProduto} — Disp: {formatarVolume(p.quantidadeTotalDisponivel, p.baseUnidade)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantidade consumida */}
              <div className="sm:col-span-4">
                <label className="block text-[10px] font-black uppercase text-black mb-1 flex items-center justify-between">
                  <span>Quantidade a usar</span>
                  <span className="text-black font-mono font-black uppercase bg-white px-1.5 rounded border border-black">{baseUnidadeAtual}</span>
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.1"
                  value={quantidadeDigitada}
                  onChange={e => {
                    setQuantidadeDigitada(e.target.value);
                    setErroItem(null);
                  }}
                  placeholder={`Ex: 200 (${baseUnidadeAtual})`}
                  className="w-full px-3 py-2 bg-white border-2 border-black rounded-xl text-xs font-bold text-black focus:outline-none focus:ring-2 focus:ring-black transition-all font-mono"
                  disabled={!produtoSelecionado}
                />
              </div>

              {/* Botão Adicionar */}
              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={handleAdicionarIngrediente}
                  disabled={!produtoSelecionado || !quantidadeDigitada}
                  className="w-full py-2 bg-yellow-300 hover:bg-yellow-400 disabled:bg-gray-200 disabled:text-gray-400 disabled:border-gray-400 text-black font-black uppercase tracking-wider rounded-xl text-xs flex items-center justify-center gap-1 transition-all border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
                >
                  <Plus size={15} className="stroke-[3]" />
                  <span>Incluir</span>
                </button>
              </div>
            </div>

            {/* Aviso / Erro no ingrediente */}
            {erroItem && (
              <p className="text-xs text-rose-700 font-bold flex items-center gap-1.5 mt-1">
                <AlertCircle size={14} className="stroke-[2.5]" />
                {erroItem}
              </p>
            )}

            {/* Prévia do PEPS do ingrediente sendo digitado */}
            {produtoSelecionado && qtdNum > 0 && estimativaAtual && !estimativaAtual.erro && (
              <div className="p-2.5 bg-white border-2 border-black rounded-xl text-xs text-black flex items-center justify-between shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-2">
                  <Info size={14} className="text-black shrink-0 stroke-[2.5]" />
                  <span className="font-bold">
                    Dedução estimada pelo lote mais antigo:{' '}
                    <strong className="font-mono text-emerald-700 font-black">{formatarMoeda(estimativaAtual.custo)}</strong>
                  </span>
                </div>
                <span className="text-[10px] bg-yellow-300 px-2 py-0.5 rounded font-mono font-black text-black border border-black">
                  {estimativaAtual.detalheLotes.length} lote(s) PEPS
                </span>
              </div>
            )}
          </div>

          {/* Lista de Ingredientes Adicionados */}
          <div>
            <label className="block text-xs font-black text-black uppercase tracking-wider mb-2">
              Ingredientes da Refeição ({ingredientesTemp.length})
            </label>

            {ingredientesTemp.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-black rounded-2xl text-gray-500 font-bold text-xs bg-gray-50">
                Nenhum ingrediente adicionado ainda. Escolha os produtos acima para compor sua refeição.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {ingredientesTemp.map(item => (
                  <div
                    key={item.id}
                    className="p-3 bg-white border-2 border-black rounded-xl flex items-center justify-between shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-yellow-100 border border-black text-black flex items-center justify-center">
                        <ProductIcon icone={inventarioAgrupado.find(p => p.nomeProduto === item.nomeProduto)?.icone} size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-black">{item.nomeProduto}</p>
                        <p className="text-[11px] text-gray-600 font-mono font-bold">
                          Consumo: {formatarVolume(item.quantidade, item.baseUnidade, false)}
                          {item.detalhesLotes.length > 1 && (
                            <span className="text-black bg-yellow-200 px-1 rounded ml-1.5 font-bold">
                              ({item.detalhesLotes.length} lotes PEPS)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[9px] text-gray-500 uppercase font-black block">Custo PEPS</span>
                        <span className="text-xs font-black font-mono text-emerald-700">
                          {formatarMoeda(item.custoEstimado)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoverIngrediente(item.id)}
                        className="p-1.5 text-rose-700 hover:bg-rose-100 border border-black rounded-lg transition-colors cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                        title="Remover da lista"
                      >
                        <Trash2 size={14} className="stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Banner Valor Total da Refeição */}
          <div className="p-4 bg-black text-white rounded-2xl border-2 border-black flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div>
              <p className="text-[10px] uppercase font-black text-yellow-300 tracking-wider">Custo Total Proporcional:</p>
              <p className="text-xs text-gray-300 font-medium">
                Regra de 3 exata dos lotes PEPS
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black font-mono text-yellow-400">
                {formatarMoeda(custoTotalRefeicao)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={salvando}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border-2 border-black text-xs font-black uppercase tracking-wider text-black bg-white hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={ingredientesTemp.length === 0 || salvando}
              className="px-6 py-2.5 rounded-xl bg-black hover:bg-neutral-800 disabled:bg-gray-300 disabled:text-gray-500 disabled:border-gray-400 text-xs font-black uppercase tracking-wider text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer flex items-center gap-2"
            >
              {salvando ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Salvando no Firestore...</span>
                </>
              ) : (
                <span>Salvar Refeição & Deduzir Estoque</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
