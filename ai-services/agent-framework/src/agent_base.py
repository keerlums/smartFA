"""
智能体基础框架
"""
import asyncio
import json
import logging
import time
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional, Callable
from dataclasses import dataclass, asdict
from enum import Enum
import aiohttp
import aio_pika

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AgentStatus(Enum):
    """智能体状态枚举"""
    IDLE = "idle"
    BUSY = "busy"
    ERROR = "error"
    MAINTENANCE = "maintenance"


class MessageType(Enum):
    """消息类型枚举"""
    TASK_ASSIGNMENT = "task_assignment"
    TASK_STATUS = "task_status"
    COLLABORATION_REQUEST = "collaboration_request"
    COLLABORATION_RESPONSE = "collaboration_response"
    HEARTBEAT = "heartbeat"
    ERROR = "error"


@dataclass
class Message:
    """消息数据类"""
    message_id: str
    from_agent_id: str
    to_agent_id: str
    message_type: MessageType
    content: Dict[str, Any]
    timestamp: float
    correlation_id: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        data = asdict(self)
        data['message_type'] = self.message_type.value
        return data

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Message':
        """从字典创建消息"""
        data['message_type'] = MessageType(data['message_type'])
        return cls(**data)


@dataclass
class Task:
    """任务数据类"""
    task_id: str
    task_type: str
    task_data: Dict[str, Any]
    priority: int
    created_time: float
    deadline: Optional[float] = None
    dependencies: List[str] = None

    def __post_init__(self):
        if self.dependencies is None:
            self.dependencies = []


