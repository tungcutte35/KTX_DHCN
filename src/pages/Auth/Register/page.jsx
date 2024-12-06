import React, { useState } from 'react';
import { Form, Input, Button, Row, Col, message, Radio, Layout } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'react-phone-input-2/lib/style.css';
import PhoneInput from 'react-phone-input-2';
import { Helmet } from 'react-helmet';
import {
  register,
  sendOTP,
  verifyOTP,
} from '../../../services/auth/authService';
import { Content } from 'antd/es/layout/layout';
const Register = () => {
  const [form] = Form.useForm();
  const [showOtpField, setShowOtpField] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationId, setVerificationId] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('male');
  const navigate = useNavigate();

  const handleRegister = async () => {
    setLoading(true);
    // console.log('Original phone number:', phoneNumber);

    let formattedPhoneNumber = phoneNumber;

    // Normalize phone number format
    if (phoneNumber.startsWith('0')) {
      formattedPhoneNumber = `+84${phoneNumber.slice(1)}`;
    } else if (phoneNumber.startsWith('84')) {
      formattedPhoneNumber = `+84${phoneNumber.slice(2)}`;
    } else if (phoneNumber.startsWith('840')) {
      formattedPhoneNumber = `+84${phoneNumber.slice(3)}`;
    }

    // console.log('Formatted phone number:', formattedPhoneNumber);

    // Validate phone number format
    if (!/^\+84\d{9,10}$/.test(formattedPhoneNumber)) {
      message.error(
        'Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại hợp lệ.'
      );
      setLoading(false);
      return;
    }

    try {
      const response = await sendOTP(formattedPhoneNumber);
      setVerificationId(response.verificationId);
      setShowOtpField(true);
      message.success('Mã OTP đã được gửi đến số điện thoại của bạn.');
    } catch (error) {
      message.error('Gửi OTP thất bại, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async () => {
    setLoading(true);
    let formattedPhoneNumber = phoneNumber;

    // Normalize phone number format
    if (phoneNumber.startsWith('0')) {
      formattedPhoneNumber = `+84${phoneNumber.slice(1)}`;
    } else if (phoneNumber.startsWith('84')) {
      formattedPhoneNumber = `+84${phoneNumber.slice(2)}`;
    } else if (phoneNumber.startsWith('840')) {
      formattedPhoneNumber = `+84${phoneNumber.slice(3)}`;
    }

    try {
      const otp = form.getFieldValue('otp');
      const response = await verifyOTP(otp, formattedPhoneNumber);

      // Log the response for debugging
      console.log('OTP Verification Response:', response);

      // Check if response is true
      if (response === true) {
        // Proceed with registration
        const userInfo = {
          studentId: form.getFieldValue('MSSV'),
          name: form.getFieldValue('fullName'),
          className: form.getFieldValue('className'),
          phoneNumber: formattedPhoneNumber,
          gender: form.getFieldValue('gender'),
          password: form.getFieldValue('password'),
        };

        const registerResponse = await register(userInfo);
        if (registerResponse) {
          message.success('Đăng ký thành công');
          form.resetFields();
          // localStorage.setItem('user', JSON.stringify(userInfo));
          navigate('/registerRoom');
        } else {
          message.error(
            registerResponse.message || 'Đăng ký thất bại, vui lòng thử lại.'
          );
          console.log('User Info:', userInfo);
        }
      } else {
        message.error('Xác minh OTP thất bại: Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error during OTP verification:', error);
      message.error('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Helmet>
        <title>Đăng ký KTX</title>
        <link rel="icon" href="../../src/assets/iuh.jpg" />
      </Helmet>
      <Row>
        <Col xs={0} sm={0} md={12} lg={14} xl={16}>
          <div
            style={{
              height: '100vh',
              backgroundImage: 'url("/bg_ktx.jpg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </Col>

        <Col xs={24} sm={24} md={12} lg={10} xl={8}>
          <Content
            style={{
              padding: '30px 30px 0px 30px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minHeight: '100vh',
            }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={showOtpField ? handleOtpVerification : handleRegister}
              initialValues={{ gender: 'male' }}
            >
              <h2
                level={2}
                style={{ marginBottom: '0px', textAlign: 'center' }}
              >
                ĐĂNG KÝ KÝ TÚC XÁ
              </h2>
              <h3
                level={3}
                style={{ marginBottom: '30px', textAlign: 'center' }}
              >
                Trường Đại học Công nghiệp TP. HCM
              </h3>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Họ tên"
                    name="fullName"
                    rules={[
                      { required: true, message: 'Vui lòng nhập họ tên!' },
                    ]}
                  >
                    <Input placeholder="Họ tên" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="MSSV"
                    name="MSSV"
                    rules={[{ required: true, message: 'Vui lòng nhập MSSV!' }]}
                  >
                    <Input placeholder="MSSV" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Lớp"
                    name="className"
                    rules={[{ required: true, message: 'Vui lòng nhập Lớp!' }]}
                  >
                    <Input placeholder="Lớp" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Giới tính"
                    name="gender"
                    rules={[
                      { required: true, message: 'Vui lòng chọn giới tính!' },
                    ]}
                  >
                    <Radio.Group
                      onChange={(e) => setGender(e.target.value)}
                      value={gender}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Radio value="male">Nam</Radio>
                      <Radio value="female">Nữ</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
              </Row>

              <Col>
                <Form.Item
                  label="Số điện thoại"
                  name="phoneNumber"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số điện thoại!' },
                  ]}
                >
                  <PhoneInput
                    country={'vn'}
                    value={phoneNumber}
                    onChange={(phone) => setPhoneNumber(phone)}
                    inputStyle={{
                      width: '100%',
                      height: '32px',
                      fontSize: '14px',
                    }}
                    containerStyle={{
                      width: '100%',
                    }}
                  />
                </Form.Item>
              </Col>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Mật khẩu"
                    name="password"
                    rules={[
                      { required: true, message: 'Vui lòng nhập mật khẩu!' },
                      {
                        pattern: /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/,
                        message:
                          'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ cái, số.',
                      },
                    ]}
                  >
                    <Input.Password
                      placeholder="Mật khẩu"
                      style={{ height: '35px' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Xác nhận mật khẩu"
                    name="confirmPassword"
                    rules={[
                      {
                        required: true,
                        message: 'Vui lòng xác nhận mật khẩu!',
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error('Mật khẩu không khớp!')
                          );
                        },
                      }),
                    ]}
                  >
                    <Input.Password
                      placeholder="Xác nhận mật khẩu"
                      style={{ height: '35px' }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {showOtpField && (
                <Form.Item
                  label="Nhập OTP"
                  name="otp"
                  rules={[{ required: true, message: 'Vui lòng nhập OTP!' }]}
                >
                  <Input placeholder="OTP" style={{ height: '35px' }} />
                </Form.Item>
              )}

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  style={{ width: '100%', height: '40px' }}
                >
                  {showOtpField ? 'Xác thực OTP' : 'Đăng ký'}
                </Button>
              </Form.Item>
            </Form>
          </Content>
        </Col>
      </Row>
    </Layout>
  );
};

export default Register;
