<template>
  <div class="page-login">
    <div class="box">
      <div class="logo">
        <img src="/vite.svg" alt="Logo" />
        <span>{{ app.info.name }}</span>
      </div>
      <p class="desc">Vue3 移动端练习</p>

      <van-form>
        <van-cell-group inset>
          <van-field
            v-model="form.username"
            :placeholder="t('login.namePlaceholder')"
            maxlength="20"
            autocomplete="on"
          />
          <van-field
            v-model="form.password"
            type="password"
            :placeholder="t('login.passwordPlaceholder')"
            maxlength="20"
            autocomplete="off"
          />
          <van-field
            v-model="form.verifyCode"
            :placeholder="t('login.verifyCodePlaceholder')"
            maxlength="4"
            @keyup.enter="toLogin"
          >
            <template #button>
              <div>test</div>
            </template>
          </van-field>
        </van-cell-group>
        <div style="">
          <van-button round block type="primary" native-type="submit">
            {{ t('login.submit') }}
          </van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script lang="ts" name="login" setup>
import { ref, reactive } from 'vue';
import { useNem } from '/@/nem';
import { useBase } from '/$/base';
import { useI18n } from 'vue-i18n';
import { showFailToast } from 'vant';

const { refs, setRefs, router, service } = useNem();
const { user, app } = useBase();

// 状态1
const saving = ref(false);

// 表单数据
const form = reactive({
  username: '',
  password: '',
  captchaId: '',
  verifyCode: '',
});

// i18n
const { t } = useI18n();

// 登录
const toLogin = async () => {
  if (!form.username) {
    return showFailToast(t('login.missingUsername'));
  }

  if (!form.password) {
    return showFailToast(t('login.missingPassword'));
  }

  if (!form.verifyCode) {
    return showFailToast(t('login.missingVerifyCode'));
  }

  saving.value = true;

  try {
    // 登录
    console.log('form', form);
    await service.base.open.login(form).then();
  } catch (err) {
    console.log(err);
  }
};
</script>

<style lang="scss" scoped>
.page-login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  position: relative;
  background-color: var(--van-background);

  .box {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .logo {
      height: 50px;
      margin-bottom: 30px;
      display: flex;
      align-items: center;
      color: var(--van-text-color);

      img {
        height: 50px;
      }

      span {
        font-size: 28px;
        margin-left: 10px;
        letter-spacing: 5px;
        font-weight: bold;
      }
    }

    .desc {
      color: var(--van-text-color);
      font-size: 14px;
      letter-spacing: 1px;
      margin-bottom: 50px;
    }

    .van-form {
      width: 300px;
    }
  }
}

.desc {
  color: var(--van-text-color);
}
</style>
