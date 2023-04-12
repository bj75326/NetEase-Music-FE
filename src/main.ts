import { createApp } from 'vue';
import App from './App.vue';
import { bootstrap } from './nem';

const app = createApp(App);

bootstrap(app)
  .then(() => {
    app.mount('#app');
  })
  .catch((err) => {
    console.log('NetEase-Music-FE 启动失败', err);
  });
