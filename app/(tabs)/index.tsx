import { ProductListItem } from '@/components/ProductListItem';
import { StatCard } from '@/components/StatCard';
import { useAuth } from '@/context/AuthContext';
import { useDespensa } from '@/context/DespensaContext';
import { colors } from '@/theme/colors';
import { diasParaCaducar } from '@/theme/dates';
import { type } from '@/theme/typography';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function InicioScreen() {
  const { usuario } = useAuth();
  const { productos, listaCompras, categorias, nombreUsuario } = useDespensa();

  const porVencer = useMemo(
    () => productos.filter((p) => diasParaCaducar(p.fechaCaducidad) <= 5).length,
    [productos]
  );
  const pendientesCompra = useMemo(
    () => listaCompras.filter((i) => !i.comprado).length,
    [listaCompras]
  );
  const proximosAVencer = useMemo(
    () =>
      productos
        .slice()
        .sort((a, b) => diasParaCaducar(a.fechaCaducidad) - diasParaCaducar(b.fechaCaducidad))
        .slice(0, 4),
    [productos]
  );

  // Solo cuentan las categorías que tienen al menos un producto
  const categoriasActivas = categorias.filter((c) => c.cantidad > 0).length;

  const nombreMostrado = nombreUsuario || usuario?.displayName || usuario?.email || 'Grisel';

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Hola, {nombreMostrado}</Text>
            <Text style={styles.subtitle}>Resumen de tu despensa</Text>
          </View>
          <Pressable
            style={styles.avatar}
            onPress={() => router.push('/(tabs)/perfil' as any)}
            hitSlop={8}
          >
            <MaterialCommunityIcons name="account" size={22} color={colors.secondary} />
          </Pressable>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard label="Productos" value={productos.length} tone="yellow" />
            <StatCard label="Por vencer" value={porVencer} tone="pink" />
          </View>
          <View style={styles.statsRow}>
            <StatCard label="Categorías" value={categoriasActivas} tone="blue" />
            <StatCard label="Lista compras" value={pendientesCompra} tone="lavender" />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={type.h2}>Por vencer pronto</Text>
          <Pressable onPress={() => router.push('/(tabs)/productos')}>
            <Text style={styles.link}>Ver todo</Text>
          </Pressable>
        </View>

        {proximosAVencer.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="basket-off-outline" size={36} color={colors.inkMuted} />
            <Text style={styles.emptyText}>Aún no hay productos en tu despensa</Text>
          </View>
        ) : (
          proximosAVencer.map((producto) => (
            <ProductListItem key={producto.id} producto={producto} />
          ))
        )}
      </ScrollView>

      <Pressable
        style={styles.fab}
        onPress={() => router.push({ pathname: '/(tabs)/productos', params: { nuevo: '1' } } as any)}
      >
        <MaterialCommunityIcons name="plus" size={26} color={colors.surface} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    ...type.h1,
  },
  subtitle: {
    ...type.body,
    color: colors.inkMuted,
    marginTop: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.cardBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    gap: 12,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  link: {
    ...type.bodyMedium,
    color: colors.secondary,
  },
  empty: {
    alignItems: 'center',
    marginTop: 30,
    gap: 8,
  },
  emptyText: {
    ...type.body,
    color: colors.inkMuted,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});