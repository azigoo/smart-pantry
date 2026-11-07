import { colors } from '@/theme/colors';
import { type } from '@/theme/typography';
import { StyleSheet, Text } from 'react-native';

type Props = {
  mensaje: string | null;
};

export function ErrorMessage({ mensaje }: Props) {
  if (!mensaje) return null;
  return <Text style={styles.message}>{mensaje}</Text>;
}

const styles = StyleSheet.create({
  message: {
    ...type.caption,
    color: colors.danger,
    marginBottom: 12,
  },
});
