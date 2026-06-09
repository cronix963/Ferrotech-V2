import { create } from 'zustand';
import { signIn, signOut, useSession } from 'next-auth/react';

export const useAuthStore = create((set) => ({
  user: null,
  rol: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  setUser: (user) => set({
    user,
    rol: user?.rol || null,
    isAuthenticated: !!user,
    loading: false,
  }),

  loginCredentials: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        set({ error: result.error, loading: false });
        return null;
      }
      return true;
    } catch {
      set({ error: 'Error de conexión', loading: false });
      return null;
    }
  },

  loginGoogle: async () => {
    set({ loading: true, error: null });
    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch {
      set({ error: 'Error con Google', loading: false });
    }
  },

  register: async (email, password, nombre) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, nombre }),
      });
      const data = await res.json();
      if (!res.ok) {
        set({ error: data.error || 'Error al registrar', loading: false });
        return false;
      }
      // Auto-login after registration
      const loginResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (loginResult?.error) {
        set({ error: 'Registrado. Ahora ingresá con tus credenciales.', loading: false });
        return true;
      }
      return true;
    } catch {
      set({ error: 'Error de conexión', loading: false });
      return false;
    }
  },

  logout: () => {
    signOut({ redirect: '/' });
    set({ user: null, rol: null, isAuthenticated: false });
  },

  clearError: () => set({ error: null }),
}));
