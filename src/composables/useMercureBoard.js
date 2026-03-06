import { onMounted, onUnmounted } from 'vue'

export function useMercureBoard(boardId, onEvent) {
  let es = null

  function connect() {
    const mercureUrl = import.meta.env.VITE_MERCURE_URL
    if (!mercureUrl) return

    const url = new URL(mercureUrl)
    url.searchParams.append('topic', `board/${boardId}`)

    es = new EventSource(url.toString())
    es.onmessage = (e) => {
      try {
        onEvent(JSON.parse(e.data))
      } catch {
        // ignore malformed messages
      }
    }
    es.onerror = () => {
      es.close()
      es = null
      setTimeout(connect, 3000)
    }
  }

  onMounted(connect)

  onUnmounted(() => {
    es?.close()
    es = null
  })
}
