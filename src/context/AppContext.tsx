import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  HistoricoProduto,
  ItemCarrinho,
  Carrinho,
  ItemLoteEstoque,
  CardInventarioAgrupado,
  RegistroRefeicao,
  CategoriaItem,
  TipoRefeicao
} from '../types';
import { inferirCategoriaEIcone, formatarVolume } from '../utils/converters';
import { processarConsumoPEPS } from '../utils/peps';

export type TelaNavegacao = 'HOME' | 'CARRINHO' | 'ESTOQUE' | 'DETALHES_PRODUTO' | 'REFEICOES';

// Nomes estruturados das coleções no Firestore
export const COLECOES = {
  HISTORICO_PRODUTOS: 'historico_produtos',
  DISPENSA_LOTES: 'dispensa_lotes',
  HISTORICO_REFEICOES: 'historico_refeicoes'
};

// Interface do documento do Firestore para agrupamento de lotes por produto
export interface DocumentoDispensaProduto {
  idProdutoGeral: string;
  nomeProduto: string;
  categoria: CategoriaItem | null;
  baseUnidade: 'g' | 'ml';
  lotes: ItemLoteEstoque[];
  atualizadoEm: number;
}

interface AppContextType {
  telaAtual: TelaNavegacao;
  produtoSelecionadoNome: string | null;
  navegarPara: (tela: TelaNavegacao, produtoNome?: string) => void;
  
  // Estado global de carregamento do Firestore
  loading: boolean;
  
  // Estoque & Dispensa
  estoqueLotes: ItemLoteEstoque[];
  inventarioAgrupado: CardInventarioAgrupado[];
  historicoProdutos: HistoricoProduto[];
  atualizarCategoriaProduto: (nomeProduto: string, novaCategoria: CategoriaItem) => Promise<void>;
  atualizarLote: (idLote: string, dados: Partial<ItemLoteEstoque>) => Promise<void>;
  
  // Carrinho Atual (Tela 2)
  carrinhoItens: ItemCarrinho[];
  carrinhoMercadoNome: string;
  carrinhoDataCompra: number;
  setCarrinhoMercadoNome: (nome: string) => void;
  setCarrinhoDataCompra: (timestamp: number) => void;
  addItemCarrinho: (item: ItemCarrinho) => void;
  updateItemCarrinho: (item: ItemCarrinho) => void;
  removeItemCarrinho: (id: string) => void;
  limparCarrinho: () => void;
  finalizarCompra: (mercadoNome: string, dataCompra: number) => Promise<{ sucesso: boolean; mensagem?: string }>;
  
  // Histórico de Compras
  comprasFinalizadas: Carrinho[];
  
  // Refeições (Tela 4)
  refeicoes: RegistroRefeicao[];
  registrarRefeicao: (dados: {
    dataRefeicao: number;
    tipo: TipoRefeicao;
    receitaRealizada?: string;
    observacao?: string;
    itensConsumo: { nomeProduto: string; quantidade: number }[];
  }) => Promise<{ sucesso: boolean; mensagem?: string }>;
  editarRefeicao: (idRefeicao: string, dados: { receitaRealizada?: string; observacao?: string; tipo?: TipoRefeicao }) => Promise<void>;
  excluirRefeicao: (idRefeicao: string) => Promise<void>;
  
  // Utilitários de Reset
  resetarDadosDemonstracao: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper para gerar o ID de documento seguro por nome de produto
const gerarDocIdProduto = (nome: string): string => {
  return nome.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '_');
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [telaAtual, setTelaAtual] = useState<TelaNavegacao>('HOME');
  const [produtoSelecionadoNome, setProdutoSelecionadoNome] = useState<string | null>(null);

  // Estado global de loading para carregamento inicial do Firestore
  const [loading, setLoading] = useState<boolean>(true);

