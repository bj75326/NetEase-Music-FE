import { createI18n } from 'vue-i18n';
import { config, NemConfig } from '../config';
import { storage } from '/@/nem';

const zhCN = {
  login: {
    namePlaceholder: '请输入姓名',
    passwordPlaceholder: '请输入密码',
    missingUsername: '用户名不能为空',
    missingPassword: '密码不能为空',
    missingVerifyCode: '验证码不能为空',
    submit: '登录',
    verifyCodePlaceholder: '请输入验证码',
  },
};

const enUS = {
  login: {
    namePlaceholder: 'Please enter your name',
    passwordPlaceholder: 'Please enter your password',
    missingUsername: 'Username cannot be empty',
    missingPassword: 'Password cannot be empty',
    missingVerifyCode: 'Verify code cannot be empty',
    submit: 'Login',
    verifyCodePlaceholder: 'Please enter verify code',
  },
};

export const i18n = createI18n({
  locale:
    (storage.get('__app__') as NemConfig['app'])?.locale || config.app.locale,
  legacy: false,
  globalInjection: true,
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
});
