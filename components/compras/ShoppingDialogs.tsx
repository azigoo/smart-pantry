import { ErrorMessage } from '@/components/ErrorMessage';
import type { CategoriaConConteo } from '@/context/DespensaContext';
import { comportamientoTeclado, SelectorFechaPlataforma } from '@/services/platform';
import { colors } from '@/theme/colors';
import type { CategoryId, ItemCompra } from '@/theme/types';
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
import { styles } from './shoppingStyles';

type EditDialogProps = {
  visible: boolean;
  nombre: string;
  cantidad: string;
  error: string | null;
  onClose: () => void;
  onNombreChange: (nombre: string) => void;
  onCantidadChange: (cantidad: string) => void;
  onAjustarCantidad: (delta: number) => void;
  onGuardar: () => void;
};

export function ShoppingEditDialog({
  visible,
  nombre,
  cantidad,
  error,
  onClose,
  onNombreChange,
  onCantidadChange,
  onAjustarCantidad,
  onGuardar,
}: EditDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.modalOverlay} behavior={comportamientoTeclado()}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} accessible={false} />
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Editar producto</Text>

          <Text style={styles.label}>Nombre</Text>
          <TextInput
            accessibilityLabel="Nombre del artículo"
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
              accessibilityLabel="Cantidad del artículo"
              value={cantidad}
              onChangeText={onCantidadChange}
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

          <ErrorMessage mensaje={error} />
          <View style={styles.modalActions}>
            <Pressable
              style={[styles.btn, styles.btnGhost]}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cancelar edición del artículo"
            >
              <Text style={[styles.btnText, { color: colors.ink }]}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, styles.btnPrimary]}
              onPress={onGuardar}
              accessibilityRole="button"
              accessibilityLabel="Guardar cambios del artículo"
            >
              <Text style={[styles.btnText, { color: colors.surface }]}>Guardar</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

type PantryDialogProps = {
  item: ItemCompra | null;
  cantidad: string;
  fecha: Date;
  categoria: CategoryId | null;
  mostrarPicker: boolean;
  categorias: CategoriaConConteo[];
  error: string | null;
  onClose: () => void;
  onCantidadChange: (cantidad: string) => void;
  onAjustarCantidad: (delta: number) => void;
  onCategoriaChange: (categoria: CategoryId | null) => void;
  onMostrarPickerChange: (mostrar: boolean) => void;
  onCambioFecha: (fecha?: Date) => void;
  onSoloMarcar: () => void;
  onAgregar: () => void;
  formatearFecha: (fecha: Date) => string;
};

export function PurchaseToPantryDialog({
  item,
  cantidad,
  fecha,
  categoria,
  mostrarPicker,
  categorias,
  error,
  onClose,
  onCantidadChange,
  onAjustarCantidad,
  onCategoriaChange,
  onMostrarPickerChange,
  onCambioFecha,
  onSoloMarcar,
  onAgregar,
  formatearFecha,
}: PantryDialogProps) {
  return (
    <Modal visible={item !== null} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.modalOverlay} behavior={comportamientoTeclado()}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} accessible={false} />
        <View style={[styles.modalSheet, { maxHeight: '90%' }]}>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>¿Agregar a tu despensa?</Text>
            <Text style={styles.subtle}>{item?.nombre}</Text>

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
                accessibilityLabel="Cantidad del producto para la despensa"
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

            <Text style={styles.label}>Categoría</Text>
            <View style={styles.chips}>
              {categorias.map((itemCategoria) => {
                const activa = categoria === itemCategoria.id;
                return (
                  <Pressable
                    key={itemCategoria.id}
                    style={[styles.chip, activa && styles.chipActive]}
                    onPress={() => onCategoriaChange(activa ? null : itemCategoria.id)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: activa }}
                    accessibilityLabel={`Categoría ${itemCategoria.nombre}`}
                  >
                    <Text style={[styles.chipText, activa && styles.chipTextActive]}>
                      {itemCategoria.nombre}
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
              accessibilityLabel={`Fecha de caducidad: ${formatearFecha(fecha)}`}
            >
              <MaterialCommunityIcons name="calendar" size={20} color={colors.inkMuted} />
              <Text style={styles.dateText}>{formatearFecha(fecha)}</Text>
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
                onPress={onSoloMarcar}
                accessibilityRole="button"
                accessibilityLabel="Marcar como comprado sin agregar a la despensa"
              >
                <Text style={[styles.btnText, { color: colors.ink }]}>Solo marcar</Text>
              </Pressable>
              <Pressable
                style={[styles.btn, styles.btnPrimary]}
                onPress={onAgregar}
                accessibilityRole="button"
                accessibilityLabel="Agregar producto a la despensa"
              >
                <Text style={[styles.btnText, { color: colors.surface }]}>Agregar</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
