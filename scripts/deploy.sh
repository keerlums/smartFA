#!/bin/bash

# 失效分析智能辅助平台部署脚本
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
        log_error "Docker未安装，请先安装Docker"
        exit 1
    fi
    
    # 检查Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose未安装，请先安装Docker Compose"
        exit 1
    fi
    
    # 检查Node.js (用于前端构建)
    if ! command -v node &> /dev/null; then
        log_warning "Node.js未安装，将使用Docker构建前端"
    fi
    
    # 检查Java (用于后端构建)
    if ! command -v java &> /dev/null; then
        log_warning "Java未安装，将使用Docker构建后端"
    fi
    
    log_success "系统依赖检查完成"
}

# 创建必要的目录
create_directories() {
    log_info "创建必要的目录..."
    
    mkdir -p logs
    mkdir -p data/{postgresql,mongodb,redis,influxdb,minio,milvus}
    mkdir -p config/{nginx,ssl}
    
    log_success "目录创建完成"
}

# 构建前端
build_frontend() {
    log_info "构建前端应用..."
    
    if command -v node &> /dev/null; then
        cd frontend
        npm install
        npm run build
        cd ..
        log_success "前端构建完成"
    else
        log_warning "使用Docker构建前端..."
        docker build -t smartfa-frontend:latest ./frontend
        log_success "前端Docker镜像构建完成"
    fi
}

# 构建后端
build_backend() {
    log_info "构建后端服务..."
    
    # 构建多模态工作台
    if command -v java &> /dev/null && command -v mvn &> /dev/null; then
        cd backend
        mvn clean package -DskipTests
        cd ..
        log_success "后端构建完成"
    else
        log_warning "使用Docker构建后端..."
        docker build -t smartfa-multimodal-workbench:latest ./backend/multimodal-workbench
        docker build -t smartfa-intelligent-hub:latest ./backend/intelligent-hub
        docker build -t smartfa-multi-agent-cluster:latest ./backend/multi-agent-cluster
        log_success "后端Docker镜像构建完成"
    fi
}

# 启动服务
start_services() {
    log_info "启动服务..."
    
    # 拉取必要的镜像
    docker-compose pull
    
    # 启动基础服务
    log_info "启动基础服务..."
    docker-compose up -d postgresql mongodb redis influxdb minio zookeeper kafka etcd minio-milvus milvus
    
    # 等待基础服务启动
    log_info "等待基础服务启动..."
    sleep 30
    
    # 启动应用服务
    log_info "启动应用服务..."
    docker-compose up -d multimodal-workbench intelligent-hub multi-agent-cluster
    
    # 等待应用服务启动
    log_info "等待应用服务启动..."
    sleep 20
    
    # 启动前端和代理
    log_info "启动前端服务..."
    docker-compose up -d frontend nginx
    
    log_success "所有服务启动完成"
}

# 检查服务状态
check_services() {
    log_info "检查服务状态..."
    
    services=(
        "postgresql:5432"
        "mongodb:27017"
        "redis:6379"
        "influxdb:8086"
        "minio:9000"
        "kafka:9092"
        "milvus:19530"
        "multimodal-workbench:8081"
        "intelligent-hub:8082"
        "multi-agent-cluster:8083"
        "frontend:3000"
        "nginx:80"
    )
    
    for service in "${services[@]}"; do
        name=$(echo $service | cut -d':' -f1)
        port=$(echo $service | cut -d':' -f2)
        
        if nc -z localhost $port 2>/dev/null; then
            log_success "$name 服务运行正常 (端口: $port)"
        else
            log_error "$name 服务异常 (端口: $port)"
        fi
    done
}

# 初始化数据
init_data() {
    log_info "初始化数据..."
    
    # 等待数据库启动
    sleep 10
    
    # 创建MinIO存储桶
    log_info "创建MinIO存储桶..."
    docker exec smartfa-minio mc alias set myminio http://localhost:9000 smartfa smartfa123
    docker exec smartfa-minio mc mb myminio/smartfa-uploads
    docker exec smartfa-minio mc mb myminio/smartfa-results
    docker exec smartfa-minio mc mb myminio/smartfa-models
    
    log_success "数据初始化完成"
}

# 显示访问信息
show_access_info() {
    log_success "=== 部署完成 ==="
    echo
    echo "应用访问地址:"
    echo "  前端应用: http://localhost"
    echo "  API文档: http://localhost/api/doc.html"
    echo
    echo "管理工具:"
    echo "  MinIO控制台: http://localhost:9001 (smartfa/smartfa123)"
    echo "  InfluxDB: http://localhost:8086"
    echo "  Milvus管理: http://localhost:9091"
    echo
    echo "服务端口:"
    echo "  多模态工作台: 8081"
    echo "  智能中枢: 8082"
    echo "  多智能体集群: 8083"
    echo
    echo "数据库连接:"
    echo "  PostgreSQL: localhost:5432 (smartfa/smartfa123)"
    echo "  MongoDB: localhost:27017 (smartfa/smartfa123)"
    echo "  Redis: localhost:6379 (密码: smartfa123)"
    echo
}

# 清理函数
cleanup() {
    log_warning "清理资源..."
    docker-compose down -v
    docker system prune -f
    log_success "清理完成"
}

# 主函数
main() {
    case "$1" in
        "init")
            check_dependencies
            create_directories
            ;;
        "build")
            build_frontend
            build_backend
            ;;
        "deploy")
            check_dependencies
            create_directories
            build_frontend
            build_backend
            start_services
            sleep 60
            init_data
            check_services
            show_access_info
            ;;
        "start")
            start_services
            check_services
            ;;
        "stop")
            docker-compose down
            log_success "服务已停止"
            ;;
        "restart")
            docker-compose restart
            log_success "服务已重启"
            check_services
            ;;
        "status")
            docker-compose ps
            check_services
            ;;
        "logs")
            docker-compose logs -f
            ;;
        "cleanup")
            cleanup
            ;;
        "help"|*)
            echo "用法: $0 {init|build|deploy|start|stop|restart|status|logs|cleanup|help}"
            echo
            echo "命令说明:"
            echo "  init     - 初始化环境和目录"
            echo "  build    - 构建前后端应用"
            echo "  deploy   - 完整部署（推荐）"
            echo "  start    - 启动服务"
            echo "  stop     - 停止服务"
            echo "  restart  - 重启服务"
            echo "  status   - 查看服务状态"
            echo "  logs     - 查看服务日志"
            echo "  cleanup  - 清理所有资源"
            echo "  help     - 显示帮助信息"
            echo
            ;;
    esac
}

# 执行主函数
main "$@"