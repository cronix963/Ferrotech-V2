import { FiActivity, FiClock, FiTrendingUp, FiUsers, FiAlertCircle } from 'react-icons/fi';

export default function SidebarRight() {
  return (
    <aside className="hidden sm:block bg-white border-l border-gray-200 p-3.5">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3.5 mb-3">
        <h4 className="text-[0.68rem] font-semibold uppercase tracking-wide text-gray-500 mb-2">Estado del Sistema</h4>
        <div className="flex justify-between items-center py-1 text-xs">
          <span className="text-gray-500"><FiActivity size={13} className="inline -mt-0.5 mr-1" /> Servidor</span>
          <span className="font-semibold text-success">● Activo</span>
        </div>
        <div className="flex justify-between items-center py-1 text-xs">
          <span className="text-gray-500"><FiClock size={13} className="inline -mt-0.5 mr-1" /> Última sinc.</span>
          <span className="font-semibold text-primary">12:34 PM</span>
        </div>
        <div className="flex justify-between items-center py-1 text-xs">
          <span className="text-gray-500"><FiTrendingUp size={13} className="inline -mt-0.5 mr-1" /> Rendimiento</span>
          <span className="font-semibold text-success">Estable</span>
        </div>
        <div className="h-px bg-gray-200 my-1" />
        <div className="flex justify-between items-center py-1 text-xs">
          <span className="text-gray-500"><FiUsers size={13} className="inline -mt-0.5 mr-1" /> Usuarios activos</span>
          <span className="font-semibold text-primary">12</span>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3.5 mb-3">
        <h4 className="text-[0.68rem] font-semibold uppercase tracking-wide text-gray-500 mb-2">Alertas</h4>
        <div className="text-xs text-[#9B2C2C] flex gap-1.5 items-start mb-1.5">
          <FiAlertCircle className="mt-0.5 shrink-0" />
          <span>2 pedidos pendientes de pago</span>
        </div>
        <div className="text-xs text-[#7B341E] flex gap-1.5 items-start">
          <FiAlertCircle className="mt-0.5 shrink-0" />
          <span>Stock bajo en 5 productos</span>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3.5 mb-3">
        <h4 className="text-[0.68rem] font-semibold uppercase tracking-wide text-gray-500 mb-2">Resumen</h4>
        <div className="flex justify-between items-center py-1 text-xs"><span className="text-gray-500">Usuarios totales</span><span className="font-semibold text-primary">156</span></div>
        <div className="flex justify-between items-center py-1 text-xs"><span className="text-gray-500">Pedidos hoy</span><span className="font-semibold text-accent">48</span></div>
        <div className="flex justify-between items-center py-1 text-xs"><span className="text-gray-500">Ventas hoy</span><span className="font-semibold text-accent">Bs12.4K</span></div>
      </div>
    </aside>
  );
}
