import { colors } from '@/theme/colors';
import { type } from '@/theme/typography';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

type Props = TextInputProps & {
  label?: string;
};

export function TextField({ label, style, ...inputProps }: Props) {
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const esContrasena = Boolean(inputProps.secureTextEntry);

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View>
        <TextInput
          accessibilityLabel={inputProps.accessibilityLabel ?? label ?? inputProps.placeholder}
          placeholderTextColor={colors.inkMuted}
          style={[styles.input, esContrasena && styles.passwordInput, style]}
          {...inputProps}
          secureTextEntry={esContrasena && !mostrarContrasena}
        />
        {esContrasena ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            onPress={() => setMostrarContrasena((visible) => !visible)}
            style={styles.passwordToggle}
          >
            <MaterialCommunityIcons
              name={mostrarContrasena ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={colors.inkMuted}
            />
          </Pressable>
        ) : null}
      </View>
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
  passwordInput: {
    paddingRight: 56,
  },
  passwordToggle: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 48,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
