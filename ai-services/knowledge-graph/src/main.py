"""
知识图谱构建服务
构建失效分析领域的知识图谱，支持智能推理和关联分析
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional, Set, Tuple
import uvicorn
import asyncio
import networkx as nx
import numpy as np
from datetime import datetime
import json
import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import redis
from loguru import logger
import os

# 配置日志
logger.add("logs/knowledge_graph.log", rotation="10 MB", level="INFO")

app = FastAPI(
    title="知识图谱服务",
    description="失效分析智能辅助平台 - 知识图谱构建与推理",
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
    redis_client = redis.Redis(host='redis', port=6379, db=2, decode_responses=True)
    redis_client.ping()
    logger.info("Redis连接成功")
except:
    redis_client = None
    logger.warning("Redis连接失败，使用内存存储")

# 加载NLP模型
try:
    nlp = spacy.load("zh_core_web_sm")
    logger.info("NLP模型加载成功")
except:
    nlp = None
    logger.warning("NLP模型加载失败")

# 数据模型
class KnowledgeNode(BaseModel):
    id: str
    type: str  # failure_mode, component, material, cause, effect, solution
    name: str
    description: str
    properties: Dict[str, Any] = {}
    confidence: float = 1.0

class KnowledgeRelation(BaseModel):
    source_id: str
    target_id: str
    relation_type: str  # causes, leads_to, prevents, contains, similar_to
    strength: float = 1.0
    evidence: List[str] = []

class GraphQueryRequest(BaseModel):
    query_type: str  # path_search, similarity, reasoning, recommendation
    start_node: Optional[str] = None
    end_node: Optional[str] = None
    node_type: Optional[str] = None
    keywords: List[str] = []
    max_depth: int = 3
    min_similarity: float = 0.3

class GraphQueryResponse(BaseModel):
    success: bool
    nodes: List[KnowledgeNode] = []
    relations: List[KnowledgeRelation] = []
    paths: List[List[str]] = []
    recommendations: List[Dict[str, Any]] = []
    reasoning: List[str] = []
    execution_time: float

class KnowledgeGraphService:
    def __init__(self):
        self.graph = nx.DiGraph()
        self.node_index = {}  # 节点ID到索引的映射
        self.tfidf_vectorizer = TfidfVectorizer(max_features=1000)
        self.document_matrix = None
        self.documents = []
        
    def initialize_graph(self):
        """初始化知识图谱"""
        try:
            # 加载预定义的失效分析知识
            self._load_failure_modes()
            self._load_components()
            self._load_materials()
            self._load_causes()
            self._load_solutions()
            
            # 构建文档向量矩阵
            if self.documents:
                self.document_matrix = self.tfidf_vectorizer.fit_transform(self.documents)
            
            logger.info(f"知识图谱初始化完成，节点数: {self.graph.number_of_nodes()}, 边数: {self.graph.number_of_edges()}")
            
        except Exception as e:
            logger.error(f"知识图谱初始化失败: {str(e)}")
            
    def _load_failure_modes(self):
        """加载失效模式"""
        failure_modes = [
            ("fracture", "断裂", "材料在外力作用下发生的断裂现象"),
            ("fatigue", "疲劳", "循环载荷引起的渐进式损伤"),
            ("corrosion", "腐蚀", "材料与环境介质发生的化学或电化学反应"),
            ("wear", "磨损", "相对运动导致的表面材料损失"),
            ("deformation", "变形", "外力作用下形状或尺寸的改变"),
            ("overheating", "过热", "温度超过允许范围导致的性能退化"),
            ("electrical_failure", "电气故障", "电气系统的功能异常"),
            ("seal_failure", "密封失效", "密封系统失去密封能力"),
        ]
        
        for node_id, name, desc in failure_modes:
            self._add_node(node_id, "failure_mode", name, desc)
            
    def _load_components(self):
        """加载组件信息"""
        components = [
            ("bearing", "轴承", "支撑旋转运动的机械元件"),
            ("gear", "齿轮", "传递运动和动力的机械元件"),
            ("seal", "密封件", "防止泄漏的装置"),
            ("spring", "弹簧", "储存和释放能量的弹性元件"),
            ("valve", "阀门", "控制流体流动的装置"),
            ("pump", "泵", "输送流体的机械装置"),
            ("motor", "电机", "将电能转换为机械能的装置"),
            ("sensor", "传感器", "检测物理量并转换为电信号的装置"),
        ]
        
        for node_id, name, desc in components:
            self._add_node(node_id, "component", name, desc)
            
    def _load_materials(self):
        """加载材料信息"""
        materials = [
            ("steel", "钢材", "铁碳合金材料"),
            ("aluminum", "铝合金", "铝基合金材料"),
            ("copper", "铜合金", "铜基合金材料"),
            ("plastic", "塑料", "高分子聚合物材料"),
            ("ceramic", "陶瓷", "无机非金属材料"),
            ("composite", "复合材料", "多种材料组合而成的新材料"),
        ]
        
        for node_id, name, desc in materials:
            self._add_node(node_id, "material", name, desc)
            
    def _load_causes(self):
        """加载失效原因"""
        causes = [
            ("design_defect", "设计缺陷", "设计阶段存在的问题"),
            ("manufacturing_defect", "制造缺陷", "制造过程中产生的缺陷"),
            ("improper_installation", "安装不当", "安装过程中的错误"),
            ("overload", "过载", "超过设计载荷的使用"),
            ("poor_maintenance", "维护不良", "维护不及时或不当"),
            ("environmental_factors", "环境因素", "温度、湿度、腐蚀等环境影响"),
            ("aging", "老化", "材料随时间的性能退化"),
            ("human_error", "人为错误", "操作人员的错误行为"),
        ]
        
        for node_id, name, desc in causes:
            self._add_node(node_id, "cause", name, desc)
            
    def _load_solutions(self):
        """加载解决方案"""
        solutions = [
            ("design_improvement", "设计改进", "优化设计以防止失效"),
            ("material_upgrade", "材料升级", "使用更好的材料"),
            ("process_optimization", "工艺优化", "改进制造工艺"),
            ("preventive_maintenance", "预防性维护", "定期维护保养"),
            ("condition_monitoring", "状态监测", "实时监控设备状态"),
            ("redundancy_design", "冗余设计", "增加备份系统"),
            ("quality_control", "质量控制", "加强质量检验"),
            ("training", "培训", "提高操作人员技能"),
        ]
        
        for node_id, name, desc in solutions:
            self._add_node(node_id, "solution", name, desc)
            
    def _add_node(self, node_id: str, node_type: str, name: str, description: str):
        """添加节点到图谱"""
        node = KnowledgeNode(
            id=node_id,
            type=node_type,
            name=name,
            description=description
        )
        
        self.graph.add_node(
            node_id,
            type=node_type,
            name=name,
            description=description,
            properties=node.properties,
            confidence=node.confidence
        )
        
        # 更新文档列表
        self.documents.append(f"{name} {description}")
        self.node_index[node_id] = len(self.documents) - 1
        
    def add_relation(self, source_id: str, target_id: str, relation_type: str, strength: float = 1.0, evidence: List[str] = None):
        """添加关系到图谱"""
        if source_id in self.graph.nodes and target_id in self.graph.nodes:
            relation = KnowledgeRelation(
                source_id=source_id,
                target_id=target_id,
                relation_type=relation_type,
                strength=strength,
                evidence=evidence or []
            )
            
            self.graph.add_edge(
                source_id,
                target_id,
                relation_type=relation_type,
                strength=strength,
                evidence=evidence or []
            )
            
    def search_path(self, start_node: str, end_node: str, max_depth: int = 3) -> List[List[str]]:
        """搜索节点间的路径"""
        try:
            paths = list(nx.all_simple_paths(self.graph, start_node, end_node, cutoff=max_depth))
            return paths
        except nx.NetworkXNoPath:
            return []
        except Exception as e:
            logger.error(f"路径搜索失败: {str(e)}")
            return []
            
    def find_similar_nodes(self, keywords: List[str], node_type: str = None, min_similarity: float = 0.3) -> List[KnowledgeNode]:
        """基于关键词查找相似节点"""
        if not self.document_matrix is not None or not keywords:
            return []
            
        try:
            # 构建查询向量
            query_text = " ".join(keywords)
            query_vector = self.tfidf_vectorizer.transform([query_text])
            
            # 计算相似度
            similarities = cosine_similarity(query_vector, self.document_matrix).flatten()
            
            # 获取相似节点
            similar_nodes = []
            for i, similarity in enumerate(similarities):
                if similarity >= min_similarity:
                    node_id = list(self.graph.nodes)[i]
                    node_data = self.graph.nodes[node_id]
                    
                    if node_type is None or node_data.get('type') == node_type:
                        node = KnowledgeNode(
                            id=node_id,
                            type=node_data.get('type', ''),
                            name=node_data.get('name', ''),
                            description=node_data.get('description', ''),
                            properties=node_data.get('properties', {}),
                            confidence=node_data.get('confidence', 1.0)
                        )
                        similar_nodes.append((node, similarity))
                        
            # 按相似度排序
            similar_nodes.sort(key=lambda x: x[1], reverse=True)
            return [node for node, _ in similar_nodes]
            
        except Exception as e:
            logger.error(f"相似节点查找失败: {str(e)}")
            return []
            
    def reasoning(self, start_node: str, reasoning_type: str = "forward", max_depth: int = 3) -> List[str]:
        """基于图谱进行推理"""
        reasoning_steps = []
        
        try:
            if reasoning_type == "forward":
                # 前向推理：从原因推导结果
                if start_node in self.graph.nodes:
                    node_data = self.graph.nodes[start_node]
                    reasoning_steps.append(f"起始节点: {node_data.get('name', '')}")
                    
                    # 查找所有可达节点
                    for depth in range(1, max_depth + 1):
                        successors = list(nx.descendants_at_distance(self.graph, start_node, depth))
                        if successors:
                            reasoning_steps.append(f"第{depth}层推理结果: {', '.join([self.graph.nodes[s].get('name', '') for s in successors])}")
                            
            elif reasoning_type == "backward":
                # 反向推理：从结果推导原因
                if start_node in self.graph.nodes:
                    node_data = self.graph.nodes[start_node]
                    reasoning_steps.append(f"目标节点: {node_data.get('name', '')}")
                    
                    # 查找所有前驱节点
                    for depth in range(1, max_depth + 1):
                        predecessors = list(nx.ancestors_at_distance(self.graph, start_node, depth))
                        if predecessors:
                            reasoning_steps.append(f"第{depth}层原因分析: {', '.join([self.graph.nodes[p].get('name', '') for p in predecessors])}")
                            
        except Exception as e:
            logger.error(f"推理过程失败: {str(e)}")
            reasoning_steps.append(f"推理失败: {str(e)}")
            
        return reasoning_steps
        
    def get_recommendations(self, failure_mode: str, component: str = None) -> List[Dict[str, Any]]:
        """基于知识图谱生成推荐"""
        recommendations = []
        
        try:
            # 查找相关的解决方案
            solutions = []
            for node_id, node_data in self.graph.nodes(data=True):
                if node_data.get('type') == 'solution':
                    # 检查是否与失效模式相关
                    if nx.has_path(self.graph, failure_mode, node_id):
                        path_length = nx.shortest_path_length(self.graph, failure_mode, node_id)
                        solutions.append((node_id, node_data, path_length))
                        
            # 按路径长度排序（路径越短相关性越强）
            solutions.sort(key=lambda x: x[2])
            
            for node_id, node_data, path_length in solutions[:5]:  # 返回前5个推荐
                recommendation = {
                    "solution": node_data.get('name', ''),
                    "description": node_data.get('description', ''),
                    "confidence": 1.0 / (1 + path_length),
                    "path_length": path_length,
                    "evidence": []
                }
                
                # 获取路径上的证据
                try:
                    path = nx.shortest_path(self.graph, failure_mode, node_id)
                    for i in range(len(path) - 1):
                        edge_data = self.graph.get_edge_data(path[i], path[i + 1])
                        if edge_data and edge_data.get('evidence'):
                            recommendation["evidence"].extend(edge_data['evidence'])
                except:
                    pass
                    
                recommendations.append(recommendation)
                
        except Exception as e:
            logger.error(f"推荐生成失败: {str(e)}")
            
        return recommendations

# 全局知识图谱服务实例
kg_service = KnowledgeGraphService()

@app.on_event("startup")
async def startup_event():
    """启动时初始化知识图谱"""
    await asyncio.get_event_loop().run_in_executor(None, kg_service.initialize_graph)

@app.post("/query", response_model=GraphQueryResponse)
async def query_knowledge_graph(request: GraphQueryRequest):
    """查询知识图谱"""
    start_time = datetime.now()
    
    try:
        nodes = []
        relations = []
        paths = []
        recommendations = []
        reasoning = []
        
        if request.query_type == "path_search" and request.start_node and request.end_node:
            paths = kg_service.search_path(request.start_node, request.end_node, request.max_depth)
            
        elif request.query_type == "similarity" and request.keywords:
            nodes = kg_service.find_similar_nodes(
                request.keywords, 
                request.node_type, 
                request.min_similarity
            )
            
        elif request.query_type == "reasoning" and request.start_node:
            reasoning = kg_service.reasoning(request.start_node, "forward", request.max_depth)
            
        elif request.query_type == "recommendation" and request.start_node:
            recommendations = kg_service.get_recommendations(request.start_node)
            
        execution_time = (datetime.now() - start_time).total_seconds()
        
        return GraphQueryResponse(
            success=True,
            nodes=nodes,
            relations=relations,
            paths=paths,
            recommendations=recommendations,
            reasoning=reasoning,
            execution_time=execution_time
        )
        
    except Exception as e:
        logger.error(f"知识图谱查询失败: {str(e)}")
        execution_time = (datetime.now() - start_time).total_seconds()
        
        return GraphQueryResponse(
            success=False,
            execution_time=execution_time
        )

@app.get("/nodes")
async def get_nodes(node_type: str = None):
    """获取所有节点"""
    try:
        nodes = []
        for node_id, node_data in kg_service.graph.nodes(data=True):
            if node_type is None or node_data.get('type') == node_type:
                node = KnowledgeNode(
                    id=node_id,
                    type=node_data.get('type', ''),
                    name=node_data.get('name', ''),
                    description=node_data.get('description', ''),
                    properties=node_data.get('properties', {}),
                    confidence=node_data.get('confidence', 1.0)
                )
                nodes.append(node)
                
        return {"success": True, "nodes": nodes}
        
    except Exception as e:
        logger.error(f"获取节点失败: {str(e)}")
        return {"success": False, "error": str(e)}

@app.get("/relations")
async def get_relations():
    """获取所有关系"""
    try:
        relations = []
        for source, target, edge_data in kg_service.graph.edges(data=True):
            relation = KnowledgeRelation(
                source_id=source,
                target_id=target,
                relation_type=edge_data.get('relation_type', ''),
                strength=edge_data.get('strength', 1.0),
                evidence=edge_data.get('evidence', [])
            )
            relations.append(relation)
            
        return {"success": True, "relations": relations}
        
    except Exception as e:
        logger.error(f"获取关系失败: {str(e)}")
        return {"success": False, "error": str(e)}

@app.get("/statistics")
async def get_statistics():
    """获取图谱统计信息"""
    try:
        stats = {
            "node_count": kg_service.graph.number_of_nodes(),
            "edge_count": kg_service.graph.number_of_edges(),
            "node_types": {},
            "relation_types": {},
            "density": nx.density(kg_service.graph),
            "is_connected": nx.is_weakly_connected(kg_service.graph)
        }
        
        # 统计节点类型
        for node_data in kg_service.graph.nodes.values():
            node_type = node_data.get('type', 'unknown')
            stats["node_types"][node_type] = stats["node_types"].get(node_type, 0) + 1
            
        # 统计关系类型
        for edge_data in kg_service.graph.edges.values():
            relation_type = edge_data.get('relation_type', 'unknown')
            stats["relation_types"][relation_type] = stats["relation_types"].get(relation_type, 0) + 1
            
        return {"success": True, "statistics": stats}
        
    except Exception as e:
        logger.error(f"获取统计信息失败: {str(e)}")
        return {"success": False, "error": str(e)}

@app.post("/add_node")
async def add_node(node: KnowledgeNode):
    """添加新节点"""
    try:
        kg_service._add_node(
            node.id,
            node.type,
            node.name,
            node.description
        )
        
        # 更新属性
        kg_service.graph.nodes[node.id].update({
            'properties': node.properties,
            'confidence': node.confidence
        })
        
        return {"success": True, "message": "节点添加成功"}
        
    except Exception as e:
        logger.error(f"添加节点失败: {str(e)}")
        return {"success": False, "error": str(e)}

@app.post("/add_relation")
async def add_relation(relation: KnowledgeRelation):
    """添加新关系"""
    try:
        kg_service.add_relation(
            relation.source_id,
            relation.target_id,
            relation.relation_type,
            relation.strength,
            relation.evidence
        )
        
        return {"success": True, "message": "关系添加成功"}
        
    except Exception as e:
        logger.error(f"添加关系失败: {str(e)}")
        return {"success": False, "error": str(e)}

@app.get("/health")
async def health_check():
    """健康检查"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "graph_stats": {
            "nodes": kg_service.graph.number_of_nodes(),
            "edges": kg_service.graph.number_of_edges()
        }
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8004,
        reload=True,
        log_level="info"
    )