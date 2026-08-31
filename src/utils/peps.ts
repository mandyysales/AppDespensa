import { ItemLoteEstoque, IngredienteConsumido } from '../types';

export interface ResultadoConsumoPEPS {
  sucesso: boolean;
  mensagemErro?: string;
  ingredientesConsumidos: IngredienteConsumido[];
  custoTotal: number;
  lotesAtualizados: ItemLoteEstoque[];
}

/**
 * Executa ou simula a regra PEPS (Primeiro a Entrar, Primeiro a Sair) para o consumo de um produto.
 * 
 * Regra de 3 do Custo Conforme Requisito:
 * custoCalculo = (quantidadeConsumida / volumeTotalOriginalLote) * (precoUnitarioLote * quantidadeCompradaLote)
 */
export function processarConsumoPEPS(
  nomeProduto: string,
  quantidadeDesejada: number, // em g ou ml
  todosOsLotes: ItemLoteEstoque[]
): ResultadoConsumoPEPS {
  if (quantidadeDesejada <= 0) {
    return {
      sucesso: false,
      mensagemErro: 'A quantidade deve ser maior que zero.',
      ingredientesConsumidos: [],
      custoTotal: 0,
      lotesAtualizados: todosOsLotes
    };
  }

  // Clona os lotes para não mutar diretamente
  const lotesCopia: ItemLoteEstoque[] = JSON.parse(JSON.stringify(todosOsLotes));

  // Filtra os lotes do produto especificado que ainda possuem volume restante
  const lotesDoProduto = lotesCopia
    .filter(l => l.nomeProduto.toLowerCase() === nomeProduto.toLowerCase() && l.volumeRestante > 0.001)
    .sort((a, b) => a.dataCompra - b.dataCompra); // Mais antigo primeiro (PEPS)

  const volumeTotalDisponivel = lotesDoProduto.reduce((acc, l) => acc + l.volumeRestante, 0);

  if (lotesDoProduto.length === 0 || volumeTotalDisponivel < quantidadeDesejada - 0.001) {
    return {
      sucesso: false,
      mensagemErro: `Estoque insuficiente de "${nomeProduto}". Disponível: ${volumeTotalDisponivel.toFixed(1)}, Solicitado: ${quantidadeDesejada.toFixed(1)}`,
      ingredientesConsumidos: [],
      custoTotal: 0,
      lotesAtualizados: todosOsLotes
    };
  }

  let quantidadeAindaNecessaria = quantidadeDesejada;
  const ingredientesConsumidos: IngredienteConsumido[] = [];
  let custoTotalAcumulado = 0;

  for (const lote of lotesDoProduto) {
    if (quantidadeAindaNecessaria <= 0.0001) break;

    // Quanto podemos tirar deste lote mais antigo?
    const quantidadeTiradaDesteLote = Math.min(quantidadeAindaNecessaria, lote.volumeRestante);

    // Executa a Regra de 3 exata do PDF:
    // (quantidadeConsumida / volumeTotalOriginalLote) * (precoUnitarioPago * quantidadeComprada)
    const valorTotalLoteOriginal = lote.precoUnitarioPago * lote.quantidadeComprada;
    const custoDesteConsumo = (quantidadeTiradaDesteLote / lote.volumeTotalOriginal) * valorTotalLoteOriginal;

    // Atualiza o lote
    lote.volumeConsumido = (lote.volumeConsumido || 0) + quantidadeTiradaDesteLote;
    lote.volumeRestante = Math.max(0, lote.volumeTotalOriginal - lote.volumeConsumido);

    ingredientesConsumidos.push({
      idLoteOrigem: lote.idLote,
      nomeProduto: lote.nomeProduto,
      quantidadeConsumida: quantidadeTiradaDesteLote,
      baseUnidade: lote.baseUnidade,
      custoCalculo: custoDesteConsumo,
      dataLoteCompra: lote.dataCompra,
      mercadoOrigemLote: lote.mercadoOrigem
    });

    custoTotalAcumulado += custoDesteConsumo;
    quantidadeAindaNecessaria -= quantidadeTiradaDesteLote;
  }

  // Atualiza a lista geral de lotes substituindo pelos modificados
  const mapaLotesModificados = new Map<string, ItemLoteEstoque>();
  lotesDoProduto.forEach(l => mapaLotesModificados.set(l.idLote, l));

  const lotesFinais = lotesCopia.map(l => mapaLotesModificados.get(l.idLote) || l);

  return {
    sucesso: true,
    ingredientesConsumidos,
    custoTotal: custoTotalAcumulado,
    lotesAtualizados: lotesFinais
  };
}

/**
 * Calcula apenas a estimativa de custo PEPS em tempo real (sem alterar estado)
 */
export function estimarCustoPEPS(
  nomeProduto: string,
  quantidadeDesejada: number,
  todosOsLotes: ItemLoteEstoque[]
): { custo: number; detalheLotes: { idLote: string; quantidade: number; custo: number; dataCompra: number }[]; erro?: string } {
  const res = processarConsumoPEPS(nomeProduto, quantidadeDesejada, todosOsLotes);
  if (!res.sucesso) {
    return {
      custo: 0,
      detalheLotes: [],
      erro: res.mensagemErro
    };
  }

  return {
    custo: res.custoTotal,
    detalheLotes: res.ingredientesConsumidos.map(i => ({
      idLote: i.idLoteOrigem,
      quantidade: i.quantidadeConsumida,
      custo: i.custoCalculo,
      dataCompra: i.dataLoteCompra || 0
    }))
  };
}
