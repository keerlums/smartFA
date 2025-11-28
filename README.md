# 失效分析智能辅助平台 (SmartFA)

> 基于人工智能的综合性失效分析平台，集成多模态数据处理、智能任务调度和多智能体协作能力。

## 🌟 项目概述

失效分析智能辅助平台是一个先进的AI驱动系统，专为材料科学、半导体制造、质量检测等领域的失效分析工作而设计。平台采用微服务架构，融合了计算机视觉、自然语言处理、机器学习等前沿技术，为失效分析提供全方位的智能化支持。

### 核心特性

- 🔬 **多模态数据处理**: 支持图像、文档、视频、音频等多种数据格式的智能处理
- 🧠 **智能任务调度**: 基于AI的任务分解、资源调度和工作流编排
- 🤖 **多智能体协作**: 专业化智能体集群，协同完成复杂的分析任务
- 📊 **可视化分析**: 丰富的图表和3D可视化，直观展示分析结果
- 🔄 **实时监控**: 全系统性能监控和实时状态追踪
- 🛡️ **企业级安全**: 完善的权限控制和数据安全机制

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                    前端展示层                                │
│  React 18 + TypeScript + Ant Design + ECharts              │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    API网关层                                │
│  Spring Cloud Gateway + 统一认证 + 限流熔断                 │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   微服务层                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐ │
│  │ 多模态工作台 │ │   智能中枢   │ │     多智能体集群         │ │
│  │   服务      │ │    服务     │ │       服务              │ │
│  └─────────────┘ └─────────────┘ └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   数据存储层                                │
│  PostgreSQL + MongoDB + Redis + InfluxDB + MinIO           │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 快速开始

### 环境要求

- Docker 20.10+
- Docker Compose 2.0+
- Node.js 16+ (本地开发)
- Java 17+ (本地开发)
- 8GB+ RAM
- 20GB+ 磁盘空间

### 一键部署

```bash
# 克隆项目
git clone https://github.com/your-org/smartfa.git
cd smartFA

# 完整部署（推荐）
./scripts/deploy.sh deploy
```

部署完成后，访问：
- **前端应用**: http://localhost
- **API文档**: http://localhost/api/doc.html
- **MinIO控制台**: http://localhost:9001 (smartfa/smartfa123)

### 本地开发

#### 前端开发
```bash
cd frontend
npm install
npm run dev
```

#### 后端开发
```bash
cd backend
mvn clean install
# 启动各个微服务
./scripts/start-services.sh
```

## 📁 项目结构

```
smartFA/
├── frontend/                 # React前端应用
│   ├── src/
│   │   ├── components/       # 通用组件
│   │   ├── pages/           # 页面组件
│   │   │   ├── Dashboard.tsx        # 控制台
│   │   │   ├── MultimodalWorkbench.tsx # 多模态工作台
│   │   │   ├── IntelligentHub.tsx    # 智能中枢
│   │   │   ├── MultiAgentCluster.tsx # 多智能体集群
│   │   │   └── CaseManagement.tsx    # 案例管理
│   │   ├── store/           # Redux状态管理
│   │   ├── services/        # API服务
│   │   └── utils/           # 工具函数
│   └── package.json
├── backend/                  # Spring Boot后端服务
│   ├── multimodal-workbench/ # 多模态工作台服务
│   ├── intelligent-hub/     # 智能中枢服务
│   ├── multi-agent-cluster/ # 多智能体集群服务
│   └── common/              # 公共模块
├── ai-services/              # AI服务模块
├── infrastructure/           # 基础设施配置
├── scripts/                 # 部署和管理脚本
├── docs/                    # 项目文档
└── docker-compose.yml       # 容器编排配置
```

## 🎯 核心功能

### 1. 多模态工作台
- **数据采集**: 支持拖拽上传多种格式文件
- **智能预处理**: 图像增强、文档解析、数据清洗
- **任务创建**: 灵活的任务配置和参数设置
- **进度监控**: 实时任务执行状态追踪

### 2. 智能中枢
- **任务分解**: AI驱动的复杂任务自动分解
- **资源调度**: 智能分配计算资源和智能体
- **工作流编排**: 可视化流程设计和执行
- **结果聚合**: 多源数据的智能融合

### 3. 多智能体集群
- **专业化智能体**: 视觉分析、光谱分析、数据处理等
- **协作机制**: 智能体间通信和任务协作
- **性能监控**: 实时性能指标和健康状态
- **生命周期管理**: 智能体的创建、配置和销毁

### 4. 案例管理
- **全生命周期管理**: 从创建到归档的完整流程
- **智能分类**: 基于内容的自动分类和标签
- **版本控制**: 分析过程和结果版本管理
- **报告生成**: 自动化分析报告生成

## 🔧 技术栈

### 前端技术
- **React 18**: 现代化的用户界面框架
- **TypeScript**: 类型安全的JavaScript
- **Ant Design**: 企业级UI组件库
- **Redux Toolkit**: 状态管理
- **ECharts**: 数据可视化
- **Three.js**: 3D图形渲染

### 后端技术
- **Spring Boot 3.x**: Java微服务框架
- **PostgreSQL**: 主数据库
- **MongoDB**: 文档数据库
- **Redis**: 缓存和会话存储
- **Apache Kafka**: 消息队列
- **MinIO**: 对象存储

### AI技术
- **Python 3.11**: AI开发语言
- **PyTorch**: 深度学习框架
- **Transformers**: 预训练模型库
- **OpenCV**: 计算机视觉
- **Milvus**: 向量数据库

## 📊 系统监控

平台提供全方位的监控能力：

- **应用监控**: Spring Boot Actuator + Prometheus
- **基础设施监控**: Docker + Kubernetes
- **业务监控**: 自定义指标和仪表板
- **日志管理**: ELK Stack集中式日志
- **链路追踪**: 分布式请求追踪

访问监控面板：
- **Grafana**: http://localhost:3001
- **Prometheus**: http://localhost:9090

## 🔒 安全特性

- **身份认证**: JWT Token + OAuth2
- **权限控制**: RBAC模型
- **数据加密**: 传输和存储加密
- **审计日志**: 完整的操作记录
- **网络安全**: HTTPS + 防火墙

## 🧪 测试

```bash
# 运行所有测试
./scripts/test.sh

# 前端测试
cd frontend && npm test

# 后端测试
cd backend && mvn test

# 集成测试
./scripts/integration-test.sh
```

## 📚 文档

- [开发指南](docs/开发指南.md) - 详细的开发文档
- [API文档](http://localhost/api/doc.html) - 在线API文档
- [部署指南](docs/部署指南.md) - 生产环境部署
- [架构设计](docs/架构设计.md) - 系统架构详解

## 🤝 贡献

我们欢迎所有形式的贡献！请查看 [贡献指南](CONTRIBUTING.md) 了解如何参与项目开发。

### 开发流程
1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和研究人员。

特别感谢以下开源项目：
- [React](https://reactjs.org/)
- [Spring Boot](https://spring.io/projects/spring-boot)
- [Apache Kafka](https://kafka.apache.org/)
- [PyTorch](https://pytorch.org/)
- [Ant Design](https://ant.design/)

## 📞 联系我们

- **项目维护者**: SmartFA Team
- **邮箱**: smartfa@example.com
- **官网**: https://smartfa.example.com
- **问题反馈**: [GitHub Issues](https://github.com/your-org/smartfa/issues)

---

⭐ 如果这个项目对您有帮助，请给我们一个Star！