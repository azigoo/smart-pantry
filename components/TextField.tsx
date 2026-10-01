import { colors } from '@/theme/colors';
import { type } from '@/theme/typography';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

type Props = TextInputProps & {
  label?: string;
};

export function TextField({ label, style, ...inputProps }: Props) {
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.inkMuted}
        style={[styles.input, style]}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
  },
  label: {
    ...type.label,
    color: colors.inkMuted,
    marginBottom: 6,
  },
  input: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    ...type.body,
    color: colors.ink,
  },
});
