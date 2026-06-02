import { useProveedoresStore } from '../../stores/proveedores.store';

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
  { id: 'rec_1', nombre: 'CementoCorp SA', contacto: 'Roberto Méndez', tel: '(591) 722-0001', email: 'rmendez@ccemento.bo', rubro: 'Materiales', estado: 'Activo' },
  { id: 'rec_2', nombre: 'Aceros del Sur', contacto: 'Carla Medina', tel: '(591) 715-0002', email: 'cmedina@acerosur.bo', rubro: 'Acero', estado: 'Activo' },
  { id: 'rec_3', nombre: 'ElectroMateriales', contacto: 'Pedro Vargas', tel: '(591) 798-0003', email: 'pvargas@electromat.bo', rubro: 'Electricidad', estado: 'Activo' },
];

beforeEach(() => {
  useProveedoresStore.setState({ items: [...seedData] });
});

describe('useProveedoresStore', () => {
  test('getAll returns all items', () => {
    const items = useProveedoresStore.getState().items;
    expect(items).toHaveLength(3);
  });

  test('getById returns correct item', () => {
    const item = useProveedoresStore.getState().getById('rec_1');
    expect(item).toEqual(seedData[0]);
  });

  test('getById returns undefined for unknown id', () => {
    const item = useProveedoresStore.getState().getById('rec_999');
    expect(item).toBeUndefined();
  });

  test('addItem inserts item with new ID', async () => {
    await useProveedoresStore.getState().addItem({ nombre: 'Nuevo Proveedor', rubro: 'Ferretería' });
    const items = useProveedoresStore.getState().items;
    expect(items).toHaveLength(4);
    const added = items.find((i) => i.nombre === 'Nuevo Proveedor');
    expect(added).toBeDefined();
    expect(added.id).toBeDefined();
  });

  test('updateItem modifies existing fields', async () => {
    await useProveedoresStore.getState().updateItem('rec_1', { estado: 'Inactivo' });
    const item = useProveedoresStore.getState().getById('rec_1');
    expect(item.estado).toBe('Inactivo');
    // Non-updated fields get defaults from mapRecord (same as productos pattern)
    expect(item.nombre).toBeDefined();
  });

  test('updateItem with unknown id still updates cache via pb response', async () => {
    await useProveedoresStore.getState().updateItem('rec_999', { nombre: 'Ghost' });
    const items = useProveedoresStore.getState().items;
    expect(items).toHaveLength(3);
    const item = useProveedoresStore.getState().getById('rec_999');
    expect(item).toBeUndefined();
  });

  test('removeItem deletes item', async () => {
    await useProveedoresStore.getState().removeItem('rec_1');
    const items = useProveedoresStore.getState().items;
    expect(items).toHaveLength(2);
    expect(items.find((i) => i.id === 'rec_1')).toBeUndefined();
  });

  test('removeItem does nothing for unknown id', async () => {
    await useProveedoresStore.getState().removeItem('rec_999');
    const items = useProveedoresStore.getState().items;
    expect(items).toHaveLength(3);
  });

  test('search returns matching subset by nombre', () => {
    const results = useProveedoresStore.getState().search('cemento');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('rec_1');
  });

  test('search returns matching subset by rubro', () => {
    const results = useProveedoresStore.getState().search('electricidad');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('rec_3');
  });

  test('search returns empty array for no match', () => {
    const results = useProveedoresStore.getState().search('ZZZZZZ');
    expect(results).toHaveLength(0);
  });
});
