import { useEffect, useState } from 'react';
import {
  FiBarChart2,
  FiTrendingUp,
  FiUsers,
  FiDollarSign,
  FiPackage,
  FiShoppingCart,
  FiAlertTriangle,
} from 'react-icons/fi';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { formatPrice } from '../../lib/price';

const formatDateTime = (iso) => {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch { return ''; }
};

const PIE_COLORS = ['#38A169', '#2B6CB0', '#DD6B20', '#E53E3E', '#805AD5', '#D69E2E'];

const groupByDay = (data, days = 14) => {
  const map = {};
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    map[key] = 0;
  }
  data.forEach((v) => {
    if (!v.created_at && !v.fecha) return;
    const d = new Date(v.created_at || v.fecha);
    const key = d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    if (map[key] !== undefined) map[key] += parseFloat(v.total) || 0;
  });
  return Object.entries(map).map(([fecha, total]) => ({ fecha, total: Math.round(total * 100) / 100 }));
};

const countByStatus = (data) => {
  const map = {};
  data.forEach((p) => {
    const s = p.estado || 'Desconocido';
    map[s] = (map[s] || 0) + 1;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
};

export default function ReportesView() {
  const [stats, setStats] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [bajoStock, setBajoStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [
          ventasRes,
          pedidosRes,
          clientesRes,
          productosRes,
          recentPedidos,
          productosBajoRes,
          pedidosTodosRes,
        ] = await Promise.all([
          fetch('/api/ventas?limit=500&sort=-created_at').then((r) => r.json()),
          fetch('/api/pedidos?limit=1').then((r) => r.json()),
          fetch('/api/clientes?limit=1').then((r) => r.json()),
          fetch('/api/productos?limit=1').then((r) => r.json()),
          fetch('/api/pedidos?limit=8&sort=-created_at').then((r) => r.json()),
          fetch('/api/productos?limit=10&sort=stock&sort_dir=asc').catch(() => ({ data: [] })),
          fetch('/api/pedidos?limit=500&sort=-created_at').then((r) => r.json()),
        ]);

        const ventasMes = ventasRes.data || [];
        const totalVentas = ventasMes.reduce(
          (s, v) => s + (parseFloat(v.total) || 0),
          0,
        );

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

        // Ventas por día (últimos 14 días)
        setChartData(groupByDay(ventasMes, 14));

        // Pedidos por estado
        setStatusData(countByStatus(pedidosTodosRes.data || []));

        // Productos con bajo stock
        const bajos = (productosBajoRes.data || [])
          .filter((p) => p.stock <= (p.stock_minimo || 5))
          .slice(0, 10)
          .map((p) => ({ nombre: p.nombre.length > 22 ? p.nombre.slice(0, 20) + '…' : p.nombre, stock: p.stock, minimo: p.stock_minimo || 5 }));
        setBajoStock(bajos);

        const activity = (recentPedidos.data || []).map((p) => ({
          action: `Nuevo pedido ${p.codigo || String(p.id).slice(0, 8).toUpperCase()}`,
          detail: `${p.cliente || '—'} — ${formatPrice(parseFloat(p.total) || 0)}`,
          time: formatDateTime(p.created_at),
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

  const handleGenerateReport = async () => {
    if (generatingPdf) return;

    try {
      setGeneratingPdf(true);

      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const margin = 15;
      let y = 18;

      const fecha = new Date().toLocaleDateString('es-BO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      pdf.setTextColor(30, 41, 59);
      pdf.text('Reporte General - Ferrotech', margin, y);

      y += 8;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(80, 90, 110);
      pdf.text(`Fecha de generación: ${fecha}`, margin, y);

      y += 6;
      pdf.text('Módulo: Reportes y Dashboard', margin, y);

      y += 10;

      pdf.setDrawColor(60, 85, 120);
      pdf.setLineWidth(0.5);
      pdf.line(margin, y, pageWidth - margin, y);

      y += 10;

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13);
      pdf.setTextColor(30, 41, 59);
      pdf.text('Indicadores principales', margin, y);

      y += 8;

      const cardWidth = 85;
      const cardHeight = 24;
      const gap = 8;

      stats.forEach((item, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);

        const x = margin + col * (cardWidth + gap);
        const cardY = y + row * (cardHeight + gap);

        pdf.setDrawColor(220, 225, 235);
        pdf.setFillColor(248, 250, 252);
        pdf.roundedRect(x, cardY, cardWidth, cardHeight, 3, 3, 'FD');

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.setTextColor(70, 85, 105);
        pdf.text(item.label, x + 5, cardY + 7);

        pdf.setFontSize(14);
        pdf.setTextColor(30, 41, 59);
        pdf.text(String(item.value), x + 5, cardY + 15);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);

        if (item.change.startsWith('+')) {
          pdf.setTextColor(22, 130, 70);
        } else {
          pdf.setTextColor(200, 50, 70);
        }

        pdf.text(`${item.change} vs mes anterior`, x + 5, cardY + 21);
      });

      y += Math.ceil(stats.length / 2) * (cardHeight + gap) + 5;

      pdf.setTextColor(30, 41, 59);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13);
      pdf.text('Actividad reciente', margin, y);

      y += 8;

      const tableX = margin;
      const col1 = 70;
      const col2 = 75;
      const col3 = 30;
      const rowHeight = 8;
      const tableWidth = col1 + col2 + col3;

      const drawTableHeader = () => {
        pdf.setFillColor(60, 85, 120);
        pdf.rect(tableX, y, tableWidth, rowHeight, 'F');

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        pdf.setTextColor(255, 255, 255);

        pdf.text('ACCIÓN', tableX + 3, y + 5.5);
        pdf.text('DETALLE', tableX + col1 + 3, y + 5.5);
        pdf.text('HORA Y FECHA', tableX + col1 + col2 + 3, y + 5.5);

        y += rowHeight;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(45, 55, 72);
      };

      drawTableHeader();

      if (recentActivity.length === 0) {
        pdf.setDrawColor(230, 230, 230);
        pdf.rect(tableX, y, tableWidth, rowHeight);
        pdf.text('Sin actividad reciente', tableX + 3, y + 5.5);
        y += rowHeight;
      } else {
        recentActivity.forEach((item, index) => {
          if (y > pageHeight - 25) {
            pdf.addPage();
            y = 20;
            drawTableHeader();
          }

          if (index % 2 === 0) {
            pdf.setFillColor(248, 250, 252);
          } else {
            pdf.setFillColor(255, 255, 255);
          }

          pdf.rect(tableX, y, tableWidth, rowHeight, 'F');

          pdf.setDrawColor(230, 235, 240);
          pdf.rect(tableX, y, tableWidth, rowHeight);

          const actionText = pdf.splitTextToSize(item.action || '-', col1 - 6)[0];
          const detailText = pdf.splitTextToSize(item.detail || '-', col2 - 6)[0];
          const timeText = pdf.splitTextToSize(item.time || '-', col3 - 6)[0];

          pdf.text(actionText, tableX + 3, y + 5.5);
          pdf.text(detailText, tableX + col1 + 3, y + 5.5);
          pdf.text(timeText, tableX + col1 + col2 + 3, y + 5.5);

          y += rowHeight;
        });
      }

      const totalPages = pdf.internal.getNumberOfPages();

      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(120, 120, 120);

        pdf.text(
          'Ferrotech - Reporte generado automáticamente',
          margin,
          pageHeight - 10,
        );

        pdf.text(
          `Página ${i} de ${totalPages}`,
          pageWidth - margin - 25,
          pageHeight - 10,
        );
      }

      const fileDate = new Date().toISOString().slice(0, 10);
      pdf.save(`reporte-ferrotech-${fileDate}.pdf`);
    } catch (err) {
      console.error('Error al generar el reporte PDF:', err);
      alert('No se pudo generar el PDF del reporte.');
    } finally {
      setGeneratingPdf(false);
    }
  };

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
        <h2 className="text-xl text-primary flex items-center gap-2">
          📊 Reportes y Dashboard{' '}
          <span className="text-[0.65rem] font-normal text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">
            Sebastian
          </span>
        </h2>

        <div className="flex gap-2">
          <select className="px-3 py-1.5 border border-gray-200 rounded-md text-xs bg-white text-gray-700 outline-none">
            <option>Últimos 30 días</option>
            <option>Este mes</option>
            <option>Este trimestre</option>
            <option>Este año</option>
          </select>

          <button
            type="button"
            onClick={handleGenerateReport}
            disabled={generatingPdf}
            className="inline-flex items-center gap-1 px-4 py-2 bg-primary text-white border-0 rounded-md text-xs font-semibold cursor-pointer whitespace-nowrap transition-all duration-200 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <FiBarChart2 size={14} />
            {generatingPdf ? 'Generando...' : 'Generar Reporte'}
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-4">
        Indicadores clave y actividad reciente del sistema
      </p>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3 mb-5">
        {stats.map((s, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[0.68rem] text-gray-500 font-medium">
                {s.label}
              </span>
              <s.icon style={{ color: s.color, fontSize: '1.1rem' }} />
            </div>

            <div className="text-xl font-bold text-gray-800">{s.value}</div>

            <div
              className={`text-[0.68rem] font-semibold mt-0.5 ${
                s.change.startsWith('+') ? 'text-success' : 'text-danger'
              }`}
            >
              {s.change} vs mes anterior
            </div>
          </div>
        ))}
      </div>

      {/* ═══ CHARTS SECTION ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        {/* Ventas por día */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 lg:col-span-2">
          <h4 className="text-xs text-primary font-semibold mb-3">Ventas por Día (Últimos 14 días)</h4>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }}
                  formatter={(v) => [formatPrice(v), 'Total']}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Bar dataKey="total" fill="#2B6CB0" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-gray-400 text-xs">Sin datos de ventas</div>
          )}
        </div>

        {/* Pedidos por estado */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-xs text-primary font-semibold mb-1">Pedidos por Estado</h4>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }} />
                <Legend
                  verticalAlign="bottom"
                  height={30}
                  iconSize={8}
                  formatter={(v) => <span className="text-[0.6rem] text-gray-600">{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-gray-400 text-xs">Sin pedidos</div>
          )}
        </div>
      </div>

      {/* Bajo stock */}
      {bajoStock.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-5">
          <h4 className="text-xs text-primary font-semibold mb-3 flex items-center gap-1.5">
            <FiAlertTriangle className="text-warning" size={13} /> Productos con Stock Bajo
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={bajoStock} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
              <XAxis type="number" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="nombre" tick={{ fontSize: 10, fill: '#4B5563' }} axisLine={false} tickLine={false} width={140} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }}
                formatter={(v) => [v, 'Stock actual']}
              />
              <Bar dataKey="stock" fill="#DD6B20" radius={[0, 4, 4, 0]} maxBarSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <h4 className="text-xs text-primary mb-2.5">Actividad Reciente</h4>

      <table className="w-full border-collapse bg-white rounded-lg overflow-hidden border border-gray-200">
        <thead className="bg-primary">
          <tr>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">ACCIÓN</th>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">DETALLE</th>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">HORA Y FECHA</th>
          </tr>
        </thead>

        <tbody>
          {recentActivity.length === 0 ? (
            <tr className="border-b border-gray-100">
              <td
                colSpan={3}
                className="px-7 py-7 text-center text-gray-400 text-xs"
              >
                Sin actividad reciente
              </td>
            </tr>
          ) : (
            recentActivity.map((a, i) => (
              <tr
                key={i}
                className="border-b border-gray-100 even:bg-gray-50 hover:bg-primary-100 transition-colors duration-100"
              >
                <td className="px-3 py-2 text-xs text-gray-700 font-medium">
                  {a.action}
                </td>
                <td className="px-3 py-2 text-xs text-gray-700">
                  {a.detail}
                </td>
                <td className="px-3 py-2 text-xs text-gray-400">
                  {a.time}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}