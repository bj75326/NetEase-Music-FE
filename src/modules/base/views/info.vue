<template>
  <div class="view-my">
    <div class="title">基本信息</div>
  </div>
</template>

<script lang="ts" name="my-info" setup>
import { useNem } from '/@/nem';
import { useBase } from '/$/base';
import { reactive } from 'vue';

const { service } = useNem();
const { user } = useBase();

// 表单数据
// const form = reactive();
</script>

<style lang="scss">
.view-my {
  height: 100%;
  padding: 20px;
}
</style>
