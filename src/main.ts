import { createApp } from 'vue';
import { ConfigProvider } from 'vant';
import App from './App.vue';

const app = createApp(App);
app.use(ConfigProvider);
app.mount('#root');
