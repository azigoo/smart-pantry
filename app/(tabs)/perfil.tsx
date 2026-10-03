import { ScreenHeader } from '@/components/ScreenHeader';
import { useAuth } from '@/context/AuthContext';
import { useDespensa } from '@/context/DespensaContext';
import { cerrarSesion } from '@/services/authService';
import { colors } from '@/theme/colors';
import { diasParaCaducar } from '@/theme/dates';
import { type } from '@/theme/typography';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { updateProfile } from 'firebase/auth';
import { useMemo, useState } from 'react';
import { enviarAvisoDePrueba } from '@/services/notificaciones';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DANGER = '#C0392B';

function aviso(titulo: string, mensaje: string) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.alert(`${titulo}\n${mensaje}`);
    return;
  }
  Alert.alert(titulo, mensaje);
}

export default function PerfilScreen() {
  const { usuario, firebaseListo } = useAuth();
  const {
    productos,
    listaCompras,
    categorias,
    nombreUsuario,
    setNombreUsuario,
    diasAviso,
    setDiasAviso,
  } = useDespensa();

  const [modalVisible, setModalVisible] = useState(false);
  const [nombreEdit, setNombreEdit] = useState('');
  const [guardando, setGuardando] = useState(false);

  const nombre = nombreUsuario ?? usuario?.displayName ?? 'Sin nombre';
  const correo = usuario?.email ?? 'Sin sesión iniciada';
  const inicial = (nombre !== 'Sin nombre' ? nombre : correo).charAt(0).toUpperCase();

  const porVencer = useMemo(
    () => productos.filter((p) => diasParaCaducar(p.fechaCaducidad) <= 5).length,
    [productos]
  );
  const pendientes = useMemo(
    () => listaCompras.filter((i) => !i.comprado).length,
    [listaCompras]
  );
  const categoriasActivas = categorias.filter((c) => c.cantidad > 0).length;

  function abrirEditar() {
    setNombreEdit(nombreUsuario ?? usuario?.displayName ?? '');
    setModalVisible(true);
  }

  async function guardarNombre() {
    const limpio = nombreEdit.trim();
    if (!limpio) {
      aviso('Falta el nombre', 'Escribe tu nombre.');
      return;
    }
    if (!usuario) {
      aviso('Sin sesión', 'Inicia sesión para editar tu perfil.');
      return;
    }
    try {
      setGuardando(true);
      await updateProfile(usuario as any, { displayName: limpio });
      setNombreUsuario(limpio);
      setModalVisible(false);
    } catch (e) {
      aviso('No se pudo guardar', 'Intenta de nuevo en un momento.');
    } finally {
      setGuardando(false);
    }
  }

  async function ejecutarCierreDeSesion() {
    setNombreUsuario(null);
    await cerrarSesion();
    router.replace('/(auth)/login');
  }
  async function probarAviso() {
    const ok = await enviarAvisoDePrueba();
    aviso(
      ok ? 'Aviso programado' : 'No disponible',
      ok
        ? 'Llegará en unos 5 segundos. Si quieres verlo, minimiza la app.'
        : 'Las notificaciones no funcionan en la web ni en Expo Go para Android. Necesitas un development build.'
    );
  }

  function confirmarCierre() {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('¿Quieres cerrar tu sesión?')) {
        ejecutarCierreDeSesion();
      }
      return;
    }
    Alert.alert('Cerrar sesión', '¿Quieres cerrar tu sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: ejecutarCierreDeSesion },
    ]);
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="Perfil" subtitle="Tu cuenta y tu despensa" />

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{inicial}</Text>
          </View>
          <Text style={styles.name}>{nombre}</Text>
          <Text style={styles.email}>{correo}</Text>

          {usuario && firebaseListo && (
            <Pressable style={styles.editBtn} onPress={abrirEditar}>
              <MaterialCommunityIcons name="pencil-outline" size={18} color={colors.secondary} />
              <Text style={styles.editText}>Editar nombre</Text>
            </Pressable>
          )}
        </View>

        <Text style={styles.sectionTitle}>Resumen</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{productos.length}</Text>
            <Text style={styles.statLabel}>Productos</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, porVencer > 0 && { color: DANGER }]}>{porVencer}</Text>
            <Text style={styles.statLabel}>Por vencer</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{categoriasActivas}</Text>
            <Text style={styles.statLabel}>Categorías</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{pendientes}</Text>
            <Text style={styles.statLabel}>Por comprar</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Avisos de caducidad</Text>
        <Text style={styles.hint}>Avisarme antes de que caduque un producto:</Text>
        <View style={styles.chipsRow}>
          {([1, 3, 7] as const).map((d) => {
            const activo = diasAviso === d;
            return (
              <Pressable
                key={d}
                style={[styles.chip, activo && styles.chipActive]}
                onPress={() => setDiasAviso(d)}
              >
                <Text style={[styles.chipText, activo && styles.chipTextActive]}>
                  {d === 1 ? '1 día' : `${d} días`}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable style={styles.testBtn} onPress={probarAviso}>
          <MaterialCommunityIcons name="bell-ring-outline" size={18} color={colors.secondary} />
          <Text style={styles.editText}>Probar aviso</Text>
        </Pressable>

        {usuario && firebaseListo ? (
          <Pressable style={styles.logoutBtn} onPress={confirmarCierre}>
            <MaterialCommunityIcons name="logout" size={20} color={DANGER} />
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.loginBtn} onPress={() => router.replace('/(auth)/login')}>
            <MaterialCommunityIcons name="login" size={20} color={colors.surface} />
            <Text style={styles.loginText}>Iniciar sesión</Text>
          </Pressable>
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setModalVisible(false)} />
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Editar nombre</Text>
            <TextInput
              value={nombreEdit}
              onChangeText={setNombreEdit}
              placeholder="Tu nombre"
              placeholderTextColor={colors.inkMuted}
              style={styles.input}
              autoFocus
            />
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.btn, styles.btnGhost]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.btnText, { color: colors.ink }]}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.btn, styles.btnPrimary, guardando && { opacity: 0.6 }]}
                onPress={guardarNombre}
                disabled={guardando}
              >
                <Text style={[styles.btnText, { color: colors.surface }]}>
                  {guardando ? 'Guardando...' : 'Guardar'}
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  profileCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    marginBottom: 24,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 28,
    backgroundColor: colors.cardBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { ...type.h1, color: colors.secondary },
  name: { ...type.h2, color: colors.ink },
  email: { ...type.body, color: colors.inkMuted, marginTop: 2 },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  editText: { ...type.bodyMedium, color: colors.secondary },
  sectionTitle: { ...type.h2, marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    alignItems: 'center',
  },
  statValue: { ...type.h1, color: colors.ink },
  statLabel: { ...type.body, fontSize: 13, color: colors.inkMuted, marginTop: 2 },
  hint: { ...type.body, color: colors.inkMuted, fontSize: 13, marginBottom: 10 },
  chipsRow: { flexDirection: 'row', gap: 10, marginBottom: 6 },
  chip: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  chipText: { ...type.body, color: colors.ink },
  chipTextActive: { color: colors.surface, fontWeight: '600' },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingVertical: 8,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: DANGER,
    marginTop: 16,
  },
  logoutText: { ...type.body, color: DANGER, fontWeight: '600' },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.secondary,
    marginTop: 16,
  },
  loginText: { ...type.body, color: colors.surface, fontWeight: '600' },
  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
  },
  modalTitle: {
    ...type.body,
    fontSize: 20,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 16,
  },
  input: {
    ...type.body,
    color: colors.ink,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    height: 48,
  },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnGhost: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnPrimary: { backgroundColor: colors.secondary },
  btnText: { ...type.body, fontWeight: '600' },
});