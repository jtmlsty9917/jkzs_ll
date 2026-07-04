import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Mascot from '../components/Mascot'
import { WaterIcon, ExerciseIcon, DiaryIcon, TodoIcon } from '../components/CardIcons'
import { useMood } from '../hooks/useMood'

const TODAY = new Date().toISOString().split('T')[0]

export default function Home() {
  const navigate = useNavigate()
  const { mood, refresh } = useMood(TODAY)
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 6) setGreeting('夜深了 🌙')
    else if (hour < 9) setGreeting('早上好 ☀️')
    else if (hour < 12) setGreeting('上午好 🌤️')
    else if (hour < 14) setGreeting('中午好 🌞')
    else if (hour < 18) setGreeting('下午好 🌈')
    else setGreeting('晚上好 🌙')
  }, [])

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden"
         style={{ background: 'linear-gradient(180deg, #F8FBFF 0%, #FAFAFA 30%, #FFF8F0 100%)' }}>
      {/* 装饰元素 */}
      <DecoDots />

      <div className="relative z-10 px-4 pt-3">
        {/* 顶部问候 — 缩小 */}
        <div className="flex items-center justify-between mb-0.5">
          <div>
            <h1 className="text-sm font-bold text-gray-400 tracking-wide">{greeting}</h1>
            <p className="text-xl font-extrabold text-gray-800 mt-0.5">
              懒懒健康助手
            </p>
          </div>
          {/* 日期徽章 */}
          <div className="bg-white/80 backdrop-blur rounded-2xl px-3 py-1.5 shadow-sm border border-gray-100">
            <p className="text-xl font-bold text-water text-center leading-none">
              {new Date().getDate()}
            </p>
            <p className="text-[10px] text-gray-400 text-center mt-0.5">
              {new Date().getMonth() + 1}月
            </p>
          </div>
        </div>

        {/* 懒懒核心区 — 毛玻璃 + 浮动装饰 */}
        <div className="relative mt-1 mb-3">
          {/* 背景装饰圆 — 缩小 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full"
               style={{ background: 'radial-gradient(circle, rgba(91,155,213,0.06) 0%, transparent 70%)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full"
               style={{ background: 'radial-gradient(circle, rgba(126,200,160,0.05) 0%, transparent 70%)' }} />

          {/* 浮动装饰动画 */}
          <FloatingOrnaments />

          {/* 毛玻璃卡片容器 — 替代原来白框 */}
          <div className="mx-auto flex justify-center rounded-3xl py-3 px-1
                          bg-white/10 backdrop-blur-[8px]"
               style={{
                 maxWidth: '260px',
                 border: '1px solid rgba(255,255,255,0.3)',
                 boxShadow: [
                   '0 8px 32px rgba(91,155,213,0.06)',
                   '0 2px 8px rgba(0,0,0,0.04)',
                   'inset 0 1px 0 rgba(255,255,255,0.4)',
                 ].join(', '),
               }}>
            <Mascot mood={mood} onInteract={refresh} />
          </div>
        </div>

        {/* 功能卡片 — 2x2 网格 */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <CuteCard
            icon={<WaterIcon />}
            title="喝水监督员"
            subtitle="每日灌水打卡"
            accent="#5B9BD5"
            accentLight="#D6EAF8"
            onClick={() => navigate('/water')}
          />
          <CuteCard
            icon={<ExerciseIcon />}
            title="运动监督员"
            subtitle="出门遛弯打卡"
            accent="#4CAF50"
            accentLight="#C8E6C9"
            onClick={() => navigate('/calendar')}
          />
          <CuteCard
            icon={<DiaryIcon />}
            title="生活小相册"
            subtitle="日记 + 碎碎念照片"
            accent="#E91E63"
            accentLight="#F8BBD0"
            onClick={() => navigate('/calendar')}
          />
          <CuteCard
            icon={<TodoIcon />}
            title="懒懒待办小本本"
            subtitle="小狗准时提醒你"
            accent="#FF9800"
            accentLight="#FFE0B2"
            onClick={() => navigate('/todo')}
          />
        </div>

        {/* 底部留白 */}
        <div className="h-4" />
      </div>
    </div>
  )
}

