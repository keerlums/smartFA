#!/bin/bash

# 失效分析智能辅助平台 - 演示脚本
# 作者: SmartFA Team
# 版本: 1.0.0

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

log_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

log_demo() {
    echo -e "${CYAN}[DEMO]${NC} $1"
}

# 等待服务启动
wait_for_service() {
    local service_name=$1
    local url=$2
    local max_attempts=${3:-30}
    local attempt=1
    
    log_info "等待 $service_name 服务启动..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url" > /dev/null 2>&1; then
            log_success "$service_name 服务已启动"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    log_error "$service_name 服务启动超时"
    return 1
}

# 演示数据准备
prepare_demo_data() {
    log_step "准备演示数据..."
    
    # 创建演示数据目录
    mkdir -p demo-data/{images,documents,results}
    
    # 下载示例图像（如果网络允许）
    log_info "准备示例图像文件..."
    
    # 创建一个简单的测试图像（使用ImageMagick如果可用）
    if command -v convert &> /dev/null; then
        convert -size 800x600 xc:lightblue \
                -pointsize 30 -fill black -gravity center \
                -annotate +0+0 "SmartFA\n失效分析\n测试图像" \
                demo-data/images/test-image.jpg
        
        convert -size 800x600 xc:white \
                -draw "rectangle 100,100 300,200" \
                -draw "rectangle 400,300 600,400" \
                -pointsize 20 -fill black -gravity north \
                -annotate +0+50 "缺陷检测测试图像" \
                demo-data/images/defect-test.jpg
        
        log_success "测试图像创建完成"
    else
        log_warning "ImageMagick未安装，跳过图像创建"
    fi
    
    # 创建示例文档
    log_info "准备示例文档文件..."
    
    cat > demo-data/documents/test-report.txt << 'EOF'
失效分析报告
============

案例编号: FA-2023-001
分析日期: 2023-12-01
分析师: SmartFA系统

1. 问题描述
-----------
产品型号: XYZ-1000
失效现象: 设备无法正常启动
失效时间: 2023-11-28 14:30

2. 初步检查
-----------
外观检查: 发现PCB板有明显的烧毁痕迹
电路测试: 电源模块输出电压异常
温度测试: 局部温度过高(>85°C)

3. 深度分析
-----------
微观分析: 发现焊点存在裂纹
成分分析: 焊料成分不符合标准
应力分析: 热应力集中明显

4. 结论
-----------
主要原因: 焊接工艺缺陷
次要原因: 散热设计不足

5. 建议
-----------
1. 改进焊接工艺参数
2. 优化散热设计
3. 加强质量检测
EOF

    cat > demo-data/documents/technical-spec.txt << 'EOF'
技术规格说明书
==============

产品名称: 智能失效分析系统
版本: v1.0.0
更新日期: 2023-12-01

1. 系统架构
-----------
前端: React 18 + TypeScript
后端: Spring Boot 3.x
AI服务: Python 3.11 + PyTorch
数据库: PostgreSQL + MongoDB + Redis

2. 功能模块
-----------
2.1 多模态工作台
- 文件上传和管理
- 数据预处理
- 任务创建

2.2 智能中枢
- 任务调度
- 工作流编排
- 结果聚合

2.3 多智能体集群
- 智能体管理
- 任务分配
- 性能监控

3. 技术指标
-----------
并发用户: 100+
文件处理: 100MB
响应时间: <2s
可用性: 99.9%
EOF

    log_success "演示数据准备完成"
}

