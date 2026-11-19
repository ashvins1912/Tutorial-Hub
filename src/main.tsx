import {createRoot} from 'react-dom/client';
import { AuthProvider } from './auth/AuthContext';
import { AuthGate } from './auth/AuthGate';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <AuthGate />
  </AuthProvider>,
);
