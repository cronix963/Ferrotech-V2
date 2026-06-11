import { create } from 'zustand';

const searchableFields = ['codigo', 'cliente', 'estado'];

const mapRecord = (record) => {
  // Parse JSONB items
  let itemsList = [];
  if (Array.isArray(record.items)) {
    itemsList = record.items;
  } else if (typeof record.items === 'string') {
    try { itemsList = JSON.parse(record.items); } catch { itemsList = []; }
  }

  const itemsCount = itemsList.reduce((sum, i) => sum + (i.cantidad || i.qty || 1), 0);

  return {
    id: record.id,
    codigo: record.codigo || `#C-${record.id}`,
    cliente: record.cliente || '',
    items: itemsList,
    itemsCount,
    subtotal: parseFloat(record.subtotal) || 0,
    impuesto: parseFloat(record.impuesto) || 0,
    total: parseFloat(record.total) || 0,
    validez_dias: record.validez_dias || 30,
    estado: record.estado || 'Pendiente',
    notas: record.notas || '',
    creado_por: record.creado_por || null,
    fecha: record.created_at || '',
    created_at: record.created_at || '',
  };
};

const API_ENDPOINT = '/api/cotizaciones';

export const useCotizacionesStore = create((set, get) => ({
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