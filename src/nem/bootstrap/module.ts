import { App } from 'vue';
import { module } from '../module';

// 扫描文件
const files: any = import.meta.glob(
  '/src/modules/*/{config.ts,service/**,directives/**}',
  { eager: true },
);

// 模块列表
module
