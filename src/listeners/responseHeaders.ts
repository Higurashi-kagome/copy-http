import { logger } from "~utils/logger"
import { getRules } from "~utils/storageUtils"
import { copyToClipboardV2 } from "~utils/clipboard"
import { addHistoryRecord } from "~utils/historyUtils"

export function handleResponseHeaders() {
    chrome.webRequest.onHeadersReceived.addListener(
        (details) => {
            logger.debug("收到响应:", details.url)

            getRules().then((rules) => {
                rules.forEach((rule, ruleIndex) => {
                    // 只处理启用的规则且类型为responseHeader的规则
                    if (!rule.enabled || rule.type !== 'responseHeader') {
                        logger.debug(`规则 ${ruleIndex + 1} 已禁用或非响应头规则，跳过`)
                        return
                    }

                    try {
                        const urlPattern = new RegExp(rule.urlPattern)
                        if (urlPattern.test(details.url)) {
                            logger.info(`URL匹配规则 ${ruleIndex + 1}:`, rule.urlPattern)

                            const headerValue = details.responseHeaders?.find(
                                (header) =>
                                    header.name.toLowerCase() === rule.headerName.toLowerCase()
                            )?.value

                            if (headerValue) {
                                logger.info(`找到响应头 ${rule.headerName}:`, headerValue)

                                copyToClipboardV2(headerValue)

                                // 添加到历史记录
                                addHistoryRecord({
                                    ruleType: 'responseHeader',
                                    urlPattern: rule.urlPattern,
                                    headerName: rule.headerName,
                                    value: headerValue,
                                    timestamp: new Date().toLocaleString('zh-CN', { hour12: false }),
                                    url: details.url
                                })
                            } else {
                                logger.warn(`未找到响应头: ${rule.headerName}`)
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
        ["responseHeaders"]
    )
}
