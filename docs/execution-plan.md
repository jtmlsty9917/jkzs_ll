# 懒懒健康助手 — 执行步骤

> 版本：v1.0 | 创建日期：2026-06-24

---

## 执行原则

1. **小步迭代**：每完成一个独立模块就停下来验证，确认无误再继续
2. **功能优先**：先让核心功能跑通，再做 UI 打磨
3. **每步可运行**：每完成一步 `npm run dev` 都能看到进展
4. **及时记录**：每步完成后更新 `devlog/` 日志
5. **不跳过验证**：每完成一个阶段，手动测试所有已有功能

---

## 阶段 0：项目初始化

### 步骤 0.1 — 初始化 Vite + React 项目
- [ ] `npm create vite@latest . -- --template react`
- [ ] `npm install`
- [ ] 清理默认文件，保留最小骨架
- [ ] 验证：`npm run dev` 可启动

### 步骤 0.2 — 安装核心依赖
- [ ] `npm install react-router-dom dexie`
- [ ] `npm install -D tailwindcss postcss autoprefixer vite-plugin-pwa`
- [ ] `npx tailwindcss init -p`
- [ ] 配置 tailwind.config.js（主题色）
- [ ] 配置 vite.config.js（PWA 插件）
- [ ] 验证：`npm run dev` 正常

### 步骤 0.3 — 创建基础文件
- [ ] `src/main.jsx` — 入口
- [ ] `src/App.jsx` — 路由外壳
- [ ] `src/db.js` — Dexie 数据库
- [ ] `src/styles/index.css` — Tailwind 引入
- [ ] 验证：页面空白但无报错

---

## 阶段 1：骨架搭建

### 步骤 1.1 — 底部导航 + 路由
- [ ] `src/components/Layout.jsx` — 底部 4 Tab 导航
- [ ] 配置 5 个路由页面（占位内容）
- [ ] 验证：4 个 Tab 可切换

### 步骤 1.2 — 数据库层
- [ ] `src/db.js` — 定义 5 张表 + CRUD 方法
- [ ] `src/hooks/useMood.js` — 心情值计算
- [ ] 验证：浏览器 DevTools → Application → IndexedDB 可看到数据库

### 步骤 1.3 — 懒懒组件
- [ ] `src/components/Mascot.jsx` — SVG 边牧 + 点击互动
- [ ] `src/components/MoodBubble.jsx` — 表情气泡
- [ ] 集成到首页
- [ ] 验证：点击懒懒弹出表情

---

## 阶段 2：功能模块（逐个开发）

### 步骤 2.1 — 喝水模块 💧
- [ ] `WaterSetting.jsx` — 设置杯数 + 毫升
- [ ] `WaterRecord.jsx` — 记录喝水（滑块/输入）
- [ ] `useWater.js` — 数据读写 Hook
- [ ] 验证：可设置目标、记录喝水、看到当日进度

### 步骤 2.2 — 锻炼模块 🏊
- [ ] `ExerciseSetting.jsx` — 设置周目标
- [ ] `ExerciseRecord.jsx` — 选择日期 + 运动类型
- [ ] `useExercise.js` — 数据读写 Hook
- [ ] 验证：可记录锻炼

### 步骤 2.3 — 待办模块 ✅
- [ ] `TodoList.jsx` — 待办列表
- [ ] `TodoForm.jsx` — 添加/编辑待办
- [ ] `useTodo.js` — 数据读写 + 提醒检查
- [ ] 验证：可增删改待办、到期弹窗提醒

### 步骤 2.4 — 日记模块 📸
- [ ] `DiaryEditor.jsx` — 编辑器 + 照片上传
- [ ] `useDiary.js` — 数据读写 Hook
- [ ] 验证：可写日记、上传照片

---

## 阶段 3：日历整合

### 步骤 3.1 — 日历组件
- [ ] `CalendarGrid.jsx` — 月历网格渲染
- [ ] `CalendarDay.jsx` — 单日格子（热力背景 + 图标）
- [ ] 验证：月历正确显示

### 步骤 3.2 — 数据聚合
- [ ] 加载喝水数据 → 热力图背景
- [ ] 加载锻炼数据 → 运动图标
- [ ] 加载日记数据 → 照片缩略图
- [ ] 验证：日历完整显示

### 步骤 3.3 — 双视图切换
- [ ] `CalendarView.jsx` — 视图A/B 切换按钮
- [ ] 视图A：运动图标 + 喝水热力
- [ ] 视图B：照片缩略图
- [ ] 验证：两种视图可切换

---

## 阶段 4：主页整合 + 打磨

### 步骤 4.1 — 主页整合
- [ ] 懒懒 + 心情值仪表
- [ ] 4 功能入口卡片（带进度预览）
- [ ] 本月月历概览（迷你版）
- [ ] 验证：主页信息完整

### 步骤 4.2 — PWA 完善
- [ ] 生成 PWA 图标
- [ ] Service Worker 离线缓存
- [ ] manifest.json 配置
- [ ] 验证：手机浏览器可添加到桌面

### 步骤 4.3 — UI 打磨
- [ ] 动画过渡效果
- [ ] 点击反馈
- [ ] 响应式微调
- [ ] 验证：全流程走通

---

## 当前进度

| 阶段 | 状态 | 完成日期 |
|------|------|----------|
| 阶段 0：项目初始化 | ✅ 已完成 | 2026-06-26 |
| 阶段 1：骨架搭建 | ✅ 已完成 | 2026-06-26 |
| 阶段 2：功能模块 | ✅ 已完成 | 2026-06-26 |
| 阶段 3：日历整合 | ✅ 已完成 | 2026-06-26 |
| 阶段 4：主页整合 + 打磨 | ✅ 基本完成 | 2026-06-26 |
