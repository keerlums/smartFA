import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Progress, Typography, Modal, Descriptions, Statistic, Row, Col, Alert } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, StopOutlined, ReloadOutlined, EyeOutlined, SettingOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { agentApi } from '../services/api';

const { Title, Text } = Typography;

interface Agent {
  id: string;
  name: string;
  type: string;
  status: AgentStatus;
  cpuUsage: number;
  memoryUsage: number;
  taskCount: number;
  successRate: number;
  lastHeartbeat: string;
  createTime: string;
  config?: any;
  capabilities?: string[];
}

interface AgentManagerProps {
  refreshInterval?: number;
}

const AgentManager: React.FC<AgentManagerProps> = ({ refreshInterval = 10000 }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [metricsVisible, setMetricsVisible] = useState(false);
  const [agentMetrics, setAgentMetrics] = useState<any>(null);

  // 获取智能体列表
  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await agentApi.getList({ page: 0, size: 100 });
      setAgents(response.data.content || []);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    } finally {
      setLoading(false);
    }
  };

  // 执行智能体操作
  const handleAgentAction = async (agentId: string, action: 'start' | 'stop' | 'restart') => {
    try {
      switch (action) {
        case 'start':
          await agentApi.start(agentId);
          break;
        case 'stop':
          await agentApi.stop(agentId);
          break;
        case 'restart':
          await agentApi.restart(agentId);
          break;
      }
      fetchAgents();
    } catch (error) {
      console.error(`Failed to ${action} agent:`, error);
    }
  };

  // 查看智能体详情
  const handleViewDetail = async (agent: Agent) => {
    try {
      const response = await agentApi.getDetail(agent.id);
      setSelectedAgent(response.data);
      setDetailVisible(true);
    } catch (error) {
      console.error('Failed to fetch agent detail:', error);
    }
  };

  // 查看智能体指标
  const handleViewMetrics = async (agent: Agent) => {
    try {
      const response = await agentApi.getMetrics(agent.id);
      setAgentMetrics(response.data);
      setMetricsVisible(true);
    } catch (error) {
      console.error('Failed to fetch agent metrics:', error);
    }
  };

  // 状态标签颜色映射
  const getStatusColor = (status: AgentStatus) => {
    const colorMap: Record<string, string> = {
      [AgentStatus.IDLE]: 'green',
      [AgentStatus.BUSY]: 'blue',
      [AgentStatus.ERROR]: 'red',
      [AgentStatus.MAINTENANCE]: 'orange',
    };
    return colorMap[String(status)] || 'default';
  };

  // 状态文本映射
  const getStatusText = (status: AgentStatus) => {
    const textMap: Record<string, string> = {
      [AgentStatus.IDLE]: '空闲',
      [AgentStatus.BUSY]: '忙碌',
      [AgentStatus.ERROR]: '错误',
      [AgentStatus.MAINTENANCE]: '维护中',
    };
    return textMap[String(status)] || String(status);
  };

  // 计算统计数据
  const getStatistics = () => {
    const total = agents.length;
    const idle = agents.filter(a => a.status === AgentStatus.IDLE).length;
    const busy = agents.filter(a => a.status === AgentStatus.BUSY).length;
    const error = agents.filter(a => a.status === AgentStatus.ERROR).length;
    const maintenance = agents.filter(a => a.status === AgentStatus.MAINTENANCE).length;
    const avgCpuUsage = agents.length > 0 ? agents.reduce((sum, a) => sum + a.cpuUsage, 0) / agents.length : 0;
    const avgMemoryUsage = agents.length > 0 ? agents.reduce((sum, a) => sum + a.memoryUsage, 0) / agents.length : 0;

    return { total, idle, busy, error, maintenance, avgCpuUsage, avgMemoryUsage };
  };

  const stats = getStatistics();

  // 表格列定义
  const columns: ColumnsType<Agent> = [
    {
      title: '智能体名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Agent) => (
        <Space>
          <Text strong>{text}</Text>
          <Text type="secondary">({record.type})</Text>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: AgentStatus) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'CPU使用率',
      dataIndex: 'cpuUsage',
      key: 'cpuUsage',
      render: (usage: number) => (
        <Progress percent={usage} size="small" status={usage > 80 ? 'exception' : 'active'} />
      ),
    },
    {
      title: '内存使用率',
      dataIndex: 'memoryUsage',
      key: 'memoryUsage',
      render: (usage: number) => (
        <Progress percent={usage} size="small" status={usage > 80 ? 'exception' : 'active'} />
      ),
    },
    {
      title: '任务数',
      dataIndex: 'taskCount',
      key: 'taskCount',
    },
    {
      title: '成功率',
      dataIndex: 'successRate',
      key: 'successRate',
      render: (rate: number) => (
        <Text type={rate < 90 ? 'danger' : 'success'}>
          {rate.toFixed(1)}%
        </Text>
      ),
    },
    {
      title: '最后心跳',
      dataIndex: 'lastHeartbeat',
      key: 'lastHeartbeat',
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: Agent) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          <Button
            type="text"
            icon={<SettingOutlined />}
            onClick={() => handleViewMetrics(record)}
          >
            指标
          </Button>
          {record.status === AgentStatus.IDLE && (
            <Button
              type="text"
              icon={<PlayCircleOutlined />}
              onClick={() => handleAgentAction(record.id, 'start')}
            >
              启动
            </Button>
          )}
          {record.status === AgentStatus.BUSY && (
            <Button
              type="text"
              icon={<StopOutlined />}
              onClick={() => handleAgentAction(record.id, 'stop')}
            >
              停止
            </Button>
          )}
          {record.status === AgentStatus.ERROR && (
            <Button
              type="text"
              icon={<ReloadOutlined />}
              onClick={() => handleAgentAction(record.id, 'restart')}
            >
              重启
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // 定时刷新
  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return (
    <div className="agent-manager">
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="智能体总数"
              value={stats.total}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="空闲智能体"
              value={stats.idle}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="忙碌智能体"
              value={stats.busy}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="异常智能体"
              value={stats.error}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="智能体管理"
        extra={
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={fetchAgents}
            loading={loading}
          >
            刷新
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={agents}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      {/* 智能体详情弹窗 */}
      <Modal
        title="智能体详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={800}
      >
        {selectedAgent && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="智能体ID">{selectedAgent.id}</Descriptions.Item>
            <Descriptions.Item label="智能体名称">{selectedAgent.name}</Descriptions.Item>
            <Descriptions.Item label="智能体类型">{selectedAgent.type}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={getStatusColor(selectedAgent.status)}>
                {getStatusText(selectedAgent.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="任务数量">{selectedAgent.taskCount}</Descriptions.Item>
            <Descriptions.Item label="成功率">
              {selectedAgent.successRate.toFixed(1)}%
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {new Date(selectedAgent.createTime).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="最后心跳">
              {new Date(selectedAgent.lastHeartbeat).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="能力标签" span={2}>
              <Space wrap>
                {selectedAgent.capabilities?.map(cap => (
                  <Tag key={cap} color="blue">{cap}</Tag>
                ))}
              </Space>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* 智能体指标弹窗 */}
      <Modal
        title="性能指标"
        open={metricsVisible}
        onCancel={() => setMetricsVisible(false)}
        footer={null}
        width={800}
      >
        {agentMetrics && (
          <Row gutter={16}>
            <Col span={12}>
              <Card title="系统资源">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text>CPU使用率: </Text>
                    <Progress percent={agentMetrics.cpuUsage} />
                  </div>
                  <div>
                    <Text>内存使用率: </Text>
                    <Progress percent={agentMetrics.memoryUsage} />
                  </div>
                  <div>
                    <Text>磁盘使用率: </Text>
                    <Progress percent={agentMetrics.diskUsage} />
                  </div>
                </Space>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="任务统计">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Statistic title="总任务数" value={agentMetrics.totalTasks} />
                  <Statistic title="成功任务数" value={agentMetrics.successTasks} />
                  <Statistic title="失败任务数" value={agentMetrics.failedTasks} />
                  <Statistic title="平均响应时间" value={agentMetrics.avgResponseTime} suffix="ms" />
                </Space>
              </Card>
            </Col>
          </Row>
        )}
      </Modal>
    </div>
  );
};

export default AgentManager;