"""
LLM服务
提供大语言模型相关的AI能力
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional, Union
import uvicorn
import asyncio
import redis
import json
import requests
import aiohttp
from datetime import datetime
from pathlib import Path
import os
import hashlib
from loguru import logger

# 配置日志
logger.add("logs/llm_service.log", rotation="10 MB", level="INFO")

app = FastAPI(
    title="LLM服务",
    description="失效分析智能辅助平台 - 大语言模型服务",
    version="1.0.0"
)

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis连接
try:
    redis_client = redis.Redis(host='redis', port=6379, db=0, decode_responses=True)
    redis_client.ping()
    logger.info("Redis连接成功")
except:
    redis_client = None
    logger.warning("Redis连接失败，使用内存缓存")

# 内存缓存
memory_cache = {}

# 配置
LLM_CONFIG = {
    "openai": {
        "api_key": os.getenv("OPENAI_API_KEY", ""),
        "base_url": os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
        "models": ["gpt-3.5-turbo", "gpt-4", "gpt-4-turbo"]
    },
    "claude": {
        "api_key": os.getenv("CLAUDE_API_KEY", ""),
        "base_url": os.getenv("CLAUDE_BASE_URL", "https://api.anthropic.com"),
        "models": ["claude-3-sonnet", "claude-3-opus"]
    },
    "default_model": "gpt-3.5-turbo",
    "max_tokens": 4096,
    "temperature": 0.7
}

# 数据模型
class LLMRequest(BaseModel):
    task_id: str
    model_name: str = LLM_CONFIG["default_model"]
    prompt: str
    context: Optional[List[Dict[str, str]]] = None
    parameters: Dict[str, Any] = {}

class LLMResponse(BaseModel):
    task_id: str
    status: str
    result: Optional[str] = None
    error: Optional[str] = None
    usage: Optional[Dict[str, int]] = None
    timestamp: datetime = datetime.now()

class FailureAnalysisRequest(BaseModel):
    case_description: str
    failure_mode: Optional[str] = None
    product_info: Optional[str] = None
    analysis_type: str = "root_cause"  # root_cause, prevention, recommendation

class TaskDecompositionRequest(BaseModel):
    main_task: str
    case_context: Optional[str] = None
    available_agents: List[str] = []
    response: str
    metadata: Dict[str, Any]
    execution_time: float
    timestamp: str

class EmbeddingRequest(BaseModel):
    texts: List[str]
    model_name: str = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"

class ChatRequest(BaseModel):
    messages: List[Dict[str, str]]
    model_name: str = "deepseek-ai/deepseek-coder-6.7b-base"
    max_tokens: Optional[int] = 2048
    temperature: Optional[float] = 0.7

class RAGRequest(BaseModel):
    query: str
    context_documents: List[str]
    model_name: str = "deepseek-ai/deepseek-coder-6.7b-base"

# LLM核心功能
class LLMService:
    def __init__(self):
        self.models = {}
        self.model_configs = {
            "deepseek-ai/deepseek-coder-6.7b-base": {
                "type": "codegen",
                "max_length": 4096,
                "device": "auto"
            },
            "microsoft/DialoGPT-medium": {
                "type": "chat",
                "max_length": 1024,
                "device": "auto"
            },
            "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2": {
                "type": "embedding",
                "device": "auto"
            }
        }
        self.default_model = "deepseek-ai/deepseek-coder-6.7b-base"
    
    async def initialize_model(self, model_name: str):
        """初始化模型"""
        if model_name in self.models:
            return self.models[model_name]
        
        try:
            config = self.model_configs.get(model_name, {})
            model_type = config.get("type", "text")
            device = config.get("device", "auto")
            
            if model_type == "codegen" or model_type == "text":
                from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
                
                logger.info(f"加载模型: {model_name}")
                
                # 加载tokenizer
                tokenizer = AutoTokenizer.from_pretrained(model_name)
                if tokenizer.pad_token is None:
                    tokenizer.pad_token = tokenizer.eos_token
                
                # 加载模型
                model = AutoModelForCausalLM.from_pretrained(
                    model_name,
                    torch_dtype=torch.float16,
                    device_map=device,
                    trust_remote_code=True
                )
                
                # 创建pipeline
                pipe = pipeline(
                    "text-generation",
                    model=model,
                    tokenizer=tokenizer,
                    max_new_tokens=config.get("max_length", 2048),
                    do_sample=True,
                    temperature=0.7,
                    top_p=0.9,
                    return_full_text=False
                )
                
                self.models[model_name] = {
                    "type": model_type,
                    "pipeline": pipe,
                    "tokenizer": tokenizer,
                    "model": model
                }
                
            elif model_type == "embedding":
                from sentence_transformers import SentenceTransformer
                
                logger.info(f"加载嵌入模型: {model_name}")
                model = SentenceTransformer(model_name)
                
                self.models[model_name] = {
                    "type": model_type,
                    "model": model
                }
            
            elif model_type == "chat":
                from transformers import AutoTokenizer, AutoModelForCausalLM
                
                logger.info(f"加载对话模型: {model_name}")
                
                tokenizer = AutoTokenizer.from_pretrained(model_name)
                model = AutoModelForCausalLM.from_pretrained(
                    model_name,
                    torch_dtype=torch.float16,
                    device_map=device
                )
                
                self.models[model_name] = {
                    "type": model_type,
                    "tokenizer": tokenizer,
                    "model": model
                }
            
            logger.info(f"模型 {model_name} 加载完成")
            return self.models[model_name]
            
        except Exception as e:
            logger.error(f"模型加载失败 {model_name}: {str(e)}")
            raise HTTPException(status_code=500, detail=f"模型加载失败: {str(e)}")
    
    async def generate_text(self, model_name: str, prompt: str, parameters: Dict) -> Dict[str, Any]:
        """生成文本"""
        try:
            model_data = await self.initialize_model(model_name)
            
            if model_data["type"] == "codegen" or model_data["type"] == "text":
                pipeline = model_data["pipeline"]
                
                # 设置生成参数
                generation_params = {
                    "max_new_tokens": parameters.get("max_tokens", 1024),
                    "temperature": parameters.get("temperature", 0.7),
                    "top_p": parameters.get("top_p", 0.9),
                    "do_sample": parameters.get("do_sample", True),
                    "pad_token_id": model_data["tokenizer"].pad_token_id
                }
                
                # 生成文本
                result = pipeline(prompt, **generation_params)
                generated_text = result[0]["generated_text"] if result else ""
                
                return {
                    "generated_text": generated_text,
                    "prompt_tokens": len(model_data["tokenizer"].encode(prompt)),
                    "generated_tokens": len(model_data["tokenizer"].encode(generated_text)),
                    "model_name": model_name,
                    "generation_params": generation_params
                }
            
            else:
                raise ValueError(f"模型 {model_name} 不支持文本生成")
        
        except Exception as e:
            logger.error(f"文本生成失败: {str(e)}")
            raise
    
    async def generate_embeddings(self, model_name: str, texts: List[str]) -> Dict[str, Any]:
        """生成文本嵌入"""
        try:
            model_data = await self.initialize_model(model_name)
            
            if model_data["type"] != "embedding":
                raise ValueError(f"模型 {model_name} 不是嵌入模型")
            
            model = model_data["model"]
            
            # 生成嵌入
            embeddings = model.encode(texts, convert_to_tensor=False)
            
            # 转换为列表
            embedding_list = embeddings.tolist() if hasattr(embeddings, 'tolist') else embeddings
            
            return {
                "embeddings": embedding_list,
                "dimension": len(embedding_list[0]) if embedding_list else 0,
                "model_name": model_name,
                "text_count": len(texts)
            }
        
        except Exception as e:
            logger.error(f"嵌入生成失败: {str(e)}")
            raise
    
    async def chat_completion(self, model_name: str, messages: List[Dict[str, str]], parameters: Dict) -> Dict[str, Any]:
        """对话补全"""
        try:
            model_data = await self.initialize_model(model_name)
            
            if model_data["type"] != "chat":
                # 对于非对话模型，将消息转换为单个prompt
                prompt = self._messages_to_prompt(messages)
                return await self.generate_text(model_name, prompt, parameters)
            
            tokenizer = model_data["tokenizer"]
            model = model_data["model"]
            
            # 构建对话prompt
            conversation = self._build_conversation(messages, tokenizer)
            
            # 生成回复
            inputs = tokenizer.encode(conversation, return_tensors="pt")
            if torch.cuda.is_available():
                inputs = inputs.cuda()
            
            with torch.no_grad():
                outputs = model.generate(
                    inputs,
                    max_new_tokens=parameters.get("max_tokens", 1024),
                    temperature=parameters.get("temperature", 0.7),
                    top_p=parameters.get("top_p", 0.9),
                    do_sample=True,
                    pad_token_id=tokenizer.eos_token_id
                )
            
            response = tokenizer.decode(outputs[0][inputs.shape[1]:], skip_special_tokens=True)
            
            return {
                "response": response,
                "conversation": conversation,
                "model_name": model_name,
                "parameters": parameters
            }
        
        except Exception as e:
            logger.error(f"对话补全失败: {str(e)}")
            raise
    
    async def rag_generation(self, model_name: str, query: str, context_documents: List[str]) -> Dict[str, Any]:
        """RAG（检索增强生成）"""
        try:
            # 构建RAG prompt
            context_text = "\n\n".join([f"文档{i+1}: {doc}" for i, doc in enumerate(context_documents)])
            
            prompt = f"""基于以下上下文信息回答问题：

