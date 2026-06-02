import { FiGrid, FiUsers, FiPackage, FiBriefcase, FiShoppingCart, FiBox, FiTruck, FiDollarSign, FiFileText, FiCreditCard, FiBarChart2 } from 'react-icons/fi';

const modules = [
  { id:'dashboard',   icon: FiGrid,      label:'Dashboard',    assign:'' },
  { id:'usuarios',    icon: FiUsers,      label:'Usuarios',     assign:'Miguel' },
  { id:'pedidos',     icon: FiPackage,    label:'Pedidos',      assign:'Miguel' },
  { id:'clientes',    icon: FiBriefcase,  label:'Clientes',     assign:'Katerin' },
  { id:'compras',     icon: FiShoppingCart,label:'Compras',     assign:'Katerin' },
  { id:'productos',   icon: FiBox,        label:'Productos',    assign:'Sebastian' },
  { id:'proveedores', icon: FiTruck,      label:'Proveedores',  assign:'Sebastian' },
  { id:'reportes',    icon: FiBarChart2,  label:'Reportes',     assign:'Sebastian' },
  { id:'ventas',      icon: FiDollarSign, label:'Ventas',       assign:'Issai' },
  { id:'envios',      icon: FiPackage,    label:'Envíos',       assign:'Issai' },
  { id:'cotizaciones',icon: FiFileText,   label:'Cotizaciones', assign:'Rolando' },
  { id:'pagos',       icon: FiCreditCard, label:'Pagos/Cobros', assign:'Rolando' },
];

export default function SidebarLeft({ activeView, onNavigate }) {
  return (
    <aside className="hidden sm:block bg-white border-r border-gray-200 p-3 overflow-y-auto">
      <div className="text-[0.6rem] font-semibold uppercase tracking-wider text-gray-400 px-2.5 pb-1.5 pt-2.5">Módulos</div>
      {modules.map(({ id, icon: Icon, label, assign }) => (
        <button
          key={id}
          className={`flex items-center gap-2.5 w-full px-2.5 py-2 border-0 rounded-lg bg-transparent text-gray-600 text-xs font-medium cursor-pointer text-left relative transition-all duration-150 hover:bg-gray-100 hover:text-primary ${activeView === id ? 'bg-primary-100 text-primary font-semibold' : ''}`}
          onClick={() => onNavigate(id)}
        >
          <Icon className="text-[0.95rem] w-[18px] text-center shrink-0" />
          {label}
          {assign && <span className={`ml-auto text-[0.55rem] px-1.5 py-0.5 rounded ${activeView === id ? 'bg-primary-100 text-primary-light' : 'text-gray-400 bg-gray-100'}`}>{assign}</span>}
        </button>
      ))}
    </aside>
  );
}
