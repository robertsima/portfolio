import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    hmr: {
      protocol: 'ws',      // Change to 'wss' if you are using HTTPS/SSL
      host: 'localhost',
      port: 5173,          // Specify the port
    }
  }
})