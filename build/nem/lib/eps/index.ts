import { } from 'lodash-es';
import { readFile } from '../../utils';
import { join } from 'path';
import config from './config';

interface Options {
  list: {
    prefix: string;
    name: string;
    columns: {
      propertyName: string;
      type: string;
      length: string;
      comment: string;
      nullable: boolean;
    }[];
    api: {
      name: string;
      method: string;
      path: string;
      summary: string;
      dts: {
        parameters: {
          description: string;
          schema: {
            type: string;
          };
          name: string;
          required: boolean;
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
}): string => {
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

const createEntity = ({ list }: Options) => { 
  const entityFragment: string[][] = [];

  for (const item of list) {
    if (!item.name) continue;
    const fragment = [`interface ${item.name} {`];
    for (const col of item.columns || []) {
      // 描述
      fragment.push('\n');
      fragment.push('/**\n');
      fragment.push(` * ${col.comment}\n`);
      fragment.push(' */\n');
      fragment.push(
        `${col.propertyName}?: ${getType({
          entityName: item.name,
          propertyName: col.propertyName,
          type: col.type,
        })}`,
      );
    }
    fragment.push('\n');
    fragment.push('/**\n');
    fragment.push(` * 任意键值\n`);
    fragment.push(' */\n');
    fragment.push(`[key: string]: any;`);
    fragment.push('}');

    entityFragment.push(fragment);
  }

  return entityFragment.map((fragment) => fragment.join('')).join('\n\n');
};

const createService = ({ list, service }: Options) => {
  const serviceFragment: string[][] = [];

  const fragment = [
    `type Service = {
			request(options: {
				url: string;
				method?: 'POST' | 'GET' | string;
				data?: any;
				params?: any;
				proxy?: boolean;
				[key: string]: any;
			}): Promise<any>;
		`,
  ];

  // 处理数据
  // const deep = (service: Options["service"], k?: string) => { 
  //   if (!k) k = '';

  //   for (const i in service){
      
  //   }
  // };
};

// 获取描述
export const getEps = () =>
  JSON.stringify(readFile(join(tempPath, 'eps.json')));
