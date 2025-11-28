#!/bin/bash

# 失效分析智能辅助平台 - 测试脚本
# 作者: SmartFA Team
# 版本: 1.0.0

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# 测试配置
BASE_URL="http://localhost"
API_BASE_URL="http://localhost/api"
TEST_RESULTS_DIR="test-results"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_FILE="$TEST_RESULTS_DIR/test_report_$TIMESTAMP.html"

# 创建测试结果目录
mkdir -p "$TEST_RESULTS_DIR"

# 初始化测试报告
init_report() {
    cat > "$REPORT_FILE" << 'EOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SmartFA 测试报告</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .content {
            padding: 30px;
        }
        .test-section {
            margin-bottom: 30px;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            overflow: hidden;
        }
        .test-section-header {
            background: #f8f9fa;
            padding: 15px 20px;
            border-bottom: 1px solid #e0e0e0;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .test-section-content {
            padding: 20px;
        }
        .test-case {
            margin-bottom: 15px;
            padding: 10px;
            border-left: 4px solid #ddd;
            background: #fafafa;
        }
        .test-case.pass {
            border-left-color: #28a745;
        }
        .test-case.fail {
            border-left-color: #dc3545;
        }
        .test-case.warning {
            border-left-color: #ffc107;
        }
        .status-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            color: white;
        }
        .status-badge.pass {
            background: #28a745;
        }
        .status-badge.fail {
            background: #dc3545;
        }
        .status-badge.warning {
            background: #ffc107;
            color: #212529;
        }
        .summary {
            background: #e9ecef;
            padding: 20px;
            border-radius: 6px;
            margin-bottom: 30px;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }
        .summary-item {
            text-align: center;
        }
        .summary-number {
            font-size: 2em;
            font-weight: bold;
            color: #495057;
        }
        .summary-label {
            color: #6c757d;
            margin-top: 5px;
        }
        pre {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 4px;
            padding: 15px;
            overflow-x: auto;
            font-size: 14px;
        }
        .response-time {
            color: #6c757d;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>SmartFA 平台测试报告</h1>
            <p>失效分析智能辅助平台 - 自动化测试结果</p>
            <p id="test-time"></p>
        </div>
        <div class="content">
EOF
}

# 添加测试结果到报告
add_test_result() {
    local section="$1"
    local test_name="$2"
    local status="$3"
    local details="$4"
    local response_time="$5"
    
    cat >> "$REPORT_FILE" << EOF
            <div class="test-section">
                <div class="test-section-header">
                    <span>$section</span>
                    <span class="status-badge $status">$status</span>
                </div>
                <div class="test-section-content">
                    <div class="test-case $status">
                        <strong>$test_name</strong>
                        <span class="response-time">($response_time ms)</span>
                        $details
                    </div>
                </div>
            </div>
EOF
}

# 完成测试报告
finalize_report() {
    local total_tests="$1"
    local passed_tests="$2"
    local failed_tests="$3"
    local warning_tests="$4"
    
    cat >> "$REPORT_FILE" << EOF
            <div class="summary">
                <h3>测试总结</h3>
                <div class="summary-grid">
                    <div class="summary-item">
                        <div class="summary-number">$total_tests</div>
                        <div class="summary-label">总测试数</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-number" style="color: #28a745;">$passed_tests</div>
                        <div class="summary-label">通过</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-number" style="color: #dc3545;">$failed_tests</div>
                        <div class="summary-label">失败</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-number" style="color: #ffc107;">$warning_tests</div>
                        <div class="summary-label">警告</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <script>
        document.getElementById('test-time').textContent = '测试时间: $(date)';
    </script>
</body>
</html>
EOF
}

# HTTP请求函数
make_request() {
    local method="$1"
    local url="$2"
    local data="$3"
    local expected_status="$4"
    
    local start_time=$(date +%s%3N)
    local response
    local status_code
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" "$url")
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST -H "Content-Type: application/json" -d "$data" "$url")
    elif [ "$method" = "PUT" ]; then
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X PUT -H "Content-Type: application/json" -d "$data" "$url")
    elif [ "$method" = "DELETE" ]; then
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X DELETE "$url")
    fi
    
    local end_time=$(date +%s%3N)
    local response_time=$((end_time - start_time))
    
    status_code=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    local body=$(echo "$response" | sed -E 's/HTTPSTATUS\:[0-9]{3}$//')
    
    echo "$status_code|$response_time|$body"
}

