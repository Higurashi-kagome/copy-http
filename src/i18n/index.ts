import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import getMessage from './adapter';
import type { TFunction } from 'i18next';

i18n
  .use(initReactI18next)
  .init({
    lng: 'zh', // 默认语言
    fallbackLng: 'zh',
    interpolation: {
      escapeValue: false
    }
  });

// 重写 t 函数，使用 chrome.i18n.getMessage
const originalTFunction = i18n.t.bind(i18n);
(i18n.t as any) = Object.assign(
  (key: string, options?: any) => getMessage(key, options),
  originalTFunction
) as TFunction;

export default i18n; 