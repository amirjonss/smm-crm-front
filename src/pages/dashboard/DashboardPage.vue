<template>
  <q-page class="dashboard-page">
    <div class="page-container">
      <div class="welcome-section">
        <h1 class="welcome-title">Добро пожаловать в панель управления</h1>
        <p class="welcome-subtitle">Выберите раздел для начала работы</p>
      </div>
    </div>
  </q-page>
</template>

<script setup>
</script>

<style scoped lang="scss">
.dashboard-page {
  padding: 0;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;

  @media (max-width: 599px) {
    padding: 1rem;
  }
}

.welcome-section {
  text-align: center;
  padding: 4rem 1rem;
}

.welcome-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem;

  @media (max-width: 599px) {
    font-size: 1.5rem;
  }
}

.welcome-subtitle {
  font-size: 1rem;
  color: var(--text-muted);
  margin: 0;
}
</style>
