<template>
  <q-badge
    :color="getColorForStatus(status)"
    :label="getStatusLabel(status)"
    :class="{ 'cursor-pointer': editable }"
  >
    <q-menu v-if="editable" auto-close>
      <q-list style="min-width: 150px">
        <q-item
          v-for="opt in statusOptions"
          :key="opt.value"
          clickable
          @click="$emit('update', opt.value)"
        >
          <q-item-section side>
            <q-badge :color="getColorForStatus(opt.value)" rounded />
          </q-item-section>
          <q-item-section>{{ opt.label }}</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-badge>
</template>

<script setup>
import { useStatusFormatting } from '@/composables/useStatusFormatting'

defineProps({
  status: { type: String, required: true },
  editable: { type: Boolean, default: false },
})

defineEmits(['update'])

const { statusOptions, getStatusLabel, getColorForStatus } = useStatusFormatting()
</script>
