import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repoName = 'admin_panel'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? `/${repoName}/` : '/',
  server: {
    port: 3000,
    strictPort: true,
    host: true,
  },
}))
