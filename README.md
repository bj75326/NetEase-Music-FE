<h1 align="center">仿网易云音乐移动端开发纪要</h1>

## 前言

之前大致学习了 vue 生态的基础，想重拾并做一个完整的小项目，主要复习

1. vue3 基础知识
2. 移动端布局
3. 移接 cool-admin 架构至本项目，并复习 cool-admin

配套的后台开发也同步进行，具体在[NetEase-Music-BE](https://github.com/bj75326/NetEase-Music-BE)
  
  
## 环境搭建

- vite: 使用 **-template vue-ts** 初始化项目，并负责项目构建
- ESlint: 规范项目代码
- prettier: 统一代码风格
- ++
  
  
## 技术栈

- vue: 页面构建
- vant: 页面组件库
- pinia
  

## 项目目录

```ts
.src
+-- assets  // 资源文件，比如图片之类
+-- modules  // 所有模块
|   +-- base  // 基础模块目录
|   |   +-- components  // 组件文件夹
|   |   +-- layout  // 布局
|   |   +-- pages  // 页面
|   |   +-- static
|   |   +-- store
|   |   +-- utils
|   |   +-- views // 视图
|   |   +-- config.ts
|   |   +-- index.ts
|   +-- demo
+-- nem  // 框架文件夹
|   +-- bootstrap
|   |   +-- eps.ts  // 处理 eps, 从后台获得所有 api
|   |   +-- i18n.ts  // 处理国际化
|   |   +-- module.ts  // 安装模块
|   |   +-- index.ts  // 启动文件
|   +-- config
|   |   +-- dev.ts  // 开发环境调用 api 目标域名（host）和基础目录（baseUrl）
|   |   +-- prod.ts  // 产品环境调用 api 目标域名（host）和基础目录 （baseUrl）
|   |   +-- proxy.ts  // dev & prod 后台访问代理配置
|   |   +-- index.ts  // 配置信息
|   +-- hooks  // 自定义 hook
|   +-- module
|   |   +-- index.ts  // 定义模块存储对象 
|   +-- router
|   |   +-- index.ts  // 创建项目路由
|   +-- service
|   |   +-- base.ts  // 定义 BaseService 类
|   |   +-- index.ts  // 创建 service 对象
|   |   +-- request.ts  // 基于 axios 创建请求方法
|   +-- utils
|   |   +-- data.ts  // 定义全局对象存储方法
|   |   +-- index.ts  // 定义一些通用工具方法
|   |   +-- loading.ts  // 定义 loading 
|   |   +-- storage.ts  // 定义本地存储方法
|   +-- index.ts  // 导出
+-- App.vue  // 项目根组件
+-- main.ts  // js 入口文件
+-- index.html  // 挂载网页
```
  

## 框架搭建

在开始 mount 页面之前，需要执行 [bootstrap](/src/nem/bootstrap/index.ts) 来启动整个项目，我们通过 bootstrap 内的执行顺序来梳理框架结构。

### 1. 安装 pinia

// todo
  
  
### 2. 安装 vue-i18n 实现国际化

vue-i18n 配置目录 [/src/nem/bootstrap/i18n.ts](/src/nem/bootstrap/i18n.ts) 

```ts
const i18n = createI18n({
  // 初始区域优先级
  // 1. 从本地存储中获取
  // 2. 从当前系统中获取
  // 3. 项目配置终获取
  locale:
    (storage.get('**app**') as NemConfig['app'])?.locale ||
    ['zh-CN', 'en-US'].find((locale) => locale === navigator.language) ||
    config.app.locale,
  legacy: false,
  globalInjection: true,
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
});
```
  
  
### 3. 提供 mitt 供组件注入

mitt 详细功能参考 [mitt](https://github.com/developit/mitt)
  
  
### 4. 安装 router

router 初始只定义了两条匹配记录：

```ts
const routes: RouteRecordRaw[] = [
  // 默认路由
  {
    path: '/',
    name: 'index',
    component: () => import('/$/base/layout/index.vue'),
  },
  // 未匹配路由
  {
    path: '/:pathMatch(.*)*',
    component: () => import('/$/base/pages/error/404.vue'),
  },
];
```

同时，通过 vite 提供的 [import.meta.glob](https://cn.vitejs.dev/guide/migration-from-v2.html#importmetaglob) 获取所有模块的视图和页面，为后续动态添加路由做准备。

之后，使用 vue-router 基于 config 内的路由配置创建好路由，并对 router 扩充以下方法：

- append  添加路由
- clear  清空所有动态路由
- find  查找路由

nem router 通过注册全局前置守卫，动态添加路由，具体流程如下：

![nem_router_flowchart](./src/assets/nem_router_beforeEach_flowchart.png#gh-light-mode-only)
![nem_router_flowchart_dark](./src/assets/nem_router_beforeEach_flowchart_dark.png#gh-dark-mode-only)

> 思考：为什么注册新路由需要等到模块的 eventLoop 执行完成？  

> 思考：每次从 menu 和模块获取路由消息开销太大，为什么不设置缓存？  


### 5. 安装模块

首先，熟悉下每一个模块的导出数据结构：

```ts
export interface ModuleConfig {
  order?: number;
  options?: {
    [key: string]: unknown;
  };
  components?: (
    | Component
    | (() => Promise<Component | { default: Component }>)
    | Promise<Component | { default: Component }>
  )[];
  views?: RouteRecordRaw[];
  pages?: RouteRecordRaw[];
  install?(app: App, options?: ModuleConfig['options']): unknown;
  onLoad?(events: {
    hasToken?: (cb: () => Promise<unknown> | void) => Promise<unknown> | void;
    [key: string]: unknown;
  }): Promise<{ [key: string]: unknown }> | Promise<void> | void;
}

export interface Module extends ModuleConfig {
  name: string;
  options: {
    [key: string]: unknown;
  };
  value?: ((app?: App) => ModuleConfig) | ModuleConfig;
  services?: { path: string; value: BaseService & IBaseServiceProtoType }[];
  directives?: { name: string; value: Directive }[];
}
```

> 思考：为什么要将模块导出内容结构分为 Module 和 ModuleConfig？  
> Module 定义的内容通过扫描 modules 目录获得，ModuleConfig 定义的内容通过每个模块的 config 获得。Module 定义的内容要求同步获得，而 ModuleConfig 的内容可以选择异步加载。

在项目加载时，通过 [import.meta.glob](https://cn.vitejs.dev/guide/migration-from-v2.html#importmetaglob) 扫描 /src/modules，获取 config，service，directives。需要注意的是，这个时候扫描读取文件加上了参数 `eager: true`，内容同步读取。之后，遍历文件内容，处理后放入模块缓存中。

之后，项目初始化时，按照模块 order 逐个解析模块缓存中的模块，注册组件，触发安装事件，注册指令，合并 service，在所有模块安装完成后返回一个 eventLoop 函数执行所有模块的 onLoad 钩子。

> 思考：为什么 eventLoop 函数需要在解析好 eps 之后才执行？  
> 类似每个模块内需要异步获取数据之类的操作会放在模块 onLoad 钩子内执行，而从后台获取数据需要 service，所以需要等到 eps 解析完成再执行。


### 6. 获取并解析 eps，扩充 service

eps 全称 entity provide service，通过检索后台提供的服务在前端自动生成 api 调用方法。

#### 6.1 封装请求方法

本项目基于 axios 封装请求方法，并配置 request 和 response 拦截器。

- request 拦截器 

request 拦截器主要功能是开启请求进度条，并验证 token 和 refreshToken。

1. token 未过期，直接通过拦截器。
2. token 过期，refreshToken 过期， 直接登出。
3. token 过期，refreshToken 未过期，向后台发出 refresh token 请求，将当前请求放入队列中，在 token 刷新之后，遍历队列恢复请求。

- response 拦截器

response 拦截器主要功能是关闭请求进度条，初步处理下返回数据。

之后 BaseService 在此基础上调用封装好的 request，并加上代理 baseUrl。

#### 6.2 Eps 数据结构

生产环境通过读取本地 [eps.json](/build/nem/temp/eps.json) 获取 eps， 开发环境在项目初始化时调用接口获得，Eps 结构如下

```ts
interface EpsService {
  module?: string;
  prefix: string;
  name?: string;
  columns?: {
    propertyName: string;
    type: string;
    length: string;
    comment: string;
    nullable: boolean;
  }[];
  api?: {
    name?: string;
    method?: string;
    path: string;
    summary?: string;
    dts?: {
      parameters?: {
        description?: string;
        schema?: {
          type: string;
        };
        name?: string;
        required?: boolean;
      }[];
    };
  }[];
}

interface Eps {
  [key: string]: EpsService[];  // 每一个模块对应一组 EpsService
}
```

#### 6.3 解析 Eps



> 思考：为什么安装模块需要在解析 eps 之前进行？  
> 各个模块也会有各自的 service，在安装模块时，这些 service 会先行合并到项目 service 上，之后 eps 解析扩充项目 service 后，一起生成描述文件。






