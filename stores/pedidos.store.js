import { create } from 'zustand';

const mapRecord = (record) => {
  // Parse JSONB items — could be array or string
  let itemsList = [];
  if (Array.isArray(record.items)) {
    itemsList = record.items;
  } else if (typeof record.items === 'string') {
    try { itemsList = JSON.parse(record.items); } catch { itemsList = []; }
  }

  const itemsCount = itemsList.reduce((sum, i) => sum + (i.cantidad || i.qty || 1), 0);

  return {
    id: record.id,
    codigo: record.codigo || `#${record.id}`,
    cliente: record.cliente || '',
    email: record.email || '',
    telefono: record.telefono || '',
    direccion: record.direccion || '',
    items: itemsList,
    itemsCount,
    subtotal: parseFloat(record.subtotal) || 0,
    impuesto: parseFloat(record.impuesto) || 0,
    total: parseFloat(record.total) || 0,
    tipo: record.tipo || 'tienda',
    estado: record.estado || 'Pendiente',
    pago: record.pago || 'Pendiente',
    metodo_pago: record.metodo_pago || '',
    notas: record.notas || '',
    creado_por: record.creado_por || null,
    fecha: record.created_at || '',
    created_at: record.created_at || '',
    updated_at: record.updated_at || '',
  };
};

const searchableFields = ['codigo', 'cliente', 'email', 'tipo', 'estado'];

const API_ENDPOINT = '/api/pedidos';

export const usePedidosStore = create((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_ENDPOINT}?page=1&limit=200&sort=-created_at`);
      const json = await res.json();
      set({ items: (json.data || []).map(mapRecord), loading: false });
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
      if (!res.ok) throw new Error(json.error || 'Error al crear pedido');
      set((s) => ({ items: [mapRecord(json.data), ...s.items], loading: false }));
      return json.data;
    } catch (err) {
      set({ error: err.message, loading: false });
      return null;
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
      if (!res.ok) throw new Error(json.error || 'Error al actualizar');
      set((s) => ({
        items: s.items.map((i) => (i.id === id ? { ...i, ...mapRecord(json.data) } : i)),
        loading: false,
      }));
      return json.data;
    } catch (err) {
      set({ error: err.message, loading: false });
      return null;
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

  // Convenience: get orders by status
  getByEstado: (estado) => get().items.filter((i) => i.estado === estado),

  // Stats
  getStats: () => {
    const items = get().items;
    return {
      total: items.length,
      pendientes: items.filter((i) => i.estado === 'Pendiente').length,
      enProceso: items.filter((i) => i.estado === 'En Proceso').length,
      despachados: items.filter((i) => i.estado === 'Despachado').length,
      completados: items.filter((i) => i.estado === 'Completado').length,
      cancelados: items.filter((i) => i.estado === 'Cancelado').length,
      totalVentas: items.reduce((s, i) => s + i.total, 0),
      pagados: items.filter((i) => i.pago === 'Pagado').length,
      porCobrar: items.filter((i) => i.pago !== 'Pagado').reduce((s, i) => s + i.total, 0),
    };
  },
}));
