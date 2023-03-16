import { App } from 'vue';
import { createPinia } from 'pinia';
import { router } from '../router';
import mitt from 'mitt';
import { createModule } from './module';
import { createEps } from './eps';
import { Loading } from '../utils';

export async function bootstrap(app: App) {
  // pinia
  app.use(createPinia());

  // mitt
  app.provide('mitt', mitt());

  // route
  app.use(router);

  // 模块
  const { eventLoop } = createModule(app);

  // eps
  await createEps();

  // 加载
  Loading.set();
}
