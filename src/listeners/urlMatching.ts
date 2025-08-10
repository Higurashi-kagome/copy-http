import { logger } from "~utils/logger"
import { getRules } from "~utils/storage"
import { handleMatchResult } from "~utils/matchingUtils"

export function handleUrlMatching() {
  chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
      logger.debug("收到请求:", details.url)
      
      getRules().then(async (rules) => {
        for (const [ruleIndex, rule] of rules.entries()) {
          // 只处理启用的 URL 规则
          if (!rule.enabled || rule.type !== "url") {
            continue
          }

          try {
            const urlPattern = new RegExp(rule.urlPattern)
            const match = urlPattern.exec(details.url)
            if (match) {
              logger.info(`URL 匹配规则 ${ruleIndex + 1}:`, rule.urlPattern)

              // 替换匹配值中的 $n 为对应的捕获组
              let value = rule.matchValue || ""
              for (let i = 0; i <= match.length; i++) {
                value = value.replace(`$${i}`, match[i] || "")
              }

              if (value) {
                // 使用通用的匹配结果处理函数
                await handleMatchResult({
                  ruleType: "url",
                  urlPattern: rule.urlPattern,
                  value: value,
                  url: details.url,
                  ruleIndex,
                  rules
                })
              }
            } else {
              logger.debug(`URL 不匹配规则 ${ruleIndex + 1}:`, {
                rule: rule.urlPattern,
                url: details.url
              })
            }
          } catch (e) {
            logger.error(` 规则 ${ruleIndex + 1} 匹配错误:`, e)
          }
        }
      }).catch((error) => {
        logger.error("处理URL匹配时发生错误:", error)
      })
    },
    { urls: ["<all_urls>"] }
  )
}
