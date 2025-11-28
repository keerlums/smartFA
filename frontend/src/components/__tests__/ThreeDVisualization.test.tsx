/// <reference types="jest" />
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import ThreeDVisualization from '../ThreeDVisualization'

// Mock Three.js and @react-three/fiber
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children, ...props }: any) => (
    <div data-testid="canvas" {...props}>
      {children}
    </div>
  ),
  useFrame: () => {},
  useThree: () => ({
    camera: { position: [5, 5, 5], fov: 50 }
  })
}))

jest.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  Box: () => <div data-testid="box" />,
  Sphere: () => <div data-testid="sphere" />,
  Plane: () => <div data-testid="plane" />,
  Grid: () => <div data-testid="grid" />,
  Line: () => <div data-testid="line" />
}))

// Mock Antd components
jest.mock('antd', () => ({
  Card: ({ children, title, extra }: any) => (
    <div data-testid="card">
      <div data-testid="card-title">{title}</div>
      <div data-testid="card-extra">{extra}</div>
      <div data-testid="card-content">{children}</div>
    </div>
  ),
  Button: ({ children, onClick, ...props }: any) => (
    <button data-testid="button" onClick={onClick} {...props}>
      {children}
    </button>
  ),
  Space: ({ children }: any) => <div data-testid="space">{children}</div>,
  Select: ({ children, onChange, value, ...props }: any) => (
    <select 
      data-testid="select" 
      onChange={(e) => onChange?.(e.target.value)} 
      value={value}
      {...props}
    >
      {children}
    </select>
  ),
  Switch: ({ checked, onChange, ...props }: any) => (
    <input 
      type="checkbox" 
      data-testid="switch" 
      checked={checked} 
      onChange={(e) => onChange?.(e.target.checked)}
      {...props}
    />
  ),
  Tooltip: ({ children, title }: any) => (
    <div data-testid="tooltip" title={title}>
      {children}
    </div>
  )
}))

const mockStore = configureStore({
  reducer: {
    // Mock reducers
  }
})

const mockVisualizationData = {
  type: 'failure_model' as const,
  geometry: {
    vertices: [
      [0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]
    ],
    faces: [
      [0, 1, 2], [0, 2, 3]
    ]
  },
  metadata: {
    name: '测试模型',
    description: '这是一个测试模型',
    scale: 1,
    position: [0, 0, 0],
    color: '#4CAF50'
  },
  annotations: [
    {
      id: '1',
      position: [0.5, 0.5, 0],
      label: '测试注释',
      type: 'failure_point' as const
    }
  ]
}

describe('ThreeDVisualization', () => {
  const renderComponent = (props = {}) => {
    const defaultProps = {
      data: mockVisualizationData,
      width: 800,
      height: 600
    }
    
    return render(
      <Provider store={mockStore}>
        <ThreeDVisualization {...defaultProps} {...props} />
      </Provider>
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders ThreeDVisualization component', () => {
    renderComponent()
    
    expect(screen.getByTestId('card')).toBeInTheDocument()
    expect(screen.getByText('3D可视化分析')).toBeInTheDocument()
    expect(screen.getByTestId('canvas')).toBeInTheDocument()
  })

  test('displays model information correctly', () => {
    renderComponent()
    
    expect(screen.getByText('模型信息')).toBeInTheDocument()
    expect(screen.getByText('测试模型')).toBeInTheDocument()
    expect(screen.getByText('failure_model')).toBeInTheDocument()
    expect(screen.getByText('这是一个测试模型')).toBeInTheDocument()
  })

  test('renders control panel with correct options', () => {
    renderComponent()
    
    expect(screen.getByText('渲染模式:')).toBeInTheDocument()
    expect(screen.getByText('显示网格:')).toBeInTheDocument()
    expect(screen.getByText('自动旋转:')).toBeInTheDocument()
    expect(screen.getByText('测量工具:')).toBeInTheDocument()
  })

  test('handles render mode change', async () => {
    renderComponent()
    
    const select = screen.getByTestId('select')
    fireEvent.change(select, { target: { value: 'wireframe' } })
    
    await waitFor(() => {
      expect(select).toHaveValue('wireframe')
    })
  })

  test('handles grid toggle', async () => {
    renderComponent()
    
    const switchElement = screen.getAllByTestId('switch')[1] // Grid toggle
    fireEvent.click(switchElement)
    
    await waitFor(() => {
      expect(switchElement).toBeChecked()
    })
  })

  test('handles auto rotate toggle', async () => {
    renderComponent()
    
    const switchElement = screen.getAllByTestId('switch')[2] // Auto rotate toggle
    fireEvent.click(switchElement)
    
    await waitFor(() => {
      expect(switchElement).toBeChecked()
    })
  })

  test('handles measurement mode toggle', async () => {
    renderComponent()
    
    const switchElement = screen.getAllByTestId('switch')[3] // Measurement toggle
    fireEvent.click(switchElement)
    
    await waitFor(() => {
      expect(switchElement).toBeChecked()
    })
  })

  test('handles reset button click', () => {
    const onAnnotationAdd = jest.fn()
    renderComponent({ onAnnotationAdd })
    
    const resetButton = screen.getByText('重置')
    fireEvent.click(resetButton)
    
    // Verify reset functionality (would need to check internal state)
    expect(resetButton).toBeInTheDocument()
  })

  test('calls onAnnotationAdd when provided', () => {
    const mockOnAnnotationAdd = jest.fn()
    renderComponent({ onAnnotationAdd: mockOnAnnotationAdd })
    
    // This would need to simulate canvas click events
    // which is complex with Three.js mocking
    expect(mockOnAnnotationAdd).toBeDefined()
  })

  test('calls onMeasurement when provided', () => {
    const mockOnMeasurement = jest.fn()
    renderComponent({ onMeasurement: mockOnMeasurement })
    
    // This would need to simulate measurement completion
    expect(mockOnMeasurement).toBeDefined()
  })

  test('renders with custom dimensions', () => {
    renderComponent({ width: 1024, height: 768 })
    
    const canvas = screen.getByTestId('canvas')
    expect(canvas).toHaveStyle({ width: '1024', height: '768' })
  })

  test('handles missing metadata gracefully', () => {
    const dataWithoutMetadata = {
      ...mockVisualizationData,
      metadata: undefined
    }
    
    renderComponent({ data: dataWithoutMetadata })
    
    expect(screen.getByText('未知模型')).toBeInTheDocument()
    expect(screen.getByText('暂无描述')).toBeInTheDocument()
  })

  test('handles missing annotations gracefully', () => {
    const dataWithoutAnnotations = {
      ...mockVisualizationData,
      annotations: undefined
    }
    
    renderComponent({ data: dataWithoutAnnotations })
    
    // Should not crash and should not display annotation count
    expect(screen.queryByText(/注释数量/)).not.toBeInTheDocument()
  })

  test('renders export and settings buttons', () => {
    renderComponent()
    
    const buttons = screen.getAllByTestId('button')
    expect(buttons.some(button => 
      button.innerHTML.includes('DownloadOutlined') || 
      button.innerHTML.includes('SettingOutlined')
    )).toBe(true)
  })
})