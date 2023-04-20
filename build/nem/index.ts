import { Plugin } from 'vite';
import { getEps, createEps, Options } from './lib';
import { parseJson } from './utils';

export function nem(): Plugin {
  return {
    name: 'vite-nem',
    enforce: 'pre',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const done = (data: unknown) => {
          res.writeHead(200, { 'Content-Type': 'text/html;charset=UTF-8' });
          res.end(JSON.stringify(data));
        };

        if (req.url?.includes('__nem')) {
          const body = await parseJson(req);
          let next: Promise<unknown>;

          switch (req.url) {
            // 快速创建菜单
            case '/__nem_createMenu':
              // next = createMenu(body);
              break;
            case '/__nem_modules':
              // next = getModules();
              break;
            case '/__nem_eps':
              next = createEps(body as Options);
              break;
          }

          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          if (next) {
            next
              .then((data: unknown) => {
                done({
                  code: 1000,
                  data,
                });
              })
              .catch((err: Error) => {
                done({
                  code: 1001,
                  message: err.message,
                });
              });
          }
        } else {
          next();
        }
      });
    },
    config() {
      return {
        define: {
          __EPS__: getEps(),
        },
      };
    },
  };
}
