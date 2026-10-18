import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'server',
  adapter: vercel({
    webAnalytics: { enabled: false },
    imagesConfig: {
      sizes: [320, 640, 960, 1280, 1920],
      formats: ['image/avif', 'image/webp']
    }
  }),
  integrations: [react()],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'bn'],
    routing: 'manual'
  },
  vite: {
    ssr: {
      noExternal: ['lucide-react']
    }
  }
});
