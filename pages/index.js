import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../stores/auth.store';

const roles = [
  { value:'admin',    label:'Administrador', icon:'🔧', desc:'Gestión completa del sistema' },
  { value:'cliente',  label:'Cliente',       icon:'👤', desc:'Compra de productos' },
  { value:'vendedor', label:'Vendedor',      icon:'🛒', desc:'Registro de ventas' },
];

const routeMap = { admin:'/dashboard', cliente:'/tienda', vendedor:'/vendedor' };

export default function Login() {
  const router = useRouter();
  const { login, loading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [role, setRole] = useState('admin');

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (!email.trim() || !pass.trim()) {
      useAuthStore.setState({ error: 'Todos los campos son obligatorios.' });
      return;
    }

    try {
      const record = await login(email.trim(), pass);
      const userRole = record.rol || 'cliente';
      router.push(routeMap[userRole] || '/');
    } catch {
      // error is set in the store already
    }
  };

  return (
    <div className="login-page min-h-screen flex bg-gradient-to-br from-[#0F1B33] via-[#1A365D] to-[#2B6CB0] relative overflow-hidden">
      <div className="login-container flex w-full max-w-[1200px] mx-auto px-6 items-center justify-center gap-[60px] relative z-10 sm:justify-between">
        {/* Brand */}
        <div className="hidden sm:block text-white max-w-[420px]">
          <div className="text-5xl mb-4">🔧</div>
          <h1 className="text-3xl font-extrabold mb-2 tracking-wider">FERROTECH</h1>
          <p className="text-sm opacity-70 leading-relaxed">
            Sistema de Gestión Integral para Ferretería.
            Elegí tu rol para acceder al sistema.
          </p>
          <div className="mt-8 flex flex-col gap-3.5">
            <div className="flex items-center gap-3 text-sm opacity-75">
              <span className="w-9 h-9 bg-white/8 rounded-lg flex items-center justify-center text-base shrink-0">👥</span>
              Gestión de Usuarios y Clientes
            </div>
            <div className="flex items-center gap-3 text-sm opacity-75">
              <span className="w-9 h-9 bg-white/8 rounded-lg flex items-center justify-center text-base shrink-0">📦</span>
              Pedidos, Ventas y Envíos
            </div>
            <div className="flex items-center gap-3 text-sm opacity-75">
              <span className="w-9 h-9 bg-white/8 rounded-lg flex items-center justify-center text-base shrink-0">💰</span>
              Cotizaciones, Pagos y Cobros
            </div>
            <div className="flex items-center gap-3 text-sm opacity-75">
              <span className="w-9 h-9 bg-white/8 rounded-lg flex items-center justify-center text-base shrink-0">🏪</span>
              Tienda Online para Clientes
            </div>
            <div className="flex items-center gap-3 text-sm opacity-75">
              <span className="w-9 h-9 bg-white/8 rounded-lg flex items-center justify-center text-base shrink-0">🛒</span>
              POS para Vendedores
            </div>
          </div>
        </div>

        {/* Login Card */}
        <form className="w-full max-w-[400px] bg-white rounded-2xl px-8 py-9 shadow-[0_20px_60px_rgba(0,0,0,0.15)]" onSubmit={handleSubmit}>
          <div className="text-center mb-7">
            <div className="w-14 h-14 bg-primary rounded-xl inline-flex items-center justify-center font-extrabold text-2xl text-white mb-4">F</div>
            <h2 className="text-xl font-bold text-gray-800">Iniciar Sesión</h2>
            <p className="text-xs text-gray-500 mt-1">Ingresá con tu email y contraseña</p>
          </div>

          <div className={`bg-[#FFF5F5] border border-[#FED7D7] rounded-lg px-3.5 py-2.5 text-xs text-[#9B2C2C] mb-4 ${error ? 'block' : 'hidden'}`}>
            {error}
          </div>

          <div className="mb-[18px]">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">ROL</label>
            <div className="flex gap-1.5">
              {roles.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`flex-1 px-1.5 py-2.5 rounded-lg cursor-pointer text-center transition-all duration-150 text-[0.72rem] ${
                    role === r.value
                      ? 'border-2 border-primary bg-primary-100 text-primary font-semibold'
                      : 'border border-gray-200 bg-white text-gray-500 font-normal'
                  }`}
                >
                  <div className="text-lg mb-0.5">{r.icon}</div>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-[18px]">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">EMAIL</label>
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none transition-all duration-200 focus:border-primary-light focus:shadow-[0_0_0_3px_rgba(43,108,176,0.1)] placeholder:text-gray-400"
            />
          </div>

          <div className="mb-[18px]">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">CONTRASEÑA</label>
            <input
              type="password"
              placeholder="••••••••"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none transition-all duration-200 focus:border-primary-light focus:shadow-[0_0_0_3px_rgba(43,108,176,0.1)] placeholder:text-gray-400"
            />
          </div>

          <div className="flex justify-between items-center mb-5 text-xs">
            <label className="flex items-center gap-1.5 text-gray-500 cursor-pointer">
              <input type="checkbox" defaultChecked /> Recordarme
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white border-0 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 tracking-wide hover:bg-primary-light hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(26,54,93,0.25)] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? 'Ingresando...' : `Ingresar como ${roles.find(r => r.value === role)?.label}`}
          </button>
        </form>
      </div>
    </div>
  );
}