上下文信息：
{context_text}

问题：{query}

请基于提供的上下文信息回答问题，如果上下文中没有相关信息，请说明。"""

            # 生成回答
            result = await self.generate_text(model_name, prompt, {"max_tokens": 1024, "temperature": 0.3})
            
            return {
                "answer": result["generated_text"],
                "query": query,
                "context_count": len(context_documents),
                "context_length": len(context_text),
                "model_name": model_name
            }
        
        except Exception as e:
            logger.error(f"RAG生成失败: {str(e)}")
            raise
    
    def _messages_to_prompt(self, messages: List[Dict[str, str]]) -> str:
        """将消息转换为prompt"""
        prompt = ""
        for message in messages:
            role = message.get("role", "user")
            content = message.get("content", "")
            
            if role == "system":
                prompt += f"System: {content}\n"
            elif role == "user":
                prompt += f"Human: {content}\n"
            elif role == "assistant":
                prompt += f"Assistant: {content}\n"
        
        prompt += "Assistant: "
        return prompt
    
    def _build_conversation(self, messages: List[Dict[str, str]], tokenizer) -> str:
        """构建对话字符串"""
        # 这里简化处理，实际应该根据具体模型的对话格式来构建
        conversation = ""
        for message in messages:
            role = message.get("role", "user")
            content = message.get("content", "")
            
            if role == "system":
                conversation += f"System: {content}\n"
            elif role == "user":
                conversation += f"Human: {content}\n"
            elif role == "assistant":
                conversation += f"Assistant: {content}\n"
        
        conversation += "Assistant: "
        return conversation
    
    async def get_model_info(self, model_name: str) -> Dict[str, Any]:
        """获取模型信息"""
        if model_name not in self.model_configs:
            return {"error": f"未知模型: {model_name}"}
        
        config = self.model_configs[model_name]
        is_loaded = model_name in self.models
        
        return {
            "model_name": model_name,
            "type": config.get("type", "unknown"),
            "max_length": config.get("max_length", "unknown"),
            "device": config.get("device", "auto"),
            "is_loaded": is_loaded,
            "supported_tasks": self._get_supported_tasks(config.get("type"))
        }
    
    def _get_supported_tasks(self, model_type: str) -> List[str]:
        """获取模型支持的任务类型"""
        task_map = {
            "text": ["text-generation", "completion", "summarization"],
            "codegen": ["code-generation", "text-generation", "completion"],
            "chat": ["chat", "conversation", "qa"],
            "embedding": ["embedding", "similarity", "retrieval"]
        }
        return task_map.get(model_type, ["unknown"])

# 全局LLM服务实例
llm_service = LLMService()

# API端点
@app.get("/")
async def root():
    return {"message": "LLM服务运行中", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/generate", response_model=LLMResponse)
async def generate_text(
    request: LLMRequest,
    background_tasks: BackgroundTasks
):
    """生成文本"""
    start_time = datetime.now()
    
    try:
        # 更新任务状态
        await redis_client.set(f"task:{request.task_id}:status", "running")
        
        # 执行文本生成
        result = await llm_service.generate_text(
            request.model_name,
            request.prompt,
            request.parameters
        )
        
        # 计算执行时间
        execution_time = (datetime.now() - start_time).total_seconds()
        
        # 构建响应
        response = LLMResponse(
            task_id=request.task_id,
            status="completed",
            response=result["generated_text"],
            metadata=result,
            execution_time=execution_time,
            timestamp=datetime.now().isoformat()
        )
        
        # 更新Redis中的结果
        await redis_client.setex(
            f"task:{request.task_id}:result",
            3600,  # 1小时过期
            json.dumps(response.dict())
        )
        
        return response
        
    except Exception as e:
        logger.error(f"文本生成失败: {str(e)}")
        await redis_client.set(f"task:{request.task_id}:status", "failed")
        await redis_client.set(f"task:{request.task_id}:error", str(e))
        
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/embeddings")
async def generate_embeddings(request: EmbeddingRequest):
    """生成文本嵌入"""
    try:
        result = await llm_service.generate_embeddings(
            request.model_name,
            request.texts
        )
        
        return {
            "status": "success",
            "embeddings": result["embeddings"],
            "dimension": result["dimension"],
            "model_name": result["model_name"],
            "text_count": result["text_count"]
        }
        
    except Exception as e:
        logger.error(f"嵌入生成失败: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat_completion(request: ChatRequest):
    """对话补全"""
    try:
        result = await llm_service.chat_completion(
            request.model_name,
            request.messages,
            {
                "max_tokens": request.max_tokens,
                "temperature": request.temperature
            }
        )
        
        return {
            "status": "success",
            "response": result["response"],
            "model_name": result["model_name"],
            "parameters": result["parameters"]
        }
        
    except Exception as e:
        logger.error(f"对话补全失败: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/rag")
async def rag_generation(request: RAGRequest):
    """RAG生成"""
    try:
        result = await llm_service.rag_generation(
            request.model_name,
            request.query,
            request.context_documents
        )
        
        return {
            "status": "success",
            "answer": result["answer"],
            "query": result["query"],
            "context_count": result["context_count"],
            "model_name": result["model_name"]
        }
        
    except Exception as e:
        logger.error(f"RAG生成失败: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/models")
async def list_models():
    """列出可用模型"""
    models_info = {}
    for model_name in llm_service.model_configs:
        models_info[model_name] = await llm_service.get_model_info(model_name)
    
    return {
        "available_models": models_info,
        "default_model": llm_service.default_model
    }

@app.get("/models/{model_name}")
async def get_model_info(model_name: str):
    """获取模型信息"""
    info = await llm_service.get_model_info(model_name)
    return info

@app.post("/models/{model_name}/load")
async def load_model(model_name: str):
    """加载模型"""
    try:
        await llm_service.initialize_model(model_name)
        return {"status": "success", "message": f"模型 {model_name} 加载成功"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/task/{task_id}/status")
async def get_task_status(task_id: str):
    """获取任务状态"""
    status = await redis_client.get(f"task:{task_id}:status")
    if not status:
        raise HTTPException(status_code=404, detail="任务不存在")
    
    result = {"task_id": task_id, "status": status}
    
    # 如果任务完成，返回结果
    if status == "completed":
        result_data = await redis_client.get(f"task:{task_id}:result")
        if result_data:
            result["result"] = json.loads(result_data)
    
    # 如果任务失败，返回错误信息
    elif status == "failed":
        error = await redis_client.get(f"task:{task_id}:error")
        if error:
            result["error"] = error
    
    return result

@app.get("/capabilities")
async def get_capabilities():
    """获取服务能力"""
    return {
        "supported_tasks": [
            "text-generation",
            "code-generation",
            "chat-completion",
            "embedding-generation",
            "rag-generation"
        ],
        "available_models": list(llm_service.model_configs.keys()),
        "default_model": llm_service.default_model,
        "max_text_length": 4096,
        "supported_languages": ["zh", "en", "code"]
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8003,
        reload=True,
        log_level="info"
    )