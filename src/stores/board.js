import { acceptHMRUpdate, defineStore } from 'pinia'
import { reindexPositions, POSITION_GAP } from '@/utils/positionHelpers'

let nextId = 100

function genId() {
  return nextId++
}

function now() {
  return new Date().toISOString()
}

const mockUser = { id: 1, givenName: 'Амир', familyName: 'Файзуллаев' }
const mockUser2 = { id: 2, givenName: 'Дильшод', familyName: 'Каримов' }

const mockLogs = {
  1: [
    {
      id: 1,
      card: { id: 1 },
      description: 'Карточка создана',
      createdAt: '2025-01-15T10:00:00+00:00',
      createdBy: mockUser,
    },
    {
      id: 2,
      card: { id: 1 },
      description: 'Карточка перемещена из «Бэклог» в «В работе»',
      createdAt: '2025-01-16T14:30:00+00:00',
      createdBy: mockUser,
    },
    {
      id: 3,
      card: { id: 1 },
      description: 'Исполнитель добавлен: Дильшод Каримов',
      createdAt: '2025-01-17T09:00:00+00:00',
      createdBy: mockUser2,
    },
  ],
  4: [
    {
      id: 4,
      card: { id: 4 },
      description: 'Карточка создана',
      createdAt: '2025-01-18T08:00:00+00:00',
      createdBy: mockUser,
    },
    {
      id: 5,
      card: { id: 4 },
      description: 'Статус изменён на «В работе»',
      createdAt: '2025-01-19T12:00:00+00:00',
      createdBy: mockUser2,
    },
  ],
  6: [
    {
      id: 6,
      card: { id: 6 },
      description: 'Карточка создана',
      createdAt: '2025-01-12T10:00:00+00:00',
      createdBy: mockUser,
    },
    {
      id: 7,
      card: { id: 6 },
      description: 'Карточка перемещена из «В работе» в «На проверке»',
      createdAt: '2025-01-20T15:00:00+00:00',
      createdBy: mockUser,
    },
  ],
}

