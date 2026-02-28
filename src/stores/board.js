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

function positionOrMax(value) {
  return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER
}

function normalizeCard(card, fallbackList = null) {
  const listId = extractId(card.list) ?? fallbackList?.id ?? null
  const listName = typeof card.list === 'object' ? card.list.name : fallbackList?.name ?? null

  return {
    ...card,
    id: extractId(card['@id']) ?? card.id,
    list: { id: listId, name: listName },
    executor: Array.isArray(card.executor)
      ? card.executor.map((e) => (typeof e === 'object' ? e : { id: extractId(e) }))
      : [],
  }
}

function normalizeList(list) {
  const listId = list.id ?? extractId(list['@id'])
  const listName = list.name ?? null

  return {
    ...list,
    id: listId,
    board: { id: extractId(list.board) },
    cards: Array.isArray(list.cards)
      ? list.cards.map((card) => normalizeCard(card, { id: listId, name: listName }))
      : [],
  }
}

async function fetchListCards(listId, listName = null) {
  const response = await api.get('/cards?list.id=' + listId + '&order[position]=asc&itemsPerPage=200')
  const cards = (response.data.member || []).map((card) => normalizeCard(card, { id: listId, name: listName }))
  return cards.sort((a, b) => positionOrMax(a.position) - positionOrMax(b.position))
}

function normalizeBoard(board) {
  return {
    ...board,
    id: board.id ?? extractId(board['@id']),
    lists: Array.isArray(board.lists) ? board.lists.map(normalizeList) : [],
  }
}

function normalizeCardPattern(pattern) {
  const card = typeof pattern.card === 'object' ? pattern.card : null
  return {
    ...pattern,
    id: pattern.id ?? extractId(pattern['@id']),
    card: pattern.card ?? null,
    cardId: extractId(pattern.card),
    name: pattern.name || card?.name || 'Без названия',
    description: pattern.description || card?.description || '',
    deadline: pattern.deadline || card?.deadline || null,
    status: pattern.status || card?.status || 'open',
  }
}

