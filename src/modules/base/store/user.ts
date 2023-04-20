import { defineStore } from 'pinia';
import { ref } from 'vue';
import { storage } from '/@/nem/utils';
import { useService, config, router } from '/@/nem';

// 本地缓存
const data = storage.info();

export const useUserStore = defineStore('user', () => {
  // 标识
  const token = ref<string>(config.test.token || (data.token as string));

  // 设置标识
  const setToken = (data: {
    token: string;
    expire: number;
    refreshToken: string;
    refreshExpire: number;
  }) => {
    // 请求的唯一标识
    token.value = data.token;
    storage.set('token', data.token, data.expire);

    // 刷新 token 的唯一标识
    storage.set('refreshToken', data.refreshToken, data.refreshExpire);
  };

  // 刷新标识
  const refreshToken = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      useService()
        .base.open.refreshToken({
          refreshToken: storage.get('refreshToken'),
        })
        .then(
          (res: {
            token: string;
            expire: number;
            refreshToken: string;
            refreshExpire: number;
          }) => {
            setToken(res);
            resolve(res.token);
          },
        )
        .catch((err) => {
          logout();
          reject(err);
        });
    });
  };

  // 用户信息
  const info = ref<Eps.BaseSysUserEntity | null>(
    data.userInfo as Eps.BaseSysUserEntity,
  );

  // 设置用户信息
  const set = (value: Eps.BaseSysUserEntity) => {
    info.value = value;
    storage.set('userInfo', value);
  };

  // 清除用户
  const clear = () => {
    storage.remove('userInfo');
    storage.remove('token');
    token.value = '';
    info.value = null;
  };

  // 退出
  const logout = () => {
    clear();
    router.clear();
    void router.push('/login');
  };

  // 获取用户信息
  const get = () => {
    return useService()
      .base.comm.person()
      .then((res) => {
        set(res as Eps.BaseSysUserEntity);
        return res;
      });
  };

  return {
    token,
    info,
    get,
    set,
    logout,
    clear,
    setToken,
    refreshToken,
  };
});
