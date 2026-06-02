import { create } from 'zustand';
import pb from '../lib/pocketbase';

const searchableFields = ['nombre', 'categoria'];

const mapRecord = (pbRecord) => {
  const stock = pbRecord.stock ?? 0;
  const min = 0; // not in PB spec, defaulted per design decision
  let estado;
  if (stock === 0) {
    estado = 'Sin Stock';
  } else if (stock <= min) {
    estado = 'Stock Bajo';
  } else {
    estado = pbRecord.activo !== false ? 'Disponible' : 'Inactivo';
  }

  return {
    id: pbRecord.id,
    nombre: pbRecord.nombre || '',
    categoria: pbRecord.categoria || '',
    stock,
    min,
    precio: pbRecord.precio ?? 0,
    unidad: 'unidad', // default, not stored in PB
    estado,
  };
};

export const useProductosStore = create((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const result = await pb.collection('productos').getList(1, 200, { sort: '-created' });
      set({ items: result.items.map(mapRecord), loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  addItem: async (data) => {
    set({ loading: true, error: null });
    try {
      const record = await pb.collection('productos').create(data);
      set((s) => ({ items: [...s.items, mapRecord(record)], loading: false }));
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  updateItem: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const record = await pb.collection('productos').update(id, data);
      set((s) => ({
        items: s.items.map((i) => (i.id === id ? { ...i, ...mapRecord(record) } : i)),
        loading: false,
      }));
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  removeItem: async (id) => {
    set({ loading: true, error: null });
    try {
      await pb.collection('productos').delete(id);
      set((s) => ({ items: s.items.filter((i) => i.id !== id), loading: false }));
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  getById: (id) => get().items.find((i) => i.id === id),

  search: (query) => {
    const q = query.toLowerCase();
    return get().items.filter((i) =>
      searchableFields.some((field) => String(i[field]).toLowerCase().includes(q)),
    );
  },
}));
