import { useComprasStore } from '../../stores/compras.store';

// In-memory store that simulates PocketBase behavior (full record on create/update)
const pbRecords = {};

jest.mock('../../lib/pocketbase', () => ({
  __esModule: true,
  default: {
    collection: jest.fn().mockReturnValue({
      create: jest.fn((data) => {
        const id = 'rec_' + Date.now();
        pbRecords[id] = { id, ...data };
        return Promise.resolve(pbRecords[id]);
      }),
      update: jest.fn((id, data) => {
        pbRecords[id] = { ...(pbRecords[id] || {}), id, ...data };
        return Promise.resolve(pbRecords[id]);
      }),
      delete: jest.fn((id) => {
        delete pbRecords[id];
        return Promise.resolve(true);
      }),
      getList: jest.fn(() => Promise.resolve({ items: Object.values(pbRecords), totalItems: Object.keys(pbRecords).length })),
      getOne: jest.fn((id) => Promise.resolve(pbRecords[id] || null)),
      getFullList: jest.fn(() => Promise.resolve(Object.values(pbRecords))),
    }),
    authStore: {
      token: null,
      isValid: false,
      clear: jest.fn(),
      save: jest.fn(),
    },
  },
}));

const seedData = [
  { id: 'rec_1', producto: 'Cemento Portland (bolsa)', proveedor: 'CementoCorp SA', cantidad: 500, unidad: 'bolsas', precio: 8500.00, fecha: '01/06/2026', estado: 'Recibido' },
  { id: 'rec_2', producto: 'Varillas de Acero 1/2"', proveedor: 'Aceros del Sur', cantidad: 200, unidad: 'unidades', precio: 12300.00, fecha: '30/05/2026', estado: 'Recibido' },
  { id: 'rec_3', producto: 'Cables Eléctricos THW #12', proveedor: 'ElectroMateriales', cantidad: 100, unidad: 'rollos', precio: 3450.00, fecha: '28/05/2026', estado: 'Pendiente' },
];

beforeEach(() => {
  useComprasStore.setState({ items: [...seedData] });
});

describe('useComprasStore', () => {
  test('getAll returns all items', () => {
    const items = useComprasStore.getState().items;
    expect(items).toHaveLength(3);
  });

  test('getById returns correct item', () => {
    const item = useComprasStore.getState().getById('rec_1');
    expect(item).toEqual(seedData[0]);
  });

  test('getById returns undefined for unknown id', () => {
    const item = useComprasStore.getState().getById('rec_999');
    expect(item).toBeUndefined();
  });

  test('addItem inserts item with new ID', async () => {
    await useComprasStore.getState().addItem({ producto: 'Nuevo Producto', proveedor: 'Nuevo Proveedor' });
    const items = useComprasStore.getState().items;
    expect(items).toHaveLength(4);
    const added = items.find((i) => i.producto === 'Nuevo Producto');
    expect(added).toBeDefined();
    expect(added.id).toBeDefined();
  });

  test('updateItem modifies existing fields', async () => {
    await useComprasStore.getState().updateItem('rec_1', { estado: 'Pendiente' });
    const item = useComprasStore.getState().getById('rec_1');
    expect(item.estado).toBe('Pendiente');
    // Non-updated fields get defaults from mapRecord (same as productos pattern)
    expect(item.producto).toBeDefined();
  });

  test('updateItem with unknown id still updates cache via pb response', async () => {
    await useComprasStore.getState().updateItem('rec_999', { estado: 'Recibido' });
    const items = useComprasStore.getState().items;
    expect(items).toHaveLength(3);
    const item = useComprasStore.getState().getById('rec_999');
    expect(item).toBeUndefined();
  });

  test('removeItem deletes item', async () => {
    await useComprasStore.getState().removeItem('rec_1');
    const items = useComprasStore.getState().items;
    expect(items).toHaveLength(2);
    expect(items.find((i) => i.id === 'rec_1')).toBeUndefined();
  });

  test('removeItem does nothing for unknown id', async () => {
    await useComprasStore.getState().removeItem('rec_999');
    const items = useComprasStore.getState().items;
    expect(items).toHaveLength(3);
  });

  test('search returns matching subset by producto', () => {
    const results = useComprasStore.getState().search('cemento');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('rec_1');
  });

  test('search returns matching subset by proveedor', () => {
    const results = useComprasStore.getState().search('aceros');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('rec_2');
  });

  test('search returns empty array for no match', () => {
    const results = useComprasStore.getState().search('ZZZZZZ');
    expect(results).toHaveLength(0);
  });
});