# 测试前端服务
test_frontend() {
    log_info "测试前端服务..."
    
    local response=$(make_request "GET" "$BASE_URL" "" "200")
    local status_code=$(echo "$response" | cut -d'|' -f1)
    local response_time=$(echo "$response" | cut -d'|' -f2)
    
    if [ "$status_code" = "200" ]; then
        add_test_result "前端服务" "主页访问" "pass" "前端服务正常运行" "$response_time"
        ((passed_tests++))
    else
        add_test_result "前端服务" "主页访问" "fail" "HTTP状态码: $status_code" "$response_time"
        ((failed_tests++))
    fi
    ((total_tests++))
}

# 测试API网关
test_api_gateway() {
    log_info "测试API网关..."
    
    # 测试健康检查
    local response=$(make_request "GET" "$API_BASE_URL/actuator/health" "" "200")
    local status_code=$(echo "$response" | cut -d'|' -f1)
    local response_time=$(echo "$response" | cut -d'|' -f2)
    
    if [ "$status_code" = "200" ]; then
        add_test_result "API网关" "健康检查" "pass" "API网关健康状态正常" "$response_time"
        ((passed_tests++))
    else
        add_test_result "API网关" "健康检查" "fail" "HTTP状态码: $status_code" "$response_time"
        ((failed_tests++))
    fi
    ((total_tests++))
}

# 测试多模态工作台
test_multimodal_workbench() {
    log_info "测试多模态工作台..."
    
    # 测试服务健康
    local response=$(make_request "GET" "$API_BASE_URL/workbench/health" "" "200")
    local status_code=$(echo "$response" | cut -d'|' -f1)
    local response_time=$(echo "$response" | cut -d'|' -f2)
    
    if [ "$status_code" = "200" ]; then
        add_test_result "多模态工作台" "服务健康检查" "pass" "服务运行正常" "$response_time"
        ((passed_tests++))
    else
        add_test_result "多模态工作台" "服务健康检查" "fail" "HTTP状态码: $status_code" "$response_time"
        ((failed_tests++))
    fi
    ((total_tests++))
    
    # 测试文件上传API
    local test_data='{"filename":"test.jpg","size":1024,"type":"image/jpeg"}'
    response=$(make_request "POST" "$API_BASE_URL/workbench/files/upload" "$test_data" "200")
    status_code=$(echo "$response" | cut -d'|' -f1)
    response_time=$(echo "$response" | cut -d'|' -f2)
    
    if [ "$status_code" = "200" ] || [ "$status_code" = "400" ]; then
        add_test_result "多模态工作台" "文件上传API" "pass" "API响应正常" "$response_time"
        ((passed_tests++))
    else
        add_test_result "多模态工作台" "文件上传API" "fail" "HTTP状态码: $status_code" "$response_time"
        ((failed_tests++))
    fi
    ((total_tests++))
}

# 测试智能中枢
test_intelligent_hub() {
    log_info "测试智能中枢..."
    
    # 测试任务创建
    local test_data='{"name":"测试任务","description":"自动化测试任务","type":"IMAGE_ANALYSIS","priority":1}'
    local response=$(make_request "POST" "$API_BASE_URL/tasks" "$test_data" "201")
    local status_code=$(echo "$response" | cut -d'|' -f1)
    local response_time=$(echo "$response" | cut -d'|' -f2)
    
    if [ "$status_code" = "201" ] || [ "$status_code" = "200" ]; then
        add_test_result "智能中枢" "任务创建" "pass" "任务创建成功" "$response_time"
        ((passed_tests++))
    else
        add_test_result "智能中枢" "任务创建" "fail" "HTTP状态码: $status_code" "$response_time"
        ((failed_tests++))
    fi
    ((total_tests++))
    
    # 测试任务查询
    response=$(make_request "GET" "$API_BASE_URL/tasks" "" "200")
    status_code=$(echo "$response" | cut -d'|' -f1)
    response_time=$(echo "$response" | cut -d'|' -f2)
    
    if [ "$status_code" = "200" ]; then
        add_test_result "智能中枢" "任务查询" "pass" "任务查询成功" "$response_time"
        ((passed_tests++))
    else
        add_test_result "智能中枢" "任务查询" "fail" "HTTP状态码: $status_code" "$response_time"
        ((failed_tests++))
    fi
    ((total_tests++))
}

