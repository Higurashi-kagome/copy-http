import { logger } from "~utils/logger"
import { getRules } from "~utils/storageUtils"
import { copyToClipboardV2 } from "~utils/clipboard"
import { addHistoryRecord } from "~utils/historyUtils"

export function handleRequestHeaders() {
    chrome.webRequest.onBeforeSendHeaders.addListener(
        (details) => {
            logger.debug("收到请求:", details.url)

            getRules().then((rules) => {
                rules.forEach((rule, ruleIndex) => {
                    // 只处理启用的请求头规则
                    if (!rule.enabled || rule.type !== 'header') {
                        logger.debug(`规则 ${ruleIndex + 1} 已禁用或非请求头规则，跳过`)
                        return
                    }

                    try {
                        const urlPattern = new RegExp(rule.urlPattern)
                        if (urlPattern.test(details.url)) {
                            logger.info(`URL匹配规则 ${ruleIndex + 1}:`, rule.urlPattern)

                            const headerValue = details.requestHeaders?.find(
                                (header) =>
                                    header.name.toLowerCase() === rule.headerName.toLowerCase()
                            )?.value

                            if (headerValue) {
                                logger.info(`找到请求头 ${rule.headerName}:`, headerValue)

                                copyToClipboardV2(headerValue)

                                // 添加到历史记录
                                addHistoryRecord({
                                    ruleType: 'header',
                                    urlPattern: rule.urlPattern,
                                    headerName: rule.headerName,
                                    value: headerValue,
                                    timestamp: new Date().toLocaleString('zh-CN', { hour12: false }),
                                    url: details.url
                                })
                            } else {
                                logger.warn(`未找到请求头: ${rule.headerName}`, details.requestHeaders)
                            }

                            const updatedRules = rules.map((r, idx) => {
                                if (idx === ruleIndex) {
                                    return {
                                        ...r,
                                        lastValue: {
                                            value: headerValue,
                                            timestamp: new Date().toLocaleString('zh-CN', { hour12: false })
                                        }
                                    }
                                }
                                return r
                            })

                            // 更新存储
                            chrome.storage.local.set({ rules: updatedRules })
                        } else {
                            logger.debug(`URL不匹配规则 ${ruleIndex + 1}:`, {
                                rule: rule.urlPattern,
                                url: details.url,
                                header: rule.headerName
                            })
                        }
                    } catch (e) {
                        logger.error(`规则 ${ruleIndex + 1} 匹配错误:`, e)
                    }
                })
            })
        },
        { urls: ["<all_urls>"] },
        ["requestHeaders", "extraHeaders"]
    )
}
