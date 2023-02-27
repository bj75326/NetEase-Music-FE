import { } from 'lodash-es';
import { } from '../../utils';
import { join } from 'path';
import config from './config';

interface Options { 
  list: {
    prefix: string;
    name: string;
    columns: any[];
    api: {
      name: string;
      method: string;
      path: string;
      summary: string;
      dts: {
        parameters: {
          description: string;
          schema: {
            type: string;
          };
          name: string;
          required: boolean;
        }[];
      };
    }[];
  }[];
  service: {
    [key: string]: any;
  };
}

// 临时目录路径
const tempPath = join(__dirname, "../../temp");

// 获取类型
const getType = ({ entityName, propertyName, type }) => { 

};
