# SlackingOffTimer

一个基于 React + Vite 的在线开发版「摸鱼计时器」MVP。

## 当前能力（Web MVP）

- 首次设置工作制度（上下班 + 午休 + 工作日）
- 主页面展示今日摸鱼时长/占比/状态
- 独立趋势页展示近 7 天数据
- 本地保存工作制度与每日统计

> 说明：浏览器环境无法监听手机解锁事件。本仓库先用于验证产品核心逻辑与交互，再迁移 Android 原生实现后台自动统计。

## 本地启动

```bash
npm install
npm run dev
```

打开 `http://localhost:5173`

## 环境变量

可通过环境变量分别配置中英文标题：

- `VITE_APP_TITLE_EN`：英文标题（默认标题来源）
- `VITE_APP_TITLE_ZH`：中文标题（未配置时回退到英文标题）

例如在项目根目录 `.env` 中配置：

```bash
VITE_APP_TITLE_EN=MoreYou
VITE_APP_TITLE_ZH=摸鱼 MoreYou
```

## 页面路由

- `/` 首页（未配置时会自动跳到设置页）
- `/settings` 工作制度设置
- `/trends` 最近 7 天趋势

## 后续迭代建议

1. 接入 Supabase 持久化（替代 localStorage）
2. 增加下班提醒（Web Push / 邮件）
3. 迁移 Android 原生，实现真正的解锁自动计时