class AgentBase(ABC):
    """智能体基础类"""
    
    def __init__(self, agent_id: str, agent_type: str, config: Dict[str, Any] = None):
        self.agent_id = agent_id
        self.agent_type = agent_type
        self.config = config or {}
        self.status = AgentStatus.IDLE
        self.capabilities = self._get_capabilities()
        self.current_task: Optional[Task] = None
        self.message_handlers: Dict[MessageType, Callable] = {}
        self.running = False
        
        # 消息队列
        self.message_queue = asyncio.Queue()
        self.response_futures: Dict[str, asyncio.Future] = {}
        
        # 性能统计
        self.stats = {
            'tasks_completed': 0,
            'tasks_failed': 0,
            'total_processing_time': 0.0,
            'messages_sent': 0,
            'messages_received': 0,
            'last_heartbeat': time.time()
        }
        
        # 注册默认消息处理器
        self._register_default_handlers()
    
    @abstractmethod
    def _get_capabilities(self) -> List[str]:
        """获取智能体能力列表"""
        pass
    
    @abstractmethod
    async def process_task(self, task: Task) -> Dict[str, Any]:
        """处理任务的具体实现"""
        pass
    
    def _register_default_handlers(self):
        """注册默认消息处理器"""
        self.message_handlers[MessageType.TASK_ASSIGNMENT] = self._handle_task_assignment
        self.message_handlers[MessageType.TASK_STATUS] = self._handle_task_status
        self.message_handlers[MessageType.COLLABORATION_REQUEST] = self._handle_collaboration_request
        self.message_handlers[MessageType.COLLABORATION_RESPONSE] = self._handle_collaboration_response
        self.message_handlers[MessageType.HEARTBEAT] = self._handle_heartbeat
        self.message_handlers[MessageType.ERROR] = self._handle_error
    
    async def start(self):
        """启动智能体"""
        logger.info(f"Starting agent {self.agent_id} of type {self.agent_type}")
        self.running = True
        self.status = AgentStatus.IDLE
        
        # 启动消息处理循环
        asyncio.create_task(self._message_loop())
        
        # 启动心跳循环
        asyncio.create_task(self._heartbeat_loop())
        
        # 调用子类的启动方法
        await self._on_start()
    
    async def stop(self):
        """停止智能体"""
        logger.info(f"Stopping agent {self.agent_id}")
        self.running = False
        self.status = AgentStatus.MAINTENANCE
        
        # 调用子类的停止方法
        await self._on_stop()
    
    async def _on_start(self):
        """启动时的回调方法"""
        pass
    
    async def _on_stop(self):
        """停止时的回调方法"""
        pass
    
    async def _message_loop(self):
        """消息处理循环"""
        while self.running:
            try:
                message = await asyncio.wait_for(self.message_queue.get(), timeout=1.0)
                await self._process_message(message)
            except asyncio.TimeoutError:
                continue
            except Exception as e:
                logger.error(f"Error processing message: {e}")
    
    async def _heartbeat_loop(self):
        """心跳循环"""
        while self.running:
            try:
                await self._send_heartbeat()
                await asyncio.sleep(30)  # 每30秒发送一次心跳
            except Exception as e:
                logger.error(f"Error sending heartbeat: {e}")
    
    async def _process_message(self, message: Message):
        """处理接收到的消息"""
        self.stats['messages_received'] += 1
        logger.debug(f"Agent {self.agent_id} received message: {message.message_type}")
        
        handler = self.message_handlers.get(message.message_type)
        if handler:
            try:
                await handler(message)
            except Exception as e:
                logger.error(f"Error handling message {message.message_type}: {e}")
                await self._send_error(message.from_agent_id, str(e), message.correlation_id)
        else:
            logger.warning(f"No handler for message type: {message.message_type}")
    
    async def _handle_task_assignment(self, message: Message):
        """处理任务分配消息"""
        if self.status != AgentStatus.IDLE:
            await self._send_task_status(
                message.from_agent_id,
                message.content['taskId'],
                'rejected',
                {'reason': 'Agent is busy'}
            )
            return
        
        task_data = message.content['taskData']
        task = Task(
            task_id=message.content['taskId'],
            task_type=message.content['taskType'],
            task_data=task_data,
            priority=message.content.get('priority', 1),
            created_time=message.timestamp
        )
        
        self.current_task = task
        self.status = AgentStatus.BUSY
        
        # 异步处理任务
        asyncio.create_task(self._execute_task(message.from_agent_id, task))
    
    async def _execute_task(self, requester_id: str, task: Task):
        """执行任务"""
        start_time = time.time()
        
        try:
            # 发送任务开始状态
            await self._send_task_status(requester_id, task.task_id, 'started')
            
            # 执行任务
            result = await self.process_task(task)
            
            # 更新统计
            processing_time = time.time() - start_time
            self.stats['tasks_completed'] += 1
            self.stats['total_processing_time'] += processing_time
            
            # 发送任务完成状态
            await self._send_task_status(
                requester_id,
                task.task_id,
                'completed',
                result
            )
            
        except Exception as e:
            logger.error(f"Error executing task {task.task_id}: {e}")
            self.stats['tasks_failed'] += 1
            
            # 发送任务失败状态
            await self._send_task_status(
                requester_id,
                task.task_id,
                'failed',
                {'error': str(e)}
            )
        
        finally:
            self.current_task = None
            self.status = AgentStatus.IDLE
    
    async def _handle_task_status(self, message: Message):
        """处理任务状态消息"""
        correlation_id = message.correlation_id
        if correlation_id and correlation_id in self.response_futures:
            future = self.response_futures.pop(correlation_id)
            future.set_result(message)
    
    async def _handle_collaboration_request(self, message: Message):
        """处理协作请求"""
        required_capability = message.content.get('requiredCapability')
        
        if required_capability in self.capabilities and self.status == AgentStatus.IDLE:
            # 可以协作
            await self._send_collaboration_response(
                message.from_agent_id,
                message.content['taskId'],
                True,
                {'agentId': self.agent_id, 'capability': required_capability}
            )
        else:
            # 无法协作
            await self._send_collaboration_response(
                message.from_agent_id,
                message.content['taskId'],
                False,
                {'reason': 'Capability not available or agent busy'}
            )
    
    async def _handle_collaboration_response(self, message: Message):
        """处理协作响应"""
        correlation_id = message.correlation_id
        if correlation_id and correlation_id in self.response_futures:
            future = self.response_futures.pop(correlation_id)
            future.set_result(message)
    
    async def _handle_heartbeat(self, message: Message):
        """处理心跳消息"""
        # 更新其他智能体的状态信息
        pass
    
    async def _handle_error(self, message: Message):
        """处理错误消息"""
        logger.error(f"Received error from {message.from_agent_id}: {message.content}")
    
    async def send_message(self, to_agent_id: str, message_type: MessageType, 
                          content: Dict[str, Any], correlation_id: str = None) -> Optional[Message]:
        """发送消息到其他智能体"""
        message = Message(
            message_id=f"{self.agent_id}_{int(time.time() * 1000000)}",
            from_agent_id=self.agent_id,
            to_agent_id=to_agent_id,
            message_type=message_type,
            content=content,
            timestamp=time.time(),
            correlation_id=correlation_id
        )
        
        self.stats['messages_sent'] += 1
        
        # 这里应该通过消息队列发送消息
        # 暂时使用本地队列模拟
        await self.message_queue.put(message)
        
        return message
    
    async def send_request(self, to_agent_id: str, message_type: MessageType,
                          content: Dict[str, Any], timeout: float = 30.0) -> Optional[Message]:
        """发送请求并等待响应"""
        correlation_id = f"{self.agent_id}_{int(time.time() * 1000000)}"
        future = asyncio.Future()
        self.response_futures[correlation_id] = future
        
        await self.send_message(to_agent_id, message_type, content, correlation_id)
        
        try:
            response = await asyncio.wait_for(future, timeout=timeout)
            return response
        except asyncio.TimeoutError:
            self.response_futures.pop(correlation_id, None)
            logger.warning(f"Request to {to_agent_id} timed out")
            return None
    
    async def _send_task_status(self, to_agent_id: str, task_id: str, 
                               status: str, result: Dict[str, Any] = None):
        """发送任务状态"""
        content = {
            'taskId': task_id,
            'status': status,
            'result': result or {}
        }
        await self.send_message(to_agent_id, MessageType.TASK_STATUS, content)
    
    async def _send_collaboration_response(self, to_agent_id: str, task_id: str,
                                          can_collaborate: bool, response_data: Dict[str, Any]):
        """发送协作响应"""
        content = {
            'taskId': task_id,
            'canCollaborate': can_collaborate,
            'responseData': response_data
        }
        await self.send_message(to_agent_id, MessageType.COLLABORATION_RESPONSE, content)
    
    async def _send_error(self, to_agent_id: str, error_message: str, correlation_id: str = None):
        """发送错误消息"""
        content = {
            'error': error_message,
            'agentId': self.agent_id
        }
        await self.send_message(to_agent_id, MessageType.ERROR, content, correlation_id)
    
    async def _send_heartbeat(self):
        """发送心跳"""
        content = {
            'agentId': self.agent_id,
            'status': self.status.value,
            'capabilities': self.capabilities,
            'stats': self.stats
        }
        await self.send_message('coordinator', MessageType.HEARTBEAT, content)
        self.stats['last_heartbeat'] = time.time()
    
    def get_status(self) -> Dict[str, Any]:
        """获取智能体状态"""
        return {
            'agentId': self.agent_id,
            'agentType': self.agent_type,
            'status': self.status.value,
            'capabilities': self.capabilities,
            'currentTask': self.current_task.task_id if self.current_task else None,
            'stats': self.stats
        }
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """获取性能指标"""
        completed_tasks = self.stats['tasks_completed']
        if completed_tasks > 0:
            avg_processing_time = self.stats['total_processing_time'] / completed_tasks
            success_rate = completed_tasks / (completed_tasks + self.stats['tasks_failed'])
        else:
            avg_processing_time = 0
            success_rate = 0
        
        return {
            'agentId': self.agent_id,
            'tasksCompleted': completed_tasks,
            'tasksFailed': self.stats['tasks_failed'],
            'avgProcessingTime': avg_processing_time,
            'successRate': success_rate,
            'messagesSent': self.stats['messages_sent'],
            'messagesReceived': self.stats['messages_received'],
            'lastHeartbeat': self.stats['last_heartbeat']
        }