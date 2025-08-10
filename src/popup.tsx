import React, { useEffect, useState, useRef } from 'react'
import type { Rule, RuleGroup } from "~types"
import { Button, Input, Select, Switch, message, notification, Popover, Modal, Radio, Space, Tour, ConfigProvider } from 'antd'
import { PlusOutlined, DeleteOutlined, CopyOutlined, QuestionCircleOutlined, HistoryOutlined, SettingOutlined } from '@ant-design/icons'
import { copyToClipboard } from "~utils/clipboard"
import zhCN from 'antd/es/locale/zh_CN'
import enUS from 'antd/es/locale/en_US'
import './style.css'
import CustomSelect from './components/CustomSelect'
import { commonHeaders, commonResponseHeaders, getRuleTypes } from '~constants'
import type { TourStepProps } from 'antd'
import { useTranslation } from 'react-i18next';
import './i18n';

const DeleteGroupModal: React.FC<{
  groupId: string;
  groupName: string;
  rulesInGroup: number;
  onConfirm: (option: 'ungroup' | 'delete') => void;
  onCancel: () => void;
}> = ({ groupId, groupName, rulesInGroup, onConfirm, onCancel }) => {
  const [deleteOption, setDeleteOption] = useState<'ungroup' | 'delete'>('ungroup')
  const { t } = useTranslation();

  return (
    <Modal
      title={t('deleteGroup')}
      open={true}
      onOk={() => onConfirm(deleteOption)}
      onCancel={onCancel}
      okText={t('confirm')}
      cancelText={t('cancel')}
      okButtonProps={{ danger: true }}
    >
      <div>
        <p>{t('deleteGroupConfirm', { name: groupName })}</p>
        {rulesInGroup > 0 && (
          <div className="delete-group-options">
            <p>{t('deleteGroupRules', { count: rulesInGroup })}</p>
            <Radio.Group
              value={deleteOption}
              onChange={e => setDeleteOption(e.target.value as 'ungroup' | 'delete')}
            >
              <Space direction="vertical">
                <Radio value="ungroup">{t('ungroupRules')}</Radio>
                <Radio value="delete">{t('deleteRules')}</Radio>
              </Space>
            </Radio.Group>
          </div>
        )}
      </div>
    </Modal>
  )
}

