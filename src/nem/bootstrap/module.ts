import { Directive, App } from 'vue';
import { module, Module } from '../module';
import { BaseService, IBaseServiceProtoType } from '../service';
import { Data, filename } from '../utils';
import { isFunction, orderBy } from 'lodash-es';

// 扫描文件
const files: Record<string, { default: unknown }> = import.meta.glob(
  '/src/modules/*/{config.ts,service/**,directives/**}',
  { eager: true },
);

// 模块列表
module.list = Data.get('modules', []) as Module[];

// 解析
for (const filePath in files) {
  // 分割
  // '', 'src', 'modules', moduleName, action
  const [, , , moduleName, action] = filePath.split('/');

  // 文件名
  const fileName = filename(filePath);

  // 文件内容
  const fileContent = files[filePath]?.default;

  // 模块是否存在
  const currModule = module.get(moduleName);

  // 数据
  const data: Module = currModule || {
    name: moduleName,
    options: {},
    value: null,
    services: [],
    directives: [],
  };

  switch (action) {
    // 配置参数
    case 'config.ts':
      data.value = fileContent;
      break;

    // 请求服务
    case 'service':
      const service = new (fileContent as {
        new (...args: unknown[]): BaseService & IBaseServiceProtoType;
      })();

      if (service) {
        data.services?.push({
          path: service.namespace!,
          value: service,
        });
      }
      break;

    // 指令
    case 'directives':
      data.directives?.push({
        name: fileName,
        value: fileContent as Directive,
      });
      break;
  }

  if (!currModule) {
    module.add(data);
  }
}

// 创建
export const createModule = (app: App) => {
  // 模块加载
  const list = orderBy(module.list, 'order').map((module) => { 
    const  = isFunction(module.value) ? module.value(app): module.value;
  });
};
