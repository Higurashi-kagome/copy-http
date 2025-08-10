export interface Rule {
  type: 'header' | 'param' | 'responseHeader' | 'url' | 'requestBody' | 'requestParam'
  urlPattern: string
  headerName: string
  paramName?: string  // 用于存储请求参数名
  matchValue?: string  // 用于存储URL匹配时的提取表达式，如 $1，或者请求体的JSONPath/正则表达式
  enabled: boolean
  group?: string  // 规则所属分组
  lastValue?: {
    value: string
    timestamp: string
  }
}

// 分组相关类型
export interface RuleGroup {
  id: string
  name: string
  description?: string
}

// 应用配置选项
export interface AppSettings {
  enableMatchNotifications: boolean  // 是否启用匹配通知
  enableAutoCopy: boolean           // 是否自动复制匹配内容
}