import { useEffect, useState } from 'react';
import { FiSearch, FiPlus } from 'react-icons/fi';
import { useComprasStore } from '../../stores/compras.store';
import LoadingSpinner from '../LoadingSpinner';
import ErrorBanner from '../ErrorBanner';
import EmptyState from '../EmptyState';
import FormModal from '../FormModal';
import ConfirmModal from '../ConfirmModal';
import { formatPrice } from '../../lib/price';

const badge = (s) => ({
  'Recibido':'bg-[#C6F6D5] text-[#22543D]','Cancelado':'bg-[#FED7D7] text-[#9B2C2C]','Pendiente':'bg-[#FEFCBF] text-[#744210]','En Proceso':'bg-[#FED7AA] text-[#7B341E]',
}[s]||'bg-[#FEFCBF] text-[#744210]');

export default function ComprasView() {
  const { items, loading, error, fetchAll, addItem, updateItem, removeItem, search } = useComprasStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [formError, setFormError] = useState('');
  const [q, setQ] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const filtered = q ? search(q) : items;

  const openNewForm = () => { setEditing(null); setFormData({}); setFormError(''); setShowForm(true); };
  const openEditForm = (record) => { setEditing(record); setFormData({ ...record }); setFormError(''); setShowForm(true); };

  if (loading && items.length === 0) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} onRetry={fetchAll} />;
  if (!loading && items.length === 0) return <EmptyState message="No hay compras registradas" onCreate={openNewForm} />;

  const handleSave = async () => {
    if (!formData.proveedor?.trim()) {
      setFormError('El proveedor es requerido');
      return;
    }
    if (!formData.producto?.trim()) {
      setFormError('El producto es requerido');
      return;
    }
    if (!formData.cantidad || formData.cantidad <= 0) {
      setFormError('La cantidad debe ser mayor a 0');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        proveedor: formData.proveedor,
        items: [{ producto: formData.producto, cantidad: formData.cantidad, unidad: formData.unidad || 'pz', precio: formData.precio || 0 }],
        total: editing ? formData.total : (formData.cantidad || 0) * (formData.precio || 0),
        estado: formData.estado || 'Pendiente',
        notas: formData.notas || null,
      };
      if (editing) await updateItem(editing.id, payload);
      else await addItem(payload);
      setShowForm(false);
      setEditing(null);
    } catch (err) {
      setFormError(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="module-view">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-xl text-primary flex items-center gap-2">🛒 Compras <span className="text-[0.65rem] font-normal text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">Katerin</span></h2>
        <div className="flex gap-2">
          <button onClick={openNewForm}
            className="inline-flex items-center gap-1 px-4 py-2 bg-accent text-white border-0 rounded-md text-xs font-semibold cursor-pointer whitespace-nowrap transition-all duration-200 hover:brightness-110"><FiPlus size={14} /> Nueva Compra</button>
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-4">Órdenes de compra a proveedores</p>

      <div className="flex justify-between items-center gap-2.5 mb-3.5 flex-wrap">
        <div className="flex items-center bg-white border border-gray-200 rounded-md px-2.5 min-w-[200px] flex-1 max-w-[320px] focus-within:border-primary-light">
          <FiSearch className="text-gray-400 shrink-0" />
          <input placeholder="Buscar por producto, proveedor..." value={q} onChange={e=>setQ(e.target.value)} className="border-0 bg-transparent py-2 pl-1.5 text-xs outline-none w-full text-gray-700 placeholder:text-gray-400" />
        </div>
      </div>

      <table className="w-full border-collapse bg-white rounded-lg overflow-hidden border border-gray-200">
        <thead className="bg-primary">
          <tr>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">CÓDIGO</th>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">PRODUCTO</th>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">PROVEEDOR</th>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">CANT</th>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">TOTAL</th>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">FECHA</th>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">ESTADO</th>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-center w-24">ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr className="border-b border-gray-100"><td colSpan={8} className="px-7 py-7 text-center text-gray-400 text-xs">No se encontraron compras</td></tr>
          ) : filtered.map(c => (
            <tr key={c.id} className="border-b border-gray-100 even:bg-gray-50 hover:bg-primary-100 transition-colors duration-100">
              <td className="px-3 py-2 text-xs text-primary-light font-semibold font-mono">{c.codigo || c.id}</td>
              <td className="px-3 py-2 text-xs text-gray-700 font-medium">{c.producto}</td>
              <td className="px-3 py-2 text-xs text-gray-700">{c.proveedor}</td>
              <td className="px-3 py-2 text-xs text-gray-700">{c.cantidad} {c.unidad}</td>
              <td className="px-3 py-2 text-xs text-gray-700 font-semibold">{formatPrice(c.total)}</td>
              <td className="px-3 py-2 text-xs text-gray-700">{c.fecha}</td>
              <td className="px-3 py-2 text-xs"><span className={`inline-flex px-2 py-0.5 rounded-full text-[0.65rem] font-semibold ${badge(c.estado)}`}>{c.estado}</span></td>
              <td className="px-3 py-2 text-xs text-center">
                <button onClick={() => openEditForm(c)} className="text-primary hover:underline text-xs mr-3">Editar</button>
                <button onClick={() => {
                  setDeleteTarget({ id: c.id, nombre: `${c.producto} - ${c.proveedor}` });
                  setShowDeleteModal(true);
                }} className="text-danger hover:underline text-xs">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <FormModal title={editing ? 'Editar Compra' : 'Nueva Compra'} onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null); setFormError(''); }} loading={saving}>
          <div className="space-y-3">
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-md px-3 py-2">{formError}</div>
            )}
            <label className="block">
              <span className="text-gray-600 text-sm">Proveedor <span className="text-danger">*</span></span>
              <input type="text" value={formData.proveedor || ''} onChange={e => setFormData({...formData, proveedor: e.target.value})} className="w-full border rounded px-3 py-2 text-sm mt-1" placeholder="Nombre del proveedor" required />
            </label>
            <label className="block">
              <span className="text-gray-600 text-sm">Producto <span className="text-danger">*</span></span>
              <input type="text" value={formData.producto || ''} onChange={e => setFormData({...formData, producto: e.target.value})} className="w-full border rounded px-3 py-2 text-sm mt-1" placeholder="Nombre del producto comprado" required />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-gray-600 text-sm">Cantidad <span className="text-danger">*</span></span>
                <input type="number" min="1" value={formData.cantidad ?? ''} onChange={e => setFormData({...formData, cantidad: parseInt(e.target.value) || 0})} className="w-full border rounded px-3 py-2 text-sm mt-1" placeholder="0" required />
              </label>
              <label className="block">
                <span className="text-gray-600 text-sm">Unidad</span>
                <select value={formData.unidad || 'pz'} onChange={e => setFormData({...formData, unidad: e.target.value})} className="w-full border rounded px-3 py-2 text-sm mt-1">
                  <option value="pz">Pieza (pz)</option>
                  <option value="kg">Kilogramo (kg)</option>
                  <option value="m">Metro (m)</option>
                  <option value="lt">Litro (lt)</option>
                  <option value="bolsa">Bolsa</option>
                  <option value="caja">Caja</option>
                </select>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-gray-600 text-sm">Precio Unit. (Bs) <span className="text-danger">*</span></span>
                <input type="number" step="0.01" min="0" value={formData.precio ?? ''} onChange={e => setFormData({...formData, precio: parseFloat(e.target.value) || 0})} className="w-full border rounded px-3 py-2 text-sm mt-1" placeholder="0.00" required />
              </label>
              <label className="block">
                <span className="text-gray-600 text-sm">Total</span>
                <div className="w-full border rounded px-3 py-2 text-sm mt-1 bg-gray-50 text-gray-700 font-semibold">{formatPrice((formData.cantidad || 0) * (formData.precio || 0))}</div>
              </label>
            </div>
            <label className="block">
              <span className="text-gray-600 text-sm">Estado</span>
              <select value={formData.estado || 'Pendiente'} onChange={e => setFormData({...formData, estado: e.target.value})} className="w-full border rounded px-3 py-2 text-sm mt-1">
                <option value="Pendiente">Pendiente</option>
                <option value="En Proceso">En Proceso</option>
                <option value="Recibido">Recibido</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </label>
            <label className="block">
              <span className="text-gray-600 text-sm">Notas</span>
              <textarea value={formData.notas || ''} onChange={e => setFormData({...formData, notas: e.target.value})} className="w-full border rounded px-3 py-2 text-sm mt-1" placeholder="Observaciones (opcional)" />
            </label>
          </div>
        </FormModal>
      )}

      {showDeleteModal && deleteTarget && (
        <ConfirmModal
          show={showDeleteModal}
          onClose={() => { setShowDeleteModal(false); setDeleteTarget(null); }}
          onConfirm={async () => {
            setDeleting(true);
            await removeItem(deleteTarget.id);
            setShowDeleteModal(false);
            setDeleteTarget(null);
            setDeleting(false);
          }}
          title="Eliminar Compra"
          message={`¿Eliminar compra "${deleteTarget.nombre}"?`}
          loading={deleting}
        />
      )}
    </div>
  );
}