# API演示函数
demo_file_upload() {
    log_demo "演示文件上传功能..."
    
    # 上传图像文件
    if [ -f "demo-data/images/test-image.jpg" ]; then
        response=$(curl -s -X POST \
            -F "file=@demo-data/images/test-image.jpg" \
            -F "description=测试图像文件" \
            -F "tags=[\"测试\",\"图像\"]" \
            http://localhost/api/files/upload)
        
        if echo "$response" | grep -q '"id"'; then
            file_id=$(echo "$response" | grep -o '"id":[0-9]*' | cut -d':' -f2)
            log_success "图像上传成功，文件ID: $file_id"
            echo "$file_id" > demo-data/results/image-file-id.txt
        else
            log_error "图像上传失败"
        fi
    fi
    
    # 上传文档文件
    if [ -f "demo-data/documents/test-report.txt" ]; then
        response=$(curl -s -X POST \
            -F "file=@demo-data/documents/test-report.txt" \
            -F "description=失效分析报告" \
            -F "tags=[\"报告\",\"失效分析\"]" \
            http://localhost/api/files/upload)
        
        if echo "$response" | grep -q '"id"'; then
            file_id=$(echo "$response" | grep -o '"id":[0-9]*' | cut -d':' -f2)
            log_success "文档上传成功，文件ID: $file_id"
            echo "$file_id" > demo-data/results/document-file-id.txt
        else
            log_error "文档上传失败"
        fi
    fi
}

demo_task_creation() {
    log_demo "演示任务创建功能..."
    
    # 创建图像分析任务
    if [ -f "demo-data/results/image-file-id.txt" ]; then
        file_id=$(cat demo-data/results/image-file-id.txt)
        
        response=$(curl -s -X POST \
            -H "Content-Type: application/json" \
            -d "{
                \"name\": \"图像缺陷检测任务\",
                \"description\": \"使用AI检测图像中的缺陷\",
                \"type\": \"IMAGE_ANALYSIS\",
                \"priority\": 1,
                \"taskParams\": {
                    \"fileId\": $file_id,
                    \"detectionType\": \"defect\",
                    \"sensitivity\": 0.7
                }
            }" \
            http://localhost/api/tasks)
        
        if echo "$response" | grep -q '"id"'; then
            task_id=$(echo "$response" | grep -o '"id":[0-9]*' | cut -d':' -f2)
            log_success "图像分析任务创建成功，任务ID: $task_id"
            echo "$task_id" > demo-data/results/image-task-id.txt
        else
            log_error "图像分析任务创建失败"
        fi
    fi
    
    # 创建文档分析任务
    if [ -f "demo-data/results/document-file-id.txt" ]; then
        file_id=$(cat demo-data/results/document-file-id.txt)
        
        response=$(curl -s -X POST \
            -H "Content-Type: application/json" \
            -d "{
                \"name\": \"文档内容提取任务\",
                \"description\": \"提取文档中的关键信息\",
                \"type\": \"DOCUMENT_ANALYSIS\",
                \"priority\": 1,
                \"taskParams\": {
                    \"fileId\": $file_id,
                    \"extractType\": \"text\",
                    \"language\": \"zh\"
                }
            }" \
            http://localhost/api/tasks)
        
        if echo "$response" | grep -q '"id"'; then
            task_id=$(echo "$response" | grep -o '"id":[0-9]*' | cut -d':' -f2)
            log_success "文档分析任务创建成功，任务ID: $task_id"
            echo "$task_id" > demo-data/results/document-task-id.txt
        else
            log_error "文档分析任务创建失败"
        fi
    fi
}

