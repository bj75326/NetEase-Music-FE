<template>
  <div class="captcha" @click="refresh">
    <div v-if="svg" class="svg" v-html="svg" />
    <img v-else class="base64" :src="base64" alt="" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useNem } from '/@/nem';

const emit = defineEmits(['update:modelValue', 'change']);

const { service } = useNem();

// base64
const base64 = ref('');

// svg
const svg = ref('');

const refresh = () => {
  service.base.open
    .captcha({
      height: 40,
      width: 150,
    })
    .then(({ captchaId, data }) => {
      if (data.includes(';base64,')) {
        base64.value = data;
      } else {
        svg.value = data;
      }
    })
    .catch(() => { })
};
</script>

<style lang="scss" scoped>
</style>