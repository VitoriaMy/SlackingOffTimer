# SlackingOffTimer (Web MVP)

零依赖 Web MVP，用于验证“摸鱼计时器”的核心产品价值：
- 首次设置工作制度
- 工作窗口内按页面活跃会话自动计时（Web近似）
- 首页展示今日摸鱼时长、占比和状态
- 独立最近 7 天趋势页
- 推送：摸鱼小计（浏览器 Notification，按天仅发送一次）

## 本地运行

```bash
cd /Users/wadec/Desktop/周旺/SlackingOffTimer
python3 -m http.server 5173
```

然后打开：
- `http://localhost:5173/index.html`

## 页面说明

- `index.html`: 首次设置 + 今日总览
- `settings.html`: 修改工作制度
- `trends.html`: 最近 7 天趋势

## 统计口径

- 仅在工作窗口内累计会话时长
- 会话最小计 1 分钟
- 支持跨天切分（会话结束时按日期拆分写入）
- 数据存储在 `localStorage`
- “推送：摸鱼小计”在到达下班时间后触发，且每天最多一次

## 主要存储键

- `sot_app_config`
- `sot_daily_stats`
- `sot_notice_state`

## Web 阶段限制

- 无法监听系统解锁事件，使用页面 focus/visibility 近似
- 无法实现系统级后台常驻
- 仅在页面已打开且浏览器允许通知时可触发提醒

## 移动端技术原型

- 目录：`/Users/wadec/Desktop/周旺/SlackingOffTimer/mobile-prototype`
- 包含 Android 可行性原型（后台服务 + 解锁触发 + 下班推送）和 iOS 能力边界说明