// CustomSelect 组件
const PopupPage: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>([])
  const [groups, setGroups] = useState<RuleGroup[]>([])
  const [selectedGroup, setSelectedGroup] = useState<string>('all')
  const [newGroupName, setNewGroupName] = useState('')
  const [showNewGroup, setShowNewGroup] = useState(false)
  const [deleteGroupInfo, setDeleteGroupInfo] = useState<{ id: string; name: string } | null>(null)
  const [headerValues, setHeaderValues] = useState<{ [key: number]: string | undefined }>({})
  const [api, contextHolder] = notification.useNotification()
  const [isTourOpen, setIsTourOpen] = useState(false)

  const groupSectionRef = useRef<HTMLDivElement>(null)
  const rulesSectionRef = useRef<HTMLDivElement>(null)
  const addRuleBtnRef = useRef<HTMLButtonElement>(null)
  const ruleItemRefs = useRef<(HTMLDivElement | null)[]>([])

  const { t } = useTranslation();

  const ruleTypes = getRuleTypes();

  // 加载规则和分组
  useEffect(() => {
    chrome.storage.local.get(['rules', 'groups', 'selectedGroup'], (result) => {
      setRules(result.rules || [])
      setGroups(result.groups || [])
      setSelectedGroup(result.selectedGroup || 'all')
    })
  }, [])

  // 保存规则
  const saveRules = (newRules: Rule[]) => {
    setRules(newRules)
    chrome.storage.local.set({ rules: newRules })
  }

  // 保存分组
  const saveGroups = (newGroups: RuleGroup[]) => {
    setGroups(newGroups)
    chrome.storage.local.set({ groups: newGroups })
  }

  // 保存选中的分组
  const handleGroupChange = (value: string) => {
    setSelectedGroup(value)
    chrome.storage.local.set({ selectedGroup: value })
  }

  // 添加新规则
  const addRule = () => {
    const newRule: Rule = {
      type: 'header',
      urlPattern: '',
      headerName: '',
      enabled: true,
      group: selectedGroup === 'all' ? undefined : selectedGroup
    }
    saveRules([...rules, newRule])
  }

  // 添加新分组
  const addGroup = () => {
    if (!newGroupName.trim()) {
      message.error(t('groupNameRequired'))
      return
    }
    const newGroup: RuleGroup = {
      id: Date.now().toString(),
      name: newGroupName.trim()
    }
    saveGroups([...groups, newGroup])
    setNewGroupName('')
    setShowNewGroup(false)
  }

  // 更新规则
  const updateRule = (index: number, field: keyof Rule, value: any) => {
    const newRules = [...rules]
    // 找到在当前分组中的规则的实际索引
    const filteredRules = rules.filter(rule =>
      selectedGroup === 'all' || rule.group === selectedGroup
    )
    const targetRule = filteredRules[index]
    const actualIndex = rules.findIndex(r => r === targetRule)

    if (actualIndex !== -1) {
      newRules[actualIndex] = { ...newRules[actualIndex], [field]: value }
      saveRules(newRules)
    }
  }

  // 删除规则
  const deleteRule = (index: number) => {
    // 找到在当前分组中的规则的实际索引
    const filteredRules = rules.filter(rule =>
      selectedGroup === 'all' || rule.group === selectedGroup
    )
    const targetRule = filteredRules[index]
    const actualIndex = rules.findIndex(r => r === targetRule)

    if (actualIndex !== -1) {
      const newRules = rules.filter((_, i) => i !== actualIndex)
      saveRules(newRules)
    }
  }

  // 删除分组
  const handleDeleteGroup = (groupId: string, groupName: string) => {
    setDeleteGroupInfo({ id: groupId, name: groupName })
  }

  const handleDeleteGroupConfirm = (option: 'ungroup' | 'delete') => {
    if (!deleteGroupInfo) return

    const { id: groupId } = deleteGroupInfo

    // 移除分组
    const newGroups = groups.filter(g => g.id !== groupId)
    saveGroups(newGroups)

    // 处理规则
    const newRules = rules.filter(rule => {
      if (rule.group !== groupId) return true
      return option === 'ungroup'
    }).map(rule => {
      if (rule.group === groupId && option === 'ungroup') {
        return { ...rule, group: undefined }
      }
      return rule
    })
    saveRules(newRules)

    // 如果当前选中的是被删除的分组，切换到全部
    if (selectedGroup === groupId) {
      handleGroupChange('all')
    }

    message.success(
      option === 'ungroup'
        ? t('deleteGroupSuccess_ungroup')
        : t('deleteGroupSuccess_delete')
    )

    setDeleteGroupInfo(null)
  }

  // 过滤规则
  const filteredRules = rules.filter(rule =>
    selectedGroup === 'all' || rule.group === selectedGroup
  )

  const copyValue = async (value: string) => {
    const success = await copyToClipboard(value);
    if (success) {
      api.success({
        message: t('copySuccess'),
        description: t('clipboardCopied')
      });
    } else {
      api.error({
        message: t('copyFail'),
        description: t('pleaseTryAgain')
      });
    }
  };

  const openHistoryPage = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('tabs/history.html') });
  };

  const handleHeaderChange = (value: string, index: number) => {
    setHeaderValues(prev => ({ ...prev, [index]: value }))
    updateRule(index, "headerName", value)
  }

  const handleHeaderSearch = (value: string, index: number) => {
    if (value) {
      setHeaderValues(prev => ({ ...prev, [index]: value }))
    }
  }

  const handleHeaderBlur = (index: number) => {
    const headerValue = headerValues[index]
    if (headerValue) {
      updateRule(index, "headerName", headerValue)
    }
  }

  // 打开选项页面
  const openOptionsPage = () => {
    chrome.runtime.openOptionsPage()
  }

  const tourSteps: TourStepProps[] = [
    {
      title: t('tour_groupSelect'),
      description: t('tour_groupSelectDesc'),
      target: () => groupSectionRef.current!
    },
    {
      title: t('tour_ruleList'),
      description: t('tour_ruleListDesc'),
      target: () => rulesSectionRef.current!
    },
    {
      title: t('tour_addRuleBtn'),
      description: t('tour_addRuleBtnDesc'),
      target: () => addRuleBtnRef.current!
    }
  ]

  // 如果有规则项，添加对规则各输入项的说明
  if (rules.length > 0) {
    tourSteps.push(
      {
        title: t('tour_enableSwitch'),
        description: t('tour_enableSwitchDesc'),
        target: () => ruleItemRefs.current[0]?.querySelector('.ant-switch') as HTMLElement
      },
      {
        title: t('tour_typeSelect'),
        description: t('tour_typeSelectDesc'),
        target: () => ruleItemRefs.current[0]?.querySelector('.type-select') as HTMLElement
      },
      {
        title: t('tour_grouping'),
        description: t('tour_groupingDesc'),
        target: () => ruleItemRefs.current[0]?.querySelector('.group-select') as HTMLElement
      },
      {
        title: t('tour_urlRegex'),
        description: t('tour_urlRegexDesc'),
        target: () => ruleItemRefs.current[0]?.querySelector('.url-pattern-input') as HTMLElement
      },
      {
        title: t('tour_matchingValue'),
        description: t('tour_matchingValueDesc'),
        target: () => ruleItemRefs.current[0]?.querySelector('.match-value-input,.header-select') as HTMLElement
      }
    )
    const lastValue = ruleItemRefs.current[0]?.querySelector('.last-value') as HTMLElement
    if (lastValue) {
      tourSteps.push({
        title: t('tour_recentCapture'),
        description: t('tour_recentCaptureDesc'),
        target: () => lastValue
      })
    }
    tourSteps.push({
      title: t('tour_deleteRule'),
      description: t('tour_deleteRuleDesc'),
      target: () => ruleItemRefs.current[0]?.querySelector('.ant-btn-dangerous') as HTMLElement
    })
  }

  // 根据当前语言获取 antd 的语言配置
  const getAntdLocale = () => {
    const currentLang = chrome.i18n.getUILanguage().split('-')[0];
    switch (currentLang) {
      case 'zh':
        return zhCN;
      case 'en':
      default:
        return enUS;
    }
  };

  // 修改辅助函数来只在当前分组的规则中查找最新匹配
  const isLatestMatch = (currentRule: Rule) => {
    if (!currentRule.lastValue) return false;
    
    const currentTimestamp = new Date(currentRule.lastValue.timestamp).getTime();
    
    // 获取当前分组的规则
    const currentGroupRules = rules.filter(rule =>
      selectedGroup === 'all' || rule.group === selectedGroup
    );
    
    // 在当前分组的规则中查找是否有更新的匹配
    return !currentGroupRules.some(rule => 
      rule.lastValue && 
      new Date(rule.lastValue.timestamp).getTime() > currentTimestamp
    );
  };

  return (
    <ConfigProvider locale={getAntdLocale()}>
      <div className="popup-container">
        {contextHolder}
        {deleteGroupInfo && (
          <DeleteGroupModal
            groupId={deleteGroupInfo.id}
            groupName={deleteGroupInfo.name}
            rulesInGroup={rules.filter(rule => rule.group === deleteGroupInfo.id).length}
            onConfirm={handleDeleteGroupConfirm}
            onCancel={() => setDeleteGroupInfo(null)}
          />
        )}
        <div className="group-section" ref={groupSectionRef}>
          <Select
            className="group-select"
            value={selectedGroup}
            onChange={handleGroupChange}
            options={[
              { label: t('allRules'), value: 'all' },
              ...groups.map(g => ({
                label: (
                  <div className="group-option">
                    <span>{g.name}</span>
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteGroup(g.id, g.name)
                      }}
                    />
                  </div>
                ),
                value: g.id
              }))
            ]}
          />
          {showNewGroup ? (
            <div className="new-group-form">
              <Input
                placeholder={t('groupName')}
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                onPressEnter={addGroup}
              />
              <Button type="primary" onClick={addGroup}>{t('confirm')}</Button>
              <Button onClick={() => setShowNewGroup(false)}>{t('cancel')}</Button>
            </div>
          ) : (
            <>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowNewGroup(true)}>
                {t('newGroup')}
              </Button>
              <Button
                shape='circle'
                icon={<QuestionCircleOutlined />}
                onClick={() => setIsTourOpen(true)}
              >
              </Button>
              <Button
                shape='circle'
                icon={<SettingOutlined />}
                onClick={openOptionsPage}
                title={t('openSettings') || '打开设置'}
              >
              </Button>
            </>
          )}
        </div>

        <div className="rules-section" ref={rulesSectionRef}>
          {filteredRules.map((rule, index) => (
            <div key={index} className="rule-item" ref={el => ruleItemRefs.current[index] = el}>
              <div className="rule-header">
                <Switch
                  checked={rule.enabled}
                  onChange={(checked) => updateRule(index, "enabled", checked)}
                />
                <Select
                  className="type-select"
                  value={rule.type}
                  onChange={(value) => updateRule(index, "type", value)}
                  options={ruleTypes}
                />
                <Select
                  className="group-select"
                  value={rule.group || 'none'}
                  onChange={(value) => {
                    updateRule(index, "group", value === 'none' ? undefined : value);
                    if (selectedGroup !== 'all') {
                      const targetGroupName = value === 'none' 
                        ? t('ruleMovedToNoGroup')
                        : t('ruleMovedToGroup', { name: groups.find(g => g.id === value)?.name });
                      message.info(targetGroupName);
                    }
                  }}
                  options={[
                    { label: t('noGroup'), value: 'none' },
                    ...groups.map(g => ({ label: g.name, value: g.id }))
                  ]}
                />
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => deleteRule(index)}
                />
              </div>

              <Input
                className="url-pattern-input"
                placeholder={t('urlPattern')}
                value={rule.urlPattern}
                onChange={(e) => updateRule(index, "urlPattern", e.target.value)}
              />

              {(rule.type === 'url' || rule.type === 'requestBody') ? (
                <Input
                  className="match-value-input"
                  placeholder={rule.type === 'url' ? 
                    t('matchValue', { name: '$1' }) : 
                    t('regexOrJsonPath', { name: '$.data.id' })}
                  value={rule.matchValue || ''}
                  onChange={(e) => updateRule(index, "matchValue", e.target.value)}
                />
              ) : rule.type === 'requestParam' ? (
                <Input
                  placeholder={t('paramName')}
                  value={rule.paramName || ''}
                  onChange={(e) => updateRule(index, "paramName", e.target.value)}
                />
              ) : (
                <CustomSelect
                  className="header-select"
                  allowClear
                  showSearch
                  placeholder={t('headerSelect')}
                  value={headerValues[index] || rule.headerName}
                  onCustomChange={(value) => handleHeaderChange(value, index)}
                  onSearch={(value) => handleHeaderSearch(value, index)}
                  onBlur={() => handleHeaderBlur(index)}
                  options={rule.type === 'responseHeader' ? commonResponseHeaders : commonHeaders}
                />
              )}

              {rule.lastValue && (
                <div className={`last-value ${isLatestMatch(rule) ? 'highlight' : ''}`}>
                  <div className="value-content">
                    <Popover
                      content={
                        <div className="value-popover">
                          <div className="value-popover-text">{rule.lastValue.value}</div>
                          <Button
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={() => copyValue(rule.lastValue.value)}
                          >
                            {t('copy')}
                          </Button>
                        </div>
                      }
                      trigger="hover"
                      placement="bottom"
                    >
                      <div className="value-text">{t('lastMatch')}{rule.lastValue.value}</div>
                    </Popover>
                    <div className="value-time">{t('matchTime')}{rule.lastValue.timestamp}</div>
                  </div>
                  <div className="last-value-actions">
                    <Button
                      type="text"
                      size="small"
                      icon={<CopyOutlined />}
                      onClick={() => copyValue(rule.lastValue.value)}
                    />
                    <Button
                      type="text"
                      size="small"
                      icon={<HistoryOutlined />}
                      onClick={openHistoryPage}
                      title={t('viewHistory')}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          <Button
            type="dashed"
            className="add-rule-btn"
            icon={<PlusOutlined />}
            onClick={addRule}
            ref={addRuleBtnRef}
          >
            {t('addRule')}
          </Button>
        </div>

        <Tour open={isTourOpen} onClose={() => setIsTourOpen(false)} steps={tourSteps} />
      </div>
    </ConfigProvider>
  )
}

export default PopupPage
