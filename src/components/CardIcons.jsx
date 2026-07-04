/**
 * 功能卡片 SVG 图标
 * 替代 emoji，保证桌面端和手机端渲染完全一致
 * 每个图标带有渐变填充 + 高光 + 微投影，呈现立体感
 */

/* ===== 💧 水滴 ===== */
export function WaterIcon() {
  return (
    <svg viewBox="0 0 40 40" className="w-9 h-9" fill="none">
      <defs>
        <linearGradient id="w1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7EC8E3" />
          <stop offset="100%" stopColor="#5B9BD5" />
        </linearGradient>
        <filter id="ws" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#5B9BD5" floodOpacity="0.25" />
        </filter>
      </defs>
      {/* 水滴主体 */}
      <path
        d="M20 5C20 5 7 17 7 25a13 13 0 0 0 26 0C33 17 20 5 20 5z"
        fill="url(#w1)"
        filter="url(#ws)"
      />
      {/* 高光 */}
      <ellipse cx="15" cy="19" rx="4" ry="6" fill="white" opacity="0.35" transform="rotate(-25 15 19)" />
    </svg>
  )
}

/* ===== 🏊 运动 ===== */
export function ExerciseIcon() {
  return (
    <svg viewBox="0 0 40 40" className="w-9 h-9" fill="none">
      <defs>
        <linearGradient id="e1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#81C784" />
          <stop offset="100%" stopColor="#4CAF50" />
        </linearGradient>
        <filter id="es" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#4CAF50" floodOpacity="0.25" />
        </filter>
      </defs>
      {/* 哑铃主杆 */}
      <rect x="13" y="17" width="14" height="6" rx="3" fill="url(#e1)" filter="url(#es)" />
      {/* 左侧铃片 */}
      <rect x="4" y="13" width="9" height="14" rx="4" fill="url(#e1)" filter="url(#es)" />
      {/* 右侧铃片 */}
      <rect x="27" y="13" width="9" height="14" rx="4" fill="url(#e1)" filter="url(#es)" />
    </svg>
  )
}

/* ===== 📸 记录生活 ===== */
export function DiaryIcon() {
  return (
    <svg viewBox="0 0 40 40" className="w-9 h-9" fill="none">
      <defs>
        <linearGradient id="d1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F48FB1" />
          <stop offset="100%" stopColor="#E91E63" />
        </linearGradient>
        <filter id="ds" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#E91E63" floodOpacity="0.25" />
        </filter>
      </defs>
      {/* 相机机身 */}
      <rect x="7" y="13" width="26" height="18" rx="5" fill="url(#d1)" filter="url(#ds)" />
      {/* 镜头外圈 */}
      <circle cx="20" cy="22" r="7" fill="white" opacity="0.9" />
      {/* 镜头内圈 */}
      <circle cx="20" cy="22" r="4.5" fill="url(#d1)" />
      {/* 镜头反光 */}
      <circle cx="18" cy="20" r="1.5" fill="white" opacity="0.6" />
      {/* 闪光灯 */}
      <circle cx="28" cy="18" r="2" fill="white" opacity="0.5" />
    </svg>
  )
}

/* ===== ✅ 待办 ===== */
export function TodoIcon() {
  return (
    <svg viewBox="0 0 40 40" className="w-9 h-9" fill="none">
      <defs>
        <linearGradient id="t1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFB74D" />
          <stop offset="100%" stopColor="#FF9800" />
        </linearGradient>
        <filter id="ts" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#FF9800" floodOpacity="0.25" />
        </filter>
      </defs>
      {/* 剪贴板 */}
      <rect x="10" y="7" width="20" height="26" rx="4" fill="url(#t1)" filter="url(#ts)" />
      {/* 顶部夹子 */}
      <rect x="15" y="3" width="10" height="6" rx="2" fill="#E65100" opacity="0.3" filter="url(#ts)" />
      {/* 纸张区域 */}
      <rect x="13" y="15" width="14" height="1.5" rx="0.75" fill="white" opacity="0.5" />
      <rect x="13" y="20" width="10" height="1.5" rx="0.75" fill="white" opacity="0.5" />
      <rect x="13" y="25" width="8" height="1.5" rx="0.75" fill="white" opacity="0.5" />
      {/* ✅ 勾 */}
      <path d="M23 22l2.5 2.5 4-4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
    </svg>
  )
}

/** 根据类型返回对应图标组件 */
const iconMap = {
  water: WaterIcon,
  exercise: ExerciseIcon,
  diary: DiaryIcon,
  todo: TodoIcon,
}

export function getCardIcon(type) {
  const Icon = iconMap[type]
  return Icon ? <Icon /> : null
}
