import type { PlasmoCSConfig } from "plasmo"
import { copyToClipboard } from "~utils/clipboard"
import "./content.css"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

// 监听来自 background 的消息
function setupMessageListener() {
  console.log("设置消息监听器")
  try {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log("收到消息:", request)
      if (request.action === 'copyToClipboard') {
        // 使用 async/await 包装异步操作
        (async () => {
          try {
            console.log("处理复制请求:", request.text)
            const success = await copyToClipboard(request.text)
            console.log("发送响应:", { success })
            sendResponse({ success })
            if (success && request.showNotification) {
              console.log("显示复制通知")
              showCopyNotification()
            }
          } catch (error) {
            console.error("复制操作失败:", error)
            sendResponse({ success: false })
          }
        })()
        return true // 保持消息通道开启，等待异步操作完成
      }
    })
    console.log("消息监听器设置成功")
  } catch (e) {
    console.error('设置消息监听器失败:', e)
    if (e.message.includes('Extension context invalidated')) {
      console.log("扩展上下文失效，将在1秒后重试")
      setTimeout(setupMessageListener, 1000)
    }
  }
}

function showCopyNotification() {
  console.log("创建复制通知元素")
  const notification = document.createElement('div')
  notification.className = 'copy-notification'
  notification.innerText = '内容已复制'
  document.body.appendChild(notification)
  setTimeout(() => {
    notification.style.opacity = '1'
  }, 10)
  setTimeout(() => {
    notification.style.opacity = '0'
    setTimeout(() => {
      document.body.removeChild(notification)
      console.log("复制通知元素已移除")
    }, 500)
  }, 2000)
}

setupMessageListener()

// 页面加载完成后执行的代码
window.addEventListener("load", () => {
  console.log("Dev Trigger content script 已加载")
})
