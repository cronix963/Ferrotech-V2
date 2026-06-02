import { create } from 'zustand';
import pb from '../lib/pocketbase';

const searchableFields = ['cliente', 'concepto'];

const mapRecord = (pbRecord) => ({
  id: pbRecord.id,
  tipo: pbRecord.tipo || 'Cobro',
  cliente: pbRecord.cliente || '',
  concepto: pbRecord.concepto || '',
  monto: pbRecord.monto ?? 0,
  fecha: pbRecord.fecha || '',
  metodo: pbRecord.metodo || '',
  estado: pbRecord.estado || 'Pendiente',
});

export const usePagosCobrosStore = create((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const result = await pb.collection('pagos_cobros').getList(1, 200, { sort: '-created' });
      set({ items: result.items.map(mapRecord), loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  addItem: async (data) => {
    set({ loading: true, error: null });
    try {
      const record = await pb.collection('pagos_cobros').create(data);
      set((s) => ({ items: [...s.items, mapRecord(record)], loading: false }));
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  updateItem: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const record = await pb.collection('pagos_cobros').update(id, data);
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
      await pb.collection('pagos_cobros').delete(id);
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
