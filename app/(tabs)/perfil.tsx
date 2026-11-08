import { ScreenHeader } from '@/components/ScreenHeader';
import { EditarNombreModal } from '@/components/perfil/EditarNombreModal';
import { styles } from '@/components/perfil/perfilStyles';
import { ErrorMessage } from '@/components/ErrorMessage';
import { useAuth } from '@/context/AuthContext';
import { useDespensa } from '@/context/DespensaContext';
import { cerrarSesion, esErrorAutenticacion } from '@/services/authService';
import { logger } from '@/services/logger';
import { colors } from '@/theme/colors';
import { diasParaCaducar } from '@/theme/dates';
import { validarNombrePerfil } from '@/theme/validators';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { updateProfile } from 'firebase/auth';
import { useMemo, useState } from 'react';
import { enviarAvisoDePrueba } from '@/services/notificaciones';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function aviso(titulo: string, mensaje: string) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.alert(`${titulo}\n${mensaje}`);
    return;
  }
  Alert.alert(titulo, mensaje);
}

export default function PerfilScreen() {
  const { usuario, firebaseListo, errorAutenticacion } = useAuth();
  const {
    productos,
    listaCompras,
    categorias,
    nombreUsuario,
    setNombreUsuario,
    diasAviso,
    setDiasAviso,
    errorDatos,
    cargandoDatos,
  } = useDespensa();

  const [modalVisible, setModalVisible] = useState(false);
  const [nombreEdit, setNombreEdit] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [errorPerfil, setErrorPerfil] = useState<string | null>(null);
  const [mensajeGuardado, setMensajeGuardado] = useState<string | null>(null);

  const nombre = nombreUsuario ?? usuario?.displayName ?? 'Sin nombre';
  const correo = usuario?.email ?? 'Sin sesión iniciada';
  const inicial = (nombre !== 'Sin nombre' ? nombre : correo).charAt(0).toUpperCase();

  const porVencer = useMemo(
    () => productos.filter((p) => diasParaCaducar(p.fechaCaducidad) <= 5).length,
    [productos],
  );
  const pendientes = useMemo(() => listaCompras.filter((i) => !i.comprado).length, [listaCompras]);
  const categoriasActivas = categorias.filter((c) => c.cantidad > 0).length;

  function abrirEditar() {
    setNombreEdit(nombreUsuario ?? usuario?.displayName ?? '');
    setErrorPerfil(null);
    setMensajeGuardado(null);
    setModalVisible(true);
  }

  async function guardarNombre() {
    const limpio = nombreEdit.trim();
    const validacion = validarNombrePerfil(limpio);
    if (!validacion.valido) {
      setErrorPerfil(validacion.errores.join(' '));
      return;
    }
    if (!usuario) {
      setErrorPerfil('Inicia sesión para editar tu perfil.');
      return;
    }
    try {
      setGuardando(true);
      setErrorPerfil(null);
      await updateProfile(usuario, { displayName: limpio });
      setNombreUsuario(limpio);
      setModalVisible(false);
      setMensajeGuardado('Tu nombre se guardó correctamente.');
    } catch (error) {
      logger.error('Actualización de perfil', error);
      setErrorPerfil('No se pudo guardar tu nombre. Revisa tu conexión e intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  }

  async function ejecutarCierreDeSesion() {
    try {
      await cerrarSesion();
      setNombreUsuario(null);
      router.replace('/(auth)/login');
    } catch (error) {
      logger.error('Cierre de sesión', error);
      setErrorPerfil(
        esErrorAutenticacion(error)
          ? error.mensaje
          : 'No se pudo cerrar la sesión. Intenta de nuevo.',
      );
    }
  }
  async function probarAviso() {
    const ok = await enviarAvisoDePrueba();
    aviso(
      ok ? 'Aviso programado' : 'No disponible',
      ok
        ? 'Llegará en unos 5 segundos. Si quieres verlo, minimiza la app.'
        : 'Las notificaciones no funcionan en la web ni en Expo Go para Android. Necesitas un development build.',
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
        <ErrorMessage mensaje={errorDatos} />
        <ErrorMessage mensaje={errorAutenticacion} />
        <ErrorMessage mensaje={errorPerfil} />
        <ErrorMessage mensaje={mensajeGuardado} tipo="exito" />

        {cargandoDatos && (
          <ActivityIndicator
            style={styles.loading}
            color={colors.secondary}
            accessibilityLabel="Cargando datos de tu despensa"
          />
        )}

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{inicial}</Text>
          </View>
          <Text style={styles.name}>{nombre}</Text>
          <Text style={styles.email}>{correo}</Text>

          {usuario && firebaseListo && (
            <Pressable
              style={styles.editBtn}
              onPress={abrirEditar}
              accessibilityRole="button"
              accessibilityLabel="Editar nombre del perfil"
            >
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
            <Text style={[styles.statValue, porVencer > 0 && { color: colors.danger }]}>
              {porVencer}
            </Text>
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
                accessibilityRole="radio"
                accessibilityState={{ selected: activo }}
                accessibilityLabel={`Avisarme ${d === 1 ? 'un día' : `${d} días`} antes`}
              >
                <Text style={[styles.chipText, activo && styles.chipTextActive]}>
                  {d === 1 ? '1 día' : `${d} días`}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable
          style={styles.testBtn}
          onPress={probarAviso}
          accessibilityRole="button"
          accessibilityLabel="Probar aviso de caducidad"
        >
          <MaterialCommunityIcons name="bell-ring-outline" size={18} color={colors.secondary} />
          <Text style={styles.editText}>Probar aviso</Text>
        </Pressable>

        {usuario && firebaseListo ? (
          <Pressable
            style={styles.logoutBtn}
            onPress={confirmarCierre}
            accessibilityRole="button"
            accessibilityLabel="Cerrar sesión"
          >
            <MaterialCommunityIcons name="logout" size={20} color={colors.danger} />
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </Pressable>
        ) : (
          <Pressable
            style={styles.loginBtn}
            onPress={() => router.replace('/(auth)/login')}
            accessibilityRole="button"
            accessibilityLabel="Iniciar sesión"
          >
            <MaterialCommunityIcons name="login" size={20} color={colors.surface} />
            <Text style={styles.loginText}>Iniciar sesión</Text>
          </Pressable>
        )}
      </ScrollView>

      <EditarNombreModal
        visible={modalVisible}
        nombre={nombreEdit}
        guardando={guardando}
        error={errorPerfil}
        onClose={() => setModalVisible(false)}
        onNombreChange={setNombreEdit}
        onGuardar={guardarNombre}
      />
    </SafeAreaView>
  );
}
