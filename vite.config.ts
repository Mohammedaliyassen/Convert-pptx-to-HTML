import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Configure Vite to build the Player as a library, sharing the host app's React instance
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/story-player-standalone.tsx'),
      name: 'StoryPlayer',
      fileName: (format) => `story-player.${format}.js`,
      formats: ['umd', 'es'],
    },
    cssCodeSplit: false, // Compile all modular CSS files into a single stylesheet
    rollupOptions: {
      // Exclude React, React-DOM, and React-DOM/Client from the bundle to prevent duplicate instances at runtime
      external: ['react', 'react-dom', 'react-dom/client'],
      output: {
        banner: '"use client";', // Prepend "use client" for Next.js App Router compatibility
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-dom/client': 'ReactDOMClient',
        },
      },
    },
  },
});
