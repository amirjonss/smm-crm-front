<template>
  <q-page class="profile-page">
    <page-loader
      v-if="isInitialLoading"
      title="Загружаем профиль"
      subtitle="Подтягиваем данные аккаунта и аватар"
      :fixed="false"
    />

    <div class="profile-shell">
      <section class="hero">
        <div>
          <div class="hero-kicker">Account</div>
          <h1>Профиль</h1>
          <p>Управляйте персональными данными и безопасностью аккаунта</p>
        </div>
        <div class="hero-user-chip">
          <q-avatar size="42px" class="hero-user-avatar">
            <img v-if="avatarPreviewUrl" :src="avatarPreviewUrl" alt="avatar" />
            <span v-else>{{ userInitial }}</span>
          </q-avatar>
          <div class="hero-user-meta">
            <strong>{{ displayName }}</strong>
            <span>{{ userStore.getUser?.email || 'user@example.com' }}</span>
            <span v-if="currentRoleLabel" class="hero-role-chip">{{ currentRoleLabel }}</span>
          </div>
        </div>
      </section>

      <div class="content-grid">
        <q-card flat class="panel panel-profile">
          <q-card-section class="panel-head">
            <div class="panel-title-wrap">
              <q-icon name="manage_accounts" size="20px" />
              <div>
                <h2>Данные профиля</h2>
                <p>Имя, фамилия, Telegram и фото профиля</p>
              </div>
            </div>
          </q-card-section>

          <q-separator class="panel-separator" />

          <q-card-section class="panel-body">
            <div class="avatar-block">
              <q-avatar size="96px" class="avatar-preview">
                <img v-if="avatarPreviewUrl" :src="avatarPreviewUrl" alt="avatar" />
                <span v-else>{{ userInitial }}</span>
              </q-avatar>

              <div class="avatar-actions">
                <input
                  ref="avatarInputRef"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                  class="hidden-avatar-input"
                  @change="onAvatarFileChange"
                />
                <q-btn
                  unelevated
                  no-caps
                  class="btn-secondary"
                  icon="upload"
                  label="Загрузить аватар"
                  @click="avatarInputRef?.click()"
                />
                <span class="avatar-hint">Поддерживаются PNG, JPG, GIF, WEBP</span>
              </div>
            </div>

            <div class="inputs-grid">
              <q-input
                v-model="profileForm.givenName"
                outlined
                dense
                label="Имя"
                :rules="[(v) => !!v || 'Имя обязательно']"
                class="input-modern"
              />
              <q-input
                v-model="profileForm.familyName"
                outlined
                dense
                label="Фамилия"
                class="input-modern"
              />
              <q-input
                v-model="profileForm.telegramUsername"
                outlined
                dense
                label="Telegram username"
                hint="Без @, например: johndoe"
                class="input-modern input-span"
              />
            </div>

            <div class="actions-row">
              <q-btn
                color="primary"
                no-caps
                class="btn-primary"
                label="Сохранить изменения"
                :loading="savingProfile"
                @click="saveProfile"
              />
            </div>
          </q-card-section>
        </q-card>

        <q-card flat class="panel panel-security">
          <q-card-section class="panel-head">
            <div class="panel-title-wrap">
              <q-icon name="shield" size="20px" />
              <div>
                <h2>Безопасность</h2>
                <p>Изменение пароля с проверкой текущего</p>
              </div>
            </div>
          </q-card-section>

          <q-separator class="panel-separator" />

          <q-card-section class="panel-body">
            <div class="inputs-grid inputs-single">
              <q-input
                v-model="passwordForm.currentPassword"
                outlined
                dense
                type="password"
                label="Текущий пароль"
                class="input-modern"
              />
              <q-input
                v-model="passwordForm.newPassword"
                outlined
                dense
                type="password"
                label="Новый пароль"
                hint="Минимум 6 символов"
                class="input-modern"
              />
              <q-input
                v-model="passwordForm.confirmPassword"
                outlined
                dense
                type="password"
                label="Подтверждение нового пароля"
                class="input-modern"
              />
            </div>

            <div class="actions-row">
              <q-btn
                color="primary"
                no-caps
                class="btn-primary"
                label="Обновить пароль"
                :loading="savingPassword"
                @click="changePassword"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useUserStore } from 'stores/user.js'
import PageLoader from 'components/shared/PageLoader.vue'

const q = useQuasar()
const userStore = useUserStore()

const isInitialLoading = ref(true)
const savingProfile = ref(false)
const savingPassword = ref(false)
const avatarInputRef = ref(null)
const avatarFile = ref(null)
const avatarPreviewUrl = ref('')

