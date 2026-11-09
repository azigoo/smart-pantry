import { ScreenHeader } from '@/components/ScreenHeader';
import { ErrorMessage } from '@/components/ErrorMessage';
import { ShoppingListRow } from '@/components/ShoppingListRow';
import { ShoppingListActions } from '@/components/compras/ShoppingListActions';
import { ShoppingItemsList } from '@/components/compras/ShoppingItemsList';
import { PurchaseToPantryDialog, ShoppingEditDialog } from '@/components/compras/ShoppingDialogs';
import { styles } from '@/components/compras/shoppingStyles';
import { useDespensa, type Producto } from '@/context/DespensaContext';
import { aClave } from '@/theme/fechaLocal';
import type { CategoryId, ItemCompra } from '@/theme/types';
import { validarItemCompra, validarNuevoProducto } from '@/theme/validators';
import { confirmarAccion } from '@/services/platform';
import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const formatearFecha = (d: Date) =>
  d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });

export default function ListaComprasScreen() {
  const {
    listaCompras: items,
    setListaCompras: setItems,
    setProductos,
    categorias,
    errorDatos,
    cargandoDatos,
  } = useDespensa();
  const [nuevo, setNuevo] = useState('');
  const [errorFormulario, setErrorFormulario] = useState<string | null>(null);
  const [mensajeGuardado, setMensajeGuardado] = useState<string | null>(null);

  // Modal de edición
  const [modalVisible, setModalVisible] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editCantidad, setEditCantidad] = useState('1');

  // Modal de "comprado → despensa"
  const [compraItem, setCompraItem] = useState<ItemCompra | null>(null);
  const [compraCantidad, setCompraCantidad] = useState('1');
  const [compraFecha, setCompraFecha] = useState<Date>(new Date());
  const [compraCat, setCompraCat] = useState<CategoryId | null>(null);
  const [mostrarPicker, setMostrarPicker] = useState(false);

  const { pendientes, comprados, itemsOrdenados } = useMemo(() => {
    const pendientes = items.reduce((total, item) => total + Number(!item.comprado), 0);
    return {
      pendientes,
      comprados: items.length - pendientes,
      itemsOrdenados: [...items].sort((a, b) => Number(a.comprado) - Number(b.comprado)),
    };
  }, [items]);

  const marcarComprado = useCallback(
    (id: string, valor: boolean) => {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, comprado: valor } : i)));
      setMensajeGuardado(
        valor ? 'Artículo marcado como comprado.' : 'Artículo marcado como pendiente.',
      );
    },
    [setItems],
  );

  // Al marcar como comprado se ofrece pasarlo a la despensa; al desmarcar solo se revierte
  const toggleItem = useCallback(
    (item: ItemCompra) => {
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
      setCompraCat(item.categoria ?? null);
      setMostrarPicker(false);
      setMensajeGuardado(null);
    },
    [marcarComprado],
  );

  function cerrarCompra() {
    setCompraItem(null);
    setMostrarPicker(false);
    setErrorFormulario(null);
  }

  function soloMarcar() {
    if (compraItem) marcarComprado(compraItem.id, true);
    cerrarCompra();
  }

  function agregarADespensa() {
    if (!compraItem) return;
    const validacion = validarNuevoProducto({
      nombre: compraItem.nombre,
      cantidad: compraCantidad,
      fecha: aClave(compraFecha).split('-').reverse().join('/'),
    });
    if (!validacion.valido) {
      setErrorFormulario(validacion.errores.join(' '));
      return;
    }
    setErrorFormulario(null);
    const cantidad = Number(compraCantidad);

    const producto: Producto = {
      id: Date.now().toString(),
      nombre: compraItem.nombre,
      cantidad,
      unidad: compraItem.unidad ?? 'pzas',
      fechaCaducidad: aClave(compraFecha),
      categoria: compraCat ?? compraItem.categoria,
    };

    setProductos((prev) => [producto, ...prev]);
    marcarComprado(compraItem.id, true);
    setMensajeGuardado('Producto agregado a tu despensa. Sincronizando tus cambios.');
    cerrarCompra();
  }

  function ajustarCompra(delta: number) {
    const actual = parseInt(compraCantidad, 10);
    const base = Number.isNaN(actual) ? 1 : actual;
    setCompraCantidad(String(Math.max(1, base + delta)));
  }

  const onCambioFecha = (fecha?: Date) => {
    if (fecha) setCompraFecha(fecha);
  };

  function agregarItem() {
    const nombre = nuevo.trim();
    const validacion = validarItemCompra({ nombre, cantidad: '1' });
    if (!validacion.valido) {
      setErrorFormulario(validacion.errores.join(' '));
      return;
    }
    setErrorFormulario(null);
    setItems((prev) => [
      { id: Date.now().toString(), nombre, cantidad: '1', comprado: false },
      ...prev,
    ]);
    setNuevo('');
    setMensajeGuardado('Artículo agregado a tu lista. Sincronizando tus cambios.');
  }

  const eliminarItem = useCallback(
    (item: ItemCompra) => {
      confirmarAccion(
        'Eliminar producto',
        `¿Quitar "${item.nombre}" de la lista?`,
        'Eliminar',
        () => {
          setItems((prev) => prev.filter((i) => i.id !== item.id));
          setMensajeGuardado('Artículo eliminado de la lista. Sincronizando tus cambios.');
        },
      );
    },
    [setItems],
  );

  function limpiarComprados() {
    confirmarAccion(
      'Limpiar comprados',
      `¿Eliminar los ${comprados} productos ya comprados?`,
      'Limpiar',
      () => {
        setItems((prev) => prev.filter((i) => !i.comprado));
        setMensajeGuardado('Se eliminaron los artículos comprados. Sincronizando tus cambios.');
      },
    );
  }

  const abrirEditar = useCallback((item: ItemCompra) => {
    setEditandoId(item.id);
    setEditNombre(item.nombre);
    setEditCantidad(String(item.cantidad ?? '1'));
    setErrorFormulario(null);
    setModalVisible(true);
    setMensajeGuardado(null);
  }, []);

  function cerrarModal() {
    setModalVisible(false);
    setEditandoId(null);
    setErrorFormulario(null);
  }

  function guardarEdicion() {
    const validacion = validarItemCompra({ nombre: editNombre, cantidad: editCantidad });
    if (!validacion.valido) {
      setErrorFormulario(validacion.errores.join(' '));
      return;
    }
    setErrorFormulario(null);
    const nombre = editNombre.trim();
    const cantidad = editCantidad.trim();
    setItems((prev) => prev.map((i) => (i.id === editandoId ? { ...i, nombre, cantidad } : i)));
    setMensajeGuardado('Artículo actualizado. Sincronizando tus cambios.');
    cerrarModal();
  }

  // Botones +/- (funcionan cuando la cantidad es un número)
  function ajustarCantidad(delta: number) {
    const actual = parseInt(editCantidad, 10);
    const base = Number.isNaN(actual) ? 1 : actual;
    setEditCantidad(String(Math.max(1, base + delta)));
  }

  const renderItem = useCallback(
    ({ item }: { item: ItemCompra }) => (
      <ShoppingListRow
        item={item}
        onToggle={toggleItem}
        onEdit={abrirEditar}
        onDelete={eliminarItem}
      />
    ),
    [abrirEditar, eliminarItem, toggleItem],
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.content}>
        <ScreenHeader title="Lista de compras" subtitle={`${pendientes} productos pendientes`} />
        <ErrorMessage mensaje={errorDatos} />
        <ErrorMessage mensaje={errorFormulario} />
        <ErrorMessage mensaje={mensajeGuardado} tipo="exito" />

        <ShoppingListActions
          nombre={nuevo}
          articulosComprados={comprados}
          onNombreChange={setNuevo}
          onAgregar={agregarItem}
          onLimpiarComprados={limpiarComprados}
        />

        <ShoppingItemsList
          items={itemsOrdenados}
          cargando={cargandoDatos}
          error={errorDatos}
          renderItem={renderItem}
        />
      </View>

      <ShoppingEditDialog
        visible={modalVisible}
        nombre={editNombre}
        cantidad={editCantidad}
        error={errorFormulario}
        onClose={cerrarModal}
        onNombreChange={setEditNombre}
        onCantidadChange={setEditCantidad}
        onAjustarCantidad={ajustarCantidad}
        onGuardar={guardarEdicion}
      />
      <PurchaseToPantryDialog
        item={compraItem}
        cantidad={compraCantidad}
        fecha={compraFecha}
        categoria={compraCat}
        mostrarPicker={mostrarPicker}
        categorias={categorias}
        error={errorFormulario}
        onClose={cerrarCompra}
        onCantidadChange={setCompraCantidad}
        onAjustarCantidad={ajustarCompra}
        onCategoriaChange={setCompraCat}
        onMostrarPickerChange={setMostrarPicker}
        onCambioFecha={onCambioFecha}
        onSoloMarcar={soloMarcar}
        onAgregar={agregarADespensa}
        formatearFecha={formatearFecha}
      />
    </SafeAreaView>
  );
}
