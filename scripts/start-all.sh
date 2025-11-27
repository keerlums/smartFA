#!/bin/bash

# 失效分析智能辅助平台 - 完整启动脚本
# 作者: SmartFA Team
# 版本: 1.0.0

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查依赖
check_dependencies() {
    log_info "检查系统依赖..."
    
    # 检查Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    # 检查Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    
    # 检查Node.js (可选，用于本地前端开发)
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        log_info "Node.js 版本: $NODE_VERSION"
    else
        log_warning "Node.js 未安装，将使用容器化前端服务"
    fi
    
    # 检查Java (可选，用于本地后端开发)
    if command -v java &> /dev/null; then
        JAVA_VERSION=$(java -version 2>&1 | head -n 1)
        log_info "Java 版本: $JAVA_VERSION"
    else
        log_warning "Java 未安装，将使用容器化后端服务"
    fi
    
    log_success "依赖检查完成"
}

# 创建必要的目录
create_directories() {
    log_info "创建必要的目录..."
    
    mkdir -p logs
    mkdir -p data/{postgresql,redis,mongodb,influxdb,minio}
    mkdir -p config/{nginx,prometheus,grafana}
    mkdir -p models/{image-analysis,document-analysis,llm}
    
    # 设置权限
    chmod -R 755 data/
    chmod -R 755 logs/
    chmod -R 755 config/
    chmod -R 755 models/
    
    log_success "目录创建完成"
}

# 生成配置文件
generate_configs() {
    log_info "生成配置文件..."
    
    # 生成环境变量文件
    cat > .env << EOF
# SmartFA 环境配置
COMPOSE_PROJECT_NAME=smartfa
ENVIRONMENT=production

# 数据库配置
POSTGRES_DB=smartfa
POSTGRES_USER=smartfa
POSTGRES_PASSWORD=smartfa123
POSTGRES_HOST=postgresql
POSTGRES_PORT=5432

# Redis配置
REDIS_PASSWORD=redis123
REDIS_HOST=redis
REDIS_PORT=6379

# MongoDB配置
MONGO_DB=smartfa
MONGO_USER=smartfa
MONGO_PASSWORD=mongo123
MONGO_HOST=mongodb
MONGO_PORT=27017

# InfluxDB配置
INFLUXDB_DB=smartfa_metrics
INFLUXDB_USER=smartfa
INFLUXDB_PASSWORD=influx123
INFLUXDB_HOST=influxdb
INFLUXDB_PORT=8086

# MinIO配置
MINIO_ROOT_USER=smartfa
MINIO_ROOT_PASSWORD=minio123
MINIO_HOST=minio
MINIO_PORT=9000
MINIO_CONSOLE_PORT=9001

# Kafka配置
KAFKA_HOST=kafka
KAFKA_PORT=9092
ZOOKEEPER_HOST=zookeeper
ZOOKEEPER_PORT=2181

# 应用配置
FRONTEND_PORT=80
API_GATEWAY_PORT=8080
MULTIMODAL_WORKBENCH_PORT=8080
INTELLIGENT_HUB_PORT=8081
MULTI_AGENT_CLUSTER_PORT=8082

# AI服务配置
IMAGE_ANALYSIS_PORT=8001
DOCUMENT_ANALYSIS_PORT=8002
LLM_SERVICE_PORT=8003

# 监控配置
PROMETHEUS_PORT=9090
GRAFANA_PORT=3001
ALERTMANAGER_PORT=9093

# JWT配置
JWT_SECRET=smartfa_jwt_secret_key_2023
JWT_EXPIRATION=86400

# 日志级别
LOG_LEVEL=INFO
EOF

    log_success "配置文件生成完成"
}

# 构建镜像
build_images() {
    log_info "构建Docker镜像..."
    
    # 构建前端镜像
    log_info "构建前端镜像..."
    docker build -t smartfa/frontend:latest ./frontend/
    
    # 构建后端镜像
    log_info "构建多模态工作台镜像..."
    docker build -t smartfa/multimodal-workbench:latest -f ./backend/multimodal-workbench/Dockerfile ./backend/
    
    log_info "构建智能中枢镜像..."
    docker build -t smartfa/intelligent-hub:latest -f ./backend/intelligent-hub/Dockerfile ./backend/
    
    log_info "构建多智能体集群镜像..."
    docker build -t smartfa/multi-agent-cluster:latest -f ./backend/multi-agent-cluster/Dockerfile ./backend/
    
    # 构建AI服务镜像
    log_info "构建图像分析服务镜像..."
    docker build -t smartfa/image-analysis:latest ./ai-services/image-analysis/
    
    log_info "构建文档分析服务镜像..."
    docker build -t smartfa/document-analysis:latest ./ai-services/document-analysis/
    
    log_info "构建LLM服务镜像..."
    docker build -t smartfa/llm-service:latest ./ai-services/llm-service/
    
    log_success "镜像构建完成"
}

# 启动基础设施服务
start_infrastructure() {
    log_info "启动基础设施服务..."
    
    # 启动数据库和缓存服务
    docker-compose up -d postgresql redis mongodb influxdb
    
    # 等待数据库启动
    log_info "等待数据库服务启动..."
    sleep 30
    
    # 启动消息队列和对象存储
    docker-compose up -d zookeeper kafka minio
    
    # 等待Kafka启动
    log_info "等待Kafka服务启动..."
    sleep 20
    
    # 启动监控服务
    docker-compose up -d prometheus grafana alertmanager
    
    log_success "基础设施服务启动完成"
}