const profileForm = ref({
  givenName: '',
  familyName: '',
  telegramUsername: '',
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const userInitial = computed(() => {
  const user = userStore.getUser
  return (user?.givenName?.[0] || user?.familyName?.[0] || '?').toUpperCase()
})

const displayName = computed(() => {
  const given = userStore.getUser?.givenName || ''
  const family = userStore.getUser?.familyName || ''
  return `${given} ${family}`.trim() || 'Пользователь'
})

const currentRoleLabel = computed(() => {
  const role = userStore.getUser?.roles?.[0]
  if (!role) return ''
  const map = {
    ROLE_ADMIN: 'Админ',
    ROLE_SMM: 'SMM',
  }
  if (map[role]) return map[role]
  return role.replace(/^ROLE_/, '')
})

function toAbsoluteUrl(path) {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path

  const baseUrl = import.meta.env.VITE_BASE_URL || ''
  const origin = baseUrl.startsWith('http') ? new URL(baseUrl).origin : window.location.origin
  return origin + path
}

async function resolveAvatarPreview(avatar) {
  if (!avatar) {
    avatarPreviewUrl.value = ''
    return
  }

  if (typeof avatar === 'object' && avatar.contentUrl) {
    avatarPreviewUrl.value = toAbsoluteUrl(avatar.contentUrl)
    return
  }

  const iri = typeof avatar === 'string' ? avatar : avatar['@id']
  if (!iri) {
    avatarPreviewUrl.value = ''
    return
  }

  try {
    const media = await userStore.fetchMediaObject(iri)
    avatarPreviewUrl.value = media?.contentUrl ? toAbsoluteUrl(media.contentUrl) : ''
  } catch {
    avatarPreviewUrl.value = ''
  }
}

function fillFormFromUser() {
  const user = userStore.getUser
  profileForm.value = {
    givenName: user?.givenName || '',
    familyName: user?.familyName || '',
    telegramUsername: user?.telegramUsername || '',
  }
  resolveAvatarPreview(user?.avatar)
}

function onAvatarFileChange(event) {
  const file = event.target.files?.[0]
  if (!file) return

  avatarFile.value = file
  avatarPreviewUrl.value = URL.createObjectURL(file)
}

async function saveProfile() {
  const userId = userStore.getUser?.id
  if (!userId) return

  if (!profileForm.value.givenName?.trim()) {
    q.notify({ message: 'Имя обязательно', type: 'warning', position: 'top' })
    return
  }

  savingProfile.value = true
  try {
    const payload = {
      givenName: profileForm.value.givenName.trim(),
      familyName: profileForm.value.familyName?.trim() || null,
      telegramUsername: profileForm.value.telegramUsername?.trim() || null,
    }

    if (avatarFile.value) {
      const media = await userStore.uploadAvatar(avatarFile.value)
      const mediaIri = media?.['@id'] || (media?.id ? '/api/media_objects/' + media.id : null)
      if (mediaIri) {
        payload.avatar = mediaIri
      }
    }

    await userStore.patchUser(payload, userId)
    await userStore.fetchUser({})
    fillFormFromUser()

    avatarFile.value = null
    if (avatarInputRef.value) {
      avatarInputRef.value.value = ''
    }

    q.notify({ message: 'Профиль обновлён', type: 'positive', position: 'top' })
  } catch {
    q.notify({ message: 'Не удалось обновить профиль', type: 'negative', position: 'top' })
  } finally {
    savingProfile.value = false
  }
}

async function changePassword() {
  const userId = userStore.getUser?.id
  if (!userId) return

  const { currentPassword, newPassword, confirmPassword } = passwordForm.value

  if (!currentPassword || !newPassword || !confirmPassword) {
    q.notify({ message: 'Заполните все поля пароля', type: 'warning', position: 'top' })
    return
  }

  if (newPassword.length < 6) {
    q.notify({ message: 'Новый пароль должен быть минимум 6 символов', type: 'warning', position: 'top' })
    return
  }

  if (newPassword !== confirmPassword) {
    q.notify({ message: 'Новый пароль и подтверждение не совпадают', type: 'warning', position: 'top' })
    return
  }

  savingPassword.value = true
  try {
    await userStore.verifyCurrentPassword(currentPassword)
    await userStore.changePassword(userId, newPassword)

    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }

    q.notify({ message: 'Пароль успешно изменён', type: 'positive', position: 'top' })
  } catch {
    q.notify({ message: 'Текущий пароль неверный или ошибка обновления', type: 'negative', position: 'top' })
  } finally {
    savingPassword.value = false
  }
}

onMounted(async () => {
  isInitialLoading.value = true
  try {
    if (!userStore.isLoaded) {
      await userStore.fetchUser({})
    }
    fillFormFromUser()
  } finally {
    isInitialLoading.value = false
  }
})
</script>

<style scoped lang="scss">
.profile-page {
  min-height: 100%;
  padding: 1.25rem;
  position: relative;
  background:
    radial-gradient(1200px 600px at 100% -10%, rgba(14, 165, 233, 0.14), transparent 55%),
    radial-gradient(900px 500px at 0% 0%, rgba(16, 185, 129, 0.1), transparent 48%),
    linear-gradient(180deg, #f4f8fb 0%, #eef3f9 100%);
}

.profile-shell {
  max-width: 1080px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.1rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.hero-kicker {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-secondary);
  margin-bottom: 0.35rem;
}

.hero h1 {
  margin: 0;
  font-size: clamp(1.3rem, 1.4vw + 1rem, 1.9rem);
  line-height: 1.15;
}

.hero p {
  margin: 0.35rem 0 0;
  color: var(--text-secondary);
  font-size: 0.92rem;
}

.hero-user-chip {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.5rem 0.65rem;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.1);
  background: #f8fbff;
}

.hero-user-avatar {
  background: #0ea5e9;
  color: #fff;
  font-weight: 700;
  overflow: hidden;
  border-radius: 50%;

  :deep(.q-avatar__content) {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    overflow: hidden;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.hero-user-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.hero-user-meta strong {
  font-size: 0.86rem;
  white-space: nowrap;
}

.hero-user-meta span {
  font-size: 0.73rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.hero-role-chip {
  margin-top: 0.28rem;
  display: inline-flex;
  width: fit-content;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.12);
  color: #1d4ed8 !important;
  font-size: 0.67rem !important;
  font-weight: 600;
}

.content-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 1rem;
}

.panel {
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.panel-head {
  padding: 1rem 1rem 0.9rem;
}

.panel-title-wrap {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
}

.panel-title-wrap h2 {
  margin: 0;
  font-size: 1.02rem;
}

.panel-title-wrap p {
  margin: 0.22rem 0 0;
  color: var(--text-secondary);
  font-size: 0.82rem;
}

.panel-separator {
  background: rgba(15, 23, 42, 0.08);
}

.panel-body {
  padding: 1rem;
}

.avatar-block {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  margin-bottom: 1rem;
}

.avatar-preview {
  background: linear-gradient(160deg, #0ea5e9, #0284c7);
  color: #fff;
  font-size: 1.35rem;
  font-weight: 700;
  border: 3px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  border-radius: 50%;

  :deep(.q-avatar__content) {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    overflow: hidden;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.hidden-avatar-input {
  display: none;
}

.btn-secondary {
  background: #eef4ff;
  color: #1e40af;
  border: 1px solid rgba(30, 64, 175, 0.16);
}

.avatar-hint {
  font-size: 0.73rem;
  color: var(--text-secondary);
}

.inputs-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.78rem;
}

.inputs-single {
  grid-template-columns: 1fr;
}

.input-span {
  grid-column: span 2;
}

.input-modern :deep(.q-field__control) {
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid rgba(15, 23, 42, 0.12);
}

.actions-row {
  margin-top: 0.95rem;
  display: flex;
}

.btn-primary {
  border-radius: 10px;
  padding: 0 1rem;
}

.btn-primary :deep(.q-btn__content) {
  font-weight: 600;
}

.body--dark .profile-page {
  background:
    radial-gradient(1200px 600px at 100% -10%, rgba(14, 165, 233, 0.12), transparent 55%),
    radial-gradient(900px 500px at 0% 0%, rgba(16, 185, 129, 0.08), transparent 48%),
    var(--bg-secondary);
}

.body--dark .hero,
.body--dark .panel {
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: none;
}

.body--dark .hero-user-chip {
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.06);
}

.body--dark .hero-role-chip {
  background: rgba(96, 165, 250, 0.2);
  color: #bfdbfe !important;
}

.body--dark .panel-separator {
  background: rgba(255, 255, 255, 0.12);
}

.body--dark .btn-secondary {
  background: rgba(255, 255, 255, 0.12);
  color: var(--text-primary);
  border: 1px solid transparent;
}

.body--dark .input-modern :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

@media (max-width: 980px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .profile-page {
    padding: 0.7rem;
  }

  .hero {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-user-chip {
    width: 100%;
  }

  .avatar-block {
    flex-direction: column;
    align-items: flex-start;
  }

  .inputs-grid {
    grid-template-columns: 1fr;
  }

  .input-span {
    grid-column: span 1;
  }
}
</style>
