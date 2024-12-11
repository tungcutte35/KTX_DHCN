import { Layout, Menu, Button } from 'antd';
import {
  HomeOutlined,
  ApartmentOutlined,
  FileTextOutlined,
  CreditCardOutlined,
  MessageOutlined,
  UsergroupAddOutlined,
  ToolOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BarChartOutlined,
  DatabaseOutlined,
  DollarCircleFilled,
  DollarCircleOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import SubMenu from 'antd/es/menu/SubMenu';

import { useContext, useEffect, useRef, useState } from 'react';
import { UserContext } from '../../context/UseContext';

import Cookies from 'js-cookie';
const { Sider } = Layout;

const AdminSidebar = ({ collapsed, onCollapse, style }) => {
  const [openKeys, setOpenKeys] = useState([]);
  const { user } = useContext(UserContext);
  const { role } = user;
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const token = Cookies.get('token');
  if (!token) {
    navigate('/login');
  }
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

  useEffect(() => {
    if (role === 'maintenanceStaff') {
      setOpenKeys(['equipment-management-submenu']);
    }
    if (role === 'cashier') {
      setOpenKeys(['payment']);
    }
  }, [role]);

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
          defaultSelectedKeys={['/admin/dashboard']}
          style={{
            flex: 1,
            borderRight: 0,
            marginTop: '16px',
          }}
          openKeys={openKeys}
          onOpenChange={(keys) => setOpenKeys(keys)}
        >
          {/* Mục menu cho admin */}
          <Menu.Divider />
          <Menu.Item key="/admin/dashboard" icon={<HomeOutlined />}>
            <Link to="/admin/dashboard">Dashboard admin</Link>
          </Menu.Item>

          <>
            <Menu.Item
              key="/admin/open-registration"
              icon={<UsergroupAddOutlined />}
            >
              <Link to="/admin/open-registration">Mở đăng ký</Link>
            </Menu.Item>
            <Menu.Item
              key="/admin/student-management"
              icon={<FileTextOutlined />}
            >
              <Link to="/admin/student-management">Quản lý sinh viên</Link>
            </Menu.Item>
            <Menu.Item
              key="/admin/room-management"
              icon={<ApartmentOutlined />}
            >
              <Link to="/admin/room-management">Quản lý phòng ở</Link>
            </Menu.Item>
            <SubMenu
              key="equipment-management-submenu"
              icon={<ToolOutlined />}
              title={
                <span style={{ fontWeight: '500' }}>Quản lý thiết bị</span>
              }
            >
              <Menu.Item
                key="/admin/equipment-room-management"
                icon={<DatabaseOutlined />}
              >
                <Link to="/admin/equipment-room-management">Phòng ở</Link>
              </Menu.Item>
              <Menu.Item
                key="/admin/equipment-management"
                icon={<DatabaseOutlined />}
              >
                <Link to="/admin/equipment-management">Danh sách thiết bị</Link>
              </Menu.Item>
            </SubMenu>
            <SubMenu
              key="payment"
              icon={<CreditCardOutlined />}
              title={
                <span style={{ fontWeight: '500' }}>Quản lý thanh toán</span>
              }
            >
              <Menu.Item
                key="/admin/payment-status/rent"
                icon={<DollarCircleFilled />}
              >
                <Link to="/admin/payment-status/rent">Tiền phòng</Link>
              </Menu.Item>
              <Menu.Item
                key="/admin/payment-status/utilities"
                icon={<DollarCircleOutlined />}
              >
                <Link to="/admin/payment-status/utilities">Tiền điện/nước</Link>
              </Menu.Item>
            </SubMenu>
            <Menu.Item
              key="/admin/support-management"
              icon={<MessageOutlined />}
            >
              <Link to="/admin/support-management">Hỗ trợ sinh viên</Link>
            </Menu.Item>
          </>

          {role === 'cashier' && (
            <>
              <SubMenu
                key="payment"
                icon={<CreditCardOutlined />}
                title={
                  <span style={{ fontWeight: '500' }}>Quản lý thanh toán</span>
                }
              >
                <Menu.Item
                  key="/admin/payment-status/rent"
                  icon={<DollarCircleFilled />}
                >
                  <Link to="/admin/payment-status/rent">Tiền phòng</Link>
                </Menu.Item>
                <Menu.Item
                  key="/admin/payment-status/utilities"
                  icon={<DollarCircleOutlined />}
                >
                  <Link to="/admin/payment-status/utilities">
                    Tiền điện/nước
                  </Link>
                </Menu.Item>
              </SubMenu>
            </>
          )}

          {role === 'maintenanceStaff' && (
            <>
              <SubMenu
                key="equipment-management-submenu"
                icon={<ToolOutlined />}
                title={
                  <span style={{ fontWeight: '500' }}>Quản lý thiết bị</span>
                }
              >
                <Menu.Item
                  key="/admin/equipment-room-management"
                  icon={<DatabaseOutlined />}
                >
                  <Link to="/admin/equipment-room-management">Phòng ở</Link>
                </Menu.Item>
                <Menu.Item
                  key="/admin/equipment-management"
                  icon={<DatabaseOutlined />}
                >
                  <Link to="/admin/equipment-management">
                    Danh sách thiết bị
                  </Link>
                </Menu.Item>
              </SubMenu>
              <Menu.Item
                key="/admin/support-management"
                icon={<MessageOutlined />}
              >
                <Link to="/admin/support-management">Hỗ trợ sinh viên</Link>
              </Menu.Item>
            </>
          )}
        </Menu>
        {!isMobile && (
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={onCollapse}
            style={{
              position: 'absolute',
              bottom: '0',
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

export default AdminSidebar;
