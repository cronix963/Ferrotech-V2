import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../stores/auth.store';

const routeMap = { admin:'/dashboard', cliente:'/tienda', vendedor:'/vendedor' };

export default function Login() {
  const router = useRouter();
  const { loginCredentials, loginGoogle, register, loading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    clearError();
    if (!email.trim() || !pass.trim()) {
      useAuthStore.setState({ error: 'Todos los campos son obligatorios.' });
      return;
    }
    const ok = await loginCredentials(email.trim(), pass);
    if (ok) router.push('/dashboard');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    clearError();
    setRegSuccess('');
    if (!regName.trim() || !regEmail.trim() || !regPass.trim()) {
      useAuthStore.setState({ error: 'Todos los campos son obligatorios.' });
      return;
    }
    if (regPass.length < 6) {
      useAuthStore.setState({ error: 'La contraseña debe tener al menos 6 caracteres.' });
      return;
    }
    const ok = await register(regEmail.trim(), regPass, regName.trim());
    if (ok) {
      setRegSuccess('¡Cuenta creada! Redirigiendo...');
      setTimeout(() => router.push('/tienda'), 1500);
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
            Ingresá con tu cuenta para acceder al sistema.
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
        <form className="w-full max-w-[400px] bg-white rounded-2xl px-8 py-9 shadow-[0_20px_60px_rgba(0,0,0,0.15)]" onSubmit={handleLogin}>
          <div className="text-center mb-7">
            <div className="w-14 h-14 bg-primary rounded-xl inline-flex items-center justify-center font-extrabold text-2xl text-white mb-4">F</div>
            <h2 className="text-xl font-bold text-gray-800">Iniciar Sesión</h2>
            <p className="text-xs text-gray-500 mt-1">Ingresá con tu email y contraseña</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-[#FFF5F5] border border-[#FED7D7] rounded-lg px-3.5 py-2.5 text-xs text-[#9B2C2C] mb-4">
              {error}
            </div>
          )}

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={loginGoogle}
            disabled={loading}
            className="w-full py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Iniciar sesión con Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-[0.65rem] text-gray-400 uppercase">o</span>
            <div className="flex-1 h-px bg-gray-200"></div>
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
            <button type="button" onClick={() => setShowForgot(true)} className="text-primary hover:underline cursor-pointer bg-transparent border-0 text-xs">
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white border-0 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 tracking-wide hover:bg-primary-light hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(26,54,93,0.25)] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>

          <p className="text-center text-xs text-gray-500 mt-5">
            ¿No tenés cuenta?{' '}
            <button type="button" onClick={() => setShowRegister(true)} className="text-primary font-semibold hover:underline cursor-pointer bg-transparent border-0 text-xs">
              Registrate ahora
            </button>
          </p>
        </form>
      </div>

      {/* Register Modal */}
      {showRegister && (
        <div className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center p-5" onClick={() => setShowRegister(false)}>
          <div className="bg-white rounded-2xl max-w-[420px] w-full p-8 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="text-3xl mb-2">🔧</div>
              <h2 className="text-xl font-bold text-gray-800">Crear Cuenta</h2>
              <p className="text-xs text-gray-500 mt-1">Registrate para empezar a comprar</p>
            </div>

            {error && (
              <div className="bg-[#FFF5F5] border border-[#FED7D7] rounded-lg px-3.5 py-2.5 text-xs text-[#9B2C2C] mb-4">{error}</div>
            )}
            {regSuccess && (
              <div className="bg-[#F0FFF4] border border-[#C6F6D5] rounded-lg px-3.5 py-2.5 text-xs text-[#276749] mb-4">{regSuccess}</div>
            )}

            <form onSubmit={handleRegister}>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nombre completo</label>
                <input type="text" placeholder="Tu nombre" value={regName} onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:border-primary-light focus:shadow-[0_0_0_3px_rgba(43,108,176,0.1)] placeholder:text-gray-400" />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
                <input type="email" placeholder="tu@email.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:border-primary-light focus:shadow-[0_0_0_3px_rgba(43,108,176,0.1)] placeholder:text-gray-400" />
              </div>
              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Contraseña</label>
                <input type="password" placeholder="Mínimo 6 caracteres" value={regPass} onChange={(e) => setRegPass(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:border-primary-light focus:shadow-[0_0_0_3px_rgba(43,108,176,0.1)] placeholder:text-gray-400" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-primary text-white border-0 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-primary-light disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? 'Creando...' : 'Crear Cuenta'}
              </button>
            </form>

            <p className="text-center text-xs text-gray-500 mt-4">
              ¿Ya tenés cuenta?{' '}
              <button type="button" onClick={() => setShowRegister(false)} className="text-primary font-semibold hover:underline cursor-pointer bg-transparent border-0 text-xs">
                Iniciar sesión
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center p-5" onClick={() => setShowForgot(false)}>
          <div className="bg-white rounded-2xl max-w-[400px] w-full p-8 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="text-3xl mb-2">🔑</div>
              <h2 className="text-xl font-bold text-gray-800">Recuperar Contraseña</h2>
              <p className="text-xs text-gray-500 mt-1">Ingresá tu email y te enviaremos instrucciones</p>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
              <input type="email" placeholder="tu@email.com" autoFocus
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:border-primary-light focus:shadow-[0_0_0_3px_rgba(43,108,176,0.1)] placeholder:text-gray-400" />
            </div>

            <button type="button" onClick={() => { setShowForgot(false); alert('Función simulada: revisá tu bandeja de entrada.'); }}
              className="w-full py-3 bg-primary text-white border-0 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-primary-light">
              Enviar instrucciones
            </button>

            <p className="text-center text-xs text-gray-500 mt-4">
              <button type="button" onClick={() => setShowForgot(false)} className="text-primary font-semibold hover:underline cursor-pointer bg-transparent border-0 text-xs">
                Volver al inicio de sesión
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
