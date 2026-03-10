# Expo + React Native 本地开发环境准备（Windows）

本文档说明在 Windows 上开发 `Expo + React Native` 需要准备的本地环境。

## 1. 必备软件

- `Node.js`：建议 `LTS` 版本（18 或 20）
- `npm`：随 Node 安装
- `Git`
- `VS Code`（推荐）
- `Android Studio`（用于 Android 模拟器与 SDK）
- `Expo Go`（手机真机调试，可选但推荐）

## Expo Go 怎么安装

- Android：打开 Google Play，搜索 `Expo Go`，安装发布者为 `Expo` 的官方应用。
- iOS：打开 App Store，搜索 `Expo Go`，安装官方应用。

安装后首次使用建议：

1. 手机和电脑连接同一网络。
2. 在项目里执行 `npx expo start`。
3. 手机打开 Expo Go，扫码终端/浏览器显示的二维码。
4. 若局域网连接不稳定，改用 `npx expo start --tunnel` 再扫码。

## 2. Node 与包管理

建议先确认版本：

```bash
node -v
npm -v
```

建议范围：

- Node: `>=18`
- npm: `>=9`

可选：安装 `pnpm` 或 `yarn`，但 Expo 用 npm 也完全可行。

## 3. 安装 Expo CLI（可选）

新版本一般使用 `npx expo`，不强制全局安装。

```bash
npx expo --version
```

如果你希望全局命令：

```bash
npm install -g expo
expo --version
```

## 4. Android 开发环境（Windows）

## 安装 Android Studio 后需要完成

1. 打开 `SDK Manager` 安装：
- Android SDK Platform（建议最新稳定版）
- Android SDK Platform-Tools
- Android SDK Build-Tools
- Android Emulator
- 至少一个系统镜像（如 `Android 14 x86_64`）

2. 打开 `AVD Manager` 创建一个模拟器。

3. 配置环境变量（Windows 系统环境变量）：

- `ANDROID_HOME` 或 `ANDROID_SDK_ROOT` 指向 SDK 目录，例如：
- `C:\Users\<你的用户名>\AppData\Local\Android\Sdk`

并将以下路径加入 `Path`：

- `%ANDROID_HOME%\platform-tools`
- `%ANDROID_HOME%\emulator`

4. 验证：

```bash
adb --version
```

## 5. 真机调试（Android）

- 手机开启开发者模式
- 开启 USB 调试
- 使用数据线连接电脑
- 执行：

```bash
adb devices
```

看到设备后，可直接运行到真机。

## 6. iOS 开发说明

- 在 Windows 上不能本地运行 iOS 模拟器。
- iOS 真机/模拟器开发通常需要 macOS + Xcode。
- 在 Windows 可先专注 Android + Expo Go；iOS 可后续在 macOS 环境补齐。

## 7. Expo 项目常用命令

在 Expo 项目目录中：

```bash
npm install
npx expo start
```

常用启动方式：

```bash
npx expo start --android
npx expo start --tunnel
```

说明：

- `--android`：尝试直接启动 Android 模拟器/设备
- `--tunnel`：跨网络调试更稳定，但启动稍慢

## 8. 推荐 VS Code 扩展

- `ESLint`
- `Prettier`
- `React Native Tools`
- `Error Lens`（可选）

## 9. 常见问题

## `adb` 找不到

- 检查 `ANDROID_HOME` 和 `Path` 是否配置正确
- 重新打开终端后再试

## Expo 启动后设备连不上

- 手机和电脑需同网络
- 先试 `npx expo start --tunnel`

## 端口冲突

- 关闭占用端口的旧进程
- 或重启终端后重新执行 `npx expo start`

## 10. 最小可用检查清单

满足以下项即可开始 Expo 开发：

- `node -v` / `npm -v` 正常
- `npx expo --version` 正常
- `adb --version` 正常
- Android 模拟器可启动
- `npx expo start --android` 能打开 App
