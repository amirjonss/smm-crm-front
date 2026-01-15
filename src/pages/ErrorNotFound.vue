<template>
  <div class="error-page">
    <div class="error-container">
      <div class="error-code">404</div>
      <h1 class="error-title">Страница не найдена</h1>
      <p class="error-message">
        К сожалению, запрашиваемая страница не существует или была перемещена.
      </p>
      <q-btn
        unelevated
        no-caps
        label="Вернуться на главную"
        icon="home"
        class="error-btn"
        @click="$router.push('/')"
      />
    </div>
  </div>
</template>

<script setup></script>

<style scoped lang="scss">
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  padding: 1.5rem;
}

.error-container {
  text-align: center;
  max-width: 400px;
}

.error-code {
  font-size: 8rem;
  font-weight: 800;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  margin-bottom: 1rem;

  @media (max-width: 599px) {
    font-size: 6rem;
  }
}

.error-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.75rem;

  @media (max-width: 599px) {
    font-size: 1.25rem;
  }
}

.error-message {
  font-size: 0.9375rem;
  color: var(--text-muted);
  margin: 0 0 2rem;
  line-height: 1.6;
}

.error-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  font-weight: 500;
  padding: 0.75rem 1.75rem;
}
</style>
