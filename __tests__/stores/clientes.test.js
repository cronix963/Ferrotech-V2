import { useClientesStore } from '../../stores/clientes.store';

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
  { id: 1, nombre: 'Constructora LP SRL', contacto: 'Luis Pérez', tel: '(591) 722-1234', email: 'lp@constructoralp.com', tipo: 'Empresa', estado: 'Activo' },
  { id: 2, nombre: 'Inmobiliaria El Alto', contacto: 'Marta Ríos', tel: '(591) 715-5678', email: 'mrios@inmalto.com', tipo: 'Empresa', estado: 'Activo' },
  { id: 3, nombre: 'Taller Mecánico Don Juan', contacto: 'Juan Quispe', tel: '(591) 798-9012', email: 'juan.taller@gmail.com', tipo: 'Particular', estado: 'Activo' },
];

beforeEach(() => {
  useClientesStore.setState({ items: [...seedData] });
});

describe('useClientesStore', () => {
  test('getAll returns all items', () => {
    const items = useClientesStore.getState().items;
    expect(items).toHaveLength(3);
  });

  test('getById returns correct item', () => {
    const item = useClientesStore.getState().getById(1);
    expect(item).toEqual(seedData[0]);
  });

  test('getById returns undefined for unknown id', () => {
    const item = useClientesStore.getState().getById(9999);
    expect(item).toBeUndefined();
  });

  test('addItem inserts item with new ID', async () => {
    await useClientesStore.getState().addItem({ nombre: 'Nuevo Cliente', tipo: 'Particular' });
    const items = useClientesStore.getState().items;
    expect(items).toHaveLength(4);
    const added = items.find((i) => i.nombre === 'Nuevo Cliente');
    expect(added).toBeDefined();
    expect(added.id).toBeDefined();
  });

  test('updateItem modifies existing fields', async () => {
    await useClientesStore.getState().updateItem(1, { nombre: 'Constructora LP Modificada' });
    const item = useClientesStore.getState().getById(1);
    expect(item.nombre).toBe('Constructora LP Modificada');
  });

  test('updateItem with unknown id still updates cache via pb response', async () => {
    await useClientesStore.getState().updateItem(9999, { nombre: 'Ghost' });
    const items = useClientesStore.getState().items;
    expect(items).toHaveLength(3);
  });

  test('removeItem deletes item', async () => {
    await useClientesStore.getState().removeItem(1);
    const items = useClientesStore.getState().items;
    expect(items).toHaveLength(2);
    expect(items.find((i) => i.id === 1)).toBeUndefined();
  });

  test('removeItem does nothing for unknown id', async () => {
    await useClientesStore.getState().removeItem(9999);
    const items = useClientesStore.getState().items;
    expect(items).toHaveLength(3);
  });

  test('search returns matching subset by nombre', () => {
    const results = useClientesStore.getState().search('constructora');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(1);
  });

  test('search returns matching subset by tipo', () => {
    const results = useClientesStore.getState().search('empresa');
    expect(results).toHaveLength(2);
  });

  test('search returns empty array for no match', () => {
    const results = useClientesStore.getState().search('ZZZZZZ');
    expect(results).toHaveLength(0);
  });
});
