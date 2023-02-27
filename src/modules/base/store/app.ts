import { defineStore } from 'pinia';
import { reactive } from 'vue';
import { config } from '/@/nem';
import { deepMerge, storage } from '/@/nem/utils';

export const useAppStore = defineStore('app', () => {
  // 基本信息
  const info = reactive({
    ...config.app,
  });

  // 事件
  const events = reactive<{ [key: string]: unknown[] }>({
    hasToken: [],
  });

  // 设置基本信息
  const set = (data: { [key: string]: unknown }) => {
    deepMerge(info, data);
    storage.set('__app__', info);
  };

  // 添加事件
  const addEvent = (name: string, handler: () => void) => {
    events[name].push(handler);
  };

  return {
    info,
    events,
    set,
    addEvent,
  };
});
