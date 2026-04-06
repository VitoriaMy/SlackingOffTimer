# 摸鱼状态自动检测与记录功能

## 功能说明

本功能实现了app每隔2秒自动检测并记录一次当前手机是否处于摸鱼状态，基于以下三个检测因素：

1. **陀螺仪检测 (gyroscope)**
   - 检测设备是否在运动
   - 最近5秒内有超过0.12的加速度数值变化，则认为设备在运动

2. **解锁状态检测 (deviceStatus)**
   - 检测设备是否处于解锁状态
   - 通过 AppState 监听判断应用是否在前台
   - 当应用处于前台时，则认为设备已解锁

3. **屏幕使用检测 (screenUsage)**
   - 检测屏幕最近是否被使用过
   - 最近5秒内有应用活动或陀螺仪活动，则认为屏幕在使用

## 工作原理

- 摸鱼状态定义：满足上述任何一个启用的检测因素，就认为用户正在摸鱼
- 只有在工作时间段内才会进行记录
- 检测方式可以在工作日程配置中启用/禁用
- 默认启用所有三种检测方式

## 实现文件

### 新增文件
- [mobile/src/hooks/useSlackingStatusRecorder.ts](../mobile/src/hooks/useSlackingStatusRecorder.ts) - 摸鱼状态检测与记录的主hook
- [mobile/app/RootLayoutContent.tsx](../mobile/app/RootLayoutContent.tsx) - 根布局内容包装器，用于初始化检测器

### 修改文件

1. **[mobile/lib/types.ts](../mobile/lib/types.ts)**
   - 添加 `SlackingDetectionMethod` 类型枚举，包括三种检测方式
   - 在 `WorkSchedule` 中添加可选的 `slackingDetectionMethods` 字段
   - 默认配置中启用所有三种检测方式

2. **[mobile/src/hooks/useSlackRecord.ts](../mobile/src/hooks/useSlackRecord.ts)**
   - 将 `AUTO_SWITCH_TICK_MS` 从 5000ms 改为 2000ms
   - 将 `SWITCH_STATE_TICK_MS` 从 5000ms 改为 2000ms
   - 将 `GYROSCOPE_UPDATE_MS` 从 1000ms 改为 500ms
   - 将 `USER_ACTIVE_TIMEOUT_MS` 从 20000ms 改为 5000ms
   - 这样使检测更频繁，更灵敏

3. **[mobile/app/_layout.tsx](../mobile/app/_layout.tsx)**
   - 使用新的 `RootLayoutContent` 包装器来初始化摸鱼状态检测器

## 配置检测方式

在应用设置中配置 `schedule.slackingDetectionMethods` 数组，可选的值包括：
- `"gyroscope"` - 启用陀螺仪检测
- `"deviceStatus"` - 启用解锁状态检测
- `"screenUsage"` - 启用屏幕使用检测

如果数组为空或未定义，则默认启用所有三种方式。

示例配置：
```typescript
const schedule: WorkSchedule = {
  // ... 其他配置
  slackingDetectionMethods: ["gyroscope", "deviceStatus", "screenUsage"], // 默认全部启用
};
```

## 平台支持

- **iOS/Web**: 使用 JavaScript API（陀螺仪、AppState）进行检测
- **Android**: 优先使用原生模块进行后台监听，如果不可用则降级到 JavaScript API

## 性能考虑

- 检测间隔为2秒，可在 `RECORD_INTERVAL_MS` 中调整
- 陀螺仪更新间隔为500ms，可在 `GYROSCOPE_DETECT_INTERVAL_MS` 中调整
- 所有检测都是异步处理，不会阻塞UI线程
- 摸鱼记录自动保存到本地存储，保留最近7天的数据

## 使用示例

摸鱼状态检测器会在应用启动时自动启动，无需额外的配置。数据会自动记录到 `settingsStore` 的 `slackingRecords` 中。
