# 懒懒健康助手 — 技术规范

> 版本：v1.0 | 创建日期：2026-06-24

---

## 一、技术栈

| 层 | 选择 | 版本 | 说明 |
|----|------|------|------|
| 框架 | React | ^18.x | SPA 组件化开发 |
| 构建 | Vite | ^5.x | 开发热更新快，生产构建优化 |
| 样式 | Tailwind CSS | ^3.x | 原子化 CSS，快速构建 UI |
| 数据库 | Dexie.js | ^4.x | IndexedDB 封装，Promise 风格 API |
| 路由 | React Router | ^6.x | Hash 路由模式 |
| PWA | vite-plugin-pwa | latest | 自动生成 SW + manifest |
| 包管理 | npm | — | 默认包管理工具 |

## 二、项目结构

```
jiankangzhushou/
├── index.html                  # 入口 HTML
├── package.json                # 依赖 + 脚本
├── vite.config.js              # Vite + PWA 配置
├── tailwind.config.js          # Tailwind 主题配置
├── postcss.config.js           # PostCSS 配置
├── CLAUDE.md                   # AI 助手指引
├── public/
│   └── icons/                  # PWA 图标 (192x192, 512x512)
├── docs/                       # 项目文档
│   ├── requirements.md         # 需求文档
│   ├── tech-spec.md            # 技术规范（本文件）
│   ├── design-standards.md     # 设计规范
│   └── execution-plan.md       # 执行步骤
├── devlog/                     # 开发日志
│   └── YYYY-MM-DD.md           # 每日开发记录
└── src/
    ├── main.jsx                # React 入口
    ├── App.jsx                 # 路由 + 全局布局
    ├── db.js                   # Dexie 数据库定义
    ├── hooks/
    │   ├── useWater.js         # 喝水数据 Hook
    │   ├── useExercise.js      # 锻炼数据 Hook
    │   ├── useDiary.js         # 日记数据 Hook
    │   ├── useTodo.js          # 待办数据 Hook
    │   └── useMood.js          # 心情值计算 Hook
    ├── components/
    │   ├── Layout.jsx          # 底部导航 + 页面壳
    │   ├── Mascot.jsx          # 懒懒互动核心组件
    │   ├── MoodBubble.jsx      # 心情表情气泡
    │   ├── water/
    │   │   ├── WaterSetting.jsx
    │   │   ├── WaterRecord.jsx
    │   │   └── WaterCalendar.jsx
    │   ├── exercise/
    │   │   ├── ExerciseSetting.jsx
    │   │   ├── ExerciseRecord.jsx
    │   │   └── ExerciseCalendar.jsx
    │   ├── diary/
    │   │   ├── DiaryEditor.jsx
    │   │   └── DiaryCalendar.jsx
    │   ├── todo/
    │   │   ├── TodoList.jsx
    │   │   └── TodoForm.jsx
    │   └── calendar/
    │       ├── CalendarGrid.jsx
    │       ├── CalendarDay.jsx
    │       └── CalendarView.jsx
    └── styles/
        └── index.css           # 全局样式 + Tailwind 引入
```

## 三、数据库设计（Dexie.js / IndexedDB）

### 表结构

```javascript
// 表名: waterLogs — 喝水记录
{
  id: number (auto-increment, primary),
  date: string,        // "YYYY-MM-DD"
  cups: number,        // 杯数 (0-20, 1位小数)
  ml: number,          // 对应毫升数
  targetMl: number     // 当日目标毫升数（冗余，便于查询）
}

// 表名: exerciseLogs — 锻炼记录
{
  id: number (auto-increment, primary),
  date: string,        // "YYYY-MM-DD"
  type: string,        // 运动类型标识，如 "running", "swimming"
  duration: number     // 时长(分钟)，选填
}

// 表名: diaryEntries — 日记
{
  id: number (auto-increment, primary),
  date: string,        // "YYYY-MM-DD"
  content: string,     // 日记文本
  photos: [string]     // base64 图片数组
}

// 表名: todos — 待办事项
{
  id: number (auto-increment, primary),
  title: string,           // 事项内容
  dueDate: string,         // "YYYY-MM-DD"
  dueTime: string,         // "HH:mm"
  completed: boolean,      // 是否完成
  createdAt: string        // 创建时间 ISO string
}

// 表名: settings — 用户设置
{
  id: number (auto-increment, primary),
  key: string,       // 设置键名
  value: any         // 设置值
}
```

### 索引策略
- `waterLogs.date` — 唯一索引，查询某天喝水记录
- `exerciseLogs.date` — 查询某天锻炼记录
- `diaryEntries.date` — 唯一索引
- `todos.dueDate` — 查询某天待办

## 四、心情值算法

```javascript
function calculateMood(waterData, exerciseData, diaryData, todoData, streakDays) {
  let score = 50; // 基础分

  // 喝水贡献 (0-15分)
  const waterRatio = waterData.drank / waterData.target;
  score += Math.min(waterRatio, 1) * 15;

  // 锻炼贡献 (0-15分)
  if (exerciseData.todayCount > 0) score += 15;

  // 日记贡献 (0-10分)
  if (diaryData.hasEntry) score += 10;

  // 待办贡献 (0-10分)
  if (todoData.completedToday > 0) score += 10;

  // 连续天数奖励 (0-10分)
  score += Math.min(streakDays * 2, 10);

  return Math.min(Math.max(Math.round(score), 0), 100);
}
```

### 心情分级与表情池
| 分数区间 | 等级 | 可用表情 |
|----------|------|----------|
| 0-30 | 😞 不开心 | 😔 😞 😢 💧 |
| 31-60 | 🙂 一般 | 😊 🙂 👋 💪 |
| 61-85 | 😄 开心 | 😄 😆 🤗 ✨ |
| 86-100 | 🥰 超开心 | 🥰 😍 🎉 ⭐ 🌟 |

## 五、路由设计

| 路径 | 页面 | 说明 |
|------|------|------|
| `#/` | 首页 | 懒懒 + 功能入口卡片 + 月历概览 |
| `#/water` | 喝水 | 设置 + 记录 + 日统计 |
| `#/exercise` | 锻炼 | 设置 + 运动记录 |
| `#/diary` | 记录生活 | 日记编辑 + 照片上传 |
| `#/todo` | 待办 | 待办列表 + 表单 |
| `#/calendar` | 日历 | 完整月历 + 双视图切换 |

## 六、提醒机制

- 使用 `setInterval` 每 30 秒检查一次是否有待办到期
- 到期时弹出 `<MoodBubble>` 模态框 + 播放提示音
- 提示音使用 Web Audio API 生成简短音效（无需外部音频文件）
- 弹窗持续到用户点击关闭，期间可重复弹出新提醒
