import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Three.js
vi.mock('three', () => ({
  Scene: vi.fn(),
  PerspectiveCamera: vi.fn(),
  WebGLRenderer: vi.fn(),
  BoxGeometry: vi.fn(),
  SphereGeometry: vi.fn(),
  PlaneGeometry: vi.fn(),
  MeshBasicMaterial: vi.fn(),
  Mesh: vi.fn(),
  Vector3: vi.fn(),
  Color: vi.fn(),
  GridHelper: vi.fn(),
  AxesHelper: vi.fn(),
  Raycaster: vi.fn(),
}))

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
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

// Mock @react-three/drei
vi.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  Box: () => <div data-testid="box" />,
  Sphere: () => <div data-testid="sphere" />,
  Plane: () => <div data-testid="plane" />,
  Grid: () => <div data-testid="grid" />,
  Line: () => <div data-testid="line" />
}))

// Mock Ant Design components
vi.mock('antd', () => ({
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

// Global test setup
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})