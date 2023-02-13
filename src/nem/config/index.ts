import dev from './dev';
import prod from './prod';

// 是否为开发模式
export const isDev = import.meta.env.MODE === 'development';

// 配置
export const config = {
  // 项目信息
  app: {
    name: 'NetEase-Music',

    // 路由
    router: {
      // 模式
      mode: 'history',
      // 转场动画
      transition: 'slide',
    },
  },

  // 调试
  test: {
    token: '',
    mock: false,
    eps: true,
  },

  // 当前环境
  ...(isDev ? dev : prod),
};

export * from './proxy';
