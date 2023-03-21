import { readFile } from '../../utils';
import { join } from 'path';
import { createWriteStream } from 'fs';

export interface Options {
  list: {
    module?: string;
    prefix: string;
    name?: string;
    columns?: {
      propertyName: string;
      type: string;
      length: string;
      comment: string;
      nullable: boolean;
    }[];
    api?: {
      name?: string;
      method?: string;
      path: string;
      summary?: string;
      dts?: {
        parameters?: {
          description?: string;
          schema?: {
            type: string;
          };
          name?: string;
          required?: boolean;
        }[];
      };
    }[];
  }[];
}

// 临时目录路径
const tempPath = join(__dirname, '../../temp');

// 创建描述文件
// eslint-disable-next-line @typescript-eslint/require-await
export const createEps = async (options: Options) => {
  createWriteStream(join(tempPath, 'eps.json'), {
    flags: 'w',
  }).write(
    JSON.stringify(
      (options.list || []).map((epsService) => {
        const req = epsService.api?.map((api) => {
          const arr = [api.name ? `/${api.name}` : api.path];

          if (api.method) {
            arr.push(api.method);
          }

          return arr;
        });

        return [epsService.prefix, epsService.name || '', req];
      }),
    ),
  );
};

// 获取描述
export const getEps = () =>
  JSON.stringify(readFile(join(tempPath, 'eps.json')));
