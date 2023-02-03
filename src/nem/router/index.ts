import { createRouter, createWebHashHistory, createWebHistory, RouteRecordRaw } from 'vue-router';

// 扫描文件

// 默认路由
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'index',
    component: () => import('/$/base/layout/index.vue'),
  }  
];

