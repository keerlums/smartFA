import React, { useState } from 'react'
import {
  Card,
  Row,
  Col,
  Table,
  Button,
  Space,
  Tag,
  Progress,
  Modal,
  Form,
  Input,
  Select,
  Avatar,
  List,
  Typography,
  Tabs,
  Badge,
  Tooltip
} from 'antd'
import {
  RobotOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  MessageOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography
const { TabPane } = Tabs
const { TextArea } = Input

interface Agent {
  id: string
  name: string
  type: string
  status: 'active' | 'inactive' | 'busy' | 'error'
  capabilities: string[]
  currentTask?: string
  performance: {
    cpu: number
    memory: number
    successRate: number
    avgResponseTime: number
  }
  createdAt: string
  lastActive: string
}

interface AgentTask {
  id: string
  agentId: string
  taskName: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  startTime: string
  estimatedCompletion?: string
}

const MultiAgentCluster: React.FC = () => {
  const [agents] = useState<Agent[]>([
    {
      id: '1',
      name: '视觉分析智能体',
      type: 'vision',
      status: 'active',
      capabilities: ['图像识别', '缺陷检测', '尺寸测量'],
      currentTask: '芯片表面缺陷检测',
      performance: {
        cpu: 65,
        memory: 78,
        successRate: 95.5,
        avgResponseTime: 2.3
      },
      createdAt: '2024-01-10 00:00:00',
      lastActive: '2024-01-15 10:45:00'
    },
    {
      id: '2',
      name: '光谱分析智能体',
      type: 'spectral',
      status: 'busy',
      capabilities: ['光谱分析', '成分识别', '定量分析'],
      currentTask: '材料成分分析',
      performance: {
        cpu: 82,
        memory: 71,
        successRate: 92.1,
        avgResponseTime: 3.1
      },
      createdAt: '2024-01-11 00:00:00',
      lastActive: '2024-01-15 10:50:00'
    },
    {
      id: '3',
      name: '数据处理智能体',
      type: 'data',
      status: 'inactive',
      capabilities: ['数据清洗', '特征提取', '数据融合'],
      performance: {
        cpu: 15,
        memory: 25,
        successRate: 98.2,
        avgResponseTime: 1.8
      },
      createdAt: '2024-01-12 00:00:00',
      lastActive: '2024-01-14 16:30:00'
    }
  ])

  const [agentTasks] = useState<AgentTask[]>([
    {
      id: '1',
      agentId: '1',
      taskName: '芯片表面缺陷检测',
      status: 'running',
      progress: 75,
      startTime: '2024-01-15 10:30:00',
      estimatedCompletion: '2024-01-15 11:00:00'
    },
    {
      id: '2',
      agentId: '2',
      taskName: '材料成分分析',
      status: 'running',
      progress: 60,
      startTime: '2024-01-15 10:15:00',
      estimatedCompletion: '2024-01-15 11:15:00'
    },
    {
      id: '3',
      agentId: '1',
      taskName: '焊接质量评估',
      status: 'pending',
      progress: 0,
      startTime: '2024-01-15 11:00:00'
    }
  ])

  const [agentModalVisible, setAgentModalVisible] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [form] = Form.useForm()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'inactive': return 'default'
      case 'busy': return 'processing'
      case 'error': return 'error'
      default: return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '活跃'
      case 'inactive': return '非活跃'
      case 'busy': return '忙碌'
      case 'error': return '错误'
      default: return '未知'
    }
  }

  const getAgentTypeText = (type: string) => {
    switch (type) {
      case 'vision': return '视觉分析'
      case 'spectral': return '光谱分析'
      case 'data': return '数据处理'
      case 'llm': return '语言理解'
      case 'fusion': return '多模态融合'
      default: return '通用'
    }
  }

  const agentColumns: ColumnsType<Agent> = [
    {
      title: '智能体',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Agent) => (
        <Space>
          <Avatar icon={<RobotOutlined />} />
          <div>
            <div>{text}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {getAgentTypeText(record.type)}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge status={getStatusColor(status) as any} text={getStatusText(status)} />
      )
    },
    {
      title: '能力',
      dataIndex: 'capabilities',
      key: 'capabilities',
      render: (capabilities: string[]) => (
        <Space wrap>
          {capabilities.map(cap => (
            <Tag key={cap}>{cap}</Tag>
          ))}
        </Space>
      )
    },
    {
      title: '当前任务',
      dataIndex: 'currentTask',
      key: 'currentTask',
      render: (task?: string) => task ? <Text ellipsis>{task}</Text> : '-'
    },
    {
      title: '性能指标',
      key: 'performance',
      render: (_, record: Agent) => (
        <Space direction="vertical" size="small">
          <Progress percent={record.performance.cpu} size="small" showInfo={false} />
          <Text type="secondary" style={{ fontSize: 12 }}>
            成功率: {record.performance.successRate}% | 响应: {record.performance.avgResponseTime}s
          </Text>
        </Space>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: Agent) => (
        <Space>
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedAgent(record)
                setAgentModalVisible(true)
              }}
            />
          </Tooltip>
          <Tooltip title="配置">
            <Button type="text" icon={<SettingOutlined />} />
          </Tooltip>
          <Tooltip title="消息">
            <Button type="text" icon={<MessageOutlined />} />
          </Tooltip>
        </Space>
      )
    }
  ]

  const taskColumns: ColumnsType<AgentTask> = [
    {
      title: '任务名称',
      dataIndex: 'taskName',
      key: 'taskName'
    },
    {
      title: '执行智能体',
      dataIndex: 'agentId',
      key: 'agentId',
      render: (agentId: string) => {
        const agent = agents.find(a => a.id === agentId)
        return agent ? agent.name : '未知'
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'running' ? 'processing' : status === 'completed' ? 'success' : status === 'failed' ? 'error' : 'default'}>
          {status === 'running' ? '运行中' : status === 'completed' ? '已完成' : status === 'failed' ? '失败' : '等待中'}
        </Tag>
      )
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
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime'
    },
    {
      title: '预计完成',
      dataIndex: 'estimatedCompletion',
      key: 'estimatedCompletion',
      render: (time?: string) => time || '-'
    }
  ]

  return (
    <div>
      <Title level={2}>多智能体集群</Title>
      
      <Tabs defaultActiveKey="agents">
        <TabPane tab="智能体管理" key="agents">
          <Card
            title="智能体列表"
            extra={
              <Button type="primary" icon={<PlusOutlined />}>
                创建智能体
              </Button>
            }
          >
            <Table
              columns={agentColumns}
              dataSource={agents}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="任务监控" key="tasks">
          <Card title="任务执行情况">
            <Table
              columns={taskColumns}
              dataSource={agentTasks}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="集群统计" key="statistics">
          <Row gutter={16}>
            <Col span={6}>
              <Card>
                <div style={{ textAlign: 'center' }}>
                  <Badge count={agents.filter(a => a.status === 'active').length} showZero>
                    <RobotOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                  </Badge>
                  <div style={{ marginTop: 16 }}>
                    <Title level={4}>活跃智能体</Title>
                    <Text type="secondary">
                      {agents.filter(a => a.status === 'active').length} / {agents.length}
                    </Text>
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <div style={{ textAlign: 'center' }}>
                  <ThunderboltOutlined style={{ fontSize: 48, color: '#52c41a' }} />
                  <div style={{ marginTop: 16 }}>
                    <Title level={4}>运行任务</Title>
                    <Text type="secondary">
                      {agentTasks.filter(t => t.status === 'running').length} 个
                    </Text>
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 48, color: '#faad14' }}>
                    {Math.round(agents.reduce((acc, a) => acc + a.performance.successRate, 0) / agents.length)}%
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <Title level={4}>平均成功率</Title>
                    <Text type="secondary">所有智能体</Text>
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 48, color: '#722ed1' }}>
                    {Math.round(agents.reduce((acc, a) => acc + a.performance.avgResponseTime, 0) / agents.length)}s
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <Title level={4}>平均响应时间</Title>
                    <Text type="secondary">所有智能体</Text>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="通信日志" key="communication">
          <Card title="智能体通信记录">
            <List
              dataSource={[
                {
                  from: '视觉分析智能体',
                  to: '数据处理智能体',
                  message: '图像预处理完成，请进行特征提取',
                  time: '2024-01-15 10:45:23'
                },
                {
                  from: '光谱分析智能体',
                  to: '智能中枢',
                  message: '材料成分分析完成，结果已上传',
                  time: '2024-01-15 10:42:15'
                },
                {
                  from: '智能中枢',
                  to: '视觉分析智能体',
                  message: '新任务分配：焊接质量评估',
                  time: '2024-01-15 10:40:00'
                }
              ]}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<MessageOutlined />}
                    title={
                      <Space>
                        <Text strong>{item.from}</Text>
                        <Text type="secondary">→</Text>
                        <Text strong>{item.to}</Text>
                      </Space>
                    }
                    description={
                      <div>
                        <Text>{item.message}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {item.time}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* 智能体详情模态框 */}
      <Modal
        title="智能体详情"
        open={agentModalVisible}
        onCancel={() => setAgentModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setAgentModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedAgent && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <Card size="small" title="基本信息">
                  <p><strong>名称:</strong> {selectedAgent.name}</p>
                  <p><strong>类型:</strong> {getAgentTypeText(selectedAgent.type)}</p>
                  <p><strong>状态:</strong> 
                    <Badge 
                      status={getStatusColor(selectedAgent.status) as any} 
                      text={getStatusText(selectedAgent.status)} 
                    />
                  </p>
                  <p><strong>创建时间:</strong> {selectedAgent.createdAt}</p>
                  <p><strong>最后活跃:</strong> {selectedAgent.lastActive}</p>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="性能指标">
                  <p><strong>CPU使用率:</strong> {selectedAgent.performance.cpu}%</p>
                  <p><strong>内存使用率:</strong> {selectedAgent.performance.memory}%</p>
                  <p><strong>成功率:</strong> {selectedAgent.performance.successRate}%</p>
                  <p><strong>平均响应时间:</strong> {selectedAgent.performance.avgResponseTime}s</p>
                </Card>
              </Col>
            </Row>
            <Card size="small" title="能力列表" style={{ marginTop: 16 }}>
              <Space wrap>
                {selectedAgent.capabilities.map(cap => (
                  <Tag key={cap} color="blue">{cap}</Tag>
                ))}
              </Space>
            </Card>
            {selectedAgent.currentTask && (
              <Card size="small" title="当前任务" style={{ marginTop: 16 }}>
                <Text>{selectedAgent.currentTask}</Text>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default MultiAgentCluster