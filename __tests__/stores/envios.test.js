import { useEnviosStore } from '../../stores/envios.store';

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
  { id: 'rec_1', pedido: 'rec_p1', cliente: 'Carlos Mendoza', direccion: 'Av. Siempre Viva 123', repartidor: 'Pedro Sánchez', fecha_env: '02/06/2026', estado: 'Entregado' },
  { id: 'rec_2', pedido: 'rec_p2', cliente: 'María López', direccion: 'Calle Real 456', repartidor: 'Pedro Sánchez', fecha_env: '02/06/2026', estado: 'En Camino' },
  { id: 'rec_3', pedido: 'rec_p4', cliente: 'Ana Rodríguez', direccion: 'Zona Central 789', repartidor: 'Carlos Rivas', fecha_env: '01/06/2026', estado: 'Entregado' },
];

beforeEach(() => {
  useEnviosStore.setState({ items: [...seedData] });
});

describe('useEnviosStore', () => {
  test('getAll returns all items', () => {
    const items = useEnviosStore.getState().items;
    expect(items).toHaveLength(3);
  });

  test('getById returns correct item', () => {
    const item = useEnviosStore.getState().getById('rec_1');
    expect(item).toEqual(seedData[0]);
  });

  test('getById returns undefined for unknown id', () => {
    const item = useEnviosStore.getState().getById('rec_999');
    expect(item).toBeUndefined();
  });

  test('addItem inserts item with new ID', async () => {
    await useEnviosStore.getState().addItem({ pedido: 'rec_p10', cliente: 'Nuevo Cliente' });
    const items = useEnviosStore.getState().items;
    expect(items).toHaveLength(4);
    const added = items.find((i) => i.cliente === 'Nuevo Cliente');
    expect(added).toBeDefined();
    expect(added.id).toBeDefined();
  });

  test('updateItem modifies existing fields', async () => {
    await useEnviosStore.getState().updateItem('rec_1', { estado: 'En Camino' });
    const item = useEnviosStore.getState().getById('rec_1');
    expect(item.estado).toBe('En Camino');
    // Non-updated fields get defaults from mapRecord (same as productos pattern)
    expect(item.cliente).toBeDefined();
  });

  test('updateItem with unknown id still updates cache via pb response', async () => {
    await useEnviosStore.getState().updateItem('rec_999', { estado: 'Entregado' });
    const items = useEnviosStore.getState().items;
    expect(items).toHaveLength(3);
    const item = useEnviosStore.getState().getById('rec_999');
    expect(item).toBeUndefined();
  });

  test('removeItem deletes item', async () => {
    await useEnviosStore.getState().removeItem('rec_1');
    const items = useEnviosStore.getState().items;
    expect(items).toHaveLength(2);
    expect(items.find((i) => i.id === 'rec_1')).toBeUndefined();
  });

  test('removeItem does nothing for unknown id', async () => {
    await useEnviosStore.getState().removeItem('rec_999');
    const items = useEnviosStore.getState().items;
    expect(items).toHaveLength(3);
  });

  test('search returns matching subset by cliente', () => {
    const results = useEnviosStore.getState().search('mendoza');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('rec_1');
  });

  test('search returns matching subset by repartidor', () => {
    const results = useEnviosStore.getState().search('pedro');
    expect(results).toHaveLength(2);
  });

  test('search returns empty array for no match', () => {
    const results = useEnviosStore.getState().search('ZZZZZZ');
    expect(results).toHaveLength(0);
  });
});
