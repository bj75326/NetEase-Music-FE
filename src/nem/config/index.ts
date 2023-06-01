import dev from './dev';
import prod from './prod';
import { ConfigProviderTheme } from 'vant';

// 是否为开发模式
export const isDev = import.meta.env.MODE === 'development';

export interface NemConfig {
  app: {
    name: string;
    router: {
      mode: 'history' | 'hash' | 'memory';
      transition: string;
    };
    theme: ConfigProviderTheme;
    locale: 'zh-CN' | 'en-US';
  };
  ignore: {
    NProgress: string[];
    token: string[];
  };
  test: {
    token: string;
    mock: boolean;
    eps: boolean;
  };
  host: string;
  readonly baseUrl: string;
}

// 配置
export const config: NemConfig = {
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

    // 默认主题
    theme: 'light',

    // 默认语言
    locale: 'zh-CN',
  },

  // 忽略规则
  ignore: {
    // 不显示请求进度条的url
    NProgress: [],
    // 不需要登录验证的页面
    token: ['/login', '/401', '/403', '/404', '/500', '/502'],
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
