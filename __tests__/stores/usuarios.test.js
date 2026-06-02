import { useUsuariosStore } from '../../stores/usuarios.store';

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
  { id: 1, nombre: 'Carlos Mendoza', email: 'cmendoza@ferrotech.com', rol: 'Admin', estado: 'Activo' },
  { id: 2, nombre: 'María López', email: 'mlopez@ferrotech.com', rol: 'Vendedor', estado: 'Activo' },
  { id: 3, nombre: 'Juan Pérez', email: 'jperez@ferrotech.com', rol: 'Vendedor', estado: 'Activo' },
];

beforeEach(() => {
  useUsuariosStore.setState({ items: [...seedData] });
});

describe('useUsuariosStore', () => {
  test('getAll returns all items', () => {
    const items = useUsuariosStore.getState().items;
    expect(items).toHaveLength(3);
  });

  test('getById returns correct item', () => {
    const item = useUsuariosStore.getState().getById(1);
    expect(item).toEqual(seedData[0]);
  });

  test('getById returns undefined for unknown id', () => {
    const item = useUsuariosStore.getState().getById(9999);
    expect(item).toBeUndefined();
  });

  test('addItem inserts item with new ID', async () => {
    await useUsuariosStore.getState().addItem({ nombre: 'Nuevo Usuario', email: 'nuevo@ferrotech.com', rol: 'Vendedor' });
    const items = useUsuariosStore.getState().items;
    expect(items).toHaveLength(4);
    const added = items.find((i) => i.nombre === 'Nuevo Usuario');
    expect(added).toBeDefined();
    expect(added.id).toBeDefined();
  });

  test('updateItem modifies existing fields', async () => {
    await useUsuariosStore.getState().updateItem(1, { nombre: 'Carlos Modificado' });
    const item = useUsuariosStore.getState().getById(1);
    expect(item.nombre).toBe('Carlos Modificado');
  });

  test('updateItem with unknown id still updates cache via pb response', async () => {
    await useUsuariosStore.getState().updateItem(9999, { nombre: 'Ghost' });
    const items = useUsuariosStore.getState().items;
    expect(items).toHaveLength(3);
  });

  test('removeItem deletes item', async () => {
    await useUsuariosStore.getState().removeItem(1);
    const items = useUsuariosStore.getState().items;
    expect(items).toHaveLength(2);
    expect(items.find((i) => i.id === 1)).toBeUndefined();
  });

  test('removeItem does nothing for unknown id', async () => {
    await useUsuariosStore.getState().removeItem(9999);
    const items = useUsuariosStore.getState().items;
    expect(items).toHaveLength(3);
  });

  test('search returns matching subset by nombre', () => {
    const results = useUsuariosStore.getState().search('carlos');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(1);
  });

  test('search returns matching subset by rol', () => {
    const results = useUsuariosStore.getState().search('vendedor');
    expect(results).toHaveLength(2);
  });

  test('search returns empty array for no match', () => {
    const results = useUsuariosStore.getState().search('ZZZZZZ');
    expect(results).toHaveLength(0);
  });
});
