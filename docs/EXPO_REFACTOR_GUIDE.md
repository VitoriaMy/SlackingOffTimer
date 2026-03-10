# SlackingOffTimer 重构为 Expo 手机端 App 指南

本文档说明如何把当前 `React + Vite` Web 项目重构为基于 Expo 的手机端 App（iOS/Android）。

## 1. 目标与范围

### 目标

- 基于 Expo + React Native 运行在手机端。
- 迁移并按 RN 场景重写业务逻辑（工作时间、午休、开关记录、7 天历史）。
- UI 改为原生组件，不再依赖 DOM/CSS。
- 本地持久化从 `localStorage` 迁移到 React Native 可用方案。
- 重构不考虑与 Web 兼容，按移动端独立实现。

### 非目标（首阶段）

- 不直接迁移 Web 动画实现（Lottie 需 RN 方案重做）。
- 不在首阶段处理后台常驻/解锁自动监听（可后续用原生能力扩展）。
- 不维护 Web 与 RN 双端兼容代码。

## 2. 当前项目拆分建议

本次按移动端独立重构，不做 Web/RN 共享层抽象。

建议优先迁移以下内容到 Expo 项目：

- `lib/types.ts`
- `src/schedule.ts`
- 时间计算相关工具（去除 DOM 依赖）

## 3. 技术选型建议

- 框架：`Expo (managed workflow)`
- 导航：`expo-router`（推荐）或 `@react-navigation/native`
- 状态管理：可保留当前 Context Store，后续可升级 Zustand
- 持久化：`@react-native-async-storage/async-storage`
- 动画：`lottie-react-native` + `expo`
- 图标：`@expo/vector-icons`

## 4. 迁移路线（分阶段）

## 阶段 A：初始化 Expo 项目

```bash
npx create-expo-app slacking-off-timer-mobile
cd slacking-off-timer-mobile
npm install @react-native-async-storage/async-storage
npm install expo-router
```

在 `app.json` 中配置应用名、包名、图标、启动图。

## 阶段 B：迁移业务核心

在 Expo 项目中创建：

- `src/core/types.ts`
- `src/core/schedule.ts`
- `src/core/time.ts`

把 Web 项目逻辑迁移到移动端，并按 RN 运行环境重写实现，确保不依赖 `window/document/localStorage`。

## 阶段 C：重写存储层

把当前 `lib/storage.ts` 拆成接口 + 平台实现：

- `src/storage/storage.ts`（接口）
- `src/storage/storage.native.ts`（AsyncStorage 实现）

示例接口：

```ts
export interface AppStorage {
  loadSchedule(): Promise<WorkSchedule>;
  saveSchedule(schedule: WorkSchedule): Promise<void>;
  loadSlackingRecords(): Promise<SlackingRecord[]>;
  saveSlackingRecords(records: SlackingRecord[]): Promise<void>;
  loadScheduleHistory(): Promise<ScheduleHistoryRecord[]>;
  saveScheduleHistory(records: ScheduleHistoryRecord[]): Promise<void>;
}
```

## 阶段 D：迁移状态层

把 `SettingsStoreProvider` 从同步初始化改成异步初始化：

- 增加 `loading` 状态
- 首次启动时从 AsyncStorage 拉取数据
- 保存设置/记录时异步写回

关键改造点：

- `useState(() => loadXxx())` 改为 `useEffect + async init`
- 所有 `saveXxx` 改为 `await saveXxx`

## 阶段 E：重写页面 UI

对应关系建议：

- `src/pages/home` -> `app/(tabs)/index.tsx`
- `src/pages/settings` -> `app/settings.tsx`
- `src/pages/status` -> `app/status.tsx`
- `src/pages/trends` -> `app/trends.tsx`

注意点：

- `.module.scss` 改为 `StyleSheet.create` 或 `nativewind`
- `button/div` 改为 `Pressable/View/Text`
- `react-router-dom` 改为 `expo-router` 跳转

## 阶段 F：组件适配清单

需要重点重写的组件：

- `Timer`：改为 RN Picker/Modal 方案
- `MoodSwitch`：改为 `Pressable + Animated`
- `Layout`：改为安全区 + Header 组件
- `Chart`：可用 `react-native-svg` + 图表库

## 5. 目录结构建议（Expo）

```text
slacking-off-timer-mobile/
  app/
    _layout.tsx
    index.tsx
    settings.tsx
    status.tsx
    trends.tsx
  src/
    core/
      types.ts
      schedule.ts
      time.ts
    storage/
      storage.ts
      storage.native.ts
    store/
      settingsStore.tsx
    hooks/
      useSlackRecord.ts
      useCurrentSlackingDuration.ts
      useIsWorkTime.ts
    components/
      Timer/
      MoodSwitch/
      Layout/
```

## 6. 兼容性与风险

- 时间与时区：使用手机本地时区，不进行跨天统计。
- 历史数据：不处理 Web 到 App 的历史数据迁移。

## 7. 验收检查

- 可完成首次设置并持久化。
- 首页可切换摸鱼状态并实时累计时长。
- 状态页可查看最近 7 天开关记录与设置记录。
- 设置页修改后能记录“保存时间 + 设置快照”。
- 重启 App 后数据一致。

## 8. 推荐实施方式

- 方式：新建 Expo 子项目并逐步迁移。

为提高重构效率，本方案默认只维护移动端，不处理 Web 兼容与共享代码抽象。
