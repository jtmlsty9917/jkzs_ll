import { useState } from 'react'
import { useWater } from '../hooks/useWater'
import { useMood } from '../hooks/useMood'
import Mascot from '../components/Mascot'

const TODAY = new Date().toISOString().split('T')[0]

export default function Water() {
  const { mood } = useMood(TODAY)
  const { currentMl, currentCups, targetMl, targetCups, progress, settings, recordDrink, updateSettings } = useWater(TODAY)
  const [cups, setCups] = useState(1)
  const [showSettings, setShowSettings] = useState(false)
  const [editCups, setEditCups] = useState(settings.cupsPerDay)
  const [editMl, setEditMl] = useState(settings.mlPerCup)

  const handleRecord = async () => {
    if (cups <= 0) return
    await recordDrink(cups)
    setCups(1)
  }

  const handleSaveSettings = async () => {
    await updateSettings('waterCupsPerDay', editCups)
    await updateSettings('waterMlPerCup', editMl)
    setShowSettings(false)
  }

  const progressPercent = Math.round(progress * 100)

  return (
    <div className="pb-20 relative" style={{ background: 'linear-gradient(180deg, #F0F7FD 0%, #FAFAFA 40%, #FAFAFA 100%)' }}>
      <div className="px-4 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-water inline-block" />
            监督喝水
          </h1>
          {/* 快捷设置入口 */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="bg-white/80 backdrop-blur rounded-full w-10 h-10 flex items-center justify-center shadow-sm tap-active text-gray-400 hover:text-water transition-colors"
          >
            ⚙️
          </button>
        </div>

        {/* 今日进度卡 */}
        <div className="relative overflow-hidden bg-white rounded-3xl shadow-sm p-6 mb-4 text-center"
             style={{ boxShadow: '0 8px 32px rgba(91,155,213,0.08), 0 2px 8px rgba(0,0,0,0.03)', border: '1.5px solid rgba(91,155,213,0.1)' }}>
          {/* 装饰水滴 */}
          <span className="absolute -top-3 -right-2 text-5xl opacity-10">💧</span>
          <span className="absolute bottom-2 left-3 text-3xl opacity-5">💧</span>

          <p className="text-sm text-gray-400 mb-1">今日喝水量</p>
          <div className="text-5xl font-extrabold text-water mb-1">
            {currentMl}<span className="text-lg text-gray-300 font-semibold ml-1">ml</span>
          </div>
          <p className="text-sm text-gray-400">目标 {targetMl}ml</p>

          {/* 进度条（圆角 + 渐变） */}
          <div className="mt-5 h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out relative"
              style={{
                width: `${Math.min(progressPercent, 100)}%`,
                background: progress >= 1
                  ? 'linear-gradient(90deg, #5B9BD5, #1C74B3)'
                  : 'linear-gradient(90deg, #AED6F1, #5B9BD5)',
              }}
            >
              {progressPercent > 15 && (
                <div className="absolute right-2 top-0.5 text-[10px] font-bold text-white">
                  {progressPercent}%
                </div>
              )}
            </div>
          </div>

          <p className="text-sm font-semibold text-gray-700 mt-3">
            🥤 {currentCups} / {targetCups} 杯
            {progress >= 1 && (
              <span className="ml-2 bg-exercise/10 text-exercise-deep text-xs px-2.5 py-0.5 rounded-full font-bold animate-pop-in">
                🎉 达标！
              </span>
            )}
          </p>
        </div>

        {/* 懒懒鼓励 */}
        {progress >= 1 && (
          <div className="text-center mb-4 animate-fade-up">
            <div className="inline-block bg-white rounded-2xl px-4 py-2 shadow-sm border border-water/20">
              <span className="text-sm text-water-deep font-medium">🐶 懒懒：今天水喝够了，你真棒！</span>
            </div>
          </div>
        )}

        {/* 记录喝水卡 */}
        <div className="bg-white rounded-3xl shadow-sm p-5 mb-4"
             style={{ border: '1.5px solid rgba(91,155,213,0.08)' }}>
          <p className="text-sm font-semibold text-gray-700 mb-4 text-center">💧 记录喝水</p>

          {/* 快捷按钮 */}
          <div className="flex gap-2 justify-center mb-4 flex-wrap">
            {[0.5, 1, 1.5, 2, 3, 5].map(val => (
              <button
                key={val}
                onClick={() => setCups(val)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 tap-active ${
                  cups === val
                    ? 'bg-water text-white shadow-md scale-105'
                    : 'bg-water/5 text-water-deep hover:bg-water/10'
                }`}
              >
                {val}杯
              </button>
            ))}
          </div>

          {/* 精确调节 */}
          <div className="flex items-center justify-center gap-5 mb-4">
            <button onClick={() => setCups(c => Math.max(0, +(c - 0.5).toFixed(1)))}
                    className="w-10 h-10 bg-gray-100 rounded-full text-gray-500 text-lg font-bold tap-active hover:bg-gray-200 transition-colors">
              −
            </button>
            <span className="text-4xl font-extrabold text-water min-w-[90px] text-center">
              {cups}
              <span className="text-base text-gray-300 font-semibold ml-1">杯</span>
            </span>
            <button onClick={() => setCups(c => Math.min(10, +(c + 0.5).toFixed(1)))}
                    className="w-10 h-10 bg-gray-100 rounded-full text-gray-500 text-lg font-bold tap-active hover:bg-gray-200 transition-colors">
              +
            </button>
          </div>

          <button
            onClick={handleRecord}
            disabled={cups <= 0}
            className="w-full bg-water text-white py-3.5 rounded-full font-bold text-base tap-active disabled:opacity-40 transition-all hover:shadow-lg"
            style={{ boxShadow: cups > 0 ? '0 4px 16px rgba(91,155,213,0.3)' : 'none' }}
          >
            🥤 记录喝水 · +{Math.round(cups * settings.mlPerCup)}ml
          </button>
        </div>

        {/* 设置面板 */}
        <div className={`bg-white rounded-3xl shadow-sm overflow-hidden transition-all duration-300 ${showSettings ? 'mb-4' : ''}`}
             style={{ border: showSettings ? '1.5px solid rgba(91,155,213,0.15)' : '1px solid transparent' }}>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full p-4 flex items-center justify-between tap-active"
          >
            <span className="text-sm font-semibold text-gray-700">⚙️ 喝水设置</span>
            <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
              每日 {settings.cupsPerDay}杯 × {settings.mlPerCup}ml {showSettings ? '▲' : '▼'}
            </span>
          </button>

          {showSettings && (
            <div className="px-4 pb-5 border-t border-gray-50 pt-4 animate-fade-up">
              <div className="mb-5">
                <label className="text-sm font-semibold text-gray-600 block mb-3">每日目标杯数</label>
                <div className="flex items-center justify-center gap-4">
                  <button onClick={() => setEditCups(c => Math.max(1, c - 1))}
                          className="w-9 h-9 bg-gray-100 rounded-full text-gray-500 text-lg tap-active hover:bg-gray-200">−</button>
                  <span className="text-3xl font-extrabold text-gray-800 min-w-[50px] text-center">{editCups}</span>
                  <button onClick={() => setEditCups(c => Math.min(20, c + 1))}
                          className="w-9 h-9 bg-gray-100 rounded-full text-gray-500 text-lg tap-active hover:bg-gray-200">+</button>
                </div>
              </div>
              <div className="mb-5">
                <label className="text-sm font-semibold text-gray-600 block mb-3">每杯毫升数</label>
                <div className="flex items-center justify-center gap-4">
                  <button onClick={() => setEditMl(m => Math.max(50, m - 50))}
                          className="w-9 h-9 bg-gray-100 rounded-full text-gray-500 text-lg tap-active hover:bg-gray-200">−</button>
                  <span className="text-3xl font-extrabold text-gray-800 min-w-[70px] text-center">{editMl}<span className="text-base text-gray-400 font-semibold">ml</span></span>
                  <button onClick={() => setEditMl(m => Math.min(1000, m + 50))}
                          className="w-9 h-9 bg-gray-100 rounded-full text-gray-500 text-lg tap-active hover:bg-gray-200">+</button>
                </div>
              </div>
              <button
                onClick={handleSaveSettings}
                className="w-full bg-water text-white py-3 rounded-full font-bold text-sm tap-active"
              >
                保存 · 日目标 {editCups * editMl}ml
              </button>
            </div>
          )}
        </div>

        {/* 喝水小知识 */}
        <div className="mt-4 bg-gradient-to-r from-water/5 to-blue-50/30 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <p className="text-xs font-semibold text-water-deep mb-0.5">喝水小知识</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              每天建议喝 {targetMl}ml 水（约 {targetCups} 杯）。少量多次更健康，不要等渴了再喝哦~
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
