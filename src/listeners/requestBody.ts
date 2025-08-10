import { logger } from "~utils/logger"
import { JSONPath } from 'jsonpath-plus'
import { getRules } from "~utils/storage"
import { handleMatchResult } from "~utils/matchingUtils"

export function handleRequestBody() {
    chrome.webRequest.onBeforeRequest.addListener(
        (details) => {
            logger.debug("收到请求:", details.url)
            getRules().then(async (rules) => {
                for (const [ruleIndex, rule] of rules.entries()) {
                    // 只处理启用的请求体规则
                    if (!rule.enabled || rule.type !== 'requestBody') {
                        continue
                    }

                    try {
                        const urlPattern = new RegExp(rule.urlPattern)
                        if (urlPattern.test(details.url)) {
                            logger.info(`URL匹配规则 ${ruleIndex + 1}:`, rule.urlPattern)

                            let value: string | undefined

                            // 获取请求体内容
                            if (details.requestBody) {
                                let requestBodyStr: string | undefined

                                if (details.requestBody.raw?.[0]?.bytes) {
                                    // 处理原始请求体
                                    const decoder = new TextDecoder()
                                    try {
                                        requestBodyStr = decoder.decode(details.requestBody.raw[0].bytes)
                                    } catch (e) {
                                        logger.error('解码请求体失败:', e)
                                    }
                                } else if (details.requestBody.formData) {
                                    // 处理表单数据
                                    try {
                                        requestBodyStr = JSON.stringify(details.requestBody.formData)
                                    } catch (e) {
                                        logger.error('序列化表单数据失败:', e)
                                    }
                                }

                                if (requestBodyStr) {
                                    try {
                                        // 尝试作为 JSON 解析
                                        const jsonData = JSON.parse(requestBodyStr)
                                        try {
                                            // 先尝试用 JSONPath 匹配
                                            const result = JSONPath({ path: rule.matchValue || '', json: jsonData })
                                            value = Array.isArray(result) ? result[0] : result
                                            value = typeof value === 'string' ? value : JSON.stringify(value)
                                        } catch (e) {
                                            // JSONPath 匹配失败，使用正则表达式
                                            const regex = new RegExp(rule.matchValue || '')
                                            const match = requestBodyStr.match(regex)
                                            value = match?.[1] || match?.[0]
                                        }
                                    } catch (e) {
                                        // JSON 解析失败，直接用正则匹配
                                        const regex = new RegExp(rule.matchValue || '')
                                        const match = requestBodyStr.match(regex)
                                        value = match?.[1] || match?.[0]
                                    }
                                }
                            } else {
                                logger.warn("未找到请求体")
                            }

                            if (value !== undefined) {
                                // 使用通用的匹配结果处理函数
                                await handleMatchResult({
                                    ruleType: 'requestBody',
                                    urlPattern: rule.urlPattern,
                                    value: value as string,
                                    url: details.url,
                                    ruleIndex,
                                    rules
                                })
                            }
                        }
                    } catch (e) {
                        logger.error(`规则 ${ruleIndex + 1} 匹配错误:`, e)
                    }
                }
            })
        },
        { urls: ["<all_urls>"] },
        ["requestBody"]
    )
}
