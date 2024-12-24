import { logger } from "~utils/logger"
import { sendMessageToTab, withActiveTab } from '~utils/tabUtils'
import { getRules } from "~utils/storageUtils"

export function handleUrlMatching() {
  chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
      logger.debug("收到URL请求:", details.url)
      getRules().then((rules) => {
        rules.forEach((rule, ruleIndex) => {
            // 只处理启用的URL规则
            if (!rule.enabled || rule.type !== 'url') {
              return
            }
    
            try {
              const urlPattern = new RegExp(rule.urlPattern)
              const match = urlPattern.exec(details.url)
              if (match) {
                logger.info(`URL匹配规则 ${ruleIndex + 1}:`, rule.urlPattern)
    
                // 替换匹配值中的$n为对应的捕获组
                let value = rule.matchValue || ''
                for (let i = 0; i <= match.length; i++) {
                  value = value.replace(`$${i}`, match[i] || '')
                }
    
                if (value) {
                  logger.info(`提取的URL值:`, value)
    
                  withActiveTab((tab) => {
                    sendMessageToTab(tab.id!, {
                      action: 'copyToClipboard',
                      text: value
                    })
                  })
    
                  const updatedRules = rules.map((r, idx) => {
                    if (idx === ruleIndex) {
                      return {
                        ...r,
                        lastValue: {
                          value: value,
                          timestamp: new Date().toLocaleString('zh-CN', { hour12: false })
                        }
                      }
                    }
                    return r
                  })
    
                  // 更新存储
                  chrome.storage.local.set({ rules: updatedRules })
                }
              } else {
                logger.debug(`URL不匹配规则 ${ruleIndex + 1}:`, {
                  rule: rule.urlPattern,
                  url: details.url
                })
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
