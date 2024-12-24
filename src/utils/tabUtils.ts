import { logger } from "~utils/logger"

// 向标签页发送消息的函数
export function sendMessageToTab(tabId: number, message: any, retries = 3) {
  logger.debug(`尝试向标签页 ${tabId} 发送消息:`, message, `剩余重试次数: ${retries}`)
  chrome.tabs.sendMessage(
    tabId,
    { ...message, showNotification: true }, // 添加 showNotification 标志
    (response) => {
      if (chrome.runtime.lastError) {
        logger.warn(`向标签页 ${tabId} 发送消息失败:`, {
          error: chrome.runtime.lastError.message,
          message: message,
          retries: retries
        })
        // 如果还有重试次数，等待后重试
        if (retries > 0) {
          logger.info(`将在1秒后重试发送消息到标签页 ${tabId}`)
          setTimeout(() => {
            sendMessageToTab(tabId, message, retries - 1)
          }, 1000)
        } else {
          logger.error(`向标签页 ${tabId} 发送消息最终失败`)
        }
      } else {
        logger.debug(`向标签页 ${tabId} 发送消息成功，响应:`, response)
      }
    }
  )
}

// 获取当前标签页并执行回调
export function withActiveTab(callback: (tab: chrome.tabs.Tab) => void) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      callback(tabs[0])
    } else {
      logger.warn("未找到活动标签页")
    }
  })
}
