import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const CACHE_RESET_VERSION = '2026-03-18-add-exchange-ui-fix';
const PREVIEW_HOST_PATTERNS = [/lovableproject\.com$/i, /lovable\.app$/i, /-preview--/i];

const shouldForceCacheReset = () => {
  const host = window.location.hostname;
  return PREVIEW_HOST_PATTERNS.some((pattern) => pattern.test(host))
    || localStorage.getItem('app-cache-reset-version') !== CACHE_RESET_VERSION;
};

const clearStaleAppShell = async () => {
  if (typeof window === 'undefined' || !shouldForceCacheReset()) {
    return true;
  }

  let changed = false;

  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    if (registrations.length > 0) {
      const results = await Promise.all(
        registrations.map((registration) => registration.unregister().catch(() => false))
      );
      changed = results.some(Boolean) || changed;
    }
  }

  if ('caches' in window) {
    const cacheKeys = await caches.keys();
    if (cacheKeys.length > 0) {
      await Promise.all(cacheKeys.map((cacheKey) => caches.delete(cacheKey)));
      changed = true;
    }
  }

  localStorage.setItem('app-cache-reset-version', CACHE_RESET_VERSION);

  if (changed && !sessionStorage.getItem('app-cache-reset-reloaded')) {
    sessionStorage.setItem('app-cache-reset-reloaded', 'true');
    window.location.reload();
    return false;
  }

  sessionStorage.removeItem('app-cache-reset-reloaded');
  return true;
};

const bootstrap = async () => {
  const shouldRender = await clearStaleAppShell();

  if (!shouldRender) return;

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
};

void bootstrap();
