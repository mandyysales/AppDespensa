import React from 'react';
import {
  Apple,
  Carrot,
  CupSoda,
  CookingPot,
  Wheat,
  Beef,
  Cookie,
  ShoppingBag,
  Package,
  Sparkles
} from 'lucide-react';
import { CategoriaItem } from '../types';

interface ProductIconProps {
  icone?: string;
  categoria?: CategoriaItem | null;
  className?: string;
  size?: number;
}

export const ProductIcon: React.FC<ProductIconProps> = ({
  icone,
  categoria,
  className = 'w-6 h-6 text-emerald-600',
  size = 24
}) => {
  // Ícone por nome explícito
  switch (icone) {
    case 'Apple':
      return <Apple className={className} size={size} />;
    case 'Carrot':
      return <Carrot className={className} size={size} />;
    case 'CupSoda':
      return <CupSoda className={className} size={size} />;
    case 'CookingPot':
      return <CookingPot className={className} size={size} />;
    case 'Wheat':
      return <Wheat className={className} size={size} />;
    case 'Beef':
      return <Beef className={className} size={size} />;
    case 'Cookie':
      return <Cookie className={className} size={size} />;
    case 'ShoppingBag':
      return <ShoppingBag className={className} size={size} />;
  }

  // Fallback por categoria
  if (categoria) {
    switch (categoria) {
      case CategoriaItem.FRUTAS:
        return <Apple className={className} size={size} />;
      case CategoriaItem.LEGUMES:
        return <Carrot className={className} size={size} />;
      case CategoriaItem.BEBIDAS:
        return <CupSoda className={className} size={size} />;
      case CategoriaItem.CONSERVAS:
        return <CookingPot className={className} size={size} />;
      case CategoriaItem.DERIVADO_TRIGO:
      case CategoriaItem.GRAOS_CEREAIS:
        return <Wheat className={className} size={size} />;
      case CategoriaItem.PROTEINAS:
        return <Beef className={className} size={size} />;
      case CategoriaItem.PETISCOS:
        return <Cookie className={className} size={size} />;
    }
  }

  return <Package className={className} size={size} />;
};
