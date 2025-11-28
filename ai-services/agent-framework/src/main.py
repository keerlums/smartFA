"""
智能体框架主程序
"""
import asyncio
import logging
import json
import sys
from typing import Dict, Any
from specialized_agents import ImageAnalysisAgent, DataProcessingAgent

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class AgentFramework:
    """智能体框架管理器"""
    
    def __init__(self):
        self.agents = {}
        self.running = False
    
    async def create_agent(self, agent_type: str, agent_id: str, config: Dict[str, Any] = None) -> bool:
        """创建智能体"""
        try:
            if agent_type == 'image_analysis':
                agent = ImageAnalysisAgent(agent_id, config)
            elif agent_type == 'data_processing':
                agent = DataProcessingAgent(agent_id, config)
            else:
                logger.error(f"Unknown agent type: {agent_type}")
                return False
            
            self.agents[agent_id] = agent
            logger.info(f"Created agent {agent_id} of type {agent_type}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to create agent {agent_id}: {e}")
            return False
    
    async def start_agent(self, agent_id: str) -> bool:
        """启动智能体"""
        if agent_id not in self.agents:
            logger.error(f"Agent {agent_id} not found")
            return False
        
        try:
            await self.agents[agent_id].start()
            logger.info(f"Started agent {agent_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to start agent {agent_id}: {e}")
            return False
    
    async def stop_agent(self, agent_id: str) -> bool:
        """停止智能体"""
        if agent_id not in self.agents:
            logger.error(f"Agent {agent_id} not found")
            return False
        
        try:
            await self.agents[agent_id].stop()
            logger.info(f"Stopped agent {agent_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to stop agent {agent_id}: {e}")
            return False
    
    async def remove_agent(self, agent_id: str) -> bool:
        """移除智能体"""
        if agent_id not in self.agents:
            logger.error(f"Agent {agent_id} not found")
            return False
        
        try:
            await self.stop_agent(agent_id)
            del self.agents[agent_id]
            logger.info(f"Removed agent {agent_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to remove agent {agent_id}: {e}")
            return False
    
    def get_agent_status(self, agent_id: str) -> Dict[str, Any]:
        """获取智能体状态"""
        if agent_id not in self.agents:
            return {'error': f'Agent {agent_id} not found'}
        
        return self.agents[agent_id].get_status()
    
    def get_all_agents_status(self) -> Dict[str, Any]:
        """获取所有智能体状态"""
        status = {}
        for agent_id, agent in self.agents.items():
            status[agent_id] = agent.get_status()
        return status
    
    async def start_framework(self):
        """启动框架"""
        self.running = True
        logger.info("Agent framework started")
        
        try:
            while self.running:
                await asyncio.sleep(1)
        except KeyboardInterrupt:
            logger.info("Received interrupt signal")
        finally:
            await self.stop_framework()
    
    async def stop_framework(self):
        """停止框架"""
        self.running = False
        
        # 停止所有智能体
        for agent_id in list(self.agents.keys()):
            await self.stop_agent(agent_id)
        
        logger.info("Agent framework stopped")


async def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("Usage: python main.py <config_file>")
        sys.exit(1)
    
    config_file = sys.argv[1]
    
    try:
        with open(config_file, 'r') as f:
            config = json.load(f)
    except Exception as e:
        logger.error(f"Failed to load config file {config_file}: {e}")
        sys.exit(1)
    
    framework = AgentFramework()
    
    # 创建智能体
    agents_config = config.get('agents', [])
    for agent_config in agents_config:
        agent_type = agent_config.get('type')
        agent_id = agent_config.get('id')
        agent_config_data = agent_config.get('config', {})
        
        if await framework.create_agent(agent_type, agent_id, agent_config_data):
            await framework.start_agent(agent_id)
        else:
            logger.error(f"Failed to create agent {agent_id}")
    
    # 启动框架
    await framework.start_framework()


if __name__ == "__main__":
    asyncio.run(main())