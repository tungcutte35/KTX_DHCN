import {
  Card,
  Table,
  Row,
  Col,
  Button,
  Modal,
  Select,
  Spin,
  message,
} from 'antd';
import { useState, useEffect, useContext } from 'react';
import { Helmet } from 'react-helmet';
import Cookies from 'js-cookie'; // Import Cookies
import { getMemberRoom } from '../../../services/auth/room';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../../context/UseContext';
import { swapLeaderStudent } from '../../../services/student/roomRegister';

const { Option } = Select;

const StudentList = () => {
  const [roomLeader, setRoomLeader] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedLeader, setSelectedLeader] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = Cookies.get('token');
        if (!token) {
          message.info('Vui lòng đăng nhập để tiếp tục!');
          window.location.reload();
          navigate('/login');
          throw new Error('No token found');
        }

        const studentData = await getMemberRoom(token);
        setStudents(studentData);
      } catch (err) {
        console.error('Failed to fetch students:', err);
        setError('Sinh viên chưa có phòng ở ký túc xá');
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleOk = async () => {
    if (!selectedLeader) {
      console.error('No leader selected');
      return;
    }

    try {
      const token = Cookies.get('token');
      if (!token) {
        message.info('Vui lòng đăng nhập để tiếp tục!');
        navigate('/login');
        return;
      }

      const result = await swapLeaderStudent(token, selectedLeader);
      console.log('Leader swapped successfully:', result);

      const updatedStudents = students.map((student) =>
        student.studentId === selectedLeader
          ? { ...student, isLeader: true }
          : { ...student, isLeader: false }
      );

      setStudents(updatedStudents);
      setRoomLeader(selectedLeader);
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error swapping leader:', error);
    }
  };

  const handleLeaderChange = (value) => {
    setSelectedLeader(value);
  };
  const handleGoToHome = () => {
    navigate('/registerRoom');
  };
  const columns = [
    { title: 'MSSV', dataIndex: 'studentId', key: 'studentId' },
    { title: 'Họ và tên', dataIndex: 'name', key: 'name' },
    { title: 'Giường', dataIndex: 'equipmentName', key: 'equipmentName' },
    {
      title: 'Vai trò',
      key: 'role',
      render: (record) => (record.isLeader === true ? 'Trưởng phòng' : ''),
    },
  ];

  return (
    <div style={{ padding: '0px' }}>
      <Helmet>
        <title>Danh sách sinh viên</title>
        <link rel="icon" href="../../src/assets/iuh.jpg" />
      </Helmet>
      <Row justify="center">
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <h2
            style={{
              marginBottom: '16px',
              paddingLeft: '24px',
            }}
          >
            Danh sách sinh viên trong phòng
          </h2>
          {user?.roomName === '' ? (
            <Button
              type="primary"
              onClick={handleGoToHome}
              style={{
                display: 'block',
                marginLeft: 'auto',
                marginRight: '20px',
                marginBottom: '16px',
              }}
            >
              Đăng ký phòng
            </Button>
          ) : null}
          {user?.isLeader === true ? (
            <Button
              type="primary"
              onClick={showModal}
              style={{
                display: 'block',
                marginLeft: 'auto',
                marginRight: '20px',
                marginBottom: '16px',
              }}
            >
              Chuyển trưởng phòng
            </Button>
          ) : null}

          <Card
            bordered={true}
            style={{ boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}
          >
            <Table
              dataSource={students}
              columns={columns}
              pagination={false}
              rowKey="studentId"
              bordered
              size="middle"
              scroll={{ x: true }}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="Chuyển trưởng phòng"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <p>Chọn sinh viên làm trưởng phòng:</p>
        <Select
          style={{ width: '100%' }}
          placeholder="Chọn sinh viên"
          onChange={handleLeaderChange}
          value={selectedLeader}
        >
          {students
            .filter((student) => student.studentId !== user?.studentId) // Exclude current user
            .map((student) => (
              <Option key={student.studentId} value={student.studentId}>
                {student.name}
              </Option>
            ))}
        </Select>
      </Modal>
    </div>
  );
};

export default StudentList;
