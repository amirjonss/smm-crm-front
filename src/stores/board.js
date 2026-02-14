import { acceptHMRUpdate, defineStore } from 'pinia'
import { api } from 'boot/axios.js'
import { reindexPositions } from '@/utils/positionHelpers'

function extractId(iriOrObj) {
  if (!iriOrObj) return null
  if (typeof iriOrObj === 'number') return iriOrObj
  if (typeof iriOrObj === 'object' && iriOrObj.id != null) return iriOrObj.id
  if (typeof iriOrObj === 'string') return Number(iriOrObj.split('/').pop())
  return null
}

function normalizeCard(card) {
  return {
    ...card,
    id: extractId(card['@id']) ?? card.id,
    list: { id: extractId(card.list) },
    executor: Array.isArray(card.executor)
      ? card.executor.map((e) => (typeof e === 'object' ? e : { id: extractId(e) }))
      : [],
  }
}

function normalizeList(list) {
  return {
    ...list,
    id: list.id ?? extractId(list['@id']),
    board: { id: extractId(list.board) },
    cards: Array.isArray(list.cards) ? list.cards.map(normalizeCard) : [],
  }
}

function normalizeBoard(board) {
  return {
    ...board,
    id: board.id ?? extractId(board['@id']),
    lists: Array.isArray(board.lists) ? board.lists.map(normalizeList) : [],
  }
}