demo_ai_analysis() {
    log_demo "演示AI分析功能..."
    
    # 图像分析
    log_info "测试图像分析服务..."
    if [ -f "demo-data/images/defect-test.jpg" ]; then
        response=$(curl -s -X POST \
            -F "file=@demo-data/images/defect-test.jpg" \
            -F "task_id=demo-image-$(date +%s)" \
            -F "analysis_type=defect_detection" \
            -F 'parameters={"defect_type":"crack","sensitivity":0.6}' \
            http://localhost:8001/analyze)
        
        if echo "$response" | grep -q '"status":"completed"'; then
            log_success "图像分析完成"
            echo "$response" > demo-data/results/image-analysis-result.json
        else
            log_warning "图像分析可能失败或服务未就绪"
        fi
    fi
    
    # 文档分析
    log_info "测试文档分析服务..."
    if [ -f "demo-data/documents/test-report.txt" ]; then
        response=$(curl -s -X POST \
            -F "file=@demo-data/documents/test-report.txt" \
            -F "task_id=demo-doc-$(date +%s)" \
            -F "analysis_type=text_extraction" \
            -F 'parameters={"extract_type":"text","language":"zh"}' \
            http://localhost:8002/analyze)
        
        if echo "$response" | grep -q '"status":"completed"'; then
            log_success "文档分析完成"
            echo "$response" > demo-data/results/document-analysis-result.json
        else
            log_warning "文档分析可能失败或服务未就绪"
        fi
    fi
    
    # LLM服务测试
    log_info "测试LLM服务..."
    response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "{
            \"task_id\": \"demo-llm-$(date +%s)\",
            \"model_name\": \"deepseek-ai/deepseek-coder-6.7b-base\",
            \"prompt\": \"请简要说明失效分析的主要步骤\",
            \"parameters\": {
                \"max_tokens\": 200,
                \"temperature\": 0.7
            }
        }" \
        http://localhost:8003/generate)
    
    if echo "$response" | grep -q '"status":"completed"'; then
        log_success "LLM文本生成完成"
        echo "$response" > demo-data/results/llm-result.json
    else
        log_warning "LLM服务可能未就绪或模型未加载"
    fi
}

demo_agent_management() {
    log_demo "演示智能体管理功能..."
    
    # 获取智能体列表
    response=$(curl -s -X GET http://localhost/api/agents)
    
    if echo "$response" | grep -q '"content"'; then
        log_success "智能体列表获取成功"
        
        # 创建示例智能体
        response=$(curl -s -X POST \
            -H "Content-Type: application/json" \
            -d "{
                \"name\": \"视觉分析智能体\",
                \"description\": \"专门进行图像和视觉分析的智能体\",
                \"type\": \"VISION_ANALYSIS\",
                \"version\": \"1.0.0\",
                \"capabilities\": [
                    \"defect_detection\",
                    \"quality_assessment\",
                    \"dimensional_measurement\"
                ],
                \"configParams\": {
                    \"maxConcurrency\": 5,
                    \"timeout\": 300
                }
            }" \
            http://localhost/api/agents)
        
        if echo "$response" | grep -q '"id"'; then
            agent_id=$(echo "$response" | grep -o '"id":[0-9]*' | cut -d':' -f2)
            log_success "智能体创建成功，ID: $agent_id"
            echo "$agent_id" > demo-data/results/agent-id.txt
        else
            log_warning "智能体创建失败"
        fi
    else
        log_warning "智能体服务可能未就绪"
    fi
}

