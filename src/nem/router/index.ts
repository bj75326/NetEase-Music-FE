import {
  createRouter,
  createWebHashHistory,
  createWebHistory,
  RouteRecordRaw,
  _RouteRecordBase,
  RouteRecordNormalized,
  Router as VueRouter,
} from 'vue-router';
import { config, module, storage } from '/@/nem';
import { Loading } from '../utils';
import { isArray } from 'lodash-es';
import { showFailToast } from 'vant';
import { useBase } from '/$/base';

type expand<U> = U extends _RouteRecordBase
  ? U & { isPage?: boolean; viewPath?: string }
  : never;

export type NemRouteRecord = expand<RouteRecordRaw>;

export interface NemRouter extends VueRouter {
  append: (data: NemRouteRecord | NemRouteRecord[]) => void;
  clear: () => void;
  find: (path: string) => RouteRecordNormalized | undefined;
}

// 扫描文件
const files = import.meta.glob([
  '/src/modules/*/{views,pages}/**/*',
  '!**/components',
]);

// 默认路由
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'index',
    component: () => import('/$/base/layout/index.vue'),
    // children: [
    //   {
    //     path: '',
    //     name: 'home',
    //     component: config.
    //   }
    // ],
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('/$/base/pages/error/404.vue'),
  },
];

// 创建路由器
const router: NemRouter = createRouter({
  history:
    config.app.router.mode == 'history'
      ? createWebHistory()
      : createWebHashHistory(),
  routes,
}) as NemRouter;

// 组件加载后
router.beforeResolve(() => {
  Loading.close();
});

// 添加视图，页面路由
router.append = (data: NemRouteRecord | NemRouteRecord[]) => {
  const routeRecords = isArray(data) ? data : [data];

  routeRecords.forEach((routeRecord) => {
    if (!routeRecord.name) {
      routeRecord.name = routeRecord.path.substring(1);
    }

    if (!routeRecord.meta) {
      routeRecord.meta = {};
    }

    if (!routeRecord.component) {
      const url = routeRecord.viewPath;

      if (url) {
        if (url.indexOf('http') === 0) {
          if (routeRecord.meta) {
            routeRecord.meta.iframeUrl = url;
          }

          routeRecord.component = () => import(`/$/base/views/frame.vue`);
        } else {
          routeRecord.component = files['/src/' + url.replace('nem/', '')];
        }
      } else {
        routeRecord.redirect = '/404';
      }
    }

    routeRecord.meta.dynamic = true;

    if (routeRecord.isPage) {
      router.addRoute(routeRecord);
    } else {
      router.addRoute('index', routeRecord);
    }
  });
};

// 清空路由
router.clear = () => {
  const routes = router.getRoutes();

  routes.forEach((route) => {
    if (route.name && route.meta?.dynamic) {
      router.removeRoute(route.name);
    }
  });
};

// 查找路由
router.find = (path: string) =>
  router.getRoutes().find((route) => {
    route.path === path;
  });

// 错误监听
let lock = false;

router.onError((err) => {
  if (!lock) {
    lock = true;

    showFailToast('页面不存在或者未配置');
    console.log(err);

    setTimeout(() => {
      lock = false;
    }, 0);
  }
});

// 注册
async function register(path: string) {
  // 当前路由不存在
  const existed = Boolean(router.find?.(path));

  if (!existed) {
    const { menu } = useBase();

    // 等待 Loading.resolve()
    await Loading.wait();

    // 待注册列表
    const list: NemRouteRecord[] = [];

    // 菜单数据
    menu.routes.forEach((route) => {
      list.push({
        ...route,
        isPage: route.viewPath?.include('/pages'),
      });
    });

    // 模块数据
    module.list.forEach((module) => {
      if (module.views) {
        list.push(...module.views);
      }

      if (module.pages) {
        list.push(
          ...module.pages.map((page) => ({
            ...page,
            isPage: true,
          })),
        );
      }
    });

    // 需要注册的路由
    const route = list.find((routeRecord) => routeRecord.path === path);

    if (route) {
      router.append?.(route);
    }
  }

  return { route: router.find?.(path), isReg: !existed };
}

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 数据缓存
  const { user, process } = useBase();

  // 预先注册路由
  const { isReg, route } = await register(to.path);

  // 组件不存在、路由不存在
  if (!route?.components) {
    next(user.token ? '/404' : '/login');
  } else {
    // 注册后重定向
    if (isReg) {
      // 防止白屏
      next({ ...to, path: route.path });
    } else {
      // 登录成功
      if (user.token) {
        // 在登录页
        if (to.path.includes('/login')) {
          // token 未过期
          if (!storage.isExpired('token')) {
            // 回到首页
            return next('/');
          }
        } else {
          // 添加路由进程
          process.add(to);
        }
      } else {
        // 无需 token 验证
        if (!config.ignore.token.find((path: string) => to.path === path)) {
          return next('/login');
        }
      }

      next();
    }
  }
});

export { router };
