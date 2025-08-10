import { logger } from "~utils/logger"
import { getRules } from "~utils/storage"
import { handleMatchResult } from "~utils/matchingUtils"

export function handleRequestParams() {
    chrome.webRequest.onBeforeRequest.addListener(
        (details) => {
            logger.debug("收到请求:", details.url)

            getRules().then(async (rules) => {
                for (const [ruleIndex, rule] of rules.entries()) {
                    // 只处理启用的请求参数规则
                    if (!rule.enabled || rule.type !== 'requestParam' || !rule.paramName) {
                        continue
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
                                    // 使用通用的匹配结果处理函数
                                    await handleMatchResult({
                                        ruleType: 'requestParam',
                                        urlPattern: rule.urlPattern,
                                        value: paramValue,
                                        url: details.url,
                                        paramName: rule.paramName,
                                        ruleIndex,
                                        rules
                                    })
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
                }
            })
        },
        { urls: ["<all_urls>"] }
    )
}
