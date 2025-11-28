import React, { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Box, Sphere, Plane, Grid, Line } from '@react-three/drei'
import { Button, Card, Space, Select, Slider, Switch, Tooltip, message } from 'antd'
import { 
  ZoomInOutlined, 
  ZoomOutOutlined, 
  ReloadOutlined, 
  DownloadOutlined,
  EyeOutlined,
  SettingOutlined 
} from '@ant-design/icons'
import * as THREE from 'three'

interface VisualizationData {
  type: 'failure_model' | 'component' | 'assembly' | 'fracture_surface'
  modelUrl?: string
  geometry?: {
    vertices: number[][]
    faces: number[][]
    normals?: number[][]
  }
  metadata?: {
    name: string
    description: string
    scale: number
    // allow flexible position arrays during incremental fixes
    position?: number[]
    color: string
  }
  annotations?: Array<{
    id: string
    position: number[]
    label: string
    type: 'failure_point' | 'measurement' | 'annotation'
  }>
}

interface ThreeDVisualizationProps {
  data: VisualizationData
  width?: number
  height?: number
  onAnnotationAdd?: (position: number[], label: string) => void
  onMeasurement?: (points: number[][]) => void
}

// 可交互的3D模型组件
function InteractiveModel({ data, onAnnotationClick }: { 
  data: VisualizationData
  onAnnotationClick: (annotation: any) => void 
}) {
  const meshRef = useRef<any>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (meshRef.current && hovered) {
      meshRef.current.rotation.y += 0.01
    }
  })

  const handleGeometry = () => {
    if (data.geometry) {
      const geometry = new THREE.BufferGeometry()
      const vertices = new Float32Array(data.geometry.vertices.flat())
      const faces = new Uint16Array(data.geometry.faces.flat())
      
      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
      geometry.setIndex(new THREE.BufferAttribute(faces, 1))
      
      if (data.geometry.normals) {
        const normals = new Float32Array(data.geometry.normals.flat())
        geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
      } else {
        geometry.computeVertexNormals()
      }
      
      return geometry
    }
    return new THREE.BoxGeometry(1, 1, 1)
  }

  return (
    <mesh
      ref={meshRef}
      geometry={handleGeometry()}
      // ensure position is an array of 3 numbers at runtime
      position={(data.metadata?.position && data.metadata.position.length >= 3) ? [data.metadata.position[0], data.metadata.position[1], data.metadata.position[2]] : [0,0,0]}
      scale={data.metadata?.scale || 1}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <meshStandardMaterial 
        // cast to any to avoid strict material prop typing during incremental fixes
        {...({ color: hovered ? '#ff6b6b' : (data.metadata?.color || '#4CAF50'), metalness: 0.3, roughness: 0.4 } as any)}
      />
    </mesh>
  )
}

// 注释组件
function Annotation({ annotation, onClick }: { 
  annotation: any
  onClick: (annotation: any) => void 
}) {
  return (
    <group position={annotation.position}>
      <Sphere args={[0.05, 16, 16]}>
        <meshStandardMaterial {...({ color: annotation.type === 'failure_point' ? '#ff4444' : '#4444ff' } as any)} />
      </Sphere>
      <Line
        points={[annotation.position, [annotation.position[0], annotation.position[1] + 0.5, annotation.position[2]]]}
        color="yellow"
        lineWidth={2}
      />
    </group>
  )
}

// 测量工具组件
function MeasurementTool({ points, onComplete }: {
  points: [number, number, number][]
  onComplete: (distance: number) => void
}) {
  if (points.length < 2) return null

  const distance = Math.sqrt(
    Math.pow(points[1][0] - points[0][0], 2) +
    Math.pow(points[1][1] - points[0][1], 2) +
    Math.pow(points[1][2] - points[0][2], 2)
  )

  useEffect(() => {
    onComplete(distance)
  }, [distance, onComplete])

  return (
    <>
      <Line points={points} color="green" lineWidth={2} />
      <group position={[
        (points[0][0] + points[1][0]) / 2,
        (points[0][1] + points[1][1]) / 2 + 0.2,
        (points[0][2] + points[1][2]) / 2
      ]}>
        <mesh>
          <planeGeometry args={[0.5, 0.2]} />
          <meshBasicMaterial {...({ color: 'white' } as any)} />
        </mesh>
      </group>
    </>
  )
}

