import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves at /Energy-Utilities-ODI-Demo/.
// Override with VITE_BASE=/ when previewing at root.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE ?? '/Energy-Utilities-ODI-Demo/',
})
