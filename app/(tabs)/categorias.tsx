import { CategoryTile } from '@/components/CategoryTile';
import { ErrorMessage } from '@/components/ErrorMessage';
import { ProductListItem } from '@/components/ProductListItem';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useDespensa } from '@/context/DespensaContext';
import { colors } from '@/theme/colors';
import { diasParaCaducar } from '@/theme/dates';
import { type } from '@/theme/typography';
import type { CategoryId, Producto } from '@/theme/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const keyExtractorProducto = (producto: Producto) => producto.id;

export default function CategoriasScreen() {
  const { productos, categorias, errorDatos, cargandoDatos } = useDespensa();
  const [categoriaId, setCategoriaId] = useState<CategoryId | null>(null);

  // Se busca en la lista actual, así el detalle también se mantiene actualizado
  const categoriaSel = useMemo(
    () => categorias.find((categoria) => categoria.id === categoriaId) ?? null,
    [categorias, categoriaId],
  );

  const productosDeCategoria = useMemo(() => {
    if (!categoriaSel) return [];
    return productos
      .filter((producto) => producto.categoria === categoriaSel.id)
      .sort((a, b) => diasParaCaducar(a.fechaCaducidad) - diasParaCaducar(b.fechaCaducidad));
  }, [productos, categoriaSel]);
  const renderProducto = useCallback(
    ({ item }: ListRenderItemInfo<Producto>) => <ProductListItem producto={item} />,
    [],
  );

  // Vista de detalle: productos de la categoría seleccionada
  if (categoriaSel) {
    const nombre = categoriaSel.nombre;
    const total = productosDeCategoria.length;

    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.detail}>
          <ErrorMessage mensaje={errorDatos} />
          <Pressable
            style={styles.backBtn}
            onPress={() => setCategoriaId(null)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Volver a categorías"
          >
            <MaterialCommunityIcons name="arrow-left" size={22} color={colors.secondary} />
            <Text style={styles.backText}>Categorías</Text>
          </Pressable>

          <ScreenHeader
            title={nombre}
            subtitle={total === 1 ? '1 producto' : `${total} productos`}
          />

          <FlatList
            data={productosDeCategoria}
            keyExtractor={keyExtractorProducto}
            renderItem={renderProducto}
            contentContainerStyle={{ paddingBottom: 40 }}
            ListEmptyComponent={
              <View style={styles.empty}>
                {cargandoDatos ? (
                  <>
                    <ActivityIndicator
                      color={colors.secondary}
                      accessibilityLabel="Cargando productos"
                    />
                    <Text style={styles.emptyText}>Cargando productos…</Text>
                  </>
                ) : (
                  <>
                    <MaterialCommunityIcons
                      name="basket-off-outline"
                      size={36}
                      color={colors.inkMuted}
                    />
                    <Text style={styles.emptyText}>
                      {errorDatos
                        ? 'No se pudieron cargar los productos.'
                        : 'No hay productos en esta categoría'}
                    </Text>
                  </>
                )}
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
        <ErrorMessage mensaje={errorDatos} />

        {cargandoDatos && (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.secondary} accessibilityLabel="Cargando categorías" />
            <Text style={styles.emptyText}>Cargando tus categorías…</Text>
          </View>
        )}

        <View style={styles.grid}>
          {categorias.map((categoria) => (
            <Pressable
              key={categoria.id}
              style={styles.tileWrapper}
              onPress={() => setCategoriaId(categoria.id)}
              accessibilityRole="button"
              accessibilityLabel={`${categoria.nombre}, ${categoria.cantidad} productos`}
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
    minHeight: 44,
    paddingHorizontal: 4,
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
  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  emptyText: {
    ...type.body,
    color: colors.inkMuted,
    textAlign: 'center',
  },
});
