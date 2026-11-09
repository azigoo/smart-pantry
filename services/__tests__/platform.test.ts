const mockNativeDatePicker = jest.fn(() => null);

jest.mock('@react-native-community/datetimepicker', () => ({
  __esModule: true,
  default: mockNativeDatePicker,
}));

import { Alert, Platform } from 'react-native';
import { isValidElement } from 'react';
import type { ChangeEvent } from 'react';
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import {
  comportamientoTeclado,
  confirmarAccion,
  esAndroid,
  esWeb,
  fechaDesdeEntradaWeb,
  modoSelectorFecha,
  mostrarAviso,
  notificacionesDisponiblesEnPlataforma,
  SelectorFechaPlataforma,
} from '@/services/platform';

const platformDescriptor = Object.getOwnPropertyDescriptor(Platform, 'OS');
const windowDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');

function establecerPlataforma(os: 'android' | 'ios' | 'web') {
  Object.defineProperty(Platform, 'OS', { configurable: true, writable: true, value: os });
}

function restaurarWindow() {
  if (windowDescriptor) {
    Object.defineProperty(globalThis, 'window', windowDescriptor);
  } else {
    Reflect.deleteProperty(globalThis, 'window');
  }
}

describe('servicio de plataforma', () => {
  afterEach(() => {
    if (platformDescriptor) Object.defineProperty(Platform, 'OS', platformDescriptor);
    restaurarWindow();
    jest.restoreAllMocks();
  });

  it('selecciona comportamiento de teclado y fecha de acuerdo con la plataforma', () => {
    establecerPlataforma('ios');
    expect(comportamientoTeclado()).toBe('padding');
    expect(modoSelectorFecha()).toBe('spinner');

    establecerPlataforma('android');
    expect(comportamientoTeclado()).toBeUndefined();
    expect(modoSelectorFecha()).toBe('default');
    expect(esAndroid()).toBe(true);
  });

  it('limita notificaciones en web y en Expo Go para Android', () => {
    establecerPlataforma('web');
    expect(esWeb()).toBe(true);
    expect(notificacionesDisponiblesEnPlataforma('standalone')).toBe(false);

    establecerPlataforma('android');
    expect(notificacionesDisponiblesEnPlataforma('expo')).toBe(false);
    expect(notificacionesDisponiblesEnPlataforma('standalone')).toBe(true);

    establecerPlataforma('ios');
    expect(notificacionesDisponiblesEnPlataforma('expo')).toBe(true);
  });

  it('adapta las fechas web a medianoche local y rechaza valores inválidos', () => {
    const fecha = fechaDesdeEntradaWeb('2026-03-04');
    expect(fecha).toBeInstanceOf(Date);
    expect([fecha?.getFullYear(), fecha?.getMonth(), fecha?.getDate()]).toEqual([2026, 2, 4]);
    expect(fechaDesdeEntradaWeb('2026-02-31')).toBeUndefined();
    expect(fechaDesdeEntradaWeb('')).toBeUndefined();
  });

  it('usa un input de fecha accesible en web y omite controles ocultos', () => {
    establecerPlataforma('web');
    const props = {
      visible: true,
      value: new Date(2026, 2, 4),
      accessibilityLabel: 'Fecha de caducidad',
      onChange: jest.fn(),
      onClose: jest.fn(),
    };
    const selector = SelectorFechaPlataforma(props);
    type InputFechaProps = {
      value: string;
      'aria-label': string;
      onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    };
    if (!isValidElement<InputFechaProps>(selector)) {
      throw new Error('El selector web debe renderizar un input de fecha.');
    }
    expect(selector.type).toBe('input');
    expect(selector.props.value).toBe('2026-03-04');
    expect(selector.props['aria-label']).toBe('Fecha de caducidad');
    const onChange = jest.fn();
    const onClose = jest.fn();
    const selectorConCallbacks = SelectorFechaPlataforma({ ...props, onChange, onClose });
    if (!isValidElement<InputFechaProps>(selectorConCallbacks)) {
      throw new Error('El selector web debe renderizar un input de fecha.');
    }
    selectorConCallbacks.props.onChange({
      currentTarget: { value: '2026-03-05' },
    } as ChangeEvent<HTMLInputElement>);
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 2, 5));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(SelectorFechaPlataforma({ ...props, visible: false })).toBeNull();
  });

  it('adapta el selector nativo y cierra Android al seleccionar o cancelar', () => {
    type SelectorNativoProps = {
      display: 'spinner' | 'default';
      onChange: (event: DateTimePickerEvent, fecha?: Date) => void;
    };
    const fecha = new Date(2026, 2, 5);
    const onChange = jest.fn();
    const onClose = jest.fn();

    establecerPlataforma('ios');
    const iosSelector = SelectorFechaPlataforma({
      visible: true,
      value: fecha,
      accessibilityLabel: 'Fecha',
      onChange,
      onClose,
    });
    if (!isValidElement<SelectorNativoProps>(iosSelector)) {
      throw new Error('Se esperaba el selector de fecha nativo.');
    }
    expect(iosSelector.type).toBe(mockNativeDatePicker);
    expect(iosSelector.props.display).toBe('spinner');
    iosSelector.props.onChange({ type: 'set', nativeEvent: { timestamp: 0, utcOffset: 0 } }, fecha);
    expect(onChange).toHaveBeenCalledWith(fecha);
    expect(onClose).not.toHaveBeenCalled();

    establecerPlataforma('android');
    const androidSelector = SelectorFechaPlataforma({
      visible: true,
      value: fecha,
      accessibilityLabel: 'Fecha',
      onChange,
      onClose,
    });
    if (!isValidElement<SelectorNativoProps>(androidSelector)) {
      throw new Error('Se esperaba el selector de fecha nativo.');
    }
    expect(androidSelector.props.display).toBe('default');
    androidSelector.props.onChange(
      { type: 'dismissed', nativeEvent: { timestamp: 0, utcOffset: 0 } },
      undefined,
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('muestra avisos y ejecuta confirmaciones web solo si se aceptan', () => {
    establecerPlataforma('web');
    const alert = jest.fn();
    const confirm = jest.fn().mockReturnValueOnce(true).mockReturnValueOnce(false);
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: { alert, confirm },
    });

    mostrarAviso('Aviso', 'Mensaje');
    const onConfirmar = jest.fn();
    confirmarAccion('Confirmar', '¿Continuar?', 'Sí', onConfirmar);
    confirmarAccion('Confirmar', '¿Continuar?', 'Sí', onConfirmar);

    expect(alert).toHaveBeenCalledWith('Aviso\nMensaje');
    expect(confirm).toHaveBeenCalledTimes(2);
    expect(onConfirmar).toHaveBeenCalledTimes(1);
  });

  it('usa Alert nativo y conserva el estilo de la acción', () => {
    establecerPlataforma('ios');
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    const onConfirmar = jest.fn();

    mostrarAviso('Aviso', 'Mensaje');
    confirmarAccion('Confirmar', '¿Continuar?', 'Continuar', onConfirmar, 'default');

    expect(alert).toHaveBeenCalledTimes(2);
    const botones = alert.mock.calls[1][2];
    expect(botones?.[1].style).toBe('default');
    botones?.[1].onPress?.();
    expect(onConfirmar).toHaveBeenCalledTimes(1);
  });
});
