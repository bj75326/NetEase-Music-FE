import { Component, Directive, App } from 'vue';
import { RouteRecordRaw } from 'vue-router';
import { Data } from '../utils';
import { BaseService, IBaseServiceProtoType } from '../service';

export interface ModuleConfig {
  order?: number;
  options?: {
    [key: string]: unknown;
  };
  components?: (
    | Component
    | (() => Promise<Component | { default: Component }>)
    | Promise<Component | { default: Component }>
  )[];
  views?: RouteRecordRaw[];
  pages?: RouteRecordRaw[];
  install?(app: App, options?: ModuleConfig['options']): unknown;
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
  value?: ((app?: App) => ModuleConfig) | ModuleConfig;
  services?: { path: string; value: BaseService & IBaseServiceProtoType }[];
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
