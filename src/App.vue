<template>
  <van-config-provider class="container" :theme="app.info.theme">
    <router-view />
  </van-config-provider>
</template>

<script lang="ts" setup>
import { useBase } from '/$/base';
import { storage, NemConfig } from '/@/nem';
import { Locale } from 'vant';
import enUS from 'vant/es/locale/lang/en-US';
import zhCN from 'vant/es/locale/lang/zh-CN';

const { app } = useBase();

// theme
const init: NemConfig['app'] | undefined = storage.get('__app__') as
  | NemConfig['app']
  | undefined;

if (init) {
  app.set({
    theme: init.theme || app.info.theme,
    locale: init.locale || app.info.locale,
  });
}

// locale
if (app.info.locale === 'zh-CN') {
  Locale.use('zh-CN', zhCN);
} else if (app.info.locale === 'en-US') {
  Locale.use('en-US', enUS);
}
</script>

<style lang="scss">
.container {
  width: 100%;
  height: 100%;
}
</style>
