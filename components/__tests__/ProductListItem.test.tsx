import { fireEvent, render, screen } from '@testing-library/react-native';
import { ProductListItem } from '@/components/ProductListItem';
import type { Producto } from '@/theme/types';

const producto: Producto = {
  id: 'producto-1',
  nombre: 'Leche',
  categoria: 'lacteos',
  cantidad: 2,
  unidad: 'pzas',
  fechaCaducidad: '2099-12-31',
};

describe('ProductListItem', () => {
  it('muestra el producto y activa su acción accesible', async () => {
    const onPress = jest.fn();
    await render(<ProductListItem producto={producto} onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Leche, 2 pzas, caduca 31/12/2099' }));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Leche')).toBeTruthy();
  });
});
