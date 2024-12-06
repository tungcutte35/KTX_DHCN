import {
  Button,
  message,
  Select,
  Input,
  Form,
  Radio,
  Checkbox,
  Row,
  Col,
} from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { useState, useEffect, useContext } from 'react';
import { Helmet } from 'react-helmet';
const { Option } = Select;
import Cookies from 'js-cookie';
import { useInRouterContext, useNavigate } from 'react-router-dom';
import { UserContext } from '../../../context/UseContext';
import { addSupportByStudent } from '../../../services/student/support';

const Support = () => {
  const [form] = Form.useForm();
  const [isOtherIssue, setIsOtherIssue] = useState(false);
  const [isRepairEquipment, setIsRepairEquipment] = useState(false);
  const [randomBed, setRandomBed] = useState(null);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const handleSupportSubmit = async (values) => {
    const token = Cookies.get('token');
    if (!token) {
      message.error('Vui lòng đăng nhập trước khi gửi yêu cầu hỗ trợ.');
      navigate('/login');
      return;
    }

    // Create the request payload
    const requestData = {
      email: values.email,
      phoneNumber: values.phoneNumber,
      requestType: values.supportType,
      urgency: values.urgencyLevel,
    };

    if (values.supportType === 'Vấn đề khác' && values.otherIssue) {
      requestData.otherIssue = values.otherIssue;
    }

    try {
      const response = await addSupportByStudent(requestData, token);

      if (response) {
        message.success('Yêu cầu hỗ trợ đã được gửi thành công!');
        form.resetFields();
      } else {
        message.error(response?.message || 'Đã xảy ra lỗi khi gửi yêu cầu.');
      }
    } catch (error) {
      message.error('Không thể gửi yêu cầu hỗ trợ. Vui lòng thử lại!');
      console.error('Error during addSupport API call:', error);
    }
  };

  const handleSupportTypeChange = (value) => {
    setIsRepairEquipment(value === 'Sửa chữa trang thiết bị');
    setIsOtherIssue(value === 'Vấn đề khác');
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Helmet>
        <title>Yêu cầu hỗ trợ</title>
        <link rel="icon" href="../../src/assets/iuh.jpg" />
      </Helmet>
      <div
        style={{
          width: '100%',
          maxWidth: '600px',
          padding: '24px',
          background: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          border: '1px solid #d9d9d9',
        }}
      >
        <h2 style={{ textAlign: 'center', marginTop: '0px' }}>
          Gửi yêu cầu hỗ trợ
        </h2>

        <Form form={form} onFinish={handleSupportSubmit} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Tên sinh viên"
                name="name"
                initialValue={user.name}
              >
                <Input disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Mã số sinh viên (MSSV)"
                name="mssv"
                initialValue={user.studentId}
              >
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Địa chỉ phòng"
                name="roomAddress"
                initialValue={user.roomName}
              >
                <Input disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Số điện thoại"
                name="phoneNumber"
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại!' },
                ]}
                initialValue={user.phoneNumber}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ required: true, message: 'Vui lòng nhập email!' }]}
                initialValue={user.email}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Loại yêu cầu"
                name="supportType"
                rules={[
                  { required: true, message: 'Vui lòng chọn loại yêu cầu!' },
                ]}
              >
                <Select
                  placeholder="Chọn loại yêu cầu"
                  onChange={handleSupportTypeChange}
                >
                  <Option value="Sửa chữa trang thiết bị">
                    Sửa chữa trang thiết bị
                  </Option>
                  <Option value="Vấn đề khác">Vấn đề khác</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          {isOtherIssue && (
            <Form.Item
              label="Vấn đề khác"
              name="otherIssue"
              rules={[{ required: true, message: 'Vui lòng mô tả vấn đề!' }]}
            >
              <TextArea rows={3} placeholder="Mô tả vấn đề khác" />
            </Form.Item>
          )}
          <Form.Item
            label="Tình trạng khẩn cấp"
            name="urgencyLevel"
            rules={[
              { required: true, message: 'Vui lòng chọn mức độ khẩn cấp!' },
            ]}
          >
            <Radio.Group style={{ width: '60%' }}>
              <Radio value="high">Cao</Radio>
              <Radio value="medium">Trung bình</Radio>
              <Radio value="low">Thấp</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="agreement"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value
                    ? Promise.resolve()
                    : Promise.reject('Bạn phải đồng ý với các điều khoản!'),
              },
            ]}
          >
            <Checkbox>
              Tôi xác nhận rằng thông tin đã cung cấp là chính xác và đồng ý với
              các điều khoản của hệ thống hỗ trợ.
            </Checkbox>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Gửi yêu cầu
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Support;
