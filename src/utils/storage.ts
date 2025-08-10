import type { AppSettings, Rule, RuleGroup } from "~types"

// 默认设置
const defaultAppSettings: AppSettings = {
  enableMatchNotifications: true,
  enableAutoCopy: true
}

// 便捷的获取函数
export const getRules = (): Promise<Rule[]> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['rules'], (result) => {
      resolve(result.rules || [])
    })
  })
}

export const saveRules = (rules: Rule[]): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ rules }, () => {
      resolve()
    })
  })
}

export const getGroups = (): Promise<RuleGroup[]> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['groups'], (result) => {
      resolve(result.groups || [])
    })
  })
}

export const saveGroups = (groups: RuleGroup[]): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ groups }, () => {
      resolve()
    })
  })
}

export const getSelectedGroup = (): Promise<string> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['selectedGroup'], (result) => {
      resolve(result.selectedGroup || 'all')
    })
  })
}

export const saveSelectedGroup = (groupId: string): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ selectedGroup: groupId }, () => {
      resolve()
    })
  })
}

export const getAppSettings = (): Promise<AppSettings> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['appSettings'], (result) => {
      resolve({ ...defaultAppSettings, ...result.appSettings })
    })
  })
}

export const saveAppSettings = async (settings: Partial<AppSettings>): Promise<void> => {
  const current = await getAppSettings()
  const updated = { ...current, ...settings }
  return new Promise((resolve) => {
    chrome.storage.local.set({ appSettings: updated }, () => {
      resolve()
    })
  })
}

export const resetAppSettings = (): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ appSettings: defaultAppSettings }, () => {
      resolve()
    })
  })
}

// 单个设置项的获取和更新
export const getSetting = async <K extends keyof AppSettings>(
  key: K
): Promise<AppSettings[K]> => {
  const settings = await getAppSettings()
  return settings[key]
}

export const updateSetting = async <K extends keyof AppSettings>(
  key: K,
  value: AppSettings[K]
): Promise<void> => {
  const currentSettings = await getAppSettings()
  const updated = { ...currentSettings, [key]: value }
  return saveAppSettings(updated)
}
