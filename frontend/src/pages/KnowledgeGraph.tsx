import React, { useState, useEffect, useRef } from 'react'
import {
  Card,
  Row,
  Col,
  Input,
  Select,
  Button,
  Space,
  Tag,
  Table,
  Modal,
  Form,
  List,
  Typography,
  Tabs,
  Tooltip,
  Badge,
  Statistic,
  Spin,
  message,
  Tree,
  Collapse,
  Descriptions
} from 'antd'
import {
  SearchOutlined,
  NodeIndexOutlined,
  BranchesOutlined,
  BulbOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  ShareAltOutlined,
  DownloadOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import * as d3 from 'd3'
import type { DataNode } from 'antd/es/tree'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text, Paragraph } = Typography
const { Search } = Input
const { TabPane } = Tabs
const { Panel } = Collapse
const { TextArea } = Input

interface KnowledgeNode {
  id: string
  type: string
  name: string
  description: string
  properties: Record<string, any>
  confidence: number
}

interface KnowledgeRelation {
  source_id: string
  target_id: string
  relation_type: string
  strength: number
  evidence: string[]
}

interface GraphStatistics {
  node_count: number
  edge_count: number
  node_types: Record<string, number>
  relation_types: Record<string, number>
  density: number
  is_connected: boolean
}

