import { ref, watch } from 'vue'
import { useBoardStore } from 'stores/board.js'
import { reindexPositions } from '@/utils/positionHelpers'

function positionOrMax(value) {
  return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER
}

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
        .sort((a, b) => positionOrMax(a.position) - positionOrMax(b.position))
    },
    (val) => {
      sortedLists.value = val
    },
    { immediate: true },
  )

  function persistListOrder(event) {
    const reindexed = reindexPositions(sortedLists.value)
    boardStore.setCurrentBoardLists(reindexed)

    if (!event?.moved) return

    const movedList = reindexed[event.moved.newIndex]
    if (!movedList) return

    const prevList = event.moved.newIndex > 0 ? reindexed[event.moved.newIndex - 1] : null
    const nextList = event.moved.newIndex < reindexed.length - 1 ? reindexed[event.moved.newIndex + 1] : null

    boardStore.moveListPosition(movedList.id, {
      targetBoardId: boardStore.currentBoard?.id ?? null,
      prevListId: prevList?.id ?? null,
      nextListId: nextList?.id ?? null,
    })
  }

  function persistCardMove(card, newIndex, listId, targetListId) {
    const list = sortedLists.value.find((l) => l.id === listId)
    const cards = list?.cards || []
    const prevCard = newIndex > 0 ? cards[newIndex - 1] : null
    const nextCard = newIndex < cards.length - 1 ? cards[newIndex + 1] : null

    boardStore.moveCardPosition(card.id, {
      targetListId: targetListId || null,
      prevCardId: prevCard?.id !== card.id ? prevCard?.id : null,
      nextCardId: nextCard?.id !== card.id ? nextCard?.id : null,
    })
  }

  function handleCardChange(event, listId) {
    if (event.added) {
      const card = event.added.element
      card.list = { id: listId }
      persistCardMove(card, event.added.newIndex, listId, listId)
    }
    if (event.moved) {
      const card = event.moved.element
      persistCardMove(card, event.moved.newIndex, listId, null)
    }
  }

  return {
    sortedLists,
    persistListOrder,
    handleCardChange,
  }
}
