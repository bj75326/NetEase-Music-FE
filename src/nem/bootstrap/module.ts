import { Directive, App, Component } from 'vue';
import { module, Module, ModuleConfig } from '../module';
import { BaseService, IBaseServiceProtoType } from '../service';
import { Data, filename, deepMerge } from '../utils';
import { isFunction, orderBy } from 'lodash-es';
import { service } from '../service';

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
  };

  // 补全
  if (!data.services) {
    data.services = [];
  }
  if (!data.directives) {
    data.directives = [];
  }

  switch (action) {
    // 配置参数
    case 'config.ts':
      data.value = fileContent as ((app?: App) => ModuleConfig) | ModuleConfig;
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
    const config = isFunction(module.value) ? module.value(app) : module.value;

    if (config) {
      Object.assign(module, config);

      // 注册组件
      module.components?.forEach(async (component) => {
        const exportedValue = await (isFunction(component)
          ? (component as () => Promise<Component | { default: Component }>)()
          : (component as Promise<Component | { default: Component }>));

        const concreteComponent: Component =
          (exportedValue as { default: Component }).default || exportedValue;

        app.component(concreteComponent.name!, concreteComponent);
      });

      // 触发安装事件
      if (config.install) {
        config.install(app, config.options);
      }
    }

    // 注册指令
    module.directives?.forEach((directive) => {
      app.directive(directive.name, directive.value);
    });

    // 合并 service
    deepMerge(service, mergeService(module.services || []));
  });
};
