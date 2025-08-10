import { logger } from "./logger"
import { getTargetTabId, sendToTab } from "./tabUtils"
import { getSetting } from "~utils/storage"

export interface MatchNotificationData {
  ruleType: "url" | "header" | "responseHeader" | "requestParam" | "requestBody"
  rulePattern: string
  value: string
  url: string
  headerName?: string
  paramName?: string
}

export async function sendMatchNotification(
  tabId: number,
  data: MatchNotificationData
) {
  logger.info("准备发送匹配通知:", { tabId, data })

  // 检查是否启用通知
  const notificationsEnabled = await getSetting('enableMatchNotifications')
  if (!notificationsEnabled) {
    logger.debug("匹配通知已禁用，跳过发送")
    return
  }

  let displayValue = data.value

  // 根据规则类型格式化显示值
  switch (data.ruleType) {
    case "header":
    case "responseHeader":
      displayValue = `${data.headerName}: ${data.value}`
      break
    case "requestParam":
      displayValue = `${data.paramName}=${data.value}`
      break
    case "url":
    case "requestBody":
      displayValue = data.value
      break
  }

  const messageData = {
    action: "showMatchNotification",
    data: {
      rulePattern: data.rulePattern,
      value: displayValue,
      url: data.url
    }
  }

  // 使用智能标签页获取函数
  const targetTabId = await getTargetTabId(tabId, data.url)

  if (targetTabId) {
    sendToTab(targetTabId, messageData)
  } else {
    logger.warn("无法找到有效的标签页发送通知")
  }
}
