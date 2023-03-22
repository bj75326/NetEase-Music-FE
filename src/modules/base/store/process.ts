import { defineStore } from 'pinia';
import { ref } from 'vue';
import { RouteLocationNormalized } from 'vue-router';

export declare namespace Process {
  interface Item extends RouteLocationNormalized {
    active: boolean;
  }

  type List = Item[];
}

export const useProcessStore = defineStore('process', () => {
  const list = ref<Process.List>([]);

  // 添加
  const add = (data: RouteLocationNormalized) => {
    if (data.path !== '/' && data.meta?.process !== false) {
      const index = list.value.findIndex((item) => item.path === data.path);

      list.value.forEach((item) => {
        item.active = false;
      });

      if (index < 0) {
        list.value.push({
          ...data,
          active: true,
        });
      } else {
        Object.assign(list.value[index], data, { active: true });
      }
    }
  };

  // 移除
  const remove = (index: number) => {
    list.value.splice(index, 1);
  };

  // 设置
  const set = (data: Process.Item[]) => {
    list.value = data;
  };

  // 清空
  const clear = () => {
    list.value = [];
  };

  // 设置标题
  const setTitle = (title: string) => {
    const item = list.value.find((item) => item.active);

    if (item) {
      item.meta.label = title;
    }
  };

  return {
    list,
    add,
    remove,
    set,
    clear,
    setTitle,
  };
});
