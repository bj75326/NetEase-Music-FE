<template>
  <div id="app">
    <van-config-provider>
      <router-view />
    </van-config-provider>
  </div>
</template>

<script lang="ts" setup>
console.log('test');
</script>

<style lang="scss">
#app {
  height: 100vh;
  width: 100vw;
}
</style>
