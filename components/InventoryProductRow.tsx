import { colors } from '@/theme/colors';
import { diasParaCaducar } from '@/theme/dates';
import { desdeClave } from '@/theme/fechaLocal';
import type { Producto } from '@/theme/types';
import { type } from '@/theme/typography';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const DANGER = '#C0392B';
const WARNING = '#E67E22';

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
      colorEstado = DANGER;
    } else if (dias === 0) {
      estado = 'Caduca hoy';
      colorEstado = DANGER;
    } else {
      estado = `Caduca en ${dias} d`;
      if (dias <= 3) colorEstado = WARNING;
    }
  }

  return (
    <Pressable style={styles.card} onPress={() => onEditar(producto)}>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>
          {producto.nombre}
          {producto.cantidad ? `  ×${producto.cantidad}${producto.unidad ? ` ${producto.unidad}` : ''}` : ''}
        </Text>
        {!!nombreCategoria && <Text style={styles.cardCategory}>{nombreCategoria}</Text>}
        <Text style={styles.cardDate}>{formatearFecha(producto.fechaCaducidad)}</Text>
        {!!estado && <Text style={[styles.cardStatus, { color: colorEstado }]}>{estado}</Text>}
      </View>

      <Pressable style={styles.iconBtn} onPress={() => onSeAcabo(producto)} hitSlop={8}>
        <MaterialCommunityIcons name="cart-plus" size={22} color={colors.secondary} />
      </Pressable>
      <Pressable style={styles.iconBtn} onPress={() => onEditar(producto)} hitSlop={8}>
        <MaterialCommunityIcons name="pencil-outline" size={22} color={colors.inkMuted} />
      </Pressable>
      <Pressable style={styles.iconBtn} onPress={() => onEliminar(producto)} hitSlop={8}>
        <MaterialCommunityIcons name="trash-can-outline" size={22} color={DANGER} />
      </Pressable>
    </Pressable>
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
    gap: 2,
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
    padding: 6,
    marginLeft: 4,
  },
});
