import { ScreenHeader } from '@/components/ScreenHeader';
import { useDespensa, type Producto } from '@/context/DespensaContext';
import { colors } from '@/theme/colors';
import { diasParaCaducar } from '@/theme/dates';
import { type } from '@/theme/typography';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
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
const WARNING = '#E67E22';

// Ajusta si tu producto/categoría usa otros nombres de campo
const categoriaDe = (p: Producto): string | undefined => (p as any).categoria;
const idCategoria = (c: any): string => String(c.id ?? c.nombre);

const formatearFecha = (iso?: string) => {
  if (!iso) return 'Sin fecha';
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export default function ProductosScreen() {
  const { productos, setProductos, categorias } = useDespensa();
  const [busqueda, setBusqueda] = useState('');

  // Estado del modal (agregar / editar)
  const [modalVisible, setModalVisible] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nombre, setNombre] = useState('');
  const [cantidad, setCantidad] = useState('1');
  const [fecha, setFecha] = useState<Date>(new Date());
  const [categoriaSel, setCategoriaSel] = useState<string | null>(null);
  const [mostrarPicker, setMostrarPicker] = useState(false);
  const { nuevo } = useLocalSearchParams<{ nuevo?: string }>();

  const productosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return productos;
    return productos.filter((p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [busqueda, productos]);

  const nombreCategoria = (p: Producto) => {
    const valor = categoriaDe(p);
    if (!valor) return null;
    const cat = categorias.find((c: any) => c.id === valor || c.nombre === valor) as any;
    return cat?.nombre ?? null;
  };

  const abrirNuevo = () => {
    setEditandoId(null);
    setNombre('');
    setCantidad('1');
    setFecha(new Date());
    setCategoriaSel(null);
    setMostrarPicker(false);
    setModalVisible(true);
  };
  useEffect(() => {
    if (nuevo === '1') {
      abrirNuevo();
      router.setParams({ nuevo: '' });
    }
  }, [nuevo]);


  const abrirEditar = (p: Producto) => {
    setEditandoId(String(p.id));
    setNombre(p.nombre);
    setCantidad(String((p as any).cantidad ?? 1));
    setFecha(p.fechaCaducidad ? new Date(p.fechaCaducidad) : new Date());
    const valor = categoriaDe(p);
    const cat = categorias.find((c: any) => c.id === valor || c.nombre === valor);
    setCategoriaSel(cat ? idCategoria(cat) : null);
    setMostrarPicker(false);
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setMostrarPicker(false);
  };

  const ajustarCantidad = (delta: number) => {
    const actual = parseInt(cantidad, 10);
    const base = Number.isNaN(actual) ? 1 : actual;
    setCantidad(String(Math.max(1, base + delta)));
  };

  const guardar = () => {
    const nombreLimpio = nombre.trim();
    if (!nombreLimpio) {
      Alert.alert('Falta el nombre', 'Escribe el nombre del producto.');
      return;
    }

    const parsed = parseInt(cantidad, 10);
    const cantidadNum = Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;

    if (editandoId) {
      setProductos((prev) =>
        prev.map((p) =>
          String(p.id) === editandoId
            ? ({
              ...p,
              nombre: nombreLimpio,
              cantidad: cantidadNum,
              fechaCaducidad: fecha.toISOString(),
              categoria: categoriaSel ?? categoriaDe(p),
            } as Producto)
            : p
        )
      );
    } else {
      const nuevo = {
        id: Date.now().toString(),
        nombre: nombreLimpio,
        cantidad: cantidadNum,
        fechaCaducidad: fecha.toISOString(),
        categoria: categoriaSel ?? undefined,
      } as unknown as Producto;
      setProductos((prev) => [nuevo, ...prev]);
    }
    cerrarModal();
  };

  const confirmarEliminar = (p: Producto) => {
    const borrar = () => setProductos((prev) => prev.filter((x) => x.id !== p.id));

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(`¿Eliminar "${p.nombre}"?`)) {
        borrar();
      }
      return;
    }

    Alert.alert('Eliminar producto', `¿Seguro que quieres eliminar "${p.nombre}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: borrar },
    ]);
  };

  const onCambioFecha = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setMostrarPicker(false);
    if (event.type === 'set' && selected) setFecha(selected);
  };

  const renderItem = ({ item }: { item: Producto }) => {
    const dias = item.fechaCaducidad ? diasParaCaducar(item.fechaCaducidad) : null;
    let estado = '';
    let colorEstado: string = colors.inkMuted;

    if (dias !== null) {
      if (dias < 0) {
        estado = `Caducó hace ${Math.abs(dias)} d`;
        colorEstado = DANGER;
      } else if (dias === 0) {
        estado = 'Caduca hoy';
        colorEstado = DANGER;
      } else if (dias <= 3) {
        estado = `Caduca en ${dias} d`;
        colorEstado = WARNING;
      } else {
        estado = `Caduca en ${dias} d`;
      }
    }

    const cat = nombreCategoria(item);

    return (
      <Pressable style={styles.card} onPress={() => abrirEditar(item)}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>
            {item.nombre}
            {(item as any).cantidad ? `  ×${(item as any).cantidad}` : ''}
          </Text>
          {!!cat && <Text style={styles.cardCategory}>{cat}</Text>}
          <Text style={styles.cardDate}>{formatearFecha(item.fechaCaducidad)}</Text>
          {!!estado && <Text style={[styles.cardStatus, { color: colorEstado }]}>{estado}</Text>}
        </View>

        <Pressable style={styles.iconBtn} onPress={() => abrirEditar(item)} hitSlop={8}>
          <MaterialCommunityIcons name="pencil-outline" size={22} color={colors.inkMuted} />
        </Pressable>
        <Pressable style={styles.iconBtn} onPress={() => confirmarEliminar(item)} hitSlop={8}>
          <MaterialCommunityIcons name="trash-can-outline" size={22} color={DANGER} />
        </Pressable>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.content}>
        <ScreenHeader title="Productos" subtitle={`${productos.length} en tu despensa`} />

        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={20} color={colors.inkMuted} />
          <TextInput
            placeholder="Buscar producto"
            placeholderTextColor={colors.inkMuted}
            value={busqueda}
            onChangeText={setBusqueda}
            style={styles.searchInput}
          />
        </View>

        <FlatList
          data={productosFiltrados}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialCommunityIcons name="basket-off-outline" size={36} color={colors.inkMuted} />
              <Text style={styles.emptyText}>
                {busqueda.trim()
                  ? 'No encontramos productos con ese nombre'
                  : 'Aún no hay productos en tu despensa'}
              </Text>
            </View>
          }
        />
      </View>

      <Pressable style={styles.fab} onPress={abrirNuevo}>
        <MaterialCommunityIcons name="plus" size={26} color={colors.surface} />
      </Pressable>

      {/* Modal agregar / editar */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={cerrarModal}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable style={styles.modalBackdrop} onPress={cerrarModal} />
          <View style={styles.modalSheet}>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>
                {editandoId ? 'Editar producto' : 'Nuevo producto'}
              </Text>

              <Text style={styles.label}>Nombre</Text>
              <TextInput
                placeholder="Ej. Leche"
                placeholderTextColor={colors.inkMuted}
                value={nombre}
                onChangeText={setNombre}
                style={styles.input}
              />

              <Text style={styles.label}>Cantidad</Text>
              <View style={styles.qtyRow}>
                <Pressable style={styles.qtyBtn} onPress={() => ajustarCantidad(-1)}>
                  <MaterialCommunityIcons name="minus" size={22} color={colors.ink} />
                </Pressable>
                <TextInput
                  value={cantidad}
                  onChangeText={(t) => setCantidad(t.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                  placeholder="1"
                  placeholderTextColor={colors.inkMuted}
                  style={[styles.input, styles.qtyInput]}
                />
                <Pressable style={styles.qtyBtn} onPress={() => ajustarCantidad(1)}>
                  <MaterialCommunityIcons name="plus" size={22} color={colors.ink} />
                </Pressable>
              </View>

              <Text style={styles.label}>Categoría</Text>
              <View style={styles.chips}>
                {categorias.map((c: any) => {
                  const id = idCategoria(c);
                  const activa = categoriaSel === id;
                  return (
                    <Pressable
                      key={id}
                      style={[styles.chip, activa && styles.chipActive]}
                      onPress={() => setCategoriaSel(activa ? null : id)}
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
                <Text style={styles.dateText}>{formatearFecha(fecha.toISOString())}</Text>
              </Pressable>

              {mostrarPicker && (
                <DateTimePicker
                  value={fecha}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onCambioFecha}
                />
              )}

              <View style={styles.modalActions}>
                <Pressable style={[styles.btn, styles.btnGhost]} onPress={cerrarModal}>
                  <Text style={[styles.btnText, { color: colors.ink }]}>Cancelar</Text>
                </Pressable>
                <Pressable style={[styles.btn, styles.btnPrimary]} onPress={guardar}>
                  <Text style={[styles.btnText, { color: colors.surface }]}>
                    {editandoId ? 'Guardar' : 'Agregar'}
                  </Text>
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    ...type.body,
    color: colors.ink,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    ...type.body,
    color: colors.ink,
    fontWeight: '600',
  },
  cardCategory: {
    ...type.body,
    fontSize: 12,
    color: colors.secondary,
  },
  cardDate: {
    ...type.body,
    color: colors.inkMuted,
    fontSize: 13,
  },
  cardStatus: {
    ...type.body,
    fontSize: 12,
    fontWeight: '600',
  },
  iconBtn: {
    padding: 6,
    marginLeft: 4,
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
    maxHeight: '90%',
  },
  modalTitle: {
    ...type.body,
    fontSize: 20,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 16,
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