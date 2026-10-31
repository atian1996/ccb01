import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const rootDir =
  typeof import.meta.dirname === 'string'
    ? import.meta.dirname
    : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(rootDir, '.'),
      },
    },
    build: {
      chunkSizeWarningLimit: 800,
      rolldownOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules')) {
              if (id.includes('lucide-react')) return 'vendor-icons';
              if (id.includes('react')) return 'vendor-react';
              return 'vendor';
            }
            if (id.includes('/src/data/')) return 'competition-data';
            if (id.includes('InstitutionAndContentManagement')) return 'module-institution-content';
            if (id.includes('AuthAndUserCenter')) return 'module-auth-user';
            if (id.includes('TeamRegistrationSystem')) return 'module-team-registration';
            if (id.includes('AdminRegistrationManagement')) return 'module-admin-registration';
            if (id.includes('CatalogAndAdminPages')) return 'module-catalog-admin';
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

