import { FiLogOut } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { useAuthStore } from '../stores/auth.store';

export default function Header() {
  const router = useRouter();
  const { user, rol, logout } = useAuthStore();
  const userName = user?.nombre || user?.email || 'Admin';
  const roleLabel = rol === 'admin' ? 'Administrador' : rol === 'vendedor' ? 'Vendedor' : 'Cliente';

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="bg-primary px-4 py-2.5 flex items-center justify-between gap-3 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2.5 shrink-0 cursor-pointer" onClick={() => router.push('/dashboard')}>
        <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center font-bold text-sm text-white">F</div>
        <div>
          <span className="text-white font-bold text-sm tracking-wide">FERROTECH</span>
          <span className="text-[0.6rem] text-white/40 block tracking-wider">SISTEMA DE GESTIÓN</span>
        </div>
      </div>

      <div className="hidden sm:block flex-1 max-w-[360px] relative">
        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/35 text-xs" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input type="text" placeholder="Buscar en todos los módulos..." className="w-full py-1.5 pl-8 pr-3 border-0 rounded-md text-xs bg-white/12 text-white outline-none placeholder:text-white/35 focus:bg-white/20" />
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
