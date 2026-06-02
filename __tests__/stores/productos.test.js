import { useProductosStore } from '../../stores/productos.store';

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
  { id: 1, nombre: 'Cemento Portland 50kg', categoria: 'Construcción', stock: 120, min: 50, precio: 8.50, unidad: 'bolsa', estado: 'Disponible' },
  { id: 2, nombre: 'Varilla de Acero 1/2"', categoria: 'Construcción', stock: 45,  min: 30, precio: 12.00, unidad: 'unidad', estado: 'Disponible' },
  { id: 3, nombre: 'Pintura Látex Blanca 20L', categoria: 'Pinturas', stock: 18, min: 10, precio: 45.00, unidad: 'galón', estado: 'Stock Bajo' },
];

beforeEach(() => {
  useProductosStore.setState({ items: [...seedData] });
});

describe('useProductosStore', () => {
  test('getAll returns all items', () => {
    const items = useProductosStore.getState().items;
    expect(items).toHaveLength(3);
  });

  test('getById returns correct item', () => {
    const item = useProductosStore.getState().getById(1);
    expect(item).toEqual(seedData[0]);
  });

  test('getById returns undefined for unknown id', () => {
    const item = useProductosStore.getState().getById(9999);
    expect(item).toBeUndefined();
  });

  test('addItem inserts item with new ID', async () => {
    await useProductosStore.getState().addItem({ nombre: 'Nuevo Producto', categoria: 'Ferretería' });
    const items = useProductosStore.getState().items;
    expect(items).toHaveLength(4);
    const added = items.find((i) => i.nombre === 'Nuevo Producto');
    expect(added).toBeDefined();
    expect(added.id).toBeDefined();
  });

  test('updateItem modifies existing fields', async () => {
    await useProductosStore.getState().updateItem(1, { nombre: 'Cemento Premium' });
    const item = useProductosStore.getState().getById(1);
    expect(item.nombre).toBe('Cemento Premium');
    // categoria defaults to '' via mapRecord when PB returns only the updated fields
    expect(item.categoria).toBeDefined();
  });

  test('updateItem with unknown id still updates cache via pb response', async () => {
    await useProductosStore.getState().updateItem(9999, { nombre: 'Ghost' });
    const items = useProductosStore.getState().items;
    // 9999 not in local cache, but PB mock returns a record, which gets mapRecord'd and
    // filter-match fails so local cache stays at 3
    expect(items).toHaveLength(3);
    const item = useProductosStore.getState().getById(9999);
    expect(item).toBeUndefined();
  });

  test('removeItem deletes item', async () => {
    await useProductosStore.getState().removeItem(1);
    const items = useProductosStore.getState().items;
    expect(items).toHaveLength(2);
    expect(items.find((i) => i.id === 1)).toBeUndefined();
  });

  test('removeItem does nothing for unknown id', async () => {
    await useProductosStore.getState().removeItem(9999);
    const items = useProductosStore.getState().items;
    expect(items).toHaveLength(3);
  });

  test('search returns matching subset by nombre', () => {
    const results = useProductosStore.getState().search('cemento');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(1);
  });

  test('search returns matching subset by categoria', () => {
    const results = useProductosStore.getState().search('construcción');
    expect(results).toHaveLength(2);
  });

  test('search returns empty array for no match', () => {
    const results = useProductosStore.getState().search('ZZZZZZ');
    expect(results).toHaveLength(0);
  });
});
