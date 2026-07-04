import Dexie from 'dexie'

// ===== 数据库初始化 =====
const db = new Dexie('LazyHealthDB')

db.version(1).stores({
  waterLogs: '++id, date',
  exerciseLogs: '++id, date',
  diaryEntries: '++id, date',
  todos: '++id, dueDate, completed',
  settings: '++id, key',
})

// ===== 喝水记录 =====
export async function getWaterLogsByRange(startDate, endDate) {
  return db.waterLogs
    .where('date')
    .between(startDate, endDate, true, true)
    .toArray()
}

export async function getWaterLog(date) {
  return db.waterLogs.where('date').equals(date).first()
}

export async function saveWaterLog({ date, cups, ml, targetMl }) {
  const existing = await getWaterLog(date)
  if (existing) {
    // 累加杯数和毫升
    return db.waterLogs.update(existing.id, {
      cups: existing.cups + cups,
      ml: existing.ml + ml,
      targetMl,
    })
  }
  return db.waterLogs.add({ date, cups, ml, targetMl })
}

// ===== 锻炼记录 =====
export async function getExerciseLogsByRange(startDate, endDate) {
  return db.exerciseLogs
    .where('date')
    .between(startDate, endDate, true, true)
    .toArray()
}

export async function getExerciseLog(date) {
  return db.exerciseLogs.where('date').equals(date).toArray()
}

export async function addExerciseLog({ date, type, duration }) {
  return db.exerciseLogs.add({ date, type, duration: duration || 0 })
}

export async function deleteExerciseLog(id) {
  return db.exerciseLogs.delete(id)
}

// ===== 日记 =====
export async function getDiaryEntriesByRange(startDate, endDate) {
  return db.diaryEntries
    .where('date')
    .between(startDate, endDate, true, true)
    .toArray()
}

export async function getDiaryEntry(date) {
  return db.diaryEntries.where('date').equals(date).first()
}

export async function saveDiaryEntry({ date, content, photos }) {
  const existing = await getDiaryEntry(date)
  if (existing) {
    return db.diaryEntries.update(existing.id, { content, photos })
  }
  return db.diaryEntries.add({ date, content, photos: photos || [] })
}

// ===== 待办 =====
export async function getTodos(date) {
  return db.todos.where('dueDate').equals(date).toArray()
}

export async function getAllTodos() {
  return db.todos.orderBy('dueDate').toArray()
}

export async function addTodo({ title, dueDate, dueTime }) {
  return db.todos.add({
    title,
    dueDate,
    dueTime,
    completed: false,
    createdAt: new Date().toISOString(),
  })
}

export async function toggleTodo(id) {
  const todo = await db.todos.get(id)
  if (todo) {
    return db.todos.update(id, { completed: !todo.completed })
  }
}

export async function deleteTodo(id) {
  return db.todos.delete(id)
}

// ===== 设置 =====
export async function getSetting(key) {
  const item = await db.settings.where('key').equals(key).first()
  return item ? item.value : null
}

export async function setSetting(key, value) {
  const existing = await db.settings.where('key').equals(key).first()
  if (existing) {
    return db.settings.update(existing.id, { value })
  }
  return db.settings.add({ key, value })
}

// ===== 默认设置 =====
const DEFAULTS = {
  waterCupsPerDay: 8,    // 每日目标杯数
  waterMlPerCup: 300,    // 每杯毫升数
  exercisePerWeek: 5,    // 每周目标锻炼次数
}

/** 获取所有设置（含默认值） */
export async function getAllSettings() {
  const result = { ...DEFAULTS }
  const items = await db.settings.toArray()
  for (const item of items) {
    result[item.key] = item.value
  }
  return result
}

export default db
