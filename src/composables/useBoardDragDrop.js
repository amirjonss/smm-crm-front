import { ref, watch } from 'vue'
import { useBoardStore } from 'stores/board.js'
import { reindexPositions } from '@/utils/positionHelpers'

export function useBoardDragDrop() {
  const boardStore = useBoardStore()

  // Local ref for columns — vuedraggable mutates this directly during drag (no lag).
  // Store changes sync in via the watcher; we only persist back on drop.
  const sortedLists = ref([])

  watch(
    () => {
      if (!boardStore.currentBoard) return []
      return [...boardStore.currentBoard.lists]
        .filter((l) => !l.isArchived)
        .sort((a, b) => a.position - b.position)
    },
    (val) => {
      sortedLists.value = val
    },
    { immediate: true },
  )

  function persistListOrder() {
    const reindexed = reindexPositions(sortedLists.value)
    boardStore.setCurrentBoardLists(reindexed)
    // TODO: Replace with batch PATCH calls for list positions
    reindexed.forEach((list) => {
      boardStore.patchList(list.id, { position: list.position })
    })
  }

  function handleCardChange(event, listId) {
    if (event.added) {
      const card = event.added.element
      card.list = { id: listId }
      // TODO: Replace with api.patch('/cards/' + card.id, { list: '/api/board_lists/' + listId })
      boardStore.patchCard(card.id, { list: { id: listId } })
    }
  }

  return {
    sortedLists,
    persistListOrder,
    handleCardChange,
  }
}
