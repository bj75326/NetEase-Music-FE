import { Component, Directive } from 'vue';
import { RouteRecordRaw } from 'vue-router';
import { Data } from '../utils';

export interface ModuleConfig {
  order?: number;
  options?: {
    [key: string]: unknown;
  };
  components?: Component[];
  views?: RouteRecordRaw[];
  pages?: RouteRecordRaw[];
  install?(app: unknown, options?: unknown): unknown;
  onLoad?(events: {
    hasToken: (cb: () => Promise<unknown> | void) => Promise<unknown> | void;
    [key: string]: unknown;
  }): Promise<{ [key: string]: unknown }> | Promise<void> | void;
}

export interface Module extends ModuleConfig {
  name: string;
  options: {
    [key: string]: unknown;
  };
  value?: unknown;
  services?: { path: string; value: unknown }[];
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
