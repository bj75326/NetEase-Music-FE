import { ModuleConfig, config } from '/@/nem';
import { useStore } from './store';

export default (): ModuleConfig => ({
  order: 99,
  components: Object.values(import.meta.glob('./components/**/*.{vue,tsx}')),

  views: [
    {
      path: '/my/info',
      meta: {
        label: '个人中心',
      },
      component: () => import('./views/info.vue'),
    },
  ],
  pages: [
    {
      path: '/login',
      component: () => import('./pages/login/index.vue'),
    },
  ],
  install() {
    // 设置标题
    document.title = config.app.name;
  },

  async onLoad() {
    const { user, menu, app } = useStore();

    // token 事件
    const hasToken = async (cb: () => Promise<unknown> | void) => {
      if (cb) {
        app.addEvent('hasToken', cb);

        if (user.token) {
          await cb();
        }
      }
    };

    await hasToken(async () => {
      // 获取用户信息
      await user.get();

      // 获取菜单权限
      // await menu.get();
    });

    return {
      hasToken,
    };
  },
});
