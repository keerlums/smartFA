import React, { useState } from 'react'
import {
  Card,
  Row,
  Col,
  Upload,
  Button,
  Space,
  Tabs,
  Image,
  Typography,
  Progress,
  List,
  Tag,
  Modal,
  Form,
  Input,
  Select
} from 'antd'
import {
  InboxOutlined,
  UploadOutlined,
  EyeOutlined,
  DeleteOutlined,
  FileImageOutlined,
  FileTextOutlined,
  VideoCameraOutlined,
  SoundOutlined
} from '@ant-design/icons'
import type { UploadProps, UploadFile } from 'antd'

const { Dragger } = Upload
const { Title, Text } = Typography
const { TabPane } = Tabs
const { TextArea } = Input

interface UploadedFile {
  id: string
  name: string
  type: string
  size: number
  status: string
  url?: string
  preview?: string
}

interface AnalysisTask {
  id: string
  name: string
  type: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  files: string[]
  createdAt: string
}

const MultimodalWorkbench: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [analysisTasks, setAnalysisTasks] = useState<AnalysisTask[]>([])
  const [previewModalVisible, setPreviewModalVisible] = useState(false)
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null)
  const [taskModalVisible, setTaskModalVisible] = useState(false)
  const [form] = Form.useForm()

  // 模拟数据
  const mockTasks: AnalysisTask[] = [
    {
      id: '1',
      name: '芯片表面缺陷检测',
      type: 'image_analysis',
      status: 'processing',
      progress: 75,
      files: ['chip_image_001.jpg', 'chip_image_002.jpg'],
      createdAt: '2024-01-15 10:30:00'
    },
    {
      id: '2',
      name: '失效分析文档解析',
      type: 'document_analysis',
      status: 'completed',
      progress: 100,
      files: ['failure_report.pdf'],
      createdAt: '2024-01-15 09:15:00'
    }
  ]

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    accept: 'image/*,.pdf,.doc,.docx,.txt,.mp4,.avi,.mp3,.wav',
    customRequest: ({ file, onSuccess, onError }) => {
      // 模拟上传过程
      setTimeout(() => {
        const newFile: UploadedFile = {
          id: Date.now().toString(),
          name: (file as File).name,
          type: (file as File).type,
          size: (file as File).size,
          status: 'done',
          url: URL.createObjectURL(file as any),
          preview: URL.createObjectURL(file as any)
        }
        setUploadedFiles(prev => [...prev, newFile])
        onSuccess?.(newFile)
      }, 1000)
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files)
    }
  }

  const handlePreview = (file: UploadedFile) => {
    setPreviewFile(file)
    setPreviewModalVisible(true)
  }

  const handleDelete = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const handleCreateTask = (values: any) => {
    const newTask: AnalysisTask = {
      id: Date.now().toString(),
      name: values.taskName,
      type: values.taskType,
      status: 'pending',
      progress: 0,
      files: values.selectedFiles,
      createdAt: new Date().toLocaleString()
    }
    setAnalysisTasks(prev => [...prev, newTask])
    setTaskModalVisible(false)
    form.resetFields()
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FileImageOutlined />
    if (type.includes('pdf') || type.includes('document')) return <FileTextOutlined />
    if (type.startsWith('video/')) return <VideoCameraOutlined />
    if (type.startsWith('audio/')) return <SoundOutlined />
    return <FileTextOutlined />
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'default'
      case 'processing': return 'processing'
      case 'completed': return 'success'
      case 'failed': return 'error'
      default: return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待处理'
      case 'processing': return '处理中'
      case 'completed': return '已完成'
      case 'failed': return '失败'
      default: return '未知'
    }
  }

  const renderPreviewContent = () => {
    if (!previewFile) return null

    if (previewFile.type.startsWith('image/')) {
      return (
        <Image
          src={previewFile.preview}
          alt={previewFile.name}
          style={{ maxWidth: '100%' }}
        />
      )
    }

    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        {getFileIcon(previewFile.type)}
        <p>{previewFile.name}</p>
        <Text type="secondary">文件大小: {(previewFile.size / 1024).toFixed(2)} KB</Text>
      </div>
    )
  }

  return (
    <div>
      <Title level={2}>多模态工作台</Title>
      
      <Row gutter={16}>
        {/* 文件上传区域 */}
        <Col span={12}>
          <Card title="数据上传" style={{ marginBottom: 16 }}>
            <Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
              <p className="ant-upload-hint">
                支持图片、文档、视频、音频等多种格式文件
              </p>
            </Dragger>
          </Card>

          {/* 已上传文件列表 */}
          <Card title="已上传文件">
            <List
              dataSource={uploadedFiles}
              renderItem={file => (
                <List.Item
                  actions={[
                    <Button
                      key="preview"
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() => handlePreview(file)}
                    />,
                    <Button
                      key="delete"
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(file.id)}
                    />
                  ]}
                >
                  <List.Item.Meta
                    avatar={getFileIcon(file.type)}
                    title={file.name}
                    description={`${(file.size / 1024).toFixed(2)} KB`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 任务管理区域 */}
        <Col span={12}>
          <Card
            title="分析任务"
            extra={
              <Button
                type="primary"
                icon={<UploadOutlined />}
                onClick={() => setTaskModalVisible(true)}
                disabled={uploadedFiles.length === 0}
              >
                创建任务
              </Button>
            }
          >
            <List
              dataSource={mockTasks}
              renderItem={task => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space>
                        {task.name}
                        <Tag color={getStatusColor(task.status)}>
                          {getStatusText(task.status)}
                        </Tag>
                      </Space>
                    }
                    description={
                      <div>
                        <Text type="secondary">创建时间: {task.createdAt}</Text>
                        {task.status === 'processing' && (
                          <Progress
                            percent={task.progress}
                            size="small"
                            style={{ marginTop: 8 }}
                          />
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* 预览模态框 */}
      <Modal
        title="文件预览"
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={null}
        width={800}
      >
        {renderPreviewContent()}
      </Modal>

      {/* 创建任务模态框 */}
      <Modal
        title="创建分析任务"
        open={taskModalVisible}
        onCancel={() => setTaskModalVisible(false)}
        onOk={() => form.submit()}
        okText="创建"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateTask}
        >
          <Form.Item
            name="taskName"
            label="任务名称"
            rules={[{ required: true, message: '请输入任务名称' }]}
          >
            <Input placeholder="请输入任务名称" />
          </Form.Item>

          <Form.Item
            name="taskType"
            label="任务类型"
            rules={[{ required: true, message: '请选择任务类型' }]}
          >
            <Select placeholder="请选择任务类型">
              <Select.Option value="image_analysis">图像分析</Select.Option>
              <Select.Option value="document_analysis">文档分析</Select.Option>
              <Select.Option value="video_analysis">视频分析</Select.Option>
              <Select.Option value="audio_analysis">音频分析</Select.Option>
              <Select.Option value="multimodal_fusion">多模态融合</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="selectedFiles"
            label="选择文件"
            rules={[{ required: true, message: '请选择要分析的文件' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择要分析的文件"
              style={{ width: '100%' }}
            >
              {uploadedFiles.map(file => (
                <Select.Option key={file.id} value={file.id}>
                  {file.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="description" label="任务描述">
            <TextArea
              rows={4}
              placeholder="请输入任务描述（可选）"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default MultimodalWorkbench