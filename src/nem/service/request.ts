import axios from 'axios';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { showFailToast } from 'vant';
import { isDev, config } from '/@/nem';
import { storage } from '/@/nem/utils';
import { useBase } from '/$/base';

const request = axios.create({
  timeout: 30000,
  withCredentials: false,
});

NProgress.configure({
  showSpinner: false,
});

// 请求列表
let queue: Array<(token: string) => void> = [];

// 是否刷新中
let isRefreshing = false;

// 请求
request.interceptors.request.use(
  (req) => {
    // 取消
    // let cancel: Canceler;
    // req.cancelToken = new axios.CancelToken((c) => {
    //   cancel = c;
    // });

    const { user } = useBase();

    if (req.url) {
      // 请求进度条
      if (!config.ignore.NProgress.some((url) => req.url?.includes(url))) {
        NProgress.start();
      }
    }

    // 请求消息
    if (isDev) {
      console.group(req.url);
      console.log('method:', req.method);
      console.log('data:', req.method === 'get' ? req.params : req.data);
      console.groupEnd();
    }

    // 验证 token
    if (user.token) {
      // 请求标识
      if (req.headers) {
        req.headers['Authorization'] = user.token;
      }

      if (req.url?.includes('refreshToken')) {
        return req;
      }

      // 判断 token 是否过期
      if (storage.isExpired('token')) {
        // 判断 refreshToken 是否过期
        if (storage.isExpired('refreshToken')) {
          user.logout();
          return req;
        }

        // 是否在刷新中
        if (!isRefreshing) {
          isRefreshing = true;

          user
            .refreshToken()
            .then((token: string) => {
              queue.forEach((cb) => cb(token));
              queue = [];
              isRefreshing = false;
            })
            .catch(() => {
              user.clear();
            });
        }

        return new Promise((resolve) => {
          // 将 resolve 的函数放入 queue
          queue.push((token) => {
            if (req.headers) {
              req.headers['Authorization'] = token;
            }
            resolve(req);
          });
        });
      }
    }

    return req;
  },
  (error) => {
    return Promise.reject(error);
  },
);

request.interceptors.response.use(
  (res) => {
    NProgress.done();

    if (!res?.data) {
      return res;
    }

    const { code, data, message } = res.data;

    if (!code) {
      return res.data;
    }

    switch (code) {
      case 1000:
        return data;
      default:
        return Promise.reject({ code, message });
    }
  },
  async (error) => {
    NProgress.done();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (error.response) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const { status, config } = error.response;
      const { user } = useBase();

      if (status === 401) {
        user.logout();
      } else {
        if (isDev) {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
          showFailToast(`${config.url} ${status}`);
        } else {
          switch (status) {
          }
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    return Promise.reject({ message: error.message });
  },
);

export { request };
