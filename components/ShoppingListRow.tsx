import { colors } from '@/theme/colors';
import type { ItemCompra } from '@/theme/types';
import { type } from '@/theme/typography';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  item: ItemCompra;
  onToggle: (id: string) => void;
};

export function ShoppingListRow({ item, onToggle }: Props) {
  return (
    <Pressable onPress={() => onToggle(item.id)} style={styles.row}>
      <View style={[styles.checkbox, item.comprado && styles.checkboxChecked]}>
        {item.comprado && <MaterialCommunityIcons name="check" size={16} color={colors.surface} />}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[type.bodyMedium, item.comprado && styles.strike]}>{item.nombre}</Text>
        <Text style={[styles.cantidad, item.comprado && styles.strike]}>{item.cantidad}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.secondary,
  },
  cantidad: {
    ...type.caption,
    color: colors.inkMuted,
    marginTop: 2,
  },
  strike: {
    color: colors.inkMuted,
    textDecorationLine: 'line-through',
  },
});
