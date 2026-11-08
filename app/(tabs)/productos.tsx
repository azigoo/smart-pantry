import { ScreenHeader } from '@/components/ScreenHeader';
import { InventoryProductRow } from '@/components/InventoryProductRow';
import { InventoryProductList } from '@/components/productos/InventoryProductList';
import { ProductoFormModal } from '@/components/productos/ProductoFormModal';
import { styles } from '@/components/productos/productosStyles';
import { useDespensa, type Producto } from '@/context/DespensaContext';
import { ErrorMessage } from '@/components/ErrorMessage';
import { colors } from '@/theme/colors';
import { getCategoria } from '@/theme/categoryIcons';
import { aClave, desdeClave } from '@/theme/fechaLocal';
import type { CategoryId } from '@/theme/types';
import { validarNuevoProducto } from '@/theme/validators';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const formatearFecha = (clave?: string) => {
  if (!clave) return 'Sin fecha';
  return desdeClave(clave).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export default function ProductosScreen() {
  const { productos, setProductos, categorias, setListaCompras, errorDatos, cargandoDatos } =
    useDespensa();
  const { nuevo } = useLocalSearchParams<{ nuevo?: string }>();
  const [busqueda, setBusqueda] = useState('');

  // Estado del modal (agregar / editar)
  const [modalVisible, setModalVisible] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nombre, setNombre] = useState('');
  const [cantidad, setCantidad] = useState('1');
  const [unidad, setUnidad] = useState<string>('pzas');
  const [fecha, setFecha] = useState<Date>(new Date());
  const [categoriaSel, setCategoriaSel] = useState<CategoryId | null>(null);
  const [mostrarPicker, setMostrarPicker] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState<string | null>(null);
  const [mensajeGuardado, setMensajeGuardado] = useState<string | null>(null);

  const productosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return productos;
    return productos.filter((p) => p.nombre.toLowerCase().includes(busqueda.toLowerCase()));
  }, [busqueda, productos]);

  const nombreCategoria = useCallback(
    (p: Producto) => (p.categoria ? getCategoria(p.categoria).nombre : null),
    [],
  );

  const abrirNuevo = useCallback(() => {
    setEditandoId(null);
    setNombre('');
    setCantidad('1');
    setUnidad('pzas');
    setFecha(new Date());
    setCategoriaSel(null);
    setMostrarPicker(false);
    setErrorFormulario(null);
    setMensajeGuardado(null);
    setModalVisible(true);
  }, []);

  useEffect(() => {
    if (nuevo === '1') {
      const task = setTimeout(() => {
        abrirNuevo();
        router.setParams({ nuevo: '' });
      }, 0);
      return () => clearTimeout(task);
    }
    return undefined;
  }, [abrirNuevo, nuevo]);

  const abrirEditar = useCallback((p: Producto) => {
    setEditandoId(String(p.id));
    setNombre(p.nombre);
    setCantidad(String(p.cantidad));
    setUnidad(p.unidad);
    setFecha(p.fechaCaducidad ? desdeClave(p.fechaCaducidad) : new Date());
    setCategoriaSel(p.categoria ?? null);
    setMostrarPicker(false);
    setErrorFormulario(null);
    setMensajeGuardado(null);
    setModalVisible(true);
  }, []);

  const cerrarModal = useCallback(() => {
    setModalVisible(false);
    setMostrarPicker(false);
  }, []);

  const ajustarCantidad = useCallback(
    (delta: number) => {
      const actual = parseInt(cantidad, 10);
      const base = Number.isNaN(actual) ? 1 : actual;
      setCantidad(String(Math.max(1, base + delta)));
    },
    [cantidad],
  );

  const guardar = useCallback(() => {
    const fechaTexto = aClave(fecha).split('-').reverse().join('/');
    const validacion = validarNuevoProducto({ nombre, cantidad, fecha: fechaTexto });
    if (!validacion.valido) {
      setErrorFormulario(validacion.errores.join(' '));
      return;
    }

    setErrorFormulario(null);
    const nombreLimpio = nombre.trim();
    const cantidadNum = Number(cantidad);

    if (editandoId) {
      setProductos((prev) =>
        prev.map((p) =>
          String(p.id) === editandoId
            ? {
                ...p,
                nombre: nombreLimpio,
                cantidad: cantidadNum,
                unidad,
                fechaCaducidad: aClave(fecha),
                categoria: categoriaSel ?? p.categoria,
              }
            : p,
        ),
      );
    } else {
      const nuevoProducto = {
        id: Date.now().toString(),
        nombre: nombreLimpio,
        cantidad: cantidadNum,
        unidad,
        fechaCaducidad: aClave(fecha),
        categoria: categoriaSel ?? undefined,
      };
      setProductos((prev) => [nuevoProducto, ...prev]);
    }
    setMensajeGuardado(
      editandoId
        ? 'Producto actualizado. Sincronizando tus cambios.'
        : 'Producto agregado. Sincronizando tus cambios.',
    );
    cerrarModal();
  }, [cantidad, categoriaSel, cerrarModal, editandoId, fecha, nombre, setProductos, unidad]);

  const confirmarEliminar = useCallback(
    (p: Producto) => {
      const borrar = () => {
        setProductos((prev) => prev.filter((x) => x.id !== p.id));
        setMensajeGuardado('Producto eliminado. Sincronizando tus cambios.');
      };

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
    },
    [setProductos],
  );

  const seAcabo = useCallback(
    (p: Producto) => {
      const mover = () => {
        setListaCompras((prev) => {
          const yaEsta = prev.some(
            (i) => !i.comprado && i.nombre.trim().toLowerCase() === p.nombre.trim().toLowerCase(),
          );
          if (yaEsta) return prev;
          return [
            {
              id: Date.now().toString(),
              nombre: p.nombre,
              cantidad: String(p.cantidad),
              unidad: p.unidad,
              comprado: false,
              categoria: p.categoria,
            },
            ...prev,
          ];
        });
        setProductos((prev) => prev.filter((x) => x.id !== p.id));
        setMensajeGuardado('Producto movido a la lista de compras.');
      };

      if (Platform.OS === 'web') {
        if (
          typeof window !== 'undefined' &&
          window.confirm(`"${p.nombre}" se acabó. ¿Pasarlo a la lista de compras?`)
        ) {
          mover();
        }
        return;
      }

      Alert.alert('Se acabó', `¿Pasar "${p.nombre}" a la lista de compras?`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Pasar a compras', onPress: mover },
      ]);
    },
    [setListaCompras, setProductos],
  );

  const onCambioFecha = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setMostrarPicker(false);
    if (event.type === 'set' && selected) setFecha(selected);
  };

  const renderItem = useCallback(
    ({ item }: { item: Producto }) => (
      <InventoryProductRow
        producto={item}
        nombreCategoria={nombreCategoria(item)}
        onEditar={abrirEditar}
        onSeAcabo={seAcabo}
        onEliminar={confirmarEliminar}
      />
    ),
    [abrirEditar, confirmarEliminar, nombreCategoria, seAcabo],
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.content}>
        <ScreenHeader title="Productos" subtitle={`${productos.length} en tu despensa`} />
        <ErrorMessage mensaje={errorDatos} />
        <ErrorMessage mensaje={mensajeGuardado} tipo="exito" />

        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={20} color={colors.inkMuted} />
          <TextInput
            placeholder="Buscar producto"
            placeholderTextColor={colors.inkMuted}
            value={busqueda}
            onChangeText={setBusqueda}
            accessibilityLabel="Buscar producto"
            style={styles.searchInput}
          />
        </View>

        <InventoryProductList
          productos={productosFiltrados}
          cargando={cargandoDatos}
          error={errorDatos}
          busqueda={busqueda}
          renderItem={renderItem}
        />
      </View>

      <Pressable
        style={styles.fab}
        onPress={abrirNuevo}
        accessibilityRole="button"
        accessibilityLabel="Agregar producto"
      >
        <MaterialCommunityIcons name="plus" size={26} color={colors.surface} accessible={false} />
      </Pressable>

      <ProductoFormModal
        visible={modalVisible}
        editando={Boolean(editandoId)}
        nombre={nombre}
        cantidad={cantidad}
        unidad={unidad}
        fecha={fecha}
        categoria={categoriaSel}
        mostrarPicker={mostrarPicker}
        categorias={categorias}
        error={errorFormulario}
        onClose={cerrarModal}
        onNombreChange={setNombre}
        onCantidadChange={setCantidad}
        onUnidadChange={setUnidad}
        onCategoriaChange={setCategoriaSel}
        onMostrarPickerChange={setMostrarPicker}
        onCambioFecha={onCambioFecha}
        onAjustarCantidad={ajustarCantidad}
        onGuardar={guardar}
        formatearFecha={formatearFecha}
      />
    </SafeAreaView>
  );
}