function createMockBoards() {
  return [
    {
      id: 1,
      name: 'Маркетинг Q1',
      position: 10,
      createdAt: '2025-01-15T10:00:00+00:00',
      updatedAt: '2025-01-20T14:30:00+00:00',
      createdBy: mockUser,
      lists: [
        {
          id: 1,
          board: { id: 1 },
          name: 'Бэклог',
          isArchived: false,
          color: '#3b82f6',
          position: 10,
          createdAt: '2025-01-15T10:00:00+00:00',
          updatedAt: '2025-01-15T10:00:00+00:00',
          createdBy: mockUser,
          cards: [
            {
              id: 1,
              list: { id: 1 },
              name: 'Разработать стратегию SMM',
              description:
                'Определить целевую аудиторию, выбрать платформы, составить план публикаций на квартал',
              color: '#3b82f6',
              status: 'open',
              isArchived: false,
              deadline: '2025-02-28T00:00:00+00:00',
              position: 10,
              createdAt: '2025-01-15T10:00:00+00:00',
              updatedAt: '2025-01-15T10:00:00+00:00',
              createdBy: mockUser,
              executor: [mockUser, mockUser2],
              logs: mockLogs[1] || [],
            },
            {
              id: 2,
              list: { id: 1 },
              name: 'Подготовить контент-план на февраль',
              description: '',
              color: '#8b5cf6',
              status: 'open',
              isArchived: false,
              deadline: null,
              position: 20,
              createdAt: '2025-01-16T09:00:00+00:00',
              updatedAt: '2025-01-16T09:00:00+00:00',
              createdBy: mockUser,
              executor: [mockUser],
              logs: [],
            },
            {
              id: 3,
              list: { id: 1 },
              name: 'Анализ конкурентов',
              description:
                'Провести анализ 5 основных конкурентов: социальные сети, контент, частота публикаций',
              color: null,
              status: 'open',
              isArchived: false,
              deadline: '2025-02-15T00:00:00+00:00',
              position: 30,
              createdAt: '2025-01-17T11:00:00+00:00',
              updatedAt: '2025-01-17T11:00:00+00:00',
              createdBy: mockUser2,
              executor: [],
              logs: [],
            },
          ],
        },
        {
          id: 2,
          board: { id: 1 },
          name: 'В работе',
          isArchived: false,
          color: '#f97316',
          position: 20,
          createdAt: '2025-01-15T10:00:00+00:00',
          updatedAt: '2025-01-15T10:00:00+00:00',
          createdBy: mockUser,
          cards: [
            {
              id: 4,
              list: { id: 2 },
              name: 'Дизайн баннеров для Instagram',
              description: 'Создать 5 баннеров для Instagram Stories и 3 для ленты',
              color: '#f97316',
              status: 'in_progress',
              isArchived: false,
              deadline: '2025-02-10T00:00:00+00:00',
              position: 10,
              createdAt: '2025-01-18T08:00:00+00:00',
              updatedAt: '2025-01-19T12:00:00+00:00',
              createdBy: mockUser,
              executor: [mockUser2],
              logs: mockLogs[4] || [],
            },
            {
              id: 5,
              list: { id: 2 },
              name: 'Написать тексты для рассылки',
              description: '',
              color: '#22c55e',
              status: 'in_progress',
              isArchived: false,
              deadline: null,
              position: 20,
              createdAt: '2025-01-18T09:00:00+00:00',
              updatedAt: '2025-01-18T09:00:00+00:00',
              createdBy: mockUser2,
              executor: [mockUser, mockUser2],
              logs: [],
            },
          ],
        },
        {
          id: 3,
          board: { id: 1 },
          name: 'На проверке',
          isArchived: false,
          color: '#8b5cf6',
          position: 30,
          createdAt: '2025-01-15T10:00:00+00:00',
          updatedAt: '2025-01-15T10:00:00+00:00',
          createdBy: mockUser,
          cards: [
            {
              id: 6,
              list: { id: 3 },
              name: 'Лендинг для акции',
              description: 'Подготовить лендинг для зимней акции со скидками',
              color: '#ec4899',
              status: 'review',
              isArchived: false,
              deadline: '2025-02-05T00:00:00+00:00',
              position: 10,
              createdAt: '2025-01-12T10:00:00+00:00',
              updatedAt: '2025-01-20T15:00:00+00:00',
              createdBy: mockUser,
              executor: [mockUser],
              logs: mockLogs[6] || [],
            },
          ],
        },
        {
          id: 4,
          board: { id: 1 },
          name: 'Готово',
          isArchived: false,
          color: '#22c55e',
          position: 40,
          createdAt: '2025-01-15T10:00:00+00:00',
          updatedAt: '2025-01-15T10:00:00+00:00',
          createdBy: mockUser,
          cards: [
            {
              id: 7,
              list: { id: 4 },
              name: 'Настроить рекламный кабинет',
              description: '',
              color: '#ef4444',
              status: 'done',
              isArchived: false,
              deadline: null,
              position: 10,
              createdAt: '2025-01-10T10:00:00+00:00',
              updatedAt: '2025-01-14T16:00:00+00:00',
              createdBy: mockUser2,
              executor: [mockUser2],
              logs: [],
            },
            {
              id: 8,
              list: { id: 4 },
              name: 'Создать бизнес-аккаунт',
              description: '',
              color: null,
              status: 'done',
              isArchived: false,
              deadline: null,
              position: 20,
              createdAt: '2025-01-08T10:00:00+00:00',
              updatedAt: '2025-01-12T11:00:00+00:00',
              createdBy: mockUser,
              executor: [],
              logs: [],
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Разработка сайта',
      position: 20,
      createdAt: '2025-01-10T10:00:00+00:00',
      updatedAt: '2025-01-18T09:00:00+00:00',
      createdBy: mockUser,
      lists: [
        {
          id: 5,
          board: { id: 2 },
          name: 'TODO',
          isArchived: false,
          color: '#3b82f6',
          position: 10,
          createdAt: '2025-01-10T10:00:00+00:00',
          updatedAt: '2025-01-10T10:00:00+00:00',
          createdBy: mockUser,
          cards: [
            {
              id: 9,
              list: { id: 5 },
              name: 'Вёрстка главной страницы',
              description: 'Сверстать адаптивную главную страницу по макету из Figma',
              color: '#06b6d4',
              status: 'open',
              isArchived: false,
              deadline: '2025-03-01T00:00:00+00:00',
              position: 10,
              createdAt: '2025-01-10T10:00:00+00:00',
              updatedAt: '2025-01-10T10:00:00+00:00',
              createdBy: mockUser,
              executor: [mockUser],
              logs: [],
            },
            {
              id: 10,
              list: { id: 5 },
              name: 'API интеграция',
              description: '',
              color: null,
              status: 'open',
              isArchived: false,
              deadline: null,
              position: 20,
              createdAt: '2025-01-11T10:00:00+00:00',
              updatedAt: '2025-01-11T10:00:00+00:00',
              createdBy: mockUser2,
              executor: [mockUser2],
              logs: [],
            },
          ],
        },
        {
          id: 6,
          board: { id: 2 },
          name: 'In Progress',
          isArchived: false,
          color: '#f97316',
          position: 20,
          createdAt: '2025-01-10T10:00:00+00:00',
          updatedAt: '2025-01-10T10:00:00+00:00',
          createdBy: mockUser,
          cards: [
            {
              id: 11,
              list: { id: 6 },
              name: 'Настроить CI/CD',
              description: 'Настроить пайплайн CI/CD для автоматического деплоя',
              color: '#eab308',
              status: 'in_progress',
              isArchived: false,
              deadline: '2025-02-20T00:00:00+00:00',
              position: 10,
              createdAt: '2025-01-12T10:00:00+00:00',
              updatedAt: '2025-01-15T10:00:00+00:00',
              createdBy: mockUser,
              executor: [mockUser, mockUser2],
              logs: [],
            },
          ],
        },
      ],
    },
    {
      id: 3,
      name: 'HR & Найм',
      position: 30,
      createdAt: '2025-01-20T10:00:00+00:00',
      updatedAt: '2025-01-22T16:00:00+00:00',
      createdBy: mockUser2,
      lists: [
        {
          id: 7,
          board: { id: 3 },
          name: 'Кандидаты',
          isArchived: false,
          color: '#06b6d4',
          position: 10,
          createdAt: '2025-01-20T10:00:00+00:00',
          updatedAt: '2025-01-20T10:00:00+00:00',
          createdBy: mockUser2,
          cards: [
            {
              id: 12,
              list: { id: 7 },
              name: 'Собеседование — дизайнер',
              description: '',
              color: '#6366f1',
              status: 'in_progress',
              isArchived: false,
              deadline: '2025-02-25T00:00:00+00:00',
              position: 10,
              createdAt: '2025-01-20T10:00:00+00:00',
              updatedAt: '2025-01-22T10:00:00+00:00',
              createdBy: mockUser2,
              executor: [mockUser2],
              logs: [],
            },
            {
              id: 13,
              list: { id: 7 },
              name: 'Тестовое задание — frontend',
              description: '',
              color: '#14b8a6',
              status: 'review',
              isArchived: false,
              deadline: '2025-02-18T00:00:00+00:00',
              position: 20,
              createdAt: '2025-01-21T10:00:00+00:00',
              updatedAt: '2025-01-22T16:00:00+00:00',
              createdBy: mockUser2,
              executor: [],
              logs: [],
            },
          ],
        },
        {
          id: 8,
          board: { id: 3 },
          name: 'Оформление',
          isArchived: false,
          color: '#22c55e',
          position: 20,
          createdAt: '2025-01-20T10:00:00+00:00',
          updatedAt: '2025-01-20T10:00:00+00:00',
          createdBy: mockUser2,
          cards: [],
        },
        {
          id: 9,
          board: { id: 3 },
          name: 'Архив',
          isArchived: false,
          color: '#9ca3af',
          position: 30,
          createdAt: '2025-01-20T10:00:00+00:00',
          updatedAt: '2025-01-20T10:00:00+00:00',
          createdBy: mockUser2,
          cards: [
            {
              id: 14,
              list: { id: 9 },
              name: 'Отклонён — backend разработчик',
              description: '',
              color: null,
              status: 'done',
              isArchived: true,
              deadline: null,
              position: 10,
              createdAt: '2025-01-15T10:00:00+00:00',
              updatedAt: '2025-01-19T10:00:00+00:00',
              createdBy: mockUser2,
              executor: [mockUser2],
              logs: [],
            },
          ],
        },
      ],
    },
  ]
}

export const useBoardStore = defineStore('board', {
  state: () => ({
    boards: createMockBoards(),
    currentBoard: null,
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
  },

  actions: {
    // Board CRUD
    fetchBoards() {
      // TODO: Replace with api.get('/boards?order[position]=asc')
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(this.boards)
        }, 100)
      })
    },

    fetchBoard(id) {
      // TODO: Replace with api.get('/boards/' + id)
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const board = this.boards.find((b) => b.id === Number(id))
          if (board) {
            this.currentBoard = JSON.parse(JSON.stringify(board))
            this.currentBoard.lists.sort((a, b) => a.position - b.position)
            this.currentBoard.lists.forEach((list) => {
              list.cards.sort((a, b) => a.position - b.position)
            })
            resolve(this.currentBoard)
          } else {
            reject(new Error('Board not found'))
          }
        }, 100)
      })
    },

    createBoard(data) {
      // TODO: Replace with api.post('/boards', data)
      return new Promise((resolve) => {
        setTimeout(() => {
          const board = {
            id: genId(),
            name: data.name,
            position: (this.boards.length + 1) * POSITION_GAP,
            createdAt: now(),
            updatedAt: now(),
            createdBy: mockUser,
            lists: [],
          }
          this.boards.push(board)
          resolve(board)
        }, 100)
      })
    },

    patchBoard(id, data) {
      // TODO: Replace with api.patch('/boards/' + id, data)
      return new Promise((resolve) => {
        setTimeout(() => {
          const board = this.boards.find((b) => b.id === id)
          if (board) {
            Object.assign(board, data, { updatedAt: now() })
            if (this.currentBoard && this.currentBoard.id === id) {
              Object.assign(this.currentBoard, data, { updatedAt: now() })
            }
          }
          resolve(board)
        }, 100)
      })
    },

    deleteBoard(id) {
      // TODO: Replace with api.delete('/boards/' + id)
      return new Promise((resolve) => {
        setTimeout(() => {
          this.boards = this.boards.filter((b) => b.id !== id)
          if (this.currentBoard && this.currentBoard.id === id) {
            this.currentBoard = null
          }
          resolve()
        }, 100)
      })
    },

    // List CRUD
    createList(boardId, data) {
      // TODO: Replace with api.post('/board_lists', { board: '/api/boards/' + boardId, ...data })
      return new Promise((resolve) => {
        setTimeout(() => {
          const board = this.boards.find((b) => b.id === boardId)
          if (!board) return resolve(null)

          const list = {
            id: genId(),
            board: { id: boardId },
            name: data.name,
            isArchived: false,
            color: data.color || null,
            position: (board.lists.length + 1) * POSITION_GAP,
            createdAt: now(),
            updatedAt: now(),
            createdBy: mockUser,
            cards: [],
          }
          board.lists.push(list)
          if (this.currentBoard && this.currentBoard.id === boardId) {
            this.currentBoard.lists.push(JSON.parse(JSON.stringify(list)))
          }
          resolve(list)
        }, 100)
      })
    },

    patchList(listId, data) {
      // TODO: Replace with api.patch('/board_lists/' + listId, data)
      return new Promise((resolve) => {
        setTimeout(() => {
          for (const board of this.boards) {
            const list = board.lists.find((l) => l.id === listId)
            if (list) {
              Object.assign(list, data, { updatedAt: now() })
              break
            }
          }
          if (this.currentBoard) {
            const list = this.currentBoard.lists.find((l) => l.id === listId)
            if (list) {
              Object.assign(list, data, { updatedAt: now() })
            }
          }
          resolve()
        }, 100)
      })
    },

    deleteList(listId) {
      // TODO: Replace with api.delete('/board_lists/' + listId)
      return new Promise((resolve) => {
        setTimeout(() => {
          for (const board of this.boards) {
            const idx = board.lists.findIndex((l) => l.id === listId)
            if (idx !== -1) {
              board.lists.splice(idx, 1)
              break
            }
          }
          if (this.currentBoard) {
            const idx = this.currentBoard.lists.findIndex((l) => l.id === listId)
            if (idx !== -1) {
              this.currentBoard.lists.splice(idx, 1)
            }
          }
          resolve()
        }, 100)
      })
    },

    // Card CRUD
    createCard(listId, data) {
      // TODO: Replace with api.post('/cards', { list: '/api/board_lists/' + listId, ...data })
      return new Promise((resolve) => {
        setTimeout(() => {
          let targetList = null
          for (const board of this.boards) {
            targetList = board.lists.find((l) => l.id === listId)
            if (targetList) break
          }
          if (!targetList) return resolve(null)

          const card = {
            id: genId(),
            list: { id: listId },
            name: data.name,
            description: data.description || '',
            color: data.color || null,
            status: data.status || 'open',
            isArchived: false,
            deadline: data.deadline || null,
            position: (targetList.cards.length + 1) * POSITION_GAP,
            createdAt: now(),
            updatedAt: now(),
            createdBy: mockUser,
            executor: [],
            logs: [],
          }
          targetList.cards.push(card)

          if (this.currentBoard) {
            const cList = this.currentBoard.lists.find((l) => l.id === listId)
            if (cList) {
              cList.cards.push(JSON.parse(JSON.stringify(card)))
            }
          }
          resolve(card)
        }, 100)
      })
    },

    patchCard(cardId, data) {
      // TODO: Replace with api.patch('/cards/' + cardId, data)
      return new Promise((resolve) => {
        setTimeout(() => {
          for (const board of this.boards) {
            for (const list of board.lists) {
              const card = list.cards.find((c) => c.id === cardId)
              if (card) {
                Object.assign(card, data, { updatedAt: now() })
                resolve(card)
                return
              }
            }
          }
          if (this.currentBoard) {
            for (const list of this.currentBoard.lists) {
              const card = list.cards.find((c) => c.id === cardId)
              if (card) {
                Object.assign(card, data, { updatedAt: now() })
              }
            }
          }
          resolve()
        }, 100)
      })
    },

    deleteCard(cardId) {
      // TODO: Replace with api.delete('/cards/' + cardId)
      return new Promise((resolve) => {
        setTimeout(() => {
          for (const board of this.boards) {
            for (const list of board.lists) {
              const idx = list.cards.findIndex((c) => c.id === cardId)
              if (idx !== -1) {
                list.cards.splice(idx, 1)
                break
              }
            }
          }
          if (this.currentBoard) {
            for (const list of this.currentBoard.lists) {
              const idx = list.cards.findIndex((c) => c.id === cardId)
              if (idx !== -1) {
                list.cards.splice(idx, 1)
                break
              }
            }
          }
          resolve()
        }, 100)
      })
    },

    // Reorder helpers
    reorderLists(orderedLists) {
      if (!this.currentBoard) return
      const reindexed = reindexPositions(orderedLists)
      this.currentBoard.lists = reindexed

      const board = this.boards.find((b) => b.id === this.currentBoard.id)
      if (board) {
        board.lists = JSON.parse(JSON.stringify(reindexed))
      }
    },

    reorderCards(listId, orderedCards) {
      const reindexed = reindexPositions(orderedCards)

      if (this.currentBoard) {
        const list = this.currentBoard.lists.find((l) => l.id === listId)
        if (list) list.cards = reindexed
      }

      for (const board of this.boards) {
        const list = board.lists.find((l) => l.id === listId)
        if (list) {
          list.cards = JSON.parse(JSON.stringify(reindexed))
          break
        }
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
