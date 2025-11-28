import React, { useState, useCallback } from 'react';
import { Upload, message, Progress, Button, Card, List, Typography, Space, Tag } from 'antd';
import { InboxOutlined, DeleteOutlined, DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import type { UploadProps, UploadFile } from 'antd/es/upload';
import { fileApi } from '../services/api';

const { Dragger } = Upload;
const { Title, Text } = Typography;

interface FileUploadProps {
  onFileUploaded?: (file: any) => void;
  maxFileSize?: number; // MB
  accept?: string;
  multiple?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileUploaded,
  maxFileSize = 100,
  accept = '*',
  multiple = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  const handleUpload = useCallback(async (file: File) => {
    // 检查文件大小
    if (file.size > maxFileSize * 1024 * 1024) {
      message.error(`文件大小不能超过 ${maxFileSize}MB`);
      return false;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const response = await fileApi.uploadFile(file, (progress: number) => {
        setUploadProgress(progress);
      });

      const uploadedFile = {
        id: response.data.fileId,
        name: response.data.fileName,
        size: response.data.fileSize,
        type: response.data.fileType,
        url: response.data.url,
        uploadTime: response.data.uploadTime,
      };

      setUploadedFiles(prev => [...prev, uploadedFile]);
      message.success('文件上传成功');
      onFileUploaded?.(uploadedFile);
    } catch (error) {
      message.error('文件上传失败');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }

    return false; // 阻止默认上传行为
  }, [maxFileSize, onFileUploaded]);

  const handleRemove = useCallback(async (fileId: string) => {
    try {
      await fileApi.deleteFile(fileId);
      setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
      message.success('文件删除成功');
    } catch (error) {
      message.error('文件删除失败');
      console.error('Delete error:', error);
    }
  }, []);

  const handleDownload = useCallback(async (file: any) => {
    try {
      const resp = await fileApi.downloadFile(file.id);
      const blob = resp.data || resp;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      message.error('文件下载失败');
      console.error('Download error:', error);
    }
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeColor = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'image': 'green',
      'video': 'blue',
      'audio': 'purple',
      'document': 'orange',
      'application': 'red',
      'text': 'cyan',
    };
    return typeMap[type.split('/')[0]] || 'default';
  };

  const uploadProps: UploadProps = {
    name: 'file',
    multiple,
    accept,
    beforeUpload: handleUpload,
    showUploadList: false,
    disabled: uploading,
  };

  return (
    <div className="file-upload">
      <Card title="文件上传" className="upload-card">
        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            点击或拖拽文件到此区域上传
          </p>
          <p className="ant-upload-hint">
            支持单个或批量上传。最大文件大小: {maxFileSize}MB
          </p>
        </Dragger>

        {uploading && (
          <div style={{ marginTop: 16 }}>
            <Text>上传进度:</Text>
            <Progress percent={uploadProgress} status="active" />
          </div>
        )}

        {uploadedFiles.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <Title level={5}>已上传文件</Title>
            <List
              dataSource={uploadedFiles}
              renderItem={(file) => (
                <List.Item
                  actions={[
                    <Button
                      key="preview"
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() => window.open(file.url, '_blank')}
                    >
                      预览
                    </Button>,
                    <Button
                      key="download"
                      type="text"
                      icon={<DownloadOutlined />}
                      onClick={() => handleDownload(file)}
                    >
                      下载
                    </Button>,
                    <Button
                      key="delete"
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemove(file.id)}
                    >
                      删除
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <span>{file.name}</span>
                        <Tag color={getFileTypeColor(file.type)}>
                          {file.type}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={0}>
                        <Text type="secondary">
                          大小: {formatFileSize(file.size)}
                        </Text>
                        <Text type="secondary">
                          上传时间: {file.uploadTime}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default FileUpload;