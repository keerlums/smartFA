"""
LLM处理器
处理不同类型的LLM请求
"""

import json
import asyncio
import aiohttp
import hashlib
from datetime import datetime
from typing import Dict, List, Any, Optional
from loguru import logger

class LLMHandler:
    """LLM请求处理器"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.cache = {}
        
    async def generate_response(self, request) -> Dict[str, Any]:
        """生成LLM响应"""
        try:
            model_name = request.model_name
            prompt = request.prompt
            context = request.context or []
            parameters = request.parameters
            
            # 检查缓存
            cache_key = self._generate_cache_key(model_name, prompt, context)
            if cache_key in self.cache:
                logger.info(f"命中缓存: {cache_key}")
                return {
                    "status": "success",
                    "result": self.cache[cache_key],
                    "cached": True
                }
            
            # 根据模型类型调用不同的API
            if model_name.startswith("gpt"):
                result = await self._call_openai(model_name, prompt, context, parameters)
            elif model_name.startswith("claude"):
                result = await self._call_claude(model_name, prompt, context, parameters)
            else:
                raise ValueError(f"不支持的模型: {model_name}")
            
            # 缓存结果
            self.cache[cache_key] = result
            if len(self.cache) > 1000:  # 限制缓存大小
                oldest_key = next(iter(self.cache))
                del self.cache[oldest_key]
            
            return {
                "status": "success",
                "result": result,
                "cached": False
            }
            
        except Exception as e:
            logger.error(f"生成响应失败: {str(e)}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def _call_openai(self, model_name: str, prompt: str, 
                          context: List[Dict[str, str]], parameters: Dict[str, Any]) -> str:
        """调用OpenAI API"""
        headers = {
            "Authorization": f"Bearer {self.config['openai']['api_key']}",
            "Content-Type": "application/json"
        }
        
        messages = []
        # 添加上下文
        if context:
            messages.extend(context)
        # 添加用户提示
        messages.append({"role": "user", "content": prompt})
        
        data = {
            "model": model_name,
            "messages": messages,
            "max_tokens": parameters.get("max_tokens", self.config["max_tokens"]),
            "temperature": parameters.get("temperature", self.config["temperature"])
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.config['openai']['base_url']}/chat/completions",
                headers=headers,
                json=data,
                timeout=30
            ) as response:
                if response.status != 200:
                    error_text = await response.text()
                    raise Exception(f"OpenAI API错误: {response.status} - {error_text}")
                
                result = await response.json()
                return result["choices"][0]["message"]["content"]
    
    async def _call_claude(self, model_name: str, prompt: str,
                          context: List[Dict[str, str]], parameters: Dict[str, Any]) -> str:
        """调用Claude API"""
        headers = {
            "x-api-key": self.config["claude"]["api_key"],
            "Content-Type": "application/json",
            "anthropic-version": "2023-06-01"
        }
        
        # 构建消息
        messages = []
        if context:
            messages.extend(context)
        messages.append({"role": "user", "content": prompt})
        
        data = {
            "model": model_name,
            "max_tokens": parameters.get("max_tokens", self.config["max_tokens"]),
            "temperature": parameters.get("temperature", self.config["temperature"]),
            "messages": messages
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.config['claude']['base_url']}/v1/messages",
                headers=headers,
                json=data,
                timeout=30
            ) as response:
                if response.status != 200:
                    error_text = await response.text()
                    raise Exception(f"Claude API错误: {response.status} - {error_text}")
                
                result = await response.json()
                return result["content"][0]["text"]
    
    def _generate_cache_key(self, model_name: str, prompt: str, 
                           context: List[Dict[str, str]]) -> str:
        """生成缓存键"""
        content = f"{model_name}:{prompt}:{json.dumps(context, sort_keys=True)}"
        return hashlib.md5(content.encode()).hexdigest()

class FailureAnalysisHandler:
    """失效分析处理器"""
    
    def __init__(self, llm_handler: LLMHandler):
        self.llm_handler = llm_handler
        
    async def analyze_failure(self, request) -> Dict[str, Any]:
        """分析失效原因"""
        try:
            case_description = request.case_description
            failure_mode = request.failure_mode
            product_info = request.product_info
            analysis_type = request.analysis_type
            
            # 构建分析提示
            prompt = self._build_analysis_prompt(
                case_description, failure_mode, product_info, analysis_type
            )
            
            # 调用LLM
            llm_request = type('LLMRequest', (), {
                'model_name': 'gpt-4',
                'prompt': prompt,
                'context': [],
                'parameters': {'temperature': 0.3, 'max_tokens': 2048}
            })()
            
            result = await self.llm_handler.generate_response(llm_request)
            
            if result["status"] == "success":
                # 解析LLM响应
                analysis_result = self._parse_analysis_result(result["result"])
                return {
                    "status": "success",
                    "analysis": analysis_result,
                    "raw_response": result["result"]
                }
            else:
                return result
                
        except Exception as e:
            logger.error(f"失效分析失败: {str(e)}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    def _build_analysis_prompt(self, case_description: str, failure_mode: Optional[str],
                              product_info: Optional[str], analysis_type: str) -> str:
        """构建分析提示"""
        base_prompt = f"""
作为失效分析专家，请分析以下失效案例：

