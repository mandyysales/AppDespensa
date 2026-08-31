import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  Store,
  Calendar,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShoppingCart,
  Receipt,
  Loader2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ItemCarrinho } from '../types';
import { formatarMoeda, formatarVolume, formatarDataIso, parseDataIsoParaTimestamp } from '../utils/converters';
import { ModalItemCarrinho } from './ModalItemCarrinho';
import { ProductIcon } from './ProductIcon';

export const ScreenCarrinho: React.FC = () => {
  const {
    navegarPara,
    carrinhoItens,
    carrinhoMercadoNome,
    setCarrinhoMercadoNome,
    carrinhoDataCompra,
    setCarrinhoDataCompra,
    addItemCarrinho,
    updateItemCarrinho,
    removeItemCarrinho,
    finalizarCompra,
    historicoProdutos
  } = useApp();

  const [modalAberto, setModalAberto] = useState(false);
  const [itemEmEdicao, setItemEmEdicao] = useState<ItemCarrinho | null>(null);
  const [dialogFinalizarAberto, setDialogFinalizarAberto] = useState(false);
  const [salvandoCompra, setSalvandoCompra] = useState(false);
  const [mensagemFeedback, setMensagemFeedback] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  const valorTotalCarrinho = carrinhoItens.reduce((acc, item) => acc + item.precoTotalItem, 0);

  const handleAbrirAdicionar = () => {
    setItemEmEdicao(null);
    setModalAberto(true);
  };

  const handleAbrirEditar = (item: ItemCarrinho) => {
    setItemEmEdicao(item);
    setModalAberto(true);
  };

  const handleSalvarItem = (item: ItemCarrinho) => {
    if (itemEmEdicao) {
      updateItemCarrinho(item);
    } else {
      addItemCarrinho(item);
    }
  };

  const handleConfirmarFinalizacao = async () => {
    try {
      setSalvandoCompra(true);
      const resultado = await finalizarCompra(carrinhoMercadoNome, carrinhoDataCompra);
      setDialogFinalizarAberto(false);

      if (resultado.sucesso) {
        setMensagemFeedback({
          tipo: 'sucesso',
          texto: 'Compra finalizada e salva no Firestore! Todos os lotes foram adicionados à sua dispensa.'
        });
        setTimeout(() => {
          navegarPara('ESTOQUE');
        }, 1200);
      } else {
        setMensagemFeedback({
          tipo: 'erro',
          texto: resultado.mensagem || 'Erro ao finalizar a compra no Firestore.'
        });
      }
    } catch (e: any) {
      setMensagemFeedback({
        tipo: 'erro',
        texto: 'Erro inesperado ao persistir compra no banco de dados.'
      });
    } finally {
      setSalvandoCompra(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Cabeçalho Requisito: Botão "Voltar" e nome "Lista de Compra" */}
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-5 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navegarPara('HOME')}
            className="p-2 rounded-xl bg-white border-2 border-black text-black hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            title="Voltar para a Página Inicial"
          >
            <ArrowLeft size={18} className="stroke-[2.5]" />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-black uppercase">
              Lista de Compra
            </h1>
            <p className="text-xs font-medium text-gray-500">Adicione os produtos comprados para alimentar o estoque</p>
          </div>
        </div>

        {/* Botão Adicionar Item */}
        <button
          onClick={handleAbrirAdicionar}
          className="px-4 py-2.5 bg-black hover:bg-neutral-800 text-white font-black text-xs uppercase tracking-wider rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center gap-2 cursor-pointer transition-all self-start sm:self-auto"
        >
          <Plus size={16} className="stroke-[3]" />
          <span>Adicionar Item</span>
        </button>
      </header>

      {/* Feedback Alert */}
      {mensagemFeedback && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm font-bold border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
            mensagemFeedback.tipo === 'sucesso'
              ? 'bg-emerald-100 text-emerald-950'
              : 'bg-rose-100 text-rose-950'
          }`}
        >
          {mensagemFeedback.tipo === 'sucesso' ? (
            <CheckCircle2 className="text-emerald-700 shrink-0 stroke-[2.5]" size={20} />
          ) : (
            <AlertCircle className="text-rose-700 shrink-0 stroke-[2.5]" size={20} />
          )}
          <span>{mensagemFeedback.texto}</span>
        </div>
      )}

      {/* Campos de Texto Requisito: "Nome Mercado" e "Data" (abrir seletor: padrão hoje) */}
      <div className="bg-white p-5 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-black text-black uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Store size={14} className="stroke-[2.5]" />
            Nome do Supermercado
          </label>
          <input
            type="text"
            value={carrinhoMercadoNome}
            onChange={e => setCarrinhoMercadoNome(e.target.value)}
            placeholder="Ex: Pão de Açúcar, Carrefour, Atacadão..."
            className="w-full px-3.5 py-2.5 bg-gray-50 border-2 border-black rounded-xl text-sm font-bold text-black focus:outline-none focus:bg-white focus:ring-2 focus:ring-black transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-black text-black uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Calendar size={14} className="stroke-[2.5]" />
            Data da Compra
          </label>
          <input
            type="date"
            value={formatarDataIso(new Date(carrinhoDataCompra))}
            onChange={e => setCarrinhoDataCompra(parseDataIsoParaTimestamp(e.target.value))}
            className="w-full px-3.5 py-2.5 bg-gray-50 border-2 border-black rounded-xl text-sm font-bold text-black focus:outline-none focus:bg-white focus:ring-2 focus:ring-black transition-all font-mono"
          />
        </div>
      </div>

      {/* Lista Dinâmica Requisito */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black text-gray-500 uppercase tracking-wider">
            Itens no Carrinho ({carrinhoItens.length})
          </h2>
          {carrinhoItens.length > 0 && (
            <span className="text-[10px] font-black text-black bg-yellow-300 px-2.5 py-1 rounded-full border border-black uppercase tracking-wide">
              Conversão automática (L/KG ➔ ml/g)
            </span>
          )}
        </div>

        {carrinhoItens.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border-2 border-dashed border-black space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="w-16 h-16 rounded-2xl bg-yellow-100 border-2 border-black text-black flex items-center justify-center mx-auto shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <ShoppingCart size={32} className="stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black text-black uppercase tracking-tight">Seu carrinho está vazio</h3>
              <p className="text-xs text-gray-600 max-w-sm mx-auto mt-1 font-medium">
                Clique no botão <strong>"Adicionar Item"</strong> para inserir produtos. Eles serão convertidos para gramas ou mililitros automaticamente.
              </p>
            </div>
            <button
              onClick={handleAbrirAdicionar}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-neutral-800 text-white font-black text-xs uppercase tracking-wider rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer"
            >
              <Plus size={16} className="stroke-[3]" /> Adicionar Primeiro Item
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {carrinhoItens.map(item => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-50/50 transition-all flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 border-2 border-black text-black flex items-center justify-center shrink-0 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                      <ProductIcon size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-black">{item.nome}</h4>
                      <p className="text-xs text-gray-600 font-mono font-medium">
                        {item.quantidade}x un. de {formatarVolume(item.tamanhoVolumeOriginal, item.baseUnidade, false)}
                        {item.unidadeSelecionada && (
                          <span className="text-[10px] text-gray-500 font-sans ml-1 block sm:inline">
                            (digitado: {item.valorDigitadoVolume} {item.unidadeSelecionada})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Botão Editar (icone) Requisito */}
                    <button
                      onClick={() => handleAbrirEditar(item)}
                      className="p-1.5 bg-white text-black hover:bg-yellow-200 border-2 border-black rounded-lg shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                      title="Editar item"
                    >
                      <Edit2 size={14} className="stroke-[2.5]" />
                    </button>
                    {/* Botão Excluir (icone) Requisito */}
                    <button
                      onClick={() => removeItemCarrinho(item.id)}
                      className="p-1.5 bg-white text-rose-600 hover:bg-rose-100 border-2 border-black rounded-lg shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                      title="Excluir item"
                    >
                      <Trash2 size={14} className="stroke-[2.5]" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t-2 border-gray-100 flex items-center justify-between">
                  <div className="text-xs text-gray-600 font-medium">
                    Preço un: <strong className="text-black font-mono font-bold">{formatarMoeda(item.precoUnit)}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-gray-500 uppercase font-black block">Total do item</span>
                    <span className="text-base font-black font-mono text-black">
                      {formatarMoeda(item.precoTotalItem)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Valor Total Atualizado & Botão Finalizar Requisito */}
      {carrinhoItens.length > 0 && (
        <div className="bg-black text-white p-6 rounded-2xl border-2 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-yellow-300 text-xs font-black uppercase tracking-wider">
              <Receipt size={16} className="stroke-[3]" />
              Valor Total Atualizado
            </div>
            <div className="text-3xl sm:text-4xl font-black font-mono text-yellow-400">
              {formatarMoeda(valorTotalCarrinho)}
            </div>
            <p className="text-xs text-gray-300 font-medium">
              {carrinhoItens.length} produto(s) pronto(s) para dar entrada nos lotes da dispensa.
            </p>
          </div>

          {/* Botão Finalizar Requisito */}
          <button
            onClick={() => setDialogFinalizarAberto(true)}
            className="px-8 py-4 bg-yellow-400 hover:bg-yellow-300 active:translate-x-[2px] active:translate-y-[2px] text-black font-black uppercase tracking-wider rounded-xl text-sm border-2 border-black shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 size={20} className="stroke-[2.5]" />
            <span>Finalizar Compra</span>
          </button>
        </div>
      )}

      {/* Modal Dialog de Cadastro/Edição de Item */}
      <ModalItemCarrinho
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onSalvar={handleSalvarItem}
        itemEmEdicao={itemEmEdicao}
        historicoProdutos={historicoProdutos}
      />

      {/* Alert Dialog de Confirmação para Finalizar Requisito */}
      {dialogFinalizarAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 border-2 border-black space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-yellow-300 border-2 border-black text-black flex items-center justify-center mx-auto shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <HelpCircle size={28} className="stroke-[2.5]" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-black uppercase tracking-tight">
                Confirmar e Salvar no Estoque?
              </h3>
              <p className="text-xs text-gray-700 leading-relaxed font-medium">
                Você tem certeza que deseja salvar esta compra de <strong className="font-black text-black">{formatarMoeda(valorTotalCarrinho)}</strong> no supermercado <strong className="font-black text-black">{carrinhoMercadoNome}</strong>?
                Os itens serão adicionados aos lotes da dispensa e o carrinho será limpo.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={salvandoCompra}
                onClick={() => setDialogFinalizarAberto(false)}
                className="px-4 py-2.5 rounded-xl border-2 border-black text-xs font-black uppercase tracking-wider text-black bg-white hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={salvandoCompra}
                onClick={handleConfirmarFinalizacao}
                className="px-4 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-xs font-black uppercase tracking-wider text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {salvandoCompra ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <span>Salvar Compra</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
