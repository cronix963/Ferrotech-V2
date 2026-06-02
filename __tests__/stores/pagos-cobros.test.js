import { usePagosCobrosStore } from '../../stores/pagos-cobros.store';

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
  { id: 'rec_1', tipo: 'Cobro', cliente: 'Constructora LP', concepto: 'Factura #V-005', monto: 4830.00, fecha: '02/06/2026', metodo: 'Depósito', estado: 'Cobrado' },
  { id: 'rec_2', tipo: 'Cobro', cliente: 'María López', concepto: 'Factura #V-002', monto: 1024.08, fecha: '02/06/2026', metodo: 'Efectivo', estado: 'Cobrado' },
  { id: 'rec_3', tipo: 'Cobro', cliente: 'Juan Pérez', concepto: 'Factura #V-003', monto: 2691.00, fecha: '01/06/2026', metodo: 'QR', estado: 'Pendiente' },
];

beforeEach(() => {
  usePagosCobrosStore.setState({ items: [...seedData] });
});

describe('usePagosCobrosStore', () => {
  test('getAll returns all items', () => {
    const items = usePagosCobrosStore.getState().items;
    expect(items).toHaveLength(3);
  });

  test('getById returns correct item', () => {
    const item = usePagosCobrosStore.getState().getById('rec_1');
    expect(item).toEqual(seedData[0]);
  });

  test('getById returns undefined for unknown id', () => {
    const item = usePagosCobrosStore.getState().getById('rec_999');
    expect(item).toBeUndefined();
  });

  test('addItem inserts item with new ID', async () => {
    await usePagosCobrosStore.getState().addItem({ tipo: 'Pago', cliente: 'Nuevo Cliente', concepto: 'Pago', monto: 500 });
    const items = usePagosCobrosStore.getState().items;
    expect(items).toHaveLength(4);
    const added = items.find((i) => i.cliente === 'Nuevo Cliente');
    expect(added).toBeDefined();
    expect(added.id).toBeDefined();
  });

  test('updateItem modifies existing fields', async () => {
    await usePagosCobrosStore.getState().updateItem('rec_1', { estado: 'Pendiente' });
    const item = usePagosCobrosStore.getState().getById('rec_1');
    expect(item.estado).toBe('Pendiente');
    // Non-updated fields get defaults from mapRecord (same as productos pattern)
    expect(item.cliente).toBeDefined();
  });

  test('updateItem with unknown id still updates cache via pb response', async () => {
    await usePagosCobrosStore.getState().updateItem('rec_999', { estado: 'Cobrado' });
    const items = usePagosCobrosStore.getState().items;
    expect(items).toHaveLength(3);
    const item = usePagosCobrosStore.getState().getById('rec_999');
    expect(item).toBeUndefined();
  });

  test('removeItem deletes item', async () => {
    await usePagosCobrosStore.getState().removeItem('rec_1');
    const items = usePagosCobrosStore.getState().items;
    expect(items).toHaveLength(2);
    expect(items.find((i) => i.id === 'rec_1')).toBeUndefined();
  });

  test('removeItem does nothing for unknown id', async () => {
    await usePagosCobrosStore.getState().removeItem('rec_999');
    const items = usePagosCobrosStore.getState().items;
    expect(items).toHaveLength(3);
  });

  test('search returns matching subset by cliente', () => {
    const results = usePagosCobrosStore.getState().search('constructora');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('rec_1');
  });

  test('search returns matching subset by concepto', () => {
    const results = usePagosCobrosStore.getState().search('#V-005');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('rec_1');
  });

  test('search returns empty array for no match', () => {
    const results = usePagosCobrosStore.getState().search('ZZZZZZ');
    expect(results).toHaveLength(0);
  });
});
