# SlackingOffTimer

一个面向新手的在线开发版「摸鱼计时器」MVP。

## 当前能力（Web MVP）

- 首次设置工作制度（上下班 + 午休）
- 页面活跃会话计时（近似“摸鱼时长”）
- 本地保存每日统计与近 7 天趋势

> 说明：浏览器环境无法监听手机解锁事件。本仓库先用于验证产品核心逻辑与交互，再迁移 Android 原生实现后台自动统计。

## 本地启动

```bash
npm install
npm run dev
```

打开 `http://localhost:3000`

## 后续迭代建议

1. 接入 Supabase 持久化（替代 localStorage）
2. 增加下班提醒（Web Push / 邮件）
3. 迁移 Android 原生，实现真正的解锁自动计时
