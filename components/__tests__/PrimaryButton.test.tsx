import { fireEvent, render, screen } from '@testing-library/react-native';
import { PrimaryButton } from '@/components/PrimaryButton';

describe('PrimaryButton', () => {
  it('expone etiqueta accesible y ejecuta la acción', async () => {
    const onPress = jest.fn();
    await render(<PrimaryButton label="Guardar" onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Guardar' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('no ejecuta la acción cuando está deshabilitado', async () => {
    const onPress = jest.fn();
    await render(<PrimaryButton label="Guardar" onPress={onPress} disabled />);

    await fireEvent.press(screen.getByRole('button', { name: 'Guardar' }));
    expect(onPress).not.toHaveBeenCalled();
  });
});
