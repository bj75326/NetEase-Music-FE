export const revisePath = (path: string) => {
  if (!path) {
    return '';
  }

  return path[0] === '/' ? path : `/${path}`;
};
