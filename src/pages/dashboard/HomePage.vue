<template>
  <div class="personal row justify-center">
    <div class="personal__create-row q-pa-md col-sm-12 col-md-8 col-lg-6">
      <div class="personal__create-form q-pa-md area">
        <div class="title text-h6 q-mb-lg text-center">Создать персонал</div>
        <q-form class="row" @submit.prevent="createUser">
          <div class="q-pa-sm col-xs-12 col-sm-6">
            <q-input
              class="input"
              outlined
              v-model="userForm.givenName"
              label="Имя персонала"
              lazy-rules
              :rules="[(val) => val.length > 0 || 'Заполните Форму']"
            />
          </div>
          <div class="q-pa-sm col-xs-12 col-sm-6">
            <q-input
              class="input"
              outlined
              v-model="userForm.familyName"
              label="Фамилия персонала"
              lazy-rules
              :rules="[(val) => val.length > 0 || 'Заполните Форму']"
            />
          </div>
          <div class="q-pa-sm col-xs-12 col-sm-6">
            <q-input
              class="input"
              outlined
              v-model="userForm.email"
              label="Email"
              lazy-rules
              :rules="[(val) => val.length > 0 || 'Заполните Форму']"
            />
          </div>
          <div class="create-form__btn col-xs-12 col-sm-6 row justify-end">
            <q-btn
              :label="editingUserId ? 'Сохранить' : 'Создать пользователя'"
              class="input self-end submit-btn__project-create"
              type="submit"
              color="grey-8"
              :loading="isLoading"
            />
          </div>
        </q-form>
      </div>
    </div>
    <div class="personal__list q-pa-md col-xs-12 col-sm-12 col-md-8 col-lg-6">
      <div class="area q-pa-md">
        <div class="title text-h6 q-mb-lg text-center">Список Персоналов</div>
        <q-markup-table>
          <thead>
            <tr>
              <th class="text-left" v-for="(row, index) in columns" :key="index">
                {{ row.label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, index) in userStore.getUsers.filter(n => n.id !== userStore.user.id)"
              :key="index"
              :class="{
                'selected-row': row.id === editingUserId,
                'selected-user': row.id === selectedUserId
              }">
              <td class="text-left">{{ index + 1 }}</td>
              <td class="text-left">{{ row.givenName }}</td>
              <td class="text-left">{{row.familyName}}</td>
              <td class="text-left">{{row.email}}</td>
              <td class="text-left">
                <q-btn flat round color="primary" icon="info" @click="selectUser(row)" />
                <q-btn flat round color="success" icon="edit" @click="editUser(row)" />
                <q-btn
                  flat
                  round
                  color="red"
                  icon="delete"
                  @click="confirmUserDeletion(row)"
                />
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </div>
    </div>
  </div>
  <projects-and-content-list-component :parent-selected-user-id="selectedUserId"/>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useUserStore } from 'stores/user.js'
import ProjectsAndContentListComponent from 'components/dashboard/ProjectsAndContentListComponent.vue'
import { useQuasar } from 'quasar'

const userStore = useUserStore()
const userForm = ref({
  givenName: '',
  familyName: '',
  email: '',
})
const isLoading = ref(false)
const selectedUserId = ref(null)
const columns = [{ label: '№' }, { label: 'Имя' }, { label: 'Фамилия' }, { label: 'email' }, { label: 'Действие' }]
const editingUserId = ref(null)
const q = useQuasar()

function createUser() {
  isLoading.value = true
  if (editingUserId.value) {
    saveEditedUser()
  } else {
    userStore.createUser(userForm.value).then(() => {
      isLoading.value = false
      userStore.fetchUsers()
      clearForm()
      q.notify({
        message: 'Пользователь успешно создан',
        type: 'positive'
      })
    }).catch((e) => {
      isLoading.value = false
      console.log(e)
      q.notify({
        message: 'Такой email уже существует',
        type: 'negative',
        timeout: 80
      })
    })
  }
}
function editUser(row) {
  if (row.id === editingUserId.value) {
    clearForm()
  } else {
    editingUserId.value = row.id
    userForm.value.email = row.email
    userForm.value.givenName = row.givenName
    userForm.value.familyName = row.familyName
  }
}
function selectUser(user) {
  if(selectedUserId.value === user.id) {
    selectedUserId.value = null
  } else {
    selectedUserId.value = user.id
  }
}
function saveEditedUser() {
  userStore.patchUser(userForm.value, editingUserId.value).then(() => {
    userStore.fetchUsers().then(() => {
      isLoading.value = false
      q.notify({
        message: 'Пользователь успешно изменен',
        type: 'positive'
      })
    })
  })
  clearForm()
}
function clearForm() {
  editingUserId.value = null
  userForm.value = {email: '', familyName: '', givenName: ''}
}

function deleteUser(id) {
  userStore.deleteUser(id).then(() => {
    userStore.fetchUsers()
  })
}
function confirmUserDeletion(user) {
  q.dialog({
    title: 'Внимание',
    message: 'Вы действительно хотите удалить проект ' + '<strong>' + user.givenName + '</strong>',
    cancel: true,
    color: 'red',
    html: true
  }).onOk(() => {
    deleteUser(user.id)
  })
}
onMounted(() => {
  userStore.fetchUsers()
})
</script>

<style scoped>
.area {
  background-color: #f2f2f2;
  border-radius: 10px;
  margin: 10px 0 10px 0;
}
.create-form__btn {
  padding: 0 10px 30px;
}
.selected-row {
  background-color: #d0f0d0 !important;
}
.selected-user {
  box-shadow: 0px 5px 10px 2px rgba(34, 60, 80, 0.2);
}
</style>