# 初始化数据库
init_database() {
    log_info "初始化数据库..."
    
    # 等待PostgreSQL启动
    until docker-compose exec postgresql pg_isready -U smartfa; do
        log_info "等待PostgreSQL启动..."
        sleep 5
    done
    
    # 创建数据库和表
    docker-compose exec postgresql psql -U smartfa -d smartfa -c "
        CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";
        CREATE EXTENSION IF NOT EXISTS \"pg_stat_statements\";
    "
    
    log_success "数据库初始化完成"
}

# 启动应用服务
start_applications() {
    log_info "启动应用服务..."
    
    # 启动后端服务
    docker-compose up -d multimodal-workbench intelligent-hub multi-agent-cluster
    
    # 等待后端服务启动
    log_info "等待后端服务启动..."
    sleep 60
    
    # 启动AI服务
    docker-compose up -d image-analysis document-analysis llm-service
    
    # 等待AI服务启动
    log_info "等待AI服务启动..."
    sleep 45
    
    # 启动前端服务
    docker-compose up -d frontend nginx
    
    log_success "应用服务启动完成"
}

# 健康检查
health_check() {
    log_info "执行健康检查..."
    
    # 检查前端服务
    if curl -f http://localhost/ > /dev/null 2>&1; then
        log_success "前端服务健康"
    else
        log_error "前端服务异常"
    fi
    
    # 检查后端服务
    services=(
        "multimodal-workbench:8080"
        "intelligent-hub:8081"
        "multi-agent-cluster:8082"
    )
    
    for service in "${services[@]}"; do
        IFS=':' read -r name port <<< "$service"
        if curl -f http://localhost:$port/actuator/health > /dev/null 2>&1; then
            log_success "$name 服务健康"
        else
            log_error "$name 服务异常"
        fi
    done
    
    # 检查AI服务
    ai_services=(
        "image-analysis:8001"
        "document-analysis:8002"
        "llm-service:8003"
    )
    
    for service in "${ai_services[@]}"; do
        IFS=':' read -r name port <<< "$service"
        if curl -f http://localhost:$port/health > /dev/null 2>&1; then
            log_success "$name 服务健康"
        else
            log_error "$name 服务异常"
        fi
    done
}

# 显示访问信息
show_access_info() {
    log_success "🎉 SmartFA 平台启动完成！"
    echo ""
    echo "=== 访问地址 ==="
    echo -e "${GREEN}前端应用:${NC}        http://localhost"
    echo -e "${GREEN}API文档:${NC}          http://localhost/api/doc.html"
    echo -e "${GREEN}MinIO控制台:${NC}      http://localhost:9001 (smartfa/minio123)"
    echo -e "${GREEN}Grafana监控:${NC}      http://localhost:3001 (admin/admin)"
    echo -e "${GREEN}Prometheus:${NC}       http://localhost:9090"
    echo ""
    echo "=== 服务端口 ==="
    echo "多模态工作台:     8080"
    echo "智能中枢:         8081"
    echo "多智能体集群:     8082"
    echo "图像分析服务:     8001"
    echo "文档分析服务:     8002"
    echo "LLM服务:          8003"
    echo ""
    echo "=== 管理命令 ==="
    echo "查看日志:         docker-compose logs -f [service-name]"
    echo "停止服务:         docker-compose down"
    echo "重启服务:         docker-compose restart [service-name]"
    echo "查看状态:         docker-compose ps"
    echo ""
}

# 主函数
main() {
    echo "========================================"
    echo "  失效分析智能辅助平台 (SmartFA)"
    echo "  完整启动脚本 v1.0.0"
    echo "========================================"
    echo ""
    
    # 检查是否在项目根目录
    if [ ! -f "docker-compose.yml" ]; then
        log_error "请在项目根目录运行此脚本"
        exit 1
    fi
    
    # 解析命令行参数
    case "${1:-full}" in
        "deps")
            check_dependencies
            ;;
        "dirs")
            create_directories
            ;;
        "configs")
            generate_configs
            ;;
        "build")
            build_images
            ;;
        "infra")
            start_infrastructure
            init_database
            ;;
        "apps")
            start_applications
            ;;
        "health")
            health_check
            ;;
        "full")
            check_dependencies
            create_directories
            generate_configs
            build_images
            start_infrastructure
            init_database
            start_applications
            health_check
            show_access_info
            ;;
        "stop")
            log_info "停止所有服务..."
            docker-compose down
            log_success "所有服务已停止"
            ;;
        "restart")
            log_info "重启所有服务..."
            docker-compose down
            sleep 5
            main full
            ;;
        "clean")
            log_warning "这将删除所有容器、镜像和数据卷！"
            read -p "确认继续？(y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                docker-compose down -v --rmi all
                docker system prune -f
                log_success "清理完成"
            fi
            ;;
        *)
            echo "用法: $0 {deps|dirs|configs|build|infra|apps|health|full|stop|restart|clean}"
            echo ""
            echo "  deps     - 检查系统依赖"
            echo "  dirs     - 创建必要目录"
            echo "  configs  - 生成配置文件"
            echo "  build    - 构建Docker镜像"
            echo "  infra    - 启动基础设施服务"
            echo "  apps     - 启动应用服务"
            echo "  health   - 健康检查"
            echo "  full     - 完整启动（默认）"
            echo "  stop     - 停止所有服务"
            echo "  restart  - 重启所有服务"
            echo "  clean    - 清理所有数据"
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"