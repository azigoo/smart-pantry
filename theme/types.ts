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
  icono: string; // nombre de ícono de MaterialCommunityIcons
  color: 'yellow' | 'blue' | 'pink' | 'lavender';
};

export type Producto = {
  id: string;
  nombre: string;
  categoria: CategoryId;
  cantidad: number;
  unidad: string;
  fechaCaducidad: string; // ISO yyyy-mm-dd
};

export type ItemCompra = {
  id: string;
  nombre: string;
  cantidad: string;
  comprado: boolean;
};
