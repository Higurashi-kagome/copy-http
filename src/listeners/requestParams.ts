import { logger } from "~utils/logger"
import { getRules } from "~utils/storageUtils"
import { copyToClipboardV2 } from "~utils/clipboard"
import { addHistoryRecord } from "~utils/historyUtils"
import { sendMatchNotification } from "~utils/notificationUtils"

export function handleRequestParams() {
    chrome.webRequest.onBeforeRequest.addListener(
        (details) => {
            logger.debug("收到请求:", details.url)

            getRules().then((rules) => {
                rules.forEach((rule, ruleIndex) => {
                    // 只处理启用的请求参数规则
                    if (!rule.enabled || rule.type !== 'requestParam' || !rule.paramName) {
                        return
                    }

                    try {
                        const urlPattern = new RegExp(rule.urlPattern)
                        if (urlPattern.test(details.url)) {
                            logger.info(`URL匹配规则 ${ruleIndex + 1}:`, rule.urlPattern)

                            try {
                                // 解析 URL 获取参数
                                const url = new URL(details.url)
                                const paramValue = url.searchParams.get(rule.paramName)

                                if (paramValue) {
                                    logger.info(`找到参数 ${rule.paramName} 的值:`, paramValue)

                                    copyToClipboardV2(paramValue)

                                    // 添加到历史记录
                                    addHistoryRecord({
                                        ruleType: 'requestParam',
                                        urlPattern: rule.urlPattern,
                                        paramName: rule.paramName,
                                        value: paramValue,
                                        timestamp: new Date().toLocaleString('zh-CN', { hour12: false }),
                                        url: details.url
                                    })

                                    // 发送匹配成功通知
                                    sendMatchNotification(details.tabId, {
                                        ruleType: 'requestParam',
                                        rulePattern: rule.urlPattern,
                                        value: paramValue,
                                        url: details.url,
                                        paramName: rule.paramName
                                    })

                                    // 更新规则状态
                                    const updatedRules = rules.map((r, idx) => {
                                        if (idx === ruleIndex) {
                                            return {
                                                ...r,
                                                lastValue: {
                                                    value: paramValue,
                                                    timestamp: new Date().toLocaleString('zh-CN', { hour12: false })
                                                }
                                            }
                                        }
                                        return r
                                    })

                                    // 更新存储
                                    chrome.storage.local.set({ rules: updatedRules })
                                } else {
                                    logger.warn(`未找到参数 ${rule.paramName}`)
                                }
                            } catch (e) {
                                logger.error('解析 URL 失败:', e)
                            }
                        }
                    } catch (e) {
                        logger.error(`规则 ${ruleIndex + 1} 匹配错误:`, e)
                    }
                })
            })
        },
        { urls: ["<all_urls>"] }
    )
}
