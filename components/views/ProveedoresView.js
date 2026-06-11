import { useEffect, useState } from 'react';
import { FiSearch, FiPlus } from 'react-icons/fi';
import { useProveedoresStore } from '../../stores/proveedores.store';
import LoadingSpinner from '../LoadingSpinner';
import ErrorBanner from '../ErrorBanner';
import EmptyState from '../EmptyState';
import FormModal from '../FormModal';
import ConfirmModal from '../ConfirmModal';

const badge = (s) => ({
  'Activo':'bg-[#C6F6D5] text-[#22543D]','Inactivo':'bg-[#FED7D7] text-[#9B2C2C]',
}[s]||'bg-[#FEFCBF] text-[#744210]');

export default function ProveedoresView() {
  const { items, loading, error, fetchAll, addItem, updateItem, removeItem, search } = useProveedoresStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [q, setQ] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteStats, setDeleteStats] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const filtered = q ? search(q) : items;

  if (loading && items.length === 0) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} onRetry={fetchAll} />;
  if (!loading && items.length === 0) return <EmptyState message="No hay proveedores registrados" onCreate={() => { setEditing(null); setFormData({}); setShowForm(true); }} />;

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
        <h2 className="text-xl text-primary flex items-center gap-2">🏭 Proveedores <span className="text-[0.65rem] font-normal text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">Sebastian</span></h2>
        <div className="flex gap-2">
          <button onClick={() => { setEditing(null); setFormData({}); setShowForm(true); }}
            className="inline-flex items-center gap-1 px-4 py-2 bg-accent text-white border-0 rounded-md text-xs font-semibold cursor-pointer whitespace-nowrap transition-all duration-200 hover:brightness-110"><FiPlus size={14} /> Nuevo Proveedor</button>
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-4">Directorio de proveedores y distribuidores</p>

      <div className="flex justify-between items-center gap-2.5 mb-3.5 flex-wrap">
        <div className="flex items-center bg-white border border-gray-200 rounded-md px-2.5 min-w-[200px] flex-1 max-w-[320px] focus-within:border-primary-light">
          <FiSearch className="text-gray-400 shrink-0" />
          <input placeholder="Buscar por nombre, rubro o contacto..." value={q} onChange={e=>setQ(e.target.value)} className="border-0 bg-transparent py-2 pl-1.5 text-xs outline-none w-full text-gray-700 placeholder:text-gray-400" />
        </div>
      </div>

      <table className="w-full border-collapse bg-white rounded-lg overflow-hidden border border-gray-200">
        <thead className="bg-primary">
          <tr>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">PROVEEDOR</th>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">CONTACTO</th>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">TELÉFONO</th>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">EMAIL</th>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">RUBRO</th>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">ESTADO</th>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-center w-24">ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr className="border-b border-gray-100"><td colSpan={7} className="px-7 py-7 text-center text-gray-400 text-xs">No se encontraron proveedores</td></tr>
          ) : filtered.map(p => (
            <tr key={p.id} className="border-b border-gray-100 even:bg-gray-50 hover:bg-primary-100 transition-colors duration-100">
              <td className="px-3 py-2 text-xs text-gray-700 font-medium">{p.nombre}</td>
              <td className="px-3 py-2 text-xs text-gray-700">{p.contacto}</td>
              <td className="px-3 py-2 text-xs text-gray-700">{p.tel}</td>
              <td className="px-3 py-2 text-xs text-gray-700">{p.email}</td>
              <td className="px-3 py-2 text-xs"><span className="inline-flex px-2 py-0.5 rounded-full text-[0.65rem] font-semibold bg-[#EBF8FF] text-primary-light">{p.rubro}</span></td>
              <td className="px-3 py-2 text-xs"><span className={`inline-flex px-2 py-0.5 rounded-full text-[0.65rem] font-semibold ${badge(p.estado)}`}>{p.estado}</span></td>
              <td className="px-3 py-2 text-xs text-center">
                <button onClick={() => { setEditing(p); setFormData({ ...p }); setShowForm(true); }} className="text-primary hover:underline text-xs mr-3">Editar</button>
                <button onClick={async () => {
                  setDeleteTarget({ id: p.id, nombre: p.nombre });
                  try {
                    const res = await fetch(`/api/proveedores/${p.id}?stats=true`);
                    const data = await res.json();
                    setDeleteStats(data);
                  } catch {
                    setDeleteStats(null);
                  }
                  setShowDeleteModal(true);
                }} className="text-danger hover:underline text-xs">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <FormModal title={editing ? 'Editar Proveedor' : 'Nuevo Proveedor'} onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null); }} loading={saving}>
          <div className="space-y-3">
            <label className="block">
              <span className="text-gray-600 text-sm">Nombre</span>
              <input type="text" value={formData.nombre || ''} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full border rounded px-3 py-2 text-sm mt-1" required />
            </label>
            <label className="block">
              <span className="text-gray-600 text-sm">Contacto</span>
              <input type="text" value={formData.contacto || ''} onChange={e => setFormData({...formData, contacto: e.target.value})} className="w-full border rounded px-3 py-2 text-sm mt-1" />
            </label>
            <label className="block">
              <span className="text-gray-600 text-sm">Teléfono</span>
              <input type="text" value={formData.telefono || formData.tel || ''} onChange={e => setFormData({...formData, telefono: e.target.value})} className="w-full border rounded px-3 py-2 text-sm mt-1" />
            </label>
            <label className="block">
              <span className="text-gray-600 text-sm">Dirección</span>
              <input type="text" value={formData.direccion || ''} onChange={e => setFormData({...formData, direccion: e.target.value})} className="w-full border rounded px-3 py-2 text-sm mt-1" />
            </label>
            <label className="block">
              <span className="text-gray-600 text-sm">Email</span>
              <input type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border rounded px-3 py-2 text-sm mt-1" />
            </label>
            <label className="block">
              <span className="text-gray-600 text-sm">Rubro</span>
              <input type="text" value={formData.rubro || ''} onChange={e => setFormData({...formData, rubro: e.target.value})} className="w-full border rounded px-3 py-2 text-sm mt-1" />
            </label>
          </div>
        </FormModal>
      )}

      {showDeleteModal && deleteTarget && (
        <ConfirmModal
          show={showDeleteModal}
          onClose={() => { setShowDeleteModal(false); setDeleteTarget(null); setDeleteStats(null); }}
          onConfirm={async () => {
            setDeleting(true);
            await removeItem(deleteTarget.id);
            setShowDeleteModal(false);
            setDeleteTarget(null);
            setDeleteStats(null);
            setDeleting(false);
          }}
          title="Eliminar Proveedor"
          message={`¿Eliminar "${deleteTarget.nombre}"?`}
          details={deleteStats ? (
            deleteStats.compras > 0
              ? `Tiene ${deleteStats.compras} compras asociadas.`
              : 'No tiene registros asociados.'
          ) : ''}
          loading={deleting}
        />
      )}
    </div>
  );
}
