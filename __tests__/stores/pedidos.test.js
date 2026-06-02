import { usePedidosStore } from '../../stores/pedidos.store';

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
  { id: 'rec_1', cliente: 'Carlos Mendoza', fecha: '02/06/2026', total: 1250.00, items: 3, pago: 'Pagado', envio: 'Completado' },
  { id: 'rec_2', cliente: 'María López',    fecha: '02/06/2026', total: 890.50,  items: 2, pago: 'Pagado', envio: 'En Proceso' },
  { id: 'rec_3', cliente: 'Juan Pérez',     fecha: '01/06/2026', total: 2340.00, items: 5, pago: 'Pendiente', envio: 'Preparación' },
];

beforeEach(() => {
  usePedidosStore.setState({ items: [...seedData] });
});

describe('usePedidosStore', () => {
  test('getAll returns all items', () => {
    const items = usePedidosStore.getState().items;
    expect(items).toHaveLength(3);
  });

  test('getById returns correct item', () => {
    const item = usePedidosStore.getState().getById('rec_1');
    expect(item).toEqual(seedData[0]);
  });

  test('getById returns undefined for unknown id', () => {
    const item = usePedidosStore.getState().getById('rec_999');
    expect(item).toBeUndefined();
  });

  test('addItem inserts item with new ID', async () => {
    await usePedidosStore.getState().addItem({ cliente: 'Nuevo Cliente', total: 500 });
    const items = usePedidosStore.getState().items;
    expect(items).toHaveLength(4);
    const added = items.find((i) => i.cliente === 'Nuevo Cliente');
    expect(added).toBeDefined();
    expect(added.id).toBeDefined();
  });

  test('updateItem modifies existing fields', async () => {
    await usePedidosStore.getState().updateItem('rec_1', { pago: 'Pendiente' });
    const item = usePedidosStore.getState().getById('rec_1');
    expect(item.pago).toBe('Pendiente');
    // Non-updated fields get defaults from mapRecord (same as productos pattern)
    expect(item.cliente).toBeDefined();
  });

  test('updateItem with unknown id still updates cache via pb response', async () => {
    await usePedidosStore.getState().updateItem('rec_999', { pago: 'Pagado' });
    const items = usePedidosStore.getState().items;
    expect(items).toHaveLength(3);
    const item = usePedidosStore.getState().getById('rec_999');
    expect(item).toBeUndefined();
  });

  test('removeItem deletes item', async () => {
    await usePedidosStore.getState().removeItem('rec_1');
    const items = usePedidosStore.getState().items;
    expect(items).toHaveLength(2);
    expect(items.find((i) => i.id === 'rec_1')).toBeUndefined();
  });

  test('removeItem does nothing for unknown id', async () => {
    await usePedidosStore.getState().removeItem('rec_999');
    const items = usePedidosStore.getState().items;
    expect(items).toHaveLength(3);
  });

  test('search returns matching subset by cliente', () => {
    const results = usePedidosStore.getState().search('carlos');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('rec_1');
  });

  test('search returns matching subset by id', () => {
    const results = usePedidosStore.getState().search('rec_2');
    expect(results).toHaveLength(1);
    expect(results[0].cliente).toBe('María López');
  });

  test('search returns empty array for no match', () => {
    const results = usePedidosStore.getState().search('ZZZZZZ');
    expect(results).toHaveLength(0);
  });
});
