import { colors } from '@/theme/colors';
import { aClave } from '@/theme/fechaLocal';
import { createElement, type ChangeEvent } from 'react';
import { Alert, Platform } from 'react-native';
import type DateTimePicker from '@react-native-community/datetimepicker';

type NativeDatePicker = typeof DateTimePicker;

let nativeDatePicker: NativeDatePicker | null = null;

type SelectorFechaProps = {
  visible: boolean;
  value: Date;
  accessibilityLabel: string;
  onChange: (fecha?: Date) => void;
  onClose: () => void;
};

export function esWeb(): boolean {
  return Platform.OS === 'web';
}

export function esAndroid(): boolean {
  return Platform.OS === 'android';
}

export function comportamientoTeclado(): 'padding' | undefined {
  return Platform.OS === 'ios' ? 'padding' : undefined;
}

export function modoSelectorFecha(): 'spinner' | 'default' {
  return Platform.OS === 'ios' ? 'spinner' : 'default';
}

export function fechaDesdeEntradaWeb(valor: string): Date | undefined {
  const partes = valor.split('-').map(Number);
  if (partes.length !== 3 || partes.some((parte) => !Number.isInteger(parte))) return undefined;

  const [anio, mes, dia] = partes;
  const fecha = new Date(anio, mes - 1, dia);
  if (fecha.getFullYear() !== anio || fecha.getMonth() !== mes - 1 || fecha.getDate() !== dia) {
    return undefined;
  }
  return fecha;
}

export function notificacionesDisponiblesEnPlataforma(appOwnership: string | null): boolean {
  return !esWeb() && !(esAndroid() && appOwnership === 'expo');
}

function cargarSelectorFechaNativo(): NativeDatePicker {
  if (!nativeDatePicker) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const modulo: typeof import('@react-native-community/datetimepicker') = require('@react-native-community/datetimepicker');
    nativeDatePicker = modulo.default;
  }
  return nativeDatePicker;
}

export function SelectorFechaPlataforma({
  visible,
  value,
  accessibilityLabel,
  onChange,
  onClose,
}: SelectorFechaProps) {
  if (!visible) return null;

  if (esWeb()) {
    return createElement('input', {
      type: 'date',
      value: aClave(value),
      'aria-label': accessibilityLabel,
      onChange: (event: ChangeEvent<HTMLInputElement>) => {
        const fecha = fechaDesdeEntradaWeb(event.currentTarget.value);
        if (!fecha) return;
        onChange(fecha);
        onClose();
      },
      style: {
        minHeight: 44,
        padding: '0 12px',
        border: `1px solid ${colors.border}`,
        borderRadius: 14,
        backgroundColor: colors.surface,
        color: colors.ink,
        fontSize: 16,
      },
    });
  }

  const NativeDateTimePicker = cargarSelectorFechaNativo();
  return (
    <NativeDateTimePicker
      value={value}
      mode="date"
      display={modoSelectorFecha()}
      onChange={(event, fecha) => {
        if (event.type === 'set' && fecha) onChange(fecha);
        if (event.type === 'dismissed' || esAndroid()) onClose();
      }}
    />
  );
}

export function mostrarAviso(titulo: string, mensaje: string): void {
  if (esWeb()) {
    if (typeof window !== 'undefined') window.alert(`${titulo}\n${mensaje}`);
    return;
  }
  Alert.alert(titulo, mensaje);
}

export function confirmarAccion(
  titulo: string,
  mensaje: string,
  textoAccion: string,
  onConfirmar: () => void,
  estiloAccion: 'default' | 'destructive' = 'destructive',
): void {
  if (esWeb()) {
    if (typeof window !== 'undefined' && window.confirm(`${titulo}\n${mensaje}`)) {
      onConfirmar();
    }
    return;
  }
  Alert.alert(titulo, mensaje, [
    { text: 'Cancelar', style: 'cancel' },
    { text: textoAccion, style: estiloAccion, onPress: onConfirmar },
  ]);
}
