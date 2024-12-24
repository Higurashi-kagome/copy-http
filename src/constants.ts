import { useTranslation } from 'react-i18next';

export const getRuleTypes = () => {
  const { t } = useTranslation();
  return [
    { label: t('ruleType_header'), value: 'header' },
    { label: t('ruleType_responseHeader'), value: 'responseHeader' },
    { label: t('ruleType_url'), value: 'url' },
    { label: t('ruleType_requestParam'), value: 'requestParam' },
    { label: t('ruleType_requestBody'), value: 'requestBody' }
  ];
};

// 常用请求头列表
export const commonHeaders = [
  { label: "Authorization", value: "Authorization" },
  { label: "Content-Type", value: "Content-Type" },
  { label: "Accept", value: "Accept" },
  { label: "User-Agent", value: "User-Agent" },
  { label: "X-Requested-With", value: "X-Requested-With" },
  { label: "Origin", value: "Origin" },
  { label: "Referer", value: "Referer" },
  { label: "Cookie", value: "Cookie" },
  { label: "Accept-Encoding", value: "Accept-Encoding" },
  { label: "Accept-Language", value: "Accept-Language" },
  { label: "Connection", value: "Connection" },
  { label: "Host", value: "Host" }
];

export const commonResponseHeaders = [
  { label: "Content-Type", value: "Content-Type" },
  { label: "Content-Encoding", value: "Content-Encoding" },
  { label: "Content-Length", value: "Content-Length" },
  { label: "Cache-Control", value: "Cache-Control" },
  { label: "ETag", value: "ETag" },
  { label: "Last-Modified", value: "Last-Modified" },
  { label: "Server", value: "Server" },
  { label: "Set-Cookie", value: "Set-Cookie" },
  { label: "Expires", value: "Expires" },
  { label: "Location", value: "Location" },
  { label: "Date", value: "Date" }
];
