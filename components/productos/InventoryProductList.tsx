import { colors } from '@/theme/colors';
import type { Producto } from '@/theme/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ActivityIndicator, FlatList, Text, View, type ListRenderItem } from 'react-native';
import { styles } from './productosStyles';

type Props = {
  productos: Producto[];
  cargando: boolean;
  error: string | null;
  busqueda: string;
  renderItem: ListRenderItem<Producto>;
};

const keyExtractor = (producto: Producto) => producto.id;

export function InventoryProductList({ productos, cargando, error, busqueda, renderItem }: Props) {
  return (
    <FlatList
      data={productos}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      contentContainerStyle={{ paddingBottom: 100 }}
      ListEmptyComponent={
        <View style={styles.empty}>
          {cargando ? (
            <>
              <ActivityIndicator color={colors.secondary} accessibilityLabel="Cargando productos" />
              <Text style={styles.emptyText}>Cargando productos…</Text>
            </>
          ) : (
            <>
              <MaterialCommunityIcons name="basket-off-outline" size={36} color={colors.inkMuted} />
              <Text style={styles.emptyText}>
                {error
                  ? 'No se pudieron cargar los productos.'
                  : busqueda.trim()
                    ? 'No encontramos productos con ese nombre'
                    : 'Aún no hay productos en tu despensa'}
              </Text>
            </>
          )}
        </View>
      }
    />
  );
}
