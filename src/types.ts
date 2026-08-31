// Arquitetura de dados estrita conforme requisitos

// 1. Histórico para o Autocomplete da Tela 2
export interface HistoricoProduto {
  nome: string;
  quantidadeMedia: string; // Ex: "500g" ou "1L" baseado no padrão do usuário
  categoriaSugerida?: CategoriaItem;
}

// 2. Unidades que a tela vai exibir
export enum PesoVolume {
  ML = 'ML',
  G = 'G',
  L = 'L',
  KG = 'KG'
}

// 3. Categoria do Produto para o Card do Estoque (Tela 2 e 3)
export enum CategoriaItem {
  FRUTAS = 'FRUTAS',
  LEGUMES = 'LEGUMES',
  BEBIDAS = 'BEBIDAS',
  CONSERVAS = 'CONSERVAS',
  DERIVADO_TRIGO = 'DERIVADO_TRIGO',
  PROTEINAS = 'PROTEINAS',
  GRAOS_CEREAIS = 'GRAOS_CEREAIS',
  PETISCOS = 'PETISCOS'
}

export const CATEGORIA_LABELS: Record<CategoriaItem, string> = {
  [CategoriaItem.FRUTAS]: 'Frutas',
  [CategoriaItem.LEGUMES]: 'Legumes & Verduras',
  [CategoriaItem.BEBIDAS]: 'Bebidas',
  [CategoriaItem.CONSERVAS]: 'Conservas & Molhos',
  [CategoriaItem.DERIVADO_TRIGO]: 'Derivados de Trigo & Massas',
  [CategoriaItem.PROTEINAS]: 'Proteínas & Carnes',
  [CategoriaItem.GRAOS_CEREAIS]: 'Grãos & Cereais',
  [CategoriaItem.PETISCOS]: 'Petiscos & Lanches'
};

// 4. Tipos de refeição para a Tela 4
export enum TipoRefeicao {
  CAFE_DA_MANHA = 'CAFE_DA_MANHA',
  ALMOCO = 'ALMOCO',
  JANTAR = 'JANTAR',
  LANCHE = 'LANCHE'
}

export const TIPO_REFEICAO_LABELS: Record<TipoRefeicao, string> = {
  [TipoRefeicao.CAFE_DA_MANHA]: 'Café da Manhã',
  [TipoRefeicao.ALMOCO]: 'Almoço',
  [TipoRefeicao.JANTAR]: 'Jantar',
  [TipoRefeicao.LANCHE]: 'Lanche'
};

// 5. Item temporário enquanto o usuário adiciona itens na Tela 2
export interface ItemCarrinho {
  id: string;
  nome: string;
  quantidade: number; // Quantidade de pacotes/unidades compradas
  tamanhoVolumeOriginal: number; // Sempre convertido para 'g' ou 'ml' antes de salvar
  unidadeSelecionada?: PesoVolume; // Apenas para exibição amigável do que digitou
  valorDigitadoVolume?: number; // Valor antes da conversão (ex: 1.5 se escolheu 1.5 KG)
  baseUnidade: 'g' | 'ml'; // Unidade base após conversão
  precoUnit: number;
  precoTotalItem: number; // quantidade * precoUnit
  dataValidade: number | null; // Adicionado: Requisito para o lote do estoque posterior (timestamp)
}

// 6. Objeto gerado ao clicar em "Finalizar" na Tela 2
export interface Carrinho {
  idCompra?: string;
  mercadoNome: string;
  dataCompra: number; // TimeStamp
  itens: ItemCarrinho[];
  valorTotalCompra: number; // Soma de todos os precoTotalItem
}

// 7. Representação real de cada lote dentro da Dispensa (Banco de Dados)
export interface ItemLoteEstoque {
  idLote: string;
  idProdutoGeral: string; // Nome normalizado do produto
  nomeProduto: string;
  dataCompra: number;
  mercadoOrigem: string;
  precoUnitarioPago: number;
  quantidadeComprada: number; // Ex: 3 (pacotes)
  tamanhoVolumeOriginal: number; // Ex: 500.0 (gramas ou ml)
  volumeTotalOriginal: number; // quantidadeComprada * tamanhoVolumeOriginal (ex: 1500.0g)
  volumeConsumido: number; // Ex: 200.0g consumidas
  volumeRestante: number; // volumeTotalOriginal - volumeConsumido (ex: 1300.0g restantes)
  baseUnidade: 'g' | 'ml';
  dataValidade: number | null;
  categoria?: CategoriaItem | null;
}

// 8. O modelo que a Tela 2 (Estoque) vai ler para desenhar a lista unificada
export interface CardInventarioAgrupado {
  nomeProduto: string;
  icone: string; // Gerado/Sugerido por IA com base no nome do produto
  categoria: CategoriaItem | null;
  baseUnidade: 'g' | 'ml';
  lotes: ItemLoteEstoque[]; // Ordenados por dataCompra (Mais antigo primeiro - PEPS)
  quantidadeTotalDisponivel: number; // Soma total de g ou ml de todos os lotes
  totalItensRestantes: number; // Soma de volumeRestante / tamanhoVolumeOriginal
  valorTotalEstoque: number; // Valor proporcional restante em R$
}

// 9. Vinculado à Tela 4 (O que foi gasto especificamente nesta refeição)
export interface IngredienteConsumido {
  idLoteOrigem: string; // Rastreabilidade de qual lote foi deduzido (PEPS)
  nomeProduto: string;
  quantidadeConsumida: number; // Em gramas ou ml
  baseUnidade: 'g' | 'ml';
  custoCalculo: number; // Regra de 3: (quantidadeConsumida / volumeTotalOriginalLote) * (precoUnitarioLote * quantidadeCompradaLote)
  dataLoteCompra?: number;
  mercadoOrigemLote?: string;
}

// 10. Documento final gerado na Tela 4
export interface RegistroRefeicao {
  idRefeicao: string;
  dataRefeicao: number; // Selecionado no calendário
  tipo: TipoRefeicao;
  receitaRealizada?: string;
  observacao?: string;
  ingredientes: IngredienteConsumido[];
  custoTotalRefeicao: number; // Soma automática do custo proporcional de todos os ingredientes
}
