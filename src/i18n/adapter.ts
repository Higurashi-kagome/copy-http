// 从 chrome.i18n 获取消息
const getMessage = (key: string, substitutions?: any) => {
  // 如果有替换参数
  if (substitutions) {
    if (typeof substitutions === 'object') {
      // 将命名参数转换为数组形式，并确保所有值都是字符串
      const args = Object.values(substitutions).map(value => String(value));
      return chrome.i18n.getMessage(key, args);
    }
    // 如果是单个值，转换为字符串并包装为数组
    return chrome.i18n.getMessage(key, [String(substitutions)]);
  }
  return chrome.i18n.getMessage(key);
};

export default getMessage; 