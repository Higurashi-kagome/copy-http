export async function sendCopyMessageToOffscreen(text: string): Promise<void> {
  try {
    // 创建 offscreen 文档
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: [chrome.offscreen.Reason.CLIPBOARD],
      justification: 'Write text to clipboard'
    });

    // 发送消息到 offscreen 文档
    await chrome.runtime.sendMessage({
      type: 'copy-to-clipboard',
      target: 'offscreen-doc',
      data: text
    });

    return;
  } catch (error) {
    console.error('Offscreen clipboard error:', error);
    throw error;
  }
} 