export const useBoardStore = defineStore('board', {
  state: () => ({
    boards: [],
    currentBoard: null,
    cardLogs: [],
    loading: false,
  }),

  getters: {
    getBoards: (state) => state.boards,
    getCurrentBoard: (state) => state.currentBoard,
    getActiveLists: (state) => {
      if (!state.currentBoard) return []
      return state.currentBoard.lists
        .filter((l) => !l.isArchived)
        .sort((a, b) => a.position - b.position)
    },
    getCardLogs: (state) => state.cardLogs,
  },

  actions: {
    // Board CRUD
    async fetchBoards() {
      const response = await api.get('/boards?order[position]=asc')
      this.boards = (response.data.member || []).map(normalizeBoard)
      return this.boards
    },

    async fetchBoard(id) {
      this.loading = true
      try {
        const [boardRes, cardsRes] = await Promise.all([
          api.get('/boards/' + id),
          api.get('/cards?list.board.id=' + id + '&order[position]=asc&isArchived=false&itemsPerPage=200'),
        ])

        const board = normalizeBoard(boardRes.data)
        const cards = (cardsRes.data.member || []).map(normalizeCard)

        // Attach cards to their respective lists
        board.lists.forEach((list) => {
          list.cards = cards.filter((c) => c.list.id === list.id)
        })
        board.lists.sort((a, b) => a.position - b.position)

        this.currentBoard = board
        return this.currentBoard
      } finally {
        this.loading = false
      }
    },

    async createBoard(data) {
      const response = await api.post('/boards', data)
      const board = normalizeBoard(response.data)
      this.boards.push(board)
      return board
    },

    async patchBoard(id, data) {
      const response = await api.patch('/boards/' + id, data)
      const updated = normalizeBoard(response.data)

      const idx = this.boards.findIndex((b) => b.id === id)
      if (idx !== -1) {
        Object.assign(this.boards[idx], updated)
      }
      if (this.currentBoard && this.currentBoard.id === id) {
        // Preserve lists from local state (API response may not include nested cards)
        const lists = this.currentBoard.lists
        Object.assign(this.currentBoard, updated)
        this.currentBoard.lists = lists
        if (updated.name) this.currentBoard.name = updated.name
      }
      return updated
    },

    async deleteBoard(id) {
      await api.delete('/boards/' + id)
      this.boards = this.boards.filter((b) => b.id !== id)
      if (this.currentBoard && this.currentBoard.id === id) {
        this.currentBoard = null
      }
    },

    // List CRUD
    async createList(boardId, data) {
      const payload = {
        ...data,
        board: '/api/boards/' + boardId,
      }
      const response = await api.post('/board_lists', payload)
      const list = normalizeList(response.data)
      list.cards = []

      if (this.currentBoard && this.currentBoard.id === boardId) {
        this.currentBoard.lists.push(list)
      }
      return list
    },

    async patchList(listId, data) {
      const response = await api.patch('/board_lists/' + listId, data)
      const updated = normalizeList(response.data)

      if (this.currentBoard) {
        const list = this.currentBoard.lists.find((l) => l.id === listId)
        if (list) {
          const cards = list.cards
          Object.assign(list, updated)
          // Preserve local cards array (API response from PATCH may include cards without executors depth)
          list.cards = cards
        }
      }
      return updated
    },

    async deleteList(listId) {
      await api.delete('/board_lists/' + listId)
      if (this.currentBoard) {
        const idx = this.currentBoard.lists.findIndex((l) => l.id === listId)
        if (idx !== -1) {
          this.currentBoard.lists.splice(idx, 1)
        }
      }
    },

    // Card CRUD
    async createCard(listId, data) {
      const payload = {
        ...data,
        list: '/api/board_lists/' + listId,
      }
      const response = await api.post('/cards', payload)
      const card = normalizeCard(response.data)

      if (this.currentBoard) {
        const list = this.currentBoard.lists.find((l) => l.id === listId)
        if (list) {
          list.cards.push(card)
        }
      }
      return card
    },

    async patchCard(cardId, data) {
      const payload = { ...data }
      // list cannot be changed via PATCH — use moveCardPosition instead
      delete payload.list

      const response = await api.patch('/cards/' + cardId, payload)
      const updated = normalizeCard(response.data)

      if (this.currentBoard) {
        for (const list of this.currentBoard.lists) {
          const card = list.cards.find((c) => c.id === cardId)
          if (card) {
            // Preserve executor from local state if API didn't return full depth
            const executor = card.executor
            Object.assign(card, updated)
            if (!updated.executor || updated.executor.length === 0) {
              card.executor = executor
            }
            break
          }
        }
      }
      return updated
    },

    async deleteCard(cardId) {
      await api.delete('/cards/' + cardId)
      if (this.currentBoard) {
        for (const list of this.currentBoard.lists) {
          const idx = list.cards.findIndex((c) => c.id === cardId)
          if (idx !== -1) {
            list.cards.splice(idx, 1)
            break
          }
        }
      }
    },

    // Card logs
    async fetchCardLogs(cardId) {
      const response = await api.get(
        '/card_logs?card.id=' + cardId + '&order[createdAt]=desc',
      )
      this.cardLogs = response.data.member || []
      return this.cardLogs
    },

    // Executor management
    async addExecutor(cardId, userId) {
      await api.post('/cards/' + cardId + '/executor', {
        executor: '/api/users/' + userId,
      })
    },

    async removeExecutor(cardId, userId) {
      await api.post('/cards/' + cardId + '/executor-delete', {
        executor: '/api/users/' + userId,
      })
    },

    // Move card position (between lists or reorder within list)
    async moveCardPosition(cardId, { targetListId, prevCardId, nextCardId }) {
      const payload = {
        card: '/api/cards/' + cardId,
      }
      if (targetListId) {
        payload.targetList = '/api/board_lists/' + targetListId
      }
      if (prevCardId) {
        payload.prevCard = '/api/cards/' + prevCardId
      }
      if (nextCardId) {
        payload.nextCard = '/api/cards/' + nextCardId
      }
      const response = await api.post('/cards/move-position', payload)
      return normalizeCard(response.data)
    },

    // Reorder helpers (local state + API persistence)
    reorderLists(orderedLists) {
      if (!this.currentBoard) return
      const reindexed = reindexPositions(orderedLists)
      this.currentBoard.lists = reindexed
    },

    reorderCards(listId, orderedCards) {
      const reindexed = reindexPositions(orderedCards)

      if (this.currentBoard) {
        const list = this.currentBoard.lists.find((l) => l.id === listId)
        if (list) list.cards = reindexed
      }
    },

    moveCard(cardId, fromListId, toListId, newIndex) {
      if (!this.currentBoard) return

      const fromList = this.currentBoard.lists.find((l) => l.id === fromListId)
      const toList = this.currentBoard.lists.find((l) => l.id === toListId)
      if (!fromList || !toList) return

      const cardIdx = fromList.cards.findIndex((c) => c.id === cardId)
      if (cardIdx === -1) return

      const [card] = fromList.cards.splice(cardIdx, 1)
      card.list = { id: toListId }
      toList.cards.splice(newIndex, 0, card)

      this.reorderCards(fromListId, fromList.cards)
      this.reorderCards(toListId, toList.cards)
    },

    setCurrentBoardLists(lists) {
      if (this.currentBoard) {
        this.currentBoard.lists = lists
      }
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useBoardStore, import.meta.hot))
}
