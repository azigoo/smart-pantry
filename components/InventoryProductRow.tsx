import { colors } from '@/theme/colors';
import { diasParaCaducar } from '@/theme/dates';
import { desdeClave } from '@/theme/fechaLocal';
import type { Producto } from '@/theme/types';
import { type } from '@/theme/typography';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  producto: Producto;
  nombreCategoria: string | null;
  onEditar: (producto: Producto) => void;
  onSeAcabo: (producto: Producto) => void;
  onEliminar: (producto: Producto) => void;
};

function formatearFecha(clave: string): string {
  return desdeClave(clave).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export const InventoryProductRow = memo(function InventoryProductRow({
  producto,
  nombreCategoria,
  onEditar,
  onSeAcabo,
  onEliminar,
}: Props) {
  const dias = producto.fechaCaducidad ? diasParaCaducar(producto.fechaCaducidad) : null;
  let estado = '';
  let colorEstado: string = colors.inkMuted;

  if (dias !== null) {
    if (dias < 0) {
      estado = `Caducó hace ${Math.abs(dias)} d`;
      colorEstado = colors.danger;
    } else if (dias === 0) {
      estado = 'Caduca hoy';
      colorEstado = colors.danger;
    } else {
      estado = `Caduca en ${dias} d`;
      if (dias <= 3) colorEstado = colors.warning;
    }
  }

  return (
    <View style={styles.card}>
      <Pressable
        style={styles.cardInfo}
        onPress={() => onEditar(producto)}
        accessibilityRole="button"
        accessibilityLabel={`Editar ${producto.nombre}`}
      >
        <Text style={styles.cardTitle}>
          {producto.nombre}
          {producto.cantidad
            ? `  ×${producto.cantidad}${producto.unidad ? ` ${producto.unidad}` : ''}`
            : ''}
        </Text>
        {!!nombreCategoria && <Text style={styles.cardCategory}>{nombreCategoria}</Text>}
        <Text style={styles.cardDate}>{formatearFecha(producto.fechaCaducidad)}</Text>
        {!!estado && <Text style={[styles.cardStatus, { color: colorEstado }]}>{estado}</Text>}
      </Pressable>

      <Pressable
        style={styles.iconBtn}
        onPress={() => onSeAcabo(producto)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Pasar ${producto.nombre} a compras`}
      >
        <MaterialCommunityIcons name="cart-plus" size={22} color={colors.secondary} />
      </Pressable>
      <Pressable
        style={styles.iconBtn}
        onPress={() => onEditar(producto)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Editar ${producto.nombre}`}
      >
        <MaterialCommunityIcons name="pencil-outline" size={22} color={colors.inkMuted} />
      </Pressable>
      <Pressable
        style={styles.iconBtn}
        onPress={() => onEliminar(producto)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Eliminar ${producto.nombre}`}
      >
        <MaterialCommunityIcons name="trash-can-outline" size={22} color={colors.danger} />
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
  },
  cardInfo: {
    flex: 1,
    minHeight: 44,
    gap: 2,
    justifyContent: 'center',
  },
  cardTitle: {
    ...type.body,
    color: colors.ink,
    fontWeight: '600',
  },
  cardCategory: {
    ...type.body,
    fontSize: 12,
    color: colors.secondary,
  },
  cardDate: {
    ...type.body,
    color: colors.inkMuted,
    fontSize: 13,
  },
  cardStatus: {
    ...type.body,
    fontSize: 12,
    fontWeight: '600',
  },
  iconBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
});
