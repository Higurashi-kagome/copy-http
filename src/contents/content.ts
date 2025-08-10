import type { PlasmoCSConfig } from "plasmo"
import { copyToClipboard } from "~utils/clipboard"
import "./content.css"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

// 防止通知堆叠的全局变量
let activeNotifications = {
  copy: null as HTMLElement | null,
  match: null as HTMLElement | null
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
      } else if (request.action === 'showMatchNotification') {
        console.log("显示匹配通知:", request.data)
        showMatchNotification(request.data)
        sendResponse({ success: true })
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
  
  // 如果已有复制通知，先移除
  if (activeNotifications.copy) {
    try {
      document.body.removeChild(activeNotifications.copy)
    } catch (e) {
      console.warn("移除旧复制通知失败:", e)
    }
    activeNotifications.copy = null
  }
  
  const notification = document.createElement('div')
  notification.className = 'copy-notification'
  notification.innerText = '内容已复制到剪贴板'
  activeNotifications.copy = notification
  
  document.body.appendChild(notification)
  
  setTimeout(() => {
    notification.style.opacity = '1'
  }, 10)
  
  setTimeout(() => {
    notification.style.opacity = '0'
    setTimeout(() => {
      if (activeNotifications.copy === notification) {
        try {
          document.body.removeChild(notification)
          activeNotifications.copy = null
        } catch (e) {
          console.warn("移除复制通知失败:", e)
        }
        console.log("复制通知元素已移除")
      }
    }, 300)
  }, 2000)
}

function showMatchNotification(data: { rulePattern: string, value: string, url: string }) {
  console.log("创建匹配通知元素")
  
  // 如果已有匹配通知，先移除
  if (activeNotifications.match) {
    try {
      document.body.removeChild(activeNotifications.match)
    } catch (e) {
      console.warn("移除旧匹配通知失败:", e)
    }
    activeNotifications.match = null
  }
  
  const notification = document.createElement('div')
  notification.className = 'match-notification'
  
  // 创建通知内容，避免显示过长的信息
  const patternText = data.rulePattern.length > 30 ? 
    data.rulePattern.substring(0, 30) + '...' : data.rulePattern
  const valueText = data.value.length > 50 ? 
    data.value.substring(0, 50) + '...' : data.value
  
  notification.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 4px;">✅ 规则匹配成功</div>
    <div style="font-size: 12px; opacity: 0.9;">模式: ${patternText}</div>
    <div style="font-size: 12px; opacity: 0.9;">提取值: ${valueText}</div>
  `
  
  activeNotifications.match = notification
  document.body.appendChild(notification)
  
  setTimeout(() => {
    notification.style.opacity = '1'
  }, 10)
  
  setTimeout(() => {
    notification.style.opacity = '0'
    setTimeout(() => {
      if (activeNotifications.match === notification) {
        try {
          document.body.removeChild(notification)
          activeNotifications.match = null
        } catch (e) {
          console.warn("移除匹配通知失败:", e)
        }
        console.log("匹配通知元素已移除")
      }
    }, 300)
  }, 3000)
}

setupMessageListener()

// 页面加载完成后执行的代码
window.addEventListener("load", () => {
  console.log("Copy Http content script 已加载")
  
  // 添加测试功能 - 按F12时显示测试通知
  document.addEventListener("keydown", (e) => {
    if (e.key === "F12" && e.ctrlKey) {
      e.preventDefault()
      console.log("测试匹配通知")
      showMatchNotification({
        rulePattern: "https://example\\.com/.*",
        value: "test-value-123",
        url: "https://example.com/test"
      })
    }
  })
})
