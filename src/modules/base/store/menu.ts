import { showFailToast } from 'vant';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  storage,
  service,
  ExpandedBaseService,
  Service,
  useService,
} from '/@/nem';
import { RouteComponent } from 'vue-router';
import { revisePath } from '../utils';

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
      [key: string]: string | number | boolean | undefined;
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
    const deep = (service: Service) => {
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

  // 设置视图
  const setRoutes = (list: Menu.List) => {
    routes.value = list;
  };

  // 设置菜单组

  // 获取菜单，权限信息
  const get = () => {
    return new Promise((resolve, reject) => {
      const next = (res: { menus: Menu.List; perms?: string[] }) => {
        const list = res.menus
          .filter((item) => item.type !== 2)
          .map((item) => ({
            ...item,
            path: revisePath(item.router || String(item.id)),
            isShow: item.isShow === undefined ? true : item.isShow,
            meta: {
              label: item.name,
              keepAlive: item.keepAlive || 0,
            },
            children: [],
          }));

        // 设置权限
        setPerms(res.perms || []);

        // 设置菜单组

        // 设置视图路由
        setRoutes(list.filter((item) => item.type === 1));

        // 设置菜单

        resolve(list);

        return list;
      };

      // 动态菜单
      useService()
        .base.comm.permmenu()
        .then(next)
        .catch((err) => {
          showFailToast('菜单加载异常!');
          reject(err);
        });
    });
  };

  // 获取菜单路径

  return {
    routes,
    group,
  };
});
