export function getTodayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function getWeekRange() {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const start = new Date(today)
  start.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  }
}

export function getMonthRange() {
  const today = new Date()
  const start = new Date(today.getFullYear(), today.getMonth(), 1)
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  }
}
