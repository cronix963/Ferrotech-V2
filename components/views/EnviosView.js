import { useEffect, useState } from 'react';
import { FiSearch, FiPlus } from 'react-icons/fi';
import { useEnviosStore } from '../../stores/envios.store';
import LoadingSpinner from '../LoadingSpinner';
import ErrorBanner from '../ErrorBanner';
import EmptyState from '../EmptyState';
import FormModal from '../FormModal';
import ConfirmModal from '../ConfirmModal';

const badge = (s) => ({
  'Entregado':'bg-[#C6F6D5] text-[#22543D]','Cancelado':'bg-[#FED7D7] text-[#9B2C2C]','Pendiente':'bg-[#FEFCBF] text-[#744210]',
  'En Camino':'bg-[#FED7AA] text-[#7B341E]','Preparación':'bg-[#FED7AA] text-[#7B341E]',
}[s]||'bg-[#FEFCBF] text-[#744210]');

export default function EnviosView() {
  const { items, loading, error, fetchAll, addItem, updateItem, removeItem, search } = useEnviosStore();
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
  if (!loading && items.length === 0) return <EmptyState message="No hay envíos registrados" onCreate={openNewForm} />;

  const handleSave = async () => {
    if (!formData.pedido?.trim()) {
      setFormError('El pedido es requerido');
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
      setFormError(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="module-view">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-xl text-primary flex items-center gap-2">🚚 Envíos <span className="text-[0.65rem] font-normal text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">Issai</span></h2>
        <div className="flex gap-2">
          <button onClick={openNewForm}
            className="inline-flex items-center gap-1 px-4 py-2 bg-accent text-white border-0 rounded-md text-xs font-semibold cursor-pointer whitespace-nowrap transition-all duration-200 hover:brightness-110"><FiPlus size={14} /> Nuevo Envío</button>
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-4">Seguimiento de envíos y entregas</p>

      <div className="flex justify-between items-center gap-2.5 mb-3.5 flex-wrap">
        <div className="flex items-center bg-white border border-gray-200 rounded-md px-2.5 min-w-[200px] flex-1 max-w-[320px] focus-within:border-primary-light">
          <FiSearch className="text-gray-400 shrink-0" />
          <input placeholder="Buscar por cliente, repartidor..." value={q} onChange={e=>setQ(e.target.value)} className="border-0 bg-transparent py-2 pl-1.5 text-xs outline-none w-full text-gray-700 placeholder:text-gray-400" />
        </div>
      </div>

      <table className="w-full border-collapse bg-white rounded-lg overflow-hidden border border-gray-200">
        <thead className="bg-primary">
          <tr>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">ID ENVÍO</th>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">PEDIDO</th>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">CLIENTE</th>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">REPARTIDOR</th>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">FECHA</th>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">ESTADO</th>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-center w-24">ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr className="border-b border-gray-100"><td colSpan={7} className="px-7 py-7 text-center text-gray-400 text-xs">No se encontraron envíos</td></tr>
          ) : filtered.map(e => (
            <tr key={e.id} className="border-b border-gray-100 even:bg-gray-50 hover:bg-primary-100 transition-colors duration-100">
              <td className="px-3 py-2 text-xs text-primary-light font-semibold font-mono">{e.id}</td>
              <td className="px-3 py-2 text-xs text-primary font-medium">{e.pedido}</td>
              <td className="px-3 py-2 text-xs text-gray-700 font-medium">{e.cliente}</td>
              <td className="px-3 py-2 text-xs text-gray-700">{e.repartidor}</td>
              <td className="px-3 py-2 text-xs text-gray-700">{e.fecha_env}</td>
              <td className="px-3 py-2 text-xs"><span className={`inline-flex px-2 py-0.5 rounded-full text-[0.65rem] font-semibold ${badge(e.estado)}`}>{e.estado}</span></td>
              <td className="px-3 py-2 text-xs text-center">
                <button onClick={() => openEditForm(e)} className="text-primary hover:underline text-xs mr-3">Editar</button>
                <button onClick={() => {
                  setDeleteTarget({ id: e.id, nombre: e.cliente });
                  setShowDeleteModal(true);
                }} className="text-danger hover:underline text-xs">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <FormModal title={editing ? 'Editar Envío' : 'Nuevo Envío'} onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null); setFormError(''); }} loading={saving}>
          <div className="space-y-3">
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-md px-3 py-2">{formError}</div>
            )}
            <label className="block">
              <span className="text-gray-600 text-sm">Pedido <span className="text-danger">*</span></span>
              <input type="text" value={formData.pedido || ''} onChange={e => setFormData({...formData, pedido: e.target.value})} className="w-full border rounded px-3 py-2 text-sm mt-1" placeholder="Número de pedido" />
            </label>
            <label className="block">
              <span className="text-gray-600 text-sm">Dirección</span>
              <input type="text" value={formData.direccion || ''} onChange={e => setFormData({...formData, direccion: e.target.value})} className="w-full border rounded px-3 py-2 text-sm mt-1" placeholder="Dirección de entrega" />
            </label>
            <label className="block">
              <span className="text-gray-600 text-sm">Repartidor / Transportista</span>
              <input type="text" value={formData.repartidor || ''} onChange={e => setFormData({...formData, repartidor: e.target.value})} className="w-full border rounded px-3 py-2 text-sm mt-1" placeholder="Nombre del repartidor" />
            </label>
            <label className="block">
              <span className="text-gray-600 text-sm">Fecha de envío</span>
              <input type="date" value={formData.fecha_env || ''} onChange={e => setFormData({...formData, fecha_env: e.target.value})} className="w-full border rounded px-3 py-2 text-sm mt-1" />
            </label>
            <label className="block">
              <span className="text-gray-600 text-sm">Estado</span>
              <select value={formData.estado || 'Pendiente'} onChange={e => setFormData({...formData, estado: e.target.value})} className="w-full border rounded px-3 py-2 text-sm mt-1">
                <option value="Pendiente">Pendiente</option>
                <option value="Preparación">Preparación</option>
                <option value="En Camino">En Camino</option>
                <option value="Entregado">Entregado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
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
          title="Eliminar Envío"
          message={`¿Eliminar envío de "${deleteTarget.nombre}"?`}
          loading={deleting}
        />
      )}
    </div>
  );
}
