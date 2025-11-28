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
  Timeline,
  Typography,
  Tabs,
  List,
  Avatar
} from 'antd'
import {
  RobotOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  SettingOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography
const { TabPane } = Tabs
const { TextArea } = Input

interface Task {
  id: string
  name: string
  type: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  progress: number
  assignedAgent?: string
  createdAt: string
  estimatedTime?: number
  actualTime?: number
}

interface Workflow {
  id: string
  name: string
  description: string
  status: 'active' | 'inactive' | 'running'
  tasks: string[]
  createdAt: string
}

const IntelligentHub: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      name: '芯片表面缺陷检测',
      type: 'image_analysis',
      status: 'running',
      priority: 'high',
      progress: 65,
      assignedAgent: '视觉分析智能体',
      createdAt: '2024-01-15 10:30:00',
      estimatedTime: 30,
      actualTime: 20
    },
    {
      id: '2',
      name: '材料成分分析',
      type: 'spectral_analysis',
      status: 'completed',
      priority: 'medium',
      progress: 100,
      assignedAgent: '光谱分析智能体',
      createdAt: '2024-01-15 09:15:00',
      estimatedTime: 45,
      actualTime: 42
    },
    {
      id: '3',
      name: '失效模式识别',
      type: 'pattern_recognition',
      status: 'pending',
      priority: 'urgent',
      progress: 0,
      createdAt: '2024-01-15 11:00:00',
      estimatedTime: 60
    }
  ])

  const [workflows] = useState<Workflow[]>([
    {
      id: '1',
      name: '标准失效分析流程',
      description: '包含图像预处理、特征提取、模式识别等步骤',
      status: 'active',
      tasks: ['1', '2', '3'],
      createdAt: '2024-01-10 00:00:00'
    },
    {
      id: '2',
      name: '快速检测流程',
      description: '简化的快速检测流程，适用于初步筛选',
      status: 'inactive',
      tasks: ['1'],
      createdAt: '2024-01-12 00:00:00'
    }
  ])

  const [taskModalVisible, setTaskModalVisible] = useState(false)
  const [workflowModalVisible, setWorkflowModalVisible] = useState(false)
  const [form] = Form.useForm()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'default'
      case 'running': return 'processing'
      case 'completed': return 'success'
      case 'failed': return 'error'
      case 'paused': return 'warning'
      default: return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '等待中'
      case 'running': return '运行中'
      case 'completed': return '已完成'
      case 'failed': return '失败'
      case 'paused': return '已暂停'
      default: return '未知'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'green'
      case 'medium': return 'orange'
      case 'high': return 'red'
      case 'urgent': return 'magenta'
      default: return 'default'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low': return '低'
      case 'medium': return '中'
      case 'high': return '高'
      case 'urgent': return '紧急'
      default: return '普通'
    }
  }

  const handleTaskAction = (taskId: string, action: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        switch (action) {
          case 'start':
            return { ...task, status: 'running' as const }
          case 'pause':
            return { ...task, status: 'paused' as const }
          case 'stop':
            return { ...task, status: 'pending' as const, progress: 0 }
          default:
            return task
        }
      }
      return task
    }))
  }

  const taskColumns: ColumnsType<Task> = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Task) => (
        <Space>
          <RobotOutlined />
          <div>
            <div>{text}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.type}
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
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>
          {getPriorityText(priority)}
        </Tag>
      )
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number, record: Task) => (
        <Progress
          percent={progress}
          size="small"
          status={record.status === 'failed' ? 'exception' : 'normal'}
        />
      )
    },
    {
      title: '分配智能体',
      dataIndex: 'assignedAgent',
      key: 'assignedAgent',
      render: (agent?: string) => (
        agent ? <Tag color="blue">{agent}</Tag> : '-'
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: Task) => (
        <Space>
          {record.status === 'pending' && (
            <Button
              type="text"
              icon={<PlayCircleOutlined />}
              onClick={() => handleTaskAction(record.id, 'start')}
            >
              开始
            </Button>
          )}
          {record.status === 'running' && (
            <Button
              type="text"
              icon={<PauseCircleOutlined />}
              onClick={() => handleTaskAction(record.id, 'pause')}
            >
              暂停
            </Button>
          )}
          {(record.status === 'running' || record.status === 'paused') && (
            <Button
              type="text"
              danger
              icon={<StopOutlined />}
              onClick={() => handleTaskAction(record.id, 'stop')}
            >
              停止
            </Button>
          )}
        </Space>
      )
    }
  ]

  return (
    <div>
      <Title level={2}>智能中枢</Title>
      
      <Tabs defaultActiveKey="tasks">
        <TabPane tab="任务管理" key="tasks">
          <Card
            title="任务列表"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setTaskModalVisible(true)}
              >
                创建任务
              </Button>
            }
          >
            <Table
              columns={taskColumns}
              dataSource={tasks}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="工作流编排" key="workflows">
          <Row gutter={16}>
            <Col span={12}>
              <Card
                title="工作流列表"
                extra={
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setWorkflowModalVisible(true)}
                  >
                    创建工作流
                  </Button>
                }
              >
                <List
                  dataSource={workflows}
                  renderItem={workflow => (
                    <List.Item
                      actions={[
                        <Button key="edit" type="text" icon={<SettingOutlined />} />,
                        <Button key="run" type="primary" size="small">
                          运行
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<Avatar icon={<RobotOutlined />} />}
                        title={
                          <Space>
                            {workflow.name}
                            <Tag color={workflow.status === 'active' ? 'green' : 'default'}>
                              {workflow.status === 'active' ? '活跃' : '非活跃'}
                            </Tag>
                          </Space>
                        }
                        description={workflow.description}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>

            <Col span={12}>
              <Card title="执行历史">
                <Timeline>
                  <Timeline.Item color="green">
                    <Text>工作流"标准失效分析流程"执行完成</Text>
                    <br />
                    <Text type="secondary">2024-01-15 10:45:00</Text>
                  </Timeline.Item>
                  <Timeline.Item color="blue">
                    <Text>任务"材料成分分析"开始执行</Text>
                    <br />
                    <Text type="secondary">2024-01-15 09:15:00</Text>
                  </Timeline.Item>
                  <Timeline.Item color="orange">
                    <Text>任务"芯片表面缺陷检测"暂停</Text>
                    <br />
                    <Text type="secondary">2024-01-15 08:30:00</Text>
                  </Timeline.Item>
                </Timeline>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="资源监控" key="resources">
          <Row gutter={16}>
            <Col span={8}>
              <Card title="CPU使用率">
                <Progress type="circle" percent={65} />
              </Card>
            </Col>
            <Col span={8}>
              <Card title="内存使用率">
                <Progress type="circle" percent={78} />
              </Card>
            </Col>
            <Col span={8}>
              <Card title="GPU使用率">
                <Progress type="circle" percent={45} />
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>

      {/* 创建任务模态框 */}
      <Modal
        title="创建新任务"
        open={taskModalVisible}
        onCancel={() => setTaskModalVisible(false)}
        onOk={() => form.submit()}
        okText="创建"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            const newTask: Task = {
              id: Date.now().toString(),
              name: values.name,
              type: values.type,
              status: 'pending',
              priority: values.priority,
              progress: 0,
              createdAt: new Date().toLocaleString(),
              estimatedTime: values.estimatedTime
            }
            setTasks(prev => [...prev, newTask])
            setTaskModalVisible(false)
            form.resetFields()
          }}
        >
          <Form.Item
            name="name"
            label="任务名称"
            rules={[{ required: true, message: '请输入任务名称' }]}
          >
            <Input placeholder="请输入任务名称" />
          </Form.Item>

          <Form.Item
            name="type"
            label="任务类型"
            rules={[{ required: true, message: '请选择任务类型' }]}
          >
            <Select placeholder="请选择任务类型">
              <Select.Option value="image_analysis">图像分析</Select.Option>
              <Select.Option value="spectral_analysis">光谱分析</Select.Option>
              <Select.Option value="pattern_recognition">模式识别</Select.Option>
              <Select.Option value="data_fusion">数据融合</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="priority"
            label="优先级"
            rules={[{ required: true, message: '请选择优先级' }]}
          >
            <Select placeholder="请选择优先级">
              <Select.Option value="low">低</Select.Option>
              <Select.Option value="medium">中</Select.Option>
              <Select.Option value="high">高</Select.Option>
              <Select.Option value="urgent">紧急</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="estimatedTime" label="预计时间（分钟）">
            <Input type="number" placeholder="请输入预计执行时间" />
          </Form.Item>

          <Form.Item name="description" label="任务描述">
            <TextArea rows={4} placeholder="请输入任务描述（可选）" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default IntelligentHub