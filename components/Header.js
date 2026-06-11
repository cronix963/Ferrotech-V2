import { FiLogOut } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react'
import { useAuthStore } from '../stores/auth.store';


export default function Header() {
  const router = useRouter();
  const { user, rol, logout } = useAuthStore();
  const userName = user?.nombre || user?.email || 'Admin';
  const roleLabel = rol === 'admin' ? 'Administrador' : rol === 'vendedor' ? 'Vendedor' : 'Cliente';

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState({ productos: [], clientes: [], pedidos: [] })
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    const handleClick = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="bg-primary px-4 py-2.5 flex items-center justify-between gap-3 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2.5 shrink-0 cursor-pointer" onClick={() => router.push('/dashboard')}>
        <img src="/images/productos/ferrotech_logo.svg" alt="FERROTECH" className="h-9 w-auto" />
      </div>

      <div ref={searchRef} className="hidden sm:block flex-1 max-w-[360px] relative">
        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/35 text-xs" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input type="text" placeholder="Buscar en todos los módulos..."
          value={searchQuery}
          onChange={e => {
            setSearchQuery(e.target.value)
            clearTimeout(debounceRef.current)
            if (e.target.value.length >= 2) {
              debounceRef.current = setTimeout(async () => {
                try {
                  const q = encodeURIComponent(e.target.value)
                  const [prodRes, cliRes, pedRes] = await Promise.all([
                    fetch(`/api/productos?search=${q}&limit=5`),
                    fetch(`/api/clientes?search=${q}&limit=5`),
                    fetch(`/api/pedidos?search=${q}&limit=5`),
                  ])
                  const prod = await prodRes.json()
                  const cli = await cliRes.json()
                  const ped = await pedRes.json()
                  setSearchResults({ productos: prod.data || [], clientes: cli.data || [], pedidos: ped.data || [] })
                  setSearchOpen(true)
                } catch { /* ignore */ }
              }, 300)
            } else {
              setSearchOpen(false)
              setSearchResults({ productos: [], clientes: [], pedidos: [] })
            }
          }}
          onFocus={() => searchQuery.length >= 2 && setSearchOpen(true)}
          className="w-full py-1.5 pl-8 pr-3 border-0 rounded-md text-xs bg-white/12 text-white outline-none placeholder:text-white/35 focus:bg-white/20"
        />
        {searchOpen && (searchResults.productos.length > 0 || searchResults.clientes.length > 0 || searchResults.pedidos.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-[999] max-h-[400px] overflow-y-auto">
            {searchResults.productos.length > 0 && (
              <div className="p-2">
                <div className="text-[0.6rem] uppercase font-semibold text-gray-400 px-2 py-1">Productos</div>
                {searchResults.productos.map(p => (
                  <div key={p.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer text-xs text-gray-700">
                    <span>📦</span> {p.nombre}
                  </div>
                ))}
              </div>
            )}
            {searchResults.clientes.length > 0 && (
              <div className="p-2 border-t border-gray-100">
                <div className="text-[0.6rem] uppercase font-semibold text-gray-400 px-2 py-1">Clientes</div>
                {searchResults.clientes.map(c => (
                  <div key={c.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer text-xs text-gray-700">
                    <span>👤</span> {c.nombre}
                  </div>
                ))}
              </div>
            )}
            {searchResults.pedidos.length > 0 && (
              <div className="p-2 border-t border-gray-100">
                <div className="text-[0.6rem] uppercase font-semibold text-gray-400 px-2 py-1">Pedidos</div>
                {searchResults.pedidos.map(p => (
                  <div key={p.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer text-xs text-gray-700">
                    <span>📋</span> {p.codigo || p.id.slice(0,8)} — {p.cliente}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button className="w-8 h-8 border-0 rounded-lg bg-white/10 text-white/70 cursor-pointer flex items-center justify-center text-sm relative hover:bg-white/20 hover:text-white transition-all duration-200" title="Cerrar sesión" onClick={handleLogout}>
          <FiLogOut />
        </button>
        <div className="flex items-center gap-1.5 text-white cursor-pointer py-0.5 pl-0.5 pr-2 rounded-lg hover:bg-white/10 transition-all duration-200">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center font-bold text-[0.7rem] text-white">{userName.charAt(0).toUpperCase()}</div>
          <div className="leading-tight">
            <span className="text-xs font-medium block">{userName}</span>
            <span className="text-[0.6rem] text-white/40 block">{roleLabel}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