export const useBoardStore = defineStore('board', {
  state: () => ({
    boards: [],
    currentBoard: null,
    cardLogs: [],
    loading: false,
    archivedCards: [],
    archivedCardsTotal: 0,
    archivedCardsPage: 1,
    archivedLists: [],
    archivedListsTotal: 0,
    archivedListsPage: 1,
    cardPatterns: [],
  }),

  getters: {
    getBoards: (state) => state.boards,
    getCurrentBoard: (state) => state.currentBoard,
    getActiveLists: (state) => {
      if (!state.currentBoard) return []
      return state.currentBoard.lists
        .filter((l) => !l.isArchived)
        .sort((a, b) => positionOrMax(a.position) - positionOrMax(b.position))
    },
    getCardLogs: (state) => state.cardLogs,
    getCardPatterns: (state) => state.cardPatterns,
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
        const [boardRes, listsRes] = await Promise.all([
          api.get('/boards/' + id),
          api.get('/board_lists?board.id=' + id + '&order[position]=asc&itemsPerPage=200'),
        ])

        const board = normalizeBoard(boardRes.data)
        const lists = (listsRes.data.member || []).map(normalizeList)
        lists.forEach((list) => {
          list.cards.sort((a, b) => positionOrMax(a.position) - positionOrMax(b.position))
        })

        board.lists = lists.sort((a, b) => positionOrMax(a.position) - positionOrMax(b.position))
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
        if (data.isArchived === true) {
          // Archiving: remove from board lists, add to archivedLists
          const idx = this.currentBoard.lists.findIndex((l) => l.id === listId)
          if (idx !== -1) {
            this.currentBoard.lists.splice(idx, 1)
          }
          const alreadyInArchive = this.archivedLists.some((l) => l.id === listId)
          if (!alreadyInArchive) {
            this.archivedLists.unshift(updated)
            this.archivedListsTotal++
          }
        } else if (data.isArchived === false) {
          // Unarchiving: remove from archivedLists, add back to board lists
          const archIdx = this.archivedLists.findIndex((l) => l.id === listId)
          if (archIdx !== -1) {
            this.archivedLists.splice(archIdx, 1)
            this.archivedListsTotal = Math.max(0, this.archivedListsTotal - 1)
          }
          updated.cards = await fetchListCards(listId, updated.name)
          this.currentBoard.lists.push(updated)
          this.currentBoard.lists.sort((a, b) => positionOrMax(a.position) - positionOrMax(b.position))
        } else {
          const list = this.currentBoard.lists.find((l) => l.id === listId)
          if (list) {
            const cards = list.cards
            Object.assign(list, updated)
            // Preserve local cards array (API response from PATCH may include cards without executors depth)
            list.cards = cards
          }
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
      // Also remove from archived lists if present
      const archIdx = this.archivedLists.findIndex((l) => l.id === listId)
      if (archIdx !== -1) {
        this.archivedLists.splice(archIdx, 1)
        this.archivedListsTotal = Math.max(0, this.archivedListsTotal - 1)
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
        if (data.isArchived === true) {
          // Archiving: remove from board list, add to archivedCards
          for (const list of this.currentBoard.lists) {
            const idx = list.cards.findIndex((c) => c.id === cardId)
            if (idx !== -1) {
              list.cards.splice(idx, 1)
              break
            }
          }
          const alreadyInArchive = this.archivedCards.some((c) => c.id === cardId)
          if (!alreadyInArchive) {
            this.archivedCards.unshift(updated)
            this.archivedCardsTotal++
          }
        } else if (data.isArchived === false) {
          // Unarchiving: remove from archivedCards, add back to target list
          const archIdx = this.archivedCards.findIndex((c) => c.id === cardId)
          if (archIdx !== -1) {
            this.archivedCards.splice(archIdx, 1)
            this.archivedCardsTotal = Math.max(0, this.archivedCardsTotal - 1)
          }
          const targetListId = extractId(updated.list)
          if (targetListId) {
            const targetList = this.currentBoard.lists.find((l) => l.id === targetListId)
            if (targetList) {
              targetList.cards.push(updated)
            }
          }
        } else {
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
      }
      return updated
    },

    async fetchCardById(cardId) {
      const response = await api.get('/cards/' + cardId)
      return normalizeCard(response.data)
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
      // Also remove from archived cards if present
      const archIdx = this.archivedCards.findIndex((c) => c.id === cardId)
      if (archIdx !== -1) {
        this.archivedCards.splice(archIdx, 1)
        this.archivedCardsTotal = Math.max(0, this.archivedCardsTotal - 1)
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

    async createCardLog(cardId, description) {
      const response = await api.post('/card_logs', {
        card: '/api/cards/' + cardId,
        description,
      })
      const created = response.data
      this.cardLogs = [created, ...(this.cardLogs || [])]
      return created
    },

    async patchCardLog(cardLogId, description) {
      const response = await api.patch('/card_logs/' + cardLogId, { description })
      const updated = response.data
      const idx = this.cardLogs.findIndex((log) => log.id === cardLogId)
      if (idx !== -1) {
        this.cardLogs[idx] = {
          ...this.cardLogs[idx],
          ...updated,
        }
      }
      return updated
    },

    async deleteCardLog(cardLogId) {
      await api.delete('/card_logs/' + cardLogId)
      this.cardLogs = this.cardLogs.filter((log) => log.id !== cardLogId)
    },

    // Executor management
    async addExecutor(cardId, userOrId) {
      const userId = typeof userOrId === 'object' ? extractId(userOrId) : extractId(userOrId)
      if (!userId) return

      await api.post('/cards/' + cardId + '/executor', {
        executor: '/api/users/' + userId,
      })

      if (!this.currentBoard) return

      for (const list of this.currentBoard.lists) {
        const card = list.cards.find((c) => c.id === cardId)
        if (!card) continue

        const alreadyExists = (card.executor || []).some((e) => extractId(e) === userId)
        if (!alreadyExists) {
          const executorEntry = typeof userOrId === 'object' ? userOrId : { id: userId }
          card.executor = [...(card.executor || []), executorEntry]
        }
        break
      }
    },

    async removeExecutor(cardId, userId) {
      const executorId = extractId(userId)
      if (!executorId) return

      await api.post('/cards/' + cardId + '/executor-delete', {
        executor: '/api/users/' + executorId,
      })

      if (!this.currentBoard) return

      for (const list of this.currentBoard.lists) {
        const card = list.cards.find((c) => c.id === cardId)
        if (!card) continue

        card.executor = (card.executor || []).filter((e) => extractId(e) !== executorId)
        break
      }
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

    async moveListPosition(listId, { targetBoardId, prevListId, nextListId }) {
      const payload = {
        boardList: '/api/board_lists/' + listId,
      }
      if (targetBoardId) {
        payload.targetBoard = '/api/boards/' + targetBoardId
      }
      if (prevListId) {
        payload.prevBoardList = '/api/board_lists/' + prevListId
      }
      if (nextListId) {
        payload.nextBoardList = '/api/board_lists/' + nextListId
      }
      const response = await api.post('/board_lists/move-position', payload)
      return normalizeList(response.data)
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

    // Archive fetching
    async fetchArchivedCards(boardId, page = 1, reset = false) {
      if (reset) {
        this.archivedCards = []
        this.archivedCardsPage = 1
      }
      const response = await api.get(
        '/cards/archived?list.board.id=' + boardId + '&page=' + page,
      )
      const items = (response.data.member || []).map(normalizeCard)
      if (reset) {
        this.archivedCards = items
      } else {
        this.archivedCards.push(...items)
      }
      this.archivedCardsTotal = response.data.totalItems ?? 0
      this.archivedCardsPage = page
      return items
    },

    async fetchArchivedLists(boardId, page = 1, reset = false) {
      if (reset) {
        this.archivedLists = []
        this.archivedListsPage = 1
      }
      const response = await api.get(
        '/board_lists/archived?board.id=' + boardId + '&page=' + page,
      )
      const items = (response.data.member || []).map(normalizeList)
      if (reset) {
        this.archivedLists = items
      } else {
        this.archivedLists.push(...items)
      }
      this.archivedListsTotal = response.data.totalItems ?? 0
      this.archivedListsPage = page
      return items
    },

    // Card patterns
    async fetchCardPatterns() {
      try {
        const response = await api.get('/card_patterns?itemsPerPage=200')
        this.cardPatterns = (response.data.member || []).map(normalizeCardPattern)
        return this.cardPatterns
      } catch {
        const fallback = await api.get('/card-patterns?itemsPerPage=200')
        this.cardPatterns = (fallback.data.member || []).map(normalizeCardPattern)
        return this.cardPatterns
      }
    },

    async createCardPatternFromCard(cardId) {
      const response = await api.post('/card-patterns/from-card', {
        card: '/api/cards/' + cardId,
      })
      const pattern = normalizeCardPattern(response.data)
      const idx = this.cardPatterns.findIndex((p) => p.id === pattern.id)
      if (idx === -1) {
        this.cardPatterns.unshift(pattern)
      } else {
        this.cardPatterns[idx] = pattern
      }
      return pattern
    },

    async patchCardPattern(patternId, data) {
      let response
      try {
        response = await api.patch('/card_patterns/' + patternId, data)
      } catch {
        response = await api.patch('/card-patterns/' + patternId, data)
      }
      const pattern = normalizeCardPattern(response.data)
      const idx = this.cardPatterns.findIndex((p) => p.id === pattern.id)
      if (idx === -1) {
        this.cardPatterns.unshift(pattern)
      } else {
        this.cardPatterns[idx] = pattern
      }
      return pattern
    },

    async deleteCardPattern(patternId) {
      try {
        await api.delete('/card_patterns/' + patternId)
      } catch {
        await api.delete('/card-patterns/' + patternId)
      }
      this.cardPatterns = this.cardPatterns.filter((p) => p.id !== patternId)
    },

    setCurrentBoardLists(lists) {
      if (this.currentBoard) {
        const archived = this.currentBoard.lists.filter((list) => list.isArchived)
        this.currentBoard.lists = [...lists, ...archived]
      }
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useBoardStore, import.meta.hot))
}
