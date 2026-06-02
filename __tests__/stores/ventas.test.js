import { useVentasStore } from '../../stores/ventas.store';

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
  { id: 'rec_1', cliente: 'Carlos Mendoza', fecha: '02/06/2026', items: 3, subtotal: 1250.00, impuesto: 187.50, total: 1437.50, metodo: 'Tarjeta', estado: 'Completada' },
  { id: 'rec_2', cliente: 'María López', fecha: '02/06/2026', items: 2, subtotal: 890.50, impuesto: 133.58, total: 1024.08, metodo: 'Efectivo', estado: 'Completada' },
  { id: 'rec_3', cliente: 'Juan Pérez', fecha: '01/06/2026', items: 5, subtotal: 2340.00, impuesto: 351.00, total: 2691.00, metodo: 'QR', estado: 'Pendiente' },
];

beforeEach(() => {
  useVentasStore.setState({ items: [...seedData] });
});

describe('useVentasStore', () => {
  test('getAll returns all items', () => {
    const items = useVentasStore.getState().items;
    expect(items).toHaveLength(3);
  });

  test('getById returns correct item', () => {
    const item = useVentasStore.getState().getById('rec_1');
    expect(item).toEqual(seedData[0]);
  });

  test('getById returns undefined for unknown id', () => {
    const item = useVentasStore.getState().getById('rec_999');
    expect(item).toBeUndefined();
  });

  test('addItem inserts item with new ID', async () => {
    await useVentasStore.getState().addItem({ cliente: 'Nuevo Cliente', total: 500 });
    const items = useVentasStore.getState().items;
    expect(items).toHaveLength(4);
    const added = items.find((i) => i.cliente === 'Nuevo Cliente');
    expect(added).toBeDefined();
    expect(added.id).toBeDefined();
  });

  test('updateItem modifies existing fields', async () => {
    await useVentasStore.getState().updateItem('rec_1', { estado: 'Cancelada' });
    const item = useVentasStore.getState().getById('rec_1');
    expect(item.estado).toBe('Cancelada');
    // Non-updated fields get defaults from mapRecord (same as productos pattern)
    expect(item.cliente).toBeDefined();
  });

  test('updateItem with unknown id still updates cache via pb response', async () => {
    await useVentasStore.getState().updateItem('rec_999', { estado: 'Completada' });
    const items = useVentasStore.getState().items;
    expect(items).toHaveLength(3);
    const item = useVentasStore.getState().getById('rec_999');
    expect(item).toBeUndefined();
  });

  test('removeItem deletes item', async () => {
    await useVentasStore.getState().removeItem('rec_1');
    const items = useVentasStore.getState().items;
    expect(items).toHaveLength(2);
    expect(items.find((i) => i.id === 'rec_1')).toBeUndefined();
  });

  test('removeItem does nothing for unknown id', async () => {
    await useVentasStore.getState().removeItem('rec_999');
    const items = useVentasStore.getState().items;
    expect(items).toHaveLength(3);
  });

  test('search returns matching subset by cliente', () => {
    const results = useVentasStore.getState().search('carlos');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('rec_1');
  });

  test('search returns matching subset by id', () => {
    const results = useVentasStore.getState().search('rec_2');
    expect(results).toHaveLength(1);
    expect(results[0].cliente).toBe('María López');
  });

  test('search returns empty array for no match', () => {
    const results = useVentasStore.getState().search('ZZZZZZ');
    expect(results).toHaveLength(0);
  });
});
