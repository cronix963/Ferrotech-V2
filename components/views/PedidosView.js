import { useEffect, useState } from 'react';
import { FiSearch, FiPlus } from 'react-icons/fi';
import { usePedidosStore } from '../../stores/pedidos.store';
import LoadingSpinner from '../LoadingSpinner';
import ErrorBanner from '../ErrorBanner';
import EmptyState from '../EmptyState';
import FormModal from '../FormModal';
import { formatPrice } from '../../lib/price';

const badge = (s) => ({
  'Completado':'bg-[#C6F6D5] text-[#22543D]','Cancelado':'bg-[#FED7D7] text-[#9B2C2C]','Pendiente':'bg-[#FEFCBF] text-[#744210]',
  'En Proceso':'bg-[#FED7AA] text-[#7B341E]','Preparación':'bg-[#FED7AA] text-[#7B341E]','Despachado':'bg-primary-100 text-primary',
  'Pagado':'bg-[#C6F6D5] text-[#22543D]',
}[s]||'bg-[#FEFCBF] text-[#744210]');

export default function PedidosView() {
  const { items, loading, error, fetchAll, addItem, updateItem, removeItem, search } = usePedidosStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [q, setQ] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const filtered = q ? search(q) : items;

  if (loading && items.length === 0) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} onRetry={fetchAll} />;
  if (!loading && items.length === 0) return <EmptyState message="No hay pedidos registrados" onCreate={() => { setEditing(null); setFormData({}); setShowForm(true); }} />;

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) await updateItem(editing.id, formData);
      else await addItem(formData);
      setShowForm(false);
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="module-view">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-xl text-primary flex items-center gap-2">📦 Pedidos <span className="text-[0.65rem] font-normal text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">Miguel</span></h2>
        <div className="flex gap-2">
          <button onClick={() => { setEditing(null); setFormData({}); setShowForm(true); }}
            className="inline-flex items-center gap-1 px-4 py-2 bg-accent text-white border-0 rounded-md text-xs font-semibold cursor-pointer whitespace-nowrap transition-all duration-200 hover:brightness-110"><FiPlus size={14} /> Nuevo</button>
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-4">Listado completo de pedidos y compras del sistema</p>

      <div className="flex justify-between items-center gap-2.5 mb-3.5 flex-wrap">
        <div className="flex items-center bg-white border border-gray-200 rounded-md px-2.5 min-w-[200px] flex-1 max-w-[320px] focus-within:border-primary-light">
          <FiSearch className="text-gray-400 shrink-0" />
          <input placeholder="Buscar por ID o cliente..." value={q} onChange={e=>setQ(e.target.value)} className="border-0 bg-transparent py-2 pl-1.5 text-xs outline-none w-full text-gray-700 placeholder:text-gray-400" />
        </div>
      </div>

      <table className="w-full border-collapse bg-white rounded-lg overflow-hidden border border-gray-200">
        <thead className="bg-primary">
          <tr>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">ID PEDIDO</th>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">CLIENTE</th>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">FECHA</th>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">TOTAL</th>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">PAGO</th>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">ESTADO</th>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-center w-24">ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr className="border-b border-gray-100"><td colSpan={7} className="px-7 py-7 text-center text-gray-400 text-xs">No se encontraron pedidos</td></tr>
          ) : filtered.map(o => (
            <tr key={o.id} className="border-b border-gray-100 even:bg-gray-50 hover:bg-primary-100 transition-colors duration-100">
              <td className="px-3 py-2 text-xs text-primary-light font-semibold font-mono">{o.id}</td>
              <td className="px-3 py-2 text-xs text-gray-700 font-medium">{o.cliente}</td>
              <td className="px-3 py-2 text-xs text-gray-700">{o.fecha}</td>
              <td className="px-3 py-2 text-xs text-gray-700 font-semibold">{formatPrice(o.total)}</td>
              <td className="px-3 py-2 text-xs"><span className={`inline-flex px-2 py-0.5 rounded-full text-[0.65rem] font-semibold ${badge(o.pago)}`}>{o.pago}</span></td>
              <td className="px-3 py-2 text-xs"><span className={`inline-flex px-2 py-0.5 rounded-full text-[0.65rem] font-semibold ${badge(o.envio)}`}>{o.envio}</span></td>
              <td className="px-3 py-2 text-xs text-center">
                <button onClick={() => { setEditing(o); setFormData({ ...o }); setShowForm(true); }} className="text-primary hover:underline text-xs mr-3">Editar</button>
                <button onClick={() => { if (confirm('¿Eliminar pedido?')) removeItem(o.id); }} className="text-danger hover:underline text-xs">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <FormModal title={editing ? 'Editar Pedido' : 'Nuevo Pedido'} onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null); }} loading={saving}>
          <div className="space-y-3">
            <label className="block">
              <span className="text-gray-600 text-sm">Cliente</span>
              <input type="text" value={formData.cliente || ''} onChange={e => setFormData({...formData, cliente: e.target.value})} className="w-full border rounded px-3 py-2 text-sm mt-1" required />
            </label>
            <label className="block">
              <span className="text-gray-600 text-sm">Items (cantidad)</span>
              <input type="number" min="0" value={formData.items ?? ''} onChange={e => setFormData({...formData, items: parseInt(e.target.value) || 0})} className="w-full border rounded px-3 py-2 text-sm mt-1" />
            </label>
            <label className="block">
              <span className="text-gray-600 text-sm">Total (Bs)</span>
              <input type="number" step="0.01" min="0" value={formData.total ?? ''} onChange={e => setFormData({...formData, total: parseFloat(e.target.value) || 0})} className="w-full border rounded px-3 py-2 text-sm mt-1" />
            </label>
            <label className="block">
              <span className="text-gray-600 text-sm">Estado de pago</span>
              <select value={formData.pago || 'Pendiente'} onChange={e => setFormData({...formData, pago: e.target.value})} className="w-full border rounded px-3 py-2 text-sm mt-1">
                <option value="Pendiente">Pendiente</option>
                <option value="Pagado">Pagado</option>
              </select>
            </label>
            <label className="block">
              <span className="text-gray-600 text-sm">Estado de envío</span>
              <select value={formData.envio || 'Pendiente'} onChange={e => setFormData({...formData, envio: e.target.value})} className="w-full border rounded px-3 py-2 text-sm mt-1">
                <option value="Pendiente">Pendiente</option>
                <option value="Preparación">Preparación</option>
                <option value="En Proceso">En Proceso</option>
                <option value="Despachado">Despachado</option>
                <option value="Completado">Completado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </label>
          </div>
        </FormModal>
      )}
    </div>
  );
}
