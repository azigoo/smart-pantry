import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TextField } from '@/components/TextField';
import { registrarUsuario } from '@/services/authService';
import { firebaseEstaConfigurado } from '@/services/firebase';
import { colors } from '@/theme/colors';
import { type } from '@/theme/typography';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister() {
    setError(null);

    if (!firebaseEstaConfigurado()) {
      setError(
        'Firebase todavía no está configurado en este proyecto. Sigue la guía en ' +
          'docs/09-conexion-firebase.md para crear tu archivo .env.',
      );
      return;
    }

    if (!nombre.trim() || !email.trim() || !password) {
      setError('Completa nombre, correo y contraseña.');
      return;
    }

    try {
      setCargando(true);
      await registrarUsuario(nombre, email, password);
      router.replace('/(tabs)');
    } catch (err) {
      const mensaje = (err as { mensaje?: string })?.mensaje ?? 'No se pudo crear la cuenta.';
      setError(mensaje);
    } finally {
      setCargando(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <ScreenHeader
            title="Crear cuenta"
            subtitle="Regístrate para administrar tu despensa"
            right={
              <Pressable onPress={() => router.back()} hitSlop={10}>
                <MaterialCommunityIcons name="close" size={24} color={colors.inkMuted} />
              </Pressable>
            }
          />

          <TextField
            label="Nombre"
            placeholder="Tu nombre"
            value={nombre}
            onChangeText={setNombre}
            editable={!cargando}
          />
          <TextField
            label="Correo electrónico"
            placeholder="tucorreo@ejemplo.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            editable={!cargando}
          />
          <TextField
            label="Contraseña"
            placeholder="Mínimo 6 caracteres"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!cargando}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <PrimaryButton
            label={cargando ? 'Creando cuenta…' : 'Crear cuenta'}
            disabled={cargando}
            style={{ marginTop: 8 }}
            onPress={handleRegister}
          />
          {cargando && <ActivityIndicator style={{ marginTop: 12 }} color={colors.secondary} />}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
    paddingTop: 12,
  },
  errorText: {
    ...type.caption,
    color: colors.danger,
    marginBottom: 12,
  },
});