// 场景控制器
function SceneController({ data, measurementPoints, onMeasurementComplete }: {
  data: VisualizationData
  measurementPoints: [number, number, number][]
  onMeasurementComplete: (distance: number) => void
}) {
  const { camera } = useThree()
  
  return (
    <>
      {/* 环境光 */}
      <ambientLight intensity={0.6} />
      
      {/* 方向光 */}
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
      
      {/* 点光源 */}
      <pointLight position={[-10, -10, -5]} intensity={0.5} />
      
      {/* 网格地面 */}
      <Grid 
        args={[20, 20]} 
        cellSize={1} 
        cellThickness={0.5} 
        cellColor="#6b7280" 
        sectionSize={5} 
        sectionThickness={1} 
        sectionColor="#374151"
        fadeDistance={30}
        fadeStrength={1}
        followCamera={false}
      />
      
      {/* 主模型 */}
      <InteractiveModel data={data} onAnnotationClick={() => {}} />
      
      {/* 注释 */}
      {data.annotations?.map((annotation) => (
        <Annotation 
          key={annotation.id} 
          annotation={annotation} 
          onClick={() => {}}
        />
      ))}
      
      {/* 测量工具 */}
      {measurementPoints.length >= 2 && (
        <MeasurementTool 
          points={measurementPoints} 
          onComplete={onMeasurementComplete}
        />
      )}
      
      {/* 轨道控制器 */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={1}
        maxDistance={50}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  )
}

const ThreeDVisualization: React.FC<ThreeDVisualizationProps> = ({
  data,
  width = 800,
  height = 600,
  onAnnotationAdd,
  onMeasurement
}) => {
  const [renderMode, setRenderMode] = useState<'solid' | 'wireframe' | 'points'>('solid')
  const [showGrid, setShowGrid] = useState(true)
  const [autoRotate, setAutoRotate] = useState(false)
  const [measurementMode, setMeasurementMode] = useState(false)
  const [measurementPoints, setMeasurementPoints] = useState<[number, number, number][]>([])
  const [currentMeasurement, setCurrentMeasurement] = useState<number | null>(null)

  const handleCanvasClick = (event: any) => {
    if (!measurementMode) return
    
    const point = event.point
    const newPoint: [number, number, number] = [point.x, point.y, point.z]
    
    if (measurementPoints.length < 2) {
      setMeasurementPoints([...measurementPoints, newPoint])
    } else {
      setMeasurementPoints([newPoint])
    }
  }

  const handleMeasurementComplete = (distance: number) => {
    setCurrentMeasurement(distance)
    if (onMeasurement) {
      onMeasurement(measurementPoints)
    }
  }

  const handleReset = () => {
    setMeasurementPoints([])
    setCurrentMeasurement(null)
    setMeasurementMode(false)
  }

  const handleExport = () => {
    // 导出3D场景为图片或模型
    message.success('导出功能开发中...')
  }

  return (
    <Card 
      title="3D可视化分析" 
      extra={
        <Space>
          <Tooltip title="设置">
            <Button icon={<SettingOutlined />} size="small" />
          </Tooltip>
          <Tooltip title="导出">
            <Button icon={<DownloadOutlined />} size="small" onClick={handleExport} />
          </Tooltip>
        </Space>
      }
    >
      {/* 控制面板 */}
      <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
        <Space wrap>
          <span>渲染模式:</span>
          <Select 
            value={renderMode} 
            onChange={setRenderMode} 
            size="small"
            style={{ width: 100 }}
          >
            <Select.Option value="solid">实体</Select.Option>
            <Select.Option value="wireframe">线框</Select.Option>
            <Select.Option value="points">点云</Select.Option>
          </Select>
          
          <span>显示网格:</span>
          <Switch 
            checked={showGrid} 
            onChange={setShowGrid} 
            size="small"
          />
          
          <span>自动旋转:</span>
          <Switch 
            checked={autoRotate} 
            onChange={setAutoRotate} 
            size="small"
          />
          
          <span>测量工具:</span>
          <Switch 
            checked={measurementMode} 
            onChange={setMeasurementMode} 
            size="small"
          />
          
          <Button size="small" onClick={handleReset}>
            重置
          </Button>
        </Space>
        
        {currentMeasurement && (
          <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
            测量距离: {currentMeasurement.toFixed(2)} 单位
          </div>
        )}
      </div>

      {/* 3D画布 */}
      <div style={{ border: '1px solid #d9d9d9', borderRadius: 6, overflow: 'hidden' }}>
        <Canvas
          camera={{ position: [5, 5, 5], fov: 50 }}
          style={{ width, height }}
          onClick={handleCanvasClick}
        >
          <SceneController 
            data={data} 
            measurementPoints={measurementPoints}
            onMeasurementComplete={handleMeasurementComplete}
          />
        </Canvas>
      </div>

      {/* 信息面板 */}
      <div style={{ marginTop: 16, padding: 12, background: '#fafafa', borderRadius: 6 }}>
        <h4>模型信息</h4>
        <p><strong>名称:</strong> {data.metadata?.name || '未知模型'}</p>
        <p><strong>类型:</strong> {data.type}</p>
        <p><strong>描述:</strong> {data.metadata?.description || '暂无描述'}</p>
        {data.annotations && (
          <p><strong>注释数量:</strong> {data.annotations.length}</p>
        )}
      </div>
    </Card>
  )
}

export default ThreeDVisualization