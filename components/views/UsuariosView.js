import { useEffect, useState } from 'react';
import { FiSearch, FiPlus } from 'react-icons/fi';
import { useUsuariosStore } from '../../stores/usuarios.store';
import LoadingSpinner from '../LoadingSpinner';
import ErrorBanner from '../ErrorBanner';
import EmptyState from '../EmptyState';
import FormModal from '../FormModal';
import ConfirmModal from '../ConfirmModal';

const badge = (s) => ({
  'Activo':'bg-[#C6F6D5] text-[#22543D]','Inactivo':'bg-[#FED7D7] text-[#9B2C2C]',
}[s]||'bg-[#FEFCBF] text-[#744210]');

const roles = ['admin', 'cliente', 'vendedor'];

export default function UsuariosView() {
  const { items, loading, error, fetchAll, addItem, updateItem, removeItem, search } = useUsuariosStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [formError, setFormError] = useState('');
  const [q, setQ] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteStats, setDeleteStats] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const filtered = q ? search(q) : items;

  const openNewForm = () => { setEditing(null); setFormData({}); setFormError(''); setShowForm(true); };
  const openEditForm = (record) => { setEditing(record); setFormData({ ...record }); setFormError(''); setShowForm(true); };

  if (loading && items.length === 0) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} onRetry={fetchAll} />;
  if (!loading && items.length === 0) return <EmptyState message="No hay usuarios registrados" onCreate={openNewForm} />;

  const handleSave = async () => {
    if (!formData.email?.trim()) {
      setFormError('El email es requerido');
      return;
    }
    if (!editing && !formData.password?.trim()) {
      setFormError('La contraseña es requerida');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      if (editing) {
        const { password, ...rest } = formData;
        await updateItem(editing.id, rest);
      } else {
        await addItem(formData);
      }
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
        <h2 className="text-xl text-primary flex items-center gap-2">👥 Usuarios <span className="text-[0.65rem] font-normal text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">Miguel</span></h2>
        <div className="flex gap-2">
          <button onClick={openNewForm}
            className="inline-flex items-center gap-1 px-4 py-2 bg-accent text-white border-0 rounded-md text-xs font-semibold cursor-pointer whitespace-nowrap transition-all duration-200 hover:brightness-110"><FiPlus size={14} /> Nuevo</button>
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-4">Gestión de usuarios del sistema FERROTECH</p>

      <div className="flex justify-between items-center gap-2.5 mb-3.5 flex-wrap">
        <div className="flex items-center bg-white border border-gray-200 rounded-md px-2.5 min-w-[200px] flex-1 max-w-[320px] focus-within:border-primary-light">
          <FiSearch className="text-gray-400 shrink-0" />
          <input placeholder="Buscar por nombre, email o rol..." value={q} onChange={e => setQ(e.target.value)} className="border-0 bg-transparent py-2 pl-1.5 text-xs outline-none w-full text-gray-700 placeholder:text-gray-400" />
        </div>
      </div>

      <table className="w-full border-collapse bg-white rounded-lg overflow-hidden border border-gray-200">
        <thead className="bg-primary">
          <tr>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">NOMBRE</th>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">EMAIL</th>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">ROL</th>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-left">ESTADO</th>
            <th className="text-white font-semibold text-[0.68rem] uppercase tracking-wider px-3 py-2.5 text-center w-32">ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr className="border-b border-gray-100"><td colSpan={5} className="px-7 py-7 text-center text-gray-400 text-xs">No se encontraron usuarios</td></tr>
          ) : filtered.map(u => (
            <tr key={u.id} className="border-b border-gray-100 even:bg-gray-50 hover:bg-primary-100 transition-colors duration-100">
              <td className="px-3 py-2 text-xs text-gray-700 font-medium">{u.nombre}</td>
              <td className="px-3 py-2 text-xs text-gray-700">{u.email}</td>
              <td className="px-3 py-2 text-xs text-gray-700">{u.rol}</td>
              <td className="px-3 py-2 text-xs"><span className={`inline-flex px-2 py-0.5 rounded-full text-[0.65rem] font-semibold ${badge(u.estado)}`}>{u.estado}</span></td>
              <td className="px-3 py-2 text-xs text-center">
                <button onClick={() => openEditForm(u)} className="text-primary hover:underline text-xs mr-3">Editar</button>
                <button onClick={async () => {
                  setDeleteTarget({ id: u.id, nombre: u.nombre });
                  try {
                    const res = await fetch(`/api/users/${u.id}?stats=true`);
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
        <FormModal title={editing ? 'Editar Usuario' : 'Nuevo Usuario'} onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null); setFormError(''); }} loading={saving}>
          <div className="space-y-3">
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-md px-3 py-2">{formError}</div>
            )}
            <label className="block">
              <span className="text-gray-600 text-sm">Email <span className="text-danger">*</span></span>
              <input type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border rounded px-3 py-2 text-sm mt-1" placeholder="correo@ejemplo.com" required />
            </label>
            {!editing && (
              <label className="block">
                <span className="text-gray-600 text-sm">Contraseña <span className="text-danger">*</span></span>
                <input type="password" value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full border rounded px-3 py-2 text-sm mt-1" placeholder="Contraseña del usuario" required />
              </label>
            )}
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-gray-600 text-sm">Nombre</span>
                <input type="text" value={formData.nombre || ''} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full border rounded px-3 py-2 text-sm mt-1" placeholder="Nombre completo" />
              </label>
              <label className="block">
                <span className="text-gray-600 text-sm">Rol</span>
                <select value={formData.rol || 'cliente'} onChange={e => setFormData({...formData, rol: e.target.value})} className="w-full border rounded px-3 py-2 text-sm mt-1">
                  {roles.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                </select>
              </label>
            </div>
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
          title="Eliminar Usuario"
          message={`¿Eliminar "${deleteTarget.nombre}"?`}
          details={deleteStats ? (
            deleteStats.clientes > 0 || deleteStats.pedidos > 0 || deleteStats.ventas > 0 || deleteStats.compras > 0 || deleteStats.cotizaciones > 0 || deleteStats.pagos_cobros > 0
              ? `Tiene ${deleteStats.clientes} clientes, ${deleteStats.pedidos} pedidos, ${deleteStats.ventas} ventas, ${deleteStats.compras} compras, ${deleteStats.cotizaciones} cotizaciones, ${deleteStats.pagos_cobros} pagos/cobros asociados.`
              : 'No tiene registros asociados.'
          ) : ''}
          loading={deleting}
        />
      )}
    </div>
  );
}
