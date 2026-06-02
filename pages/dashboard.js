import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../stores/auth.store';
import pb from '../lib/pocketbase';
import Header from '@/components/Header';
import SidebarLeft from '@/components/SidebarLeft';
import SidebarRight from '@/components/SidebarRight';
import Footer from '@/components/Footer';
import HeroBanner from '@/components/HeroBanner';
import FeaturedGrid from '@/components/FeaturedGrid';

// Views
import UsuariosView from '@/components/views/UsuariosView';
import PedidosView from '@/components/views/PedidosView';
import ClientesView from '@/components/views/ClientesView';
import ComprasView from '@/components/views/ComprasView';
import ProductosView from '@/components/views/ProductosView';
import ProveedoresView from '@/components/views/ProveedoresView';
import ReportesView from '@/components/views/ReportesView';
import VentasView from '@/components/views/VentasView';
import EnviosView from '@/components/views/EnviosView';
import CotizacionesView from '@/components/views/CotizacionesView';
import PagosCobrosView from '@/components/views/PagosCobrosView';

const modules = [
  { id:'dashboard',   label:'📊 Dashboard' },
  { id:'usuarios',    label:'👥 Usuarios' },
  { id:'pedidos',     label:'📦 Pedidos' },
  { id:'clientes',    label:'🏢 Clientes' },
  { id:'compras',     label:'🛒 Compras' },
  { id:'productos',   label:'📋 Productos' },
  { id:'proveedores', label:'🏭 Proveedores' },
  { id:'reportes',    label:'📊 Reportes' },
  { id:'ventas',      label:'💰 Ventas' },
  { id:'envios',      label:'🚚 Envíos' },
  { id:'cotizaciones',label:'📋 Cotizaciones' },
  { id:'pagos',       label:'💳 Pagos/Cobros' },
];

export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated, user, hydrating, rol } = useAuthStore();
  const [activeView, setActiveView] = useState('dashboard');
  const [stats, setStats] = useState({ usuarios: 0, productos: 0, clientes: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  // Auth guard — solo admin
  useEffect(() => {
    if (!hydrating && (!isAuthenticated || rol !== 'admin')) {
      router.replace('/');
    }
  }, [hydrating, isAuthenticated, rol, router]);

  // Fetch real counts from PB when authenticated
  useEffect(() => {
    if (!hydrating && isAuthenticated && rol === 'admin') {
      Promise.all([
        pb.collection('users').getList(1, 1),
        pb.collection('productos').getList(1, 1),
        pb.collection('clientes').getList(1, 1),
      ])
        .then(([users, productos, clientes]) => {
          setStats({
            usuarios: users.totalItems,
            productos: productos.totalItems,
            clientes: clientes.totalItems,
          });
          setStatsLoading(false);
        })
        .catch(() => setStatsLoading(false));
    }
  }, [hydrating, isAuthenticated, rol]);

  if (hydrating) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated || rol !== 'admin') return null;

  const renderContent = () => {
    switch (activeView) {
      case 'usuarios':     return <UsuariosView />;
      case 'pedidos':      return <PedidosView />;
      case 'clientes':     return <ClientesView />;
      case 'compras':      return <ComprasView />;
      case 'productos':    return <ProductosView />;
      case 'proveedores':  return <ProveedoresView />;
      case 'reportes':     return <ReportesView />;
      case 'ventas':       return <VentasView />;
      case 'envios':       return <EnviosView />;
      case 'cotizaciones': return <CotizacionesView />;
      case 'pagos':        return <PagosCobrosView />;
      default:
        return (
          <>
            <HeroBanner stats={stats} loading={statsLoading} />
            <FeaturedGrid />
          </>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Mobile breadcrumb */}
      <div className="flex bg-white border-b border-gray-200 px-4 py-2 gap-2 overflow-x-auto sm:hidden">
        {modules.map(m => (
          <button
            key={m.id}
            className={`shrink-0 px-3.5 py-1.5 border rounded-full text-[0.72rem] font-medium cursor-pointer transition-all duration-150 whitespace-nowrap hover:border-primary-light hover:text-primary ${activeView === m.id ? 'bg-primary border-primary text-white' : 'border-gray-200 bg-white text-gray-600'}`}
            onClick={() => setActiveView(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 flex-1 sm:grid-cols-[195px_1fr_175px] lg:grid-cols-[225px_1fr_210px] xl:grid-cols-[240px_1fr_230px]">
        <SidebarLeft activeView={activeView} onNavigate={setActiveView} />

        <main className="p-4 min-w-0 overflow-x-auto sm:p-5 sm:px-6 lg:px-8 lg:p-6">
          {renderContent()}
        </main>

        <SidebarRight />
      </div>

      <Footer />
    </div>
  );
}