const KnowledgeGraph: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [nodes, setNodes] = useState<KnowledgeNode[]>([])
  const [relations, setRelations] = useState<KnowledgeRelation[]>([])
  const [statistics, setStatistics] = useState<GraphStatistics | null>(null)
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null)
  const [searchParams, setSearchParams] = useState({
    keywords: '',
    nodeType: '',
    minSimilarity: 0.3
  })
  const [queryResults, setQueryResults] = useState<any>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalType, setModalType] = useState<'node' | 'relation'>('node')
  const [form] = Form.useForm()
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    loadGraphData()
  }, [])

  const loadGraphData = async () => {
    setLoading(true)
    try {
      const [nodesRes, relationsRes, statsRes] = await Promise.all([
        fetch('/api/knowledge-graph/nodes'),
        fetch('/api/knowledge-graph/relations'),
        fetch('/api/knowledge-graph/statistics')
      ])

      if (nodesRes.ok && relationsRes.ok && statsRes.ok) {
        const nodesData = await nodesRes.json()
        const relationsData = await relationsRes.json()
        const statsData = await statsRes.json()

        if (nodesData.success) setNodes(nodesData.nodes)
        if (relationsData.success) setRelations(relationsData.relations)
        if (statsData.success) setStatistics(statsData.statistics)
      }
    } catch (error) {
      message.error('加载知识图谱数据失败')
    } finally {
      setLoading(false)
    }
  }

  const renderGraph = () => {
    if (!svgRef.current || nodes.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = svgRef.current.clientWidth
    const height = 600

    const g = svg.append('g')
      .attr('transform', 'translate(50,50)')

    // 添加缩放功能
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event: any) => {
        g.attr('transform', event.transform)
      })
    svg.call(zoom)

    // 创建力导向图
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(relations)
        .id((d: any) => d.id)
        .distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2 - 50, height / 2 - 50))
      .force('collision', d3.forceCollide().radius(30))

    // 绘制连线
    const link = g.append('g')
      .selectAll('line')
      .data(relations)
      .enter().append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d: any) => Math.sqrt(d.strength * 5))

    // 绘制节点
    const node = g.append('g')
      .selectAll('circle')
      .data(nodes)
      .enter().append('circle')
      .attr('r', 15)
      .attr('fill', (d: any) => getNodeColor(d.type))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any)

    // 添加节点标签
    const text = g.append('g')
      .selectAll('text')
      .data(nodes)
      .enter().append('text')
      .text((d: any) => d.name)
      .attr('font-size', 12)
      .attr('dx', 20)
      .attr('dy', 5)

    // 添加交互
    node.on('click', (event: any, d: any) => {
      setSelectedNode(d)
    })

    // 更新位置
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y)

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y)

      text
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y)
    })

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }

    function dragged(event: any, d: any) {
      d.fx = event.x
      d.fy = event.y
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0)
      d.fx = null
      d.fy = null
    }
  }

  const getNodeColor = (type: string): string => {
    const colors: Record<string, string> = {
      failure_mode: '#ff4d4f',
      component: '#1890ff',
      material: '#52c41a',
      cause: '#fa8c16',
      effect: '#722ed1',
      solution: '#13c2c2'
    }
    return colors[type] || '#d9d9d9'
  }

  const handleSearch = async () => {
    if (!searchParams.keywords) {
      message.warning('请输入搜索关键词')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/knowledge-graph/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query_type: 'similarity',
          keywords: searchParams.keywords.split(' '),
          node_type: searchParams.nodeType,
          min_similarity: searchParams.minSimilarity
        })
      })

      const data = await response.json()
      if (data.success) {
        setQueryResults(data)
        message.success('查询完成')
      } else {
        message.error('查询失败')
      }
    } catch (error) {
      message.error('查询失败')
    } finally {
      setLoading(false)
    }
  }

  const handleReasoning = async (nodeId: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/knowledge-graph/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query_type: 'reasoning',
          start_node: nodeId,
          max_depth: 3
        })
      })

      const data = await response.json()
      if (data.success) {
        Modal.info({
          title: '推理结果',
          content: (
            <div>
              {data.reasoning.map((step: string, index: number) => (
                <p key={index}>{step}</p>
              ))}
            </div>
          ),
          width: 600
        })
      }
    } catch (error) {
      message.error('推理失败')
    } finally {
      setLoading(false)
    }
  }

  const handleRecommendation = async (nodeId: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/knowledge-graph/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query_type: 'recommendation',
          start_node: nodeId
        })
      })

      const data = await response.json()
      if (data.success) {
        Modal.info({
          title: '推荐解决方案',
          content: (
            <List
              dataSource={data.recommendations}
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.solution}
                    description={
                      <div>
                        <p>{item.description}</p>
                        <p>置信度: {(item.confidence * 100).toFixed(1)}%</p>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          ),
          width: 800
        })
      }
    } catch (error) {
      message.error('推荐失败')
    } finally {
      setLoading(false)
    }
  }

  const nodeColumns: ColumnsType<KnowledgeNode> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 150
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Tag color={getNodeColor(record.type)}>{record.type}</Tag>
          {text}
        </Space>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '置信度',
      dataIndex: 'confidence',
      key: 'confidence',
      render: (value) => `${(value * 100).toFixed(1)}%`,
      width: 100
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => setSelectedNode(record)}
            />
          </Tooltip>
          <Tooltip title="推理分析">
            <Button
              type="text"
              icon={<BulbOutlined />}
              onClick={() => handleReasoning(record.id)}
            />
          </Tooltip>
          <Tooltip title="推荐方案">
            <Button
              type="text"
              icon={<BranchesOutlined />}
              onClick={() => handleRecommendation(record.id)}
            />
          </Tooltip>
        </Space>
      )
    }
  ]

  useEffect(() => {
    if (nodes.length > 0) {
      renderGraph()
    }
  }, [nodes, relations])

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <NodeIndexOutlined /> 知识图谱
      </Title>

      {/* 统计信息 */}
      {statistics && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="节点总数"
                value={statistics.node_count}
                prefix={<NodeIndexOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="关系总数"
                value={statistics.edge_count}
                prefix={<ShareAltOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="图谱密度"
                value={statistics.density}
                precision={3}
                prefix={<BranchesOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="连通性"
                value={statistics.is_connected ? '连通' : '非连通'}
                valueStyle={{ color: statistics.is_connected ? '#3f8600' : '#cf1322' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Row gutter={16}>
        {/* 左侧：搜索和控制面板 */}
        <Col span={6}>
          <Card title="搜索与查询" style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Search
                placeholder="输入关键词搜索"
                value={searchParams.keywords}
                onChange={(e) => setSearchParams({ ...searchParams, keywords: e.target.value })}
                onSearch={handleSearch}
              />
              <Select
                placeholder="选择节点类型"
                value={searchParams.nodeType}
                onChange={(value) => setSearchParams({ ...searchParams, nodeType: value })}
                style={{ width: '100%' }}
                allowClear
              >
                <Select.Option value="failure_mode">失效模式</Select.Option>
                <Select.Option value="component">组件</Select.Option>
                <Select.Option value="material">材料</Select.Option>
                <Select.Option value="cause">原因</Select.Option>
                <Select.Option value="effect">影响</Select.Option>
                <Select.Option value="solution">解决方案</Select.Option>
              </Select>
              <Button type="primary" onClick={handleSearch} loading={loading} block>
                <SearchOutlined /> 搜索
              </Button>
            </Space>
          </Card>

          <Card title="节点类型分布">
            {statistics && Object.entries(statistics.node_types).map(([type, count]) => (
              <div key={type} style={{ marginBottom: 8 }}>
                <Tag color={getNodeColor(type)}>{type}</Tag>
                <span>{count}</span>
              </div>
            ))}
          </Card>
        </Col>

        {/* 右侧：图谱可视化 */}
        <Col span={18}>
          <Card
            title="知识图谱可视化"
            extra={
              <Space>
                <Button icon={<ReloadOutlined />} onClick={loadGraphData}>
                  刷新
                </Button>
                <Button icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
                  添加节点
                </Button>
              </Space>
            }
          >
            <Spin spinning={loading}>
              <svg
                ref={svgRef}
                width="100%"
                height={600}
                style={{ border: '1px solid #d9d9d9', borderRadius: 4 }}
              />
            </Spin>
          </Card>
        </Col>
      </Row>

      {/* 节点列表 */}
      <Card title="节点列表" style={{ marginTop: 16 }}>
        <Table
          columns={nodeColumns}
          dataSource={nodes}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* 节点详情弹窗 */}
      {selectedNode && (
        <Modal
          title="节点详情"
          open={!!selectedNode}
          onCancel={() => setSelectedNode(null)}
          footer={null}
          width={800}
        >
          <Descriptions column={2} bordered>
            <Descriptions.Item label="ID">{selectedNode.id}</Descriptions.Item>
            <Descriptions.Item label="类型">
              <Tag color={getNodeColor(selectedNode.type)}>{selectedNode.type}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="名称" span={2}>{selectedNode.name}</Descriptions.Item>
            <Descriptions.Item label="描述" span={2}>{selectedNode.description}</Descriptions.Item>
            <Descriptions.Item label="置信度">
              {(selectedNode.confidence * 100).toFixed(1)}%
            </Descriptions.Item>
          </Descriptions>

          {Object.keys(selectedNode.properties).length > 0 && (
            <div style={{ marginTop: 16 }}>
              <Title level={5}>属性信息</Title>
              <Descriptions column={1} bordered>
                {Object.entries(selectedNode.properties).map(([key, value]) => (
                  <Descriptions.Item key={key} label={key}>
                    {String(value)}
                  </Descriptions.Item>
                ))}
              </Descriptions>
            </div>
          )}
        </Modal>
      )}

      {/* 添加节点弹窗 */}
      <Modal
        title="添加节点"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="id"
            label="节点ID"
            rules={[{ required: true, message: '请输入节点ID' }]}
          >
            <Input placeholder="唯一标识符" />
          </Form.Item>
          <Form.Item
            name="type"
            label="节点类型"
            rules={[{ required: true, message: '请选择节点类型' }]}
          >
            <Select placeholder="选择节点类型">
              <Select.Option value="failure_mode">失效模式</Select.Option>
              <Select.Option value="component">组件</Select.Option>
              <Select.Option value="material">材料</Select.Option>
              <Select.Option value="cause">原因</Select.Option>
              <Select.Option value="effect">影响</Select.Option>
              <Select.Option value="solution">解决方案</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="name"
            label="节点名称"
            rules={[{ required: true, message: '请输入节点名称' }]}
          >
            <Input placeholder="节点名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="节点描述"
          >
            <TextArea rows={4} placeholder="节点描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

// Descriptions imported from 'antd'

export default KnowledgeGraph