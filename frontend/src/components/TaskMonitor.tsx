import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Progress, Typography, Modal, Descriptions, Timeline, Alert } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, StopOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { taskApi } from '../services/api';

const { Title, Text } = Typography;

interface Task {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  createTime: string;
  startTime?: string;
  endTime?: string;
  executor: string;
  description?: string;
  errorMessage?: string;
  logs?: string[];
}

interface TaskMonitorProps {
  refreshInterval?: number;
}

const TaskMonitor: React.FC<TaskMonitorProps> = ({ refreshInterval = 5000 }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [logsVisible, setLogsVisible] = useState(false);

  // 获取任务列表
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await taskApi.getList({ page: 0, size: 100 });
      setTasks(response.data.content || []);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // 执行任务操作
  const handleTaskAction = async (taskId: string, action: 'start' | 'pause' | 'stop' | 'cancel' | 'restart') => {
    try {
      switch (action) {
        case 'start':
          await taskApi.update(taskId, { status: TaskStatus.RUNNING });
          break;
        case 'pause':
          await taskApi.update(taskId, { status: TaskStatus.PENDING });
          break;
        case 'stop':
        case 'cancel':
          await taskApi.cancel(taskId);
          break;
        case 'restart':
          await taskApi.update(taskId, { status: TaskStatus.PENDING });
          break;
      }
      fetchTasks();
    } catch (error) {
      console.error(`Failed to ${action} task:`, error);
    }
  };

  // 查看任务详情
  const handleViewDetail = async (task: Task) => {
    try {
      const response = await taskApi.getDetail(task.id);
      setSelectedTask(response.data);
      setDetailVisible(true);
    } catch (error) {
      console.error('Failed to fetch task detail:', error);
    }
  };

  // 查看任务日志
  const handleViewLogs = async (task: Task) => {
    try {
      const response = await taskApi.getLogs(task.id);
      setSelectedTask({ ...task, logs: response.data });
      setLogsVisible(true);
    } catch (error) {
      console.error('Failed to fetch task logs:', error);
    }
  };

  // 状态标签颜色映射
  const getStatusColor = (status: TaskStatus) => {
    const colorMap = {
      [TaskStatus.PENDING]: 'orange',
      [TaskStatus.RUNNING]: 'blue',
      [TaskStatus.COMPLETED]: 'green',
      [TaskStatus.FAILED]: 'red',
      [TaskStatus.CANCELLED]: 'default',
    };
    return colorMap[status] || 'default';
  };

  // 状态文本映射
  const getStatusText = (status: TaskStatus) => {
    const textMap = {
      [TaskStatus.PENDING]: '等待中',
      [TaskStatus.RUNNING]: '运行中',
      [TaskStatus.COMPLETED]: '已完成',
      [TaskStatus.FAILED]: '失败',
      [TaskStatus.CANCELLED]: '已取消',
    };
    return textMap[status] || status;
  };

  // 表格列定义
  const columns: ColumnsType<Task> = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Task) => (
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
      render: (status: TaskStatus) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number, record: Task) => (
        <Progress
          percent={progress}
          status={record.status === TaskStatus.FAILED ? 'exception' : 'active'}
          size="small"
        />
      ),
    },
    {
      title: '执行者',
      dataIndex: 'executor',
      key: 'executor',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: Task) => (
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
            icon={<EyeOutlined />}
            onClick={() => handleViewLogs(record)}
          >
            日志
          </Button>
          {record.status === TaskStatus.PENDING && (
            <Button
              type="text"
              icon={<PlayCircleOutlined />}
              onClick={() => handleTaskAction(record.id, 'start')}
            >
              启动
            </Button>
          )}
          {record.status === TaskStatus.RUNNING && (
            <Button
              type="text"
              icon={<StopOutlined />}
              onClick={() => handleTaskAction(record.id, 'stop')}
            >
              停止
            </Button>
          )}
          {record.status === TaskStatus.FAILED && (
            <Button
              type="text"
              icon={<ReloadOutlined />}
              onClick={() => handleTaskAction(record.id, 'restart')}
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
    fetchTasks();
    const interval = setInterval(fetchTasks, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return (
    <div className="task-monitor">
      <Card
        title="任务监控"
        extra={
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={fetchTasks}
            loading={loading}
          >
            刷新
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={tasks}
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

      {/* 任务详情弹窗 */}
      <Modal
        title="任务详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={800}
      >
        {selectedTask && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="任务ID">{selectedTask.id}</Descriptions.Item>
            <Descriptions.Item label="任务名称">{selectedTask.name}</Descriptions.Item>
            <Descriptions.Item label="任务类型">{selectedTask.type}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={getStatusColor(selectedTask.status)}>
                {getStatusText(selectedTask.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="进度">
              <Progress percent={selectedTask.progress} />
            </Descriptions.Item>
            <Descriptions.Item label="执行者">{selectedTask.executor}</Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {new Date(selectedTask.createTime).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="开始时间">
              {selectedTask.startTime ? new Date(selectedTask.startTime).toLocaleString() : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="结束时间">
              {selectedTask.endTime ? new Date(selectedTask.endTime).toLocaleString() : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="描述" span={2}>
              {selectedTask.description || '-'}
            </Descriptions.Item>
            {selectedTask.errorMessage && (
              <Descriptions.Item label="错误信息" span={2}>
                <Alert message={selectedTask.errorMessage} type="error" />
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* 任务日志弹窗 */}
      <Modal
        title="任务日志"
        open={logsVisible}
        onCancel={() => setLogsVisible(false)}
        footer={null}
        width={800}
      >
        {selectedTask?.logs && selectedTask.logs.length > 0 ? (
          <Timeline>
            {selectedTask.logs.map((log, index) => (
              <Timeline.Item key={index}>
                <Text>{log}</Text>
              </Timeline.Item>
            ))}
          </Timeline>
        ) : (
          <Text type="secondary">暂无日志记录</Text>
        )}
      </Modal>
    </div>
  );
};

export default TaskMonitor;