import { Plugin } from 'vite';
import { getEps } from './lib';

export function nem(): Plugin {
  return {
    name: 'vite-nem',
    enforce: 'pre',
    config() {
      return {
        define: {
          __EPS__: getEps(),
        },
      };
    },
  };
}