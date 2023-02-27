import { useEventListener } from '@vueuse/core';
import { reactive, watch } from 'vue';
import { getBrowser } from '../utils';

const browser = reactive(getBrowser());
const eventHandlers: (() => void)[] = [];

watch(
  () => browser.screen,
  () => {
    eventHandlers.forEach((handler) => handler());
  },
);

useEventListener(window, 'resize', () => {
  Object.assign(browser, getBrowser());
});

export function useBrowser() {
  return {
    browser,
    onScreenChange: (handler: () => void, immediate = true) => {
      eventHandlers.push(handler);

      if (immediate) {
        handler();
      }
    },
  };
}
