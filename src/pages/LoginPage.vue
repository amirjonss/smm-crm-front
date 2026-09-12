<template>
  <div class="login-page">
    <!-- Theme toggle in corner -->
    <div class="theme-toggle-corner">
      <theme-toggle />
    </div>

    <div class="login-container">
      <!-- Logo/Brand area -->
      <div class="login-brand">
        <div class="brand-icon">
          <q-icon name="dashboard" size="2.5rem" color="white" />
        </div>
        <h1 class="brand-title">CRM</h1>
        <p class="brand-subtitle">Система управления контентом</p>
      </div>

      <!-- Login form card -->
      <div class="login-card">
        <h2 class="login-title">Добро пожаловать</h2>
        <p class="login-subtitle">Войдите в свой аккаунт</p>

        <q-form @submit="auth" class="login-form">
          <div class="form-group">
            <label class="form-label">Email</label>
            <q-input
              v-model="form.email"
              type="email"
              outlined
              placeholder="example@email.com"
              lazy-rules
              :rules="[(val) => (val && val.length > 0) || 'Введите email']"
              class="modern-input"
            >
              <template v-slot:prepend>
                <q-icon name="mail" color="grey-6" />
              </template>
            </q-input>
          </div>

          <div class="form-group">
            <label class="form-label">Пароль</label>
            <q-input
              v-model="form.password"
              :type="isPwd ? 'password' : 'text'"
              outlined
              placeholder="••••••••"
              lazy-rules
              :rules="[(val) => val.length > 0 || 'Введите пароль']"
              class="modern-input"
            >
              <template v-slot:prepend>
                <q-icon name="lock" color="grey-6" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  color="grey-6"
                  @click="isPwd = !isPwd"
                />
              </template>
            </q-input>
          </div>

          <q-btn
            type="submit"
            label="Войти"
            class="login-btn"
            unelevated
            no-caps
            :loading="isLoading"
          >
            <template v-slot:loading>
              <q-spinner-dots />
            </template>
          </q-btn>
        </q-form>

        <div class="quick-login">
          <div class="quick-login-divider">
            <span>Быстрый вход</span>
          </div>
          <div class="quick-login-buttons">
            <q-btn
              label="Войти как Админ"
              class="quick-login-btn quick-login-btn--admin"
              outline
              no-caps
              :loading="isLoading"
              @click="quickLogin('admin@example.com', 'passwd')"
            />
            <q-btn
              label="Войти как SMM"
              class="quick-login-btn quick-login-btn--smm"
              outline
              no-caps
              :loading="isLoading"
              @click="quickLogin('smm@example.com', 'passwd')"
            />
          </div>
        </div>
      </div>

      <!-- Footer -->
      <p class="login-footer">© {{ new Date().getFullYear() }} KH Agency. Все права защищены.</p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useAuthStore } from 'stores/auth.js'
import { useRouter } from 'vue-router'
import { useUserStore } from 'stores/user.js'
import { useQuasar } from 'quasar'
import ThemeToggle from 'components/ThemeToggle.vue'

const form = reactive({
  email: '',
  password: '',
})
const userStore = useUserStore()
const user = useAuthStore()
const router = useRouter()
const q = useQuasar()
const isPwd = ref(true)
const isLoading = ref(false)

function auth() {
  isLoading.value = true
  user
    .fetchToken(form)
    .then(() => {
      userStore.fetchUser().then(() => {
        isLoading.value = false
        if (userStore.isAdmin) {
          router.push('/dashboard')
        } else {
          router.push('/')
        }
      })
    })
    .catch((e) => {
      isLoading.value = false
      console.log(e)
      q.notify({
        message: 'Неверный email или пароль',
        type: 'negative',
        position: 'top',
        timeout: 3000,
      })
    })
}

function quickLogin(email, password) {
  form.email = email
  form.password = password
  auth()
}
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  padding: 1rem;
  position: relative;
}

.theme-toggle-corner {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

.login-container {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-brand {
  text-align: center;
  margin-bottom: 2rem;
}

.brand-icon {
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
}

.brand-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.25rem;
  letter-spacing: -0.02em;
}

.brand-subtitle {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0;
}

.login-card {
  width: 100%;
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: 2.5rem;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
}

.login-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem;
  text-align: center;
}

.login-subtitle {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0 0 2rem;
  text-align: center;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.modern-input :deep(.q-field__control) {
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  height: 52px;
}

.modern-input :deep(.q-field__control:before) {
  border-color: transparent;
}

.modern-input :deep(.q-field__control:hover:before) {
  border-color: var(--border-color);
}

.modern-input :deep(.q-field--focused .q-field__control:before) {
  border-color: #3b82f6;
}

.login-btn {
  width: 100%;
  height: 52px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  border-radius: var(--radius-md);
  margin-top: 0.5rem;
  transition: all 0.2s ease;
}

.login-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
}

.quick-login {
  margin-top: 1.5rem;
}

.quick-login-divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.75rem;
  margin-bottom: 1rem;

  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid var(--border-color);
  }

  span {
    padding: 0 0.75rem;
  }
}

.quick-login-buttons {
  display: flex;
  gap: 0.75rem;
}

.quick-login-btn {
  flex: 1;
  height: 44px;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 600;
}

.quick-login-btn--admin {
  color: #dc2626;
  border-color: #dc2626;
}

.quick-login-btn--smm {
  color: #3b82f6;
  border-color: #3b82f6;
}

.login-footer {
  margin-top: 2rem;
  font-size: 0.75rem;
  color: var(--text-muted);
  text-align: center;
}

@media (max-width: 480px) {
  .login-card {
    padding: 1.75rem;
    border-radius: var(--radius-lg);
  }

  .brand-icon {
    width: 60px;
    height: 60px;
    border-radius: 16px;
  }

  .brand-title {
    font-size: 1.75rem;
  }
}
</style>
