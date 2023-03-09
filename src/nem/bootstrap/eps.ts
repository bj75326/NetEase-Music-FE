import { isDev, config } from '../config';
import {
  BaseService,
  service,
  IBaseServiceProtoType,
  Service,
  ExpandedBaseService,
} from '../service';
import { Data, toCamel } from '../utils';
import { isEmpty, isArray } from 'lodash-es';

type LocalEpsJson = [string, string, [string, string?][]][];

interface EpsService {
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
}

interface Eps {
  [key: string]: EpsService[];
}

type Constructor<T> = new (...args: unknown[]) => {
  constructor: Constructor<T>;
  [key: string]: unknown;
} & { prototype: T };

// 获取标签名
const getPropertyNames = <T>(instance: InstanceType<Constructor<T>>) => {
  return [
    ...Object.getOwnPropertyNames(instance.constructor.prototype),
    ...Object.keys(instance),
  ].filter(
    (propertyName) =>
      !['namespace', 'constructor', 'request', 'permission'].includes(
        propertyName,
      ),
  );
};

const baseService = new BaseService() as unknown as InstanceType<
  Constructor<IBaseServiceProtoType['prototype']>
>;

// 标签名
const propertyNames =
  getPropertyNames<IBaseServiceProtoType['prototype']>(baseService);

// 创建
export async function createEps() {
  // 创建描述文件(暂时弃用)
  // const createDts = () => {}

  // 设置
  const setEps = (eps: Eps) => {
    const formatedEps: EpsService[] = [];

    for (const moduleName in eps) {
      // module level
      if (isArray(eps[moduleName])) {
        eps[moduleName].forEach((epsService: EpsService) => {
          // service level
          // 分隔路径
          const directories = epsService.prefix
            .replace(/\//, '')
            .replace('admin', '')
            .split('/')
            .filter(Boolean)
            .map(toCamel);

          // 遍历
          const deep = (service: Service, i: number) => {
            const directory = directories[i];

            if (directory) {
              // 是否是最后一层目录
              if (directories[i + 1]) {
                // 不是最后一层目录
                if (!service[directory]) {
                  service[directory] = {};
                }

                deep(service[directory] as Service, i + 1);
              } else {
                // 最后一层目录
                // 本地不存在则创建实例
                if (!service[directory]) {
                  service[directory] = new BaseService({
                    namespace: epsService.prefix.substring(
                      1,
                      epsService.prefix.length - 1,
                    ),
                  }) as ExpandedBaseService;
                }

                // 创建方法
                epsService.api?.forEach((api) => {
                  // 方法名
                  const name = api.path.replace('/', '');

                  // 过滤
                  if (!propertyNames.includes(name)) {
                    // 不存在属性则创建
                    if (!(service[directory] as ExpandedBaseService)[name]) {
                      if (name && !/[-:]/g.test(name)) {
                        (service[directory] as ExpandedBaseService)[name] =
                          function (data: unknown) {
                            return this.request({
                              url: api.path,
                              method: api.method,
                              [api.method?.toLocaleLowerCase() === 'post'
                                ? 'data'
                                : 'params']: data,
                            });
                          };
                      }
                    }
                  }
                });

                // 创建权限
                if (!(service[directory] as ExpandedBaseService).permission) {
                  (service[directory] as ExpandedBaseService).permission = {};

                  const properties = Array.from(
                    new Set([
                      ...propertyNames,
                      ...getPropertyNames(
                        service[directory] as unknown as InstanceType<
                          Constructor<IBaseServiceProtoType['prototype']>
                        >,
                      ),
                    ]),
                  );

                  properties.forEach((property) => {
                    (service[directory] as ExpandedBaseService).permission![
                      property
                    ] = `${(service[
                      directory
                    ] as ExpandedBaseService)!.namespace!.replace(
                      'admin/',
                      '',
                    )}/${property}`.replace(/\//g, ':');
                  });
                }

                formatedEps.push(epsService);
              }
            }
          };

          deep(service, 0);
        });
      }
    }

    // 缓存数据
    Data.set('service', service);
    console.log('######service', service);

    // createDts(formatedEps);
  };

  // 获取
  const getEps = async () => {
    try {
      let eps: Eps;
      // 本地数据
      eps = {
        eps: (JSON.parse(__EPS__ || '[]') as LocalEpsJson).map(
          ([prefix, name, api]) => ({
            prefix,
            name,
            api: api.map(([path, method]) => ({
              method,
              path,
            })),
          }),
        ),
      };

      // 接口数据
      if (isDev && config.test.eps) {
        await service
          .request({
            url: '/admin/base/open/eps',
          })
          .then((res) => {
            if (!isEmpty(res)) {
              eps = res as unknown as Eps;
            }
          });
      }

      if (eps) {
        setEps(eps);
      }
    } catch (error) {
      console.log('[Eps] 获取失败', error);
    }
  };

  await getEps();
}
