import { useEffect, useState } from 'react';
import { FiSearch, FiPlus } from 'react-icons/fi';
import { usePagosCobrosStore } from '../../stores/pagos-cobros.store';
import LoadingSpinner from '../LoadingSpinner';
import ErrorBanner from '../ErrorBanner';
import EmptyState from '../EmptyState';
import FormModal from '../FormModal';
import { formatPrice } from '../../lib/price';

const badge = (s) => ({
  'Cobrado':'bg-[#C6F6D5] text-[#22543D]','Pagado':'bg-[#C6F6D5] text-[#22543D]','Pendiente':'bg-[#FEFCBF] text-[#744210]','Cancelado':'bg-[#FED7D7] text-[#9B2C2C]',
}[s]||'bg-[#FEFCBF] text-[#744210]');

export default function PagosCobrosView() {
  const { items, loading, error, fetchAll, addItem, updateItem, removeItem, search } = usePagosCobrosStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [formError, setFormError] = useState('');
  const [q, setQ] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const filtered = q ? search(q) : items;

  if (loading && items.length === 0) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} onRetry={fetchAll} />;
  if (!loading && items.length === 0) return <EmptyState message="No hay registros de pagos o cobros" onCreate={() => { setEditing(null); setFormData({ metodo: 'Efectivo' }); setShowForm(true); }} />;

  const openNewForm = () => {
    setEditing(null);
    setFormData({ metodo: 'Efectivo' });
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (record) => {
    setEditing(record);
    setFormData({ ...record });
    setFormError('');
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.metodo) {
      setFormError('Seleccioná un método de pago');
      return;
    }
    if (!formData.monto || formData.monto <= 0) {
      setFormError('Ingresá un monto válido');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      if (editing) await updateItem(editing.id, formData);
      else await addItem(formData);
      setShowForm(false);
      setEditing(null);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="module-view">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-xl text-primary flex items-center gap-2">💳 Pagos y Cobros <span className="text-[0.65rem] font-normal text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">Rolando</span></h2>
        <div className="flex gap-2">
          <button onClick={openNewForm}
            className="inline-flex items-center gap-1 px-4 py-2 bg-accent text-white border-0 rounded-md text-xs font-semibold cursor-pointer whitespace-nowrap transition-all duration-200 hover:brightness-110"><FiPlus size={14} /> Nuevo Registro</button>
          <button className="inline-flex items-center gap-1 px-4 py-2 bg-white text-primary border border-primary rounded-md text-xs font-semibold cursor-pointer whitespace-nowrap hover:bg-primary-100">Conciliar</button>
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-4">Gestión de pagos a proveedores y cobros a clientes</p>

      <div className="flex justify-between items-center gap-2.5 mb-3.5 flex-wrap">
        <div className="flex items-center bg-white border border-gray-200 rounded-md px-2.5 min-w-[200px] flex-1 max-w-[320px] focus-within:border-primary-light">
          <FiSearch className="text-gray-400 shrink-0" />
          <input placeholder="Buscar por cliente, concepto, tipo..." value={q} onChange={e=>setQ(e.target.value)} className="border-0 bg-transparent py-2 pl-1.5 text-xs outline-none w-full text-gray-700 placeholder:text-gray-400" />
        </div>
      </div>

      <table className="w-full border-collapse bg-white rounded-lg overflow-hidden border border-gray-200">
        <thead className="bg-primary">
          <tr>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">ID</th>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">TIPO</th>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">CLIENTE/PROVEEDOR</th>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">CONCEPTO</th>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">MONTO</th>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">FECHA</th>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">MÉTODO</th>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">ESTADO</th>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-center w-24">ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr className="border-b border-gray-100"><td colSpan={9} className="px-7 py-7 text-center text-gray-400 text-xs">No se encontraron registros</td></tr>
          ) : filtered.map(p => (
            <tr key={p.id} className="border-b border-gray-100 even:bg-gray-50 hover:bg-primary-100 transition-colors duration-100">
              <td className="px-3 py-2 text-xs text-primary-light font-semibold font-mono text-[0.7rem]">{p.id}</td>
              <td className="px-3 py-2 text-xs">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[0.65rem] font-semibold ${p.tipo==='Cobro' ? 'bg-[#EBF8FF] text-primary-light' : 'bg-[#FFFAF0] text-accent'}`}>
                  {p.tipo==='Cobro'?'💰 Cobro':'💸 Pago'}
                </span>
              </td>
              <td className="px-3 py-2 text-xs text-gray-700 font-medium">{p.cliente}</td>
              <td className="px-3 py-2 text-xs text-gray-700">{p.concepto}</td>
              <td className={`px-3 py-2 text-xs font-semibold ${p.tipo==='Cobro' ? 'text-success' : 'text-danger'}`}>{formatPrice(p.monto)}</td>
              <td className="px-3 py-2 text-xs text-gray-700">{p.fecha}</td>
              <td className="px-3 py-2 text-xs text-gray-700">{p.metodo}</td>
              <td className="px-3 py-2 text-xs"><span className={`inline-flex px-2 py-0.5 rounded-full text-[0.65rem] font-semibold ${badge(p.estado)}`}>{p.estado}</span></td>
              <td className="px-3 py-2 text-xs text-center">
                <button onClick={() => openEditForm(p)} className="text-primary hover:underline text-xs mr-3">Editar</button>
                <button onClick={() => { if (confirm('¿Eliminar registro?')) removeItem(p.id); }} className="text-danger hover:underline text-xs">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <FormModal title={editing ? 'Editar Registro' : 'Nuevo Registro'} onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null); setFormError(''); }} loading={saving}>
          <div className="space-y-4">
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-md px-3 py-2">{formError}</div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-gray-600 text-sm font-medium">Tipo <span className="text-danger">*</span></span>
                <select value={formData.tipo || 'Cobro'} onChange={e => setFormData({...formData, tipo: e.target.value})} className="w-full border rounded px-3 py-2 text-sm mt-1">
                  <option value="Cobro">💰 Cobro</option>
                  <option value="Pago">💸 Pago</option>
                </select>
              </label>
              <label className="block">
                <span className="text-gray-600 text-sm font-medium">Método <span className="text-danger">*</span></span>
                <select value={formData.metodo || ''} onChange={e => setFormData({...formData, metodo: e.target.value})} className="w-full border rounded px-3 py-2 text-sm mt-1">
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta">Tarjeta</option>
                  <option value="QR">QR</option>
                  <option value="Depósito">Depósito</option>
                  <option value="Transferencia">Transferencia</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-gray-600 text-sm font-medium">Monto (Bs) <span className="text-danger">*</span></span>
                <input type="number" step="0.01" min="0" placeholder="0.00" value={formData.monto ?? ''} onChange={e => setFormData({...formData, monto: parseFloat(e.target.value) || 0})} className="w-full border rounded px-3 py-2 text-sm mt-1" />
              </label>
              <label className="block">
                <span className="text-gray-600 text-sm font-medium">Fecha</span>
                <input type="date" value={formData.fecha || ''} onChange={e => setFormData({...formData, fecha: e.target.value})} className="w-full border rounded px-3 py-2 text-sm mt-1" />
              </label>
            </div>

            <label className="block">
              <span className="text-gray-600 text-sm font-medium">Cliente / Proveedor</span>
              <input type="text" placeholder="Nombre del cliente o proveedor" value={formData.cliente || ''} onChange={e => setFormData({...formData, cliente: e.target.value})} className="w-full border rounded px-3 py-2 text-sm mt-1" />
            </label>
            <label className="block">
              <span className="text-gray-600 text-sm font-medium">Concepto</span>
              <input type="text" placeholder="Ej: Pago de factura #001, Cobro mensual..." value={formData.concepto || ''} onChange={e => setFormData({...formData, concepto: e.target.value})} className="w-full border rounded px-3 py-2 text-sm mt-1" />
            </label>
          </div>
        </FormModal>
      )}
    </div>
  );
}