  // Estados principais inicializados vazios para uso real em produção
  const [estoqueLotes, setEstoqueLotes] = useState<ItemLoteEstoque[]>([]);
  const [historicoProdutos, setHistoricoProdutos] = useState<HistoricoProduto[]>([]);
  const [comprasFinalizadas, setComprasFinalizadas] = useState<Carrinho[]>([]);
  const [refeicoes, setRefeicoes] = useState<RegistroRefeicao[]>([]);

  // Carrinho em edição (Tela 2)
  const [carrinhoItens, setCarrinhoItens] = useState<ItemCarrinho[]>([]);
  const [carrinhoMercadoNome, setCarrinhoMercadoNome] = useState<string>('Supermercado');
  const [carrinhoDataCompra, setCarrinhoDataCompra] = useState<number>(Date.now());

  // 1. Carregamento inicial de dados assíncrono do Firebase Firestore
  useEffect(() => {
    let isMounted = true;

    const carregarDadosDoFirestore = async () => {
      try {
        setLoading(true);

        // 1. Buscar Lotes da Dispensa (Agrupados por documento de Produto contendo array de lotes)
        const lotesRef = collection(db, COLECOES.DISPENSA_LOTES);
        const lotesSnap = await getDocs(lotesRef);
        const lotesCarregados: ItemLoteEstoque[] = [];

        if (!lotesSnap.empty) {
          lotesSnap.forEach(docSnap => {
            const data = docSnap.data() as any;
            if (Array.isArray(data.lotes)) {
              // Estrutura agrupada por produto: { idProdutoGeral, nomeProduto, lotes: [...] }
              data.lotes.forEach((lote: ItemLoteEstoque) => {
                lotesCarregados.push(lote);
              });
            } else if (data.idLote) {
              // Compatibilidade caso venha lote avulso
              lotesCarregados.push({ ...data, idLote: docSnap.id });
            }
          });
        }

        // 2. Buscar Histórico de Produtos (Autocomplete)
        const histRef = collection(db, COLECOES.HISTORICO_PRODUTOS);
        const histSnap = await getDocs(histRef);
        const histCarregado: HistoricoProduto[] = [];

        if (!histSnap.empty) {
          histSnap.forEach(docSnap => {
            histCarregado.push(docSnap.data() as HistoricoProduto);
          });
        }

        // 3. Buscar Histórico de Refeições
        const refRef = collection(db, COLECOES.HISTORICO_REFEICOES);
        const refSnap = await getDocs(refRef);
        const refeicoesCarregadas: RegistroRefeicao[] = [];

        if (!refSnap.empty) {
          refSnap.forEach(docSnap => {
            const data = docSnap.data() as RegistroRefeicao;
            refeicoesCarregadas.push({ ...data, idRefeicao: docSnap.id });
          });
        }

        if (isMounted) {
          setEstoqueLotes(lotesCarregados);
          setHistoricoProdutos(histCarregado);
          setRefeicoes(refeicoesCarregadas);
        }
      } catch (error) {
        console.error('Erro ao sincronizar com o Firestore:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    carregarDadosDoFirestore();

    return () => {
      isMounted = false;
    };
  }, []);

  const navegarPara = (tela: TelaNavegacao, produtoNome?: string) => {
    if (produtoNome) {
      setProdutoSelecionadoNome(produtoNome);
    }
    setTelaAtual(tela);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Gerar o CardInventarioAgrupado a partir de estoqueLotes
  const inventarioAgrupado: CardInventarioAgrupado[] = React.useMemo(() => {
    const grupos = new Map<string, ItemLoteEstoque[]>();

    estoqueLotes.forEach(lote => {
      const chave = lote.nomeProduto.trim();
      const lista = grupos.get(chave) || [];
      lista.push(lote);
      grupos.set(chave, lista);
    });

    const resultado: CardInventarioAgrupado[] = [];

    grupos.forEach((lotes, nomeProduto) => {
      // Ordena lotes por dataCompra (Mais antigo primeiro - PEPS)
      const lotesOrdenados = [...lotes].sort((a, b) => a.dataCompra - b.dataCompra);
      
      const { icone, categoria: catSugerida } = inferirCategoriaEIcone(nomeProduto);
      const categoriaDefinida = lotes.find(l => l.categoria)?.categoria || catSugerida;
      const baseUnidade = lotes[0]?.baseUnidade || 'g';

      const quantidadeTotalDisponivel = lotesOrdenados.reduce((acc, l) => acc + (l.volumeRestante || 0), 0);
      
      // Quantidade de pacotes/itens restantes
      const totalItensRestantes = lotesOrdenados.reduce((acc, l) => {
        const tam = l.tamanhoVolumeOriginal || 1;
        return acc + ((l.volumeRestante || 0) / tam);
      }, 0);

      // Valor total em estoque proporcional (Double/Number)
      const valorTotalEstoque = lotesOrdenados.reduce((acc, l) => {
        const proporcao = l.volumeTotalOriginal > 0 ? (l.volumeRestante / l.volumeTotalOriginal) : 0;
        const valorOriginalLote = l.precoUnitarioPago * l.quantidadeComprada;
        return acc + (proporcao * valorOriginalLote);
      }, 0);

      resultado.push({
        nomeProduto,
        icone,
        categoria: categoriaDefinida,
        baseUnidade,
        lotes: lotesOrdenados,
        quantidadeTotalDisponivel,
        totalItensRestantes,
        valorTotalEstoque
      });
    });

    // Ordena produtos alfabeticamente ou por produtos com estoque positivo primeiro
    return resultado.sort((a, b) => {
      if (a.quantidadeTotalDisponivel > 0 && b.quantidadeTotalDisponivel <= 0) return -1;
      if (a.quantidadeTotalDisponivel <= 0 && b.quantidadeTotalDisponivel > 0) return 1;
      return a.nomeProduto.localeCompare(b.nomeProduto);
    });
  }, [estoqueLotes]);

  // Ações do Carrinho
  const addItemCarrinho = (item: ItemCarrinho) => {
    setCarrinhoItens(prev => [item, ...prev]);
  };

  const updateItemCarrinho = (itemAtualizado: ItemCarrinho) => {
    setCarrinhoItens(prev => prev.map(item => item.id === itemAtualizado.id ? itemAtualizado : item));
  };

  const removeItemCarrinho = (id: string) => {
    setCarrinhoItens(prev => prev.filter(item => item.id !== id));
  };

  const limparCarrinho = () => {
    setCarrinhoItens([]);
  };

  // Finalizar Compra (Tela 2 -> Estoque Firestore agrupado por produto)
  const finalizarCompra = async (mercadoNome: string, dataCompra: number): Promise<{ sucesso: boolean; mensagem?: string }> => {
    if (carrinhoItens.length === 0) {
      return { sucesso: false, mensagem: 'Adicione pelo menos um item ao carrinho antes de finalizar.' };
    }

    try {
      const valorTotalCompra = Number(carrinhoItens.reduce((acc, item) => acc + item.precoTotalItem, 0));

      const novaCompra: Carrinho = {
        idCompra: `compra-${Date.now()}`,
        mercadoNome: mercadoNome.trim() || 'Supermercado',
        dataCompra: dataCompra || Date.now(),
        itens: [...carrinhoItens],
        valorTotalCompra
      };

      // Criar novos lotes com conversão estrita de volume para Double/Number (g ou ml)
      const novosLotes: ItemLoteEstoque[] = carrinhoItens.map((item, index) => {
        const volumeTotalOriginal = Number(item.quantidade * item.tamanhoVolumeOriginal);
        const { categoria } = inferirCategoriaEIcone(item.nome);

        return {
          idLote: `lote-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
          idProdutoGeral: gerarDocIdProduto(item.nome),
          nomeProduto: item.nome.trim(),
          dataCompra: dataCompra || Date.now(),
          mercadoOrigem: mercadoNome.trim() || 'Supermercado',
          precoUnitarioPago: Number(item.precoUnit),
          quantidadeComprada: Number(item.quantidade),
          tamanhoVolumeOriginal: Number(item.tamanhoVolumeOriginal),
          volumeTotalOriginal,
          volumeConsumido: 0,
          volumeRestante: volumeTotalOriginal,
          baseUnidade: item.baseUnidade,
          dataValidade: item.dataValidade,
          categoria
        };
      });

      // Agrupar todos os lotes (existentes + novos) por Produto para gravação no Firestore
      const mapaTodosLotes = new Map<string, ItemLoteEstoque[]>();

      estoqueLotes.forEach(l => {
        const lista = mapaTodosLotes.get(l.nomeProduto) || [];
        lista.push(l);
        mapaTodosLotes.set(l.nomeProduto, lista);
      });

      novosLotes.forEach(l => {
        const lista = mapaTodosLotes.get(l.nomeProduto) || [];
        lista.push(l);
        mapaTodosLotes.set(l.nomeProduto, lista);
      });

      const batch = writeBatch(db);

      // Salvar os documentos de produtos com o array 'lotes' atualizado e ordenado por dataCompra
      mapaTodosLotes.forEach((lotesDoProd, nomeProd) => {
        const docId = gerarDocIdProduto(nomeProd);
        const docRef = doc(db, COLECOES.DISPENSA_LOTES, docId);
        const lotesOrdenados = [...lotesDoProd].sort((a, b) => a.dataCompra - b.dataCompra);
        const { categoria } = inferirCategoriaEIcone(nomeProd);

        const docData: DocumentoDispensaProduto = {
          idProdutoGeral: docId,
          nomeProduto: nomeProd,
          categoria: lotesDoProd.find(l => l.categoria)?.categoria || categoria,
          baseUnidade: lotesDoProd[0]?.baseUnidade || 'g',
          lotes: lotesOrdenados,
          atualizadoEm: Date.now()
        };

        batch.set(docRef, docData);
      });

      // Atualizar Histórico para Autocomplete no Firestore
      const novosHistoricos: HistoricoProduto[] = [];
      carrinhoItens.forEach(item => {
        const { categoria } = inferirCategoriaEIcone(item.nome);
        const qtdMediaStr = formatarVolume(item.tamanhoVolumeOriginal, item.baseUnidade);
        const histItem: HistoricoProduto = {
          nome: item.nome.trim(),
          quantidadeMedia: qtdMediaStr,
          categoriaSugerida: categoria
        };
        novosHistoricos.push(histItem);

        const docId = `hist-${gerarDocIdProduto(item.nome)}`;
        const histRef = doc(db, COLECOES.HISTORICO_PRODUTOS, docId);
        batch.set(histRef, histItem);
      });

      await batch.commit();

      // Atualizar Estado Local
      setEstoqueLotes(prev => [...prev, ...novosLotes]);
      setComprasFinalizadas(prev => [novaCompra, ...prev]);

      setHistoricoProdutos(prev => {
        const mapa = new Map<string, HistoricoProduto>();
        prev.forEach(h => mapa.set(h.nome.toLowerCase(), h));
        novosHistoricos.forEach(h => mapa.set(h.nome.toLowerCase(), h));
        return Array.from(mapa.values());
      });

      // Limpa o carrinho
      setCarrinhoItens([]);

      return { sucesso: true };
    } catch (err: any) {
      console.error('Erro ao salvar compra no Firestore:', err);
      return { sucesso: false, mensagem: 'Erro de conexão com o banco de dados ao salvar a compra.' };
    }
  };

  // Atualizar categoria de um produto no Firestore (em seu documento de produto)
  const atualizarCategoriaProduto = async (nomeProduto: string, novaCategoria: CategoriaItem) => {
    try {
      const docId = gerarDocIdProduto(nomeProduto);
      const loteRef = doc(db, COLECOES.DISPENSA_LOTES, docId);
      
      const novosLotes = estoqueLotes.map(lote => {
        if (lote.nomeProduto.toLowerCase() === nomeProduto.toLowerCase()) {
          return { ...lote, categoria: novaCategoria };
        }
        return lote;
      });

      const lotesDoProduto = novosLotes.filter(
        l => l.nomeProduto.toLowerCase() === nomeProduto.toLowerCase()
      );

      await updateDoc(loteRef, {
        categoria: novaCategoria,
        lotes: lotesDoProduto,
        atualizadoEm: Date.now()
      });

      setEstoqueLotes(novosLotes);
    } catch (err) {
      console.error('Erro ao atualizar categoria no Firestore:', err);
    }
  };

  // Atualizar dados de um lote específico no Firestore (dentro do array do produto)
  const atualizarLote = async (idLote: string, dados: Partial<ItemLoteEstoque>) => {
    try {
      const loteExistente = estoqueLotes.find(l => l.idLote === idLote);
      if (!loteExistente) return;

      const novosLotes = estoqueLotes.map(lote => {
        if (lote.idLote === idLote) {
          return { ...lote, ...dados };
        }
        return lote;
      });

      const lotesDoProduto = novosLotes.filter(
        l => l.nomeProduto.toLowerCase() === loteExistente.nomeProduto.toLowerCase()
      );

      const docId = gerarDocIdProduto(loteExistente.nomeProduto);
      const docRef = doc(db, COLECOES.DISPENSA_LOTES, docId);

      await updateDoc(docRef, {
        lotes: lotesDoProduto,
        atualizadoEm: Date.now()
      });

      setEstoqueLotes(novosLotes);
    } catch (err) {
      console.error('Erro ao atualizar lote no Firestore:', err);
    }
  };

  // Registrar Refeição com aplicação estrita do PEPS e persistência do idLoteOrigem nos ingredientes
  const registrarRefeicao = async (dados: {
    dataRefeicao: number;
    tipo: TipoRefeicao;
    receitaRealizada?: string;
    observacao?: string;
    itensConsumo: { nomeProduto: string; quantidade: number }[];
  }): Promise<{ sucesso: boolean; mensagem?: string }> => {
    if (!dados.itensConsumo || dados.itensConsumo.length === 0) {
      return { sucesso: false, mensagem: 'Adicione pelo menos um ingrediente para registrar a refeição.' };
    }

    try {
      let lotesAtuais = [...estoqueLotes];
      const todosIngredientesConsumidos = [];
      let custoTotal = 0;

      // Executa dedução PEPS exata para cada ingrediente
      for (const item of dados.itensConsumo) {
        const res = processarConsumoPEPS(item.nomeProduto, item.quantidade, lotesAtuais);
        if (!res.sucesso) {
          return { sucesso: false, mensagem: res.mensagemErro };
        }
        // Inclui explicitamente o idLoteOrigem de onde cada porção saiu
        todosIngredientesConsumidos.push(...res.ingredientesConsumidos);
        custoTotal += res.custoTotal;
        lotesAtuais = res.lotesAtualizados;
      }

      const idRefeicao = `ref-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const novoRegistro: RegistroRefeicao = {
        idRefeicao,
        dataRefeicao: dados.dataRefeicao,
        tipo: dados.tipo,
        receitaRealizada: dados.receitaRealizada?.trim() || undefined,
        observacao: dados.observacao?.trim() || undefined,
        ingredientes: todosIngredientesConsumidos, // Array contendo idLoteOrigem em cada item
        custoTotalRefeicao: Number(custoTotal)
      };

      // Persistir no Firestore via batch
      const batch = writeBatch(db);

      // 1. Salvar documento da refeição na coleção 'historico_refeicoes'
      const refDoc = doc(db, COLECOES.HISTORICO_REFEICOES, idRefeicao);
      batch.set(refDoc, novoRegistro);

      // 2. Atualizar os documentos de produtos afetados na coleção 'dispensa_lotes'
      const produtosAfetados = new Set(dados.itensConsumo.map(i => i.nomeProduto.trim().toLowerCase()));
      
      produtosAfetados.forEach(prodNomeMin => {
        const lotesDoProd = lotesAtuais.filter(l => l.nomeProduto.trim().toLowerCase() === prodNomeMin);
        if (lotesDoProd.length > 0) {
          const docId = gerarDocIdProduto(lotesDoProd[0].nomeProduto);
          const docRef = doc(db, COLECOES.DISPENSA_LOTES, docId);
          batch.update(docRef, {
            lotes: lotesDoProd,
            atualizadoEm: Date.now()
          });
        }
      });

      await batch.commit();

      // Aplica alterações no estado local
      setEstoqueLotes(lotesAtuais);
      setRefeicoes(prev => [novoRegistro, ...prev]);

      return { sucesso: true };
    } catch (err) {
      console.error('Erro ao registrar refeição no Firestore:', err);
      return { sucesso: false, mensagem: 'Erro de comunicação com o Firestore ao registrar refeição.' };
    }
  };

  const editarRefeicao = async (idRefeicao: string, dados: { receitaRealizada?: string; observacao?: string; tipo?: TipoRefeicao }) => {
    try {
      const refDoc = doc(db, COLECOES.HISTORICO_REFEICOES, idRefeicao);
      await updateDoc(refDoc, dados as any);

      setRefeicoes(prev => prev.map(r => {
        if (r.idRefeicao === idRefeicao) {
          return {
            ...r,
            ...(dados.receitaRealizada !== undefined ? { receitaRealizada: dados.receitaRealizada } : {}),
            ...(dados.observacao !== undefined ? { observacao: dados.observacao } : {}),
            ...(dados.tipo !== undefined ? { tipo: dados.tipo } : {})
          };
        }
        return r;
      }));
    } catch (err) {
      console.error('Erro ao editar refeição no Firestore:', err);
    }
  };

  const excluirRefeicao = async (idRefeicao: string) => {
    try {
      const refDoc = doc(db, COLECOES.HISTORICO_REFEICOES, idRefeicao);
      await deleteDoc(refDoc);
      setRefeicoes(prev => prev.filter(r => r.idRefeicao !== idRefeicao));
    } catch (err) {
      console.error('Erro ao excluir refeição no Firestore:', err);
    }
  };

  const resetarDadosDemonstracao = async () => {
    try {
      setLoading(true);

      // Limpa os estados locais para lista vazia
      setEstoqueLotes([]);
      setHistoricoProdutos([]);
      setComprasFinalizadas([]);
      setRefeicoes([]);
      setCarrinhoItens([]);
      setCarrinhoMercadoNome('Supermercado');
      setCarrinhoDataCompra(Date.now());
    } catch (err) {
      console.error('Erro ao resetar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        telaAtual,
        produtoSelecionadoNome,
        navegarPara,
        loading,
        estoqueLotes,
        inventarioAgrupado,
        historicoProdutos,
        atualizarCategoriaProduto,
        atualizarLote,
        carrinhoItens,
        carrinhoMercadoNome,
        carrinhoDataCompra,
        setCarrinhoMercadoNome,
        setCarrinhoDataCompra,
        addItemCarrinho,
        updateItemCarrinho,
        removeItemCarrinho,
        limparCarrinho,
        finalizarCompra,
        comprasFinalizadas,
        refeicoes,
        registrarRefeicao,
        editarRefeicao,
        excluirRefeicao,
        resetarDadosDemonstracao
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de um AppProvider');
  }
  return context;
};
