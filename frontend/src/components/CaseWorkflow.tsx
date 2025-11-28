import React, { useState } from 'react';
import { Card, Steps, Button, Form, Input, Select, Upload, message, Space, Typography, Timeline, Tag, Modal, Descriptions } from 'antd';
import { UploadOutlined, SaveOutlined, SendOutlined, EyeOutlined } from '@ant-design/icons';
import type { StepsProps } from 'antd';
import { caseApi, fileApi } from '../services/api';

const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

interface CaseWorkflowProps {
  onCaseCreated?: (caseData: any) => void;
}

interface WorkflowStep {
  title: string;
  description: string;
  component: React.ReactNode;
}

const CaseWorkflow: React.FC<CaseWorkflowProps> = ({ onCaseCreated }) => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [caseData, setCaseData] = useState<any>({});
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);

  // 工作流步骤定义
  const workflowSteps: WorkflowStep[] = [
    {
      title: '基本信息',
      description: '填写案例基本信息',
      component: (
        <Form.Item
          label="案例名称"
          name="name"
          rules={[{ required: true, message: '请输入案例名称' }]}
        >
          <Input placeholder="请输入案例名称" />
        </Form.Item>
      ),
    },
    {
      title: '问题描述',
      description: '详细描述失效问题',
      component: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Form.Item
            label="问题类型"
            name="problemType"
            rules={[{ required: true, message: '请选择问题类型' }]}
          >
            <Select placeholder="请选择问题类型">
              <Option value="mechanical">机械失效</Option>
              <Option value="electrical">电气失效</Option>
              <Option value="chemical">化学失效</Option>
              <Option value="thermal">热失效</Option>
              <Option value="fatigue">疲劳失效</Option>
              <Option value="corrosion">腐蚀失效</Option>
              <Option value="other">其他</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="问题描述"
            name="description"
            rules={[{ required: true, message: '请详细描述失效问题' }]}
          >
            <TextArea
              rows={4}
              placeholder="请详细描述失效问题的现象、发生环境、影响等信息"
            />
          </Form.Item>
          <Form.Item
            label="紧急程度"
            name="urgency"
            rules={[{ required: true, message: '请选择紧急程度' }]}
          >
            <Select placeholder="请选择紧急程度">
              <Option value="low">低</Option>
              <Option value="medium">中</Option>
              <Option value="high">高</Option>
              <Option value="critical">紧急</Option>
            </Select>
          </Form.Item>
        </Space>
      ),
    },
    {
      title: '数据上传',
      description: '上传相关数据文件',
      component: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Form.Item
            label="相关文件"
            name="files"
          >
            <Upload
              multiple
              beforeUpload={async (file) => {
                try {
                  const response = await fileApi.upload(file);
                  setUploadedFiles(prev => [...prev, response.data]);
                  message.success('文件上传成功');
                  return false;
                } catch (error) {
                  message.error('文件上传失败');
                  return false;
                }
              }}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>上传文件</Button>
            </Upload>
          </Form.Item>
          {uploadedFiles.length > 0 && (
            <div>
              <Text strong>已上传文件：</Text>
              <Space direction="vertical" style={{ width: '100%', marginTop: 8 }}>
                {uploadedFiles.map(file => (
                  <div key={file.id} style={{ padding: '8px', border: '1px solid #d9d9d9', borderRadius: '4px' }}>
                    <Space>
                      <Text>{file.fileName}</Text>
                      <Tag color="blue">{file.fileType}</Tag>
                      <Text type="secondary">{(file.fileSize / 1024 / 1024).toFixed(2)} MB</Text>
                    </Space>
                  </div>
                ))}
              </Space>
            </div>
          )}
        </Space>
      ),
    },
    {
      title: '分析配置',
      description: '配置分析参数和方法',
      component: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Form.Item
            label="分析方法"
            name="analysisMethods"
            rules={[{ required: true, message: '请选择至少一种分析方法' }]}
          >
            <Select mode="multiple" placeholder="请选择分析方法">
              <Option value="visual_inspection">外观检查</Option>
              <Option value="microscopic_analysis">显微分析</Option>
              <Option value="spectral_analysis">光谱分析</Option>
              <Option value="thermal_analysis">热分析</Option>
              <Option value="mechanical_testing">力学测试</Option>
              <Option value="chemical_analysis">化学分析</Option>
              <Option value="simulation">仿真分析</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="优先级智能体"
            name="preferredAgents"
          >
            <Select mode="multiple" placeholder="请选择优先使用的智能体">
              <Option value="image_analysis">图像分析智能体</Option>
              <Option value="spectral_analysis">光谱分析智能体</Option>
              <Option value="data_processing">数据处理智能体</Option>
              <Option value="expert_knowledge">专家知识智能体</Option>
              <Option value="simulation">仿真分析智能体</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="分析要求"
            name="requirements"
          >
            <TextArea
              rows={3}
              placeholder="请描述具体的分析要求和期望结果"
            />
          </Form.Item>
        </Space>
      ),
    },
    {
      title: '确认提交',
      description: '确认信息并提交案例',
      component: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Title level={4}>案例信息确认</Title>
          <Descriptions bordered column={2}>
            <Descriptions.Item label="案例名称">
              {caseData.name || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="问题类型">
              {caseData.problemType || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="紧急程度">
              {caseData.urgency || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="上传文件数">
              {uploadedFiles.length}
            </Descriptions.Item>
            <Descriptions.Item label="分析方法" span={2}>
              <Space wrap>
                {caseData.analysisMethods?.map((method: string) => (
                  <Tag key={method} color="blue">{method}</Tag>
                ))}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="问题描述" span={2}>
              {caseData.description || '-'}
            </Descriptions.Item>
          </Descriptions>
        </Space>
      ),
    },
  ];

  // 下一步
  const handleNext = async () => {
    if (currentStep < workflowSteps.length - 1) {
      try {
        if (currentStep < 4) { // 前4步需要验证表单
          const values = await form.validateFields();
          setCaseData((prev: any) => ({ ...prev, ...values }));
        }
        setCurrentStep(currentStep + 1);
      } catch (error) {
        console.error('Validation error:', error);
      }
    }
  };

  // 上一步
  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 提交案例
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const finalCaseData = {
        ...caseData,
        files: uploadedFiles.map(file => file.id),
        status: 'pending',
        createTime: new Date().toISOString(),
      };

      const response = await caseApi.create(finalCaseData);
      message.success('案例创建成功');
      onCaseCreated?.(response.data);
      
      // 重置表单
      form.resetFields();
      setCaseData({});
      setUploadedFiles([]);
      setCurrentStep(0);
    } catch (error) {
      message.error('案例创建失败');
      console.error('Create case error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 预览案例
  const handlePreview = () => {
    setPreviewVisible(true);
  };

  const steps: StepsProps['items'] = workflowSteps.map((step, index) => ({
    key: step.title,
    title: step.title,
    description: step.description,
  }));

  return (
    <div className="case-workflow">
      <Card title="案例创建工作流">
        <Steps current={currentStep} items={steps} style={{ marginBottom: 24 }} />

        <Form
          form={form}
          layout="vertical"
          onValuesChange={(changedValues) => {
            setCaseData((prev: any) => ({ ...prev, ...changedValues }));
          }}
        >
          <div style={{ minHeight: 300 }}>
            {workflowSteps[currentStep].component}
          </div>
        </Form>

        <div style={{ marginTop: 24, textAlign: 'right' }}>
          <Space>
            {currentStep > 0 && (
              <Button onClick={handlePrev}>
                上一步
              </Button>
            )}
            {currentStep < workflowSteps.length - 1 && (
              <Button type="primary" onClick={handleNext}>
                下一步
              </Button>
            )}
            {currentStep === workflowSteps.length - 1 && (
              <>
                <Button icon={<EyeOutlined />} onClick={handlePreview}>
                  预览
                </Button>
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSubmit}
                  loading={loading}
                >
                  提交案例
                </Button>
              </>
            )}
          </Space>
        </div>
      </Card>

      {/* 预览弹窗 */}
      <Modal
        title="案例预览"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            关闭
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>
            确认提交
          </Button>,
        ]}
        width={800}
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label="案例名称">
            {caseData.name}
          </Descriptions.Item>
          <Descriptions.Item label="问题类型">
            {caseData.problemType}
          </Descriptions.Item>
          <Descriptions.Item label="紧急程度">
            <Tag color={caseData.urgency === 'critical' ? 'red' : caseData.urgency === 'high' ? 'orange' : 'blue'}>
              {caseData.urgency}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="上传文件数">
            {uploadedFiles.length}
          </Descriptions.Item>
          <Descriptions.Item label="分析方法" span={2}>
            <Space wrap>
              {caseData.analysisMethods?.map((method: string) => (
                <Tag key={method} color="blue">{method}</Tag>
              ))}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="问题描述" span={2}>
            {caseData.description}
          </Descriptions.Item>
          <Descriptions.Item label="分析要求" span={2}>
            {caseData.requirements || '-'}
          </Descriptions.Item>
        </Descriptions>

        {uploadedFiles.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Title level={5}>相关文件</Title>
            <Timeline>
              {uploadedFiles.map(file => (
                <Timeline.Item key={file.id}>
                  <Space>
                    <Text strong>{file.fileName}</Text>
                    <Tag color="blue">{file.fileType}</Tag>
                    <Text type="secondary">{(file.fileSize / 1024 / 1024).toFixed(2)} MB</Text>
                  </Space>
                </Timeline.Item>
              ))}
            </Timeline>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CaseWorkflow;