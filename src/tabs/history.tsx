import React, { useEffect, useState, useMemo } from 'react'
import { Button, List, message, notification, ConfigProvider, Input, Modal } from 'antd'
import { CopyOutlined, ArrowLeftOutlined, SearchOutlined, DeleteOutlined } from '@ant-design/icons'
import { copyToClipboard } from "~utils/clipboard"
import zhCN from 'antd/es/locale/zh_CN'
import enUS from 'antd/es/locale/en_US'
import { useTranslation } from 'react-i18next'
import { getHistoryRecords, clearHistoryRecords, type HistoryRecord } from "~utils/historyUtils"
import '~i18n'
import '~style.css'

const HistoryPage: React.FC = () => {
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([])
  const [searchKeyword, setSearchKeyword] = useState('')
  const [clearModalVisible, setClearModalVisible] = useState(false)
  const [api, contextHolder] = notification.useNotification()
  const { t } = useTranslation()

  useEffect(() => {
    getHistoryRecords().then(records => {
      setHistoryRecords(records)
    })
  }, [])

  const copyValue = async (value: string) => {
    const success = await copyToClipboard(value)
    if (success) {
      api.success({
        message: t('copySuccess'),
        description: t('clipboardCopied')
      })
    } else {
      api.error({
        message: t('copyFail'),
        description: t('pleaseTryAgain')
      })
    }
  }

  const goBack = () => {
    window.close()
  }

  const handleClearHistory = async () => {
    try {
      await clearHistoryRecords()
      setHistoryRecords([])
      setClearModalVisible(false)
      api.success({
        message: t('clearHistorySuccess'),
        description: t('allHistoryCleared')
      })
    } catch (error) {
      api.error({
        message: t('clearHistoryFailed'),
        description: t('pleaseTryAgain')
      })
    }
  }

  // 搜索过滤逻辑
  const filteredRecords = useMemo(() => {
    if (!searchKeyword.trim()) {
      return historyRecords
    }
    
    const keyword = searchKeyword.toLowerCase().trim()
    return historyRecords.filter(record => {
      return (
        record.urlPattern.toLowerCase().includes(keyword) ||
        record.url.toLowerCase().includes(keyword) ||
        record.value.toLowerCase().includes(keyword) ||
        record.ruleType.toLowerCase().includes(keyword) ||
        (record.headerName && record.headerName.toLowerCase().includes(keyword)) ||
        (record.paramName && record.paramName.toLowerCase().includes(keyword)) ||
        record.timestamp.toLowerCase().includes(keyword)
      )
    })
  }, [historyRecords, searchKeyword])

  const getAntdLocale = () => {
    const currentLang = chrome.i18n.getUILanguage().split('-')[0]
    switch (currentLang) {
      case 'zh':
        return zhCN
      case 'en':
      default:
        return enUS
    }
  }

  const getRuleTypeText = (ruleType: string) => {
    switch (ruleType) {
      case 'header':
        return t('requestHeader')
      case 'responseHeader':
        return t('responseHeader')
      case 'requestParam':
        return t('requestParam')
      case 'url':
        return t('urlMatch')
      case 'requestBody':
        return t('requestBody')
      default:
        return ruleType
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <ConfigProvider locale={getAntdLocale()}>
      <div className="history-container">
        {contextHolder}
        <div className="history-header">
          <div className="history-header-left">
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={goBack}
              type="text"
            />
            <h2>{t('recentCaptures')}</h2>
          </div>
          <div className="history-header-right">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => setClearModalVisible(true)}
              disabled={historyRecords.length === 0}
            >
              {t('clearHistory')}
            </Button>
          </div>
        </div>
        
        <div className="history-search">
          <Input
            placeholder={t('searchHistoryPlaceholder')}
            prefix={<SearchOutlined />}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            allowClear
          />
        </div>
        
        <div className="history-content">
          <List
            dataSource={filteredRecords}
            renderItem={(record) => (
              <List.Item className="history-item">
                <div className="history-item-content">
                  <div className="history-item-header">
                    <span className="rule-type">{getRuleTypeText(record.ruleType)}</span>
                    <span className="timestamp">{formatTimestamp(record.timestamp)}</span>
                  </div>
                  
                  <div className="history-item-details">
                    <div className="url-pattern">
                      <strong>{t('urlPattern')}:</strong> {record.urlPattern}
                    </div>
                    <div className="matched-url">
                      <strong>{t('matchedUrl')}:</strong> {record.url}
                    </div>
                    {record.headerName && (
                      <div className="header-name">
                        <strong>{t('headerName')}:</strong> {record.headerName}
                      </div>
                    )}
                    {record.paramName && (
                      <div className="param-name">
                        <strong>{t('paramName')}:</strong> {record.paramName}
                      </div>
                    )}
                  </div>
                  
                  <div className="history-item-value">
                    <div className="value-text" title={record.value}>
                      <strong>{t('capturedValue')}:</strong> {record.value}
                    </div>
                    <Button
                      type="text"
                      size="small"
                      icon={<CopyOutlined />}
                      onClick={() => copyValue(record.value)}
                    >
                      {t('copy')}
                    </Button>
                  </div>
                </div>
              </List.Item>
            )}
            locale={{
              emptyText: searchKeyword ? t('noSearchResults') : t('noHistoryRecords')
            }}
          />
        </div>
        
        <Modal
          title={t('clearHistoryConfirm')}
          open={clearModalVisible}
          onOk={handleClearHistory}
          onCancel={() => setClearModalVisible(false)}
          okText={t('confirm')}
          cancelText={t('cancel')}
          okButtonProps={{ danger: true }}
        >
          <p>{t('clearHistoryWarning')}</p>
        </Modal>
      </div>
    </ConfigProvider>
  )
}

export default HistoryPage