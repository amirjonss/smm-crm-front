<template>
  <div
    class="page-loader"
    :class="{
      'page-loader--fixed': fixed,
      'page-loader--dark': isDarkMode,
    }"
    role="status"
    aria-live="polite"
  >
    <div class="loader-backdrop" />
    <div class="loader-panel">
      <div class="loader-orbit">
        <span class="orbit orbit--one" />
        <span class="orbit orbit--two" />
        <span class="orbit-center" />
      </div>

      <div class="loader-copy">
        <h2 class="loader-title">{{ title }}</h2>
        <p class="loader-subtitle">{{ subtitle }}</p>
      </div>

      <div class="loader-lines">
        <span />
        <span />
        <span />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useQuasar } from 'quasar'

const props = defineProps({
  title: {
    type: String,
    default: 'Loading data',
  },
  subtitle: {
    type: String,
    default: 'Please wait a moment...',
  },
  fixed: {
    type: Boolean,
    default: true,
  },
  dark: {
    type: Boolean,
    default: false,
  },
})

const $q = useQuasar()
const isDarkMode = computed(() => props.dark || $q.dark.isActive)
</script>

<style scoped lang="scss">
.page-loader {
  position: absolute;
  inset: 0;
  z-index: 60;
  display: grid;
  place-items: center;
  padding: 1rem;
}

.page-loader--fixed {
  position: fixed;
  inset: 0;
  z-index: 3000;
}

.loader-backdrop {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 18% 18%, rgba(56, 189, 248, 0.2), transparent 42%),
    radial-gradient(circle at 82% 82%, rgba(37, 99, 235, 0.2), transparent 44%),
    rgba(248, 250, 252, 0.78);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.page-loader--dark .loader-backdrop {
  background:
    radial-gradient(circle at 20% 15%, rgba(56, 189, 248, 0.18), transparent 40%),
    radial-gradient(circle at 80% 85%, rgba(14, 165, 233, 0.14), transparent 45%),
    rgba(15, 23, 42, 0.68);
}

.loader-panel {
  position: relative;
  width: min(92vw, 360px);
  padding: 1.4rem 1.25rem 1.2rem;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.25);
  box-shadow:
    0 26px 60px rgba(15, 23, 42, 0.17),
    inset 0 1px 0 rgba(255, 255, 255, 0.55);
}

.page-loader--dark .loader-panel {
  background: rgba(15, 23, 42, 0.72);
  border-color: rgba(148, 163, 184, 0.22);
}

.loader-orbit {
  width: 74px;
  height: 74px;
  margin: 0 auto 1rem;
  position: relative;
}

.orbit {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid transparent;
}

.orbit--one {
  border-top-color: #0ea5e9;
  border-right-color: rgba(14, 165, 233, 0.35);
  animation: spin 1.1s linear infinite;
}

.orbit--two {
  inset: 8px;
  border-bottom-color: #2563eb;
  border-left-color: rgba(37, 99, 235, 0.32);
  animation: spinReverse 1.6s linear infinite;
}

.orbit-center {
  position: absolute;
  inset: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #38bdf8, #2563eb);
  box-shadow: 0 0 22px rgba(14, 165, 233, 0.4);
}

.loader-copy {
  text-align: center;
}

.loader-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.loader-subtitle {
  margin: 0.35rem 0 1rem;
  font-size: 0.82rem;
  color: #475569;
}

.page-loader--dark .loader-title {
  color: #f8fafc;
}

.page-loader--dark .loader-subtitle {
  color: #cbd5e1;
}

.loader-lines {
  display: grid;
  gap: 0.45rem;
}

.loader-lines span {
  height: 8px;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    rgba(148, 163, 184, 0.18) 0%,
    rgba(255, 255, 255, 0.7) 50%,
    rgba(148, 163, 184, 0.18) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.25s ease-in-out infinite;
}

.loader-lines span:nth-child(2) {
  width: 88%;
}

.loader-lines span:nth-child(3) {
  width: 72%;
}

.page-loader--dark .loader-lines span {
  background: linear-gradient(
    90deg,
    rgba(71, 85, 105, 0.34) 0%,
    rgba(148, 163, 184, 0.62) 50%,
    rgba(71, 85, 105, 0.34) 100%
  );
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes spinReverse {
  to {
    transform: rotate(-360deg);
  }
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
