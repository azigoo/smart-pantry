import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TextField } from '@/components/TextField';
import { useAuth } from '@/context/AuthContext';
import { esErrorAutenticacion, registrarUsuario } from '@/services/authService';
import { firebaseEstaConfigurado } from '@/services/firebase';
import { colors } from '@/theme/colors';
import { type } from '@/theme/typography';
import { validarRegistro } from '@/theme/validators';
import { comportamientoTeclado } from '@/services/platform';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const { errorAutenticacion } = useAuth();
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

    const validacion = validarRegistro({ nombre, correo: email, contrasena: password });
    if (!validacion.valido) {
      setError(validacion.errores.join(' '));
      return;
    }

    try {
      setCargando(true);
      await registrarUsuario(nombre, email, password);
      router.replace('/(tabs)');
    } catch (err) {
      const mensaje = esErrorAutenticacion(err)
        ? err.mensaje
        : 'No se pudo crear la cuenta. Intenta de nuevo.';
      setError(mensaje);
    } finally {
      setCargando(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={comportamientoTeclado()} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <ScreenHeader
            title="Crear cuenta"
            subtitle="Regístrate para administrar tu despensa"
            right={
              <Pressable
                onPress={() => router.back()}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Volver"
                style={styles.closeButton}
              >
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

          {error || errorAutenticacion ? (
            <Text style={styles.errorText} accessibilityRole="alert">
              {error ?? errorAutenticacion}
            </Text>
          ) : null}

          <PrimaryButton
            label={cargando ? 'Creando cuenta…' : 'Crear cuenta'}
            disabled={cargando}
            style={{ marginTop: 8 }}
            onPress={handleRegister}
          />
          {cargando && (
            <ActivityIndicator
              style={{ marginTop: 12 }}
              color={colors.secondary}
              accessibilityLabel="Creando cuenta"
            />
          )}
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
  closeButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
