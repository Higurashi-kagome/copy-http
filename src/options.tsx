import React, { useEffect, useState } from 'react'
import { Form, Switch, Button, Space, message, Card, Typography, Divider, ConfigProvider } from 'antd'
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons'
import { type AppSettings } from '~types'
import { getAppSettings, saveAppSettings, resetAppSettings } from '~utils/storage'
import { useTranslation } from 'react-i18next'
import zhCN from 'antd/es/locale/zh_CN'
import enUS from 'antd/es/locale/en_US'
import './i18n'
import {logger} from "~utils/logger";

const { Title, Text } = Typography

const OptionsPage: React.FC = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState<AppSettings>({
    enableMatchNotifications: true,
    enableAutoCopy: true
  })

  const { t } = useTranslation()

  // 加载设置
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const loadedSettings = await getAppSettings()
        setSettings(loadedSettings)
        form.setFieldsValue(loadedSettings)
      } catch (error) {
        logger.error(error)
        message.error(t('loadSettingsFailed'))
      }
    }
    loadSettings()
  }, [form])

  // 保存设置
  const handleSave = async (values: AppSettings) => {
    setLoading(true)
    try {
      await saveAppSettings(values)
      setSettings(values)
      message.success(t('settingsSaved'))
    } catch (error) {
      message.error(t('settingsSaveFailed'))
    } finally {
      setLoading(false)
    }
  }

  // 重置设置
  const handleReset = async () => {
    setLoading(true)
    try {
      await resetAppSettings()
      const defaultSettings = await getAppSettings()
      setSettings(defaultSettings)
      form.setFieldsValue(defaultSettings)
      message.success(t('settingsReset'))
    } catch (error) {
      message.error(t('settingsResetFailed'))
    } finally {
      setLoading(false)
    }
  }

  // 根据当前语言获取 antd 的语言配置
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

  return (
    <ConfigProvider locale={getAntdLocale()}>
      <div style={{
        padding: '24px',
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <Card>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '32px' }}>
            {t('extensionSettings')}
          </Title>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
            initialValues={settings}
            size="large"
          >
            {/* 通知设置 */}
            <Card
              title={t('notificationSettings')}
              size="small"
              style={{ marginBottom: '24px' }}
            >
              <Form.Item
                name="enableMatchNotifications"
                label={
                  <Space direction="vertical" size={0}>
                    <Text strong>{t('enableNotifications')}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {t('enableNotificationsDesc')}
                    </Text>
                  </Space>
                }
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

            </Card>

            {/* 复制设置 */}
            <Card
              title={t('copySettings')}
              size="small"
              style={{ marginBottom: '32px' }}
            >
              <Form.Item
                name="enableAutoCopy"
                label={
                  <Space direction="vertical" size={0}>
                    <Text strong>{t('enableAutoCopy')}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {t('enableAutoCopyDesc')}
                    </Text>
                  </Space>
                }
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Card>

            {/* 操作按钮 */}
            <Form.Item>
              <Space size="large">
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loading}
                  size="large"
                >
                  {t('saveSettings')}
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleReset}
                  loading={loading}
                  size="large"
                >
                  {t('resetSettings')}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>

        <Divider />

        {/* 帮助信息 */}
        <Card title={t('help')} size="small">
          <Space direction="vertical" size="small">
            <Text>
              <Text strong>{t('enableNotifications')}：</Text>
              {t('notificationHelp')}
            </Text>
            <Text>
              <Text strong>{t('enableAutoCopy')}：</Text>
              {t('autoCopyHelp')}
            </Text>
          </Space>
        </Card>
      </div>
    </ConfigProvider>
  )
}

export default OptionsPage
