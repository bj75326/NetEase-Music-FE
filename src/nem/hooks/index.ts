import {} from 'mitt';
import { reactive } from 'vue';
import { } from 'vue-router';
import { } from '../service';
import { } from '../utils';

// export function useService() {
//
// }

export function useRefs() {
  const refs = reactive<{ [key: string]: any }>({});
  function setRefs(name: string) {
    return (value: any) => {
      refs[name] = value;
    };
  }

  return { refs, setRefs };
}

export * from './browser';
