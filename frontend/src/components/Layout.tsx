import React, { useState } from 'react'
import { Layout as AntLayout, Menu, theme, Avatar, Dropdown, Space, Badge } from 'antd'
import {
  DashboardOutlined,
  ExperimentOutlined,
  RobotOutlined,
  ClusterOutlined,
  FileSearchOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'

const { Header, Sider, Content } = AntLayout

interface LayoutProps {
  children: React.ReactNode
}

const AppLayout: React.FC<LayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false)
  const {
    token: { colorBgContainer }
  } = theme.useToken()
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '控制台'
    },
    {
      key: '/workbench',
      icon: <ExperimentOutlined />,
      label: '多模态工作台'
    },
    {
      key: '/hub',
      icon: <RobotOutlined />,
      label: '智能中枢'
    },
    {
      key: '/agents',
      icon: <ClusterOutlined />,
      label: '多智能体集群'
    },
    {
      key: '/cases',
      icon: <FileSearchOutlined />,
      label: '案例管理'
    }
  ]

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心'
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置'
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录'
    }
  ]

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  const handleUserMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case 'profile':
        // 处理个人中心
        break
      case 'settings':
        // 处理系统设置
        break
      case 'logout':
        // 处理退出登录
        break
    }
  }

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo" style={{ 
          height: 64, 
          margin: 16, 
          background: 'rgba(255, 255, 255, 0.3)',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: collapsed ? 16 : 18,
          fontWeight: 'bold'
        }}>
          {collapsed ? 'FA' : 'SmartFA'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems as any}
          onClick={handleMenuClick}
        />
      </Sider>
      <AntLayout>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* 触发器按钮可以放在这里 */}
          </div>
          <Space size="middle">
            <Badge count={5} size="small">
              <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
            </Badge>
            <Dropdown
              menu={{
                items: userMenuItems as any,
                onClick: handleUserMenuClick
              }}
              placement="bottomRight"
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <span>管理员</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: 8
          }}
        >
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  )
}

export default AppLayout