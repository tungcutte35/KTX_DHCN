import React, { useEffect, useState } from 'react';
import { Layout } from 'antd';
import LiveChat from '../../pages/Student/LiveChat';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeaderComponent from './AdminHeader';

const { Content } = Layout;

// eslint-disable-next-line react/prop-types
const AdminLayout = ({ children }) => {
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
      <AdminHeaderComponent
        style={{ position: 'fixed', width: '100%', zIndex: 2 }}
      />
      <Layout>
        <AdminSidebar
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
            marginTop: 64,
            marginLeft: isMobile ? 0 : collapsed ? 80 : 200,
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
      {/* <LiveChat /> */}
    </Layout>
  );
};

export default AdminLayout;
