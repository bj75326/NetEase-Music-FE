import store from 'store';

export default {
  // 后缀标识
  suffix: '_deadtime',

  /**
   * 获取
   * @param {string} key 关键字
   */
  get(key: string): unknown {
    return store.get(key);
  },

  /**
   * 获取全部
   */
  info() {
    const all: { [key: string]: unknown } = {};

    store.each((value: unknown, key: string) => {
      all[key] = value;
    });

    return all;
  },

  /**
   * 设置
   * @param {string} key 关键字
   * @param {*} value 值
   * @param {number} expires 过期时间
   */
  set(key: string, value: unknown, expires?: number) {
    store.set(key, value);

    if (expires !== undefined && !Number.isNaN(expires)) {
      store.set(
        `${key}${this.suffix}`,
        Date.parse(String(new Date())) + expires * 1000,
      );
    }
  },

  /**
   * 是否过期
   * @param {string} key 关键字
   */
  isExpired(key: string) {
    const expiration = this.getExpiration(key);
    if (!Number.isNaN(expiration) && expiration !== 0) {
      return expiration - Date.parse(String(new Date())) <= 2000;
    }
    return true;
  },

  /**
   * 获取到期时间
   * @param {string} key 关键字
   */
  getExpiration(key: string): number {
    return this.get(`${key}${this.suffix}`) as number;
  },

  /**
   * 移除
   * @param {string} key 关键字
   */
  remove(key: string) {
    store.remove(key);
    this.removeExpiration(key);
  },

  /**
   * 移除到期时间
   * @param {string} key 关键字
   */
  removeExpiration(key: string) {
    store.remove(`${key}${this.suffix}`);
  },

  /**
   * 清理
   */
  clearAll() {
    store.clearAll();
  },
};
