import { useState, useEffect, useRef, useCallback } from 'react'
import { useTodo } from '../hooks/useTodo'

const TODAY = new Date().toISOString().split('T')[0]

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.frequency.setValueAtTime(800, ctx.currentTime)
    osc.frequency.setValueAtTime(1000, ctx.currentTime + 0.1)
    osc.frequency.setValueAtTime(800, ctx.currentTime + 0.2)
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.5)
  } catch (e) { /* 忽略 */ }
}

export default function Todo() {
  const { todos, loading, add, toggle, remove } = useTodo()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState(TODAY)
  const [dueTime, setDueTime] = useState('20:00')
  const [reminder, setReminder] = useState(null)
  const reminderTimer = useRef(null)

  // 定时检查提醒
  useEffect(() => {
    const check = () => {
      const now = new Date()
      const nt = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
      const nd = now.toISOString().split('T')[0]
      for (const t of todos) {
        if (!t.completed && t.dueDate === nd && t.dueTime === nt) {
          setReminder({ id: t.id, title: t.title })
          playBeep()
          setTimeout(() => setReminder(null), 10000)
          break
        }
      }
    }
    reminderTimer.current = setInterval(check, 30000)
    return () => clearInterval(reminderTimer.current)
  }, [todos])

  const isOverdue = useCallback((todo) => {
    if (todo.completed) return false
    return new Date(todo.dueDate + 'T' + todo.dueTime) < new Date()
  }, [])

  const handleAdd = async () => {
    if (!title.trim()) return
    await add({ title: title.trim(), dueDate, dueTime })
    setTitle(''); setDueDate(TODAY); setDueTime('20:00'); setShowForm(false)
  }

  const handleDelete = async (id) => {
    if (window.confirm('确定删除吗？')) await remove(id)
  }

  const sorted = [...todos].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    const ao = isOverdue(a) ? 0 : 1
    const bo = isOverdue(b) ? 0 : 1
    if (ao !== bo) return ao - bo
    return (a.dueDate + a.dueTime).localeCompare(b.dueDate + b.dueTime)
  })

  const pendingCount = todos.filter(t => !t.completed).length
  const overdueCount = todos.filter(t => isOverdue(t)).length

  if (loading) {
    return <div className="flex justify-center py-20"><p className="text-gray-400">加载中...</p></div>
  }

  return (
    <div className="pb-20 relative" style={{ background: 'linear-gradient(180deg, #FFF8F0 0%, #FAFAFA 30%, #FAFAFA 100%)' }}>
      <div className="px-4 pt-6">
        {/* 顶部 */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-todo inline-block" />
              待办事项
            </h1>
            <div className="flex gap-2 mt-1.5">
              {pendingCount > 0 && (
                <span className="text-xs font-semibold bg-orange-50 text-todo px-2.5 py-0.5 rounded-full">
                  {pendingCount} 项待完成
                </span>
              )}
              {overdueCount > 0 && (
                <span className="text-xs font-semibold bg-red-50 text-red-500 px-2.5 py-0.5 rounded-full animate-pulse">
                  {overdueCount} 项逾期
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-todo text-white w-12 h-12 rounded-full text-2xl flex items-center justify-center shadow-lg tap-active hover:shadow-xl transition-all"
            style={{ boxShadow: '0 4px 16px rgba(255,152,0,0.3)' }}
          >
            +
          </button>
        </div>

        {/* 提醒弹窗 */}
        {reminder && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-pop-in text-center">
              <div className="text-6xl mb-3">🐶</div>
              <p className="text-gray-500 text-sm mb-1">懒懒提醒你~</p>
              <p className="text-lg font-bold text-gray-800 mb-1">{reminder.title}</p>
              <p className="text-sm text-todo font-semibold mb-4">⏰ 时间到了！</p>
              <button
                onClick={() => setReminder(null)}
                className="bg-todo text-white px-10 py-3 rounded-full font-bold tap-active shadow-lg"
              >
                知道啦~
              </button>
            </div>
          </div>
        )}

        {/* 待办列表 */}
        {sorted.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-gray-400 font-medium">还没有待办事项</p>
            <p className="text-sm text-gray-300 mt-1">点击右上角 + 添加第一个吧~</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-6 bg-todo/10 text-todo px-6 py-2.5 rounded-full font-semibold text-sm tap-active"
            >
              ✨ 创建待办
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {sorted.map(todo => {
              const overdue = isOverdue(todo)
              return (
                <div
                  key={todo.id}
                  className={`bg-white rounded-2xl p-4 flex items-center gap-3 transition-all group tap-active
                    ${overdue ? 'ring-2 ring-red-200 shadow-md' : 'shadow-sm'}
                    ${todo.completed ? 'opacity-40' : ''}`}
                  style={{ border: overdue ? '1.5px solid #FCA5A5' : '1px solid transparent' }}
                >
                  {/* 勾选框 */}
                  <button
                    onClick={() => toggle(todo.id)}
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      todo.completed
                        ? 'bg-todo border-todo text-white'
                        : overdue
                        ? 'border-red-300 hover:border-red-400'
                        : 'border-gray-300 hover:border-todo'
                    }`}
                  >
                    {todo.completed && <span className="text-xs font-bold">✓</span>}
                  </button>

                  {/* 内容 */}
                  <div className="flex-1 min-w-0" onClick={() => toggle(todo.id)}>
                    <p className={`text-sm font-semibold truncate ${
                      todo.completed ? 'text-gray-400 line-through' : overdue ? 'text-red-600' : 'text-gray-800'
                    }`}>
                      {todo.title}
                    </p>
                    <p className="text-xs mt-0.5 text-gray-400">
                      📅 {todo.dueDate}
                      {overdue && <span className="text-red-400 font-bold ml-1.5">逾期</span>}
                    </p>
                  </div>

                  {/* 时间 */}
                  <span className={`text-xs font-bold flex-shrink-0 px-2 py-1 rounded-full ${
                    todo.completed
                      ? 'bg-gray-50 text-gray-300'
                      : overdue
                      ? 'bg-red-50 text-red-500'
                      : 'bg-orange-50 text-todo'
                  }`}>
                    ⏰ {todo.dueTime}
                  </span>

                  {/* 删除 */}
                  <button
                    onClick={() => handleDelete(todo.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all text-sm tap-active flex-shrink-0"
                  >
                    🗑️
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 添加表单 */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-end justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-t-3xl p-6 w-full max-w-app animate-fade-up" onClick={e => e.stopPropagation()}
               style={{ boxShadow: '0 -8px 32px rgba(0,0,0,0.08)' }}>
            <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
              <span>📝</span> 新建待办
            </h3>

            <label className="text-sm font-semibold text-gray-600 mb-1.5 block">事项内容</label>
            <input type="text" placeholder="要做什么？" value={title}
                   onChange={e => setTitle(e.target.value)} autoFocus
                   className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3.5 text-sm mb-4
                            focus:outline-none focus:border-todo transition-colors bg-gray-50" />

            <div className="flex gap-3 mb-5">
              <div className="flex-1">
                <label className="text-sm font-semibold text-gray-600 mb-1.5 block">日期</label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                       className="w-full border-2 border-gray-100 rounded-2xl px-3 py-3.5 text-sm
                                focus:outline-none focus:border-todo transition-colors bg-gray-50" />
              </div>
              <div className="flex-1">
                <label className="text-sm font-semibold text-gray-600 mb-1.5 block">时间</label>
                <input type="time" value={dueTime} onChange={e => setDueTime(e.target.value)}
                       className="w-full border-2 border-gray-100 rounded-2xl px-3 py-3.5 text-sm
                                focus:outline-none focus:border-todo transition-colors bg-gray-50" />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowForm(false)}
                      className="flex-1 bg-gray-100 text-gray-600 py-3.5 rounded-full font-semibold tap-active hover:bg-gray-200 transition-colors">
                取消
              </button>
              <button onClick={handleAdd} disabled={!title.trim()}
                      className="flex-1 bg-todo text-white py-3.5 rounded-full font-bold tap-active disabled:opacity-40 transition-all shadow-lg"
                      style={{ boxShadow: title.trim() ? '0 4px 16px rgba(255,152,0,0.3)' : 'none' }}>
                ✨ 添加待办
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
