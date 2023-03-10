export const Loading: {
  resolve: ((value: any) => void) | null;
  next: Promise<any> | null;
  set: (list: any[]) => Promise<void>;
  wait: () => Promise<any>;
  close: () => void;
} = {
  // next Promise 对象的 resolve 方法
  resolve: null,

  // Promise 对象
  next: null,

  async set(list: any[]) {
    try {
      await Promise.all(list);
    } catch (e) {}

    if (this.resolve) this.resolve(null);
  },

  // eslint-disable-next-line @typescript-eslint/require-await
  async wait() {
    return this.next;
  },

  close() {
    const el = document.getElementById('loading');

    if (el) {
      el.style.display = 'none';
    }
  },
};

Loading.next = new Promise((resolve) => {
  Loading.resolve = resolve;
});
