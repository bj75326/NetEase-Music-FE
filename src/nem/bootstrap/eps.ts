import { isDev, config } from '../config';
import { BaseService, service, IBaseServiceProtoType } from '../service';
import { Data, toCamel } from '../utils';
import { isEmpty, isArray } from 'lodash-es';

type LocalEps = {
  prefix: string;
  name: string;
  api: {
    method: string | undefined;
    path: string;
  }[];
}[];

interface EpsService {
  module: string;
  prefix: string;
  name?: string;
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
}

interface FetchedEps {
  [module: string]: EpsService[];
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
export async function createEps(){
  // 创建描述文件
  const createDts = () => {

  };

  // 设置
  const setEps = async (eps: LocalEps | FetchedEps) => {
    const formatedEps = [];

    const objEps = isArray(eps) ? { eps } : eps;

    for (const propertyName in objEps) {
      // module level
      if (isArray(objEps[propertyName])) {
        objEps[propertyName].forEach((service: EpsService) => {
          // service level
          // 分隔路径
          const camelPrefix = service.prefix
            .replace(/\//, '')
            .replace('admin', '')
            .split('/')
            .filter(Boolean)
            .map(toCamel);
          
          // 遍历
          const deep = (service: ) => { 

          };
        });
      }
    }
  };

  // 获取
  type LocalEpsJson = [string, string, [string, string?][]][];

  const getEps = async () => {
    try {
      let eps: LocalEps | FetchedEps;
      // 本地数据
      eps = (JSON.parse(__EPS__ || '[]') as LocalEpsJson).map(
        ([prefix, name, api]) => ({
          prefix,
          name,
          api: api.map(([path, method]) => ({
            method,
            path,
          })),
        }),
      );

      // 接口数据
      if (isDev && config.test.eps) {
        await service
          .request({
            url: '/admin/base/open/eps',
          })
          .then((res) => {
            if (!isEmpty(res)) {
              eps = res as unknown as FetchedEps;
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
