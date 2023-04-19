<template>
  <van-overlay :show="show">
    <van-loading type="spinner" />
  </van-overlay>
  <div class="page-inframe">
    <iframe :src="url" frameborder="0" :ref="setRefs('iframe')"></iframe>
  </div>
</template>

<script lang="ts" name="frame" setup>
import { ref, watch, onMounted } from 'vue';
import { useNem } from '/@/nem';

const show = ref(false);
const url = ref();

const { route, refs, setRefs } = useNem();

watch(
  () => route,
  (val) => {
    url.value = val.meta?.iframeUrl;
  },
  { immediate: true },
);

onMounted(() => {
  show.value = true;

  (refs.iframe as HTMLIFrameElement).onload = () => {
    show.value = false;
  };
});
</script>

<style lang="scss" scoped>
.page-frame {
  height: 100%;

  iframe {
    height: 100%;
    width: 100%;
  }
}
</style>
