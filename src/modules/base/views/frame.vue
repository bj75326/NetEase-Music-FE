<template>
  <van-overlay :show="show">
    <van-loading type="spinner" />
  </van-overlay>
  <iframe :src="url" frameborder="0" :ref=""></iframe>
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



});
</script>
