<template>
  <div class="page-login">
    <div class="box">
      <div class="logo">logo</div>
    </div>
  </div>
</template>

<script lang="ts" name="login" setup>
import { ref } from 'vue';
import { useNem } from '/@/nem';
import { useBase } from '/$/base';

const { refs, setRefs, router, service } = useNem();
const { user, app } = useBase();

const saving = ref(false);
</script>

<style lang="scss" scoped></style>
