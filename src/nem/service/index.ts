import { BaseService } from './base';

const baseService = new BaseService();

export const service = {
  request: baseService.request.bind(baseService),
};

export * from './base';
