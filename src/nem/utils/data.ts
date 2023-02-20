export const Data = {
  set(key: string, value: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    window[`__${key}__`] = value;
  },

  get(key: string, value?: any) {
    if (value !== undefined && window[`__${key}__`] !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      window[`__${key}__`] = value;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return window[`__${key}__`];
  },
};
