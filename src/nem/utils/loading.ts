export const Loading: {
  resolve: ((value: unknown) => void) | null;
  next: Promise<unknown> | null;
  set: (list: any[]) => Promise<void>;
  wait: () => Promise<any>;
  close: () => void;
} = {
  // next Promise 对象的 resolve 方法
  resolve: null,

  // Promise 对象
  next: null,

  async set(list: unknown[]) {
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
