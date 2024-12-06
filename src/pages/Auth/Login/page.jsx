import React, { useState, useContext } from 'react';
import { Form, Input, Button, message, Modal, Col, Row, Layout } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  fetchInfoUser,
  forgotPasswordByStudent,
  login,
  resetPasswordByStudent,
  verifyOTP,
} from '../../../services/auth/authService';
import { Helmet } from 'react-helmet';
import { UserContext } from '../../../context/UseContext';
import Cookies from 'js-cookie';
import Title from 'antd/es/skeleton/Title';
import { Content } from 'antd/es/layout/layout';

const Login = () => {
  const [form] = Form.useForm();
  const [resetForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');

  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const { studentId, password } = values;
      const loginResponse = await login(studentId, password);

      if (loginResponse && loginResponse.token) {
        const userInfo = await fetchInfoUser(loginResponse.token);

        const expirationDate = new Date();
        expirationDate.setTime(expirationDate.getTime() + 60 * 60 * 1000);
        Cookies.set('token', loginResponse.token, {
          expires: expirationDate,
          path: '/',
        });

        setUser(userInfo);
        message.success(`Đăng nhập thành công! Chào ${userInfo.name}`);

        if (userInfo?.isAdmin) {
          navigate('/admin/home');
        } else if (userInfo?.roomName) {
          navigate('/home');
        } else {
          navigate('/registerRoom');
        }
      } else {
        message.error('Sai MSSV hoặc mật khẩu, vui lòng thử lại!');
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error('Sai MSSV hoặc mật khẩu, vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (values) => {
    try {
      if (step === 1) {
        const requestBody = {
          studentId: values.studentId,
        };

        const response = await forgotPasswordByStudent(requestBody);
        const messages = response.message;
        const phoneRegex = /\d+/; // Regex để tìm chuỗi số
        const phoneMatch = messages.match(phoneRegex);
        if (phoneMatch) {
          let extractedPhoneNumber = phoneMatch[0];

          if (extractedPhoneNumber.startsWith('0')) {
            extractedPhoneNumber = '+84' + extractedPhoneNumber.slice(1);
          }

          setPhoneNumber(extractedPhoneNumber);
          message.success('Mã OTP đã được gửi, vui lòng kiểm tra điện thoại!');
          setStep(2);
        } else {
          throw new Error('Không tìm thấy số điện thoại trong tin nhắn!');
        }
      } else if (step === 2) {
        const otp = values.otp;
        await verifyOTP(otp, phoneNumber);

        message.success('Mã OTP hợp lệ, vui lòng nhập mật khẩu mới!');
        setStep(3);
      } else if (step === 3) {
        const requestBody = {
          studentId: resetForm.getFieldValue('studentId'),
          newPassword: values.newPassword,
        };

        await resetPasswordByStudent(requestBody);

        message.success('Mật khẩu đã được cập nhật thành công!');
        setIsModalVisible(false); // Đóng modal sau khi hoàn thành
        setStep(1); // Reset step
        resetForm.resetFields(); // Reset form
      }
    } catch (error) {
      console.error('Error:', error);
      message.error(error.message || 'Đã xảy ra lỗi, vui lòng thử lại!');
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Helmet>
        <title>Đăng nhập KTX</title>
        <link rel="icon" href="../../src/assets/iuh.jpg" />
      </Helmet>
      <Content
        style={{
          backgroundImage: 'url(../../public/bg_ktx.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
        }}
      >
        <Row justify="center" align="middle" style={{ width: '100%' }}>
          <Col xs={24} sm={20} md={16} lg={12} xl={8}>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                padding: '40px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                width: '100%',
              }}
            >
              <Form form={form} layout="vertical" onFinish={handleLogin}>
                <h2
                  level={2}
                  style={{ marginBottom: '20px', textAlign: 'center' }}
                >
                  ĐĂNG NHẬP KÝ TÚC XÁ
                </h2>
                <h3
                  level={3}
                  style={{ marginBottom: '30px', textAlign: 'center' }}
                >
                  Trường Đại học Công nghiệp TP. HCM
                </h3>
                <Form.Item
                  label="Mã số sinh viên"
                  name="studentId"
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng nhập mã số sinh viên!',
                    },
                  ]}
                >
                  <Input placeholder="Mã số sinh viên" />
                </Form.Item>
                <Form.Item
                  label="Mật khẩu"
                  name="password"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu!' },
                  ]}
                >
                  <Input.Password placeholder="Mật khẩu" />
                </Form.Item>
                <Form.Item style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      type="link"
                      onClick={() => setIsModalVisible(true)}
                      style={{ padding: 0 }}
                    >
                      Quên mật khẩu?
                    </Button>
                  </div>
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    style={{ width: '100%' }}
                  >
                    Đăng Nhập
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </Col>
        </Row>
      </Content>

      <Modal
        title="Quên mật khẩu"
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setStep(1);
          resetForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={resetForm}
          layout="vertical"
          onFinish={handleForgotPassword}
        >
          {step === 1 && (
            <Form.Item
              label="Mã số sinh viên"
              name="studentId"
              rules={[
                { required: true, message: 'Vui lòng nhập mã số sinh viên!' },
              ]}
            >
              <Input placeholder="Mã số sinh viên" />
            </Form.Item>
          )}

          {step === 2 && (
            <Form.Item
              label="Mã OTP"
              name="otp"
              rules={[{ required: true, message: 'Vui lòng nhập mã OTP!' }]}
            >
              <Input placeholder="Mã OTP" />
            </Form.Item>
          )}

          {step === 3 && (
            <Form.Item
              label="Mật khẩu mới"
              name="newPassword"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
              ]}
            >
              <Input.Password placeholder="Mật khẩu mới" />
            </Form.Item>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              {step === 1 && 'Lấy mã OTP'}
              {step === 2 && 'Xác nhận OTP'}
              {step === 3 && 'Cập nhật mật khẩu'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default Login;
