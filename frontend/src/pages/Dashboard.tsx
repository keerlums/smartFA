import React from 'react'
import { Row, Col, Card, Statistic, Progress, List, Avatar, Tag, Space } from 'antd'
import {
  FileSearchOutlined,
  RobotOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExperimentOutlined,
  AlertOutlined
} from '@ant-design/icons'

const Dashboard: React.FC = () => {
  // 模拟数据
  const stats = [
    {
      title: '总案例数',
      value: 1234,
      icon: <FileSearchOutlined style={{ color: '#1890ff' }} />,
      prefix: <FileSearchOutlined />
    },
    {
      title: '活跃智能体',
      value: 42,
      icon: <RobotOutlined style={{ color: '#52c41a' }} />,
      prefix: <RobotOutlined />
    },
    {
      title: '今日完成',
      value: 89,
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      prefix: <CheckCircleOutlined />
    },
    {
      title: '待处理',
      value: 23,
      icon: <ClockCircleOutlined style={{ color: '#faad14' }} />,
      prefix: <ClockCircleOutlined />
    }
  ]

  const recentTasks = [
    {
      id: 1,
      title: '芯片失效分析案例 #2024001',
      status: 'processing',
      priority: 'high',
      agent: '视觉分析智能体',
      time: '10分钟前'
    },
    {
      id: 2,
      title: '材料裂纹检测案例 #2024002',
      status: 'completed',
      priority: 'medium',
      agent: '图像处理智能体',
      time: '25分钟前'
    },
    {
      id: 3,
      title: '焊接质量评估案例 #2024003',
      status: 'pending',
      priority: 'low',
      agent: '待分配',
      time: '1小时前'
    }
  ]

  const systemStatus = [
    { name: '多模态工作台', status: 'normal', usage: 75 },
    { name: '智能中枢', status: 'normal', usage: 60 },
    { name: '智能体集群', status: 'warning', usage: 90 },
    { name: '数据存储', status: 'normal', usage: 45 }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'processing'
      case 'completed': return 'success'
      case 'pending': return 'default'
      case 'error': return 'error'
      default: return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'processing': return '处理中'
      case 'completed': return '已完成'
      case 'pending': return '待处理'
      case 'error': return '异常'
      default: return '未知'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red'
      case 'medium': return 'orange'
      case 'low': return 'green'
      default: return 'default'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return '高'
      case 'medium': return '中'
      case 'low': return '低'
      default: return '普通'
    }
  }

  return (
    <div>
      <h1>系统控制台</h1>
      
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {stats.map((stat, index) => (
          <Col span={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.prefix}
                valueStyle={{ color: stat.icon.props.style?.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={16}>
        {/* 最近任务 */}
        <Col span={12}>
          <Card title="最近任务" extra={<a href="/cases">查看全部</a>}>
            <List
              dataSource={recentTasks}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<ExperimentOutlined />} />}
                    title={
                      <Space>
                        {item.title}
                        <Tag color={getPriorityColor(item.priority)}>
                          {getPriorityText(item.priority)}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space>
                        <Tag color={getStatusColor(item.status)}>
                          {getStatusText(item.status)}
                        </Tag>
                        <span>智能体: {item.agent}</span>
                        <span>{item.time}</span>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 系统状态 */}
        <Col span={12}>
          <Card title="系统状态">
            <List
              dataSource={systemStatus}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      item.status === 'normal' ? (
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      ) : (
                        <AlertOutlined style={{ color: '#faad14' }} />
                      )
                    }
                    title={item.name}
                    description={
                      <Progress
                        percent={item.usage}
                        status={item.usage > 80 ? 'exception' : 'normal'}
                        size="small"
                      />
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard