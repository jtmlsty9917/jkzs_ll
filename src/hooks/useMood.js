import { useState, useEffect, useCallback } from 'react'
import { getWaterLog, getExerciseLog, getDiaryEntry, getAllTodos } from '../db'

/**
 * 心情值计算 Hook
 * 根据今日喝水、锻炼、日记、待办完成情况计算心情值
 */
export function useMood(today) {
  const [mood, setMood] = useState(50)

  const calcMood = useCallback(async () => {
    let score = 50 // 基础分

    // 获取所有数据（并发）
    const [waterLog, exerciseLog, diaryEntry, todos] = await Promise.all([
      getWaterLog(today),
      getExerciseLog(today),
      getDiaryEntry(today),
      getAllTodos(),
    ])

    // 喝水贡献 (0-15分)
    if (waterLog && waterLog.targetMl > 0) {
      const ratio = Math.min(waterLog.ml / waterLog.targetMl, 1)
      score += Math.round(ratio * 15)
    }

    // 锻炼贡献 (0-15分)
    if (exerciseLog && exerciseLog.length > 0) {
      score += 15
    }

    // 日记贡献 (0-10分)
    if (diaryEntry && (diaryEntry.content || (diaryEntry.photos && diaryEntry.photos.length > 0))) {
      score += 10
    }

    // 待办贡献 (0-10分)
    const todayTodos = todos.filter(t => t.dueDate === today)
    const completedToday = todayTodos.filter(t => t.completed).length
    if (todayTodos.length > 0) {
      score += Math.round((completedToday / todayTodos.length) * 10)
    }

    // 连续达标天数 * 2（上限 10，简化处理）
    let streak = 0
    if (waterLog && waterLog.ml >= waterLog.targetMl) streak++
    if (exerciseLog && exerciseLog.length > 0) streak++
    if (diaryEntry) streak++
    if (completedToday > 0) streak++
    score += Math.min(streak * 2, 10)

    // 截断到 0-100
    setMood(Math.max(0, Math.min(100, Math.round(score))))
  }, [today])

  useEffect(() => {
    calcMood()
  }, [calcMood])

  return { mood, refresh: calcMood }
}

/** 根据心情值返回表情池和等级 */
export function getMoodLevel(score) {
  if (score <= 30) {
    return {
      level: '需要贴贴小狗',
      emojis: ['😔', '😞', '😢', '💧'],
      message: '今天好像没什么精神呢...来贴贴懒懒吧！🐶',
    }
  }
  if (score <= 60) {
    return {
      level: '平平无奇',
      emojis: ['😊', '🙂', '👋', '💪'],
      message: '平平淡淡才是真，但懒懒觉得你还可以更棒~',
    }
  }
  if (score <= 85) {
    return {
      level: '元气满满',
      emojis: ['😄', '😆', '🤗', '✨'],
      message: '今天状态不错！懒懒为你摇尾巴~',
    }
  }
  return {
    level: '快乐爆棚',
    emojis: ['🥰', '😍', '🎉', '⭐', '🌟'],
    message: '满分选手！懒懒疯狂转圈圈！🎉',
  }
}
