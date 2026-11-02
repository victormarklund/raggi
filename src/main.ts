import { mount } from 'svelte';
import { registerSW } from 'virtual:pwa-register';
import App from './App.svelte';
import './app.css';
import { initPersistence } from './lib/store.svelte';
import { initRouter } from './lib/router.svelte';

initPersistence();
initRouter();

// Prevent iOS pinch-zoom & double-tap zoom in standalone mode
document.addEventListener('gesturestart', (e) => e.preventDefault());

if (import.meta.env.PROD) registerSW({ immediate: true });

export default mount(App, { target: document.getElementById('app')! });
