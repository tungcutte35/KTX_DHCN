import { Layout, Avatar, Dropdown, Menu, Row, Col } from 'antd';
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import logo from '../../assets/iuh.jpg';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useContext } from 'react';
import { UserContext } from '../../context/UseContext';

const { Header } = Layout;

const AdminHeaderComponent = () => {
  const { user, setUser } = useContext(UserContext);
  const handleLogout = () => {
    Cookies.remove('token');
    setUser(null);
    navigate('/login');
    message.success('Đăng xuất thành công!');
  };
  const menu = (
    <Menu>
      <Menu.Item key="2" icon={<LogoutOutlined />} onClick={handleLogout}>
        <Link to="/"> Đăng xuất</Link>
      </Menu.Item>
    </Menu>
  );

  return (
    <Header
      style={{
        background: '#fff',
        padding: '0px 20px',
        display: 'flex',
        width: '100%',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        position: 'fixed',
        zIndex: 2,
      }}
    >
      <Row
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Col xs={6} sm={8} md={2} lg={4}>
          <Link to="/admin/home">
            <img
              src={logo}
              alt="Logo"
              style={{
                height: '40px',
                borderRadius: '50%',
                cursor: 'pointer',
                marginTop: '10px',
              }}
            />
          </Link>
        </Col>
        <Col
          xs={{ span: 0, offset: 0 }}
          sm={{ span: 0, offset: 0 }}
          md={{ span: 0, offset: 0 }}
          lg={14}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '1.2rem',
              textAlign: 'center',
            }}
          >
            QUẢN LÝ KÝ TÚC XÁ - TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP TP.HCM
          </h2>
        </Col>
        <Col xs={18} sm={8} md={6} lg={6}>
          <Dropdown overlay={menu} trigger={['click']}>
            <Row
              style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                justifyContent: 'flex-end',
                marginTop: window.innerWidth <= 768 ? '16px' : '0',
              }}
              className="user-info"
            >
              <Avatar icon={<UserOutlined />} />
              <div
                style={{
                  marginLeft: '8px',
                  fontWeight: 'bold',
                  display: window.innerWidth <= 768 ? 'none' : 'block',
                }}
              >
                <span>{user?.name}</span>
                <span>
                  {user?.role === 'generalManager'
                    ? '(Admin)'
                    : user?.role === 'cashier'
                    ? '(Thu ngân)'
                    : user?.role === 'maintenanceStaff'
                    ? '(NV bảo trì)'
                    : 'Unknown'}
                </span>
              </div>
            </Row>
          </Dropdown>
        </Col>
      </Row>
      <Row></Row>
    </Header>
  );
};

export default AdminHeaderComponent;
