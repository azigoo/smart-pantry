import type { ComponentProps } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export type CategoryId =
  | 'lacteos'
  | 'granos'
  | 'enlatados'
  | 'bebidas'
  | 'limpieza'
  | 'frutas'
  | 'verduras'
  | 'otros';

export type Category = {
  id: CategoryId;
  nombre: string;
  icono: IconName;
  color: 'yellow' | 'blue' | 'pink' | 'lavender';
};

export type Producto = {
  id: string;
  nombre: string;
  categoria?: CategoryId;
  cantidad: number;
  unidad: string;
  fechaCaducidad: string; // ISO yyyy-mm-dd
};

export type ItemCompra = {
  id: string;
  nombre: string;
  cantidad: string;
  comprado: boolean;
  unidad?: string;
  categoria?: CategoryId;
};
