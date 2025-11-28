import React, { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Input,
  Select,
  Modal,
  Form,
  Row,
  Col,
  Typography,
  Tabs,
  List,
  
  Progress,
  Tooltip,
  Badge,
  
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  
  DownloadOutlined,
  FileSearchOutlined,
  ExperimentOutlined,
  
  CheckCircleOutlined,
  ClockCircleOutlined,
  
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
// removed unused imports (redux, dayjs, caseSlice) to reduce noise

const { Title, Text } = Typography
const { TabPane } = Tabs
const { Search } = Input
// no RangePicker/TextArea used here

interface FailureCase {
  id: number
  caseNumber: string
  title: string
  description: string
  productName: string
  productModel: string
  failureDate: string
  failureLocation: string
  failureMode: string
  failureMechanism: string
  severityLevel: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CLOSED'
  creatorId: number
  assigneeId: number
  createTime: string
  updateTime: string
  creator?: {
    id: number
    realName: string
  }
  assignee?: {
    id: number
    realName: string
  }
}

// CaseStatistics not used in current implementation

interface CaseDetail {
  case: FailureCase | Case
  tags?: string[]
  attachments?: number
  tasks: Array<{
    id: string
    name: string
    status: string
    agent: string
    progress: number
    startTime: string
  }>
  results: Array<{
    type: string
    name: string
    url: string
    createdAt: string
  }>
}

const CaseManagement: React.FC = () => {
  const [cases] = useState<Case[]>([
    {
      id: '1',
      caseNumber: 'FA2024001',
      title: '芯片表面失效分析',
      description: '对某批次芯片进行表面失效原因分析',
      failureType: '表面缺陷',
      severityLevel: 'high',
      status: 'processing',
      assignedAgent: '视觉分析智能体',
      createdAt: '2024-01-15 09:30:00',
      updatedAt: '2024-01-15 10:45:00',
      progress: 65,
      tags: ['半导体', '表面分析', '高优先级'],
      attachments: 5
    },
    {
      id: '2',
      caseNumber: 'FA2024002',
      title: '焊接接头质量评估',
      description: '评估焊接接头的质量和可靠性',
      failureType: '焊接缺陷',
      severityLevel: 'medium',
      status: 'completed',
      assignedAgent: '多模态融合智能体',
      createdAt: '2024-01-14 14:20:00',
      updatedAt: '2024-01-14 16:30:00',
      progress: 100,
      tags: ['焊接', '质量评估'],
      attachments: 8
    },
    {
      id: '3',
      caseNumber: 'FA2024003',
      title: '材料成分异常分析',
      description: '分析材料成分异常的原因和影响',
      failureType: '成分异常',
      severityLevel: 'critical',
      status: 'pending',
      createdAt: '2024-01-15 11:00:00',
      updatedAt: '2024-01-15 11:00:00',
      progress: 0,
      tags: ['材料分析', '紧急'],
      attachments: 3
    }
  ])

  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [caseModalVisible, setCaseModalVisible] = useState(false)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [form] = Form.useForm()

  const getSeverityColor = (level: string) => {
    switch (level) {
      case 'low': return 'green'
      case 'medium': return 'orange'
      case 'high': return 'red'
      case 'critical': return 'magenta'
      default: return 'default'
    }
  }

  const getSeverityText = (level: string) => {
    switch (level) {
      case 'low': return '低'
      case 'medium': return '中'
      case 'high': return '高'
      case 'critical': return '紧急'
      default: return '未知'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'default'
      case 'processing': return 'processing'
      case 'completed': return 'success'
      case 'closed': return 'default'
      default: return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待处理'
      case 'processing': return '处理中'
      case 'completed': return '已完成'
      case 'closed': return '已关闭'
      default: return '未知'
    }
  }

  const caseColumns: ColumnsType<Case> = [
    {
      title: '案例编号',
      dataIndex: 'caseNumber',
      key: 'caseNumber',
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true
    },
    {
      title: '失效类型',
      dataIndex: 'failureType',
      key: 'failureType'
    },
    {
      title: '严重程度',
      dataIndex: 'severityLevel',
      key: 'severityLevel',
      render: (level: string) => (
        <Tag color={getSeverityColor(level)}>
          {getSeverityText(level)}
        </Tag>
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
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => (
        <Progress percent={progress} size="small" />
      )
    },
    {
      title: '分配智能体',
      dataIndex: 'assignedAgent',
      key: 'assignedAgent',
      render: (agent?: string) => agent ? <Tag color="blue">{agent}</Tag> : '-'
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: Case) => (
        <Space>
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedCase(record)
                setCaseModalVisible(true)
              }}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button type="text" icon={<EditOutlined />} />
          </Tooltip>
          <Tooltip title="下载报告">
            <Button type="text" icon={<DownloadOutlined />} />
          </Tooltip>
        </Space>
      )
    }
  ]

  const mockCaseDetail: CaseDetail = {
    case: cases[0],
    tasks: [
      {
        id: '1',
        name: '图像预处理',
        status: 'completed',
        agent: '视觉分析智能体',
        progress: 100,
        startTime: '2024-01-15 09:30:00'
      },
      {
        id: '2',
        name: '缺陷检测',
        status: 'processing',
        agent: '视觉分析智能体',
        progress: 65,
        startTime: '2024-01-15 10:00:00'
      },
      {
        id: '3',
        name: '结果分析',
        status: 'pending',
        agent: '数据分析智能体',
        progress: 0,
        startTime: ''
      }
    ],
    results: [
      {
        type: 'image',
        name: '预处理后的图像',
        url: '/images/processed_001.jpg',
        createdAt: '2024-01-15 09:45:00'
      },
      {
        type: 'report',
        name: '初步分析报告',
        url: '/reports/preliminary_001.pdf',
        createdAt: '2024-01-15 10:15:00'
      }
    ]
  }

  return (
    <div>
      <Title level={2}>案例管理</Title>
      
      {/* 搜索和筛选 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Search
              placeholder="搜索案例编号或标题"
              allowClear
              enterButton={<SearchOutlined />}
            />
          </Col>
          <Col span={4}>
            <Select placeholder="失效类型" style={{ width: '100%' }} allowClear>
              <Select.Option value="surface_defect">表面缺陷</Select.Option>
              <Select.Option value="welding_defect">焊接缺陷</Select.Option>
              <Select.Option value="composition_abnormal">成分异常</Select.Option>
              <Select.Option value="structural_failure">结构失效</Select.Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select placeholder="严重程度" style={{ width: '100%' }} allowClear>
              <Select.Option value="low">低</Select.Option>
              <Select.Option value="medium">中</Select.Option>
              <Select.Option value="high">高</Select.Option>
              <Select.Option value="critical">紧急</Select.Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select placeholder="状态" style={{ width: '100%' }} allowClear>
              <Select.Option value="pending">待处理</Select.Option>
              <Select.Option value="processing">处理中</Select.Option>
              <Select.Option value="completed">已完成</Select.Option>
              <Select.Option value="closed">已关闭</Select.Option>
            </Select>
          </Col>
          <Col span={4}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
              新建案例
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 案例列表 */}
      <Card title="案例列表">
        <Table
          columns={caseColumns}
          dataSource={cases}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* 案例详情模态框 */}
      <Modal
        title="案例详情"
        open={caseModalVisible}
        onCancel={() => setCaseModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setCaseModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={1000}
      >
        {selectedCase && (
          <Tabs defaultActiveKey="info">
            <TabPane tab="基本信息" key="info">
              <Row gutter={16}>
                <Col span={12}>
                  <p><strong>案例编号:</strong> {selectedCase.caseNumber}</p>
                  <p><strong>标题:</strong> {selectedCase.title}</p>
                  <p><strong>描述:</strong> {selectedCase.description}</p>
                  <p><strong>失效类型:</strong> {selectedCase.failureType}</p>
                </Col>
                <Col span={12}>
                  <p><strong>严重程度:</strong> 
                                    <Tag color={getSeverityColor(selectedCase.severityLevel || '')}>
                                      {getSeverityText(selectedCase.severityLevel || '')}
                                    </Tag>
                  </p>
                  <p><strong>状态:</strong> 
                    <Badge status={getStatusColor(selectedCase.status || '') as any} text={getStatusText(selectedCase.status || '')} />
                  </p>
                  <p><strong>分配智能体:</strong> {selectedCase.assignedAgent || '未分配'}</p>
                  <p><strong>创建时间:</strong> {selectedCase.createdAt}</p>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <p><strong>标签:</strong></p>
                  <Space wrap>
                    {selectedCase.tags.map(tag => (
                      <Tag key={tag} color="blue">{tag}</Tag>
                    ))}
                  </Space>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="任务进度" key="tasks">
              <List
                dataSource={mockCaseDetail.tasks}
                renderItem={task => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        task.status === 'completed' ? (
                          <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        ) : task.status === 'processing' ? (
                          <ClockCircleOutlined style={{ color: '#1890ff' }} />
                        ) : (
                          <ClockCircleOutlined style={{ color: '#d9d9d9' }} />
                        )
                      }
                      title={task.name}
                      description={
                        <div>
                          <Text type="secondary">执行智能体: {task.agent}</Text>
                          <br />
                          <Text type="secondary">开始时间: {task.startTime}</Text>
                          <Progress percent={task.progress} size="small" style={{ marginTop: 8 }} />
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </TabPane>

            <TabPane tab="分析结果" key="results">
              <List
                dataSource={mockCaseDetail.results}
                renderItem={result => (
                  <List.Item
                    actions={[
                      <Button key="download" type="text" icon={<DownloadOutlined />}>
                        下载
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        result.type === 'image' ? (
                          <FileSearchOutlined />
                        ) : (
                          <ExperimentOutlined />
                        )
                      }
                      title={result.name}
                      description={`生成时间: ${result.createdAt}`}
                    />
                  </List.Item>
                )}
              />
            </TabPane>
          </Tabs>
        )}
      </Modal>

      {/* 新建案例模态框 */}
      <Modal
        title="新建案例"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onOk={() => form.submit()}
        okText="创建"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            console.log('新建案例:', values)
            setCreateModalVisible(false)
            form.resetFields()
          }}
        >
          <Form.Item
            name="title"
            label="案例标题"
            rules={[{ required: true, message: '请输入案例标题' }]}
          >
            <Input placeholder="请输入案例标题" />
          </Form.Item>

          <Form.Item
            name="description"
            label="案例描述"
            rules={[{ required: true, message: '请输入案例描述' }]}
          >
            <Input.TextArea rows={4} placeholder="请输入案例描述" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="failureType"
                label="失效类型"
                rules={[{ required: true, message: '请选择失效类型' }]}
              >
                <Select placeholder="请选择失效类型">
                  <Select.Option value="surface_defect">表面缺陷</Select.Option>
                  <Select.Option value="welding_defect">焊接缺陷</Select.Option>
                  <Select.Option value="composition_abnormal">成分异常</Select.Option>
                  <Select.Option value="structural_failure">结构失效</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="severityLevel"
                label="严重程度"
                rules={[{ required: true, message: '请选择严重程度' }]}
              >
                <Select placeholder="请选择严重程度">
                  <Select.Option value="low">低</Select.Option>
                  <Select.Option value="medium">中</Select.Option>
                  <Select.Option value="high">高</Select.Option>
                  <Select.Option value="critical">紧急</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}

export default CaseManagement