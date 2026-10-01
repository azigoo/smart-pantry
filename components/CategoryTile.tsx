import { colors } from '@/theme/colors';
import type { Category } from '@/theme/types';
import { type } from '@/theme/typography';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

const tonePalette: Record<string, { bg: string; text: string }> = {
  yellow: { bg: colors.cardYellow, text: colors.cardYellowText },
  blue: { bg: colors.cardBlue, text: colors.cardBlueText },
  pink: { bg: colors.cardPink, text: colors.cardPinkText },
  lavender: { bg: colors.cardLavender, text: colors.cardLavenderText },
};

type Props = {
  categoria: Category;
  count?: number;
  onPress?: () => void;
};

export function CategoryTile({ categoria, count, onPress }: Props) {
  const palette = tonePalette[categoria.color];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tile, { backgroundColor: palette.bg }, pressed && { opacity: 0.8 }]}
    >
      <MaterialCommunityIcons name={categoria.icono as any} size={26} color={palette.text} />
      <Text style={[type.bodyMedium, { color: palette.text }]}>{categoria.nombre}</Text>
      {typeof count === 'number' && (
        <Text style={[type.caption, { color: palette.text }]}>{count} productos</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flexBasis: '47%',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 14,
    gap: 6,
    marginBottom: 12,
  },
});
