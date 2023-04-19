export const Data = {
  set(key: string, value: unknown) {
    window[`__${key}__`] = value;
  },

  get(key: string, value?: unknown) {
    if (value !== undefined && !window[`__${key}__`]) {
      window[`__${key}__`] = value;
    }

    return window[`__${key}__`];
  },
};
