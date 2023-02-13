import { getUrlParam, storage } from '../utils';
import { proxy } from './proxy';

export default {
  // 根地址
  host: proxy['/dev'].target,

  // 请求地址
  get baseUrl() {
    let proxy = getUrlParam('proxy');

    if (proxy !== null) {
      storage.set('proxy', proxy);
    } else {
      proxy = (storage.get('proxy') as string) || 'dev';
    }

    return `/${proxy}`;
  },
};
