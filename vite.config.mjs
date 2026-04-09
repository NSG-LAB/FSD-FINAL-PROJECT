import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const normalizeBasePath = (rawBasePath) => {
  const trimmedBasePath = String(rawBasePath || '/').trim();

  if (!trimmedBasePath || trimmedBasePath === '/') {
    return '/';
  }

  const withLeadingSlash = trimmedBasePath.startsWith('/')
    ? trimmedBasePath
    : `/${trimmedBasePath}`;

  return withLeadingSlash.endsWith('/')
    ? withLeadingSlash
    : `${withLeadingSlash}/`;
};

const getBackendTarget = (env) => {
  const explicitOrigin = env.VITE_BACKEND_ORIGIN;
  if (explicitOrigin) {
    return explicitOrigin;
  }

  if (env.VITE_API_URL) {
    try {
      const parsedApiUrl = new URL(env.VITE_API_URL);
      return `${parsedApiUrl.protocol}//${parsedApiUrl.host}`;
    } catch (_) {
      // Ignore malformed URL and fall back to localhost.
    }
  }

  const fallbackPort = Number(env.VITE_API_PORT || 5000);
  return `http://localhost:${fallbackPort}`;
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const basePath = normalizeBasePath(env.VITE_BASE_PATH);
  const backendTarget = getBackendTarget(env);

  return {
    base: basePath,
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'Property Value Enhancement',
          short_name: 'PropertyApp',
          description: "Enhance your property's value with personalized recommendations.",
          start_url: basePath,
          scope: basePath,
          display: 'standalone',
          background_color: '#ffffff',
          theme_color: '#2563eb',
          icons: [
            {
              src: 'icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        },
      }),
    ],
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.js$/,
      exclude: [],
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
  };
});
