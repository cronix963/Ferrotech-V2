import { create } from 'zustand';
import pb from '../lib/pocketbase';

export const useAuthStore = create((set, get) => ({
  token: null,
  user: null,
  rol: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  hydrating: true,

  set: (authData) => {
    // Handle both { record, token } from authWithPassword
    // and direct record from authRefresh / manual call
    const record = authData.record || authData;
    const rol = record.rol || 'cliente';
    set({
      token: pb.authStore.token,
      user: record,
      rol,
      isAuthenticated: true,
      loading: false,
      error: null,
    });
  },

  reset: () => {
    set({
      token: null,
      user: null,
      rol: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    });
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      const record = authData.record;
      const rol = record.rol || 'cliente';
      set({
        token: pb.authStore.token,
        user: record,
        rol,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
      return record;
    } catch (err) {
      let msg = 'Error de conexión con el servidor';
      if (err.status === 400) {
        msg = 'Credenciales inválidas';
      }
      set({ error: msg, loading: false });
      throw err;
    }
  },

  logout: () => {
    pb.authStore.clear();
    get().reset();
  },

  clearError: () => set({ error: null }),

  setHydrated: () => set({ hydrating: false }),
}));
