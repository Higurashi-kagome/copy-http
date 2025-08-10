import { logger } from "~utils/logger"

export function sendToTab(tabId: number, messageData: any) {
  logger.info("发送消息到标签页:", { tabId, messageData })

  chrome.tabs
      .sendMessage(tabId, messageData)
      .then((response) => {
        logger.info("通知发送成功，收到响应:", response)
      })
      .catch((error) => {
        logger.error("发送匹配通知失败:", error)
        logger.error("失败详情:", { tabId, messageData, error: error.message })
      })
}

// 向标签页发送消息的函数
export function sendMessageToTab(tabId: number, message: any, retries = 3) {
  logger.debug(`尝试向标签页 ${tabId} 发送消息:`, message, ` 剩余重试次数: ${retries}`)
  chrome.tabs.sendMessage(
    tabId,
    { ...message, showNotification: false }, // 添加 showNotification 标志
    (response) => {
      if (chrome.runtime.lastError) {
        logger.warn(`向标签页 ${tabId} 发送消息失败:`, {
          error: chrome.runtime.lastError.message,
          message: message,
          retries: retries
        })
        // 如果还有重试次数，等待后重试
        if (retries > 0) {
          logger.info(`将在 1 秒后重试发送消息到标签页 ${tabId}`)
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

// 获取当前标签页并执行回调 (deprecated, use getCurrentActiveTab instead)
export function withActiveTab(callback: (tab: chrome.tabs.Tab) => void) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      callback(tabs[0])
    } else {
      logger.warn("未找到活动标签页")
    }
  })
}

/**
 * 获取当前活动标签页
 * @returns Promise<chrome.tabs.Tab | null>
 */
export async function getCurrentActiveTab(): Promise<chrome.tabs.Tab | null> {
  try {
    const activeTabs = await chrome.tabs.query({
      active: true,
      currentWindow: true
    })
    if (activeTabs.length > 0) {
      logger.info("获取到当前活动标签页:", activeTabs[0].id)
      return activeTabs[0]
    } else {
      logger.warn("无法找到当前活动标签页")
      return null
    }
  } catch (error) {
    logger.error("查找活动标签页失败:", error)
    return null
  }
}

/**
 * 根据 URL 查找匹配的标签页
 * @param url 要匹配的 URL
 * @returns Promise<chrome.tabs.Tab | null>
 */
export async function findTabByUrl(
  url: string
): Promise<chrome.tabs.Tab | null> {
  try {
    const tabs = await chrome.tabs.query({ url })
    if (tabs.length > 0) {
      logger.info("找到匹配URL的标签页:", { url, tabId: tabs[0].id })
      return tabs[0]
    } else {
      logger.debug("没有找到匹配URL的标签页:", url)
      return null
    }
  } catch (error) {
    logger.error("查找匹配标签页失败:", error)
    return null
  }
}

/**
 * 智能获取目标标签页
 * 优先使用提供的 tabId，如果无效则尝试匹配 URL，最后使用当前活动标签页
 * @param tabId 原始 tabId
 * @param url 请求的 URL
 * @returns Promise<number | null> 返回有效的 tabId 或 null
 */
export async function getTargetTabId(
  tabId: number,
  url: string
): Promise<number | null> {
  // 如果 tabId 有效，直接使用
  if (tabId && tabId !== -1) {
    logger.debug("使用原始tabId:", tabId)
    return tabId
  }

  logger.debug("原始tabId无效，开始查找替代标签页:", tabId)

  // 尝试找到匹配 URL 的标签页
  const matchedTab = await findTabByUrl(url)
  if (matchedTab?.id) {
    return matchedTab.id
  }

  // 使用当前活动标签页
  const activeTab = await getCurrentActiveTab()
  if (activeTab?.id) {
    return activeTab.id
  }

  logger.warn("无法找到任何有效的标签页")
  return null
}
