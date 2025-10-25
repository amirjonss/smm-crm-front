<template>
  <div class="login-form row justify-center items-center content-center q-pa-md">
    <div class="login-form__item area col-xs-12 col-sm-6 col-md-4 col-lg-3 q-pa-md">
      <q-form
        @submit="auth"
        class="q-gutter-md"
      >
        <div class="login-form__title">
          Авторизация
        </div>
        <q-input
          outlined
          v-model="form.email"
          label="email"
          lazy-rules
          type="email"
          :rules="[ val => val && val.length > 0 || 'Заполните Форму']"
        />

        <q-input
          outlined
          type="password"
          v-model="form.password"
          label="password"
          lazy-rules
          :rules="[
          val => val.length > 0 || 'Заполните Форму'
        ]"
        />

        <div class="flex justify-end">
          <q-btn label="Войти" type="submit" color="primary"/>
        </div>
      </q-form>
    </div>
  </div>


</template>

<script>
import { reactive } from 'vue'
import {useAuthStore} from 'stores/auth.js'
import {useRouter} from "vue-router";

export default {
  setup () {
    const form = reactive({
      email: '',
      password: ''
    })

    const user = useAuthStore()
    const router = useRouter()

    return {
      form,
      auth() {
        user.fetchToken(form).then(() => {
          router.push('/')
        }).catch((e) => {
          console.log(e)
        })
      }
    }
  }
}
</script>

<style scoped>
.login-form__title {
  text-align: center;
  font-size: 30px;
}
.page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
}

.login-form {
  min-height: 100vh;
}
.area {
  background-color: #f2f2f2;
  border-radius: 10px;
  margin: 10px 0 10px 0;
}
</style>
