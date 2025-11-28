import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Table, Input, Select, Button, Space, Card, Tooltip, message } from 'antd'
import { SearchOutlined, ReloadOutlined, DownloadOutlined, SettingOutlined } from '@ant-design/icons'
import type { ColumnsType, TableProps } from 'antd/es/table'
import debounce from 'lodash/debounce'

interface OptimizedTableProps<T = any> extends Omit<TableProps<T>, 'columns'> {
  columns: ColumnsType<T>
  data: T[]
  loading?: boolean
  total?: number
  currentPage?: number
  pageSize?: number
  onPageChange?: (page: number, size: number) => void
  onSearch?: (searchParams: any) => void
  onRefresh?: () => void
  onExport?: () => void
  searchConfig?: {
    placeholder?: string
    searchFields?: Array<{
      name: string
      label: string
      type: 'input' | 'select'
      options?: Array<{ label: string; value: string }>
    }>
  }
  rowSelection?: any
  enableVirtualScroll?: boolean
  height?: number
}

const OptimizedTable: React.FC<OptimizedTableProps> = ({
  columns,
  data,
  loading = false,
  total = 0,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  onSearch,
  onRefresh,
  onExport,
  searchConfig,
  rowSelection,
  enableVirtualScroll = false,
  height,
  ...tableProps
}) => {
  const [searchParams, setSearchParams] = useState<any>({})
  const [localSearchValue, setLocalSearchValue] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    columns.map(col => col.key as string)
  )

  // 防抖搜索
  const debouncedSearch = useMemo(
    () => debounce((params: any) => {
      if (onSearch) {
        onSearch(params)
      }
    }, 500),
    [onSearch]
  )

  // 处理搜索
  const handleSearch = useCallback((params: any) => {
    const newParams = { ...searchParams, ...params }
    setSearchParams(newParams)
    debouncedSearch(newParams)
  }, [searchParams, debouncedSearch])

  // 处理输入搜索
  const handleInputChange = (value: string) => {
    setLocalSearchValue(value)
    handleSearch({ keyword: value })
  }

  // 重置搜索
  const handleReset = () => {
    setSearchParams({})
    setLocalSearchValue('')
    if (onSearch) {
      onSearch({})
    }
  }

  // 刷新数据
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh()
    } else {
      message.info('刷新功能开发中...')
    }
  }

  // 导出数据
  const handleExport = () => {
    if (onExport) {
      onExport()
    } else {
      message.info('导出功能开发中...')
    }
  }

  // 过滤列显示
  const filteredColumns = useMemo(() => {
    return columns.filter(col => visibleColumns.includes(col.key as string))
  }, [columns, visibleColumns])

  // 处理列显示切换
  const handleColumnToggle = (columnKey: string, checked: boolean) => {
    setVisibleColumns(prev => 
      checked 
        ? [...prev, columnKey]
        : prev.filter(key => key !== columnKey)
    )
  }

  // 分页配置
  const paginationConfig = useMemo(() => ({
    current: currentPage,
    pageSize: pageSize,
    total: total,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number, range: [number, number]) => 
      `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
    pageSizeOptions: ['10', '20', '50', '100'],
    onChange: onPageChange,
    onShowSizeChange: onPageChange
  }), [currentPage, pageSize, total, onPageChange])

  // 渲染搜索区域
  const renderSearchArea = () => {
    if (!searchConfig) return null

    return (
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap>
          {searchConfig.searchFields?.map(field => {
            if (field.type === 'input') {
              return (
                <Input
                  key={field.name}
                  placeholder={field.label}
                  value={searchParams[field.name] || ''}
                  onChange={(e) => handleSearch({ [field.name]: e.target.value })}
                  style={{ width: 200 }}
                />
              )
            } else if (field.type === 'select') {
              return (
                <Select
                  key={field.name}
                  placeholder={field.label}
                  value={searchParams[field.name]}
                  onChange={(value) => handleSearch({ [field.name]: value })}
                  style={{ width: 150 }}
                  allowClear
                >
                  {field.options?.map(option => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              )
            }
            return null
          })}
          
          <Input
            placeholder={searchConfig.placeholder || '搜索关键字'}
            value={localSearchValue}
            onChange={(e) => handleInputChange(e.target.value)}
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
          />
          
          <Button onClick={handleReset}>重置</Button>
        </Space>
      </Card>
    )
  }

  // 渲染操作栏
  const renderActionBar = () => (
    <Card size="small" style={{ marginBottom: 16 }}>
      <Space>
        <Tooltip title="刷新">
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
            loading={loading}
          />
        </Tooltip>
        
        <Tooltip title="导出">
          <Button 
            icon={<DownloadOutlined />} 
            onClick={handleExport}
          />
        </Tooltip>
        
        <Tooltip title="列设置">
          <Button 
            icon={<SettingOutlined />} 
            onClick={() => setShowSettings(!showSettings)}
          />
        </Tooltip>
      </Space>
    </Card>
  )

  // 渲染列设置面板
  const renderColumnSettings = () => {
    if (!showSettings) return null

    return (
      <Card size="small" style={{ marginBottom: 16, padding: '8px 16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: 8 }}>列显示设置</div>
        <Space wrap>
          {columns.map(col => (
            <label key={col.key} style={{ cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={visibleColumns.includes(col.key as string)}
                onChange={(e) => handleColumnToggle(col.key as string, e.target.checked)}
                style={{ marginRight: 4 }}
              />
              {col.title as string}
            </label>
          ))}
        </Space>
      </Card>
    )
  }

  // 表格配置
  const tableConfig = useMemo(() => {
    const config: TableProps<any> = {
      columns: filteredColumns,
      dataSource: data,
      loading: loading,
      pagination: paginationConfig,
      rowSelection: rowSelection,
      scroll: height ? { y: height } : undefined,
      size: 'middle',
      bordered: true,
      ...tableProps
    }

    // 虚拟滚动配置
    if (enableVirtualScroll && data.length > 100) {
      config.scroll = {
        ...config.scroll,
        y: height || 400
      }
    }

    return config
  }, [filteredColumns, data, loading, paginationConfig, rowSelection, height, enableVirtualScroll, tableProps])

  return (
    <div>
      {renderSearchArea()}
      {renderActionBar()}
      {renderColumnSettings()}
      
      <Table {...tableConfig} />
    </div>
  )
}

export default OptimizedTable