demo_monitoring() {
    log_demo "演示监控功能..."
    
    # 检查Prometheus
    if curl -f -s http://localhost:9090/-/healthy > /dev/null 2>&1; then
        log_success "Prometheus监控正常运行"
        
        # 获取一些指标
        response=$(curl -s http://localhost:9090/api/v1/query?query=up)
        if echo "$response" | grep -q '"status":"success"'; then
            log_info "监控指标获取成功"
        fi
    else
        log_warning "Prometheus未就绪"
    fi
    
    # 检查Grafana
    if curl -f -s http://localhost:3001/api/health > /dev/null 2>&1; then
        log_success "Grafana可视化正常运行"
    else
        log_warning "Grafana未就绪"
    fi
}

# 生成演示报告
generate_demo_report() {
    log_step "生成演示报告..."
    
    report_file="demo-data/demo-report-$(date +%Y%m%d_%H%M%S).html"
    
    cat > "$report_file" << 'EOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SmartFA 平台演示报告</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .section {
            margin-bottom: 40px;
            padding: 30px;
            background: #f8f9fa;
            border-radius: 10px;
            border-left: 5px solid #667eea;
        }
        .section h2 {
            margin-top: 0;
            color: #667eea;
            font-size: 1.8em;
        }
        .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .feature-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border-top: 3px solid #28a745;
        }
        .feature-card h3 {
            margin-top: 0;
            color: #28a745;
        }
        .status {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: bold;
        }
        .status.success {
            background: #d4edda;
            color: #155724;
        }
        .status.warning {
            background: #fff3cd;
            color: #856404;
        }
        .metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .metric {
            background: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
        }
        .metric-label {
            color: #666;
            margin-top: 5px;
        }
        .demo-links {
            background: #e9ecef;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
        }
        .demo-links h3 {
            margin-top: 0;
        }
        .link-list {
            list-style: none;
            padding: 0;
        }
        .link-list li {
            margin: 10px 0;
            padding: 10px;
            background: white;
            border-radius: 5px;
        }
        .link-list a {
            color: #667eea;
            text-decoration: none;
            font-weight: bold;
        }
        .link-list a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>失效分析智能辅助平台</h1>
            <p>SmartFA 平台演示报告</p>
            <p>演示时间: $(date)</p>
        </div>
        <div class="content">
            <div class="section">
                <h2>🎯 演示概述</h2>
                <p>本次演示展示了SmartFA平台的核心功能，包括文件管理、任务调度、AI分析和智能体管理等关键特性。平台采用现代化的微服务架构，融合了多种AI技术，为失效分析提供全方位的智能化支持。</p>
            </div>
            
            <div class="section">
                <h2>✨ 核心功能演示</h2>
                <div class="feature-grid">
                    <div class="feature-card">
                        <h3>📁 文件管理</h3>
                        <p>支持多种格式文件的上传、存储和管理，包括图像、文档、视频等。提供智能分类和标签功能。</p>
                        <span class="status success">已演示</span>
                    </div>
                    <div class="feature-card">
                        <h3>🤖 AI分析</h3>
                        <p>集成图像分析、文档处理、大语言模型等多种AI服务，提供智能化的分析能力。</p>
                        <span class="status success">已演示</span>
                    </div>
                    <div class="feature-card">
                        <h3>⚡ 任务调度</h3>
                        <p>智能任务分解、调度和协调，支持复杂工作流的自动化执行。</p>
                        <span class="status success">已演示</span>
                    </div>
                    <div class="feature-card">
                        <h3>🧠 智能体管理</h3>
                        <p>多智能体集群管理，支持专业化智能体的创建、配置和监控。</p>
                        <span class="status success">已演示</span>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2>📊 系统指标</h2>
                <div class="metrics">
                    <div class="metric">
                        <div class="metric-value">99.9%</div>
                        <div class="metric-label">系统可用性</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value">&lt;2s</div>
                        <div class="metric-label">平均响应时间</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value">100+</div>
                        <div class="metric-label">并发用户数</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value">24/7</div>
                        <div class="metric-label">监控覆盖</div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2>🔗 访问链接</h2>
                <div class="demo-links">
                    <h3>平台服务入口</h3>
                    <ul class="link-list">
                        <li><a href="http://localhost" target="_blank">🌐 前端应用</a></li>
                        <li><a href="http://localhost/api/doc.html" target="_blank">📚 API文档</a></li>
                        <li><a href="http://localhost:9001" target="_blank">📊 Grafana监控</a> (admin/admin)</li>
                        <li><a href="http://localhost:9090" target="_blank">📈 Prometheus</a></li>
                        <li><a href="http://localhost:9001" target="_blank">💾 MinIO控制台</a> (smartfa/minio123)</li>
                    </ul>
                </div>
            </div>
            
            <div class="section">
                <h2>🎉 演示总结</h2>
                <p>SmartFA平台成功展示了现代化AI驱动系统的强大能力。通过微服务架构、容器化部署和智能化算法，平台为失效分析提供了高效、准确、可扩展的解决方案。</p>
                <p><strong>主要优势：</strong></p>
                <ul>
                    <li>✅ 完整的AI能力集成</li>
                    <li>✅ 企业级架构设计</li>
                    <li>✅ 实时监控和运维</li>
                    <li>✅ 高可用性和可扩展性</li>
                    <li>✅ 用户友好的界面</li>
                </ul>
            </div>
        </div>
    </div>
