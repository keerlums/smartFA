# SmartFA API 文档

## 概述

SmartFA（失效分析智能辅助平台）提供了一套完整的RESTful API，支持多模态数据处理、智能任务调度、多智能体协作等功能。

## 基础信息

- **Base URL**: `http://localhost:8080`
- **API版本**: v1
- **认证方式**: JWT Bearer Token
- **数据格式**: JSON

## 认证

所有API请求（除登录外）都需要在Header中包含认证Token：

```
Authorization: Bearer <your-jwt-token>
```

## 通用响应格式

### 成功响应

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {},
  "success": true,
  "timestamp": 1634567890123
}
```

### 错误响应

```json
{
  "code": 400,
  "message": "请求参数错误",
  "data": null,
  "success": false,
  "timestamp": 1634567890123
}
```

## API接口

### 1. 认证接口

#### 1.1 用户登录

**POST** `/api/auth/login`

**请求参数**:
```json
{
  "username": "admin",
  "password": "password"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "expiresIn": 3600,
    "user": {
      "id": "1",
      "username": "admin",
      "email": "admin@example.com",
      "roles": ["ADMIN"]
    }
  },
  "success": true,
  "timestamp": 1634567890123
}
```

#### 1.2 刷新Token

**POST** `/api/auth/refresh`

**请求参数**:
```json
{
  "refreshToken": "refresh_token_here"
}
```

#### 1.3 用户登出

**POST** `/api/auth/logout`

**Headers**: `Authorization: Bearer <token>`

### 2. 文件管理接口

#### 2.1 文件上传

**POST** `/api/files/upload`

**Content-Type**: `multipart/form-data`

**请求参数**:
- `file`: 文件对象

**响应示例**:
```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "fileId": "file_123456",
    "fileName": "sample.jpg",
    "fileSize": 1024000,
    "fileType": "image/jpeg",
    "uploadTime": "2023-10-18T10:30:00Z",
    "url": "http://localhost:9000/smartfa-files/file_123456"
  },
  "success": true,
  "timestamp": 1634567890123
}
```

#### 2.2 文件下载

**GET** `/api/files/download/{fileId}`

**响应**: 文件流

#### 2.3 获取文件列表

**GET** `/api/files`

**查询参数**:
- `page`: 页码（默认0）
- `size`: 每页大小（默认20）
- `type`: 文件类型过滤
- `keyword`: 关键词搜索

**响应示例**:
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "content": [
      {
        "fileId": "file_123456",
        "fileName": "sample.jpg",
        "fileSize": 1024000,
        "fileType": "image/jpeg",
        "uploadTime": "2023-10-18T10:30:00Z"
      }
    ],
    "totalElements": 1,
    "totalPages": 1,
    "size": 20,
    "number": 0,
    "first": true,
    "last": true
  },
  "success": true,
  "timestamp": 1634567890123
}
```

#### 2.4 删除文件

**DELETE** `/api/files/{fileId}`

### 3. 任务管理接口

#### 3.1 创建任务

**POST** `/api/tasks`

**请求参数**:
```json
{
  "name": "图像分析任务",
  "type": "IMAGE_ANALYSIS",
  "description": "分析产品缺陷",
  "priority": "HIGH",
  "fileIds": ["file_123456"],
  "config": {
    "analysisType": "defect_detection",
    "threshold": 0.8
  }
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "任务创建成功",
  "data": {
    "taskId": "task_123456",
    "name": "图像分析任务",
    "type": "IMAGE_ANALYSIS",
    "status": "PENDING",
    "progress": 0,
    "createTime": "2023-10-18T10:30:00Z"
  },
  "success": true,
  "timestamp": 1634567890123
}
```

#### 3.2 获取任务列表

**GET** `/api/tasks`

**查询参数**:
- `page`: 页码
- `size`: 每页大小
- `status`: 状态过滤
- `type`: 类型过滤

#### 3.3 获取任务详情

**GET** `/api/tasks/{taskId}`

#### 3.4 更新任务

**PUT** `/api/tasks/{taskId}`

#### 3.5 取消任务

**POST** `/api/tasks/{taskId}/cancel`

#### 3.6 获取任务日志

**GET** `/api/tasks/{taskId}/logs`

### 4. 智能体管理接口

#### 4.1 获取智能体列表

**GET** `/api/agents`

**查询参数**:
- `page`: 页码
- `size`: 每页大小
- `status`: 状态过滤
- `type`: 类型过滤

**响应示例**:
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "content": [
      {
        "agentId": "agent_001",
        "name": "图像分析智能体",
        "type": "IMAGE_ANALYSIS",
        "status": "IDLE",
        "capabilities": ["defect_detection", "quality_assessment"],
        "cpuUsage": 25.5,
        "memoryUsage": 45.2,
        "taskCount": 10,
        "successRate": 95.5,
        "lastHeartbeat": "2023-10-18T10:29:00Z"
      }
    ],
    "totalElements": 1,
    "totalPages": 1,
    "size": 20,
    "number": 0,
    "first": true,
    "last": true
  },
  "success": true,
  "timestamp": 1634567890123
}
```

#### 4.2 获取智能体详情

**GET** `/api/agents/{agentId}`

#### 4.3 启动智能体

**POST** `/api/agents/{agentId}/start`

#### 4.4 停止智能体

**POST** `/api/agents/{agentId}/stop`

#### 4.5 重启智能体

**POST** `/api/agents/{agentId}/restart`

#### 4.6 获取智能体性能指标

**GET** `/api/agents/{agentId}/metrics`

**响应示例**:
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "agentId": "agent_001",
    "cpuUsage": 25.5,
    "memoryUsage": 45.2,
    "diskUsage": 30.1,
    "totalTasks": 100,
    "successTasks": 95,
    "failedTasks": 5,
    "avgResponseTime": 1500,
    "uptime": 86400
  },
  "success": true,
  "timestamp": 1634567890123
}
```

