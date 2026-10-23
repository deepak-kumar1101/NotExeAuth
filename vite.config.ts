import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const apiTarget = env.VITE_API_URL || 'https://notexe.pages.dev';

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '^/(login|license_login|register|isapplicationpaused|versioncheck|getvariable|getvariables|create_user|delete_user|reset_hwid|create_license|delete_license|create_app|delete_app|list_apps|list_users|list_licenses|list_variables|profile|customer)': {
            target: apiTarget,
            changeOrigin: true,
          }
        }
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
