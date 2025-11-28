import React, { useEffect, useRef, useState } from 'react';
import { Card, Select, Button, Space, Row, Col, Typography, Spin } from 'antd';
import { ReloadOutlined, DownloadOutlined, FullscreenOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import * as THREE from 'three';
import { dashboardApi } from '../services/api';

const { Option } = Select;
const { Title, Text } = Typography;

interface VisualizationPanelProps {
  data?: any;
  type?: '2d' | '3d' | 'chart';
  height?: number;
}

const VisualizationPanel: React.FC<VisualizationPanelProps> = ({
  data,
  type = 'chart',
  height = 400,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const threeRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState('line');
  const [chart, setChart] = useState<any | null>(null);
  const [scene, setScene] = useState<any | null>(null);
  const [renderer, setRenderer] = useState<any | null>(null);

  // 初始化2D图表
  const initChart = () => {
    if (chartRef.current && !chart) {
      const chartInstance = echarts.init(chartRef.current);
      setChart(chartInstance);
      
      // 响应式处理
      const resizeHandler = () => {
        chartInstance.resize();
      };
      window.addEventListener('resize', resizeHandler);
      
      return () => {
        window.removeEventListener('resize', resizeHandler);
        chartInstance.dispose();
      };
    }
  };

  // 初始化3D场景
  const init3DScene = () => {
    if (threeRef.current && !scene) {
      const width = threeRef.current.clientWidth;
      const height = threeRef.current.clientHeight;
      
      // 创建场景
      const newScene = new THREE.Scene();
      newScene.background = new THREE.Color(0xf0f0f0);
      setScene(newScene);
      
      // 创建相机
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.set(5, 5, 5);
      camera.lookAt(0, 0, 0);
      
      // 创建渲染器
      const newRenderer = new THREE.WebGLRenderer({ antialias: true });
      newRenderer.setSize(width, height);
      newRenderer.shadowMap.enabled = true;
      threeRef.current.appendChild(newRenderer.domElement);
      setRenderer(newRenderer);
      
      // 添加光源
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      newScene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
      directionalLight.position.set(5, 10, 5);
      directionalLight.castShadow = true;
      newScene.add(directionalLight);
      
      // 添加网格
      const gridHelper = new THREE.GridHelper(10, 10);
      newScene.add(gridHelper);
      
      // 添加坐标轴
      const axesHelper = new THREE.AxesHelper(5);
      newScene.add(axesHelper);
      
      // 渲染循环
      const animate = () => {
        requestAnimationFrame(animate);
        newRenderer.render(newScene, camera);
      };
      animate();
    }
  };

  // 更新图表数据
  const updateChart = () => {
    if (!chart || !data) return;
    
    let option: any = {};
    
    switch (chartType) {
      case 'line':
        option = {
          title: {
            text: '趋势分析',
            left: 'center'
          },
          tooltip: {
            trigger: 'axis'
          },
          xAxis: {
            type: 'category',
            data: data.categories || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            data: data.values || [120, 200, 150, 80, 70, 110, 130],
            type: 'line',
            smooth: true
          }]
        };
        break;
        
      case 'bar':
        option = {
          title: {
            text: '柱状分析',
            left: 'center'
          },
          tooltip: {
            trigger: 'axis'
          },
          xAxis: {
            type: 'category',
            data: data.categories || ['A', 'B', 'C', 'D', 'E']
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            data: data.values || [120, 200, 150, 80, 70],
            type: 'bar'
          }]
        };
        break;
        
      case 'pie':
        option = {
          title: {
            text: '分布分析',
            left: 'center'
          },
          tooltip: {
            trigger: 'item'
          },
          series: [{
            type: 'pie',
            radius: '50%',
            data: data.pieData || [
              { value: 1048, name: 'Category A' },
              { value: 735, name: 'Category B' },
              { value: 580, name: 'Category C' },
              { value: 484, name: 'Category D' },
              { value: 300, name: 'Category E' }
            ]
          }]
        };
        break;
        
      case 'scatter':
        option = {
          title: {
            text: '散点分析',
            left: 'center'
          },
          xAxis: {
            type: 'value'
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            type: 'scatter',
            data: data.scatterData || [[10, 20], [15, 25], [20, 15], [25, 30], [30, 25]]
          }]
        };
        break;
        
      case 'heatmap':
        option = {
          title: {
            text: '热力分析',
            left: 'center'
          },
          xAxis: {
            type: 'category',
            data: data.xAxis || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
          },
          yAxis: {
            type: 'category',
            data: data.yAxis || ['1', '2', '3', '4', '5']
          },
          visualMap: {
            min: 0,
            max: 10,
            calculable: true,
            orient: 'horizontal',
            left: 'center',
            bottom: '15%'
          },
          series: [{
            type: 'heatmap',
            data: data.heatmapData || [
              [0, 0, 5], [0, 1, 1], [0, 2, 0], [0, 3, 0], [0, 4, 0], [0, 5, 0], [0, 6, 0],
              [1, 0, 9], [1, 1, 6], [1, 2, 3], [1, 3, 0], [1, 4, 0], [1, 5, 0], [1, 6, 0],
              [2, 0, 3], [2, 1, 5], [2, 2, 8], [2, 3, 0], [2, 4, 0], [2, 5, 0], [2, 6, 0]
            ]
          }]
        };
        break;
    }
    
    chart.setOption(option);
  };

  // 添加3D对象
  const add3DObject = (type: string) => {
    if (!scene) return;
    
    let geometry: any;
    let material: any = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    
    switch (type) {
      case 'cube':
        geometry = new THREE.BoxGeometry(1, 1, 1);
        break;
      case 'sphere':
        geometry = new THREE.SphereGeometry(0.5, 32, 32);
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
        break;
      case 'cone':
        geometry = new THREE.ConeGeometry(0.5, 1, 32);
        break;
      default:
        geometry = new THREE.BoxGeometry(1, 1, 1);
    }
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      Math.random() * 4 - 2,
      0.5,
      Math.random() * 4 - 2
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
  };

  // 清空3D场景
  const clear3DScene = () => {
    if (!scene) return;
    
    const objectsToRemove: any[] = [];
      scene.traverse((child: any) => {
      if (child instanceof THREE.Mesh) {
        objectsToRemove.push(child);
      }
    });
    
    objectsToRemove.forEach((object) => {
      scene?.remove(object);
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (object.material instanceof THREE.Material) {
          object.material.dispose();
        }
      }
    });
  };

  // 导出图表
  const exportChart = () => {
    if (chart) {
      const url = chart.getDataURL({
        type: 'png',
        pixelRatio: 2,
        backgroundColor: '#fff'
      });
      
      const link = document.createElement('a');
      link.download = `chart_${Date.now()}.png`;
      link.href = url;
      link.click();
    }
  };

  // 全屏显示
  const toggleFullscreen = () => {
    const element = type === '3d' ? threeRef.current : chartRef.current;
    if (element) {
      if (!document.fullscreenElement) {
        element.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  };

  // 刷新数据
  const refreshData = async () => {
    setLoading(true);
    try {
      // 这里可以调用API获取最新数据
      // const response = await dashboardApi.getRealTimeMetrics();
      // setData(response.data);
      updateChart();
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (type === 'chart') {
      initChart();
    } else if (type === '3d') {
      init3DScene();
    }
    
    return () => {
      if (chart) {
        chart.dispose();
      }
      if (renderer) {
        renderer.dispose();
      }
    };
  }, [type]);

  useEffect(() => {
    if (type === 'chart' && chart) {
      updateChart();
    }
  }, [chart, chartType, data, type]);

  return (
    <Card
      title={
        <Space>
          <Title level={4} style={{ margin: 0 }}>
            {type === '3d' ? '3D可视化' : '数据可视化'}
          </Title>
          <Button
            type="text"
            icon={<ReloadOutlined />}
            onClick={refreshData}
            loading={loading}
          />
        </Space>
      }
      extra={
        <Space>
          {type === 'chart' && (
            <Select
              value={chartType}
              onChange={setChartType}
              style={{ width: 120 }}
            >
              <Option value="line">折线图</Option>
              <Option value="bar">柱状图</Option>
              <Option value="pie">饼图</Option>
              <Option value="scatter">散点图</Option>
              <Option value="heatmap">热力图</Option>
            </Select>
          )}
          {type === '3d' && (
            <Space>
              <Button onClick={() => add3DObject('cube')}>立方体</Button>
              <Button onClick={() => add3DObject('sphere')}>球体</Button>
              <Button onClick={() => add3DObject('cylinder')}>圆柱</Button>
              <Button onClick={() => add3DObject('cone')}>圆锥</Button>
              <Button onClick={clear3DScene}>清空</Button>
            </Space>
          )}
          <Button
            type="text"
            icon={<DownloadOutlined />}
            onClick={type === 'chart' ? exportChart : undefined}
          />
          <Button
            type="text"
            icon={<FullscreenOutlined />}
            onClick={toggleFullscreen}
          />
        </Space>
      }
    >
      <Spin spinning={loading}>
        <div style={{ height, position: 'relative' }}>
          {type === 'chart' && (
            <div
              ref={chartRef}
              style={{ width: '100%', height: '100%' }}
            />
          )}
          {type === '3d' && (
            <div
              ref={threeRef}
              style={{ width: '100%', height: '100%' }}
            />
          )}
        </div>
      </Spin>
    </Card>
  );
};

export default VisualizationPanel;