# 测试多智能体集群
test_multi_agent_cluster() {
    log_info "测试多智能体集群..."
    
    # 测试智能体查询
    local response=$(make_request "GET" "$API_BASE_URL/agents" "" "200")
    local status_code=$(echo "$response" | cut -d'|' -f1)
    local response_time=$(echo "$response" | cut -d'|' -f2)
    
    if [ "$status_code" = "200" ]; then
        add_test_result "多智能体集群" "智能体查询" "pass" "智能体查询成功" "$response_time"
        ((passed_tests++))
    else
        add_test_result "多智能体集群" "智能体查询" "fail" "HTTP状态码: $status_code" "$response_time"
        ((failed_tests++))
    fi
    ((total_tests++))
    
    # 测试智能体统计
    response=$(make_request "GET" "$API_BASE_URL/agents/statistics" "" "200")
    status_code=$(echo "$response" | cut -d'|' -f1)
    response_time=$(echo "$response" | cut -d'|' -f2)
    
    if [ "$status_code" = "200" ]; then
        add_test_result "多智能体集群" "智能体统计" "pass" "统计数据获取成功" "$response_time"
        ((passed_tests++))
    else
        add_test_result "多智能体集群" "智能体统计" "fail" "HTTP状态码: $status_code" "$response_time"
        ((failed_tests++))
    fi
    ((total_tests++))
}

# 测试AI服务
test_ai_services() {
    log_info "测试AI服务..."
    
    # 测试图像分析服务
    local response=$(make_request "GET" "http://localhost:8001/health" "" "200")
    local status_code=$(echo "$response" | cut -d'|' -f1)
    local response_time=$(echo "$response" | cut -d'|' -f2)
    
    if [ "$status_code" = "200" ]; then
        add_test_result "AI服务" "图像分析服务" "pass" "服务健康" "$response_time"
        ((passed_tests++))
    else
        add_test_result "AI服务" "图像分析服务" "fail" "HTTP状态码: $status_code" "$response_time"
        ((failed_tests++))
    fi
    ((total_tests++))
    
    # 测试文档分析服务
    response=$(make_request "GET" "http://localhost:8002/health" "" "200")
    status_code=$(echo "$response" | cut -d'|' -f1)
    response_time=$(echo "$response" | cut -d'|' -f2)
    
    if [ "$status_code" = "200" ]; then
        add_test_result "AI服务" "文档分析服务" "pass" "服务健康" "$response_time"
        ((passed_tests++))
    else
        add_test_result "AI服务" "文档分析服务" "fail" "HTTP状态码: $status_code" "$response_time"
        ((failed_tests++))
    fi
    ((total_tests++))
    
    # 测试LLM服务
    response=$(make_request "GET" "http://localhost:8003/health" "" "200")
    status_code=$(echo "$response" | cut -d'|' -f1)
    response_time=$(echo "$response" | cut -d'|' -f2)
    
    if [ "$status_code" = "200" ]; then
        add_test_result "AI服务" "LLM服务" "pass" "服务健康" "$response_time"
        ((passed_tests++))
    else
        add_test_result "AI服务" "LLM服务" "fail" "HTTP状态码: $status_code" "$response_time"
        ((failed_tests++))
    fi
    ((total_tests++))
}

# 测试基础设施服务
test_infrastructure() {
    log_info "测试基础设施服务..."
    
    # 测试MinIO
    local response=$(make_request "GET" "http://localhost:9000/minio/health/live" "" "200")
    local status_code=$(echo "$response" | cut -d'|' -f1)
    local response_time=$(echo "$response" | cut -d'|' -f2)
    
    if [ "$status_code" = "200" ]; then
        add_test_result "基础设施" "MinIO对象存储" "pass" "MinIO服务健康" "$response_time"
        ((passed_tests++))
    else
        add_test_result "基础设施" "MinIO对象存储" "warning" "MinIO可能未启动或配置不同" "$response_time"
        ((warning_tests++))
    fi
    ((total_tests++))
    
    # 测试Prometheus
    response=$(make_request "GET" "http://localhost:9090/-/healthy" "" "200")
    status_code=$(echo "$response" | cut -d'|' -f1)
    response_time=$(echo "$response" | cut -d'|' -f2)
    
    if [ "$status_code" = "200" ]; then
        add_test_result "基础设施" "Prometheus监控" "pass" "Prometheus服务健康" "$response_time"
        ((passed_tests++))
    else
        add_test_result "基础设施" "Prometheus监控" "warning" "Prometheus可能未启动" "$response_time"
        ((warning_tests++))
    fi
    ((total_tests++))
    
    # 测试Grafana
    response=$(make_request "GET" "http://localhost:3001/api/health" "" "200")
    status_code=$(echo "$response" | cut -d'|' -f1)
    response_time=$(echo "$response" | cut -d'|' -f2)
    
    if [ "$status_code" = "200" ]; then
        add_test_result "基础设施" "Grafana可视化" "pass" "Grafana服务健康" "$response_time"
        ((passed_tests++))
    else
        add_test_result "基础设施" "Grafana可视化" "warning" "Grafana可能未启动" "$response_time"
        ((warning_tests++))
    fi
    ((total_tests++))
}

