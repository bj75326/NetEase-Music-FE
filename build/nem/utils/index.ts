import fs from 'fs';
import { join, sep } from 'path';
import { Connect } from 'vite';

// 读取文件
export const readFile = (name: string) => {
  try {
    return fs.readFileSync(name, 'utf8');
  } catch (error) {}

  return '';
};

// 解析body
export const parseJson = (req: Connect.IncomingMessage): Promise<unknown> => {
  return new Promise((resolve) => {
    let d = '';
    req.on('data', (chunk: Buffer) => {
      d += chunk;
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(d));
      } catch {
        resolve({});
      }
    });
  });
};

// 横杠转驼峰
export function toCamel(str: string): string {
  return str.replace(
    /([^-])(?:-+([^-]))/g,
    function ($0: string, $1: string, $2: string) {
      return $1 + $2.toUpperCase();
    },
  );
}

// 首字母大写
export function firstUpperCase(value: string): string {
  return value.replace(
    /\b(\w)(\w*)/g,
    function ($0: string, $1: string, $2: string) {
      return $1.toUpperCase() + $2;
    },
  );
}

// 创建目录
export function createDir(path: string) {
  if (!fs.existsSync(path)) fs.mkdirSync(path);
}
