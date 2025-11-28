import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { store } from './store'
import Layout from './components/Layout'
import MultimodalWorkbench from './pages/MultimodalWorkbench'
import IntelligentHub from './pages/IntelligentHub'
import MultiAgentCluster from './pages/MultiAgentCluster'
import CaseManagement from './pages/CaseManagement'
import Dashboard from './pages/Dashboard'
import './App.css'

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ConfigProvider locale={zhCN}>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/workbench" element={<MultimodalWorkbench />} />
              <Route path="/hub" element={<IntelligentHub />} />
              <Route path="/agents" element={<MultiAgentCluster />} />
              <Route path="/cases" element={<CaseManagement />} />
            </Routes>
          </Layout>
        </Router>
      </ConfigProvider>
    </Provider>
  )
}

export default App