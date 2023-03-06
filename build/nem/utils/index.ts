import fs from 'fs';
import { join, sep } from 'path';

// 读取文件
export const readFile = (name: string) => {
  try {
    return fs.readFileSync(name, 'utf8');
  } catch (error) {}

  return '';
};
