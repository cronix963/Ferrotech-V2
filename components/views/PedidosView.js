import { useEffect, useState } from 'react';
import { FiSearch, FiPlus, FiEye, FiCheck, FiX, FiTruck, FiEdit3, FiPackage } from 'react-icons/fi';
import { usePedidosStore } from '../../stores/pedidos.store';
import LoadingSpinner from '../LoadingSpinner';
import ErrorBanner from '../ErrorBanner';
import EmptyState from '../EmptyState';
import { formatPrice } from '../../lib/price';

const badge = (s) => ({
  'Completado': 'bg-[#C6F6D5] text-[#22543D]',
  'Cancelado': 'bg-[#FED7D7] text-[#9B2C2C]',
  'Pendiente': 'bg-[#FEFCBF] text-[#744210]',
  'En Proceso': 'bg-[#FED7AA] text-[#7B341E]',
  'Preparación': 'bg-[#FED7AA] text-[#7B341E]',
  'Despachado': 'bg-blue-100 text-blue-700',
  'Pagado': 'bg-[#C6F6D5] text-[#22543D]',
}[s] || 'bg-[#FEFCBF] text-[#744210]');

const tipoBadge = (t) => ({
  'tienda': 'bg-purple-100 text-purple-700',
  'pos': 'bg-orange-100 text-orange-700',
}[t] || 'bg-gray-100 text-gray-600');

const formatDate = (iso) => {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch { return iso; }
};

const estadoFlow = ['Pendiente', 'En Proceso', 'Preparación', 'Despachado', 'Completado'];

