import { createRoot } from 'react-dom/client';
import { AuthProvider } from './auth/AuthContext';
import { AuthGate } from './auth/AuthGate';
import { triggerOneShotChunkReload } from './components/hoc';
import './index.css';

// Recover cleanly when a new production build invalidates previously cached Vite chunk hashes
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    triggerOneShotChunkReload();
  });
}

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <AuthGate />
  </AuthProvider>
);
