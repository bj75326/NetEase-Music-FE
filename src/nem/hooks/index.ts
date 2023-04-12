import { Emitter, EventType } from 'mitt';
import { inject, reactive, Ref, getCurrentInstance } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { service } from '../service';
import { Data } from '../utils';

export const useService = () => {
  return Data.get('service', service) as Eps.Service;
};

export function useRefs() {
  const refs = reactive<{ [key: string]: unknown }>({});
  function setRefs(name: string) {
    return (value: unknown) => {
      refs[name] = value;
    };
  }

  return { refs, setRefs };
}

export const useParent = (name: string, ref: Ref) => {
  const internalInstance = getCurrentInstance();

  if (internalInstance) {
    let parent = internalInstance.proxy?.$.parent;

    if (parent) {
      while (
        parent &&
        parent.type.name !== name &&
        parent.type.name !== 'cl-curd'
      ) {
        parent = parent.parent;
      }

      if (parent) {
        if (parent.type.name === name) {
          ref.value = parent.proxy;
        }
      }
    }
  }

  return ref;
};

export const useNem = () => ({
  service: useService(),
  route: useRoute(),
  router: useRouter(),
  mitt: inject('mitt') as Emitter<Record<EventType, unknown>>,
  ...useRefs(),
});

// export * from './browser';