export default function PedidosView() {
  const { items, loading, error, fetchAll, updateItem, removeItem, search, getStats } = usePedidosStore();
  const [q, setQ] = useState('');
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [filterTipo, setFilterTipo] = useState('Todos');
  const [detailPedido, setDetailPedido] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const stats = getStats();

  let filtered = q ? search(q) : items;
  if (filterEstado !== 'Todos') filtered = filtered.filter((i) => i.estado === filterEstado);
  if (filterTipo !== 'Todos') filtered = filtered.filter((i) => i.tipo === filterTipo);

  const quickUpdateEstado = async (id, nuevoEstado) => {
    setSaving(true);
    await updateItem(id, { estado: nuevoEstado });
    setSaving(false);
  };

  const quickUpdatePago = async (id, nuevoPago) => {
    setSaving(true);
    await updateItem(id, { pago: nuevoPago });
    setSaving(false);
  };

  if (loading && items.length === 0) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} onRetry={fetchAll} />;
  if (!loading && items.length === 0) {
    return <EmptyState message="No hay pedidos registrados" />;
  }

  return (
    <div className="module-view">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-2 mb-1">
        <h2 className="text-xl text-primary flex items-center gap-2">
          <FiPackage /> Pedidos
        </h2>
      </div>
      <p className="text-xs text-gray-500 mb-4">Gestión de pedidos — clientes y vendedores</p>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total', value: stats.total, color: 'text-gray-800' },
          { label: 'Pendientes', value: stats.pendientes, color: 'text-yellow-600' },
          { label: 'En Proceso', value: stats.enProceso, color: 'text-orange-600' },
          { label: 'Completados', value: stats.completados, color: 'text-green-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="text-[0.65rem] text-gray-500 font-medium">{s.label}</div>
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2.5 mb-4 flex-wrap">
        <div className="flex items-center bg-white border border-gray-200 rounded-md px-2.5 min-w-[200px] flex-1 max-w-[320px] focus-within:border-primary-light">
          <FiSearch className="text-gray-400 shrink-0" />
          <input
            placeholder="Buscar por código, cliente, tipo..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="border-0 bg-transparent py-2 pl-1.5 text-xs outline-none w-full text-gray-700 placeholder:text-gray-400"
          />
        </div>
        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-md text-xs text-gray-700 bg-white outline-none focus:border-primary-light"
        >
          <option value="Todos">Todos los estados</option>
          {estadoFlow.map((e) => <option key={e} value={e}>{e}</option>)}
          <option value="Cancelado">Cancelado</option>
        </select>
        <select
          value={filterTipo}
          onChange={(e) => setFilterTipo(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-md text-xs text-gray-700 bg-white outline-none focus:border-primary-light"
        >
          <option value="Todos">Todos los tipos</option>
          <option value="tienda">Tienda Online</option>
          <option value="pos">POS / Vendedor</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white rounded-lg overflow-hidden border border-gray-200 min-w-[700px]">
          <thead className="bg-primary">
            <tr>
              <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">CÓDIGO</th>
              <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">CLIENTE</th>
              <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">TIPO</th>
              <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">ITEMS</th>
              <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">TOTAL</th>
              <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">PAGO</th>
              <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">ESTADO</th>
              <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">FECHA</th>
              <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-center w-28">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9} className="px-7 py-7 text-center text-gray-400 text-xs">No se encontraron pedidos</td></tr>
            ) : filtered.map((o) => (
              <tr key={o.id} className="border-b border-gray-100 even:bg-gray-50 hover:bg-primary-100 transition-colors duration-100 cursor-pointer" onClick={() => setDetailPedido(o)}>
                <td className="px-3 py-2 text-xs font-semibold font-mono text-primary-light">{o.codigo}</td>
                <td className="px-3 py-2 text-xs text-gray-700 font-medium">{o.cliente}</td>
                <td className="px-3 py-2 text-xs">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[0.65rem] font-semibold ${tipoBadge(o.tipo)}`}>
                    {o.tipo === 'tienda' ? '🖥️ Tienda' : '🛒 POS'}
                  </span>
                </td>
                <td className="px-3 py-2 text-xs text-gray-700">{o.itemsCount} uds</td>
                <td className="px-3 py-2 text-xs text-gray-700 font-bold">{formatPrice(o.total)}</td>
                <td className="px-3 py-2 text-xs" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={o.pago}
                    onChange={(e) => quickUpdatePago(o.id, e.target.value)}
                    className={`px-2 py-0.5 rounded-full text-[0.65rem] font-semibold border-0 outline-none cursor-pointer ${badge(o.pago)}`}
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Pagado">Pagado</option>
                  </select>
                </td>
                <td className="px-3 py-2 text-xs" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={o.estado}
                    onChange={(e) => quickUpdateEstado(o.id, e.target.value)}
                    className={`px-2 py-0.5 rounded-full text-[0.65rem] font-semibold border-0 outline-none cursor-pointer ${badge(o.estado)}`}
                  >
                    {estadoFlow.map((e) => <option key={e} value={e}>{e}</option>)}
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </td>
                <td className="px-3 py-2 text-[0.65rem] text-gray-500">{formatDate(o.fecha)}</td>
                <td className="px-3 py-2 text-xs text-center" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => setDetailPedido(o)} className="text-primary hover:underline text-xs" title="Ver detalle">
                    <FiEye size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary bar */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
        <span>Pedidos: <strong>{filtered.length}</strong></span>
        <span>Total: <strong className="text-primary">{formatPrice(filtered.reduce((s, i) => s + i.total, 0))}</strong></span>
        <span>Por cobrar: <strong className="text-orange-600">{formatPrice(stats.porCobrar)}</strong></span>
      </div>

      {/* ═══ MODAL: DETALLE PEDIDO ═══ */}
      {detailPedido && (
        <PedidoDetail pedido={detailPedido} onClose={() => setDetailPedido(null)} onUpdate={async (data) => {
          await updateItem(detailPedido.id, data);
          setDetailPedido(null);
        }} saving={saving} />
      )}
    </div>
  );
}

/* ── Detalle del Pedido Modal ── */
function PedidoDetail({ pedido, onClose, onUpdate, saving }) {
  const [editEstado, setEditEstado] = useState(pedido.estado);
  const [editPago, setEditPago] = useState(pedido.pago);
  const [editNotas, setEditNotas] = useState(pedido.notas || '');

  const currentIdx = estadoFlow.indexOf(editEstado);

  return (
    <div className="fixed inset-0 bg-black/50 z-[400] flex items-start justify-center p-5 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-[600px] my-5 overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-primary text-white">
          <div>
            <h3 className="text-base font-semibold">{pedido.codigo}</h3>
            <p className="text-[0.65rem] opacity-70">{formatDate(pedido.fecha)}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 border-0 rounded-md bg-white/15 cursor-pointer flex items-center justify-center text-white hover:bg-white/25">
            <FiX size={16} />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Status flow */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-gray-600 mb-2">ESTADO DEL PEDIDO</label>
            <div className="flex gap-1 flex-wrap">
              {estadoFlow.map((e, i) => (
                <button
                  key={e}
                  onClick={() => setEditEstado(e)}
                  className={`px-3 py-1.5 rounded-full text-[0.65rem] font-semibold border cursor-pointer transition-all ${
                    e === editEstado
                      ? 'bg-primary text-white border-primary'
                      : i <= currentIdx
                        ? 'bg-primary-10 text-primary border-primary-20'
                        : 'bg-gray-50 text-gray-400 border-gray-200'
                  }`}
                >
                  {e}
                </button>
              ))}
              <button
                onClick={() => setEditEstado('Cancelado')}
                className={`px-3 py-1.5 rounded-full text-[0.65rem] font-semibold border cursor-pointer transition-all ${
                  editEstado === 'Cancelado' ? 'bg-red-500 text-white border-red-500' : 'bg-gray-50 text-gray-400 border-gray-200'
                }`}
              >
                Cancelado
              </button>
            </div>
          </div>

          {/* Pago */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-gray-600 mb-2">ESTADO DE PAGO</label>
            <div className="flex gap-2">
              {['Pendiente', 'Pagado'].map((p) => (
                <button
                  key={p}
                  onClick={() => setEditPago(p)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold border cursor-pointer transition-all ${
                    p === editPago
                      ? p === 'Pagado' ? 'bg-green-500 text-white border-green-500' : 'bg-yellow-500 text-white border-yellow-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-primary-light'
                  }`}
                >
                  {p === 'Pagado' ? '✅ Pagado' : '⏳ Pendiente'}
                </button>
              ))}
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-[0.6rem] text-gray-400 uppercase">Cliente</div>
              <div className="text-sm font-semibold text-gray-800">{pedido.cliente}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-[0.6rem] text-gray-400 uppercase">Tipo</div>
              <div className="text-sm font-semibold text-gray-800">{pedido.tipo === 'tienda' ? '🖥️ Tienda Online' : '🛒 POS / Vendedor'}</div>
            </div>
            {pedido.email && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-[0.6rem] text-gray-400 uppercase">Email</div>
                <div className="text-sm text-gray-700">{pedido.email}</div>
              </div>
            )}
            {pedido.direccion && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-[0.6rem] text-gray-400 uppercase">Dirección</div>
                <div className="text-sm text-gray-700">{pedido.direccion}</div>
              </div>
            )}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-[0.6rem] text-gray-400 uppercase">Método de Pago</div>
              <div className="text-sm text-gray-700">{pedido.metodo_pago || 'No especificado'}</div>
            </div>
          </div>

          {/* Items */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-gray-600 mb-2">PRODUCTOS ({pedido.itemsCount} unidades)</label>
            {pedido.items.length > 0 ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-gray-500 font-semibold">PRODUCTO</th>
                      <th className="px-3 py-2 text-center text-gray-500 font-semibold">CANT.</th>
                      <th className="px-3 py-2 text-right text-gray-500 font-semibold">PRECIO</th>
                      <th className="px-3 py-2 text-right text-gray-500 font-semibold">SUBTOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedido.items.map((item, idx) => (
                      <tr key={idx} className="border-t border-gray-100">
                        <td className="px-3 py-2 text-gray-700 font-medium">{item.nombre || `Producto #${item.producto_id}`}</td>
                        <td className="px-3 py-2 text-center text-gray-700">{item.cantidad || item.qty || 1}</td>
                        <td className="px-3 py-2 text-right text-gray-700">{formatPrice(item.precio || 0)}</td>
                        <td className="px-3 py-2 text-right text-gray-700 font-semibold">
                          {formatPrice((item.precio || 0) * (item.cantidad || item.qty || 1))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">Sin items detallados</p>
            )}
          </div>

          {/* Totals */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-5">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Subtotal</span>
              <span>{formatPrice(pedido.subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Impuesto</span>
              <span>{formatPrice(pedido.impuesto)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-primary border-t border-gray-200 pt-2">
              <span>TOTAL</span>
              <span>{formatPrice(pedido.total)}</span>
            </div>
          </div>

          {/* Notas */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">NOTAS</label>
            <textarea
              value={editNotas}
              onChange={(e) => setEditNotas(e.target.value)}
              placeholder="Notas internas sobre el pedido..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-700 outline-none focus:border-primary-light resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold cursor-pointer bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          >
            Cerrar
          </button>
          <button
            onClick={() => onUpdate({ estado: editEstado, pago: editPago, notas: editNotas })}
            disabled={saving}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold cursor-pointer bg-primary text-white border-0 hover:bg-primary-light disabled:opacity-50 flex items-center gap-1.5"
          >
            <FiCheck size={14} /> Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}
