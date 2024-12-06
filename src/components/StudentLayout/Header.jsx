import { useContext, useState } from 'react';
import {
  Layout,
  Avatar,
  Dropdown,
  Menu,
  Modal,
  Input,
  Button,
  message,
  Row,
  Col,
} from 'antd';
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  LockOutlined,
} from '@ant-design/icons';
import logo from '../../assets/iuh.jpg';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UseContext';
import Cookies from 'js-cookie';
import { changPasswordByStudent } from '../../services/auth/authService';

const { Header } = Layout;

const HeaderComponent = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate(); // Use useNavigate for redirection

  const handlePasswordChange = async () => {
    const token = Cookies.get('token');
    if (!token) {
      message.error('Vui lòng đăng nhập trước khi đổi mật khẩu.');
      navigate('/login');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      message.error('Mật khẩu mới và xác nhận mật khẩu không khớp!');
      return;
    }

    const payload = {
      oldPassword: currentPassword,
      newPassword: newPassword,
    };

    try {
      const response = await changPasswordByStudent(payload, token);

      if (response?.message === 'Password updated successfully') {
        message.success('Mật khẩu đã được thay đổi thành công!');
        setIsModalVisible(false);
      } else {
        const errorMessage =
          response?.message || 'Đã xảy ra lỗi khi đổi mật khẩu.';
        if (errorMessage.includes('Old password is incorrect')) {
          message.error('Mật khẩu hiện tại không chính xác.');
        } else {
          message.error(errorMessage);
        }
      }
    } catch (error) {
      message.error('Không thể đổi mật khẩu. Vui lòng thử lại!');
      console.error('Error changing password:', error);
    }
  };

  const handleLogout = () => {
    Cookies.remove('token');
    setUser(null);
    navigate('/login');
    message.success('Đăng xuất thành công!');
  };

  const menu = (
    <Menu>
      <Menu.Item
        key="1"
        icon={<LockOutlined />}
        onClick={() => setIsModalVisible(true)}
      >
        Đổi mật khẩu
      </Menu.Item>
      <Menu.Item key="2" icon={<LogoutOutlined />} onClick={handleLogout}>
        Đăng xuất
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
        <Col xs={10} sm={8} md={2} lg={4}>
          <Link to="/home">
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
          lg={16}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '1.2rem',
              textAlign: 'center',
            }}
          >
            KÝ TÚC XÁ - TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP TP.HCM
          </h2>
        </Col>
        <Col xs={14} sm={8} md={6} lg={4}>
          <Dropdown overlay={menu} trigger={['click']}>
            <Row
              style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                justifyContent: 'flex-end',
              }}
              className="user-info"
            >
              <Avatar icon={<UserOutlined />} />
              <div style={{ marginLeft: '8px', fontWeight: 'bold' }}>
                <span>{user?.name}</span>
                <span>{user?.isLeader === true ? '(TP)' : ''}</span>
              </div>
            </Row>
          </Dropdown>
        </Col>
      </Row>
      <Row></Row>
      <Modal
        title="Đổi mật khẩu"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handlePasswordChange}>
            Cập nhật mật khẩu
          </Button>,
        ]}
      >
        <Input.Password
          placeholder="Mật khẩu hiện tại"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          style={{ marginBottom: '10px' }}
        />
        <Input.Password
          placeholder="Mật khẩu mới"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          style={{ marginBottom: '10px' }}
        />
        <Input.Password
          placeholder="Nhập lại mật khẩu mới"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
        />
      </Modal>
    </Header>
  );
};

export default HeaderComponent;