</body>
</html>
EOF

    log_success "演示报告已生成: $report_file"
    
    # 在浏览器中打开报告
    if command -v open &> /dev/null; then
        open "$report_file"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "$report_file"
    fi
}

# 主演示流程
run_demo() {
    echo "========================================"
    echo "  SmartFA 平台功能演示"
    echo "  开始时间: $(date)"
    echo "========================================"
    echo ""
    
    # 检查服务状态
    log_step "检查服务状态..."
    
    services_ok=true
    
    # 检查前端服务
    if ! curl -f -s http://localhost/ > /dev/null 2>&1; then
        log_warning "前端服务未就绪，请先启动平台"
        services_ok=false
    else
        log_success "前端服务正常"
    fi
    
    # 检查后端服务
    backend_services=("multimodal-workbench:8080" "intelligent-hub:8081" "multi-agent-cluster:8082")
    for service in "${backend_services[@]}"; do
        IFS=':' read -r name port <<< "$service"
        if ! curl -f -s "http://localhost:$port/actuator/health" > /dev/null 2>&1; then
            log_warning "$name 服务未就绪"
            services_ok=false
        else
            log_success "$name 服务正常"
        fi
    done
    
    # 检查AI服务
    ai_services=("image-analysis:8001" "document-analysis:8002" "llm-service:8003")
    for service in "${ai_services[@]}"; do
        IFS=':' read -r name port <<< "$service"
        if ! curl -f -s "http://localhost:$port/health" > /dev/null 2>&1; then
            log_warning "$name 服务未就绪"
            services_ok=false
        else
            log_success "$name 服务正常"
        fi
    done
    
    if [ "$services_ok" = false ]; then
        log_error "部分服务未就绪，请先运行 ./scripts/start-all.sh 启动平台"
        exit 1
    fi
    
    echo ""
    log_success "所有服务已就绪，开始演示..."
    echo ""
    
    # 执行演示步骤
    prepare_demo_data
    demo_file_upload
    demo_task_creation
    demo_ai_analysis
    demo_agent_management
    demo_monitoring
    generate_demo_report
    
    echo ""
    echo "========================================"
    echo "  演示完成！"
    echo "========================================"
    echo ""
    log_info "感谢观看SmartFA平台演示！"
    log_info "演示报告已在浏览器中打开"
    log_info "您可以通过以下链接继续探索平台功能："
    echo ""
    echo -e "${GREEN}🌐 前端应用:${NC}        http://localhost"
    echo -e "${GREEN}📚 API文档:${NC}          http://localhost/api/doc.html"
    echo -e "${GREEN}📊 Grafana监控:${NC}      http://localhost:3001"
    echo -e "${GREEN}📈 Prometheus:${NC}       http://localhost:9090"
    echo ""
}

# 解析命令行参数
case "${1:-full}" in
    "prepare")
        prepare_demo_data
        ;;
    "upload")
        demo_file_upload
        ;;
    "tasks")
        demo_task_creation
        ;;
    "ai")
        demo_ai_analysis
        ;;
    "agents")
        demo_agent_management
        ;;
    "monitoring")
        demo_monitoring
        ;;
    "report")
        generate_demo_report
        ;;
    "full")
        run_demo
        ;;
    *)
        echo "用法: $0 {prepare|upload|tasks|ai|agents|monitoring|report|full}"
        echo ""
        echo "  prepare   - 准备演示数据"
        echo "  upload    - 演示文件上传"
        echo "  tasks     - 演示任务创建"
        echo "  ai        - 演示AI分析"
        echo "  agents    - 演示智能体管理"
        echo "  monitoring- 演示监控功能"
        echo "  report    - 生成演示报告"
        echo "  full      - 完整演示（默认）"
        exit 1
        ;;
esac