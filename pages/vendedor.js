import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../stores/auth.store';
import { formatPrice } from '../lib/price';
import {
  FiUsers,
  FiPackage,
  FiDollarSign,
  FiClock,
  FiSearch,
  FiCheckCircle,
  FiXCircle,
  FiPlus,
  FiX,
  FiCheck,
  FiMinus,
  FiShoppingCart,
} from 'react-icons/fi';

/* ── Mapping helpers ── */
const formatDate = (iso) => {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('es-ES'); } catch { return ''; }
};

const mapCustomer = (r) => ({
  id: r.id,
  name: r.nombre || '',
  email: r.email || '',
  tel: r.telefono || '',
  totalCompras: r.total_compras ?? 0,
  ultimaCompra: formatDate(r.ultima_compra || r.created),
  estado: 'Activo',
});

const mapOrder = (r) => {
  // Parse JSONB items
  let itemsList = [];
  if (Array.isArray(r.items)) itemsList = r.items;
  else if (typeof r.items === 'string') try { itemsList = JSON.parse(r.items); } catch { itemsList = []; }
  const itemCount = itemsList.reduce((sum, i) => sum + (i.cantidad || i.qty || 1), 0);

  return {
    id: r.codigo || `#${r.id}`,
    customer: r.cliente || '',
    fecha: formatDate(r.created_at || r.fecha),
    items: itemCount,
    total: formatPrice(parseFloat(r.total) || 0),
    pago: r.pago || 'Pendiente',
    estado: r.estado || 'Pendiente',
    _pbId: r.id,
    _totalRaw: parseFloat(r.total) || 0,
    _items: itemsList,
  };
};

const mapCotizacion = (r) => {
  let itemsList = [];
  if (Array.isArray(r.items)) itemsList = r.items;
  else if (typeof r.items === 'string') try { itemsList = JSON.parse(r.items); } catch { itemsList = []; }
  const itemCount = itemsList.reduce((sum, i) => sum + (i.cantidad || i.qty || 1), 0);
  return {
    id: r.id,
    codigo: r.codigo || `#C-${r.id}`,
    cliente: r.cliente || '',
    items: itemsList,
    itemsCount: itemCount,
    subtotal: parseFloat(r.subtotal) || 0,
    impuesto: parseFloat(r.impuesto) || 0,
    total: parseFloat(r.total) || 0,
    validez_dias: r.validez_dias || 30,
    estado: r.estado || 'Pendiente',
    notas: r.notas || '',
    fecha: formatDate(r.created_at),
    _raw: r,
  };
};

const mapProduct = (r) => ({
  id: r.id,
  name: r.nombre || '',
  cat: r.categoria || '',
  price: parseFloat(r.precio) || 0,
  icon: r.icono || '📦',
});

const badge = (s) =>
  ({
    Completado: 'bg-[#C6F6D5] text-[#22543D]',
    Cancelado: 'bg-[#FED7D7] text-[#9B2C2C]',
    Pendiente: 'bg-[#FEFCBF] text-[#744210]',
    Despachado: 'bg-primary-100 text-primary',
    Pagado: 'bg-[#C6F6D5] text-[#22543D]',
    Aprobada: 'bg-[#C6F6D5] text-[#22543D]',
    Rechazada: 'bg-[#FED7D7] text-[#9B2C2C]',
    Revisión: 'bg-[#FED7AA] text-[#7B341E]',
    Vencida: 'bg-[#FED7D7] text-[#9B2C2C]',
  }[s] || 'bg-[#FEFCBF] text-[#744210]');

const tabs = [
  { id: 'resumen', label: '📊 Resumen' },
  { id: 'clientes', label: '👥 Clientes' },
  { id: 'pedidos', label: '📦 Pedidos' },
  { id: 'ventas', label: '💰 Ventas' },
  { id: 'cotizaciones', label: '📋 Cotizaciones' },
];

