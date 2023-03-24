import { readFile } from '../../utils';
import { join } from 'path';
import { createWriteStream } from 'fs';
import config from './config';

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
  service: {
    [key: string]: unknown;
  };
}

// 临时目录路径
const tempPath = join(__dirname, '../../temp');

// 获取类型
const getType = ({
  entityName,
  propertyName,
  type,
}: {
  entityName: string;
  propertyName: string;
  type: string;
}) => {
  for (const map of config.entity.mapping) {
    if (map.custom) {
      const resType = map.custom({ entityName, propertyName, type });
      if (resType) return resType;
    }
    if (map.test) {
      if (map.test.includes(type)) return map.type;
    }
  }
  return type;
};

// 创建 Entity
const createEntity = ({ list }: Options) => {
  const 

};

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
