import { useState } from 'react';
import {
  Table,
  Card,
  Row,
  Col,
  Button,
  Input,
  Modal,
  Form,
  message,
  Tag,
  Select,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { Helmet } from 'react-helmet';
const { Option } = Select;

const studentRegistrations = [
  {
    key: '1',
    name: 'Lê Thanh Tùng',
    mssv: '20008831',
    class: 'Kỹ thuật phần mềm',
    email: 'tung.le@example.com',
    phone: '0987654321',
    room: '101',
    status: 'Đang chờ duyệt',
  },
  {
    key: '2',
    name: 'Huỳnh Kim Liên',
    mssv: '20123421',
    class: 'Kế toán',
    email: 'kimlinen@example.com',
    phone: '0987654321',
    room: '101',
    status: 'Đã duyệt',
  },
  // Add more student data as needed
];

const DormitoryRegistrationReview = () => {
  const [dataSource, setDataSource] = useState(studentRegistrations);
  const [editingStudent, setEditingStudent] = useState(null);
  const [rejectingStudent, setRejectingStudent] = useState(null);
  const [approvingStudent, setApprovingStudent] = useState(null);
  const [form] = Form.useForm();

  // For filtering
  const [statusFilter, setStatusFilter] = useState(null);

  const handleEdit = (record) => {
    setEditingStudent(record);
    form.setFieldsValue(record);
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      const updatedData = dataSource.map((student) =>
        student.key === editingStudent.key ? { ...student, ...values } : student
      );
      setDataSource(updatedData);
      setEditingStudent(null);
      message.success('Cập nhật thông tin thành công!');
    });
  };

  const handleReject = (record) => {
    setRejectingStudent(record);
  };

  const confirmReject = () => {
    const updatedData = dataSource.map((student) =>
      student.key === rejectingStudent.key
        ? { ...student, status: 'Đã từ chối' }
        : student
    );
    setDataSource(updatedData);
    setRejectingStudent(null);
    message.success('Đã từ chối đăng ký của sinh viên.');
  };

  const handleApprove = (record) => {
    setApprovingStudent(record);
  };

  const confirmApprove = () => {
    const updatedData = dataSource.map((student) =>
      student.key === approvingStudent.key
        ? { ...student, status: 'Đã duyệt' }
        : student
    );
    setDataSource(updatedData);
    setApprovingStudent(null);
    message.success(`Đã duyệt đăng ký của sinh viên ${approvingStudent.name}.`);
  };

  const handleCancelEdit = () => {
    setEditingStudent(null);
  };

  const handleCancelReject = () => {
    setRejectingStudent(null);
  };

  const handleCancelApprove = () => {
    setApprovingStudent(null);
  };

  // Filtering logic
  const filteredData = statusFilter
    ? dataSource.filter((student) => student.status === statusFilter)
    : dataSource;

  return (
    <div style={{ padding: '24px' }}>
      <Helmet>
        <title>Duyệt danh sách</title>
        <link rel="icon" href="../../src/assets/iuh.jpg" />
      </Helmet>
      <h2>Duyệt danh sách đăng ký ký túc xá</h2>
      <Row gutter={16}>
        <Col span={24}>
          <Card
            title="Danh sách sinh viên đã đăng ký"
            bordered={false}
            style={{
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              borderRadius: '8px',
              marginBottom: '16px',
            }}
            headStyle={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#1890ff',
            }}
          >
            {/* Filter Dropdown */}
            <Select
              placeholder="Chọn trạng thái"
              style={{ width: 200, marginBottom: '16px' }}
              onChange={(value) => setStatusFilter(value)}
              allowClear
            >
              <Option value="Đang chờ duyệt">Đang chờ duyệt</Option>
              <Option value="Đã duyệt">Đã duyệt</Option>
              <Option value="Đã từ chối">Đã từ chối</Option>
            </Select>

            <Table dataSource={filteredData} rowKey="key" pagination={false}>
              <Table.Column title="Tên sinh viên" dataIndex="name" key="name" />
              <Table.Column title="MSSV" dataIndex="mssv" key="mssv" />
              <Table.Column title="Lớp học" dataIndex="class" key="class" />
              <Table.Column title="Email" dataIndex="email" key="email" />
              <Table.Column
                title="Số điện thoại"
                dataIndex="phone"
                key="phone"
              />
              <Table.Column title="Phòng đăng ký" dataIndex="room" key="room" />
              <Table.Column
                title="Trạng thái"
                dataIndex="status"
                key="status"
                render={(status) => (
                  <Tag
                    color={
                      status === 'Đang chờ duyệt'
                        ? 'orange'
                        : status === 'Đã từ chối'
                        ? 'red'
                        : 'green'
                    }
                  >
                    {status}
                  </Tag>
                )}
              />
              <Table.Column
                title="Hành động"
                key="actions"
                render={(text, record) => (
                  <div>
                    <Button
                      type="link"
                      icon={<EditOutlined />}
                      onClick={() => handleEdit(record)}
                      disabled={record.status !== 'Đang chờ duyệt'}
                    >
                      Sửa
                    </Button>
                    <Button
                      type="link"
                      icon={<CheckCircleOutlined />}
                      onClick={() => handleApprove(record)}
                      disabled={record.status !== 'Đang chờ duyệt'}
                    >
                      Duyệt
                    </Button>
                    <Button
                      type="link"
                      icon={<CloseCircleOutlined />}
                      danger
                      onClick={() => handleReject(record)}
                      disabled={record.status !== 'Đang chờ duyệt'}
                    >
                      Từ chối
                    </Button>
                  </div>
                )}
              />
            </Table>
          </Card>
        </Col>
      </Row>

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa thông tin sinh viên"
        visible={!!editingStudent}
        onCancel={handleCancelEdit}
        onOk={handleSave}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Tên sinh viên" name="name">
            <Input disabled />
          </Form.Item>
          <Form.Item label="MSSV" name="mssv">
            <Input disabled />
          </Form.Item>
          <Form.Item label="Lớp học" name="class">
            <Input disabled />
          </Form.Item>
          <Form.Item label="Email" name="email">
            <Input disabled />
          </Form.Item>
          <Form.Item label="Số điện thoại" name="phone">
            <Input disabled />
          </Form.Item>
          <Form.Item label="Phòng đăng ký" name="room">
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* Reject Confirmation Modal */}
      <Modal
        title="Xác nhận từ chối"
        visible={!!rejectingStudent}
        onCancel={handleCancelReject}
        onOk={confirmReject}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <p>Bạn có chắc chắn muốn từ chối đăng ký của sinh viên này không?</p>
      </Modal>

      {/* Approve Confirmation Modal */}
      <Modal
        title="Xác nhận duyệt"
        visible={!!approvingStudent}
        onCancel={handleCancelApprove}
        onOk={confirmApprove}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <p>
          Bạn có chắc chắn muốn duyệt đăng ký của sinh viên{' '}
          {approvingStudent?.name} không?
        </p>
      </Modal>
    </div>
  );
};

export default DormitoryRegistrationReview;
