import React, { useState, useEffect } from 'react'
import {
  Card,
  Row,
  Col,
  Tabs,
  Button,
  Space,
  Select,
  Input,
  Form,
  Table,
  Tag,
  Progress,
  Statistic,
  Alert,
  Spin,
  message,
  Upload,
  Modal,
  Typography,
  Divider,
  List,
  Avatar,
  Tooltip,
  Badge
} from 'antd'
import {
  ExperimentOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  // ScatterChartOutlined removed (use BarChartOutlined instead)
  UploadOutlined,
  DownloadOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  SettingOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import ThreeDVisualization from '../components/ThreeDVisualization'
import { fetchCases } from '../store/slices/caseSlice'
import api from '../services/api'
import * as echarts from 'echarts'

const { Title, Text, Paragraph } = Typography
const { TabPane } = Tabs
const { TextArea } = Input

interface AnalysisResult {
  id: string
  name: string
  type: 'statistical' | 'prediction' | 'correlation' | 'pattern'
  status: 'running' | 'completed' | 'failed'
  progress: number
  result?: any
  error?: string
  createTime: string
  completeTime?: string
}

interface StatisticalData {
  totalCases: number
  failureModes: Array<{ name: string; value: number }>
  severityDistribution: Array<{ level: string; count: number }>
  monthlyTrend: Array<{ month: string; count: number }>
  productFailure: Array<{ product: string; failureRate: number }>
  timeToResolution: Array<{ caseType: string; avgDays: number }>
}

const AdvancedAnalysis: React.FC = () => {
  const dispatch = useDispatch()
  const { cases } = useSelector((state: RootState) => state.cases)
  const [activeTab, setActiveTab] = useState('statistical')
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([])
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null)
  const [statisticalData, setStatisticalData] = useState<StatisticalData | null>(null)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const [visualizationData, setVisualizationData] = useState<any>(null)
  const [showVisualization, setShowVisualization] = useState(false)

  useEffect(() => {
    loadStatisticalData()
    loadAnalysisResults()
  }, [])

  const loadStatisticalData = async () => {
    try {
      setLoading(true)
      // 模拟统计数据
      const mockData: StatisticalData = {
        totalCases: cases.length || 156,
        failureModes: [
          { name: '疲劳失效', value: 45 },
          { name: '腐蚀失效', value: 32 },
          { name: '断裂失效', value: 28 },
          { name: '磨损失效', value: 25 },
          { name: '变形失效', value: 26 }
        ],
        severityDistribution: [
          { level: '严重', count: 12 },
          { level: '中等', count: 68 },
          { level: '轻微', count: 76 }
        ],
        monthlyTrend: [
          { month: '1月', count: 12 },
          { month: '2月', count: 15 },
          { month: '3月', count: 18 },
          { month: '4月', count: 14 },
          { month: '5月', count: 22 },
          { month: '6月', count: 25 }
        ],
        productFailure: [
          { product: '产品A', failureRate: 3.2 },
          { product: 'B', failureRate: 2.8 },
          { product: 'C', failureRate: 4.1 },
          { product: 'D', failureRate: 1.9 }
        ],
        timeToResolution: [
          { caseType: '疲劳失效', avgDays: 12.5 },
          { caseType: '腐蚀失效', avgDays: 8.3 },
          { caseType: '断裂失效', avgDays: 15.7 },
          { caseType: '磨损失效', avgDays: 6.2 }
        ]
      }
      setStatisticalData(mockData)
    } catch (error) {
      message.error('加载统计数据失败')
    } finally {
      setLoading(false)
    }
  }

  const loadAnalysisResults = async () => {
    try {
      // 模拟分析结果
      const mockResults: AnalysisResult[] = [
        {
          id: '1',
          name: '失效模式关联性分析',
          type: 'correlation',
          status: 'completed',
          progress: 100,
          createTime: '2024-01-15 10:30:00',
          completeTime: '2024-01-15 10:45:00'
        },
        {
          id: '2',
          name: '失效趋势预测',
          type: 'prediction',
          status: 'running',
          progress: 65,
          createTime: '2024-01-15 11:00:00'
        },
        {
          id: '3',
          name: '异常模式识别',
          type: 'pattern',
          status: 'failed',
          progress: 30,
          error: '数据不足，无法完成分析',
          createTime: '2024-01-15 09:30:00'
        }
      ]
      setAnalysisResults(mockResults)
    } catch (error) {
      message.error('加载分析结果失败')
    }
  }

  const handleRunAnalysis = async (values: any) => {
    try {
      setLoading(true)
      const newAnalysis: AnalysisResult = {
        id: Date.now().toString(),
        name: values.analysisName,
        type: values.analysisType,
        status: 'running',
        progress: 0,
        createTime: new Date().toLocaleString()
      }
      
      setAnalysisResults([newAnalysis, ...analysisResults])
      
      // 模拟分析过程
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 20
        if (progress >= 100) {
          progress = 100
          clearInterval(interval)
          setAnalysisResults(prev => 
            prev.map(analysis => 
              analysis.id === newAnalysis.id 
                ? { ...analysis, status: 'completed', progress: 100, completeTime: new Date().toLocaleString() }
                : analysis
            )
          )
          message.success('分析完成')
        } else {
          setAnalysisResults(prev => 
            prev.map(analysis => 
              analysis.id === newAnalysis.id ? { ...analysis, progress } : analysis
            )
          )
        }
      }, 1000)
      
    } catch (error) {
      message.error('启动分析失败')
    } finally {
      setLoading(false)
    }
  }

  const handle3DAnalysis = () => {
    // 模拟3D可视化数据
    const mockVisualizationData = {
      type: 'failure_model' as const,
      geometry: {
        vertices: [
          [0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0],
          [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]
        ],
        faces: [
          [0, 1, 2], [0, 2, 3], // 底面
          [4, 5, 6], [4, 6, 7], // 顶面
          [0, 1, 5], [0, 5, 4], // 前面
          [2, 3, 7], [2, 7, 6], // 后面
          [0, 3, 7], [0, 7, 4], // 左面
          [1, 2, 6], [1, 6, 5]  // 右面
        ],
        normals: []
      },
      metadata: {
        name: '失效模型示例',
        description: '这是一个立方体失效模型示例',
        scale: 2,
        position: [0, 0, 0],
        color: '#4CAF50'
      },
      annotations: [
        {
          id: '1',
          position: [0.5, 0.5, 0],
          label: '失效起始点',
          type: 'failure_point'
        },
        {
          id: '2',
          position: [1, 1, 0.5],
          label: '裂纹扩展方向',
          type: 'annotation'
        }
      ]
    }
    setVisualizationData(mockVisualizationData)
    setShowVisualization(true)
  }

  const renderStatisticalAnalysis = () => (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总案例数"
              value={statisticalData?.totalCases}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="本月新增"
              value={25}
              prefix={<LineChartOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均处理时间"
              value={10.5}
              suffix="天"
              prefix={<PieChartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="完成率"
              value={85.2}
              suffix="%"
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="失效模式分布" extra={<Button size="small">详细</Button>}>
            <div style={{ height: 300 }}>
              {/* 这里应该集成ECharts图表 */}
              <div style={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: '#f5f5f5',
                borderRadius: 4
              }}>
                <Text type="secondary">图表组件集成中...</Text>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="月度趋势" extra={<Button size="small">详细</Button>}>
            <div style={{ height: 300 }}>
              <div style={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: '#f5f5f5',
                borderRadius: 4
              }}>
                <Text type="secondary">图表组件集成中...</Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )

  const renderPredictiveAnalysis = () => (
    <div>
      <Card title="预测分析配置" style={{ marginBottom: 16 }}>
        <Form form={form} layout="inline" onFinish={handleRunAnalysis}>
          <Form.Item name="analysisName" rules={[{ required: true }]} label="分析名称">
            <Input placeholder="输入分析名称" />
          </Form.Item>
          <Form.Item name="analysisType" rules={[{ required: true }]} label="分析类型">
            <Select style={{ width: 150 }} placeholder="选择分析类型">
              <Select.Option value="trend">趋势预测</Select.Option>
              <Select.Option value="risk">风险评估</Select.Option>
              <Select.Option value="lifecycle">寿命预测</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="dataSource" label="数据源">
            <Select style={{ width: 150 }} placeholder="选择数据源" defaultValue="all_cases">
              <Select.Option value="all_cases">所有案例</Select.Option>
              <Select.Option value="recent_cases">近期案例</Select.Option>
              <Select.Option value="custom">自定义数据</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} icon={<PlayCircleOutlined />}>
              开始分析
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="3D失效模型分析">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Alert
            message="3D可视化分析"
            description="通过3D模型展示失效过程，支持交互式分析和测量。"
            type="info"
            showIcon
          />
          <Button 
            type="primary" 
            icon={<ExperimentOutlined />}
            onClick={handle3DAnalysis}
          >
            启动3D分析
          </Button>
        </Space>
      </Card>
    </div>
  )

  const renderAnalysisResults = () => {
    const columns: ColumnsType<AnalysisResult> = [
      {
        title: '分析名称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '类型',
        dataIndex: 'type',
        key: 'type',
        render: (type: string) => {
          const typeMap: Record<string, { text: string; color: string }> = {
            statistical: { text: '统计分析', color: 'blue' },
            prediction: { text: '预测分析', color: 'green' },
            correlation: { text: '关联分析', color: 'orange' },
            pattern: { text: '模式识别', color: 'purple' }
          }
          const config = typeMap[type] || { text: type, color: 'default' }
          return <Tag color={config.color}>{config.text}</Tag>
        }
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (status: string) => {
          const statusMap: Record<string, { text: string; color: string }> = {
            running: { text: '运行中', color: 'processing' },
            completed: { text: '已完成', color: 'success' },
            failed: { text: '失败', color: 'error' }
          }
          const config = statusMap[status] || { text: status, color: 'default' }
          return <Badge status={config.color as any} text={config.text} />
        }
      },
      {
        title: '进度',
        dataIndex: 'progress',
        key: 'progress',
        render: (progress: number) => (
          <Progress percent={progress} size="small" />
        )
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        key: 'createTime',
      },
      {
        title: '操作',
        key: 'actions',
        render: (_, record) => (
          <Space>
            <Button size="small" icon={<InfoCircleOutlined />} />
            <Button size="small" icon={<DownloadOutlined />} />
            <Button size="small" icon={<ReloadOutlined />} />
          </Space>
        )
      }
    ]

    return (
      <Table
        columns={columns}
        dataSource={analysisResults}
        rowKey="id"
        loading={loading}
      />
    )
  }

  return (
    <div>
      <Title level={3}>高级分析</Title>
      
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="统计分析" key="statistical">
          {renderStatisticalAnalysis()}
        </TabPane>
        <TabPane tab="预测分析" key="predictive">
          {renderPredictiveAnalysis()}
        </TabPane>
        <TabPane tab="分析结果" key="results">
          {renderAnalysisResults()}
        </TabPane>
      </Tabs>

      {/* 3D可视化弹窗 */}
      <Modal
        title="3D失效模型可视化"
        open={showVisualization}
        onCancel={() => setShowVisualization(false)}
        width={1200}
        footer={[
          <Button key="close" onClick={() => setShowVisualization(false)}>
            关闭
          </Button>
        ]}
      >
        {visualizationData && (
          <ThreeDVisualization 
            data={visualizationData}
            width={1100}
            height={600}
          />
        )}
      </Modal>
    </div>
  )
}

export default AdvancedAnalysis