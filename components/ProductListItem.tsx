import { getCategoria } from '@/theme/categoryIcons';
import { colors } from '@/theme/colors';
import { diasParaCaducar, formatearFecha } from '@/theme/dates';
import type { Producto } from '@/theme/types';
import { fonts, type } from '@/theme/typography';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const tonePalette: Record<string, string> = {
  yellow: colors.cardYellow,
  blue: colors.cardBlue,
  pink: colors.cardPink,
  lavender: colors.cardLavender,
};

type Props = {
  producto: Producto;
  onPress?: () => void;
};

export function ProductListItem({ producto, onPress }: Props) {
  const categoria = getCategoria(producto.categoria);
  const dias = diasParaCaducar(producto.fechaCaducidad);
  const porVencer = dias <= 5;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}>
      <View style={[styles.icon, { backgroundColor: tonePalette[categoria.color] }]}>
        <MaterialCommunityIcons name={categoria.icono as any} size={22} color={colors.ink} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={type.h3}>{producto.nombre}</Text>
        <Text style={styles.meta}>
          {producto.cantidad} {producto.unidad} · caduca {formatearFecha(producto.fechaCaducidad)}
        </Text>
      </View>
      {porVencer && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{dias <= 0 ? 'Vencido' : `${dias} días`}</Text>
        </View>
      )}
      <MaterialCommunityIcons name="chevron-right" size={22} color={colors.inkMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: {
    ...type.caption,
    color: colors.inkMuted,
    marginTop: 2,
  },
  badge: {
    backgroundColor: '#FBE3DC',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    ...type.caption,
    color: colors.primaryDark,
    fontFamily: fonts.bodyBold,
  },
});
