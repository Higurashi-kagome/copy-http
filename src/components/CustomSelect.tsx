import React, { useState } from 'react'
import { Select } from 'antd'
import type { SelectProps } from 'antd'

/**
 * CustomSelect 组件在 Select 组件的基础上，支持用户输入选项中没有的值。
 * 
 * @param {SelectProps} props - 传递给 Select 组件的属性
 * @param {function} [props.onCustomChange] - 当用户输入自定义值时的回调函数
 */
const CustomSelect: React.FC<SelectProps & { onCustomChange?: (value: string) => void }> = ({ onCustomChange, ...props }) => {
  const [inputValue, setInputValue] = useState<string | undefined>(undefined)

  const handleChange = (value: string) => {
    setInputValue(value)
    if (onCustomChange) {
      onCustomChange(value)
    }
  }

  const handleSearch = (value: string) => {
    setInputValue(value)
  }

  const handleBlur = () => {
    if (inputValue && onCustomChange) {
      onCustomChange(inputValue)
    }
  }

  return (
    <Select
      {...props}
      value={inputValue || props.value}
      onChange={handleChange}
      onSearch={handleSearch}
      onBlur={handleBlur}
    />
  )
}

export default CustomSelect
