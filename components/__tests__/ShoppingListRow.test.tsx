import { fireEvent, render, screen } from '@testing-library/react-native';
import { ShoppingListRow } from '@/components/ShoppingListRow';
import type { ItemCompra } from '@/theme/types';

const item: ItemCompra = {
  id: 'item-1',
  nombre: 'Huevos',
  cantidad: '1 docena',
  comprado: false,
};

describe('ShoppingListRow', () => {
  it('invoca las acciones con el elemento correspondiente', async () => {
    const onToggle = jest.fn();
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    await render(
      <ShoppingListRow item={item} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />,
    );

    await fireEvent.press(screen.getByRole('checkbox', { name: 'Huevos, pendiente' }));
    const botonesEditar = screen.getAllByRole('button', { name: 'Editar Huevos' });
    await fireEvent.press(botonesEditar[0]);
    await fireEvent.press(botonesEditar[1]);
    await fireEvent.press(screen.getByRole('button', { name: 'Eliminar Huevos' }));

    expect(onToggle).toHaveBeenCalledWith(item);
    expect(onEdit).toHaveBeenCalledTimes(2);
    expect(onEdit).toHaveBeenNthCalledWith(1, item);
    expect(onEdit).toHaveBeenNthCalledWith(2, item);
    expect(onDelete).toHaveBeenCalledWith(item);
  });
});
