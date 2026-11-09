import { fireEvent, render, screen } from '@testing-library/react-native';
import { TextField } from '@/components/TextField';

describe('TextField', () => {
  it('muestra etiqueta, placeholder y comunica cambios de texto', async () => {
    const onChangeText = jest.fn();
    await render(
      <TextField label="Nombre" placeholder="Tu nombre" value="Ana" onChangeText={onChangeText} />,
    );

    expect(screen.getByLabelText('Nombre').props.value).toBe('Ana');
    await fireEvent.changeText(screen.getByLabelText('Nombre'), 'Ana María');
    expect(onChangeText).toHaveBeenCalledWith('Ana María');
  });

  it('permite alternar la visibilidad de una contraseña', async () => {
    await render(<TextField label="Contraseña" secureTextEntry />);

    const input = screen.getByLabelText('Contraseña');
    expect(input.props.secureTextEntry).toBe(true);

    await fireEvent.press(screen.getByRole('button', { name: 'Mostrar contraseña' }));
    expect(input.props.secureTextEntry).toBe(false);

    await fireEvent.press(screen.getByRole('button', { name: 'Ocultar contraseña' }));
    expect(input.props.secureTextEntry).toBe(true);
  });
});
