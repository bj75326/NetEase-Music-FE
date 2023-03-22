import { showFailToast } from 'vant';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { storage, service, ExpandedBaseService, Service } from '/@/nem';
import { RouteComponent } from 'vue-router';

export declare namespace Menu {
  enum Type {
    '目录' = 0,
    '菜单' = 1,
    '权限' = 2,
  }

  interface Item {
    id: number;
    parentId: number;
    path: string;
    router?: string;
    viewPath?: string;
    type: Type;
    name: string;
    icon: string;
    orderNum: number;
    isShow: number | boolean;
    keepAlive?: number;
    meta?: {
      label?: string;
      keepAlive?: number | boolean;
      iframeUrl?: string;
    };
    children?: Item[];
    component?: RouteComponent;
    redirect?: string;
  }

  type List = Item[];
}

// 本地缓存
const data = storage.info();

export const useMenuStore = defineStore('menu', () => {
  // 视图路由
  const routes = ref<Menu.List>([]);

  // 菜单组
  const group = ref<Menu.List>((data['menu.group'] as Menu.List) || []);

  // 顶部菜单序号
  const index = ref<number>(0);

  // 左侧菜单列表
  // const list = ref<Menu.List>([]);

  // 权限列表
  const perms = ref<string[]>((data['menu.perms'] as string[]) || []);

  // 设置左侧菜单

  // 设置权限
  const setPerms = (list: string[]) => {
    const deep = (service: Service | ExpandedBaseService) => {
      if (typeof service === 'object') {
        if (service.permission) {
          const expandedBaseService: ExpandedBaseService =
            service as ExpandedBaseService;
          expandedBaseService._permission = {};
          for (const i in expandedBaseService.permission) {
            expandedBaseService._permission[i] =
              list.findIndex((perm: string) => {
                perm
                  .replace(/:/g, '/')
                  .includes(
                    `${expandedBaseService.namespace!.replace(
                      'admin/',
                      '',
                    )}/${i}`,
                  );
              }) >= 0;
          }
        } else {
          for (const i in service) {
            deep(service[i] as Service);
          }
        }
      }
    };

    deep(service);
  };
});
