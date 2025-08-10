import { logger } from "~utils/logger"
import { getRules } from "~utils/storage"
import { handleMatchResult } from "~utils/matchingUtils"

export function handleRequestHeaders() {
    chrome.webRequest.onBeforeSendHeaders.addListener(
        (details) => {
            logger.debug("收到请求:", details.url)

            getRules().then(async (rules) => {
                for (const [ruleIndex, rule] of rules.entries()) {
                    // 只处理启用的请求头规则
                    if (!rule.enabled || rule.type !== 'header') {
                        logger.debug(`规则 ${ruleIndex + 1} 已禁用或非请求头规则，跳过`)
                        continue
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
                                // 使用通用的匹配结果处理函数
                                await handleMatchResult({
                                    ruleType: 'header',
                                    urlPattern: rule.urlPattern,
                                    value: headerValue,
                                    url: details.url,
                                    headerName: rule.headerName,
                                    ruleIndex,
                                    rules
                                })
                            } else {
                                logger.warn(`未找到请求头: ${rule.headerName}`, details.requestHeaders)
                            }
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
                }
            })
        },
        { urls: ["<all_urls>"] },
        ["requestHeaders", "extraHeaders"]
    )
}
