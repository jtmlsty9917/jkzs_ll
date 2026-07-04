/**
 * 心情表情气泡（可爱版）
 * 点击懒懒后弹出，显示大表情 + 鼓励语
 */
export default function MoodBubble({ emoji = '😊', message = '今天也要加油哦~' }) {
  return (
    <div className="absolute -top-24 left-1/2 -translate-x-1/2 animate-pop-in z-10">
      <div
        className="bg-white rounded-3xl px-6 py-4 text-center whitespace-nowrap"
        style={{
          boxShadow: '0 10px 40px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.05)',
          border: '1.5px solid rgba(91,155,213,0.1)',
        }}
      >
        <div className="text-4xl mb-1.5">{emoji}</div>
        <p className="text-sm font-semibold text-gray-700">{message}</p>
      </div>
      {/* 对话三角 */}
      <div
        className="mx-auto w-0 h-0 border-l-[10px] border-r-[10px] border-t-[10px] border-l-transparent border-r-transparent"
        style={{ borderTopColor: 'white', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.06))' }}
      />
    </div>
  )
}
