import { colors } from '@/theme/colors';
import { type } from '@/theme/typography';
import { StyleSheet, Text, View } from 'react-native';

const backgrounds: Record<string, { bg: string; text: string }> = {
  yellow: { bg: colors.cardYellow, text: colors.cardYellowText },
  blue: { bg: colors.cardBlue, text: colors.cardBlueText },
  pink: { bg: colors.cardPink, text: colors.cardPinkText },
  lavender: { bg: colors.cardLavender, text: colors.cardLavenderText },
};

type Props = {
  label: string;
  value: string | number;
  tone: 'yellow' | 'blue' | 'pink' | 'lavender';
};

export function StatCard({ label, value, tone }: Props) {
  const palette = backgrounds[tone];
  return (
    <View style={[styles.card, { backgroundColor: palette.bg }]}>
      <Text style={[type.bigNumber, { color: palette.text }]}>{value}</Text>
      <Text style={[type.label, { color: palette.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 16,
    minHeight: 92,
    justifyContent: 'space-between',
  },
});
