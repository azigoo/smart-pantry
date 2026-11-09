const mockNotificationApi = {
  AndroidImportance: { HIGH: 4 },
  SchedulableTriggerInputTypes: { DATE: 'date', TIME_INTERVAL: 'timeInterval' },
  cancelAllScheduledNotificationsAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
};

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { appOwnership: 'standalone' },
}));

jest.mock('expo-notifications', () => mockNotificationApi);

import { programarAvisos, enviarAvisoDePrueba } from '@/services/notificaciones';

describe('servicio de notificaciones', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 1, 1, 12));
    jest.clearAllMocks();
    mockNotificationApi.getPermissionsAsync.mockResolvedValue({ granted: true });
    mockNotificationApi.requestPermissionsAsync.mockResolvedValue({ granted: true });
    mockNotificationApi.scheduleNotificationAsync.mockResolvedValue('notification-id');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('cancela avisos anteriores y programa el aviso más cercano permitido', async () => {
    await programarAvisos(
      [
        { id: '1', nombre: 'Leche', fechaCaducidad: '2026-02-05T00:00:00' },
        { id: '2', nombre: 'Arroz', fechaCaducidad: 'fecha-inválida' },
      ],
      3,
    );

    expect(mockNotificationApi.cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
    expect(mockNotificationApi.getPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(mockNotificationApi.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
    expect(mockNotificationApi.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: { title: 'Por caducar', body: 'Leche caduca en 3 días' },
        trigger: expect.objectContaining({
          type: 'date',
          date: new Date(2026, 1, 2, 9),
        }),
      }),
    );
  });

  it('no programa avisos cuando el usuario no concede permisos', async () => {
    mockNotificationApi.getPermissionsAsync.mockResolvedValue({ granted: false });
    mockNotificationApi.requestPermissionsAsync.mockResolvedValue({ granted: false });

    await programarAvisos([{ id: '1', nombre: 'Leche', fechaCaducidad: '2026-02-05T00:00:00' }], 3);

    expect(mockNotificationApi.requestPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(mockNotificationApi.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('devuelve true al programar el aviso de prueba', async () => {
    await expect(enviarAvisoDePrueba()).resolves.toBe(true);
    expect(mockNotificationApi.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: { title: 'Por caducar', body: 'Así se verán tus avisos de caducidad' },
        trigger: expect.objectContaining({ type: 'timeInterval', seconds: 5 }),
      }),
    );
  });
});
