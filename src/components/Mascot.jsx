import { useState, useCallback, useRef, useEffect } from 'react'
import { getMoodLevel } from '../hooks/useMood'
import MoodBubble from './MoodBubble'

/**
 * 懒懒 — 透明视频版 mascot
 * 使用 ffmpeg colorkey 预处理的 WebM（带 alpha 透明通道）
 * 无需 Canvas 实时抠图，性能最佳
 *
 * 互动随机池：
 * - 40% 挥手 👋
 * - 25% 吠叫 🐶
 * - 20% 舔屏 👅
 * - 15% 接飞盘 🥏
 */

const INTERACTIONS = [
  { type: 'wave',  weight: 50, emoji: '👋', messages: ['嗨嗨~', '你好呀！', '今天也要开心哦~', '懒懒打招呼~'] },
  { type: 'bark',  weight: 30, emoji: '🐶', messages: ['汪！汪汪！', '懒懒在叫你啦~', '汪汪~你好！', '汪！'] },
  { type: 'catch', weight: 20, emoji: '🥏', messages: ['接住！', '飞盘来啦~', '嘿！好身手~', '嗖~'] },
]

function pickInteraction() {
  const total = INTERACTIONS.reduce((sum, a) => sum + a.weight, 0)
  let roll = Math.random() * total
  for (const action of INTERACTIONS) {
    roll -= action.weight
    if (roll <= 0) return action
  }
  return INTERACTIONS[0]
}

export default function Mascot({ mood = 50, onInteract }) {
  const videoRef = useRef(null)
  const [bubble, setBubble] = useState(null)
  const [isBouncing, setIsBouncing] = useState(false)
  const bounceTimerRef = useRef(null)
  const bubbleTimerRef = useRef(null)
  const moodData = getMoodLevel(mood)

  // 视频循环播放
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.loop = true
    video.muted = true
    video.playsInline = true
    video.play().catch(() => {})
  }, [])

  // 清理
  useEffect(() => {
    return () => {
      if (bounceTimerRef.current) clearTimeout(bounceTimerRef.current)
      if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current)
    }
  }, [])

  const handleTap = useCallback(() => {
    if (isBouncing) return

    const interaction = pickInteraction()
    const msg = interaction.messages[Math.floor(Math.random() * interaction.messages.length)]

    setBubble({ emoji: interaction.emoji, message: msg })
    setIsBouncing(true)
    onInteract?.()

    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current)
    if (bounceTimerRef.current) clearTimeout(bounceTimerRef.current)

    bubbleTimerRef.current = setTimeout(() => setBubble(null), 2500)
    bounceTimerRef.current = setTimeout(() => setIsBouncing(false), 700)
  }, [isBouncing, onInteract])

  return (
    <div className="relative inline-flex flex-col items-center select-none">
      {/* 可点击区域 */}
      <div
        className="cursor-pointer"
        onClick={handleTap}
        style={{
          animation: isBouncing
            ? 'lazy-bounce-keyframes 0.7s cubic-bezier(0.28, 0.84, 0.42, 1)'
            : 'none',
        }}
      >
        {/* 透明 WebM — 原生 alpha 通道，无需 Canvas */}
        <video
          ref={videoRef}
          src={import.meta.env.BASE_URL + 'videos/lazy-transparent.webm'}
          muted
          playsInline
          loop
          autoPlay
          width={720}
          height={1020}
          style={{
            width: '100%',
            maxWidth: 180,
            height: 'auto',
            aspectRatio: '720 / 1020',
            filter: 'drop-shadow(0 12px 28px rgba(0,0,0,0.18))',
          }}
        />
      </div>

      {/* 操作提示 */}
      <p className="text-[10px] text-gray-400 mt-0.5 tracking-wide">
        👆 戳戳懒懒互动~
      </p>

      {/* 心情仪表 */}
      <div
        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm"
        style={{
          background: 'linear-gradient(135deg, #E8F4FD, #D6EAF8)',
          color: '#1C74B3',
          border: '1.5px solid rgba(91,155,213,0.3)',
        }}
      >
        <span className="text-sm">{moodData.emojis[0]}</span>
        <span>心情 {mood} · {moodData.level}</span>
      </div>

      {/* 表情气泡 */}
      {bubble && (
        <MoodBubble emoji={bubble.emoji} message={bubble.message} />
      )}
    </div>
  )
}
