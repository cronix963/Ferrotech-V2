import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../stores/auth.store';
import { FiArrowRight, FiShoppingCart, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';

export default function ClienteHome() {
  const router = useRouter();
  const { isAuthenticated, user, hydrating, rol, logout } = useAuthStore();
  const [userName, setUserName] = useState('Cliente');
  const [loaded, setLoaded] = useState(false);
  const [visibleSections, setVisibleSections] = useState({});
  const observerRef = useRef(null);

  useEffect(() => {
    if (!hydrating && (!isAuthenticated || rol !== 'cliente')) {
      router.replace('/');
      return;
    }
    if (!hydrating && isAuthenticated) {
      if (user?.nombre) setUserName(user.nombre);
      else if (user?.email) setUserName(user.email);
    }
  }, [hydrating, isAuthenticated, rol, user, router]);

  useEffect(() => {
    if (!hydrating && isAuthenticated) {
      const t = setTimeout(() => setLoaded(true), 150);

      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleSections((prev) => ({ ...prev, [entry.target.dataset.section]: true }));
            }
          });
        },
        { threshold: 0.15 },
      );

      return () => {
        clearTimeout(t);
        observerRef.current?.disconnect();
      };
    }
  }, [hydrating, isAuthenticated]);

  useEffect(() => {
    if (loaded) {
      document.querySelectorAll('[data-section]').forEach((el) => observerRef.current?.observe(el));
    }
  }, [loaded]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const features = [
    { icon: '🏗️', title: 'Materiales de Construcción', desc: 'Cemento, varillas, ladrillos y todo para tu obra.' },
    { icon: '🔧', title: 'Ferretería General', desc: 'Clavos, herramientas manuales y accesorios para el hogar.' },
    { icon: '⚡', title: 'Electricidad', desc: 'Cables, interruptores y material eléctrico profesional.' },
    { icon: '🚿', title: 'Plomería', desc: 'Tuberías PVC, conexiones y accesorios sanitarios.' },
    { icon: '🎨', title: 'Pinturas', desc: 'Látex, impermeabilizantes y acabados de primera.' },
    { icon: '📐', title: 'Asesoría Técnica', desc: 'Te guiamos en la elección de materiales para tu proyecto.' },
  ];

  const stats = [
    { value: '15+', label: 'Años de experiencia' },
    { value: '500+', label: 'Productos en stock' },
    { value: '200+', label: 'Clientes satisfechos' },
    { value: '24h', label: 'Entrega rápida' },
  ];

  if (hydrating) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated || rol !== 'cliente') return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ═══ HEADER ═══ */}
      <header className="bg-primary px-6 py-3 flex items-center justify-between text-white sticky top-0 z-50 shadow-md">
        <div
          className="flex items-center gap-2.5 font-bold text-lg cursor-pointer"
          onClick={() => router.push('/cliente')}
        >
          <img src="/images/productos/ferrotech_logo.svg" alt="FERROTECH" className="h-9 w-auto" />
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/tienda')}
            className="bg-accent hover:bg-accent-light border-0 text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 flex items-center gap-1.5"
          >
            <FiShoppingCart /> Comprar Productos
          </button>
          <div
            className="flex items-center gap-2 cursor-pointer hover:bg-white/10 py-1 pl-1 pr-3 rounded-lg transition-all"
            onClick={handleLogout}
          >
            <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center font-bold text-xs text-white">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="max-sm:hidden">
              <span className="text-xs font-medium block">{userName}</span>
              <span className="text-[0.58rem] text-white/40 block">Cliente</span>
            </div>
          </div>
        </div>
      </header>

      {/* ═══ HERO ANIMADO ═══ */}
      <section className="relative bg-gradient-to-br from-[#0F1B33] via-[#1A365D] to-[#2B6CB0] text-white overflow-hidden">
        {/* Círculos decorativos animados */}
        <div className="absolute inset-0">
          <div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: '6s' }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: '8s' }}
          />
        </div>

        <div
          className={`relative z-10 max-w-[1200px] mx-auto px-6 py-20 lg:py-28 transition-all duration-1000 ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              {/* Icono animado */}
              <div
                className={`text-6xl mb-5 transition-all duration-700 delay-200 ${
                  loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                }`}
              >
                🔧
              </div>

              <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight leading-tight">
                Bienvenido a <span className="text-accent-light">FERROTECH</span>
              </h1>

              <p
                className={`text-base lg:text-lg opacity-90 max-w-[550px] mx-auto lg:mx-0 leading-relaxed mb-8 transition-all duration-700 delay-500 ${
                  loaded ? 'opacity-90 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                Todo lo que necesitás para construir, renovar y mantener tus espacios. Materiales de
                construcción, ferretería, electricidad, plomería y más, con la calidad y el respaldo
                que merecés.
              </p>

              <div
                className={`flex gap-3 justify-center lg:justify-start transition-all duration-700 delay-700 ${
                  loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                <button
                  onClick={() => router.push('/tienda')}
                  className="bg-accent hover:bg-accent-light border-0 text-white px-7 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 flex items-center gap-2 shadow-lg shadow-accent/30"
                >
                  <FiShoppingCart /> Ir a la Tienda
                </button>
                <a
                  href="#contacto"
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white px-7 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200"
                >
                  Contactanos
                </a>
              </div>
            </div>

            {/* Stats cards */}
            <div className="hidden lg:grid grid-cols-2 gap-4">
              {stats.map((s, i) => (
                <div
                  key={i}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center transition-all duration-700"
                  style={{
                    transitionDelay: `${300 + i * 150}ms`,
                    opacity: loaded ? 1 : 0,
                    transform: loaded ? 'translateY(0)' : 'translateY(20px)',
                  }}
                >
                  <div className="text-3xl font-extrabold text-accent-light">{s.value}</div>
                  <div className="text-[0.65rem] opacity-75 mt-1.5 uppercase tracking-wide">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fade hacia la siguiente sección */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      {/* ═══ ¿POR QUÉ NOSOTROS? ═══ */}
      <section
        data-section="features"
        className={`py-16 px-6 bg-white transition-all duration-700 ${
          visibleSections['features'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-primary mb-3">
              ¿Por qué elegir FERROTECH?
            </h2>
            <p className="text-sm text-gray-500 max-w-[600px] mx-auto">
              No solo vendemos materiales — acompañamos cada proyecto con calidad, experiencia y
              compromiso.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div
                key={i}
                className="group bg-gray-50 border border-gray-200 rounded-xl p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary-100 cursor-default"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {f.icon}
                </div>
                <h3 className="text-sm font-bold text-gray-800 mb-1.5">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CONFIANZA ═══ */}
      <section
        data-section="trust"
        className={`py-16 px-6 bg-gray-50 transition-all duration-700 ${
          visibleSections['trust'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-[1200px] mx-auto text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-primary mb-4">
            Comprometidos con tu proyecto
          </h2>
          <p className="text-sm text-gray-500 max-w-[650px] mx-auto leading-relaxed mb-8">
            En FERROTECH trabajamos día a día para ofrecerte los mejores materiales al mejor precio.
            Con más de 15 años en el rubro, somos la ferretería de confianza para constructores,
            arquitectos y familias que construyen sus sueños.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-[800px] mx-auto">
            {[
              { icon: '✅', label: 'Calidad Garantizada' },
              { icon: '🚚', label: 'Entrega Rápida' },
              { icon: '💰', label: 'Mejor Precio' },
              { icon: '🤝', label: 'Atención Personalizada' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="text-xs font-semibold text-gray-700">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CONTACTO ═══ */}
      <section
        id="contacto"
        data-section="contact"
        className={`py-16 px-6 bg-primary transition-all duration-700 ${
          visibleSections['contact'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-[1200px] mx-auto text-center text-white">
          <h2 className="text-2xl lg:text-3xl font-bold mb-3">Contactanos</h2>
          <p className="text-sm opacity-80 max-w-[500px] mx-auto mb-10">
            Estamos para ayudarte. Consultá por precios, disponibilidad o asesoramiento técnico.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-[700px] mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <FiPhone className="mx-auto mb-3 text-accent-light" size={24} />
              <h4 className="text-sm font-semibold mb-1">Teléfono</h4>
              <p className="text-xs opacity-70">+591 722-1234</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <FiMail className="mx-auto mb-3 text-accent-light" size={24} />
              <h4 className="text-sm font-semibold mb-1">Email</h4>
              <p className="text-xs opacity-70">info@ferrotech.bo</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <FiMapPin className="mx-auto mb-3 text-accent-light" size={24} />
              <h4 className="text-sm font-semibold mb-1">Ubicación</h4>
              <p className="text-xs opacity-70">Av. Principal, Santa Cruz</p>
            </div>
          </div>

          <div className="mt-10">
            <button
              onClick={() => router.push('/tienda')}
              className="bg-accent hover:bg-accent-light border-0 text-white px-8 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 shadow-lg"
            >
              <FiShoppingCart className="inline mr-2" /> Comenzá a Comprar
            </button>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-[#0F1B33] text-white/40 text-center px-6 py-5 text-xs">
        <p>FERROTECH © {new Date().getFullYear()} — Todos los derechos reservados</p>
        <p className="mt-1 opacity-60">Sistema de Gestión Integral para Ferretería</p>
      </footer>
    </div>
  );
}