export default function Vendedor() {
  const router = useRouter();
  const { isAuthenticated, user, hydrating, rol } = useAuthStore();
  const [userName, setUserName] = useState('Vendedor');
  const [activeTab, setActiveTab] = useState('resumen');
  const [searchC, setSearchC] = useState('');
  const [searchO, setSearchO] = useState('');

  /* ── State desde PocketBase ── */
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  /* ── Cotizaciones ── */
  const [cotizaciones, setCotizaciones] = useState([]);
  const [quotesLoading, setQuotesLoading] = useState(false);

  /* ── Modal Nueva Cotización ── */
  const [cotizOpen, setCotizOpen] = useState(false);
  const [newQuote, setNewQuote] = useState({
    customerName: '',
    items: [],
    validez_dias: 30,
    notas: '',
  });
  const [prodSearchQ, setProdSearchQ] = useState('');

  /* ── Modal Nueva Venta ── */
  const [ventaOpen, setVentaOpen] = useState(false);
  const [newSale, setNewSale] = useState({
    customerId: null,
    customerName: '',
    items: [],
    pago: 'Efectivo',
  });
  const [prodSearch, setProdSearch] = useState('');
  const [montoRecibido, setMontoRecibido] = useState('');
  const [confirmMsg, setConfirmMsg] = useState(null);

  /* ── Fetch all data from PocketBase ── */
  const fetchData = async () => {
    try {
      const [clientesRes, pedidosRes, productosRes, cotizacionesRes] = await Promise.all([
        fetch('/api/clientes?limit=200&sort=-created_at').then(r => r.json()),
        fetch('/api/pedidos?limit=200&sort=-created_at').then(r => r.json()),
        fetch('/api/productos?limit=200&sort=-created_at&activo=true').then(r => r.json()),
        fetch('/api/cotizaciones?limit=200&sort=-created_at').then(r => r.json()),
      ]);
      setCustomers((clientesRes.data || []).map(mapCustomer));
      setOrders((pedidosRes.data || []).map(mapOrder));
      setProducts((productosRes.data || []).map(mapProduct));
      setCotizaciones((cotizacionesRes.data || []).map(mapCotizacion));
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  /* ── Auth guard + init ── */
  useEffect(() => {
    if (!hydrating && (!isAuthenticated || rol !== 'vendedor')) {
      router.replace('/');
      return;
    }
    if (!hydrating && isAuthenticated) {
      if (user?.nombre) setUserName(user.nombre);
      else if (user?.email) setUserName(user.email);
      fetchData().finally(() => { setLoading(false); setReady(true); });
    }
  }, [hydrating, isAuthenticated, rol, user, router]);

  /* ── Confirmar pedido (Pendiente → Completado) ── */
  const confirmOrder = async (orderId) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    try {
      await fetch(`/api/pedidos/${order._pbId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'Completado', pago: 'Pagado' }),
      });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, estado: 'Completado', pago: 'Pagado' } : o)),
      );
      setConfirmMsg({ type: 'success', text: `✅ Pedido ${orderId} confirmado` });
    } catch (err) {
      setConfirmMsg({ type: 'warn', text: `❌ Error al confirmar pedido` });
    }
    setTimeout(() => setConfirmMsg(null), 3000);
  };

  /* ── Cambiar estado a Despachado ── */
  const despacharOrder = async (orderId) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    try {
      await fetch(`/api/pedidos/${order._pbId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'Despachado' }),
      });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, estado: 'Despachado' } : o)),
      );
      setConfirmMsg({ type: 'success', text: `🚚 Pedido ${orderId} marcado como Despachado` });
    } catch (err) {
      setConfirmMsg({ type: 'warn', text: `❌ Error al despachar pedido` });
    }
    setTimeout(() => setConfirmMsg(null), 3000);
  };

  /* ── Cancelar pedido ── */
  const cancelOrder = async (orderId) => {
    if (!confirm('¿Cancelar este pedido?')) return;
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    try {
      await fetch(`/api/pedidos/${order._pbId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'Cancelado', pago: 'Pendiente' }),
      });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, estado: 'Cancelado', pago: 'Pendiente' } : o)),
      );
      setConfirmMsg({ type: 'warn', text: `❌ Pedido ${orderId} cancelado` });
    } catch (err) {
      setConfirmMsg({ type: 'warn', text: `❌ Error al cancelar pedido` });
    }
    setTimeout(() => setConfirmMsg(null), 3000);
  };

  /* ── Agregar producto a nueva venta ── */
  const addProductToSale = (prod) => {
    setNewSale((prev) => {
      const existing = prev.items.find((i) => i.id === prod.id);
      if (existing) {
        return {
          ...prev,
          items: prev.items.map((i) => (i.id === prod.id ? { ...i, qty: i.qty + 1 } : i)),
        };
      }
      return { ...prev, items: [...prev.items, { ...prod, qty: 1 }] };
    });
  };

  const updateSaleQty = (prodId, delta) => {
    setNewSale((prev) => ({
      ...prev,
      items: prev.items
        .map((i) => (i.id !== prodId ? i : { ...i, qty: Math.max(1, i.qty + delta) }))
        .filter((i) => i.qty > 0),
    }));
  };

  const removeFromSale = (prodId) => {
    setNewSale((prev) => ({ ...prev, items: prev.items.filter((i) => i.id !== prodId) }));
  };

  const saleTotal = newSale.items.reduce((s, i) => s + i.price * i.qty, 0);
  const saleCount = newSale.items.reduce((s, i) => s + i.qty, 0);

  /* ── Confirmar nueva venta ── */
  const confirmNewSale = async () => {
    if (!newSale.customerName || newSale.items.length === 0) return;

    const orderCode = '#P-' + Date.now().toString(36).toUpperCase();
    const isCash = newSale.pago === 'Efectivo';

    try {
      await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo: orderCode,
          cliente: newSale.customerName,
          items: newSale.items.map((i) => ({
            producto_id: i.id,
            nombre: i.name,
            cantidad: i.qty,
            precio: i.price,
          })),
          total: saleTotal,
          tipo: 'pos',
          estado: isCash ? 'Completado' : 'Pendiente',
          pago: isCash ? 'Pagado' : 'Pendiente',
          creado_por: user?.id,
        }),
      });

      // Create or update customer
      const existingCustomer = customers.find((c) => c.name === newSale.customerName);
      if (!existingCustomer) {
        await fetch('/api/clientes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre: newSale.customerName }),
        });
      }

      // Refresh data
      await fetchData();

      setVentaOpen(false);
      setNewSale({ customerId: null, customerName: '', items: [], pago: 'Efectivo' });
      setProdSearch('');
      setMontoRecibido('');
      setConfirmMsg({ type: 'success', text: `✅ Venta ${orderCode} registrada` });
    } catch (err) {
      setConfirmMsg({ type: 'warn', text: `❌ Error al registrar venta` });
    }
    setTimeout(() => setConfirmMsg(null), 3000);
  };

  /* ── Filtros ── */
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchC.toLowerCase()) ||
      c.email.toLowerCase().includes(searchC.toLowerCase()),
  );

  const filteredOrders = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(searchO.toLowerCase()) ||
      o.customer.toLowerCase().includes(searchO.toLowerCase()),
  );

  const filteredProds = products.filter(
    (p) =>
      p.name.toLowerCase().includes(prodSearch.toLowerCase()) ||
      p.cat.toLowerCase().includes(prodSearch.toLowerCase()),
  );

  /* ── Stats ── */
  const stats = [
    { label: 'Clientes Activos', value: customers.filter((c) => c.estado === 'Activo').length, icon: FiUsers, color: '#2B6CB0' },
    { label: 'Pedidos Pendientes', value: orders.filter((o) => o.estado === 'Pendiente').length, icon: FiClock, color: '#DD6B20' },
    { label: 'Ventas Completadas', value: orders.filter((o) => o.estado === 'Completado').length, icon: FiCheckCircle, color: '#38A169' },
    { label: 'Ventas Canceladas', value: orders.filter((o) => o.estado === 'Cancelado').length, icon: FiXCircle, color: '#E53E3E' },
    { label: 'Total Clientes', value: customers.length, icon: FiUsers, color: '#805AD5' },
    { label: 'Total Pedidos', value: orders.length, icon: FiPackage, color: '#2B6CB0' },
  ];

  if (hydrating) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated || rol !== 'vendedor') return null;
  if (!ready) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ═══ HEADER ═══ */}
      <header className="bg-primary px-6 py-2.5 flex items-center justify-between text-white sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="font-bold text-base flex items-center gap-2">
            <span className="bg-white/15 w-7 h-7 rounded-md flex items-center justify-center">🔧</span>{' '}
            FERROTECH · Vendedor
          </div>
        </div>
        <div className="flex gap-5 max-sm:hidden">
          <div className="text-right">
            <div className="text-base font-bold">{customers.length}</div>
            <div className="text-[0.6rem] opacity-60">Clientes</div>
          </div>
          <div className="text-right">
            <div className="text-base font-bold">      {orders.filter((o) => o.estado === 'Pendiente').length}</div>
            <div className="text-[0.6rem] opacity-60">Pendientes</div>
          </div>
          <div className="text-right">
            <div className="text-base font-bold">
              Bs
              {orders
                .reduce((s, o) => s + o._totalRaw, 0)
                .toLocaleString()}
            </div>
            <div className="text-[0.6rem] opacity-60">Ventas totales</div>
          </div>
        </div>
        <div
          className="flex items-center gap-2 text-white py-1 pl-1 pr-3 rounded-lg cursor-pointer hover:bg-white/10 transition-all duration-200"
          onClick={() => {
            useAuthStore.getState().logout();
            router.push('/');
          }}
        >
          <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center font-bold text-xs text-white">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="text-xs font-medium block">{userName}</span>
            <span className="text-[0.58rem] text-white/40 block">Vendedor</span>
          </div>
        </div>
      </header>

      {/* ═══ TABS ═══ */}
      <div className="bg-white border-b border-gray-200 flex gap-0 px-6 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-5 py-3 border-0 bg-none text-sm cursor-pointer whitespace-nowrap transition-all duration-150 ${
              activeTab === t.id
                ? 'text-primary font-semibold border-b-[3px] border-primary'
                : 'text-gray-500 font-medium border-b-[3px] border-transparent'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══ MENSAJE DE CONFIRMACIÓN ═══ */}
      {confirmMsg && (
        <div
          className={`fixed top-4 right-4 z-[500] px-5 py-3 rounded-xl text-sm font-semibold shadow-lg transition-all duration-300 ${
            confirmMsg.type === 'success' ? 'bg-success text-white' : 'bg-warning text-white'
          }`}
        >
          {confirmMsg.text}
        </div>
      )}

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="px-6 py-5 flex-1 overflow-y-auto">
        {/* ── TAB: RESUMEN ── */}
        {activeTab === 'resumen' && (
          <>
            <h3 className="text-base text-gray-700 mb-4">📊 Resumen de Ventas</h3>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-3.5 mb-6">
              {stats.map((s, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-[0.68rem] text-gray-500 font-medium">{s.label}</span>
                    <s.icon style={{ color: s.color, fontSize: '1.1rem' }} />
                  </div>
                  <div className="text-2xl font-bold text-gray-800">{s.value}</div>
                </div>
              ))}
            </div>

            <h4 className="text-sm text-primary mb-2.5">⚠️ Pedidos Pendientes</h4>
            <table className="w-full border-collapse bg-white rounded-lg overflow-hidden border border-gray-200">
              <thead className="bg-primary">
                <tr>
                  <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">PEDIDO</th>
                  <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">CLIENTE</th>
                  <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">FECHA</th>
                  <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">TOTAL</th>
                  <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">PAGO</th>
                  <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {orders
                  .filter((o) => o.estado === 'Pendiente')
                  .map((o) => (
                    <tr key={o.id} className="border-b border-gray-100 transition-colors duration-100 even:bg-gray-50 hover:bg-primary-100">
                      <td className="px-3 py-2 text-xs text-primary-light font-semibold font-mono">{o.id}</td>
                      <td className="px-3 py-2 text-xs text-gray-700 font-medium">{o.customer}</td>
                      <td className="px-3 py-2 text-xs text-gray-700" style={{ color: '#4A5568' }}>{o.fecha}</td>
                      <td className="px-3 py-2 text-xs text-gray-700 font-semibold">{o.total}</td>
                      <td className="px-3 py-2 text-xs">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[0.65rem] font-semibold ${badge(o.pago)}`}>{o.pago}</span>
                      </td>
                      <td className="px-3 py-2 text-xs">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[0.65rem] font-semibold ${badge(o.estado)}`}>{o.estado}</span>
                      </td>
                    </tr>
                  ))}
                {orders.filter((o) => o.estado === 'Pendiente').length === 0 && (
                  <tr className="border-b border-gray-100">
                    <td colSpan={6} className="px-7 py-7 text-center text-gray-400 text-xs">
                      No hay pedidos pendientes ✅
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}

        {/* ── TAB: CLIENTES ── */}
        {activeTab === 'clientes' && (
          <>
            <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
              <h3 className="text-base text-gray-700">👥 Mis Clientes</h3>
              <div className="flex items-center bg-white border border-gray-200 rounded-md px-2.5 min-w-[200px] flex-1 max-w-[300px] focus-within:border-primary-light">
                <FiSearch style={{ color: '#A0AEC0', flexShrink: 0 }} />
                <input
                  placeholder="Buscar cliente..."
                  value={searchC}
                  onChange={(e) => setSearchC(e.target.value)}
                  className="border-0 bg-transparent py-2 pl-1.5 text-xs outline-none w-full text-gray-700"
                />
              </div>
            </div>
            <table className="w-full border-collapse bg-white rounded-lg overflow-hidden border border-gray-200">
              <thead className="bg-primary">
                <tr>
                  <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">CLIENTE</th>
                  <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">EMAIL</th>
                  <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">TELÉFONO</th>
                  <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">COMPRAS</th>
                  <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">ÚLTIMA</th>
                  <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="border-b border-gray-100 transition-colors duration-100 even:bg-gray-50 hover:bg-primary-100">
                    <td className="px-3 py-2 text-xs text-gray-700 font-medium">{c.name}</td>
                    <td className="px-3 py-2 text-xs text-gray-700" style={{ color: '#4A5568' }}>{c.email}</td>
                    <td className="px-3 py-2 text-xs text-gray-700">{c.tel}</td>
                    <td className="px-3 py-2 text-xs text-gray-700 font-semibold">{c.totalCompras}</td>
                    <td className="px-3 py-2 text-xs text-gray-700" style={{ color: '#4A5568' }}>{c.ultimaCompra}</td>
                    <td className="px-3 py-2 text-xs">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[0.65rem] font-semibold ${
                          c.estado === 'Activo' ? 'bg-[#C6F6D5] text-[#22543D]' : 'bg-[#FED7D7] text-[#9B2C2C]'
                        }`}
                      >
                        {c.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* ── TAB: PEDIDOS ── */}
        {activeTab === 'pedidos' && (
          <>
            <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
              <h3 className="text-base text-gray-700">📦 Todos los Pedidos</h3>
              <div className="flex gap-2">
                <div className="flex items-center bg-white border border-gray-200 rounded-md px-2.5 min-w-[200px] flex-1 max-w-[300px] focus-within:border-primary-light">
                  <FiSearch style={{ color: '#A0AEC0', flexShrink: 0 }} />
                  <input
                    placeholder="Buscar pedido o cliente..."
                    value={searchO}
                    onChange={(e) => setSearchO(e.target.value)}
                    className="border-0 bg-transparent py-2 pl-1.5 text-xs outline-none w-full text-gray-700"
                  />
                </div>
                <button
                  onClick={() => setVentaOpen(true)}
                  className="bg-accent hover:bg-accent-light border-0 text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 flex items-center gap-1.5"
                >
                  <FiPlus /> Nueva Venta
                </button>
              </div>
            </div>

            <table className="w-full border-collapse bg-white rounded-lg overflow-hidden border border-gray-200">
              <thead className="bg-primary">
                <tr>
                  <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">ID</th>
                  <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">CLIENTE</th>
                  <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">FECHA</th>
                  <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">ITEMS</th>
                  <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">TOTAL</th>
                  <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">PAGO</th>
                  <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">ESTADO</th>
                  <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">ACCIÓN</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="border-b border-gray-100 transition-colors duration-100 even:bg-gray-50 hover:bg-primary-100">
                    <td className="px-3 py-2 text-xs text-primary-light font-semibold font-mono">{o.id}</td>
                    <td className="px-3 py-2 text-xs text-gray-700 font-medium">{o.customer}</td>
                    <td className="px-3 py-2 text-xs text-gray-700" style={{ color: '#4A5568' }}>{o.fecha}</td>
                    <td className="px-3 py-2 text-xs text-gray-700">{o.items}</td>
                    <td className="px-3 py-2 text-xs text-gray-700 font-semibold">{o.total}</td>
                    <td className="px-3 py-2 text-xs">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[0.65rem] font-semibold ${badge(o.pago)}`}>{o.pago}</span>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[0.65rem] font-semibold ${badge(o.estado)}`}>{o.estado}</span>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <div className="flex gap-1">
                        {o.estado === 'Pendiente' && (
                          <>
                            <button
                              onClick={() => confirmOrder(o.id)}
                              className="bg-success hover:brightness-110 border-0 text-white px-2.5 py-1.5 rounded-md text-[0.6rem] font-semibold cursor-pointer transition-all flex items-center gap-1"
                              title="Confirmar pedido"
                            >
                              <FiCheck size={11} /> Confirmar
                            </button>
                            <button
                              onClick={() => cancelOrder(o.id)}
                              className="bg-danger hover:brightness-110 border-0 text-white px-2.5 py-1.5 rounded-md text-[0.6rem] font-semibold cursor-pointer transition-all"
                              title="Cancelar pedido"
                            >
                              <FiX size={11} />
                            </button>
                          </>
                        )}
                        {o.estado === 'Completado' && (
                          <button
                            onClick={() => despacharOrder(o.id)}
                            className="bg-info hover:brightness-110 border-0 text-white px-2.5 py-1.5 rounded-md text-[0.6rem] font-semibold cursor-pointer transition-all"
                          >
                            🚚 Despachar
                          </button>
                        )}
                        {o.estado === 'Despachado' && (
                          <span className="text-[0.6rem] text-gray-400">✔ Despachado</span>
                        )}
                        {o.estado === 'Cancelado' && (
                          <span className="text-[0.6rem] text-danger">✗ Cancelado</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr className="border-b border-gray-100">
                    <td colSpan={8} className="px-7 py-7 text-center text-gray-400 text-xs">
                      No hay pedidos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}

        {/* ── TAB: VENTAS ── */}
        {activeTab === 'ventas' && (
          <>
            <h3 className="text-base text-gray-700 mb-4">💰 Ventas Completadas</h3>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3.5 mb-5">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-[0.68rem] text-gray-500 font-medium mb-1">Ventas Totales</div>
                <div className="text-2xl font-bold text-success">
                  {orders.filter((o) => o.estado === 'Completado').length}
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-[0.68rem] text-gray-500 font-medium mb-1">Ingreso Total</div>
                <div className="text-2xl font-bold text-success">
                  Bs
                  {orders
                    .reduce(
                      (s, o) =>
                        s + (o.estado === 'Completado' ? o._totalRaw : 0),
                      0,
                    )
                    .toLocaleString()}
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-[0.68rem] text-gray-500 font-medium mb-1">Pedido Promedio</div>
                <div className="text-2xl font-bold text-primary">
                  Bs
                  {orders.filter((o) => o.estado === 'Completado').length > 0
                    ? (
                        orders.reduce(
                          (s, o) =>
                            s +
                            (o.estado === 'Completado' ? o._totalRaw : 0),
                          0,
                        ) / orders.filter((o) => o.estado === 'Completado').length
                      ).toFixed(2)
                    : '0'}
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-[0.68rem] text-gray-500 font-medium mb-1">Productos Vendidos</div>
                <div className="text-2xl font-bold text-primary">
                  {orders.reduce((s, o) => s + (o.estado === 'Completado' ? o.items : 0), 0)}
                </div>
              </div>
            </div>

            <h4 className="text-sm text-primary mb-2.5">Historial de Ventas</h4>
            <table className="w-full border-collapse bg-white rounded-lg overflow-hidden border border-gray-200">
              <thead className="bg-primary">
                <tr>
                  <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">PEDIDO</th>
                  <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">CLIENTE</th>
                  <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">FECHA</th>
                  <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">ITEMS</th>
                  <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">TOTAL</th>
                  <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">PAGO</th>
                </tr>
              </thead>
              <tbody>
                {orders
                  .filter((o) => o.estado === 'Completado')
                  .map((o) => (
                    <tr key={o.id} className="border-b border-gray-100 transition-colors duration-100 even:bg-gray-50 hover:bg-primary-100">
                      <td className="px-3 py-2 text-xs text-primary-light font-semibold font-mono">{o.id}</td>
                      <td className="px-3 py-2 text-xs text-gray-700 font-medium">{o.customer}</td>
                      <td className="px-3 py-2 text-xs text-gray-700" style={{ color: '#4A5568' }}>{o.fecha}</td>
                      <td className="px-3 py-2 text-xs text-gray-700">{o.items}</td>
                      <td className="px-3 py-2 text-xs text-success font-semibold">{o.total}</td>
                      <td className="px-3 py-2 text-xs">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[0.65rem] font-semibold ${badge(o.pago)}`}>{o.pago}</span>
                      </td>
                    </tr>
                  ))}
                {orders.filter((o) => o.estado === 'Completado').length === 0 && (
                  <tr className="border-b border-gray-100">
                    <td colSpan={6} className="px-7 py-7 text-center text-gray-400 text-xs">
                      No hay ventas completadas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}

        {/* ── TAB: COTIZACIONES ── */}
        {activeTab === 'cotizaciones' && (
          <>
            <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
              <h3 className="text-base text-gray-700">📋 Cotizaciones</h3>
              <button
                onClick={() => {
                  setNewQuote({ customerName: '', items: [], validez_dias: 30, notas: '' });
                  setProdSearchQ('');
                  setCotizOpen(true);
                }}
                className="bg-accent hover:brightness-110 border-0 text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5"
              >
                <FiPlus /> Nueva Cotización
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-3">Presupuestos y cotizaciones a clientes</p>

            <table className="w-full border-collapse bg-white rounded-lg overflow-hidden border border-gray-200">
              <thead className="bg-primary">
                <tr>
                  <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">COTIZACIÓN</th>
                  <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">CLIENTE</th>
                  <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">FECHA</th>
                  <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">ITEMS</th>
                  <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">TOTAL</th>
                  <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">VALIDEZ</th>
                  <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {cotizaciones.map((c) => (
                  <tr key={c.id} className="border-b border-gray-100 transition-colors duration-100 even:bg-gray-50 hover:bg-primary-100">
                    <td className="px-3 py-2 text-xs text-primary-light font-semibold font-mono">{c.codigo}</td>
                    <td className="px-3 py-2 text-xs text-gray-700 font-medium">{c.cliente}</td>
                    <td className="px-3 py-2 text-xs text-gray-700">{c.fecha}</td>
                    <td className="px-3 py-2 text-xs text-gray-700">{c.itemsCount} uds</td>
                    <td className="px-3 py-2 text-xs text-gray-700 font-semibold">{formatPrice(c.total)}</td>
                    <td className="px-3 py-2 text-xs text-gray-700">{c.validez_dias} días</td>
                    <td className="px-3 py-2 text-xs">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[0.65rem] font-semibold ${badge(c.estado)}`}>{c.estado}</span>
                    </td>
                  </tr>
                ))}
                {cotizaciones.length === 0 && (
                  <tr className="border-b border-gray-100">
                    <td colSpan={7} className="px-7 py-7 text-center text-gray-400 text-xs">
                      No hay cotizaciones aún
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* ═══ MODAL: NUEVA COTIZACIÓN ═══ */}
      {cotizOpen && (
        <div className="fixed inset-0 bg-black/50 z-[400] flex items-start justify-center p-5 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-[700px] my-5 overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-primary text-white">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <FiPlus /> Nueva Cotización
              </h3>
              <button
                className="w-8 h-8 flex items-center justify-center border-0 rounded-md bg-white/15 cursor-pointer text-white hover:bg-white/25 transition-all"
                onClick={() => {
                  setCotizOpen(false);
                  setNewQuote({ customerName: '', items: [], validez_dias: 30, notas: '' });
                  setProdSearchQ('');
                }}
              >
                <FiX size={16} />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {/* Selector de Cliente */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">CLIENTE</label>
                <select
                  value={newQuote.customerName}
                  onChange={(e) => setNewQuote((prev) => ({ ...prev, customerName: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none bg-white focus:border-primary-light"
                >
                  <option value="">Seleccioná un cliente...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <input
                  placeholder="O escribí un nombre nuevo..."
                  value={
                    !customers.find((c) => c.name === newQuote.customerName)
                      ? newQuote.customerName
                      : ''
                  }
                  onChange={(e) => setNewQuote((prev) => ({ ...prev, customerName: e.target.value }))}
                  className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-700 outline-none focus:border-primary-light"
                />
              </div>

              {/* Buscador de Productos */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">AGREGAR PRODUCTOS</label>
                <div className="flex items-center bg-white border border-gray-200 rounded-md px-2.5 focus-within:border-primary-light">
                  <FiSearch />
                  <input
                    placeholder="Buscar productos..."
                    value={prodSearchQ}
                    onChange={(e) => setProdSearchQ(e.target.value)}
                    className="border-0 bg-transparent py-2 pl-1.5 text-xs outline-none w-full text-gray-700"
                  />
                </div>
              </div>

              {/* Grid de productos */}
              {prodSearchQ && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4 max-h-[200px] overflow-y-auto border border-gray-100 rounded-lg p-2">
                  {products.filter(
                    (p) => p.name.toLowerCase().includes(prodSearchQ.toLowerCase()) ||
                           p.cat.toLowerCase().includes(prodSearchQ.toLowerCase())
                  ).map((p) => {
                    const inCart = newQuote.items.find((i) => i.id === p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          setNewQuote((prev) => {
                            const existing = prev.items.find((i) => i.id === p.id);
                            if (existing) {
                              return { ...prev, items: prev.items.map((i) => i.id === p.id ? { ...i, qty: i.qty + 1 } : i) };
                            }
                            return { ...prev, items: [...prev.items, { ...p, qty: 1, precio: p.price }] };
                          });
                        }}
                        className={`text-left p-2.5 rounded-lg border text-xs transition-all cursor-pointer ${
                          inCart ? 'bg-primary-100 border-primary text-primary' : 'bg-white border-gray-200 text-gray-700 hover:border-primary-light hover:bg-gray-50'
                        }`}
                      >
                        <div className="text-lg mb-0.5">{p.icon}</div>
                        <div className="font-semibold leading-tight">{p.name}</div>
                        <div className="text-[0.6rem] text-gray-400">{p.cat}</div>
                        <div className="text-primary font-bold mt-0.5">Bs{p.price.toFixed(2)}</div>
                      </button>
                    );
                  })}
                  {products.filter(
                    (p) => p.name.toLowerCase().includes(prodSearchQ.toLowerCase()) ||
                           p.cat.toLowerCase().includes(prodSearchQ.toLowerCase())
                  ).length === 0 && (
                    <div className="col-span-full text-center py-4 text-gray-400 text-xs">Sin resultados</div>
                  )}
                </div>
              )}

              {/* Items agregados */}
              {newQuote.items.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-600 mb-2">
                    PRODUCTOS AGREGADOS ({newQuote.items.reduce((s, i) => s + i.qty, 0)} uds)
                  </h4>
                  <div className="space-y-1.5">
                    {newQuote.items.map((i) => (
                      <div key={i.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                        <span className="text-lg">{i.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-gray-700 truncate">{i.name}</div>
                          <div className="text-[0.6rem] text-gray-400">Bs{i.price.toFixed(2)} c/u</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button className="w-[22px] h-[22px] border border-gray-200 rounded cursor-pointer flex items-center justify-center text-xs bg-white text-gray-600 hover:bg-gray-100"
                            onClick={() => setNewQuote((prev) => ({
                              ...prev,
                              items: prev.items.map((it) => it.id === i.id ? { ...it, qty: Math.max(1, it.qty - 1) } : it)
                                .filter((it) => it.qty > 0),
                            }))}>
                            <FiMinus size={10} />
                          </button>
                          <span className="text-xs font-semibold min-w-[18px] text-center">{i.qty}</span>
                          <button className="w-[22px] h-[22px] border border-gray-200 rounded cursor-pointer flex items-center justify-center text-xs bg-white text-gray-600 hover:bg-gray-100"
                            onClick={() => setNewQuote((prev) => ({
                              ...prev,
                              items: prev.items.map((it) => it.id === i.id ? { ...it, qty: it.qty + 1 } : it),
                            }))}>
                            <FiPlus size={10} />
                          </button>
                        </div>
                        <div className="text-xs font-bold text-primary min-w-[55px] text-right">
                          Bs{(i.price * i.qty).toFixed(2)}
                        </div>
                        <button className="text-gray-400 hover:text-danger cursor-pointer bg-none border-0"
                          onClick={() => setNewQuote((prev) => ({
                            ...prev,
                            items: prev.items.filter((it) => it.id !== i.id),
                          }))}>
                          <FiX size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vigencia + Notas */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">VALIDEZ (días)</label>
                  <input type="number" min="1" value={newQuote.validez_dias}
                    onChange={(e) => setNewQuote((prev) => ({ ...prev, validez_dias: parseInt(e.target.value) || 30 }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:border-primary-light" />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">NOTAS</label>
                <textarea rows={2} value={newQuote.notas}
                  onChange={(e) => setNewQuote((prev) => ({ ...prev, notas: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:border-primary-light resize-none" />
              </div>

              {/* Resumen de totales */}
              {(() => {
                const qSubtotal = newQuote.items.reduce((s, i) => s + i.price * i.qty, 0);
                const qImpuesto = qSubtotal * 0.05;
                const qTotal = qSubtotal + qImpuesto;
                const qCount = newQuote.items.reduce((s, i) => s + i.qty, 0);
                return (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-1.5">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Subtotal ({qCount} productos)</span>
                      <span>Bs{qSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Impuesto (5%)</span>
                      <span>Bs{qImpuesto.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1.5 border-t border-gray-200">
                      <span className="text-sm font-semibold text-gray-700">Total</span>
                      <span className="text-2xl font-bold text-primary">Bs{qTotal.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-2.5">
              <button
                className="px-5 py-2.5 rounded-lg text-sm font-semibold cursor-pointer bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all"
                onClick={() => {
                  setCotizOpen(false);
                  setNewQuote({ customerName: '', items: [], validez_dias: 30, notas: '' });
                  setProdSearchQ('');
                }}
              >
                Cancelar
              </button>
              <button
                className="px-5 py-2.5 rounded-lg text-sm font-semibold cursor-pointer bg-accent text-white border-0 hover:brightness-110 transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!newQuote.customerName || newQuote.items.length === 0}
                onClick={async () => {
                  const qSubtotal = newQuote.items.reduce((s, i) => s + i.price * i.qty, 0);
                  const qImpuesto = qSubtotal * 0.05;
                  const qTotal = qSubtotal + qImpuesto;

                  try {
                    await fetch('/api/cotizaciones', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        cliente: newQuote.customerName,
                        items: newQuote.items.map((i) => ({
                          producto_id: i.id,
                          nombre: i.name,
                          cantidad: i.qty,
                          precio: i.price,
                        })),
                        subtotal: qSubtotal,
                        impuesto: qImpuesto,
                        total: qTotal,
                        validez_dias: newQuote.validez_dias,
                        notas: newQuote.notas,
                        estado: 'Pendiente',
                        creado_por: user?.id,
                      }),
                    });

                    // Refresh cotizaciones
                    const res = await fetch('/api/cotizaciones?limit=200&sort=-created_at').then(r => r.json());
                    setCotizaciones((res.data || []).map(mapCotizacion));

                    setCotizOpen(false);
                    setNewQuote({ customerName: '', items: [], validez_dias: 30, notas: '' });
                    setProdSearchQ('');
                  } catch (err) {
                    console.error('Error al crear cotización:', err);
                  }
                }}
              >
                <FiCheck /> Guardar Cotización
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: NUEVA VENTA ═══ */}
      {ventaOpen && (
        <div className="fixed inset-0 bg-black/50 z-[400] flex items-start justify-center p-5 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-[700px] my-5 overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-primary text-white">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <FiPlus /> Nueva Venta
              </h3>
              <button
                className="w-8 h-8 border-0 rounded-md bg-white/15 cursor-pointer flex items-center justify-center text-white hover:bg-white/25 transition-all"
                onClick={() => {
                  setVentaOpen(false);
                  setNewSale({ customerId: null, customerName: '', items: [], pago: 'Efectivo' });
                  setProdSearch('');
                  setMontoRecibido('');
                }}
              >
                <FiX size={16} />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {/* Selector de Cliente */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">CLIENTE</label>
                <select
                  value={newSale.customerName}
                  onChange={(e) => setNewSale((prev) => ({ ...prev, customerName: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none bg-white focus:border-primary-light"
                >
                  <option value="">Seleccioná un cliente...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {/* O escribir nombre manual */}
                <input
                  placeholder="O escribí un nombre nuevo..."
                  value={
                    !customers.find((c) => c.name === newSale.customerName)
                      ? newSale.customerName
                      : ''
                  }
                  onChange={(e) => setNewSale((prev) => ({ ...prev, customerName: e.target.value }))}
                  className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-700 outline-none focus:border-primary-light"
                />
              </div>

              {/* Buscador de Productos */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">AGREGAR PRODUCTOS</label>
                <div className="flex items-center bg-white border border-gray-200 rounded-md px-2.5 focus-within:border-primary-light">
                  <FiSearch style={{ color: '#A0AEC0', flexShrink: 0 }} />
                  <input
                    placeholder="Buscar productos..."
                    value={prodSearch}
                    onChange={(e) => setProdSearch(e.target.value)}
                    className="border-0 bg-transparent py-2 pl-1.5 text-xs outline-none w-full text-gray-700"
                  />
                </div>
              </div>

              {/* Grid de productos */}
              {prodSearch && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4 max-h-[200px] overflow-y-auto border border-gray-100 rounded-lg p-2">
                  {filteredProds.map((p) => {
                    const inCart = newSale.items.find((i) => i.id === p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() => addProductToSale(p)}
                        className={`text-left p-2.5 rounded-lg border text-xs transition-all cursor-pointer ${
                          inCart
                            ? 'bg-primary-100 border-primary text-primary'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-primary-light hover:bg-gray-50'
                        }`}
                      >
                        <div className="text-lg mb-0.5">{p.icon}</div>
                        <div className="font-semibold leading-tight">{p.name}</div>
                        <div className="text-[0.6rem] text-gray-400">{p.cat}</div>
                        <div className="text-primary font-bold mt-0.5">Bs{p.price.toFixed(2)}</div>
                      </button>
                    );
                  })}
                  {filteredProds.length === 0 && (
                    <div className="col-span-full text-center py-4 text-gray-400 text-xs">
                      Sin resultados
                    </div>
                  )}
                </div>
              )}

              {/* Items agregados */}
              {newSale.items.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-600 mb-2">
                    PRODUCTOS AGREGADOS ({saleCount} uds)
                  </h4>
                  <div className="space-y-1.5">
                    {newSale.items.map((i) => (
                      <div key={i.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                        <span className="text-lg">{i.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-gray-700 truncate">{i.name}</div>
                          <div className="text-[0.6rem] text-gray-400">Bs{i.price.toFixed(2)} c/u</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            className="w-[22px] h-[22px] border border-gray-200 rounded cursor-pointer flex items-center justify-center text-xs bg-white text-gray-600 hover:bg-gray-100"
                            onClick={() => updateSaleQty(i.id, -1)}
                          >
                            <FiMinus size={10} />
                          </button>
                          <span className="text-xs font-semibold min-w-[18px] text-center">{i.qty}</span>
                          <button
                            className="w-[22px] h-[22px] border border-gray-200 rounded cursor-pointer flex items-center justify-center text-xs bg-white text-gray-600 hover:bg-gray-100"
                            onClick={() => updateSaleQty(i.id, 1)}
                          >
                            <FiPlus size={10} />
                          </button>
                        </div>
                        <div className="text-xs font-bold text-primary min-w-[55px] text-right">
                          Bs{(i.price * i.qty).toFixed(2)}
                        </div>
                        <button
                          className="text-gray-400 hover:text-danger cursor-pointer bg-none border-0"
                          onClick={() => removeFromSale(i.id)}
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Método de pago */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">MÉTODO DE PAGO</label>
                <div className="flex gap-2">
                  {['Efectivo', 'Tarjeta', 'QR', 'Transferencia'].map((m) => (
                    <button
                      key={m}
                      onClick={() => setNewSale((prev) => ({ ...prev, pago: m }))}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer border transition-all ${
                        newSale.pago === m
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-primary-light'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Total ({saleCount} productos)</span>
                  <span className="text-2xl font-bold text-primary">Bs{saleTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Change calculation for Efectivo */}
              {newSale.pago === 'Efectivo' && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <label className="block text-xs font-semibold text-gray-600 mb-2">💰 MONTO RECIBIDO</label>
                  <input type="number" step="0.01" min="0" placeholder="0.00"
                    value={montoRecibido}
                    onChange={e => setMontoRecibido(e.target.value)}
                    className="w-full px-3 py-2.5 border border-blue-200 rounded-lg text-lg font-bold text-gray-700 outline-none focus:border-primary-light bg-white" />
                  {parseFloat(montoRecibido) >= saleTotal && (
                    <div className="mt-3 flex justify-between items-center bg-white rounded-lg p-3 border border-blue-100">
                      <span className="text-sm text-gray-600">Vuelto</span>
                      <span className="text-xl font-bold text-success">Bs{(parseFloat(montoRecibido) - saleTotal).toFixed(2)}</span>
                    </div>
                  )}
                  {montoRecibido && parseFloat(montoRecibido) < saleTotal && (
                    <p className="text-xs text-danger mt-1">Faltan Bs{(saleTotal - parseFloat(montoRecibido)).toFixed(2)}</p>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-2.5">
              <button
                className="px-5 py-2.5 rounded-lg text-sm font-semibold cursor-pointer bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all"
                onClick={() => {
                  setVentaOpen(false);
                  setNewSale({ customerId: null, customerName: '', items: [], pago: 'Efectivo' });
                  setProdSearch('');
                  setMontoRecibido('');
                }}
              >
                Cancelar
              </button>
              <button
                className="px-5 py-2.5 rounded-lg text-sm font-semibold cursor-pointer bg-accent text-white border-0 hover:brightness-110 transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!newSale.customerName || newSale.items.length === 0 || (newSale.pago === 'Efectivo' && (!montoRecibido || parseFloat(montoRecibido) < saleTotal))}
                onClick={confirmNewSale}
              >
                <FiCheck /> Confirmar Venta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
