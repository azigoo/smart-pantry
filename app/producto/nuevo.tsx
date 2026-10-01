import { CategoryTile } from '@/components/CategoryTile';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TextField } from '@/components/TextField';
import { colors } from '@/theme/colors';
import { categorias } from '@/theme/mockData';
import type { CategoryId } from '@/theme/types';
import { type } from '@/theme/typography';
import { validarNuevoProducto } from '@/theme/validators';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NuevoProductoScreen() {
  const [nombre, setNombre] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<CategoryId>('lacteos');
  const [cantidad, setCantidad] = useState('1');
  const [fecha, setFecha] = useState('');

  const validacion = useMemo(
    () => validarNuevoProducto({ nombre, cantidad, fecha }),
    [nombre, cantidad, fecha],
  );
  const puedeGuardar = validacion.valido;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <MaterialCommunityIcons name="close" size={24} color={colors.inkMuted} />
        </Pressable>
        <Text style={type.h2}>Agregar producto</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TextField
          label="Nombre del producto"
          placeholder="Ej. Leche"
          value={nombre}
          onChangeText={setNombre}
        />

        <Text style={styles.label}>Categoría</Text>
        <View style={styles.grid}>
          {categorias.map((categoria) => (
            <Pressable key={categoria.id} onPress={() => setCategoriaSeleccionada(categoria.id)}>
              <CategoryTile
                categoria={categoria}
              />
              {categoriaSeleccionada === categoria.id && (
                <View style={styles.selectedRing} pointerEvents="none" />
              )}
            </Pressable>
          ))}
        </View>

        <TextField
          label="Cantidad"
          placeholder="1"
          keyboardType="numeric"
          value={cantidad}
          onChangeText={setCantidad}
        />

        <TextField
          label="Fecha de caducidad"
          placeholder="DD/MM/AAAA"
          value={fecha}
          onChangeText={setFecha}
        />

        {!puedeGuardar && (nombre || cantidad !== '1' || fecha) && (
          <View style={styles.errores}>
            {validacion.errores.map((error) => (
              <Text key={error} style={styles.errorText}>
                • {error}
              </Text>
            ))}
          </View>
        )}

        <PrimaryButton
          label="Guardar"
          disabled={!puedeGuardar}
          style={{ marginTop: 8 }}
          onPress={() => router.back()}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  content: {
    padding: 20,
    paddingTop: 4,
  },
  label: {
    ...type.label,
    color: colors.inkMuted,
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  selectedRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 12,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: colors.secondary,
  },
  errores: {
    marginTop: 4,
    marginBottom: 4,
  },
  errorText: {
    ...type.caption,
    color: colors.danger,
  },
});
