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

// test
// export let serviceWithDts: Eps.Service;

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

export type Constructor<T> = new (...args: unknown[]) => {
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
  // 创建描述文件
  const createDts = async (serviceList: EpsService[]) => {
    if (!isDev) {
      return false;
    }

    const deep = (service: Service) => {
      for (const directory in service) {
        if ((service[directory] as BaseService)?.namespace) {
          // epsService
          const epsService = serviceList.find((epsService: EpsService) =>
            epsService.prefix.includes(
              (service[directory] as BaseService).namespace!,
            ),
          );

          // api
          const api = epsService ? epsService.api : [];

          // 获取方法合集
          [
            ...propertyNames,
            ...getPropertyNames<IBaseServiceProtoType['prototype']>(
              service[directory] as unknown as InstanceType<
                Constructor<IBaseServiceProtoType['prototype']>
              >,
            ),
          ].forEach((propertyName) => {
            if (!api?.find((a) => a.path.includes(propertyName))) {
              api!.push({
                path: `/${propertyName}`,
              });
            }
          });

          if (epsService) {
            epsService.api = api;
          } else {
            serviceList.push({
              prefix: `/${(service[directory] as BaseService).namespace!}`,
              api,
            });
          }
        } else {
          deep(service[directory] as Service);
        }
      }
    };

    deep(service);

    // 本地服务
    return service.request!({
      url: '/__nem_eps',
      method: 'POST',
      proxy: false,
      data: {
        service,
        list: serviceList,
      },
    });
  };

  // 设置
  const setEps = async (eps: Eps) => {
    const serviceList: EpsService[] = [];

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
                    namespace: epsService.prefix.substring(1),
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

                serviceList.push(epsService);
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

    await createDts(serviceList);

    // serviceWithDts = service as unknown as Eps.Service;
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
        await service.request!({
          url: '/admin/base/open/eps',
        }).then((res) => {
          console.log('res ', res);
          if (!isEmpty(res)) {
            eps = res as unknown as Eps;
          }
        });
      }

      if (eps) {
        await setEps(eps);
      }
    } catch (error) {
      console.log('[Eps] 获取失败', error);
    }
  };

  await getEps();
}