### 5. 案例管理接口

#### 5.1 创建案例

**POST** `/api/cases`

**请求参数**:
```json
{
  "name": "产品失效分析案例",
  "problemType": "mechanical",
  "description": "产品出现裂纹失效",
  "urgency": "HIGH",
  "files": ["file_123456"],
  "analysisMethods": ["visual_inspection", "microscopic_analysis"],
  "requirements": "需要分析裂纹产生原因"
}
```

#### 5.2 获取案例列表

**GET** `/api/cases`

**查询参数**:
- `page`: 页码
- `size`: 每页大小
- `status`: 状态过滤
- `type`: 类型过滤

#### 5.3 获取案例详情

**GET** `/api/cases/{caseId}`

#### 5.4 更新案例

**PUT** `/api/cases/{caseId}`

#### 5.5 删除案例

**DELETE** `/api/cases/{caseId}`

#### 5.6 生成报告

**POST** `/api/cases/{caseId}/report`

### 6. 仪表板接口

#### 6.1 获取统计数据

**GET** `/api/dashboard/stats`

**响应示例**:
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "totalCases": 150,
    "activeTasks": 25,
    "onlineAgents": 8,
    "totalFiles": 1250,
    "taskCompletionRate": 92.5,
    "agentUtilization": 75.3
  },
  "success": true,
  "timestamp": 1634567890123
}
```

#### 6.2 获取系统状态

**GET** `/api/dashboard/system-status`

#### 6.3 获取实时指标

**GET** `/api/dashboard/real-time-metrics`

### 7. AI服务接口

#### 7.1 图像分析

**POST** `/api/ai/image-analysis`

**请求参数**:
```json
{
  "image": "base64_encoded_image",
  "analysisType": "defect_detection",
  "config": {
    "threshold": 0.8,
    "model": "yolo_v5"
  }
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "分析完成",
  "data": {
    "defects": [
      {
        "id": 1,
        "type": "crack",
        "confidence": 0.95,
        "bbox": [100, 150, 200, 250],
        "area": 10000,
        "severity": "high"
      }
    ],
    "totalDefects": 1,
    "defectDensity": 0.1,
    "processingTime": 2.5
  },
  "success": true,
  "timestamp": 1634567890123
}
```

#### 7.2 文档分析

**POST** `/api/ai/document-analysis`

**请求参数**:
```json
{
  "document": "base64_encoded_document",
  "analysisType": "text_extraction",
  "config": {
    "language": "zh",
    "format": "pdf"
  }
}
```

#### 7.3 LLM服务

**POST** `/api/ai/llm/chat`

**请求参数**:
```json
{
  "message": "请分析这个失效原因",
  "context": "产品出现裂纹...",
  "model": "deepseek-chat"
}
```

## 错误码

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 422 | 数据验证失败 |
| 500 | 服务器内部错误 |

## 限流规则

- 每个用户每分钟最多100个请求
- 文件上传限制：单个文件最大100MB
- 批量操作限制：每次最多50个项目

## SDK示例

### JavaScript/TypeScript

```typescript
import { apiService } from './services/api';

// 上传文件
const uploadFile = async (file: File) => {
  try {
    const response = await apiService.uploadFile(file);
    console.log('File uploaded:', response.data);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};

// 创建任务
const createTask = async (taskData: any) => {
  try {
    const response = await apiService.post('/api/tasks', taskData);
    console.log('Task created:', response.data);
  } catch (error) {
    console.error('Task creation failed:', error);
  }
};
```

### Python

```python
import requests

class SmartFAAPIClient:
    def __init__(self, base_url, token=None):
        self.base_url = base_url
        self.token = token
        self.headers = {
            'Content-Type': 'application/json',
        }
        if token:
            self.headers['Authorization'] = f'Bearer {token}'
    
    def upload_file(self, file_path):
        with open(file_path, 'rb') as f:
            files = {'file': f}
            response = requests.post(
                f'{self.base_url}/api/files/upload',
                files=files,
                headers={'Authorization': f'Bearer {self.token}'}
            )
        return response.json()
    
    def create_task(self, task_data):
        response = requests.post(
            f'{self.base_url}/api/tasks',
            json=task_data,
            headers=self.headers
        )
        return response.json()
```

## WebSocket接口

### 实时任务状态

**连接地址**: `ws://localhost:8080/ws/tasks`

**消息格式**:
```json
{
  "type": "TASK_STATUS_UPDATE",
  "data": {
    "taskId": "task_123456",
    "status": "RUNNING",
    "progress": 45,
    "message": "正在处理图像..."
  }
}
```

### 实时智能体状态

**连接地址**: `ws://localhost:8080/ws/agents`

## 版本更新记录

### v1.0.0 (2023-10-18)
- 初始版本发布
- 支持基础CRUD操作
- 集成AI服务接口

### v1.1.0 (计划中)
- 增加批量操作接口
- 优化性能指标接口
- 增加更多AI分析类型

---

更多信息请参考：
- [开发指南](./开发指南.md)
- [部署指南](./部署指南.md)
- [架构设计](./架构设计.md)