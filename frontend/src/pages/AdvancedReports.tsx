import React, { useState, useEffect } from 'react'
import {
  Card,
  Row,
  Col,
  DatePicker,
  Button,
  Space,
  Table,
  Tabs,
  Typography,
  Statistic,
  Progress,
  Tag,
  Select,
  Spin,
  message,
  Modal,
  Tooltip,
  Alert
} from 'antd'
import {
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  ReloadOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { RangePicker } = DatePicker
const { TabPane } = Tabs

interface ReportData {
  basicStatistics: {
    totalCases: number
    completedCases: number
    processingCases: number
    pendingCases: number
    completionRate: number
    avgProcessingTime: number
  }
  failureModeAnalysis: Array<{
    failureMode: string
    count: number
    percentage: number
    avgSeverity: number
  }>
  severityAnalysis: {
    severityCount: Record<string, number>
    severityCost: Record<string, number>
    severityDistribution: Record<string, number>
  }
  timeTrendAnalysis: Array<{
    month: number
    year: number
    caseCount: number
    completedCount: number
    avgProcessingTime: number
  }>
  productAnalysis: Array<{
    productName: string
    productModel: string
    caseCount: number
    failureRate: number
    avgCost: number
  }>
  efficiencyAnalysis: {
    assigneeEfficiency: Array<{
      assigneeId: number
      assigneeName: string
      totalCases: number
      completedCases: number
      avgProcessingTime: number
      completionRate: number
    }>
    overallAvgProcessingTime: number
    overallCompletionRate: number
  }
  topFailureCases: Array<{
    id: number
    caseNumber: string
    title: string
    failureMode: string
    severityLevel: string
    failureDate: string
    status: string
    creator: string
    assignee: string
  }>
}

const AdvancedReports: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(1, 'year'),
    dayjs()
  ])
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadReportData()
  }, [dateRange])

  const loadReportData = async () => {
    if (!dateRange) return

    setLoading(true)
    try {
      const response = await fetch('/api/reports/failure-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startTime: dateRange[0].format('YYYY-MM-DD HH:mm:ss'),
          endTime: dateRange[1].format('YYYY-MM-DD HH:mm:ss')
        })
      })

      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      } else {
        message.error('加载报告数据失败')
      }
    } catch (error) {
      message.error('加载报告数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleExportExcel = async () => {
    if (!dateRange) return

    try {
      const response = await fetch('/api/reports/export/excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startTime: dateRange[0].format('YYYY-MM-DD HH:mm:ss'),
          endTime: dateRange[1].format('YYYY-MM-DD HH:mm:ss')
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `失效分析报告_${dateRange[0].format('YYYYMMDD')}_${dateRange[1].format('YYYYMMDD')}.xlsx`
        a.click()
        window.URL.revokeObjectURL(url)
        message.success('Excel报告导出成功')
      } else {
        message.error('导出Excel报告失败')
      }
    } catch (error) {
      message.error('导出Excel报告失败')
    }
  }

  const handleExportPDF = async () => {
    if (!dateRange) return

    try {
      const response = await fetch('/api/reports/export/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startTime: dateRange[0].format('YYYY-MM-DD HH:mm:ss'),
          endTime: dateRange[1].format('YYYY-MM-DD HH:mm:ss')
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `失效分析报告_${dateRange[0].format('YYYYMMDD')}_${dateRange[1].format('YYYYMMDD')}.pdf`
        a.click()
        window.URL.revokeObjectURL(url)
        message.success('PDF报告导出成功')
      } else {
        message.error('导出PDF报告失败')
      }
    } catch (error) {
      message.error('导出PDF报告失败')
    }
  }

  const getSeverityColor = (level: string): string => {
    const colors: Record<string, string> = {
      'low': '#52c41a',
      'medium': '#faad14',
      'high': '#ff7a45',
      'critical': '#ff4d4f'
    }
    return colors[level] || '#d9d9d9'
  }

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      'PENDING': '#d9d9d9',
      'PROCESSING': '#1890ff',
      'COMPLETED': '#52c41a',
      'CLOSED': '#8c8c8c'
    }
    return colors[status] || '#d9d9d9'
  }

  const pieColors = ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2']

  const topFailureCasesColumns: ColumnsType<any> = [
    {
      title: '案例编号',
      dataIndex: 'caseNumber',
      key: 'caseNumber',
      width: 150
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true
    },
    {
      title: '失效模式',
      dataIndex: 'failureMode',
      key: 'failureMode',
      width: 120
    },
    {
      title: '严重程度',
      dataIndex: 'severityLevel',
      key: 'severityLevel',
      width: 100,
      render: (level) => (
        <Tag color={getSeverityColor(level)}>
          {level.toUpperCase()}
        </Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status}
        </Tag>
      )
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
      width: 100
    },
    {
      title: '处理人',
      dataIndex: 'assignee',
      key: 'assignee',
      width: 100
    }
  ]

  const efficiencyColumns: ColumnsType<any> = [
    {
      title: '处理人',
      dataIndex: 'assigneeName',
      key: 'assigneeName',
      width: 120
    },
    {
      title: '总案例数',
      dataIndex: 'totalCases',
      key: 'totalCases',
      width: 100,
      sorter: (a, b) => a.totalCases - b.totalCases
    },
    {
      title: '已完成案例',
      dataIndex: 'completedCases',
      key: 'completedCases',
      width: 120,
      sorter: (a, b) => a.completedCases - b.completedCases
    },
    {
      title: '完成率',
      dataIndex: 'completionRate',
      key: 'completionRate',
      width: 120,
      render: (rate) => (
        <Progress percent={rate} size="small" />
      ),
      sorter: (a, b) => a.completionRate - b.completionRate
    },
    {
      title: '平均处理时间(天)',
      dataIndex: 'avgProcessingTime',
      key: 'avgProcessingTime',
      width: 150,
      sorter: (a, b) => a.avgProcessingTime - b.avgProcessingTime
    }
  ]

  if (!reportData) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <BarChartOutlined /> 高级分析报告
      </Title>

      {/* 控制面板 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col>
            <Text strong>时间范围：</Text>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as any)}
              format="YYYY-MM-DD"
            />
          </Col>
          <Col>
            <Button icon={<ReloadOutlined />} onClick={loadReportData}>
              刷新数据
            </Button>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<FileExcelOutlined />}
              onClick={handleExportExcel}
            >
              导出Excel
            </Button>
          </Col>
          <Col>
            <Button
              icon={<FilePdfOutlined />}
              onClick={handleExportPDF}
            >
              导出PDF
            </Button>
          </Col>
        </Row>
      </Card>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        {/* 总览 */}
        <TabPane tab="总览" key="overview">
          <Row gutter={[16, 16]}>
            {/* 基础统计 */}
            <Col span={24}>
              <Card title="基础统计">
                <Row gutter={16}>
                  <Col span={4}>
                    <Statistic
                      title="总案例数"
                      value={reportData.basicStatistics.totalCases}
                      prefix={<BarChartOutlined />}
                    />
                  </Col>
                  <Col span={4}>
                    <Statistic
                      title="已完成"
                      value={reportData.basicStatistics.completedCases}
                      prefix={<CheckCircleOutlined />}
                      valueStyle={{ color: '#3f8600' }}
                    />
                  </Col>
                  <Col span={4}>
                    <Statistic
                      title="处理中"
                      value={reportData.basicStatistics.processingCases}
                      prefix={<ClockCircleOutlined />}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Col>
                  <Col span={4}>
                    <Statistic
                      title="待处理"
                      value={reportData.basicStatistics.pendingCases}
                      prefix={<ExclamationCircleOutlined />}
                      valueStyle={{ color: '#faad14' }}
                    />
                  </Col>
                  <Col span={4}>
                    <Statistic
                      title="完成率"
                      value={reportData.basicStatistics.completionRate}
                      suffix="%"
                      prefix={<WarningOutlined />}
                      valueStyle={{ color: '#3f8600' }}
                    />
                  </Col>
                  <Col span={4}>
                    <Statistic
                      title="平均处理时间"
                      value={reportData.basicStatistics.avgProcessingTime}
                      suffix="天"
                      precision={1}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* 严重程度分布 */}
            <Col span={12}>
              <Card title="严重程度分布">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(reportData.severityAnalysis.severityCount).map(([key, value]) => ({
                        name: key.toUpperCase(),
                        value
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {Object.entries(reportData.severityAnalysis.severityCount).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            {/* 状态分布 */}
            <Col span={12}>
              <Card title="处理状态">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { name: '待处理', value: reportData.basicStatistics.pendingCases },
                      { name: '处理中', value: reportData.basicStatistics.processingCases },
                      { name: '已完成', value: reportData.basicStatistics.completedCases }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="value" fill="#1890ff" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            {/* 时间趋势 */}
            <Col span={24}>
              <Card title="时间趋势分析">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={reportData.timeTrendAnalysis.map(item => ({
                    month: `${item.year}-${String(item.month).padStart(2, '0')}`,
                    newCases: item.caseCount,
                    completedCases: item.completedCount,
                    avgTime: item.avgProcessingTime
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <RechartsTooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="newCases" stroke="#1890ff" name="新增案例" />
                    <Line yAxisId="left" type="monotone" dataKey="completedCases" stroke="#52c41a" name="完成案例" />
                    <Line yAxisId="right" type="monotone" dataKey="avgTime" stroke="#faad14" name="平均处理时间" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* 失效模式分析 */}
        <TabPane tab="失效模式分析" key="failure-modes">
          <Row gutter={[16, 16]}>
            <Col span={16}>
              <Card title="失效模式统计">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={reportData.failureModeAnalysis} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="failureMode" type="category" width={80} />
                    <RechartsTooltip />
                    <Bar dataKey="count" fill="#1890ff" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col span={8}>
              <Card title="失效模式详情">
                <Table
                  dataSource={reportData.failureModeAnalysis}
                  pagination={false}
                  size="small"
                  columns={[
                    {
                      title: '失效模式',
                      dataIndex: 'failureMode',
                      key: 'failureMode'
                    },
                    {
                      title: '数量',
                      dataIndex: 'count',
                      key: 'count',
                      sorter: (a, b) => a.count - b.count
                    },
                    {
                      title: '占比',
                      dataIndex: 'percentage',
                      key: 'percentage',
                      render: (value) => `${value}%`
                    },
                    {
                      title: '平均严重度',
                      dataIndex: 'avgSeverity',
                      key: 'avgSeverity',
                      render: (value) => value?.toFixed(1)
                    }
                  ]}
                  rowKey="failureMode"
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* 处理效率分析 */}
        <TabPane tab="处理效率" key="efficiency">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card title="处理人效率统计">
                <Table
                  columns={efficiencyColumns}
                  dataSource={reportData.efficiencyAnalysis.assigneeEfficiency}
                  rowKey="assigneeId"
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card title="整体效率指标">
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title="整体完成率"
                      value={reportData.efficiencyAnalysis.overallCompletionRate}
                      suffix="%"
                      precision={1}
                      valueStyle={{ color: '#3f8600' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="整体平均处理时间"
                      value={reportData.efficiencyAnalysis.overallAvgProcessingTime}
                      suffix="天"
                      precision={1}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="完成率分布">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: '已完成', value: reportData.basicStatistics.completedCases },
                        { name: '未完成', value: reportData.basicStatistics.totalCases - reportData.basicStatistics.completedCases }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#52c41a" />
                      <Cell fill="#ff4d4f" />
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* 产品分析 */}
        <TabPane tab="产品分析" key="products">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card title="产品失效统计">
                <Table
                  dataSource={reportData.productAnalysis}
                  columns={[
                    {
                      title: '产品名称',
                      dataIndex: 'productName',
                      key: 'productName'
                    },
                    {
                      title: '产品型号',
                      dataIndex: 'productModel',
                      key: 'productModel'
                    },
                    {
                      title: '案例数',
                      dataIndex: 'caseCount',
                      key: 'caseCount',
                      sorter: (a, b) => a.caseCount - b.caseCount
                    },
                    {
                      title: '失效率',
                      dataIndex: 'failureRate',
                      key: 'failureRate',
                      render: (value) => `${value}%`,
                      sorter: (a, b) => a.failureRate - b.failureRate
                    },
                    {
                      title: '平均成本',
                      dataIndex: 'avgCost',
                      key: 'avgCost',
                      render: (value) => `¥${value?.toFixed(2)}`,
                      sorter: (a, b) => a.avgCost - b.avgCost
                    }
                  ]}
                  rowKey={(record) => `${record.productName}_${record.productModel}`}
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* Top案例 */}
        <TabPane tab="Top案例" key="top-cases">
          <Card title="影响最大的失效案例">
            <Table
              columns={topFailureCasesColumns}
              dataSource={reportData.topFailureCases}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  )
}

export default AdvancedReports