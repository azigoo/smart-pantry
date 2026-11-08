import { colors } from '@/theme/colors';
import { type } from '@/theme/typography';
import { StyleSheet, Text } from 'react-native';

type Props = {
  mensaje: string | null;
  tipo?: 'error' | 'exito';
};

export function ErrorMessage({ mensaje, tipo = 'error' }: Props) {
  if (!mensaje) return null;
  return (
    <Text
      accessibilityRole={tipo === 'error' ? 'alert' : 'text'}
      accessibilityLiveRegion="polite"
      style={[styles.message, tipo === 'exito' && styles.success]}
    >
      {mensaje}
    </Text>
  );
}

const styles = StyleSheet.create({
  message: {
    ...type.caption,
    color: colors.danger,
    marginBottom: 12,
  },
  success: {
    color: colors.secondaryDark,
  },
});
