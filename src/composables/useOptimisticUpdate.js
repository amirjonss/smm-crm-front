import { useQuasar } from 'quasar'

export function useOptimisticUpdate() {
  const q = useQuasar()

  async function optimistic({ apply, rollback, action }) {
    apply()
    try {
      await action()
    } catch (e) {
      rollback()
      console.error('Optimistic update failed:', e)
      q.notify({
        message: 'Ошибка при сохранении',
        type: 'negative',
        position: 'top',
      })
    }
  }

  return { optimistic }
}
