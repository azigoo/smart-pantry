import { ScreenHeader } from '@/components/ScreenHeader';
import { useDespensa, type Producto } from '@/context/DespensaContext';
import { colors } from '@/theme/colors';
import type { ItemCompra } from '@/theme/types';
import { type } from '@/theme/typography';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DANGER = '#C0392B';

const idCategoria = (c: any): string => String(c.id ?? c.nombre);

const formatearFecha = (d: Date) =>
  d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });

// Confirmación que funciona en web y en móvil
function confirmar(titulo: string, mensaje: string, textoAccion: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.confirm(`${titulo}\n${mensaje}`)) {
      onConfirm();
    }
    return;
  }
  Alert.alert(titulo, mensaje, [
    { text: 'Cancelar', style: 'cancel' },
    { text: textoAccion, style: 'destructive', onPress: onConfirm },
  ]);
}

export default function ListaComprasScreen() {
  const {
    listaCompras: items,
    setListaCompras: setItems,
    setProductos,
    categorias,
  } = useDespensa();
  const [nuevo, setNuevo] = useState('');

  // Modal de edición
  const [modalVisible, setModalVisible] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editCantidad, setEditCantidad] = useState('1');

  // Modal de "comprado → despensa"
  const [compraItem, setCompraItem] = useState<ItemCompra | null>(null);
  const [compraCantidad, setCompraCantidad] = useState('1');
  const [compraFecha, setCompraFecha] = useState<Date>(new Date());
  const [compraCat, setCompraCat] = useState<string | null>(null);
  const [mostrarPicker, setMostrarPicker] = useState(false);

  const pendientes = items.filter((i) => !i.comprado).length;
  const comprados = items.length - pendientes;

  // Pendientes arriba, comprados al final
  const itemsOrdenados = useMemo(
    () => [...items].sort((a, b) => Number(a.comprado) - Number(b.comprado)),
    [items]
  );

  function marcarComprado(id: string, valor: boolean) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, comprado: valor } : i)));
  }

  // Al marcar como comprado se ofrece pasarlo a la despensa; al desmarcar solo se revierte
  function toggleItem(item: ItemCompra) {
    if (item.comprado) {
      marcarComprado(item.id, false);
      return;
    }
    const n = parseInt(String(item.cantidad), 10);
    setCompraItem(item);
    setCompraCantidad(Number.isNaN(n) || n < 1 ? '1' : String(n));
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + 7);
    setCompraFecha(fecha);
    const valor = (item as any).categoria;
    const cat = categorias.find((c: any) => c.id === valor || c.nombre === valor);
    setCompraCat(cat ? idCategoria(cat) : null);
    setMostrarPicker(false);
  }

  function cerrarCompra() {
    setCompraItem(null);
    setMostrarPicker(false);
  }

  function soloMarcar() {
    if (compraItem) marcarComprado(compraItem.id, true);
    cerrarCompra();
  }

  function agregarADespensa() {
    if (!compraItem) return;
    const parsed = parseInt(compraCantidad, 10);
    const cantidad = Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;

    const producto = {
      id: Date.now().toString(),
      nombre: compraItem.nombre,
      cantidad,
      fechaCaducidad: compraFecha.toISOString(),
      categoria: compraCat ?? undefined,
    } as unknown as Producto;

    setProductos((prev) => [producto, ...prev]);
    marcarComprado(compraItem.id, true);
    cerrarCompra();
  }

  function ajustarCompra(delta: number) {
    const actual = parseInt(compraCantidad, 10);
    const base = Number.isNaN(actual) ? 1 : actual;
    setCompraCantidad(String(Math.max(1, base + delta)));
  }

  const onCambioFecha = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setMostrarPicker(false);
    if (event.type === 'set' && selected) setCompraFecha(selected);
  };

  function agregarItem() {
    const nombre = nuevo.trim();
    if (!nombre) return;
    setItems((prev) => [
      { id: Date.now().toString(), nombre, cantidad: '1', comprado: false },
      ...prev,
    ]);
    setNuevo('');
  }

  function eliminarItem(item: ItemCompra) {
    confirmar('Eliminar producto', `¿Quitar "${item.nombre}" de la lista?`, 'Eliminar', () =>
      setItems((prev) => prev.filter((i) => i.id !== item.id))
    );
  }

  function limpiarComprados() {
    confirmar(
      'Limpiar comprados',
      `¿Eliminar los ${comprados} productos ya comprados?`,
      'Limpiar',
      () => setItems((prev) => prev.filter((i) => !i.comprado))
    );
  }

  function abrirEditar(item: ItemCompra) {
    setEditandoId(item.id);
    setEditNombre(item.nombre);
    setEditCantidad(String(item.cantidad ?? '1'));
    setModalVisible(true);
  }

  function cerrarModal() {
    setModalVisible(false);
    setEditandoId(null);
  }

  function guardarEdicion() {
    const nombre = editNombre.trim();
    if (!nombre) {
      Alert.alert('Falta el nombre', 'Escribe el nombre del producto.');
      return;
    }
    const cantidad = editCantidad.trim() || '1';
    setItems((prev) => prev.map((i) => (i.id === editandoId ? { ...i, nombre, cantidad } : i)));
    cerrarModal();
  }

  // Botones +/- (funcionan cuando la cantidad es un número)
  function ajustarCantidad(delta: number) {
    const actual = parseInt(editCantidad, 10);
    const base = Number.isNaN(actual) ? 1 : actual;
    setEditCantidad(String(Math.max(1, base + delta)));
  }

  const renderItem = ({ item }: { item: ItemCompra }) => (
    <View style={[styles.row, item.comprado && styles.rowDone]}>
      <Pressable onPress={() => toggleItem(item)} hitSlop={8}>
        <MaterialCommunityIcons
          name={item.comprado ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
          size={26}
          color={item.comprado ? colors.secondary : colors.inkMuted}
        />
      </Pressable>

      <Pressable style={styles.rowInfo} onPress={() => abrirEditar(item)}>
        <Text style={[styles.rowTitle, item.comprado && styles.rowTitleDone]}>{item.nombre}</Text>
        <Text style={styles.rowQty}>Cantidad: {item.cantidad}</Text>
      </Pressable>

      <Pressable style={styles.iconBtn} onPress={() => abrirEditar(item)} hitSlop={8}>
        <MaterialCommunityIcons name="pencil-outline" size={22} color={colors.inkMuted} />
      </Pressable>
      <Pressable style={styles.iconBtn} onPress={() => eliminarItem(item)} hitSlop={8}>
        <MaterialCommunityIcons name="trash-can-outline" size={22} color={DANGER} />
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.content}>
        <ScreenHeader title="Lista de compras" subtitle={`${pendientes} productos pendientes`} />

        <View style={styles.addBar}>
          <TextInput
            placeholder="Agregar producto a comprar"
            placeholderTextColor={colors.inkMuted}
            value={nuevo}
            onChangeText={setNuevo}
            onSubmitEditing={agregarItem}
            returnKeyType="done"
            style={styles.addInput}
          />
          <Pressable style={styles.addButton} onPress={agregarItem}>
            <MaterialCommunityIcons name="plus" size={22} color={colors.surface} />
          </Pressable>
        </View>

        {comprados > 0 && (
          <Pressable style={styles.clearBtn} onPress={limpiarComprados}>
            <MaterialCommunityIcons name="broom" size={18} color={colors.inkMuted} />
            <Text style={styles.clearText}>Limpiar comprados ({comprados})</Text>
          </Pressable>
        )}

        <FlatList
          data={itemsOrdenados}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialCommunityIcons name="cart-outline" size={36} color={colors.inkMuted} />
              <Text style={styles.emptyText}>Tu lista de compras está vacía</Text>
            </View>
          }
        />
      </View>

      {/* Modal editar */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={cerrarModal}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable style={styles.modalBackdrop} onPress={cerrarModal} />
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Editar producto</Text>

            <Text style={styles.label}>Nombre</Text>
            <TextInput
              placeholder="Ej. Leche"
              placeholderTextColor={colors.inkMuted}
              value={editNombre}
              onChangeText={setEditNombre}
              style={styles.input}
            />

            <Text style={styles.label}>Cantidad</Text>
            <View style={styles.qtyRow}>
              <Pressable style={styles.qtyBtn} onPress={() => ajustarCantidad(-1)}>
                <MaterialCommunityIcons name="minus" size={22} color={colors.ink} />
              </Pressable>
              <TextInput
                value={editCantidad}
                onChangeText={setEditCantidad}
                placeholder="1"
                placeholderTextColor={colors.inkMuted}
                style={[styles.input, styles.qtyInput]}
              />
              <Pressable style={styles.qtyBtn} onPress={() => ajustarCantidad(1)}>
                <MaterialCommunityIcons name="plus" size={22} color={colors.ink} />
              </Pressable>
            </View>

            <View style={styles.modalActions}>
              <Pressable style={[styles.btn, styles.btnGhost]} onPress={cerrarModal}>
                <Text style={[styles.btnText, { color: colors.ink }]}>Cancelar</Text>
              </Pressable>
              <Pressable style={[styles.btn, styles.btnPrimary]} onPress={guardarEdicion}>
                <Text style={[styles.btnText, { color: colors.surface }]}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal comprado → despensa */}
      <Modal
        visible={compraItem !== null}
        transparent
        animationType="slide"
        onRequestClose={cerrarCompra}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable style={styles.modalBackdrop} onPress={cerrarCompra} />
          <View style={[styles.modalSheet, { maxHeight: '90%' }]}>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>¿Agregar a tu despensa?</Text>
              <Text style={styles.subtle}>{compraItem?.nombre}</Text>

              <Text style={styles.label}>Cantidad</Text>
              <View style={styles.qtyRow}>
                <Pressable style={styles.qtyBtn} onPress={() => ajustarCompra(-1)}>
                  <MaterialCommunityIcons name="minus" size={22} color={colors.ink} />
                </Pressable>
                <TextInput
                  value={compraCantidad}
                  onChangeText={(t) => setCompraCantidad(t.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                  placeholder="1"
                  placeholderTextColor={colors.inkMuted}
                  style={[styles.input, styles.qtyInput]}
                />
                <Pressable style={styles.qtyBtn} onPress={() => ajustarCompra(1)}>
                  <MaterialCommunityIcons name="plus" size={22} color={colors.ink} />
                </Pressable>
              </View>

              <Text style={styles.label}>Categoría</Text>
              <View style={styles.chips}>
                {categorias.map((c: any) => {
                  const id = idCategoria(c);
                  const activa = compraCat === id;
                  return (
                    <Pressable
                      key={id}
                      style={[styles.chip, activa && styles.chipActive]}
                      onPress={() => setCompraCat(activa ? null : id)}
                    >
                      <Text style={[styles.chipText, activa && styles.chipTextActive]}>
                        {c.nombre}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.label}>Fecha de caducidad</Text>
              <Pressable
                style={[styles.input, styles.dateInput]}
                onPress={() => setMostrarPicker((v) => !v)}
              >
                <MaterialCommunityIcons name="calendar" size={20} color={colors.inkMuted} />
                <Text style={styles.dateText}>{formatearFecha(compraFecha)}</Text>
              </Pressable>

              {mostrarPicker && (
                <DateTimePicker
                  value={compraFecha}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onCambioFecha}
                />
              )}

              <View style={styles.modalActions}>
                <Pressable style={[styles.btn, styles.btnGhost]} onPress={soloMarcar}>
                  <Text style={[styles.btnText, { color: colors.ink }]}>Solo marcar</Text>
                </Pressable>
                <Pressable style={[styles.btn, styles.btnPrimary]} onPress={agregarADespensa}>
                  <Text style={[styles.btnText, { color: colors.surface }]}>Agregar</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  addBar: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  addInput: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    ...type.body,
    color: colors.ink,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 6,
    marginBottom: 10,
  },
  clearText: {
    ...type.body,
    fontSize: 13,
    color: colors.inkMuted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
  },
  rowDone: {
    opacity: 0.6,
  },
  rowInfo: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    ...type.body,
    color: colors.ink,
    fontWeight: '600',
  },
  rowTitleDone: {
    textDecorationLine: 'line-through',
    color: colors.inkMuted,
  },
  rowQty: {
    ...type.body,
    fontSize: 13,
    color: colors.inkMuted,
  },
  iconBtn: {
    padding: 4,
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
  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
  },
  modalTitle: {
    ...type.body,
    fontSize: 20,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 4,
  },
  subtle: {
    ...type.body,
    color: colors.inkMuted,
    marginBottom: 8,
  },
  label: {
    ...type.body,
    color: colors.inkMuted,
    fontSize: 13,
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    ...type.body,
    color: colors.ink,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    height: 48,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    ...type.body,
    color: colors.ink,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  qtyInput: {
    flex: 1,
    textAlign: 'center',
  },
  qtyBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  chipText: {
    ...type.body,
    fontSize: 13,
    color: colors.ink,
  },
  chipTextActive: {
    color: colors.surface,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnGhost: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnPrimary: {
    backgroundColor: colors.secondary,
  },
  btnText: {
    ...type.body,
    fontWeight: '600',
  },
});