import { AboutModal } from '@/components/AboutModal';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TextField } from '@/components/TextField';
import { iniciarSesion } from '@/services/authService';
import { firebaseEstaConfigurado } from '@/services/firebase';
import { colors } from '@/theme/colors';
import { type } from '@/theme/typography';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TOQUES_PARA_HUEVO_DE_PASCUA = 3;
const VENTANA_ENTRE_TOQUES_MS = 1200;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aboutVisible, setAboutVisible] = useState(false);
  const tapCount = useRef(0);
  const tapTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleLogoPress() {
    tapCount.current += 1;

    if (tapCount.current >= TOQUES_PARA_HUEVO_DE_PASCUA) {
      setAboutVisible(true);
      tapCount.current = 0;
      if (tapTimeout.current) clearTimeout(tapTimeout.current);
      return;
    }

    if (tapTimeout.current) clearTimeout(tapTimeout.current);
    tapTimeout.current = setTimeout(() => {
      tapCount.current = 0;
    }, VENTANA_ENTRE_TOQUES_MS);
  }

  async function handleLogin() {
    setError(null);

    if (!firebaseEstaConfigurado()) {
      setError(
        'Firebase todavía no está configurado en este proyecto. Sigue la guía en ' +
          'docs/09-conexion-firebase.md para crear tu archivo .env.',
      );
      return;
    }

    if (!email.trim() || !password) {
      setError('Escribe tu correo y tu contraseña.');
      return;
    }

    try {
      setCargando(true);
      await iniciarSesion(email, password);
      router.replace('/(tabs)');
    } catch (err) {
      const mensaje = (err as { mensaje?: string })?.mensaje ?? 'No se pudo iniciar sesión.';
      setError(mensaje);
    } finally {
      setCargando(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.content}>
          <Pressable
            onPress={handleLogoPress}
            hitSlop={12}
            style={({ pressed }) => [styles.logoBadge, pressed && { opacity: 0.85 }]}
          >
            <MaterialCommunityIcons name="fridge-outline" size={40} color={colors.secondary} />
          </Pressable>
          <Text style={styles.wordmark}>Smart Pantry</Text>
          <Text style={styles.tagline}>Tu despensa, siempre organizada</Text>

          <View style={styles.form}>
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
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!cargando}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <PrimaryButton
              label={cargando ? 'Iniciando sesión…' : 'Iniciar sesión'}
              disabled={cargando}
              style={{ marginTop: 8 }}
              onPress={handleLogin}
            />
            {cargando && <ActivityIndicator style={{ marginTop: 12 }} color={colors.secondary} />}

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>¿No tienes cuenta? </Text>
              <Link href="/(auth)/register" style={styles.link}>
                Regístrate
              </Link>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      <AboutModal visible={aboutVisible} onClose={() => setAboutVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
  },
  logoBadge: {
    alignSelf: 'center',
    width: 84,
    height: 84,
    borderRadius: 24,
    backgroundColor: colors.cardYellow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  wordmark: {
    ...type.h1,
    textAlign: 'center',
    color: colors.primary,
  },
  tagline: {
    ...type.body,
    textAlign: 'center',
    color: colors.inkMuted,
    marginTop: 4,
    marginBottom: 36,
  },
  form: {
    width: '100%',
  },
  errorText: {
    ...type.caption,
    color: colors.danger,
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    ...type.body,
    color: colors.inkMuted,
  },
  link: {
    ...type.bodyMedium,
    color: colors.secondary,
  },
});
