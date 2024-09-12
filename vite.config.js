import { resolve } from 'path'

export default {
  root: resolve(__dirname),
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'), 
      }
    }
  },
  server: {
    port: 8080
  }
}