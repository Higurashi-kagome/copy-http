import { getSetting, saveRules } from "~utils/storage"

import { copyToClipboardV2 } from "./clipboard"
import { addHistoryRecord } from "./historyUtils"
import { logger } from "./logger"
import {
  sendMatchNotification,
  type MatchNotificationData
} from "./notificationUtils"

export interface MatchResult {
  ruleType: "url" | "header" | "responseHeader" | "requestParam" | "requestBody"
  urlPattern: string
  value: string
  url: string
  headerName?: string
  paramName?: string
  ruleIndex: number
  rules: any[]
}

/**
 * 处理匹配结果的通用函数
 * @param result 匹配结果
 */
export async function handleMatchResult(result: MatchResult) {
  const {
    ruleType,
    urlPattern,
    value,
    url,
    headerName,
    paramName,
    ruleIndex,
    rules
  } = result

  logger.info(`${ruleType} 匹配成功:`, { urlPattern, value })

  // 检查自动复制配置
  const autoCopyEnabled = await getSetting("enableAutoCopy")
  if (autoCopyEnabled) {
    copyToClipboardV2(value)
    logger.debug("已自动复制匹配内容到剪贴板")
  } else {
    logger.debug("自动复制已禁用，跳过复制")
  }

  // 添加到历史记录
  const historyRecord: any = {
    ruleType,
    urlPattern,
    value,
    timestamp: new Date().toLocaleString("zh-CN", { hour12: false }),
    url
  }

  if (headerName) historyRecord.headerName = headerName
  if (paramName) historyRecord.paramName = paramName

  addHistoryRecord(historyRecord)

  // 发送匹配成功通知
  const notificationData: MatchNotificationData = {
    ruleType,
    rulePattern: urlPattern,
    value,
    url
  }

  if (headerName) notificationData.headerName = headerName
  if (paramName) notificationData.paramName = paramName

  // 这里需要 tabId，但在 webRequest 监听器中可能为 -1
  // sendMatchNotification 函数已经处理了这种情况
  await sendMatchNotification(-1, notificationData)

  // 更新规则状态
  const updatedRules = rules.map((r, idx) => {
    if (idx === ruleIndex) {
      return {
        ...r,
        lastValue: {
          value,
          timestamp: new Date().toLocaleString("zh-CN", { hour12: false })
        }
      }
    }
    return r
  })

  // 更新存储
  await saveRules(updatedRules)
}
