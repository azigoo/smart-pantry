import { ErrorMessage } from '@/components/ErrorMessage';
import { colors } from '@/theme/colors';
import { aClave } from '@/theme/fechaLocal';
import { comportamientoTeclado, SelectorFechaPlataforma } from '@/services/platform';
import type { CategoryId } from '@/theme/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { CategoriaConConteo } from '@/context/DespensaContext';
import { styles } from './productosStyles';

const UNIDADES = ['pzas', 'kg', 'litros'] as const;

type Props = {
  visible: boolean;
  editando: boolean;
  nombre: string;
  cantidad: string;
  unidad: string;
  fecha: Date;
  categoria: CategoryId | null;
  mostrarPicker: boolean;
  categorias: CategoriaConConteo[];
  error: string | null;
  onClose: () => void;
  onNombreChange: (nombre: string) => void;
  onCantidadChange: (cantidad: string) => void;
  onUnidadChange: (unidad: string) => void;
  onCategoriaChange: (categoria: CategoryId | null) => void;
  onMostrarPickerChange: (mostrar: boolean) => void;
  onCambioFecha: (fecha?: Date) => void;
  onAjustarCantidad: (delta: number) => void;
  onGuardar: () => void;
  formatearFecha: (clave?: string) => string;
};

export function ProductoFormModal({
  visible,
  editando,
  nombre,
  cantidad,
  unidad,
  fecha,
  categoria,
  mostrarPicker,
  categorias,
  error,
  onClose,
  onNombreChange,
  onCantidadChange,
  onUnidadChange,
  onCategoriaChange,
  onMostrarPickerChange,
  onCambioFecha,
  onAjustarCantidad,
  onGuardar,
  formatearFecha,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.modalOverlay} behavior={comportamientoTeclado()}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} accessible={false} />
        <View style={styles.modalSheet}>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>{editando ? 'Editar producto' : 'Nuevo producto'}</Text>

            <Text style={styles.label}>Nombre</Text>
            <TextInput
              accessibilityLabel="Nombre del producto"
              placeholder="Ej. Leche"
              placeholderTextColor={colors.inkMuted}
              value={nombre}
              onChangeText={onNombreChange}
              style={styles.input}
            />

            <Text style={styles.label}>Cantidad</Text>
            <View style={styles.qtyRow}>
              <Pressable
                style={styles.qtyBtn}
                onPress={() => onAjustarCantidad(-1)}
                accessibilityRole="button"
                accessibilityLabel="Disminuir cantidad"
              >
                <MaterialCommunityIcons name="minus" size={22} color={colors.ink} />
              </Pressable>
              <TextInput
                accessibilityLabel="Cantidad"
                value={cantidad}
                onChangeText={(text) => onCantidadChange(text.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                placeholder="1"
                placeholderTextColor={colors.inkMuted}
                style={[styles.input, styles.qtyInput]}
              />
              <Pressable
                style={styles.qtyBtn}
                onPress={() => onAjustarCantidad(1)}
                accessibilityRole="button"
                accessibilityLabel="Aumentar cantidad"
              >
                <MaterialCommunityIcons name="plus" size={22} color={colors.ink} />
              </Pressable>
            </View>

            <Text style={styles.label}>Unidad</Text>
            <View style={styles.chips}>
              {UNIDADES.map((value) => {
                const activa = unidad === value;
                return (
                  <Pressable
                    key={value}
                    style={[styles.chip, activa && styles.chipActive]}
                    onPress={() => onUnidadChange(value)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: activa }}
                    accessibilityLabel={`Unidad ${value}`}
                  >
                    <Text style={[styles.chipText, activa && styles.chipTextActive]}>{value}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.label}>Categoría</Text>
            <View style={styles.chips}>
              {categorias.map((item) => {
                const activa = categoria === item.id;
                return (
                  <Pressable
                    key={item.id}
                    style={[styles.chip, activa && styles.chipActive]}
                    onPress={() => onCategoriaChange(activa ? null : item.id)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: activa }}
                    accessibilityLabel={`Categoría ${item.nombre}`}
                  >
                    <Text style={[styles.chipText, activa && styles.chipTextActive]}>
                      {item.nombre}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.label}>Fecha de caducidad</Text>
            <Pressable
              style={[styles.input, styles.dateInput]}
              onPress={() => onMostrarPickerChange(!mostrarPicker)}
              accessibilityRole="button"
              accessibilityLabel={`Fecha de caducidad: ${formatearFecha(aClave(fecha))}`}
            >
              <MaterialCommunityIcons name="calendar" size={20} color={colors.inkMuted} />
              <Text style={styles.dateText}>{formatearFecha(aClave(fecha))}</Text>
            </Pressable>

            {mostrarPicker && (
              <SelectorFechaPlataforma
                visible
                value={fecha}
                accessibilityLabel="Fecha de caducidad"
                onChange={onCambioFecha}
                onClose={() => onMostrarPickerChange(false)}
              />
            )}

            <ErrorMessage mensaje={error} />
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.btn, styles.btnGhost]}
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Cancelar edición del producto"
              >
                <Text style={[styles.btnText, { color: colors.ink }]}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.btn, styles.btnPrimary]}
                onPress={onGuardar}
                accessibilityRole="button"
                accessibilityLabel={editando ? 'Guardar producto' : 'Agregar producto'}
              >
                <Text style={[styles.btnText, { color: colors.surface }]}>
                  {editando ? 'Guardar' : 'Agregar'}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
