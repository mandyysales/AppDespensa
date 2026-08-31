import { PesoVolume, CategoriaItem } from '../types';

/**
 * Converte qualquer valor inserido com a unidade selecionada (L, KG, ML, G)
 * para a unidade base padrão (ml ou g).
 * 
 * Regra do Requisito:
 * - L -> ml (multiplicado por 1000)
 * - KG -> g (multiplicado por 1000)
 * - ML -> ml (mantém valor)
 * - G -> g (mantém valor)
 */
export function converterParaUnidadeBase(
  valor: number,
  unidade: PesoVolume
): { volumeEmBase: number; baseUnidade: 'g' | 'ml' } {
  const v = Math.max(0, Number(valor) || 0);

  switch (unidade) {
    case PesoVolume.KG:
      return { volumeEmBase: v * 1000, baseUnidade: 'g' };
    case PesoVolume.L:
      return { volumeEmBase: v * 1000, baseUnidade: 'ml' };
    case PesoVolume.G:
      return { volumeEmBase: v, baseUnidade: 'g' };
    case PesoVolume.ML:
      return { volumeEmBase: v, baseUnidade: 'ml' };
    default:
      return { volumeEmBase: v, baseUnidade: 'g' };
  }
}

/**
 * Formata volume em gramas ou ml para visualização amigável e precisa
 */
export function formatarVolume(volume: number, baseUnidade: 'g' | 'ml', amigavel: boolean = true): string {
  const v = Number(volume) || 0;
  if (!amigavel) {
    return `${v.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} ${baseUnidade}`;
  }

  if (baseUnidade === 'g') {
    if (v >= 1000) {
      const kg = v / 1000;
      return `${kg.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} kg`;
    }
    return `${v.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} g`;
  } else {
    if (v >= 1000) {
      const l = v / 1000;
      return `${l.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} L`;
    }
    return `${v.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} ml`;
  }
}

/**
 * Formata valores monetários em Reais (BRL)
 */
export function formatarMoeda(valor: number): string {
  return (Number(valor) || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Formata timestamps para datas legíveis no Brasil
 */
export function formatarData(timestamp: number | null | undefined): string {
  if (!timestamp) return 'Não informada';
  const data = new Date(timestamp);
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export function formatarDataHora(timestamp: number | null | undefined): string {
  if (!timestamp) return 'Não informada';
  const data = new Date(timestamp);
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatarDataIso(date: Date = new Date()): string {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const dia = String(date.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export function parseDataIsoParaTimestamp(dateString: string): number {
  if (!dateString) return Date.now();
  const [ano, mes, dia] = dateString.split('-').map(Number);
  const data = new Date(ano, (mes || 1) - 1, dia || 1, 12, 0, 0);
  return data.getTime();
}

/**
 * Inferência inteligente de Categoria e Ícone representativo por IA / heurística
 * baseada no nome do produto em português.
 */
export function inferirCategoriaEIcone(nome: string): {
  categoria: CategoriaItem;
  icone: string;
  unidadeSugerida: PesoVolume;
  volumeSugerido: number;
} {
  const n = (nome || '').toLowerCase().trim();

  // Frutas
  if (/banana|maçã|maca|uva|laranja|limão|limao|melancia|abacaxi|morango|manga|mamão|mamao|pera|abacate|maracujá|maracuja|kiwi|tangerina|mexerica/.test(n)) {
    return { categoria: CategoriaItem.FRUTAS, icone: 'Apple', unidadeSugerida: PesoVolume.KG, volumeSugerido: 1 };
  }

  // Legumes e Verduras
  if (/tomate|alface|cebola|alho|cenoura|batata|batata-doce|brócolis|brocolis|couve|espinafre|pepino|abobrinha|pimentão|pimentao|chuchu|mandioca|aipim/.test(n)) {
    return { categoria: CategoriaItem.LEGUMES, icone: 'Carrot', unidadeSugerida: PesoVolume.KG, volumeSugerido: 1 };
  }

  // Bebidas
  if (/leite|suco|água|agua|refrigerante|cerveja|vinho|chá|cha|café|cafe|iogurte|vodka|energético|energetico/.test(n)) {
    return { categoria: CategoriaItem.BEBIDAS, icone: 'CupSoda', unidadeSugerida: PesoVolume.L, volumeSugerido: 1 };
  }

  // Conservas e Molhos
  if (/azeite|óleo|oleo|molho|extrato|milho em conserva|ervilha|azeitona|palmito|maionese|ketchup|mostarda|sardinha em lata|atum/.test(n)) {
    return { categoria: CategoriaItem.CONSERVAS, icone: 'CookingPot', unidadeSugerida: PesoVolume.G, volumeSugerido: 340 };
  }

  // Derivados de Trigo e Massas
  if (/farinha|pão|pao|macarrão|macarrao|massa|torrada|biscoito|bolacha|lasanha|bolo|massa de pastel/.test(n)) {
    return { categoria: CategoriaItem.DERIVADO_TRIGO, icone: 'Wheat', unidadeSugerida: PesoVolume.G, volumeSugerido: 500 };
  }

  // Proteínas e Carnes
  if (/carne|frango|peito de frango|peixe|ovos|ovo|bife|acém|alcatra|costela|queijo|presunto|linguiça|linguica|bacon|salmão|salmao|tilápia|tilapia|camarão|camarao|patinho/.test(n)) {
    return { categoria: CategoriaItem.PROTEINAS, icone: 'Beef', unidadeSugerida: PesoVolume.KG, volumeSugerido: 1 };
  }

  // Grãos e Cereais
  if (/arroz|feijão|feijao|lentilha|grão-de-bico|grao-de-bico|aveia|quinoa|milho|trigo|flocos/.test(n)) {
    return { categoria: CategoriaItem.GRAOS_CEREAIS, icone: 'Wheat', unidadeSugerida: PesoVolume.KG, volumeSugerido: 1 };
  }

  // Petiscos e Doces
  if (/chocolate|salgadinho|batata frita|amendoim|castanha|bala|doce|sorvete|pipoca|cookies|snack/.test(n)) {
    return { categoria: CategoriaItem.PETISCOS, icone: 'Cookie', unidadeSugerida: PesoVolume.G, volumeSugerido: 200 };
  }

  // Padrão Geral
  return {
    categoria: CategoriaItem.GRAOS_CEREAIS,
    icone: 'ShoppingBag',
    unidadeSugerida: PesoVolume.G,
    volumeSugerido: 500
  };
}
