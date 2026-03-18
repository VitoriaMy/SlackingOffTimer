# Mobile Global Store 使用指南

## 功能介绍

Mobile全局Store提供了一个基于React Context API的状态管理方案，支持以下功能：

- **全局状态管理**：使用Context API管理应用的全局状态
- **本地缓存**：自动用AsyncStorage保存和恢复状态，应用重启后数据不丢失
- **类型安全**：完整的TypeScript支持
- **智能数据保留**：自动保留最近7天的数据记录

## Store包含的状态

### 用户设置
- `language`: 应用语言（'zh' | 'en'）
- `languageDraft`: 语言草稿（用于设置页面）
- `configured`: 是否已配置工作计划
- `schedule`: 工作时间计划
- `slackingRecords`: 偷懒记录（自动保留7天数据）
- `scheduleHistory`: 计划修改历史（自动保留7天数据）
- `isLoading`: 初始化状态是否加载完成

## 使用步骤

### 1. 在App根组件中包装Provider

在你的根app文件中（如 `mobile/app/_layout.tsx`）：

```tsx
import { SettingsStoreProvider } from "@/store";

export default function RootLayout() {
  return (
    <SettingsStoreProvider>
      {/* 其他组件 */}
    </SettingsStoreProvider>
  );
}
```

### 2. 在任何子组件中使用Store

```tsx
import { useSettingsStore } from "@/store";

export function MyComponent() {
  const {
    language,
    schedule,
    isLoading,
    updateLanguage,
    updateSchedule,
  } = useSettingsStore();

  if (isLoading) {
    return <Text>加载中...</Text>;
  }

  return (
    <View>
      <Text>当前语言: {language}</Text>
      <Text>工作开始时间: {schedule.startTime}</Text>
      
      <Button 
        title="切换语言" 
        onPress={() => updateLanguage(language === 'zh' ? 'en' : 'zh')} 
      />
    </View>
  );
}
```

## API 文档

### 状态值 (SettingsStoreValue)

#### 读取状态
- `language: AppLanguage` - 当前语言设置
- `languageDraft: AppLanguage` - 语言草稿
- `configured: boolean` - 是否已配置
- `schedule: WorkSchedule` - 工作计划
- `slackingRecords: SlackingRecord[]` - 偷懒记录
- `scheduleHistory: ScheduleHistoryRecord[]` - 计划历史
- `isLoading: boolean` - 是否正在加载初始数据

#### 修改状态（异步操作）
所有修改操作都返回Promise，会自动保存到AsyncStorage

- `updateLanguage(next: AppLanguage): Promise<void>` - 更新语言
- `updateSchedule(next: WorkSchedule, shouldMarkConfigured?: boolean): Promise<void>` - 更新工作计划
- `updateConfigured(next: boolean): Promise<void>` - 更新配置状态
- `addSlackingRecord(switchState: SlackSwitchState): Promise<void>` - 添加偷懒记录
- `reloadSlackingRecords(): Promise<void>` - 重新加载偷懒记录
- `reloadScheduleHistory(): Promise<void>` - 重新加载计划历史

#### 其他操作
- `setLanguageDraft(next: AppLanguage): void` - 设置语言草稿（不保存）

### Storage 函数

所有storage函数都支持异步操作，返回Promise：

```tsx
import {
  loadLanguage,
  saveLanguage,
  loadSchedule,
  saveSchedule,
  loadSlackingRecords,
  saveSlackingRecords,
  loadScheduleHistory,
  saveScheduleHistory,
  loadConfigured,
  saveConfigured,
  keepRecent7DaysRecords,
  keepRecent7DaysScheduleHistory,
  clearAllData,
} from "@/store";

// 示例：手动清除所有数据
await clearAllData();
```

## 数据持久化

Store使用ReactNative的AsyncStorage自动保存以下数据到设备本地存储：

- `slacking_schedule` - 工作时间计划
- `slacking_configured` - 配置状态
- `slacking_language` - 语言设置
- `slacking_records` - 偷懒记录（自动保留7天）
- `slacking_schedule_history` - 计划修改历史（自动保留7天）

### 自动数据清理

系统会自动清理超过7天的记录，以防止存储空间过度占用。

## 完整示例

```tsx
import { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { useSettingsStore } from "@/store";

export function SettingsScreen() {
  const {
    language,
    languageDraft,
    schedule,
    configured,
    isLoading,
    updateLanguage,
    setLanguageDraft,
    updateSchedule,
  } = useSettingsStore();

  const handleLanguageChange = async () => {
    const newLang = languageDraft === 'en' ? 'zh' : 'en';
    setLanguageDraft(newLang);
    await updateLanguage(newLang);
  };

  const handleScheduleUpdate = async () => {
    const newSchedule = {
      ...schedule,
      startTime: '10:00',
      endTime: '19:00',
    };
    await updateSchedule(newSchedule, !configured);
  };

  if (isLoading) {
    return <Text>加载中...</Text>;
  }

  return (
    <View>
      <Text>当前语言: {language}</Text>
      <Button title="更改语言" onPress={handleLanguageChange} />
      
      <Text>工作开始: {schedule.startTime}</Text>
      <Button title="更新工作时间" onPress={handleScheduleUpdate} />
      
      <Text>已配置: {configured ? '是' : '否'}</Text>
    </View>
  );
}
```

## 注意事项

1. **等待加载完成**：在使用Store之前，应该检查`isLoading`状态，确保初始数据已加载
2. **异步操作**：所有更新操作都是异步的，需要使用`await`或`.then()`
3. **错误处理**：Storage函数内部会捕获错误并打印警告，但不会抛出异常
4. **数据同步**：对于同一个StateState的多个修改，会自动合并到AsyncStorage
5. **Provider位置**：确保在应用的顶层使用Provider，这样所有子组件都能访问Store

## 常见问题

### Q: 数据没有被保存？
A: 确保在修改状态后使用异步函数的返回值（即使不需要do anything）。所有更新函数都会自动保存到AsyncStorage。

### Q: 如何访问Store外部？
A: Store只能在组件树中使用。如果需要在组件外访问，可以导出storage函数直接调用。

### Q: 可以手动清除数据吗？
A: 可以的，使用`clearAllData()`函数清除所有本地存储的数据。

```tsx
import { clearAllData } from "@/store";

// 清除所有数据
await clearAllData();
```
