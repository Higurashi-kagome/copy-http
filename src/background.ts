import { handleRequestHeaders } from '~listeners/requestHeaders'
import { handleUrlMatching } from '~listeners/urlMatching'
import { handleRequestBody } from '~listeners/requestBody'
import { handleRequestParams } from '~listeners/requestParams'
import { handleResponseHeaders } from '~listeners/responseHeaders'
import { logger } from "~utils/logger"

// 初始化监听器
async function initListeners() {
  
  // 处理 URL 匹配规则
  handleUrlMatching()
  
  // 监听请求体
  handleRequestBody()
  
  // 监听请求参数
  handleRequestParams()
  
  // 监听请求头
  handleRequestHeaders()
  
  // 监听响应头
  handleResponseHeaders()
  
}

// 监听存储变化，重新初始化监听器
chrome.storage.onChanged.addListener((changes) => {
  if (changes.rules) {
    logger.info("规则已更新", changes.rules.newValue)
  }
})

// 首次初始化
initListeners()
