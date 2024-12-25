import { sendMessageToTab, withActiveTab } from "./tabUtils";

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @returns 返回一个Promise，成功时返回true，失败时返回false
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('复制失败:', error);
        return false;
    }
}

export async function copyToClipboardV2(text: string): Promise<boolean> {
    try {
        copyToClipboardV3(text)
        return true
    } catch (error) {
        try {
            copyToClipboard(text)
            return true
        } catch (error) {
            withActiveTab((tab) => {
                sendMessageToTab(tab.id!, {
                    action: 'copyToClipboard',
                    text: text
                })
            })
            return true
        }
    }
}

export async function copyToClipboardV3(text: string): Promise<boolean> {
    chrome.runtime.sendMessage({
        type: 'copy-to-clipboard',
        target: 'offscreen-doc',
        data: text
    });

    return true;
}

