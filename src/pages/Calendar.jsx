import { useState, useEffect, useCallback } from 'react'
import DiaryEditor from '../components/diary/DiaryEditor'
import {
  getWaterLogsByRange,
  getExerciseLogsByRange,
  getDiaryEntriesByRange,
  addExerciseLog,
  deleteExerciseLog,
} from '../db'
import { EXERCISE_TYPES } from '../hooks/useExercise'

/**
 * 根据喝水量返回热力等级 0-5
 */
function getHeatLevel(waterLog) {
  if (!waterLog || waterLog.ml === 0) return 0
  if (waterLog.targetMl <= 0) return 0
  const ratio = waterLog.ml / waterLog.targetMl
  if (ratio >= 1) return 5
  if (ratio >= 0.75) return 4
  if (ratio >= 0.5) return 3
  if (ratio >= 0.25) return 2
  return 1
}

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日']

export default function Calendar() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth()) // 0-indexed
  const today = now.getDate()
  const todayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(today).padStart(2, '0')}`

  const [waterData, setWaterData] = useState({})   // { '2026-06-01': { ml, targetMl }, ... }
  const [exerciseData, setExerciseData] = useState({}) // { '2026-06-01': [{ type, id }], ... }
  const [diaryData, setDiaryData] = useState({})   // { '2026-06-01': { photos, content }, ... }

  const [viewMode, setViewMode] = useState('activity') // 'activity' | 'photo'
  const [selectedDate, setSelectedDate] = useState(null) // 选中的日期，用于查看详情
  const [showExercisePicker, setShowExercisePicker] = useState(null) // 运动选择弹窗对应的日期
  const [loading, setLoading] = useState(true)

  // 加载当月数据
  const loadData = useCallback(async () => {
    setLoading(true)
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`

    const [water, exercise, diary] = await Promise.all([
      getWaterLogsByRange(startDate, endDate),
      getExerciseLogsByRange(startDate, endDate),
      getDiaryEntriesByRange(startDate, endDate),
    ])

    // 转为按日期索引的对象
    const wMap = {}
    water.forEach(w => { wMap[w.date] = w })
    setWaterData(wMap)

    const eMap = {}
    exercise.forEach(e => {
      if (!eMap[e.date]) eMap[e.date] = []
      eMap[e.date].push(e)
    })
    setExerciseData(eMap)

    const dMap = {}
    diary.forEach(d => { dMap[d.date] = d })
    setDiaryData(dMap)

    setLoading(false)
  }, [year, month])

  useEffect(() => { loadData() }, [loadData])

  // 月份导航
  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
    setSelectedDate(null)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
    setSelectedDate(null)
  }

  // 记录运动
  const handleRecordExercise = async (date, type) => {
    await addExerciseLog({ date, type, duration: 0 })
    setShowExercisePicker(null)
    await loadData()
  }

  // 删除运动
  const handleDeleteExercise = async (id) => {
    await deleteExerciseLog(id)
    await loadData()
  }

  // 生成日历
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

  const formatDate = (day) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  const monthNames = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']

  return (
    <div className="px-4 pt-6 pb-20">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">📅 日历</h1>

      {/* 视图切换 */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setViewMode('activity')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all tap-active ${
            viewMode === 'activity' ? 'bg-water text-white shadow-sm' : 'bg-white text-gray-500'
          }`}
        >
          🏊 活动视图
        </button>
        <button
          onClick={() => setViewMode('photo')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all tap-active ${
            viewMode === 'photo' ? 'bg-diary text-white shadow-sm' : 'bg-white text-gray-500'
          }`}
        >
          📸 照片视图
        </button>
      </div>

      {/* 月历 */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
        {/* 月份导航 */}
        <div className="flex justify-between items-center mb-4">
          <button onClick={prevMonth} className="text-gray-400 text-lg px-2 tap-active hover:text-gray-600">◀</button>
          <h2 className="text-lg font-semibold text-gray-800">{year}年 {monthNames[month]}</h2>
          <button onClick={nextMonth} className="text-gray-400 text-lg px-2 tap-active hover:text-gray-600">▶</button>
        </div>

        {/* 星期标题 */}
        <div className="grid grid-cols-7 gap-1.5 text-center mb-2">
          {WEEKDAYS.map(d => (
            <div key={d} className="text-xs text-gray-400 py-1">{d}</div>
          ))}
        </div>

        {/* 日期格子 */}
        <div className="grid grid-cols-7 gap-1.5">
          {/* 前置空白 */}
          {Array.from({ length: startOffset }, (_, i) => (
            <div key={`e-${i}`} />
          ))}

          {/* 日期 */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1
            const dateStr = formatDate(day)
            const isToday = dateStr === todayStr
            const isFutureDate = dateStr > todayStr

            const heat = isFutureDate ? -1 : getHeatLevel(waterData[dateStr])
            const exercises = exerciseData[dateStr] || []
            const diary = diaryData[dateStr]
            const hasPhoto = diary?.photos && diary.photos.length > 0
            const isSelected = selectedDate === dateStr

            return (
              <div
                key={day}
                onClick={() => !isFutureDate && dateStr <= todayStr && setSelectedDate(isSelected ? null : dateStr)}
                className={`aspect-square rounded-lg flex flex-col items-center justify-between p-0.5 relative cursor-pointer transition-all tap-active ${
                  isFutureDate
                    ? 'bg-gray-50 text-gray-300'
                    : heat === 0
                    ? 'bg-gray-50 text-gray-600'
                    : `heat-${heat} ${heat >= 3 ? 'text-white' : 'text-gray-700'}`
                } ${isToday ? 'ring-2 ring-water ring-offset-1' : ''}
                  ${isSelected ? 'ring-2 ring-todo ring-offset-1' : ''}
                  ${!isFutureDate && dateStr <= todayStr ? 'hover:brightness-95' : ''}
                `}
              >
                {/* 日期数字 */}
                <span className={`text-xs font-medium ${isToday ? 'font-bold' : ''}`}>
                  {day}
                </span>

                {/* 活动视图：运动图标 */}
                {!isFutureDate && viewMode === 'activity' && exercises.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-0.5 px-0.5">
                    {exercises.slice(0, 2).map((ex, j) => {
                      const typeInfo = EXERCISE_TYPES.find(t => t.key === ex.type)
                      return (
                        <span key={j} className="text-base leading-none" title={typeInfo?.label}>
                          {typeInfo?.icon || '🏃'}
                        </span>
                      )
                    })}
                    {exercises.length > 2 && (
                      <span className="text-[10px] leading-none text-gray-400 font-medium">+{exercises.length - 2}</span>
                    )}
                  </div>
                )}

                {/* 照片视图：照片缩略图 */}
                {!isFutureDate && viewMode === 'photo' && hasPhoto && (
                  <div className="w-full flex-1 min-h-0 overflow-hidden rounded-md">
                    <img
                      src={diary.photos[0]}
                      alt=""
                      className="w-full h-full object-cover rounded-md"
                      style={{ minHeight: '20px' }}
                    />
                  </div>
                )}
                {!isFutureDate && viewMode === 'photo' && diary?.content && !hasPhoto && (
                  <span className="text-[10px] text-gray-400 truncate w-full text-center px-0.5">
                    📝
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 热力图图例 */}
      <div className="bg-white rounded-2xl shadow-sm p-3 mb-4">
        <div className="flex items-center justify-center gap-1">
          <span className="text-xs text-gray-400 mr-1">少</span>
          {[0, 1, 2, 3, 4, 5].map(level => (
            <div key={level} className={`w-5 h-5 rounded ${level === 0 ? 'bg-gray-50 border border-gray-200' : `heat-${level}`}`} />
          ))}
          <span className="text-xs text-gray-400 ml-1">多（达标）</span>
        </div>
      </div>

      {/* 选中日期详情 — 顺序：运动记录 → 照片 → 日记 */}
      {selectedDate && (
        <div className="animate-fade-up space-y-3">
          {/* 1. 当日运动记录 */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-700">🏊 {selectedDate} 运动记录</h3>
              <button
                onClick={() => setShowExercisePicker(selectedDate)}
                className="text-xs bg-exercise text-white px-3 py-1.5 rounded-full tap-active"
              >
                + 添加
              </button>
            </div>

            {(!exerciseData[selectedDate] || exerciseData[selectedDate].length === 0) && (
              <p className="text-sm text-gray-400 text-center py-3">暂无运动记录</p>
            )}

            {exerciseData[selectedDate]?.map((ex) => {
              const typeInfo = EXERCISE_TYPES.find(t => t.key === ex.type)
              return (
                <div key={ex.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-700">
                    {typeInfo?.icon} {typeInfo?.label || ex.type}
                  </span>
                  <button
                    onClick={() => handleDeleteExercise(ex.id)}
                    className="text-xs text-gray-400 hover:text-red-400 tap-active"
                  >
                    🗑️
                  </button>
                </div>
              )
            })}
          </div>

          {/* 2+3. 照片 + 日记（DiaryEditor 内部已调整顺序） */}
          <DiaryEditor
            date={selectedDate}
            onClose={() => { setSelectedDate(null); loadData() }}
          />
        </div>
      )}

      {/* 运动选择弹窗 */}
      {showExercisePicker && (
        <div className="fixed inset-0 bg-black/30 flex items-end justify-center z-50" onClick={() => setShowExercisePicker(null)}>
          <div className="bg-white rounded-t-3xl p-6 w-full max-w-app max-h-[70vh] overflow-y-auto animate-fade-up" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">选择运动类型</h3>
            <div className="grid grid-cols-3 gap-3">
              {EXERCISE_TYPES.map(type => (
                <button
                  key={type.key}
                  onClick={() => handleRecordExercise(showExercisePicker, type.key)}
                  className="flex flex-col items-center gap-1 p-3 bg-gray-50 rounded-2xl hover:bg-exercise-light transition-colors tap-active"
                >
                  <span className="text-3xl">{type.icon}</span>
                  <span className="text-xs text-gray-600">{type.label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowExercisePicker(null)}
              className="w-full mt-4 bg-gray-100 text-gray-600 py-3 rounded-full font-medium tap-active"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
