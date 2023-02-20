import { Component, Directive } from 'vue';
import { RouteRecordRaw } from 'vue-router';
import { Data } from '../utils';

export interface ModuleConfig {
  order?: number;
  options?: {
    [key: string]: any;
  };
  components?: Component[];
  views?: RouteRecordRaw[];
  pages?: RouteRecordRaw[];
  install?(app: any, options?: any): any;
  onLoad?(events: {
    hasToken: (cb: () => Promise<any> | void) => Promise<any> | void;
    [key: string]: any;
  }): Promise<{ [key: string]: any }> | Promise<void> | void;
}

export interface Module extends ModuleConfig {
  name: string;
  options: {
    [key: string]: any;
  };
  value?: any;
  services?: { path: string; value: string }[];
  directives?: { name: string; value: Directive }[];
}

const list: Module[] = Data.get('modules', []) as Module[];

const module = {
  list,
  req: Promise.resolve(),
  get(name: string): Module | undefined {
    return this.list.find((module) => module.name === name);
  },
  add(module: Module) {
    this.list.push(module);
  },
  wait() {
    return this.req;
  },
};

export { module };
