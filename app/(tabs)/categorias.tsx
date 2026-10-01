import { CategoryTile } from '@/components/CategoryTile';
import { ProductListItem } from '@/components/ProductListItem';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useDespensa } from '@/context/DespensaContext';
import { colors } from '@/theme/colors';
import { diasParaCaducar } from '@/theme/dates';
import { type } from '@/theme/typography';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CategoriasScreen() {
  const { productos, categorias } = useDespensa();
  const [categoriaId, setCategoriaId] = useState<string | null>(null);

  // Se busca en la lista actual, así el detalle también se mantiene actualizado
  const categoriaSel = useMemo(
    () => categorias.find((c: any) => String(c.id) === categoriaId) ?? null,
    [categorias, categoriaId]
  );

  const productosDeCategoria = useMemo(() => {
    if (!categoriaSel) return [];
    const c = categoriaSel as any;
    return productos
      .filter((p: any) => p.categoria === c.id || p.categoria === c.nombre)
      .sort((a, b) => diasParaCaducar(a.fechaCaducidad) - diasParaCaducar(b.fechaCaducidad));
  }, [productos, categoriaSel]);

  // Vista de detalle: productos de la categoría seleccionada
  if (categoriaSel) {
    const nombre = (categoriaSel as any).nombre as string;
    const total = productosDeCategoria.length;

    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.detail}>
          <Pressable style={styles.backBtn} onPress={() => setCategoriaId(null)} hitSlop={8}>
            <MaterialCommunityIcons name="arrow-left" size={22} color={colors.secondary} />
            <Text style={styles.backText}>Categorías</Text>
          </Pressable>

          <ScreenHeader
            title={nombre}
            subtitle={total === 1 ? '1 producto' : `${total} productos`}
          />

          <FlatList
            data={productosDeCategoria}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <ProductListItem producto={item} />}
            contentContainerStyle={{ paddingBottom: 40 }}
            ListEmptyComponent={
              <View style={styles.empty}>
                <MaterialCommunityIcons
                  name="basket-off-outline"
                  size={36}
                  color={colors.inkMuted}
                />
                <Text style={styles.emptyText}>No hay productos en esta categoría</Text>
              </View>
            }
          />
        </View>
      </SafeAreaView>
    );
  }

  // Vista principal: cuadrícula de categorías
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="Categorías" subtitle="Organiza tu despensa por tipo de producto" />

        <View style={styles.grid}>
          {categorias.map((categoria: any) => (
            <Pressable
              key={categoria.id}
              style={styles.tileWrapper}
              onPress={() => setCategoriaId(String(categoria.id))}
            >
              <View style={{ pointerEvents: 'none' }}>
                <CategoryTile categoria={categoria} count={categoria.cantidad} />
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tileWrapper: {
    width: '48%',
  },
  detail: {
    flex: 1,
    padding: 20,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  backText: {
    ...type.bodyMedium,
    color: colors.secondary,
  },
  empty: {
    alignItems: 'center',
    marginTop: 60,
    gap: 8,
  },
  emptyText: {
    ...type.body,
    color: colors.inkMuted,
    textAlign: 'center',
  },
});