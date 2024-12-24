import type { Rule } from "~types"

export const getRules = (): Promise<Rule[]> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['rules'], (result) => {
      resolve(result.rules || [])
    })
  })
}