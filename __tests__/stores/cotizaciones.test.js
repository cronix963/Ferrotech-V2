import { useCotizacionesStore } from '../../stores/cotizaciones.store';

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
  { id: 'rec_1', cliente: 'Constructora LP', fecha: '01/06/2026', items: 5, subtotal: 5200.00, total: 5980.00, validez: '15 días', estado: 'Aprobada' },
  { id: 'rec_2', cliente: 'Mega Construcciones', fecha: '30/05/2026', items: 12, subtotal: 12800.00, total: 14720.00, validez: '30 días', estado: 'Revisión' },
  { id: 'rec_3', cliente: 'Taller Don Juan', fecha: '28/05/2026', items: 3, subtotal: 890.00, total: 1023.50, validez: '7 días', estado: 'Pendiente' },
];

beforeEach(() => {
  useCotizacionesStore.setState({ items: [...seedData] });
});

describe('useCotizacionesStore', () => {
  test('getAll returns all items', () => {
    const items = useCotizacionesStore.getState().items;
    expect(items).toHaveLength(3);
  });

  test('getById returns correct item', () => {
    const item = useCotizacionesStore.getState().getById('rec_1');
    expect(item).toEqual(seedData[0]);
  });

  test('getById returns undefined for unknown id', () => {
    const item = useCotizacionesStore.getState().getById('rec_999');
    expect(item).toBeUndefined();
  });

  test('addItem inserts item with new ID', async () => {
    await useCotizacionesStore.getState().addItem({ cliente: 'Nuevo Cliente', total: 1500 });
    const items = useCotizacionesStore.getState().items;
    expect(items).toHaveLength(4);
    const added = items.find((i) => i.cliente === 'Nuevo Cliente');
    expect(added).toBeDefined();
    expect(added.id).toBeDefined();
  });

  test('updateItem modifies existing fields', async () => {
    await useCotizacionesStore.getState().updateItem('rec_1', { estado: 'Vencida' });
    const item = useCotizacionesStore.getState().getById('rec_1');
    expect(item.estado).toBe('Vencida');
    // Non-updated fields get defaults from mapRecord (same as productos pattern)
    expect(item.cliente).toBeDefined();
  });

  test('updateItem with unknown id still updates cache via pb response', async () => {
    await useCotizacionesStore.getState().updateItem('rec_999', { estado: 'Aprobada' });
    const items = useCotizacionesStore.getState().items;
    expect(items).toHaveLength(3);
    const item = useCotizacionesStore.getState().getById('rec_999');
    expect(item).toBeUndefined();
  });

  test('removeItem deletes item', async () => {
    await useCotizacionesStore.getState().removeItem('rec_1');
    const items = useCotizacionesStore.getState().items;
    expect(items).toHaveLength(2);
    expect(items.find((i) => i.id === 'rec_1')).toBeUndefined();
  });

  test('removeItem does nothing for unknown id', async () => {
    await useCotizacionesStore.getState().removeItem('rec_999');
    const items = useCotizacionesStore.getState().items;
    expect(items).toHaveLength(3);
  });

  test('search returns matching subset by cliente', () => {
    const results = useCotizacionesStore.getState().search('constructora');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('rec_1');
  });

  test('search returns empty array for no match', () => {
    const results = useCotizacionesStore.getState().search('ZZZZZZ');
    expect(results).toHaveLength(0);
  });
});
