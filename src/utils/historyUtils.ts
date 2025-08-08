interface HistoryRecord {
  id: string
  ruleType: string
  urlPattern: string
  headerName?: string
  paramName?: string
  value: string
  timestamp: string
  url: string
}

const MAX_HISTORY_RECORDS = 30

export const addHistoryRecord = (record: Omit<HistoryRecord, 'id'>) => {
  return new Promise<void>((resolve) => {
    chrome.storage.local.get(['historyRecords'], (result) => {
      const historyRecords: HistoryRecord[] = result.historyRecords || []
      
      // 创建新记录
      const newRecord: HistoryRecord = {
        ...record,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
      
      // 添加到数组开头
      historyRecords.unshift(newRecord)
      
      // 保持最多30条记录
      if (historyRecords.length > MAX_HISTORY_RECORDS) {
        historyRecords.splice(MAX_HISTORY_RECORDS)
      }
      
      // 保存到存储
      chrome.storage.local.set({ historyRecords }, () => {
        resolve()
      })
    })
  })
}

export const getHistoryRecords = (): Promise<HistoryRecord[]> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['historyRecords'], (result) => {
      resolve(result.historyRecords || [])
    })
  })
}

export const clearHistoryRecords = (): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ historyRecords: [] }, () => {
      resolve()
    })
  })
}

export type { HistoryRecord }