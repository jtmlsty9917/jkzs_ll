import { useState, useEffect, useCallback } from 'react'
import { getExerciseLog, addExerciseLog, deleteExerciseLog, getSetting, setSetting } from '../db'

export const EXERCISE_TYPES = [
  { key: 'running',   icon: '🏃', label: '跑步' },
  { key: 'swimming',  icon: '🏊', label: '游泳' },
  { key: 'gym',       icon: '🏋️', label: '健身' },
  { key: 'cycling',   icon: '🚴', label: '骑行' },
  { key: 'yoga',      icon: '🧘', label: '瑜伽' },
  { key: 'ball',      icon: '⛹️', label: '球类' },
  { key: 'badminton', icon: '🏸', label: '羽毛球' },
  { key: 'table-tennis', icon: '🏓', label: '乒乓球' },
  { key: 'tennis',    icon: '🎾', label: '网球' },
  { key: 'walking',   icon: '🚶', label: '散步' },
  { key: 'dance',     icon: '💃', label: '跳舞' },
  { key: 'hiking',    icon: '🏔️', label: '登山' },
]

/**
 * 锻炼数据 Hook
 */
export function useExercise(today) {
  const [todayLogs, setTodayLogs] = useState([])
  const [weeklyTarget, setWeeklyTarget] = useState(5)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const [logs, target] = await Promise.all([
      getExerciseLog(today),
      getSetting('exercisePerWeek'),
    ])
    setTodayLogs(logs || [])
    setWeeklyTarget(target || 5)
    setLoading(false)
  }, [today])

  useEffect(() => { load() }, [load])

  const recordExercise = useCallback(async ({ type, duration }) => {
    await addExerciseLog({ date: today, type, duration })
    await load()
  }, [today, load])

  const removeExercise = useCallback(async (id) => {
    await deleteExerciseLog(id)
    await load()
  }, [load])

  const updateWeeklyTarget = useCallback(async (target) => {
    await setSetting('exercisePerWeek', target)
    setWeeklyTarget(target)
  }, [])

  return {
    todayLogs,
    weeklyTarget,
    loading,
    recordExercise,
    removeExercise,
    updateWeeklyTarget,
    refresh: load,
  }
}
