import { Button, Card, Col, Form, Input, Modal, Row, message } from 'antd';
import { useContext, useState } from 'react';
import { UserContext } from '../../context/UseContext';
import { Helmet } from 'react-helmet';
import { updateStudent } from '../../services/auth/authService';

const PersonalDashboard = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { user, setUser } = useContext(UserContext);

  if (!user) {
    return <div>Please log in to see your dashboard.</div>;
  }

  const showModal = () => {
    form.setFieldsValue({
      mssv: user.studentId,
      name: user.name,
      gender: user.gender === 'male' ? 'Nam' : 'Nữ',
      roomName: user.roomName,
      className: user.className,
      email: user.email,
      phoneNumber: user.phoneNumber,
      address: user.address,
    });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const formatPhoneNumber = (phoneNumber) => {
    if (phoneNumber.startsWith('+84')) {
      return '0' + phoneNumber.slice(3);
    }
    return phoneNumber;
  };

  const handleSubmit = async (values) => {
    const studentData = {
      phoneNumber: values.phoneNumber,
      email: values.email,
      address: values.address,
    };

    try {
      await updateStudent(studentData);
      message.success('Cập nhật thông tin thành công!');
      setUser((prevUser) => ({
        ...prevUser,
        phoneNumber: values.phoneNumber,
        email: values.email,
        address: values.address,
      }));
      form.resetFields();
      setIsModalVisible(false);
    } catch (error) {
      console.error('Update failed:', error);
      message.error('Cập nhật thông tin thất bại!');
    }
  };

  return (
    <div style={{ width: '100%', padding: '16px' }}>
      <Helmet>
        <title>Thông tin cá nhân</title>
        <link rel="icon" href="../../src/assets/iuh.jpg" />
      </Helmet>
      <h2 style={{ marginBottom: '16px', fontSize: '24px' }}>
        Thông tin cá nhân
      </h2>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Card
            padding={16}
            bordered={false}
            extra={
              <Button
                style={{ float: 'right' }}
                type="primary"
                onClick={showModal}
              >
                Thay đổi thông tin cá nhân
              </Button>
            }
            style={{
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              borderRadius: '8px',
              backgroundColor: '#fafafa',
              padding: ' 0 16px',
            }}
            headStyle={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#1890ff',
            }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                <p>
                  <strong>MSSV:</strong> {user.studentId}
                </p>
                <p>
                  <strong>Họ tên:</strong> {user.name}
                </p>
                <p>
                  <strong>Giới tính:</strong>{' '}
                  {user.gender === 'male' ? 'Nam' : 'Nữ'}
                </p>
                <p>
                  <strong>Số điện thoại:</strong>{' '}
                  {formatPhoneNumber(user.phoneNumber)}
                </p>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                <p>
                  <strong>Phòng ở hiện tại:</strong> {user.roomName}{' '}
                  {user.studentStatus === 'pending' ? (
                    <strong>(Đang chờ duyệt)</strong>
                  ) : (
                    ''
                  )}
                </p>
                <p>
                  <strong>Lớp:</strong> {user.className}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Địa chỉ:</strong> {user.address}
                </p>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Modal for Editing Personal Info */}
      <Modal
        title="Chỉnh sửa thông tin cá nhân"
        visible={isModalVisible}
        onCancel={handleCancel}
        onOk={form.submit}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="mssv" label="MSSV">
                <Input disabled />
              </Form.Item>
              <Form.Item name="name" label="Họ tên">
                <Input disabled />
              </Form.Item>
              <Form.Item name="gender" label="Giới tính">
                <Input disabled />
              </Form.Item>
              <Form.Item name="roomName" label="Phòng ở hiện tại">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="className" label="Lớp">
                <Input disabled />
              </Form.Item>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  {
                    type: 'email',
                    message: 'Vui lòng nhập đúng định dạng email!',
                  },
                ]}
              >
                <Input placeholder="Nhập địa chỉ email" />
              </Form.Item>
              <Form.Item
                name="phoneNumber"
                label="Số điện thoại"
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại!' },
                ]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
              <Form.Item
                name="address"
                label="Địa chỉ liên hệ"
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
              >
                <Input placeholder="Nhập địa chỉ liên hệ" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default PersonalDashboard;
