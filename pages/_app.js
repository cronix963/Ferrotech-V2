import '../styles/globals.css';
import { useEffect } from 'react';
import pb from '../lib/pocketbase';
import { useAuthStore } from '../stores/auth.store';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    const hydrate = async () => {
      if (pb.authStore.isValid) {
        try {
          const record = await pb.collection('users').authRefresh();
          useAuthStore.getState().set({ record });
        } catch {
          pb.authStore.clear();
          useAuthStore.getState().reset();
        }
      }
      useAuthStore.getState().setHydrated();
    };
    hydrate();
  }, []);

  return <Component {...pageProps} />;
}
