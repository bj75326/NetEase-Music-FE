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
|   |   +-- pages  // 
|   |   +-- static
|   |   +-- store
|   |   +-- utils
|   |   +-- views
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

1. 安装 pinia

2. 安装 vue-i18n 实现国际化

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

3. 提供 mitt 供组件注入

mitt 详细功能参考 [mitt](https://github.com/developit/mitt)

4. 安装 router






