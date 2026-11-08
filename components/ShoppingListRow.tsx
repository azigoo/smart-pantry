import { colors } from '@/theme/colors';
import type { ItemCompra } from '@/theme/types';
import { type } from '@/theme/typography';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  item: ItemCompra;
  onToggle: (item: ItemCompra) => void;
  onEdit: (item: ItemCompra) => void;
  onDelete: (item: ItemCompra) => void;
};

export const ShoppingListRow = memo(function ShoppingListRow({
  item,
  onToggle,
  onEdit,
  onDelete,
}: Props) {
  return (
    <View style={[styles.row, item.comprado && styles.rowDone]}>
      <Pressable
        onPress={() => onToggle(item)}
        hitSlop={8}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: item.comprado }}
        accessibilityLabel={`${item.nombre}, ${item.comprado ? 'comprado' : 'pendiente'}`}
        style={styles.checkbox}
      >
        <MaterialCommunityIcons
          name={item.comprado ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
          size={26}
          color={item.comprado ? colors.secondary : colors.inkMuted}
        />
      </Pressable>
      <Pressable
        style={styles.rowInfo}
        onPress={() => onEdit(item)}
        accessibilityRole="button"
        accessibilityLabel={`Editar ${item.nombre}`}
      >
        <Text style={[styles.rowTitle, item.comprado && styles.rowTitleDone]}>{item.nombre}</Text>
        <Text style={styles.rowQty}>
          Cantidad: {item.cantidad}
          {item.unidad ? ` ${item.unidad}` : ''}
        </Text>
      </Pressable>
      <Pressable
        style={styles.iconBtn}
        onPress={() => onEdit(item)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Editar ${item.nombre}`}
      >
        <MaterialCommunityIcons name="pencil-outline" size={22} color={colors.inkMuted} />
      </Pressable>
      <Pressable
        style={styles.iconBtn}
        onPress={() => onDelete(item)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Eliminar ${item.nombre}`}
      >
        <MaterialCommunityIcons name="trash-can-outline" size={22} color={colors.danger} />
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
  },
  rowDone: {
    opacity: 0.6,
  },
  rowInfo: {
    flex: 1,
    minHeight: 44,
    gap: 2,
    justifyContent: 'center',
  },
  checkbox: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    ...type.body,
    color: colors.ink,
    fontWeight: '600',
  },
  rowTitleDone: {
    textDecorationLine: 'line-through',
    color: colors.inkMuted,
  },
  rowQty: {
    ...type.body,
    fontSize: 13,
    color: colors.inkMuted,
  },
  iconBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
