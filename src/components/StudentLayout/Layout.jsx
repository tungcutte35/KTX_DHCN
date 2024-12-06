import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import Sidebar from './Sidebar';
import HeaderComponent from './Header';
import { Outlet } from 'react-router-dom';

const { Content } = Layout;

const DashboardLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const handleResize = () => {
    const mobile = window.innerWidth <= 768;
    setIsMobile(mobile);
    setCollapsed(mobile);
  };

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Layout style={{ width: '100%' }}>
      <HeaderComponent
        style={{ position: 'fixed', width: '100%', zIndex: 2 }}
      />
      <Layout>
        <Sidebar
          collapsed={collapsed}
          onCollapse={handleCollapse}
          style={{
            position: 'fixed',
            height: 'calc(100vh - 64px)',
            top: 64,
            zIndex: 1,
          }}
          collapsedWidth={isMobile ? 0 : 80}
        />
        <Layout
          style={{
            marginLeft: isMobile ? 0 : collapsed ? 80 : 200,
            marginTop: 64,
            transition: 'margin-left 0.2s',
          }}
        >
          <Content
            style={{
              margin: window.innerWidth <= 768 ? 0 : 12,
              padding: 0,
              background: '#fff',
              overflowY: 'auto',
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
