import { colors } from '@/theme/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, Text, TextInput, View } from 'react-native';
import { styles } from './shoppingStyles';

type Props = {
  nombre: string;
  articulosComprados: number;
  onNombreChange: (nombre: string) => void;
  onAgregar: () => void;
  onLimpiarComprados: () => void;
};

export function ShoppingListActions({
  nombre,
  articulosComprados,
  onNombreChange,
  onAgregar,
  onLimpiarComprados,
}: Props) {
  return (
    <>
      <View style={styles.addBar}>
        <TextInput
          accessibilityLabel="Agregar producto a la lista de compras"
          placeholder="Agregar producto a comprar"
          placeholderTextColor={colors.inkMuted}
          value={nombre}
          onChangeText={onNombreChange}
          onSubmitEditing={onAgregar}
          returnKeyType="done"
          style={styles.addInput}
        />
        <Pressable
          style={styles.addButton}
          onPress={onAgregar}
          accessibilityRole="button"
          accessibilityLabel="Agregar a la lista"
        >
          <MaterialCommunityIcons name="plus" size={22} color={colors.surface} />
        </Pressable>
      </View>

      {articulosComprados > 0 && (
        <Pressable
          style={styles.clearBtn}
          onPress={onLimpiarComprados}
          accessibilityRole="button"
          accessibilityLabel={`Limpiar ${articulosComprados} productos comprados`}
        >
          <MaterialCommunityIcons name="broom" size={18} color={colors.inkMuted} />
          <Text style={styles.clearText}>Limpiar comprados ({articulosComprados})</Text>
        </Pressable>
      )}
    </>
  );
}
