import { useState, useRef } from 'react'
import { useDiary, compressImage } from '../../hooks/useDiary'

/**
 * 日记编辑器
 * 支持文字编辑 + 照片上传
 */
export default function DiaryEditor({ date, onClose }) {
  const { entry, loading, save } = useDiary(date)
  const [content, setContent] = useState(entry?.content || '')
  const [photos, setPhotos] = useState(entry?.photos || [])
  const [saving, setSaving] = useState(false)
  const fileInput = useRef(null)

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    const compressed = []
    for (const file of files) {
      try {
        const base64 = await compressImage(file, 600)
        compressed.push(base64)
      } catch (err) {
        alert('图片处理失败: ' + file.name)
      }
    }
    setPhotos(prev => [...prev, ...compressed])
  }

  const handleRemovePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setSaving(true)
    await save({ content, photos })
    setSaving(false)
    onClose?.()
  }

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <p className="text-gray-400">加载中...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">📝 记录 · {date}</h3>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 text-lg tap-active">✕</button>
        )}
      </div>

      {/* 照片区域 — 排在日记文字前面 */}
      <div className="mb-4">
        <p className="text-sm text-gray-500 mb-2">📷 照片</p>

        {/* 已上传的照片 */}
        {photos.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-3">
            {photos.map((photo, i) => (
              <div key={i} className="relative group">
                <img
                  src={photo}
                  alt={`照片${i + 1}`}
                  className="w-20 h-20 object-cover rounded-xl border border-gray-200"
                />
                <button
                  onClick={() => handleRemovePhoto(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-400 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity tap-active"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 上传按钮 */}
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInput.current?.click()}
          className="w-full border-2 border-dashed border-gray-200 rounded-xl p-4 text-sm text-gray-400 hover:border-diary hover:text-diary transition-colors tap-active"
        >
          📸 点击上传照片
        </button>
      </div>

      {/* 日记正文 — 排在照片后面 */}
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="今天想记录什么？心情、感悟、小确幸..."
        rows={5}
        className="w-full border border-gray-200 rounded-xl p-4 text-sm resize-none focus:outline-none focus:border-diary transition-colors mb-4"
      />

      {/* 保存按钮 */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-diary text-white py-3 rounded-full font-medium tap-active disabled:opacity-50"
      >
        {saving ? '保存中...' : '💾 保存记录'}
      </button>
    </div>
  )
}
