<template>
  <div class="container">
    <van-config-provider>
      <transition name="router-fade" mode="out-in">
        <keep-alive>
          <router-view></router-view>
        </keep-alive>
      </transition>
    </van-config-provider>
  </div>
</template>

<script lang="ts" setup>
console.log('test');
</script>

<style lang="less">
.container {
  height: 100vh;
  width: 100vw;
}
</style>
