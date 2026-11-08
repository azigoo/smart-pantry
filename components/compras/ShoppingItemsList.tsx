import { colors } from '@/theme/colors';
import type { ItemCompra } from '@/theme/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ActivityIndicator, FlatList, Text, View, type ListRenderItem } from 'react-native';
import { styles } from './shoppingStyles';

type Props = {
  items: ItemCompra[];
  cargando: boolean;
  error: string | null;
  renderItem: ListRenderItem<ItemCompra>;
};

const keyExtractor = (item: ItemCompra) => item.id;

export function ShoppingItemsList({ items, cargando, error, renderItem }: Props) {
  return (
    <FlatList
      data={items}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
      ListEmptyComponent={
        <View style={styles.empty}>
          {cargando ? (
            <>
              <ActivityIndicator
                color={colors.secondary}
                accessibilityLabel="Cargando lista de compras"
              />
              <Text style={styles.emptyText}>Cargando lista de compras…</Text>
            </>
          ) : (
            <>
              <MaterialCommunityIcons name="cart-outline" size={36} color={colors.inkMuted} />
              <Text style={styles.emptyText}>
                {error
                  ? 'No se pudo cargar tu lista de compras.'
                  : 'Tu lista de compras está vacía'}
              </Text>
            </>
          )}
        </View>
      }
    />
  );
}
