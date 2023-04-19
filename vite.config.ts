import path from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import eslintPlugin from 'vite-plugin-eslint';
import { proxy } from './src/nem/config/proxy';

const resolve = (dir: string) => path.resolve(__dirname, '.', dir);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    eslintPlugin({
      include: [
        'src/**/*.js',
        'src/**/*.ts',
        'src/**/*.vue',
        'src/*.js',
        'src/*.ts',
        'src/*.vue',
      ],
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        charset: false,
      },
    },
  },
  resolve: {
    alias: {
      '/@': resolve('src'),
      '/#': resolve('types'),
      '/$': resolve('src/modules'),
    },
  },
  server: {
    port: 5173,
    proxy,
    hmr: {
      overlay: true,
    },
  },
});
