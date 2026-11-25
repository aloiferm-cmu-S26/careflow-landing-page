import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const root = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  // Relative asset paths let the site run from any GitHub Pages sub-path
  // without a rebuild when the repository name changes.
  base: './',
  plugins: [react()],
  resolve: {
    alias: { '@': resolve(root, 'src') },
  },
  build: {
    target: 'es2022',
    rollupOptions: {
      // The landing page lives at /, the clickable MVP prototype at /app/ and
      // its style guide at /style-guide/.
      input: {
        home: resolve(root, 'index.html'),
        app: resolve(root, 'app/index.html'),
        styleGuide: resolve(root, 'style-guide/index.html'),
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/test-setup.ts'],
    css: { modules: { classNameStrategy: 'non-scoped' } },
  },
})
