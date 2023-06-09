import { isDev, config, proxy } from '/@/nem';
import { isObject } from 'lodash-es';
import { request } from './request';
import { AxiosRequestConfig, AxiosResponse } from 'axios';

export function ServiceDecorator(
  value:
    | string
    | {
        namespace?: string;
        url?: string;
        mock?: boolean;
        proxy?: '/dev' | '/prod';
      },
) {
  return (target: BaseService & IBaseServiceProtoType) => {
    // 命名
    if (typeof value === 'string') {
      target.prototype.namespace = value;
    }

    // 复杂项
    if (isObject(value)) {
      target.prototype.namespace = value.namespace;
      target.prototype.mock = value.mock;

      // 代理
      if (value.proxy) {
        target.prototype.url = proxy[value.proxy].target;
      } else {
        if (value.url) {
          target.prototype.url = value.url;
        }
      }
    }
  };
}

export interface IBaseServiceProtoType {
  prototype: {
    namespace?: string;
    mock?: boolean;
    url?: string;
    proxy?: string;
  };
}

export class BaseService {
  constructor(
    options = {} as {
      namespace?: string;
    },
  ) {
    if (options?.namespace) {
      this.namespace = options.namespace;
    }
  }

  namespace?: string;

  mock?: boolean;

  url?: string;

  proxy?: string;

  request<D>(
    options: AxiosRequestConfig<D> = {},
  ): Promise<AxiosResponse<unknown, unknown>> {
    if (!options.params) options.params = {};

    let namespace: string | undefined = '';

    // 是否 mock 形式
    if (this.mock || config.test.mock) {
      // 测试
    } else {
      if (isDev) {
        namespace = this.proxy || config.baseUrl;
      } else {
        namespace = this.proxy ? this.url : config.baseUrl;
      }
    }

    // 拼接前缀
    if (this.namespace) {
      namespace += '/' + this.namespace;
    }

    // 处理地址
    if (options.proxy === undefined || options.proxy) {
      options.url = namespace
        ? `${namespace}${options.url || ''}`
        : options.url;
    }

    return request(options);
  }

  list(data: unknown) {
    return this.request({
      url: '/list',
      method: 'POST',
      data,
    });
  }

  page(data: unknown) {
    return this.request({
      url: '/page',
      method: 'POST',
      data,
    });
  }

  info(params: unknown) {
    return this.request({
      url: '/info',
      params,
    });
  }

  update(data: unknown) {
    return this.request({
      url: '/update',
      method: 'POST',
      data,
    });
  }

  delete(data: unknown) {
    return this.request({
      url: '/delete',
      method: 'POST',
      data,
    });
  }

  add(data: unknown) {
    return this.request({
      url: '/add',
      method: 'POST',
      data,
    });
  }
}
