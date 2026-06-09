import { create } from 'zustand';

const searchableFields = ['id', 'cliente'];

const mapRecord = (record) => ({
  id: record.id,
  cliente: record.cliente || '',
  fecha: record.fecha || '',
  items: record.items ?? 0,
  subtotal: record.subtotal ?? 0,
  impuesto: record.impuesto ?? 0,
  total: record.total ?? 0,
  metodo: record.metodo || '',
  estado: record.estado || 'Pendiente',
});

const API_ENDPOINT = '/api/ventas';

export const useVentasStore = create((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_ENDPOINT}?page=1&limit=200&sort=-created_at`);
      const json = await res.json();
      set({ items: json.data.map(mapRecord), loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  addItem: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      set((s) => ({ items: [...s.items, mapRecord(json.data)], loading: false }));
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  updateItem: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_ENDPOINT}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      set((s) => ({
        items: s.items.map((i) => (i.id === id ? { ...i, ...mapRecord(json.data) } : i)),
        loading: false,
      }));
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  removeItem: async (id) => {
    set({ loading: true, error: null });
    try {
      await fetch(`${API_ENDPOINT}/${id}`, { method: 'DELETE' });
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