案例描述：{case_description}
"""
        
        if failure_mode:
            base_prompt += f"\n失效模式：{failure_mode}"
        
        if product_info:
            base_prompt += f"\n产品信息：{product_info}"
        
        if analysis_type == "root_cause":
            base_prompt += """

请提供详细的根本原因分析，包括：
1. 可能的直接原因
2. 潜在的根本原因
3. 影响因素分析
4. 支撑证据和建议的验证方法

请以结构化的方式回答，使用清晰的标题和编号。
"""
        elif analysis_type == "prevention":
            base_prompt += """

请提供预防措施建议，包括：
1. 短期预防措施
2. 长期预防策略
3. 设计改进建议
4. 工艺控制措施
5. 监测和检测方法

请提供具体可操作的建议。
"""
        elif analysis_type == "recommendation":
            base_prompt += """

请提供综合建议，包括：
1. 技术改进建议
2. 管理流程优化
3. 质量控制措施
4. 人员培训建议
5. 标准规范建议

请提供全面且实用的建议。
"""
        
        return base_prompt
    
    def _parse_analysis_result(self, raw_response: str) -> Dict[str, Any]:
        """解析分析结果"""
        try:
            # 尝试解析结构化响应
            sections = {}
            current_section = None
            content = []
            
            lines = raw_response.split('\n')
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                
                # 检测标题
                if line.startswith(('1.', '2.', '3.', '4.', '5.', '一、', '二、', '三、', '四、', '五、')):
                    if current_section:
                        sections[current_section] = '\n'.join(content)
                    current_section = line
                    content = []
                else:
                    content.append(line)
            
            if current_section:
                sections[current_section] = '\n'.join(content)
            
            return {
                "sections": sections,
                "full_text": raw_response,
                "summary": raw_response[:200] + "..." if len(raw_response) > 200 else raw_response
            }
            
        except Exception as e:
            logger.warning(f"解析分析结果失败: {str(e)}")
            return {
                "sections": {},
                "full_text": raw_response,
                "summary": raw_response[:200] + "..." if len(raw_response) > 200 else raw_response
            }

class TaskDecompositionHandler:
    """任务分解处理器"""
    
    def __init__(self, llm_handler: LLMHandler):
        self.llm_handler = llm_handler
        
    async def decompose_task(self, request) -> Dict[str, Any]:
        """分解任务"""
        try:
            main_task = request.main_task
            case_context = request.case_context
            available_agents = request.available_agents
            
            prompt = self._build_decomposition_prompt(
                main_task, case_context, available_agents
            )
            
            llm_request = type('LLMRequest', (), {
                'model_name': 'gpt-3.5-turbo',
                'prompt': prompt,
                'context': [],
                'parameters': {'temperature': 0.5, 'max_tokens': 1536}
            })()
            
            result = await self.llm_handler.generate_response(llm_request)
            
            if result["status"] == "success":
                tasks = self._parse_tasks(result["result"])
                return {
                    "status": "success",
                    "tasks": tasks,
                    "raw_response": result["result"]
                }
            else:
                return result
                
        except Exception as e:
            logger.error(f"任务分解失败: {str(e)}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    def _build_decomposition_prompt(self, main_task: str, case_context: Optional[str],
                                   available_agents: List[str]) -> str:
        """构建任务分解提示"""
        prompt = f"""
请将以下主要任务分解为具体的子任务：

主要任务：{main_task}
"""
        
        if case_context:
            prompt += f"\n案例背景：{case_context}"
        
        if available_agents:
            prompt += f"\n可用的智能体：{', '.join(available_agents)}"
        
        prompt += """

请按照以下格式分解任务：

任务1：[任务名称]
- 描述：[任务描述]
- 负责人：[建议的负责人类型]
- 优先级：[高/中/低]
- 预估时间：[时间估算]
- 依赖：[依赖的其他任务]

任务2：[任务名称]
...

请确保任务分解合理、可执行，并考虑任务间的依赖关系。
"""
        
        return prompt
    
    def _parse_tasks(self, raw_response: str) -> List[Dict[str, Any]]:
        """解析任务列表"""
        tasks = []
        try:
            lines = raw_response.split('\n')
            current_task = {}
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                
                if line.startswith('任务') and '：' in line:
                    if current_task:
                        tasks.append(current_task)
                    task_name = line.split('：', 1)[1].strip()
                    current_task = {
                        "name": task_name,
                        "description": "",
                        "assignee": "",
                        "priority": "中",
                        "estimated_time": "",
                        "dependencies": []
                    }
                elif '：' in line and current_task:
                    key, value = line.split('：', 1)
                    key = key.strip().lstrip('- ')
                    value = value.strip()
                    
                    if key == '描述':
                        current_task["description"] = value
                    elif key == '负责人':
                        current_task["assignee"] = value
                    elif key == '优先级':
                        current_task["priority"] = value
                    elif key == '预估时间':
                        current_task["estimated_time"] = value
                    elif key == '依赖':
                        current_task["dependencies"] = [v.strip() for v in value.split(',')]
            
            if current_task:
                tasks.append(current_task)
                
        except Exception as e:
            logger.warning(f"解析任务列表失败: {str(e)}")
            # 返回原始文本作为单个任务
            tasks = [{
                "name": main_task if 'main_task' in locals() else "分解任务",
                "description": raw_response,
                "assignee": "",
                "priority": "中",
                "estimated_time": "",
                "dependencies": []
            }]
        
        return tasks