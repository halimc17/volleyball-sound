import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles.css';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    if (import.meta.env.PROD) {
      void navigator.serviceWorker.register('/sw.js').catch(() => {
        // Service worker registration may fail on non-HTTPS LAN origins.
      });
    } else {
      // Unregister stale SW in local dev so Vite HMR and edits reflect immediately.
      void navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((reg) => void reg.unregister());
      });
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
