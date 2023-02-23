import { useEventListener } from '@vueuse/core';
import { reactive, watch } from 'vue';
import { getBrowser } from '../utils';

const browser = reactive(getBrowser());
const events: (() => void)[] = [];

watch(
  () => browser.screen,
  () => {
    events.forEach((event) => event());
  },
);


