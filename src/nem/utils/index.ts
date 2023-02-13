import { } from 'lodash-es';
import storage from './storage';

// 获取地址栏参数
export const getUrlParam = (name: string): string | null => {
  const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
  const r = window.location.search.substring(1).match(reg);

  if (r !== null) return decodeURIComponent(r[2]);

  return null;
};

export { storage };
export * from './loading';
