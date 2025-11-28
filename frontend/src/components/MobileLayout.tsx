import React, { useState, useEffect } from 'react'
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Badge,
  Drawer,
  Space,
  Typography,
  theme
} from 'antd'
import {
  MenuOutlined,
  HomeOutlined,
  FileSearchOutlined,
  ExperimentOutlined,
  RobotOutlined,
  BarChartOutlined,
  UserOutlined,
  BellOutlined,
  LogoutOutlined,
  SettingOutlined
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../store'

const { Header, Sider, Content } = Layout
const { Text } = Typography

interface MobileLayoutProps {
  children: React.ReactNode
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useSelector((state: RootState) => state.auth)
  const {
    token: { colorBgContainer }
  } = theme.useToken()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setDrawerVisible(false)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const menuItems = [
    {
      key: '/dashboard',
      icon: <HomeOutlined />,
      label: '工作台'
    },
    {
      key: '/cases',
      icon: <FileSearchOutlined />,
      label: '案例管理'
    },
    {
      key: '/workbench',
      icon: <ExperimentOutlined />,
      label: '多模态工作台'
    },
    {
      key: '/intelligent-hub',
      icon: <RobotOutlined />,
      label: '智能中枢'
    },
    {
      key: '/multi-agent',
      icon: <RobotOutlined />,
      label: '多智能体集群'
    },
    {
      key: '/knowledge-graph',
      icon: <ExperimentOutlined />,
      label: '知识图谱'
    },
    {
      key: '/reports',
      icon: <BarChartOutlined />,
      label: '分析报告'
    }
  ]

  const handleMenuClick = (key: string) => {
    navigate(key)
    setDrawerVisible(false)
  }

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料'
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置'
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

  const handleUserMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case 'profile':
        navigate('/profile')
        break
      case 'settings':
        navigate('/settings')
        break
      case 'logout':
        // 处理退出登录
        break
    }
  }

  const renderMobileMenu = () => (
    <Menu
      mode="vertical"
      selectedKeys={[location.pathname]}
      items={menuItems as any}
      onClick={({ key }) => handleMenuClick(key)}
      style={{ borderRight: 0 }}
    />
  )

  const renderDesktopMenu = () => (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[location.pathname]}
      items={menuItems as any}
      onClick={({ key }) => handleMenuClick(key)}
    />
  )

  if (isMobile) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ 
          padding: '0 16px', 
          background: colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Space>
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setDrawerVisible(true)}
            />
            <Text strong style={{ fontSize: '18px' }}>
              SmartFA
            </Text>
          </Space>
          
          <Space>
            <Badge count={5} size="small">
              <Button type="text" icon={<BellOutlined />} />
            </Badge>
            <Dropdown
              menu={{
                items: userMenuItems as any,
                onClick: handleUserMenuClick
              }}
              placement="bottomRight"
            >
              <Avatar
                src={(user as any)?.avatar}
                icon={<UserOutlined />}
                style={{ cursor: 'pointer' }}
              />
            </Dropdown>
          </Space>
        </Header>

        <Content style={{ 
          margin: 0,
          background: colorBgContainer,
          minHeight: 'calc(100vh - 64px)',
          overflow: 'auto'
        }}>
          {children}
        </Content>

        <Drawer
          title="菜单"
          placement="left"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          bodyStyle={{ padding: 0 }}
        >
          {renderMobileMenu()}
        </Drawer>
      </Layout>
    )
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: collapsed ? 14 : 18,
          fontWeight: 'bold'
        }}>
          {collapsed ? 'SFA' : 'SmartFA'}
        </div>
        {renderDesktopMenu()}
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}>
        <Header style={{ 
          padding: '0 16px', 
          background: colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuOutlined /> : <MenuOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />

          <Space>
            <Badge count={5} size="small">
              <Button type="text" icon={<BellOutlined />} />
            </Badge>
            <Dropdown
              menu={{
                items: userMenuItems as any,
                onClick: handleUserMenuClick
              }}
              placement="bottomRight"
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar
                  src={(user as any)?.avatar}
                  icon={<UserOutlined />}
                />
                <Text>{(user as any)?.realName || '用户'}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{ 
          margin: '16px',
          padding: '16px',
          background: colorBgContainer,
          minHeight: 'calc(100vh - 96px)',
          overflow: 'auto'
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}

export default MobileLayout