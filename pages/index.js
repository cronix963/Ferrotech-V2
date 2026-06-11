import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../stores/auth.store';
import { useProductosStore } from '../stores/productos.store';
import { FiSearch, FiShoppingCart, FiX, FiPlus, FiMinus, FiCheck, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user, hydrating, rol, loginCredentials, loginGoogle, register, error, clearError, loading } = useAuthStore();
  const { fetchAll, items: storeProducts } = useProductosStore();

  /* ── Redirect logged-in users to their dashboard ── */
  useEffect(() => {
    if (!hydrating && isAuthenticated) {
      if (rol === 'admin') router.replace('/dashboard');
      else if (rol === 'vendedor') router.replace('/vendedor');
      else if (rol === 'cliente') router.replace('/cliente');
    }
  }, [hydrating, isAuthenticated, rol, router]);

  /* ── Load products ── */
  useEffect(() => { fetchAll(); }, []);

  const products = storeProducts
    .filter((p) => p.estado !== 'Inactivo' && p.stock > 0)
    .map((p) => ({
      id: p.id,
      name: p.nombre,
      cat: p.categoria,
      price: p.precio,
      stock: p.stock,
      icon: p.icono || '📦',
      desc: p.descripcion || '',
    }));

  const categories = ['Todas', ...new Set(products.map((p) => p.cat))];

  /* ── Search & filter ── */
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('Todas');
  const [detailProd, setDetailProd] = useState(null);

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.cat.toLowerCase().includes(search.toLowerCase());
    const matchCat = cat === 'Todas' || p.cat === cat;
    return matchSearch && matchCat;
  });

  /* ── Login modal ── */
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    clearError();
    if (!loginEmail.trim() || !loginPass.trim()) {
      useAuthStore.setState({ error: 'Todos los campos son obligatorios.' });
      return;
    }
    const ok = await loginCredentials(loginEmail.trim(), loginPass);
    if (ok) {
      setShowLogin(false);
      // AuthHydrator will detect session and redirect
    }
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
      setTimeout(() => {
        setShowRegister(false);
        setShowLogin(false);
        // AuthHydrator will detect session and redirect to /cliente
      }, 1500);
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      setShowLogin(true);
      return;
    }
    // TODO: implement cart + redirect to tienda
    router.push('/cliente');
  };

  if (hydrating) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  /* ── If logged in, don't render (will redirect) ── */
  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ═══ HEADER ═══ */}
      <header className="bg-primary px-6 py-3 flex items-center justify-between text-white sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-2.5 font-bold text-lg">
          <img src="/images/productos/ferrotech_logo.svg" alt="FERROTECH" className="h-9 w-auto" />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowLogin(true)}
            className="bg-white/15 hover:bg-white/25 border-0 text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all"
          >
            Iniciar Sesión
          </button>
        </div>
      </header>

      {/* ═══ HERO ═══ */}
      <section className="relative bg-gradient-to-br from-[#0F1B33] via-[#1A365D] to-[#2B6CB0] text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        </div>
        <div className="relative z-10 max-w-[1200px] mx-auto px-6 py-20 lg:py-28">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <div className="text-6xl mb-5">🔧</div>
              <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight leading-tight">
                Bienvenido a <span className="text-accent-light">FERROTECH</span>
              </h1>
              <p className="text-base lg:text-lg opacity-90 max-w-[550px] mx-auto lg:mx-0 leading-relaxed mb-8">
                Todo lo que necesitás para construir, renovar y mantener tus espacios. Materiales de
                construcción, ferretería, electricidad, plomería y más.
              </p>
              <div className="flex gap-3 justify-center lg:justify-start">
                <button
                  onClick={() => document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-accent hover:bg-accent-light border-0 text-white px-7 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 flex items-center gap-2 shadow-lg shadow-accent/30"
                >
                  <FiShoppingCart /> Ver Productos
                </button>
                <a href="#contacto" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white px-7 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200">
                  Contactanos
                </a>
              </div>
            </div>
            <div className="hidden lg:grid grid-cols-2 gap-4">
              {[
                { value: '15+', label: 'Años de experiencia' },
                { value: '500+', label: 'Productos en stock' },
                { value: '200+', label: 'Clientes satisfechos' },
                { value: '24h', label: 'Entrega rápida' },
              ].map((s, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                  <div className="text-3xl font-extrabold text-accent-light">{s.value}</div>
                  <div className="text-[0.65rem] opacity-75 mt-1.5 uppercase tracking-wide">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      {/* ═══ PRODUCTOS ═══ */}
      <section id="productos" className="py-12 px-6 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-primary mb-3">Nuestros Productos</h2>
            <p className="text-sm text-gray-500">Explorá nuestro catálogo completo</p>
          </div>

          {/* Search & Categories */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 flex-1 max-w-[400px] focus-within:border-primary-light">
              <FiSearch className="text-gray-400 shrink-0" />
              <input
                placeholder="Buscar productos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-0 bg-transparent py-2.5 pl-2 text-sm outline-none w-full text-gray-700"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all ${
                    cat === c
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-primary-light'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer"
                onClick={() => setDetailProd(p)}
              >
                <div className="text-3xl mb-2">{p.icon}</div>
                <h3 className="text-sm font-bold text-gray-800 mb-1 leading-tight">{p.name}</h3>
                <p className="text-[0.65rem] text-gray-400 mb-2">{p.cat}</p>
                <div className="text-primary font-bold text-base">Bs{p.price.toFixed(2)}</div>
                <div className="text-[0.6rem] text-gray-400 mt-1">Stock: {p.stock}</div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">No se encontraron productos</div>
          )}
        </div>
      </section>

      {/* ═══ CATEGORIES ═══ */}
      <section className="py-12 px-6 bg-gray-50">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-2xl font-bold text-primary text-center mb-8">¿Por qué elegir FERROTECH?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: '🏗️', title: 'Materiales de Construcción', desc: 'Cemento, varillas, ladrillos y todo para tu obra.' },
              { icon: '🔧', title: 'Ferretería General', desc: 'Clavos, herramientas manuales y accesorios para el hogar.' },
              { icon: '⚡', title: 'Electricidad', desc: 'Cables, interruptores y material eléctrico profesional.' },
              { icon: '🚿', title: 'Plomería', desc: 'Tuberías PVC, conexiones y accesorios sanitarios.' },
              { icon: '🎨', title: 'Pinturas', desc: 'Látex, impermeabilizantes y acabados de primera.' },
              { icon: '📐', title: 'Asesoría Técnica', desc: 'Te guiamos en la elección de materiales para tu proyecto.' },
            ].map((f, i) => (
              <div key={i} className="group bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">{f.icon}</div>
                <h3 className="text-sm font-bold text-gray-800 mb-1.5">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CONTACTO ═══ */}
      <section id="contacto" className="py-16 px-6 bg-primary text-white">
        <div className="max-w-[1200px] mx-auto text-center">
          <h2 className="text-2xl lg:text-3xl font-bold mb-3">Contactanos</h2>
          <p className="text-sm opacity-80 max-w-[500px] mx-auto mb-10">
            Estamos para ayudarte. Consultá por precios, disponibilidad o asesoramiento técnico.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-[700px] mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <FiPhone className="mx-auto mb-3 text-accent-light" size={24} />
              <h4 className="text-sm font-semibold mb-1">Teléfono</h4>
              <p className="text-xs opacity-70">+591 698-93568</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <FiMail className="mx-auto mb-3 text-accent-light" size={24} />
              <h4 className="text-sm font-semibold mb-1">Email</h4>
              <p className="text-xs opacity-70">cronix963@gmail.com</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <FiMapPin className="mx-auto mb-3 text-accent-light" size={24} />
              <h4 className="text-sm font-semibold mb-1">Ubicación</h4>
              <p className="text-xs opacity-70">Santa Cruz, Bolivia</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-[#0F1B33] text-white/40 text-center px-6 py-5 text-xs">
        <p>FERROTECH © {new Date().getFullYear()} — Todos los derechos reservados</p>
      </footer>

      {/* ═══ MODAL: DETALLE PRODUCTO ═══ */}
      {detailProd && (
        <div className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center p-5" onClick={() => setDetailProd(null)}>
          <div className="bg-white rounded-2xl max-w-[400px] w-full p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div className="text-4xl">{detailProd.icon}</div>
              <button onClick={() => setDetailProd(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer bg-none border-0"><FiX size={20} /></button>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">{detailProd.name}</h3>
            <p className="text-xs text-gray-400 mb-3">{detailProd.cat}</p>
            {detailProd.desc && <p className="text-sm text-gray-600 mb-4">{detailProd.desc}</p>}
            <div className="flex justify-between items-center mb-4">
              <span className="text-2xl font-bold text-primary">Bs{detailProd.price.toFixed(2)}</span>
              <span className="text-xs text-gray-400">Stock: {detailProd.stock}</span>
            </div>
            <button
              onClick={handleAddToCart}
              className="w-full py-3 bg-accent hover:bg-accent-light border-0 text-white rounded-xl text-sm font-semibold cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <FiShoppingCart /> {isAuthenticated ? 'Agregar al Carrito' : 'Iniciar Sesión para Comprar'}
            </button>
          </div>
        </div>
      )}

      {/* ═══ MODAL: LOGIN ═══ */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center p-5" onClick={() => { setShowLogin(false); clearError(); }}>
          <div className="bg-white rounded-2xl max-w-[400px] w-full p-8 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-primary rounded-xl inline-flex items-center justify-center font-extrabold text-2xl text-white mb-4">F</div>
              <h2 className="text-xl font-bold text-gray-800">Iniciar Sesión</h2>
              <p className="text-xs text-gray-500 mt-1">Ingresá con tu email y contraseña</p>
            </div>

            {error && (
              <div className="bg-[#FFF5F5] border border-[#FED7D7] rounded-lg px-3.5 py-2.5 text-xs text-[#9B2C2C] mb-4">{error}</div>
            )}
            {regSuccess && (
              <div className="bg-[#F0FFF4] border border-[#C6F6D5] rounded-lg px-3.5 py-2.5 text-xs text-[#276749] mb-4">{regSuccess}</div>
            )}

            {/* Google OAuth */}
            <button
              type="button"
              onClick={loginGoogle}
              disabled={loading}
              className="w-full py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 cursor-pointer transition-all hover:bg-gray-50 disabled:opacity-60 flex items-center justify-center gap-2 mb-4"
            >
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Iniciar sesión con Google
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-[0.65rem] text-gray-400 uppercase">o</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">EMAIL</label>
                <input type="email" placeholder="tu@email.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:border-primary-light focus:shadow-[0_0_0_3px_rgba(43,108,176,0.1)] placeholder:text-gray-400" />
              </div>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">CONTRASEÑA</label>
                <input type="password" placeholder="••••••••" value={loginPass} onChange={(e) => setLoginPass(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:border-primary-light focus:shadow-[0_0_0_3px_rgba(43,108,176,0.1)] placeholder:text-gray-400" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-primary text-white border-0 rounded-lg text-sm font-semibold cursor-pointer transition-all hover:bg-primary-light disabled:opacity-60">
                {loading ? 'Ingresando...' : 'Ingresar'}
              </button>
            </form>

            <p className="text-center text-xs text-gray-500 mt-5">
              ¿No tenés cuenta?{' '}
              <button type="button" onClick={() => { setShowRegister(true); clearError(); }} className="text-primary font-semibold hover:underline cursor-pointer bg-transparent border-0 text-xs">
                Registrate ahora
              </button>
            </p>
          </div>
        </div>
      )}

      {/* ═══ MODAL: REGISTER ═══ */}
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

            <form onSubmit={handleRegister}>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nombre completo</label>
                <input type="text" placeholder="Tu nombre" value={regName} onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:border-primary-light placeholder:text-gray-400" />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
                <input type="email" placeholder="tu@email.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:border-primary-light placeholder:text-gray-400" />
              </div>
              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Contraseña</label>
                <input type="password" placeholder="Mínimo 6 caracteres" value={regPass} onChange={(e) => setRegPass(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:border-primary-light placeholder:text-gray-400" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-primary text-white border-0 rounded-lg text-sm font-semibold cursor-pointer transition-all hover:bg-primary-light disabled:opacity-60">
                {loading ? 'Creando...' : 'Crear Cuenta'}
              </button>
            </form>

            <p className="text-center text-xs text-gray-500 mt-4">
              ¿Ya tenés cuenta?{' '}
              <button type="button" onClick={() => { setShowRegister(false); clearError(); }} className="text-primary font-semibold hover:underline cursor-pointer bg-transparent border-0 text-xs">
                Iniciar sesión
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