/** 毛玻璃风格功能卡片 — Glassmorphism */
function CuteCard({ icon, title, subtitle, accent, accentLight, onClick }) {
  return (
    <div
      onClick={onClick}
      className="relative overflow-hidden rounded-2xl p-3 cursor-pointer tap-active group
                 bg-white/15 backdrop-blur-[12px]"
      style={{
        border: '1px solid rgba(255,255,255,0.35)',
        boxShadow: [
          '0 8px 32px rgba(0,0,0,0.06)',
          '0 2px 8px rgba(0,0,0,0.04)',
          'inset 0 1px 0 rgba(255,255,255,0.5)',
          'inset 0 -1px 0 rgba(255,255,255,0.1)',
        ].join(', '),
      }}
    >
      {/* 玻璃内层高光 — 模拟多层堆叠 */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none"
           style={{
             background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 50%, rgba(255,255,255,0.08) 100%)',
           }} />

      {/* 右上角色块装饰 — 透过毛玻璃可见 */}
      <div className="absolute -top-4 -right-4 w-18 h-18 rounded-full opacity-20 blur-sm"
           style={{ background: accent }} />

      {/* 左下角色块装饰 — 叠层 */}
      <div className="absolute -bottom-3 -left-3 w-12 h-12 rounded-full opacity-10 blur-sm"
           style={{ background: accent }} />

      {/* SVG 图标 — 跨平台一致 */}
      <div className="mb-1.5 relative z-10 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>

      {/* 标题 */}
      <h3 className="text-sm font-bold text-gray-800 mb-0.5 relative z-10">{title}</h3>

      {/* 副标题 */}
      <p className="text-[11px] text-gray-500 relative z-10">{subtitle}</p>

      {/* 底部发光色条 */}
      <div className="mt-3 h-1 rounded-full relative z-10"
           style={{
             background: `linear-gradient(90deg, ${accent}, transparent)`,
             width: '45%',
             opacity: 0.5,
             boxShadow: `0 0 6px ${accent}40`,
           }} />
    </div>
  )
}

/** 懒懒周围浮动装饰动画 */
function FloatingOrnaments() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* ✨ 浮动星光 — 左上 */}
      <span className="absolute text-lg opacity-0"
        style={{
          top: '8%', left: '10%',
          animation: 'float-sparkle 3s ease-in-out infinite',
        }}>✨</span>
      {/* ✨ 浮动星光 — 右上 */}
      <span className="absolute text-sm opacity-0"
        style={{
          top: '15%', right: '12%',
          animation: 'float-sparkle 3.5s ease-in-out 0.8s infinite',
        }}>⭐</span>
      {/* ✨ 浮动星光 — 右下 */}
      <span className="absolute text-base opacity-0"
        style={{
          bottom: '18%', right: '15%',
          animation: 'float-sparkle 4s ease-in-out 1.5s infinite',
        }}>✨</span>
      {/* 🐾 漂浮爪印 — 左下 */}
      <span className="absolute text-xs opacity-0"
        style={{
          bottom: '22%', left: '12%',
          animation: 'float-sparkle 3.8s ease-in-out 0.5s infinite',
        }}>🐾</span>
      {/* 💫 光点 — 中上 */}
      <span className="absolute opacity-0 w-2 h-2 rounded-full"
        style={{
          top: '5%', left: '45%',
          background: '#FFD700',
          animation: 'float-dot 3s ease-in-out 1s infinite',
        }} />
      {/* 💫 光点 — 中右 */}
      <span className="absolute opacity-0 w-1.5 h-1.5 rounded-full"
        style={{
          top: '40%', right: '5%',
          background: '#5B9BD5',
          animation: 'float-dot 3.5s ease-in-out 2s infinite',
        }} />
      {/* 💫 光点 — 中下左 */}
      <span className="absolute opacity-0 w-1.5 h-1.5 rounded-full"
        style={{
          bottom: '10%', left: '20%',
          background: '#FF9800',
          animation: 'float-dot 2.8s ease-in-out 0.3s infinite',
        }} />
    </div>
  )
}

/** 背景装饰圆点 */
function DecoDots() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* 大圆 */}
      <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-[0.03]"
           style={{ background: '#5B9BD5' }} />
      <div className="absolute top-1/4 -right-32 w-80 h-80 rounded-full opacity-[0.03]"
           style={{ background: '#FF9800' }} />
      <div className="absolute bottom-1/3 -left-16 w-48 h-48 rounded-full opacity-[0.04]"
           style={{ background: '#E91E63' }} />

      {/* 小装饰点 */}
      <div className="absolute top-[15%] right-[10%] w-1.5 h-1.5 rounded-full bg-water opacity-20" />
      <div className="absolute top-[25%] right-[20%] w-1 h-1 rounded-full bg-todo opacity-15" />
      <div className="absolute top-[40%] left-[8%] w-1 h-1 rounded-full bg-diary opacity-20" />
      <div className="absolute bottom-[30%] right-[15%] w-1.5 h-1.5 rounded-full bg-exercise opacity-15" />
    </div>
  )
}
