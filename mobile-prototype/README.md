# Mobile Feasibility Prototype

这个目录用于验证“移动端无感摸鱼计时”的技术可行性，不是完整产品工程。

## 目录

- `feasibility-report.md`：Android / iOS 可行性结论、风险和下一步建议
- `android-poc/`：Android 技术原型（后台常驻 + 解锁触发 + 下班推送）
- `ios-feasibility/`：iOS 能力边界和降级方案

## 原型目标

1. 后台常驻计时链路可运行
2. 解锁后自动开始会话（在工作窗口内）
3. 熄屏或离开工作窗口停止会话并结算
4. 到达下班时间后推送“摸鱼小计”（每天一次）

## 注意

- Android 原型可实现核心链路，但会受厂商省电策略影响。
- iOS 无法实现与 Android 等价的“解锁触发 + 后台持续监听”能力，需要产品降级。
