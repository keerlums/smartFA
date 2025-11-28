#!/bin/bash

# 健康检查脚本
# 检查所有服务的健康状态

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 服务列表
SERVICES=(
    "frontend:3000"
    "multimodal-workbench:8081"
    "intelligent-hub:8082"
    "multi-agent-cluster:8083"
    "image-analysis:8001"
    "document-analysis:8002"
    "llm-service:8003"
)

# 数据库服务
DATABASES=(
    "postgresql:5432"
    "mongodb:27017"
    "redis:6379"
    "minio:9000"
)

# 辅助函数
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

# 检查HTTP服务
check_http_service() {
    local service_name=$1
    local port=$2
    local url="http://localhost:${port}"
    
    log_info "Checking ${service_name} on port ${port}..."
    
    if curl -s -f "${url}/actuator/health" > /dev/null 2>&1; then
        log_success "${service_name} is healthy"
        return 0
    elif curl -s -f "${url}" > /dev/null 2>&1; then
        log_success "${service_name} is responding"
        return 0
    else
        log_error "${service_name} is not responding"
        return 1
    fi
}

# 检查数据库服务
check_database_service() {
    local service_name=$1
    local port=$2
    
    log_info "Checking ${service_name} on port ${port}..."
    
    if nc -z localhost ${port} 2>/dev/null; then
        log_success "${service_name} is accessible"
        return 0
    else
        log_error "${service_name} is not accessible"
        return 1
    fi
}

# 检查Docker容器状态
check_docker_containers() {
    log_info "Checking Docker containers..."
    
    local containers=(
        "smartfa-frontend"
        "smartfa-multimodal-workbench"
        "smartfa-intelligent-hub"
        "smartfa-multi-agent-cluster"
        "smartfa-postgresql"
        "smartfa-mongodb"
        "smartfa-redis"
        "smartfa-minio"
    )
    
    local all_running=true
    
    for container in "${containers[@]}"; do
        if docker ps --format "table {{.Names}}" | grep -q "^${container}$"; then
            log_success "${container} is running"
        else
            log_error "${container} is not running"
            all_running=false
        fi
    done
    
    return $([[ "$all_running" == true ]] && echo 0 || echo 1)
}

# 检查系统资源
check_system_resources() {
    log_info "Checking system resources..."
    
    # 检查内存使用
    local memory_usage=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
    if (( $(echo "$memory_usage > 80" | bc -l) )); then
        log_warning "High memory usage: ${memory_usage}%"
    else
        log_success "Memory usage: ${memory_usage}%"
    fi
    
    # 检查磁盘使用
    local disk_usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$disk_usage" -gt 80 ]; then
        log_warning "High disk usage: ${disk_usage}%"
    else
        log_success "Disk usage: ${disk_usage}%"
    fi
    
    # 检查CPU负载
    local load_avg=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
    log_info "CPU load average: ${load_avg}"
}

# 检查日志错误
check_logs_for_errors() {
    log_info "Checking for recent errors in logs..."
    
    local error_count=0
    
    # 检查Docker容器日志
    for container in $(docker ps --format "{{.Names}}"); do
        if docker logs --tail=50 "${container}" 2>&1 | grep -i "error\|exception\|failed" | grep -v "health check" > /dev/null; then
            log_warning "Found errors in ${container} logs"
            error_count=$((error_count + 1))
        fi
    done
    
    if [ $error_count -eq 0 ]; then
        log_success "No recent errors found in logs"
    fi
}

# 生成健康报告
generate_health_report() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local report_file="health-report-$(date '+%Y%m%d-%H%M%S').txt"
    
    log_info "Generating health report: ${report_file}"
    
    {
        echo "SmartFA Health Report"
        echo "====================="
        echo "Generated: ${timestamp}"
        echo ""
        
        echo "=== Service Status ==="
        for service in "${SERVICES[@]}"; do
            IFS=':' read -r name port <<< "$service"
            if check_http_service "${name}" "${port}" > /dev/null 2>&1; then
                echo "${name}: HEALTHY"
            else
                echo "${name}: UNHEALTHY"
            fi
        done
        
        echo ""
        echo "=== Database Status ==="
        for db in "${DATABASES[@]}"; do
            IFS=':' read -r name port <<< "$db"
            if check_database_service "${name}" "${port}" > /dev/null 2>&1; then
                echo "${name}: ACCESSIBLE"
            else
                echo "${name}: INACCESSIBLE"
            fi
        done
        
        echo ""
        echo "=== System Resources ==="
        echo "Memory Usage: $(free | grep Mem | awk '{printf "%.1f%%", $3/$2 * 100.0}')"
        echo "Disk Usage: $(df / | awk 'NR==2 {print $5}')"
        echo "CPU Load: $(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')"
        
        echo ""
        echo "=== Docker Containers ==="
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        
    } > "${report_file}"
    
    log_success "Health report saved to: ${report_file}"
}

# 主函数
main() {
    echo "======================================"
    echo "SmartFA Health Check"
    echo "======================================"
    echo ""
    
    local exit_code=0
    
    # 检查Docker是否运行
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running"
        exit 1
    fi
    
    log_success "Docker is running"
    
    # 检查服务
    echo ""
    log_info "=== Checking Application Services ==="
    for service in "${SERVICES[@]}"; do
        IFS=':' read -r name port <<< "$service"
        if ! check_http_service "${name}" "${port}"; then
            exit_code=1
        fi
    done
    
    # 检查数据库
    echo ""
    log_info "=== Checking Database Services ==="
    for db in "${DATABASES[@]}"; do
        IFS=':' read -r name port <<< "$db"
        if ! check_database_service "${name}" "${port}"; then
            exit_code=1
        fi
    done
    
    # 检查Docker容器
    echo ""
    if ! check_docker_containers; then
        exit_code=1
    fi
    
    # 检查系统资源
    echo ""
    check_system_resources
    
    # 检查日志
    echo ""
    check_logs_for_errors
    
    # 生成报告
    echo ""
    generate_health_report
    
    echo ""
    echo "======================================"
    if [ $exit_code -eq 0 ]; then
        log_success "All health checks passed!"
    else
        log_error "Some health checks failed!"
    fi
    echo "======================================"
    
    exit $exit_code
}

# 显示帮助信息
show_help() {
    echo "SmartFA Health Check Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -q, --quiet    Run in quiet mode (minimal output)"
    echo "  -r, --report   Generate health report only"
    echo ""
    echo "Examples:"
    echo "  $0              # Run full health check"
    echo "  $0 --quiet      # Run in quiet mode"
    echo "  $0 --report     # Generate report only"
}

# 解析命令行参数
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    -q|--quiet)
        # 静默模式，只输出错误
        exec 1>/dev/null
        main
        ;;
    -r|--report)
        generate_health_report
        exit 0
        ;;
    "")
        main
        ;;
    *)
        echo "Unknown option: $1"
        show_help
        exit 1
        ;;
esac