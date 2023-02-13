import {
  createRouter,
  createWebHashHistory,
  createWebHistory,
  RouteRecordRaw,
  Router,
} from 'vue-router';
import { config } from '/@/nem';
import { Loading } from '../utils';

export type NemRouter = Router & {
  append: 
};

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
const router = createRouter({
  history:
    config.app.router.mode == 'history'
      ? createWebHistory()
      : createWebHashHistory(),
  routes,
});

// 组件加载后
router.beforeResolve(() => {
  Loading.close();
});

// 添加视图，页面路由
router.append = () => { 

};
