import { useState, useEffect, useCallback } from 'react'
import { getWaterLog, saveWaterLog, getSetting, setSetting } from '../db'

/**
 * 喝水数据 Hook
 * 管理当日喝水记录、目标设置
 */
export function useWater(today) {
  const [todayLog, setTodayLog] = useState(null)       // { cups, ml, targetMl }
  const [settings, setSettings] = useState({ cupsPerDay: 8, mlPerCup: 300 })
  const [loading, setLoading] = useState(true)

  // 加载数据和设置
  const load = useCallback(async () => {
    const [log, cupsPerDay, mlPerCup] = await Promise.all([
      getWaterLog(today),
      getSetting('waterCupsPerDay'),
      getSetting('waterMlPerCup'),
    ])
    const s = {
      cupsPerDay: cupsPerDay || 8,
      mlPerCup: mlPerCup || 300,
    }
    setSettings(s)
    setTodayLog(log || { cups: 0, ml: 0, targetMl: s.cupsPerDay * s.mlPerCup })
    setLoading(false)
  }, [today])

  useEffect(() => { load() }, [load])

  // 记录喝水（累加模式）
  const recordDrink = useCallback(async (cups) => {
    const targetMl = settings.cupsPerDay * settings.mlPerCup
    const ml = Math.round(cups * settings.mlPerCup)
    await saveWaterLog({ date: today, cups, ml, targetMl })
    await load() // 重新加载
  }, [today, settings, load])

  // 更新设置
  const updateSettings = useCallback(async (key, value) => {
    await setSetting(key, value)
    await load()
  }, [load])

  const targetMl = settings.cupsPerDay * settings.mlPerCup
  const currentMl = todayLog?.ml || 0
  const currentCups = todayLog?.cups || 0
  const targetCups = settings.cupsPerDay
  const progress = targetMl > 0 ? Math.min(currentMl / targetMl, 1) : 0

  return {
    currentMl,
    currentCups,
    targetMl,
    targetCups,
    progress,
    settings,
    loading,
    recordDrink,
    updateSettings,
    refresh: load,
  }
}
