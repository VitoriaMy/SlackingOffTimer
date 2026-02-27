import Foundation

// iOS 降级版原型接口：不承诺“解锁自动计时”。
protocol SlackingProbe {
  func startManualSession()
  func stopManualSession()
  func scheduleDailySummaryNotification(at hour: Int, minute: Int)
}

final class SlackingProbeFallback: SlackingProbe {
  func startManualSession() {
    // TODO: 开始手动会话
  }

  func stopManualSession() {
    // TODO: 结束手动会话
  }

  func scheduleDailySummaryNotification(at hour: Int, minute: Int) {
    // TODO: 使用 UNUserNotificationCenter 配置本地提醒
  }
}
