import { App } from 'vue';
import { createPinia } from 'pinia';
import { router } from '../router';
import mitt from 'mitt';
import { createModule } from './module';
import { createEps } from './eps';
import { Loading as loading } from '../utils';
import { i18n } from './i18n';
// import vant from 'vant';

export async function bootstrap(app: App) {
  console.log('bootstrap');
  // pinia
  app.use(createPinia());

  // vant
  // app.use(vant);

  // i18n
  app.use(i18n);

  // mitt
  app.provide('mitt', mitt());

  // route
  app.use(router);

  // 模块
  const { eventLoop } = createModule(app);

  // eps
  await createEps();

  // 加载
  await loading.set([eventLoop()]);

  console.log('bootstrap end');
}
