import { BaseService, IBaseServiceProtoType } from './base';
import { AxiosResponse, AxiosRequestConfig } from 'axios';

// test
interface P1 {
  a: number;
}

interface P2 {
  [key: string]: string;
}

type P3 = P1 & P2;

const test: P3 = { a: 1 };

type ExpandedBaseService = BaseService &
  IBaseServiceProtoType & {
    permission?: {
      [key: string]: string;
    };
    _permission?: {
      [key: string]: boolean;
    };
  } & {
    [key: string]: (data: unknown) => Promise<AxiosResponse<unknown, unknown>>;
  };

interface AtomService {
  [key: string]: AtomService | ExpandedBaseService;
}

export type Service = {
  request<D>(
    options: AxiosRequestConfig<D>,
  ): Promise<AxiosResponse<unknown, unknown>>;
} & AtomService;

const baseService = new BaseService();

export const service: Service = {
  request: baseService.request.bind(baseService),
};

export * from './base';
