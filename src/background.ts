import { handleRequestHeaders } from '~listeners/requestHeaders'
import { handleUrlMatching } from '~listeners/urlMatching'
import { handleRequestBody } from '~listeners/requestBody'
import { handleRequestParams } from '~listeners/requestParams'
import { handleResponseHeaders } from '~listeners/responseHeaders'
import { logger } from "~utils/logger"
import OFFSCREEN_DOCUMENT_PATH from 'url:~src/offscreen.html'


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

async function createOffscreenDocument() {
    if (!await hasDocument()) {
        try {
            await chrome.offscreen.createDocument({
                url: OFFSCREEN_DOCUMENT_PATH,
                reasons: [chrome.offscreen.Reason.CLIPBOARD],
                justification: 'Write text to the clipboard.'
            });
        } catch (error) {
        }
    }
}

async function hasDocument() {
    // Check all windows controlled by the service worker if one of them is the offscreen document
    // @ts-ignore clients
    const matchedClients = await clients.matchAll()
    for (const client of matchedClients) {
        if (client.url.endsWith(OFFSCREEN_DOCUMENT_PATH)) {
            return true
        }
    }
    return false
}

createOffscreenDocument()