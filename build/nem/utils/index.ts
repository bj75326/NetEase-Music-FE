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
