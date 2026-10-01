import { colors } from '@/theme/colors';
import { type } from '@/theme/typography';
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
};

export function PrimaryButton({ label, onPress, variant = 'primary', style, disabled }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text
        style={[
          type.button,
          styles.text,
          variant === 'ghost' && { color: colors.primary },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  primary: {
    backgroundColor: colors.secondary,
  },
  secondary: {
    backgroundColor: colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: colors.surface,
  },
});
