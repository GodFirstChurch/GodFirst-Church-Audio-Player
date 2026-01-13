import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This allows the app to access process.env in the browser for the API key if needed,
    // though using import.meta.env is preferred in Vite.
    'process.env': {}
  }
});