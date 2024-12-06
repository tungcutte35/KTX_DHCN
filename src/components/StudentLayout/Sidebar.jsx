import React, { useState, useEffect, useRef } from 'react';
import { Layout, Menu, Button } from 'antd';
import {
  HomeOutlined,
  ApartmentOutlined,
  FileTextOutlined,
  CreditCardOutlined,
  MessageOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Sider } = Layout;

const Sidebar = ({ collapsed, onCollapse, style }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobile &&
        !collapsed &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        onCollapse();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile, collapsed, onCollapse]);

  const toggleButton = (
    <Button
      type="primary"
      icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      onClick={onCollapse}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
        width: '50px',
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      }}
    />
  );

  if (isMobile && collapsed) {
    return toggleButton;
  }

  return (
    <>
      <Sider
        ref={sidebarRef}
        width={200}
        theme="light"
        style={{
          ...style,
          transition: 'width 0.2s',
        }}
        collapsed={collapsed}
        collapsedWidth={isMobile ? 0 : 80}
      >
        <Menu
          mode="inline"
          defaultSelectedKeys={['/personal-dashboard']}
          style={{
            flex: 1,
            borderRight: 0,
            marginTop: '16px',
          }}
        >
          <Menu.Item key="/personal-dashboard" icon={<HomeOutlined />}>
            <Link to="/personal-dashboard">Thông tin cá nhân</Link>
          </Menu.Item>

          <Menu.SubMenu
            key="roomDetails"
            icon={<ApartmentOutlined />}
            title={<span style={{ fontWeight: '500' }}>Chi tiết phòng ở</span>}
            className="bold-submenu"
          >
            <Menu.Item key="/room-member" className="bold-menu-item">
              <Link to="/room-member">Thành viên</Link>
            </Menu.Item>
            <Menu.Item key="/room-equipment" className="bold-menu-item">
              <Link to="/room-equipment">Thiết bị</Link>
            </Menu.Item>
          </Menu.SubMenu>

          <Menu.Item
            key="/contract-management"
            icon={<FileTextOutlined />}
            className="bold-menu-item"
          >
            <Link to="/contract-management">Hợp đồng</Link>
          </Menu.Item>
          <Menu.Item
            key="/payment"
            icon={<CreditCardOutlined />}
            className="bold-menu-item"
          >
            <Link to="/payment">Thanh toán</Link>
          </Menu.Item>

          <Menu.SubMenu
            key="supportRequests"
            icon={<MessageOutlined />}
            title={<span style={{ fontWeight: '500' }}>Yêu cầu hỗ trợ</span>}
            className="bold-submenu"
          >
            <Menu.Item key="/support/create-request" className="bold-menu-item">
              <Link to="/support/create-request">Gửi yêu cầu hỗ trợ</Link>
            </Menu.Item>
            <Menu.Item key="/support/check-request" className="bold-menu-item">
              <Link to="/support/check-request">Xem tiến trình yêu cầu</Link>
            </Menu.Item>
          </Menu.SubMenu>
        </Menu>

        {!isMobile && (
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={onCollapse}
            style={{
              position: 'absolute',
              bottom: '19%',
              width: '100%',
              textAlign: 'center',
              marginTop: 'auto',
              backgroundColor: '#1890ff',
              color: '#fff',
              border: '1px solid #1890ff',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: 'bold',
              padding: '8px',
              transition: 'background-color 0.3s, color 0.3s',
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#40a9ff')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#1890ff')}
          />
        )}
      </Sider>
      {isMobile && toggleButton}
    </>
  );
};

export default Sidebar;
