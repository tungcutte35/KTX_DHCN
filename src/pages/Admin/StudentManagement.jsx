import { useEffect, useMemo, useState } from 'react';
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
  Checkbox,
  DatePicker,
} from 'antd';
import {
  CheckCircleOutlined,
  CheckOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  EditOutlined,
  HistoryOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import ExcelJS from 'exceljs'; // Import exceljs
import { Helmet } from 'react-helmet';
import axios from 'axios';
import {
  addStudentByAdmin,
  approveAllByAdmin,
  approveStudentByAdmin,
  deleteStudentByAdmin,
  getStudentHistoriesByIdByAdmin,
  getStudentsByStatus,
  rejectStudentByAdmin,
  updateStudentBtAdmin,
} from '../../services/admin/studentManager';
const { Option } = Select;
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { getRoomsAvailableRoomByAdmin } from '../../services/admin/equipmentsRoomManager';
import moment from 'moment';
const studentData = [];

const StudentManagement = () => {
  const [dataSource, setDataSource] = useState(studentData);
  const [editingStudent, setEditingStudent] = useState(null);
  const [rejectingStudent, setRejectingStudent] = useState(null);
  const [approvingStudent, setApprovingStudent] = useState(null);
  const [addingStudent, setAddingStudent] = useState(false);
  const [form] = Form.useForm();
  const [forms, setForms] = useState(studentData);
  // For filtering
  const [statusFilter, setStatusFilter] = useState();
  const [genderFilter, setGenderFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // Add searchTerm state
  const [isTransferHistoryModalVisible, setTransferHistoryModalVisible] =
    useState(false);
  const [transferHistoryData, setTransferHistoryData] = useState([]);
  const [gender, setGender] = useState('male');
  const [rooms, setRooms] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [selectedRoomData, setSelectedRoomData] = useState(null);
  const [description, setDescription] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const navigate = useNavigate();

  // Fetch students by status on component mount or when filters change
  useEffect(() => {
    const fetchStudents = async () => {
      const token = Cookies.get('token');
      if (!token) {
        message.info('Vui lòng đăng nhập để tiếp tục!');
        navigate('/login');
        throw new Error('No token found');
      }
      try {
        const students = await getStudentsByStatus(token);
        console.log('Fetched students:', students); // Debug
        setDataSource(students.result);
        setDescription(students); // Kiểm tra giá trị
      } catch (error) {
        message.error('Failed to fetch student data.');
      }
    };

    fetchStudents();
  }, [statusFilter]);

  useEffect(() => {
    if (gender) {
      const fetchRooms = async () => {
        try {
          const token = Cookies.get('token');
          if (!token) {
            message.info('Vui lòng đăng nhập để tiếp tục!');
            window.location.reload();
            navigate('/login');
            return;
          }

          // Fetch rooms based on selected gender
          const data = await getRoomsAvailableRoomByAdmin(token, gender);
          setRooms(data);
          setEquipment(data);
        } catch (error) {
          console.error('Error fetching rooms:', error);
          message.error('Không thể tải dữ liệu phòng!');
        }
      };

      fetchRooms();
    }
  }, [gender]);

  const handleEdit = (record) => {
    setEditingStudent(record);
    form.setFieldsValue(record);
  };
  console.log(description);
  const handleSave = async () => {
    const token = Cookies.get('token');
    if (!token) {
      message.info('Vui lòng đăng nhập để tiếp tục!');
      navigate('/login');
      throw new Error('No token found');
    }
    try {
      const values = await form.validateFields();

      const updatedValues = {
        ...values,
        description: description.description,
      };
      const updatedData = dataSource.map((student) =>
        student.studentId === editingStudent.studentId
          ? { ...student, ...updatedValues }
          : student
      );
      setDataSource(updatedData);

      console.log('Payload gửi lên API:', updatedValues);
      await updateStudentBtAdmin(editingStudent.studentId, updatedValues);

      setEditingStudent(null);
      message.success('Cập nhật thông tin thành công!');
    } catch (error) {
      message.error('Cập nhật thông tin thất bại! Vui lòng thử lại.');
      console.error('Error during updateStudent API call:', error);
    }
  };

  const handleReject = (record) => {
    setRejectingStudent(record);
    setRejectReason('');
  };

  const confirmReject = async () => {
    try {
      if (!rejectReason) {
        message.warning('Vui lòng nhập lý do từ chối!');
        return;
      }

      const token = Cookies.get('token');
      if (!token) {
        message.info('Vui lòng đăng nhập để tiếp tục!');
        navigate('/login');
        throw new Error('No token found');
      }

      await rejectStudentByAdmin(rejectingStudent.studentId, {
        description: description.description,
        reason: rejectReason,
      });

      message.success('Đã từ chối đăng ký của sinh viên.');
      setRejectingStudent(null);
      const updatedData = dataSource
        .map((student) =>
          student.studentId === rejectingStudent.studentId
            ? { ...student, studentStatus: 'unknown', rejectReason }
            : student
        )
        .filter((student) => student.studentStatus !== 'unknown');

      setDataSource(updatedData);
    } catch (error) {
      message.error('Từ chối sinh viên thất bại. Vui lòng thử lại.');
      console.error('Error during rejectStudent API call:', error);
    }
  };

  const handleApprove = (record) => {
    Modal.confirm({
      title: 'Xác nhận duyệt',
      content: `Bạn có chắc chắn muốn duyệt sinh viên ${record.name} không?`,
      okText: 'Duyệt',
      cancelText: 'Hủy',
      onOk: () => approveStudent(record),
    });
  };

  const approveStudent = async (record) => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        message.info('Vui lòng đăng nhập để tiếp tục!');
        navigate('/login');
        throw new Error('No token found');
      }

      // Call the API to approve the student
      await approveStudentByAdmin(record.studentId, token);
      message.success(`Sinh viên ${record.name} đã được duyệt thành công!`);

      setDataSource((prevDataSource) =>
        prevDataSource.map((student) =>
          student.studentId === record.studentId
            ? { ...student, studentStatus: 'approved' }
            : student
        )
      );
    } catch (error) {
      message.error('Có lỗi xảy ra khi duyệt sinh viên');
      console.error('Error approving student:', error);
    }
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

  const confirmDelete = (record) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa sinh viên ${record.name}?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => handleDelete(record),
    });
  };

  const handleDelete = async (record) => {
    const token = Cookies.get('token');
    if (!token) {
      message.info('Vui lòng đăng nhập để tiếp tục!');
      navigate('/login');
      throw new Error('No token found');
    }
    try {
      await deleteStudentByAdmin(
        record.studentId,
        {
          description: description.description,
        },
        token
      );

      const updatedData = dataSource.filter(
        (student) => student.studentId !== record.studentId
      );
      setDataSource(updatedData);

      message.success(`Đã xóa sinh viên ${record.name} khỏi danh sách.`);
    } catch (error) {
      message.error(`Xóa sinh viên ${record.name} thất bại. Vui lòng thử lại.`);
      console.error('Error during deleteStudent API call:', error);
    }
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

  const handleCancelAdd = () => {
    setAddingStudent(false);
  };
  const formatDate = (date) => {
    const validDate = date instanceof Date ? date : new Date(date);

    if (isNaN(validDate)) {
      return '';
    }

    const year = validDate.getFullYear();
    const month = String(validDate.getMonth() + 1).padStart(2, '0');
    const day = String(validDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const handleAdd = async () => {
    try {
      const values = await form.validateFields();
      const newStudent = {
        studentId: values.studentId,
        name: values.name,
        phoneNumber: values.phoneNumber,
        gender: values.gender,
        className: values.className,
        roomName: values.roomName,
        equipmentName: values.equipmentName,
        startDate: formatDate(
          values.startDate ? values.startDate.toDate() : new Date()
        ),
        studentStatus: 'approved',
      };

      const token = Cookies.get('token');
      if (!token) {
        message.info('Vui lòng đăng nhập để tiếp tục!');
        window.location.reload();
        navigate('/login');
        throw new Error('No token found');
      }

      await addStudentByAdmin(newStudent, token);

      setDataSource((prev) => [...prev, newStudent]);
      setAddingStudent(false);
      message.success('Đã thêm sinh viên thành công!');
    } catch (error) {
      message.error('Có lỗi xảy ra khi thêm sinh viên');
      console.error('Error adding student:', error);
    }
  };

  // Filtering logic
  const filteredData = useMemo(() => {
    return dataSource.filter((student) => {
      return (
        (!statusFilter || student.studentStatus === statusFilter) &&
        (!genderFilter || student.gender === genderFilter) &&
        (student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.studentId.includes(searchTerm))
      );
    });
  }, [dataSource, statusFilter, genderFilter, searchTerm]);

  const handleViewTransferHistory = async (record) => {
    const token = Cookies.get('token');
    if (!token) {
      message.info('Vui lòng đăng nhập để tiếp tục!');
      navigate('/login');
      throw new Error('No token found');
    }
    try {
      const transferHistory = await getStudentHistoriesByIdByAdmin(
        record.studentId,
        token
      );

      setTransferHistoryData(transferHistory);

      setTransferHistoryModalVisible(true);
    } catch (error) {
      message.error('Không thể tải lịch sử chuyển phòng. Vui lòng thử lại!');
      console.error('Error during fetch transfer history:', error);
    }
  };

  const handleCloseModal = () => {
    setTransferHistoryModalVisible(false);
  };
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Thống Kê Sinh Viên');

    // Define the columns for the worksheet
    worksheet.columns = [
      { header: 'MSSV', key: 'studentId', width: 15 },
      { header: 'Họ và Tên', key: 'name', width: 30 },
      { header: 'Lớp', key: 'className', width: 30 },
      { header: 'Giới tính', key: 'gender', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Số điện thoại', key: 'phoneNumber', width: 15 },
      { header: 'Địa chỉ phòng', key: 'roomName', width: 30 },
      { header: 'Trạng thái', key: 'studentStatus', width: 20 },

      { header: 'Vai trò', key: 'isLeader', width: 15 }, // Add isLeader
      { header: 'Địa chỉ', key: 'address', width: 50 }, // Add address
    ];

    // Filter data based on statusFilter, genderFilter, and searchTerm
    const filteredData = dataSource.filter((student) => {
      return (
        (!statusFilter || student.studentStatus === statusFilter) &&
        (!genderFilter || student.gender === genderFilter) &&
        (student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.studentId.includes(searchTerm)) // Include search criteria
      );
    });

    // Check if filteredData has data before proceeding
    if (filteredData.length === 0) {
      message.error('Không tìm thấy sinh viên nên không thể xuất.');
      return; // Exit the function if no data to export
    }

    // Add rows to the worksheet
    filteredData.forEach((form) => {
      const row = worksheet.addRow({
        studentId: form.studentId,
        name: form.name,
        className: form.className,
        gender: form.gender === 'male' ? 'Nam' : 'Nữ',
        email: form.email,
        phoneNumber: form.phoneNumber,
        roomName: form.roomName,
        studentStatus:
          form.studentStatus === 'approved'
            ? 'Đã duyệt'
            : form.studentStatus === 'pending'
            ? 'Chờ duyệt'
            : 'Từ chối',

        isLeader: form.isLeader ? 'Trưởng phòng' : '',
        address: form.address,
      });

      // Apply border style to each cell in the row
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };

        // Apply text wrapping for the 'address' column (index 10)
        if (cell.col === 10) {
          cell.alignment = {
            vertical: 'top',
            horizontal: 'left',
            wrapText: true,
          };
        }
      });
    });

    // Style header (bold and centered)
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { horizontal: 'center' };

    // Apply border style to header cells
    worksheet.getRow(1).eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // Save the Excel file
    try {
      const data = await workbook.xlsx.writeBuffer();
      const blob = new Blob([data], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'thong_ke_sinh_vien.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data to Excel:', error);
    }
  };

  const confirmApproveAll = () => {
    Modal.confirm({
      title: 'Xác nhận duyệt tất cả',
      content: (
        <div>
          <p>
            <p style={{ color: 'red' }}>
              Duyệt tất cả sinh viên có thể mất nhiều thời gian!
            </p>
          </p>
          <p>Bạn có chắc chắn muốn duyệt tất cả sinh viên không?</p>
        </div>
      ),
      okText: 'Duyệt tất cả',
      cancelText: 'Hủy',
      onOk: handApproveAll,
    });
  };

  const handApproveAll = async () => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        message.info('Vui lòng đăng nhập để tiếp tục!');
        navigate('/login');
        throw new Error('No token found');
      }

      await approveAllByAdmin(token);
      message.success('Tất cả sinh viên đã được duyệt thành công!');
      window.location.reload();
    } catch (error) {
      message.error('Có lỗi xảy ra khi duyệt tất cả sinh viên');
      console.error('Error approving all students:', error);
    }
  };
  const selectedRoom = form.getFieldValue('roomName');

  // Find the room object that matches the selected room number
  const selectedRoomDatas = rooms.find(
    (room) => room.roomNumber === selectedRoom
  );
  useEffect(() => {
    console.log('Updated selectedRoomData:', selectedRoomDatas); // Debug log to see the state of selectedRoomData
  }, [selectedRoomDatas]); // This will run whenever selectedRoomData changes
  return (
    <div style={{ padding: '24px' }}>
      <Helmet>
        <title>Quản lý sinh viên</title>
        <link rel="icon" href="../../src/assets/iuh.jpg" />
      </Helmet>
      <h2>Quản lý sinh viên</h2>
      <Row gutter={16}>
        <Col span={24}>
          <Card
            title="Danh sách sinh viên"
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
            <p style={{ marginTop: '16px' }}>
              Tổng có:{' '}
              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                {filteredData.length} sinh viên
              </span>{' '}
            </p>
            {/* Filter and Search Inputs */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <Input
                  placeholder="Tìm theo tên hoặc MSSV"
                  style={{ width: 180, marginBottom: '16px' }}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select
                  placeholder="Chọn trạng thái"
                  style={{
                    width: 150,
                    marginBottom: '16px',
                    marginLeft: '16px',
                  }}
                  onChange={(value) => setStatusFilter(value)}
                  allowClear
                >
                  <Option value="approved">Đã duyệt</Option>
                  <Option value="pending">Chờ duyệt</Option>
                  <Option value="rejected">Từ chối</Option>
                </Select>
                <Select
                  placeholder="Chọn giới tính"
                  style={{
                    width: 140,
                    marginBottom: '16px',
                    marginLeft: '16px',
                  }}
                  onChange={(value) => setGenderFilter(value)}
                  allowClear
                >
                  <Option value="male">Nam</Option>
                  <Option value="female">Nữ</Option>
                </Select>
              </div>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '20px' }}
              >
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={exportToExcel}
                  style={{ marginBottom: '16px' }}
                >
                  Xuất Excel
                </Button>
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  style={{ marginBottom: '16px' }}
                  onClick={confirmApproveAll}
                >
                  Duyệt tất cả
                </Button>
                <Button
                  type="primary"
                  icon={<PlusCircleOutlined />}
                  style={{ marginBottom: '16px' }}
                  onClick={() => setAddingStudent(true)}
                >
                  Thêm sinh viên
                </Button>
              </div>
            </div>

            <Table dataSource={filteredData} rowKey="key" pagination={true}>
              <Table.Column title="Tên sinh viên" dataIndex="name" key="name" />
              <Table.Column
                title="MSSV"
                dataIndex="studentId"
                key="studentId"
              />
              <Table.Column
                title="Lớp học"
                dataIndex="className"
                key="className"
              />
              <Table.Column
                title="Giới tính"
                dataIndex="gender"
                key="gender"
                render={(gender) => (gender === 'male' ? 'Nam' : 'Nữ')}
              />
              <Table.Column
                title="Thông tin liên lạc"
                key="contact"
                render={(text, record) => (
                  <>
                    <div>Email: {record.email}</div>
                    <div>SĐT: {record.phoneNumber}</div>
                  </>
                )}
              />
              <Table.Column
                title="Phòng ở"
                dataIndex="roomName"
                key="roomName"
              />
              <Table.Column
                title="Trạng thái"
                dataIndex="studentStatus"
                key="studentStatus"
                render={(studentStatus) => {
                  const statusText =
                    studentStatus === 'approved'
                      ? 'Đã duyệt'
                      : studentStatus === 'pending'
                      ? 'Chờ duyệt'
                      : 'Từ chối'; // assuming the third status represents "rejected" or a similar state

                  const color =
                    studentStatus === 'approved'
                      ? 'green'
                      : studentStatus === 'pending'
                      ? 'orange'
                      : 'red';

                  return <Tag color={color}>{statusText}</Tag>;
                }}
              />

              <Table.Column
                title="Hành động"
                key="actions"
                render={(record) => (
                  <div>
                    {record.studentStatus === 'approved' && (
                      <>
                        <Button
                          type="link"
                          icon={<EditOutlined />}
                          onClick={() => handleEdit(record)}
                        >
                          Sửa
                        </Button>
                        <Button
                          type="link"
                          icon={<CloseCircleOutlined />}
                          danger
                          onClick={() => confirmDelete(record)}
                        >
                          Xóa
                        </Button>
                        <Button
                          type="link"
                          icon={<HistoryOutlined />}
                          onClick={() => handleViewTransferHistory(record)}
                        >
                          Lịch Sử
                        </Button>
                      </>
                    )}
                    {record.studentStatus === 'pending' && (
                      <>
                        <Button
                          type="link"
                          icon={<CheckCircleOutlined />}
                          onClick={() => handleApprove(record)}
                        >
                          Duyệt
                        </Button>
                        <Button
                          type="link"
                          icon={<CloseCircleOutlined />}
                          danger
                          onClick={() => handleReject(record)}
                        >
                          Từ chối
                        </Button>
                      </>
                    )}
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
        okText="Cập nhật"
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tên sinh viên"
                rules={[
                  { required: true, message: 'Tên sinh viên là bắt buộc' },
                  {
                    max: 30,
                    message: 'Tên sinh viên không được quá 30 ký tự',
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="studentId"
                label="MSSV"
                rules={[
                  { required: true, message: 'MSSV là bắt buộc' },
                  { pattern: /^[0-9]{8}$/, message: 'MSSV phải là 8 chữ số' },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="className"
                label="Lớp học"
                rules={[{ required: true, message: 'Lớp học là bắt buộc' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="gender"
                label="Giới tính"
                rules={[{ required: true, message: 'Giới tính là bắt buộc' }]}
              >
                <Select>
                  <Option value="Nam">Nam</Option>
                  <Option value="Nữ">Nữ</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Email là bắt buộc' },
                  { type: 'email', message: 'Vui lòng nhập một email hợp lệ' },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phoneNumber"
                label="Số điện thoại"
                rules={[
                  { required: true, message: 'Số điện thoại là bắt buộc' },
                  {
                    pattern: /^[0-9]{10,11}$/,
                    message: 'Số điện thoại không hợp lệ',
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          {/* New Fields */}
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="address"
                label="Địa chỉ"
                rules={[{ required: true, message: 'Địa chỉ là bắt buộc' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="equipmentName"
                label="Giường"
                rules={[{ required: true, message: 'Tên giường là bắt buộc' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="studentStatus"
                label="Trạng thái sinh viên"
                rules={[
                  {
                    required: true,
                    message: 'Trạng thái sinh viên là bắt buộc',
                  },
                ]}
              >
                <Select>
                  <Option value="pending">Chờ duyệt</Option>
                  <Option value="approved">Đã duyệt</Option>
                  <Option value="rejected">Bị từ chối</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          {/* Uncomment if you want the "isLeader" checkbox */}
          {/* <Row gutter={16}>
      <Col span={12}>
        <Form.Item
          name="isLeader"
          valuePropName="checked"
          label="Trưởng phòng"
        >
          <Checkbox />
        </Form.Item>
      </Col>
    </Row> */}
        </Form>
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Lý do từ chối đăng ký"
        visible={!!rejectingStudent}
        onOk={confirmReject}
        onCancel={handleCancelReject}
      >
        <p>
          Bạn có chắc chắn muốn từ chối đăng ký của sinh viên{' '}
          {rejectingStudent?.name}?
        </p>
        <Input.TextArea
          rows={4}
          placeholder="Nhập lý do từ chối tại đây"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          thái
        />
      </Modal>
      {/* Approve Modal */}
      <Modal
        title="Duyệt đăng ký"
        visible={!!approvingStudent}
        onOk={confirmApprove}
        onCancel={handleCancelApprove}
      >
        <p>
          Bạn có chắc chắn muốn duyệt đăng ký của sinh viên{' '}
          {approvingStudent?.name}?
        </p>
      </Modal>
      {/* Add Student Modal */}
      <Modal
        title="Thêm sinh viên"
        visible={addingStudent}
        onCancel={handleCancelAdd}
        onOk={handleAdd}
        okText="Thêm"
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tên sinh viên"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên sinh viên!' },
                ]}
              >
                <Input placeholder="Nhập tên sinh viên" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="studentId"
                label="MSSV"
                rules={[{ required: true, message: 'Vui lòng nhập MSSV!' }]}
              >
                <Input placeholder="Nhập MSSV" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="className"
                label="Lớp học"
                rules={[{ required: true, message: 'Vui lòng nhập lớp học!' }]}
              >
                <Input placeholder="Nhập lớp học" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="gender"
                label="Giới tính"
                rules={[
                  { required: true, message: 'Vui lòng chọn giới tính!' },
                ]}
              >
                <Select
                  placeholder="Chọn giới tính"
                  onChange={(value) => setGender(value)} // Update gender
                >
                  <Option value="male">Nam</Option>
                  <Option value="female">Nữ</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không hợp lệ!' },
                ]}
              >
                <Input placeholder="Nhập email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phoneNumber"
                label="Số điện thoại"
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại!' },
                ]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="roomName"
                label="Phòng ở"
                rules={[{ required: true, message: 'Vui lòng chọn phòng!' }]}
              >
                <Select
                  placeholder="Chọn phòng"
                  onChange={(value) => {
                    form.setFieldsValue({ equipmentName: undefined });
                    console.log('Selected room:', value);
                    const roomData = rooms.find(
                      (room) => room.roomNumber === value
                    );
                    setSelectedRoomData(roomData);
                  }}
                >
                  {rooms.length > 0 ? (
                    rooms.map((room) => (
                      <Option key={room.roomNumber} value={room.roomNumber}>
                        {room.roomNumber}
                      </Option>
                    ))
                  ) : (
                    <Option disabled>Không có phòng</Option>
                  )}
                </Select>
              </Form.Item>
            </Col>

            {/* Equipment Selection */}
            <Col span={12}>
              <Form.Item
                name="equipmentName"
                label="Mã giường"
                rules={[
                  { required: true, message: 'Vui lòng chọn mã giường!' },
                ]}
              >
                <Select placeholder="Chọn mã giường">
                  {/* Only show equipment for the selected room */}
                  {selectedRoomData &&
                  selectedRoomData.equipmentAvailable.length > 0 ? (
                    selectedRoomData.equipmentAvailable.map((equipmentItem) => {
                      console.log('Available equipment:', equipmentItem); // Debug log to see the available equipment
                      return (
                        <Option
                          key={equipmentItem.key}
                          value={equipmentItem.key}
                        >
                          {equipmentItem.key}
                        </Option>
                      );
                    })
                  ) : (
                    <Option disabled>Không có thiết bị</Option>
                  )}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="startDate"
                label="Ngày vào phòng ở"
                rules={[
                  { required: true, message: 'Vui lòng chọn ngày vào phòng!' },
                ]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder="Chọn ngày"
                  format="DD/MM/YYYY" // Hoặc định dạng mà bạn muốn
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal
        title="Lịch Sử Chuyển Phòng"
        visible={isTransferHistoryModalVisible}
        onCancel={handleCloseModal}
        footer={null}
      >
        <Table dataSource={transferHistoryData}>
          <Table.Column
            title="Ngày"
            dataIndex="timestamp"
            key="timestamp"
            render={(text) => <span>{moment(text).format('DD/MM/YYYY')}</span>}
          />
          <Table.Column title="Từ phòng" dataIndex="from" key="from" />
          <Table.Column title="Đến phòng" dataIndex="to" key="to" />
          <Table.Column
            title="Mô tả"
            dataIndex="description"
            key="description"
          />
        </Table>
      </Modal>
    </div>
  );
};

export default StudentManagement;
