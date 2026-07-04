import { useState, useEffect, useCallback } from 'react'
import { getDiaryEntry, saveDiaryEntry } from '../db'

/**
 * 日记数据 Hook
 */
export function useDiary(today) {
  const [entry, setEntry] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const e = await getDiaryEntry(today)
    setEntry(e || null)
    setLoading(false)
  }, [today])

  useEffect(() => { load() }, [load])

  const save = useCallback(async ({ content, photos }) => {
    await saveDiaryEntry({ date: today, content, photos })
    await load()
  }, [today, load])

  return { entry, loading, save, refresh: load }
}

/** 压缩图片到指定宽度（用于 base64 存储） */
export function compressImage(file, maxWidth = 800) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ratio = Math.min(1, maxWidth / img.width)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.7))
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
