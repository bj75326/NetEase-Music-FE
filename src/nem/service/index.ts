import { BaseService, IBaseServiceProtoType } from './base';
import { AxiosResponse, AxiosRequestConfig } from 'axios';

export type ExpandedBaseService = BaseService &
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

export interface AtomService {
  [key: string]: AtomService | ExpandedBaseService;
}

export interface Service {
  request?<D>(
    options: AxiosRequestConfig<D>,
  ): Promise<AxiosResponse<unknown, unknown>>;
  [key: string]:
    | (<D>(
        options: AxiosRequestConfig<D>,
      ) => Promise<AxiosResponse<unknown, unknown>>)
    | AtomService
    | ExpandedBaseService
    | undefined;
}

const baseService = new BaseService();

export const service: Service = {
  request: baseService.request.bind(baseService),
};

export * from './base';
