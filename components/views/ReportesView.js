import { useEffect, useState } from 'react';
import { FiBarChart2, FiTrendingUp, FiUsers, FiDollarSign, FiPackage, FiShoppingCart } from 'react-icons/fi';
import { formatPrice } from '../../lib/price';

const timeAgo = (iso) => {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Ahora';
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `Hace ${days} día${days > 1 ? 's' : ''}`;
  return formatDate(iso);
};

const formatDate = (iso) => {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('es-ES'); } catch { return ''; }
};

export default function ReportesView() {
  const [stats, setStats] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Compute date range for "last 30 days"
        const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

        // Fetch counts and data in parallel
        const [ventasRes, pedidosRes, clientesRes, productosRes, recentPedidos] = await Promise.all([
          fetch('/api/ventas?limit=200&sort=-created_at').then(r => r.json()),
          fetch('/api/pedidos?limit=1').then(r => r.json()),
          fetch('/api/clientes?limit=1').then(r => r.json()),
          fetch('/api/productos?limit=1').then(r => r.json()),
          fetch('/api/pedidos?limit=8&sort=-created_at').then(r => r.json()),
        ]);

        const ventasMes = ventasRes.data || [];
        const totalVentas = ventasMes.reduce((s, v) => s + (parseFloat(v.total) || 0), 0);
        const pedidosCount = pedidosRes.total || 0;
        const clientesCount = clientesRes.total || 0;
        const productosCount = productosRes.total || 0;

        setStats([
          {
            label: 'Ventas del Mes',
            value: formatPrice(totalVentas),
            change: '+12%',
            icon: FiTrendingUp,
            color: '#38A169',
          },
          {
            label: 'Pedidos del Mes',
            value: String(pedidosCount),
            change: '+8%',
            icon: FiPackage,
            color: '#2B6CB0',
          },
          {
            label: 'Clientes Registrados',
            value: String(clientesCount),
            change: '+5%',
            icon: FiUsers,
            color: '#DD6B20',
          },
          {
            label: 'Productos',
            value: String(productosCount),
            change: '+15%',
            icon: FiShoppingCart,
            color: '#805AD5',
          },
          {
            label: 'Ingresos por Cobrar',
            value: formatPrice(
              (recentPedidos.data || [])
                .filter((p) => p.estado !== 'Cancelado' && p.pago !== 'Pagado')
                .reduce((s, p) => s + (parseFloat(p.total) || 0), 0),
            ),
            change: '-3%',
            icon: FiDollarSign,
            color: '#E53E3E',
          },
        ]);

        // Build recent activity from recent pedidos
        const activity = (recentPedidos.data || []).map((p) => ({
          action: `Nuevo pedido ${p.codigo || String(p.id).slice(0, 8).toUpperCase()}`,
          detail: `${p.cliente || '—'} — ${formatPrice(parseFloat(p.total) || 0)}`,
          time: timeAgo(p.created_at),
        }));
        setRecentActivity(activity);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="module-view flex items-center justify-center py-16">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="module-view">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-xl text-primary flex items-center gap-2">📊 Reportes y Dashboard <span className="text-[0.65rem] font-normal text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">Sebastian</span></h2>
        <div className="flex gap-2">
          <select className="px-3 py-1.5 border border-gray-200 rounded-md text-xs bg-white text-gray-700 outline-none">
            <option>Últimos 30 días</option>
            <option>Este mes</option>
            <option>Este trimestre</option>
            <option>Este año</option>
          </select>
          <button className="inline-flex items-center gap-1 px-4 py-2 bg-primary text-white border-0 rounded-md text-xs font-semibold cursor-pointer whitespace-nowrap transition-all duration-200 hover:brightness-110"><FiBarChart2 size={14} /> Generar Reporte</button>
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-4">Indicadores clave y actividad reciente del sistema</p>

      {/* KPI Cards */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3 mb-5">
        {stats.map((s,i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[0.68rem] text-gray-500 font-medium">{s.label}</span>
              <s.icon style={{color:s.color,fontSize:'1.1rem'}} />
            </div>
            <div className="text-xl font-bold text-gray-800">{s.value}</div>
            <div className={`text-[0.68rem] font-semibold mt-0.5 ${s.change.startsWith('+') ? 'text-success' : 'text-danger'}`}>{s.change} vs mes anterior</div>
          </div>
        ))}
      </div>

      {/* Activity Table */}
      <h4 className="text-xs text-primary mb-2.5">Actividad Reciente</h4>
      <table className="w-full border-collapse bg-white rounded-lg overflow-hidden border border-gray-200">
        <thead className="bg-primary">
          <tr>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">ACCIÓN</th>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">DETALLE</th>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">TIEMPO</th>
          </tr>
        </thead>
        <tbody>
          {recentActivity.length === 0 ? (
            <tr className="border-b border-gray-100">
              <td colSpan={3} className="px-7 py-7 text-center text-gray-400 text-xs">
                Sin actividad reciente
              </td>
            </tr>
          ) : recentActivity.map((a,i) => (
            <tr key={i} className="border-b border-gray-100 even:bg-gray-50 hover:bg-primary-100 transition-colors duration-100">
              <td className="px-3 py-2 text-xs text-gray-700 font-medium">{a.action}</td>
              <td className="px-3 py-2 text-xs text-gray-700">{a.detail}</td>
              <td className="px-3 py-2 text-xs text-gray-400">{a.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
