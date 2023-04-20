/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { readFile, toCamel, firstUpperCase, createDir } from '../../utils';
import { join } from 'path';
import { createWriteStream } from 'fs';
import config from './config';
import { last, isEmpty } from 'lodash-es';
import prettier from 'prettier';

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
          name: string;
          required?: boolean;
        }[];
      };
    }[];
  }[];
  service: {
    [key: string]: any;
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
  const fragments = [];

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
        })};`,
      );
    }
    fragment.push('\n');
    fragment.push('/**\n');
    fragment.push(` * 任意键值\n`);
    fragment.push(' */\n');
    fragment.push(`[key: string]: any;`);
    fragment.push('}');
    fragments.push(fragment);
  }

  return fragments.map((fragment) => fragment.join('')).join('\n\n');
};

// 创建 Service
const createService = ({ list, service }: Options) => {
  const fragments = [];

  const serviceFragment = [
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

  const deep = (service: Options['service'], prefix?: string) => {
    if (!prefix) prefix = '';

    for (const directory in service) {
      const name =
        prefix + toCamel(firstUpperCase(directory.replace(/[:]/g, '')));

      if (service[directory].namespace) {
        // 查找配置
        const epsService = list.find((epsService) =>
          (epsService.prefix || '').includes(service[directory].namespace),
        );

        if (epsService) {
          const baseServiceFragment = [`interface ${name} {`];

          serviceFragment.push(`${directory}: ${name};`);

          // 插入方法
          if (epsService.api) {
            // 权限列表
            const permission: string[] = [];

            epsService.api.forEach((api) => {
              // 方法名
              const name = toCamel(
                api.name || last(api.path.split('/')) || '',
              ).replace(/[:\/-]/g, '');

              if (name) {
                // 参数类型
                let param: string[] = [];

                // 参数列表
                const { parameters = [] } = api.dts || {};

                parameters.forEach((p) => {
                  if (p.description) {
                    param.push(`\n/** ${p.description}  */\n`);
                  }

                  if (p.name.includes(':')) {
                    return false;
                  }

                  const pType1 = `${p.name}${p.required ? '' : '?'}`;
                  const pType2 = `${p.schema?.type || 'string'}`;

                  param.push(`${pType1}: ${pType2},`);
                });

                if (isEmpty(param)) {
                  param = ['any'];
                } else {
                  param.unshift('{');
                  param.push('}');
                }

                // 返回类型
                let res = '';

                // 实体名
                const entity = epsService.name || 'any';

                switch (api.path) {
                  case '/page':
                    res = `
											{
												pagination: { size: number; page: number; total: number };
												list: ${entity} [];
												[key: string]: any;
											}
										`;
                    break;

                  case '/list':
                    res = `${entity} []`;
                    break;

                  case '/info':
                    res = entity;
                    break;

                  default:
                    res = 'any';
                    break;
                }

                // 描述
                baseServiceFragment.push('\n');
                baseServiceFragment.push('/**\n');
                baseServiceFragment.push(` * ${api.summary || name}\n`);
                baseServiceFragment.push(' */\n');

                baseServiceFragment.push(
                  `${name}(data${param.length == 1 ? '?' : ''}: ${param.join(
                    '',
                  )}): Promise<${res}>;`,
                );
              }

              permission.push(name);
            });

            // 权限标识
            baseServiceFragment.push('\n');
            baseServiceFragment.push('/**\n');
            baseServiceFragment.push(' * 权限标识\n');
            baseServiceFragment.push(' */\n');
            baseServiceFragment.push(
              `permission: { ${permission
                .map((e) => `${e}: string;`)
                .join('\n')} };`,
            );

            // 权限状态
            baseServiceFragment.push('\n');
            baseServiceFragment.push('/**\n');
            baseServiceFragment.push(' * 权限状态\n');
            baseServiceFragment.push(' */\n');
            baseServiceFragment.push(
              `_permission: { ${permission
                .map((e) => `${e}: boolean;`)
                .join('\n')} };`,
            );

            // 请求
            baseServiceFragment.push('\n');
            baseServiceFragment.push('/**\n');
            baseServiceFragment.push(' * 请求\n');
            baseServiceFragment.push(' */\n');
            baseServiceFragment.push(`request: Service['request']`);
          }

          baseServiceFragment.push('}');
          fragments.push(baseServiceFragment);
        }
      } else {
        serviceFragment.push(`${directory}: {`);
        deep(service[directory], name);
        serviceFragment.push(`},`);
      }
    }
  };

  deep(service);

  // 结束
  serviceFragment.push('}');

  // 追加
  fragments.push(serviceFragment);

  return fragments.map((e) => e.join('')).join('\n\n');
};

// 创建描述文件
// eslint-disable-next-line @typescript-eslint/require-await
export const createEps = async (options: Options) => {
  // 文件内容
  const text = `
		declare namespace Eps {
			${createEntity(options)}
			${createService(options)}
		}
	`;

  // 文本内容
  const content = prettier.format(text, {
    parser: 'typescript',
    useTabs: true,
    tabWidth: 4,
    endOfLine: 'lf',
    semi: true,
    singleQuote: false,
    printWidth: 100,
    trailingComma: 'none',
  });

  // 创建 temp 目录
  createDir(tempPath);

  // 创建 eps 描述文件
  createWriteStream(join(tempPath, 'eps.d.ts'), {
    flags: 'w',
  }).write(content);

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