# 性能测试
test_performance() {
    log_info "执行性能测试..."
    
    # 测试API响应时间
    local total_time=0
    local iterations=5
    
    for i in $(seq 1 $iterations); do
        local response=$(make_request "GET" "$API_BASE_URL/actuator/health" "" "200")
        local response_time=$(echo "$response" | cut -d'|' -f2)
        total_time=$((total_time + response_time))
    done
    
    local avg_time=$((total_time / iterations))
    
    if [ $avg_time -lt 500 ]; then
        add_test_result "性能测试" "API响应时间" "pass" "平均响应时间: ${avg_time}ms" "$avg_time"
        ((passed_tests++))
    elif [ $avg_time -lt 1000 ]; then
        add_test_result "性能测试" "API响应时间" "warning" "平均响应时间: ${avg_time}ms (建议优化)" "$avg_time"
        ((warning_tests++))
    else
        add_test_result "性能测试" "API响应时间" "fail" "平均响应时间: ${avg_time}ms (过慢)" "$avg_time"
        ((failed_tests++))
    fi
    ((total_tests++))
}

# 主测试函数
run_tests() {
    echo "========================================"
    echo "  SmartFA 平台自动化测试"
    echo "  测试时间: $(date)"
    echo "========================================"
    echo ""
    
    # 初始化计数器
    total_tests=0
    passed_tests=0
    failed_tests=0
    warning_tests=0
    
    # 初始化报告
    init_report
    
    # 执行测试
    test_frontend
    test_api_gateway
    test_multimodal_workbench
    test_intelligent_hub
    test_multi_agent_cluster
    test_ai_services
    test_infrastructure
    test_performance
    
    # 完成报告
    finalize_report "$total_tests" "$passed_tests" "$failed_tests" "$warning_tests"
    
    # 显示结果
    echo ""
    echo "========================================"
    echo "  测试完成"
    echo "========================================"
    echo "总测试数: $total_tests"
    echo -e "通过: ${GREEN}$passed_tests${NC}"
    echo -e "失败: ${RED}$failed_tests${NC}"
    echo -e "警告: ${YELLOW}$warning_tests${NC}"
    echo ""
    echo "详细报告: $REPORT_FILE"
    echo ""
    
    # 在浏览器中打开报告
    if command -v open &> /dev/null; then
        open "$REPORT_FILE"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "$REPORT_FILE"
    fi
    
    # 返回适当的退出码
    if [ $failed_tests -gt 0 ]; then
        exit 1
    elif [ $warning_tests -gt 0 ]; then
        exit 2
    else
        exit 0
    fi
}

# 解析命令行参数
case "${1:-all}" in
    "frontend")
        init_report
        test_frontend
        finalize_report 1 $passed_tests $failed_tests $warning_tests
        ;;
    "backend")
        init_report
        test_api_gateway
        test_multimodal_workbench
        test_intelligent_hub
        test_multi_agent_cluster
        finalize_report 4 $passed_tests $failed_tests $warning_tests
        ;;
    "ai")
        init_report
        test_ai_services
        finalize_report 3 $passed_tests $failed_tests $warning_tests
        ;;
    "infra")
        init_report
        test_infrastructure
        finalize_report 3 $passed_tests $failed_tests $warning_tests
        ;;
    "perf")
        init_report
        test_performance
        finalize_report 1 $passed_tests $failed_tests $warning_tests
        ;;
    "all")
        run_tests
        ;;
    *)
        echo "用法: $0 {frontend|backend|ai|infra|perf|all}"
        echo ""
        echo "  frontend - 测试前端服务"
        echo "  backend   - 测试后端服务"
        echo "  ai        - 测试AI服务"
        echo "  infra     - 测试基础设施"
        echo "  perf      - 性能测试"
        echo "  all       - 完整测试（默认）"
        exit 1
        ;;
esac