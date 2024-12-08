import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Table,
  Button,
  Modal,
  Space,
  Select,
  Form,
  Input,
  DatePicker,
  Col,
  Row,
  message,
} from 'antd';
import {
  AlertFilled,
  AlignLeftOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import ExcelJS from 'exceljs';
import { Helmet } from 'react-helmet';
import moment from 'moment';
import Cookies from 'js-cookie';
import { paymentsByStudentId } from '../../services/student/payment';
import {
  createUtilityPaymentsByAdmin,
  createUtilityPaymentsForRoomByAdmin,
  getUtilityPaymentsByRoomByAdmin,
} from '../../services/admin/paymentManager';
import { BuildingContext } from '../../context/BuildingContext';
const { Option } = Select;

const PaymentUtilitiesManagement = () => {
  const [roomFees, setRoomFees] = useState([]);
  const [roomFilter, setRoomFilter] = useState('');
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [utilityFees, setUtilityFees] = useState([]);
  const [selectedUtilityFee, setSelectedUtilityFee] = useState(null);
  const [isUtilityFeeModalVisible, setIsUtilityFeeModalVisible] =
    useState(false);
  const [isAddUtilityFeeModalVisible, setIsAddUtilityFeeModalVisible] =
    useState(false);
  const [electricityRate, setElectricityRate] = useState(3400);
  const [waterRate, setWaterRate] = useState(15600);
  const [isEditRatesModalVisible, setIsEditRatesModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [newElectricity, setNewElectricity] = useState(0);
  const [newWater, setNewWater] = useState(0);
  const [oldElectricity, setOldElectricity] = useState(0);
  const [oldWater, setOldWater] = useState(0);
  const apiCalledRef = useRef(false);
  const { buildingData } = useContext(BuildingContext);
  const fetchFees = useCallback(async () => {
    if (apiCalledRef.current) return;
    const token = Cookies.get('token');
    if (!token) {
      message.info('Vui lòng đăng nhập để tiếp tục!');
      navigate('/login');
      return;
    }

    setLoading(true);
    apiCalledRef.current = true;

    try {
      const utilityResponse = await getUtilityPaymentsByRoomByAdmin(token);
      setUtilityFees(utilityResponse || []);
    } catch (error) {
      message.error('Đã xảy ra lỗi khi tải dữ liệu.');
      console.error('Error fetching fees:', error);
    } finally {
      setLoading(false);
      apiCalledRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  const filteredUtilityFees = utilityFees.filter((fee) => {
    const matchesRoom =
      roomFilter && roomFilter.trim() !== ''
        ? fee.studentId &&
          fee.studentId.toLowerCase().includes(roomFilter.toLowerCase())
        : true;

    return matchesRoom;
  });

  const handleRoomChange = (roomKey) => {
    const selected = findRoomByKey(roomKey);
    if (selected) {
      setNewElectricity(selected.newElectricity);
      setNewWater(selected.newWater);
      setOldElectricity(selected.oldElectricity);
      setOldWater(selected.oldWater);
      form.setFieldsValue({
        newElectricity: selected.newElectricity,
        newWater: selected.newWater,
        oldElectricity: selected.oldElectricity,
        oldWater: selected.oldWater,
      });
    }
    setSelectedRoom(roomKey);
  };

  const findRoomByKey = (roomKey) => {
    for (const building of buildingData) {
      for (const floor of building.floors) {
        const room = floor.rooms.find((room) => room.key === roomKey);
        if (room) {
          return {
            ...room,
            oldElectricity: room.oldElectricity || 0, // Default value if not available
            oldWater: room.oldWater || 0, // Default value if not available
          };
        }
      }
    }
    return null;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStudentNameStyle = (status) => {
    switch (status) {
      case 'unpaid':
        return { color: 'red' };
      case 'paid':
        return { color: 'green' };
      default:
        return { color: 'black' };
    }
  };
  const handleUpdateElectricityAndWater = async (values) => {
    const token = Cookies.get('token');
    if (!token) {
      message.error('Vui lòng đăng nhập trước khi cập nhật hạn đóng tiền!');
      navigate('/login');
      return;
    }

    try {
      const formattedDueDate = values.dueDate.format('YYYY-MM-DD');
      await createUtilityPaymentsByAdmin(token, { dueDate: formattedDueDate });
      message.success('Cập nhật hạn đóng tiền thành công!');
      setIsEditRatesModalVisible(false);
    } catch (error) {
      message.error('Có lỗi xảy ra khi cập nhật hạn đóng tiền!');
      console.error('Error:', error);
    }
  };

  const currentMonth = moment().format('MM/YYYY');
  const currentMonthPayment = moment().format('DD/MM/YYYY');

  const handleAddUtilityFee = async (values) => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        message.error('Bạn cần đăng nhập để thêm hóa đơn điện/nước!');
        navigate('/login');
        return;
      }

      const dueDate = form.getFieldValue('dueDate');

      if (!dueDate || !dueDate.isValid()) {
        message.error('Vui lòng chọn hạn đóng tiền bên ngoài modal!');
        return;
      }
      if (selectedRoom.isElectricityWaterCharged) {
        message.error(
          'Phòng này đã được tính tiền điện, nước trong tháng này rồi!'
        );
        return;
      }

      const formattedDueDate = dueDate.format('YYYY-MM-DD');
      const { room } = values;
      const data = {
        roomNumber: room,
        dueDate: formattedDueDate,
      };

      const response = await createUtilityPaymentsForRoomByAdmin(token, data);

      if (response.message === 'Utility payment created successfully.') {
        message.success('Thêm tiền điện/nước thành công!');
        setIsAddUtilityFeeModalVisible(false);
        form.resetFields();
      } else {
        throw new Error(response.message || 'Có lỗi xảy ra!');
      }
    } catch (error) {
      console.error('Error adding utility fee:', error);
      message.error(
        'Phòng này đã được tính tiền điện/nước trong tháng này rồi!'
      );
    }
  };

  // const handleEditUtilityFee = (values) => {
  //   const { oldElectricity, newElectricity, oldWater, newWater } = values;

  //   // Tính toán hạn đóng là 7 ngày từ ngày hiện tại
  //   const dueDate = moment().add(7, 'days').format('DD/MM/YYYY');

  //   // Tính toán mức tiêu thụ điện và nước
  //   const electricityUsage = newElectricity - oldElectricity;
  //   const waterUsage = newWater - oldWater;

  //   // Tính toán phí sử dụng điện và nước
  //   const electricityFee = electricityUsage * electricityRate; // Sử dụng electricityRate đã cập nhật
  //   const waterFee = waterUsage * waterRate; // Sử dụng waterRate đã cập nhật

  //   // Tạo đối tượng phí dịch vụ đã cập nhật
  //   const updatedUtilityFees = utilityFees.map((fee) =>
  //     fee.key === selectedUtilityFee.key
  //       ? {
  //           ...fee,
  //           ...values,
  //           unpaidAmount: electricityFee + waterFee, // Cập nhật tổng tiền chưa thanh toán
  //           dueDate: dueDate, // Cập nhật hạn đóng tính toán
  //         }
  //       : fee
  //   );

  //   // Cập nhật trạng thái với phí dịch vụ mới
  //   setUtilityFees(updatedUtilityFees);
  //   setIsUtilityFeeModalVisible(false);
  //   setSelectedUtilityFee(null); // Xóa phí dịch vụ đã chọn
  // };

  const handleOk = (values) => {
    // if (selectedUtilityFee) {
    //   // If editing, call the edit function
    //   handleEditUtilityFee(values);
    // }
    if (selectedUtilityFee) {
      // If adding, call the add function
      handleAddUtilityFee(values);
    }
  };
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();

    const utilityFeesSheet = workbook.addWorksheet('Thanh toán điện nước');

    // Define columns for the utility fees sheet
    utilityFeesSheet.columns = [
      { header: 'Phòng', key: 'room', width: 15 },
      { header: 'Chi tiết', key: 'month', width: 30 },
      { header: 'Số tiền', key: 'unpaidAmount', width: 20 },
      { header: 'Trạng thái', key: 'status', width: 20 },
      { header: 'Ngày đến hạn', key: 'dueDate', width: 20 },
    ];

    // Add rows to the utility fees sheet
    filteredUtilityFees.forEach((fee) => {
      utilityFeesSheet.addRow({
        room: fee.studentId,
        month: fee.description,
        unpaidAmount: formatCurrency(fee.amount),
        status:
          fee.paymentStatus === 'paid'
            ? 'Đã Thanh toán'
            : fee.paymentStatus === 'unpaid'
            ? 'Chưa Thanh toán'
            : '',
        dueDate: moment(fee.dueDate).format('DD/MM/YYYY'),
      });
    });

    // Generate the Excel file and trigger
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Báo cáo thu chi điện nước.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  };
  const handleCalculateElectricityWater = async () => {
    try {
      console.log('Đang tính toán điện/nước...');

      message.success('Tính toán thành công!');
    } catch (error) {
      message.error('Có lỗi xảy ra khi tính toán!');
    }
  };

  const showProcessingModal = () => {
    // Hiển thị modal thông báo
    Modal.confirm({
      title: 'Thông báo',
      content: (
        <div>
          <p style={{ color: 'red' }}>
            Thời gian chờ có thể lâu do hệ thống đang tính toán hóa đơn
            điện/nước.
          </p>
          <p>Bạn có muốn tiếp tục không?</p>
        </div>
      ),
      onOk() {
        handleCalculateElectricityWater();
      },
      onCancel() {
        console.log('Người dùng đã hủy');
      },
      okText: 'Lưu',
      cancelText: 'Hủy',
    });
  };
  return (
    <div style={{ padding: '24px' }}>
      <Helmet>
        <title>Quản lý tiền điện, nước</title>
        <link rel="icon" href="../../src/assets/iuh.jpg" />
      </Helmet>
      <h3>Tiền điện, nước</h3>
      <div
        style={{
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <Input
            placeholder="Nhập số phòng để lọc"
            value={roomFilter}
            onChange={(e) => setRoomFilter(e.target.value)} // Update room filter state
            style={{ width: 200, marginRight: '8px' }}
          />
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={exportToExcel}
            style={{ marginBottom: '16px', marginRight: '20px' }}
          >
            Xuất Excel
          </Button>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            justifyContent: 'center',
            marginTop: '-30px',
          }}
        >
          <Button
            type="primary"
            icon={<AlertFilled />}
            style={{ marginTop: '6px' }}
            onClick={showProcessingModal}
          >
            Tự động tính điện/nước
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsAddUtilityFeeModalVisible(true)}
            style={{ marginTop: '6px' }}
          >
            Thêm điện nước
          </Button>
          <Form layout="vertical" form={form} name="dueDate">
            <Form.Item
              label="Ngày hạn đóng tiền"
              name="dueDate"
              // rules={[
              //   {
              //     required: true,
              //     message: 'Vui lòng chọn ngày hạn đóng tiền!',
              //   },
              // ]}
            >
              <DatePicker format="DD/MM/YYYY" placeholder="Chọn hạn đóng" />
            </Form.Item>
          </Form>
        </div>
      </div>
      <Table dataSource={filteredUtilityFees} rowKey="key">
        <Table.Column title="Phòng" dataIndex="studentId" key="studentId" />
        <Table.Column
          title="Tháng"
          dataIndex="updatedAt"
          key="updatedAt"
          render={(text) => moment(text).format('MM')}
        />
        <Table.Column
          title="Số tiền thanh toán"
          dataIndex="amount"
          key="amount"
          render={(text) => formatCurrency(text)}
        />
        <Table.Column
          title="Hạn đóng tiền"
          dataIndex="dueDate"
          key="dueDate"
          render={(text) => moment(text).format('DD/MM/YYYY')}
        />
        <Table.Column
          title="Tình trạng"
          dataIndex="paymentStatus"
          key="paymentStatus"
          render={(text) => (
            <span style={getStudentNameStyle(text)}>
              {text === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
            </span>
          )}
          sorter={(a, b) => {
            if (a.paymentStatus === 'unpaid' && b.paymentStatus === 'paid')
              return -1;
            if (a.paymentStatus === 'paid' && b.paymentStatus === 'unpaid')
              return 1;
            return 0;
          }}
        />
        {/* <Table.Column
          title="Hành động"
          key="action"
          render={(text, record) => (
            <Space>
              <Button
                type="link"
                onClick={() => {
                  setSelectedUtilityFee(record);
                  setIsUtilityFeeModalVisible(true);
                }}
                icon={<EditOutlined />}
              >
                Sửa
              </Button>
            </Space>
          )}
        /> */}
      </Table>
      <Modal
        title="Sửa tiền điện, nước"
        visible={isUtilityFeeModalVisible}
        onCancel={() => setIsUtilityFeeModalVisible(false)}
        footer={null} // Use custom footer
      >
        {selectedUtilityFee && (
          <Form layout="vertical" onFinish={handleEditUtilityFee}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Phòng"
                  name="room"
                  initialValue={selectedUtilityFee.room}
                >
                  <Input disabled placeholder="Nhập số phòng" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Tháng"
                  name="month"
                  initialValue={selectedUtilityFee.month}
                >
                  <Input disabled placeholder="Nhập tháng" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Số điện cũ"
                  name="oldElectricity"
                  initialValue={selectedUtilityFee.oldElectricity}
                  rules={[
                    { required: true, message: 'Vui lòng nhập số cũ điện!' },
                  ]}
                >
                  <Input type="number" placeholder="Nhập số điện cũ" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Số điện mới"
                  name="newElectricity"
                  initialValue={selectedUtilityFee.newElectricity}
                  rules={[
                    { required: true, message: 'Vui lòng nhập số mới điện!' },
                  ]}
                >
                  <Input type="number" placeholder="Nhập số điện mới" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Số nước cũ"
                  name="oldWater"
                  initialValue={selectedUtilityFee.oldWater}
                  rules={[
                    { required: true, message: 'Vui lòng nhập số cũ nước!' },
                  ]}
                >
                  <Input type="number" placeholder="Nhập số nước cũ" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Số nước mới"
                  name="newWater"
                  initialValue={selectedUtilityFee.newWater}
                  rules={[
                    { required: true, message: 'Vui lòng nhập số mới nước!' },
                  ]}
                >
                  <Input type="number" placeholder="Nhập số nước mới" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Tình trạng"
                  name="status"
                  initialValue={selectedUtilityFee.status}
                  rules={[
                    { required: true, message: 'Vui lòng chọn tình trạng!' },
                  ]}
                >
                  <Select placeholder="Chọn tình trạng">
                    <Option value="Đã thanh toán">Đã thanh toán</Option>
                    <Option value="Chưa thanh toán">Chưa thanh toán</Option>
                  </Select>
                </Form.Item>
              </Col>
              {/* Removed the Due Date Field */}
            </Row>

            <Form.Item style={{ textAlign: 'right' }}>
              <Button
                style={{ marginRight: 8 }}
                onClick={() => setIsUtilityFeeModalVisible(false)} // Cancel button
              >
                Trở về
              </Button>
              <Button type="primary" htmlType="submit">
                Lưu
              </Button>
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* Modal for Adding Utility Fee */}
      <Modal
        title="Thêm tiền điện, nước"
        visible={isAddUtilityFeeModalVisible}
        onCancel={() => setIsAddUtilityFeeModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddUtilityFee}
          initialValues={{
            month: currentMonth,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Phòng"
                name="room"
                rules={[{ required: true, message: 'Vui lòng chọn phòng!' }]}
              >
                <Select placeholder="Chọn phòng" onChange={handleRoomChange}>
                  {buildingData.map((building) =>
                    building.floors.map((floor) =>
                      floor.rooms
                        .filter((room) => !room.isElectricityWaterCharged) // Lọc các phòng có isElectricityWaterCharged là false
                        .map((room) => (
                          <Option key={room.key} value={room.key}>
                            {room.roomNumber}
                          </Option>
                        ))
                    )
                  )}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Tháng"
                name="month"
                rules={[{ required: true, message: 'Vui lòng nhập tháng!' }]}
              >
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Số điện cũ"
                name="oldElectricity"
                rules={[
                  { required: true, message: 'Vui lòng nhập số cũ điện!' },
                ]}
              >
                <Input
                  type="number"
                  placeholder="Nhập số cũ điện"
                  value={oldElectricity}
                  readOnly
                  disabled
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Số điện mới"
                name="newElectricity"
                rules={[
                  { required: true, message: 'Vui lòng nhập số mới điện!' },
                ]}
              >
                <Input
                  disabled
                  type="number"
                  value={newElectricity}
                  placeholder="Nhập số mới điện"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Số nước cũ"
                name="oldWater"
                rules={[
                  { required: true, message: 'Vui lòng nhập số cũ nước!' },
                ]}
              >
                <Input
                  type="number"
                  placeholder="Nhập số cũ nước"
                  value={oldWater}
                  readOnly
                  disabled
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Số nước mới"
                name="newWater"
                rules={[
                  { required: true, message: 'Vui lòng nhập số mới nước!' },
                ]}
              >
                <Input disabled type="number" placeholder="Nhập số mới nước" />
              </Form.Item>
            </Col>
          </Row>
          {/* <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Hạn đóng"
                name="dueDate"
                rules={[{ required: true, message: 'Vui lòng chọn hạn đóng!' }]}
              >
                <DatePicker format="DD/MM/YYYY" placeholder="Chọn hạn đóng" />
              </Form.Item>
            </Col>
          </Row> */}
          <Form.Item style={{ textAlign: 'right' }}>
            <Button
              style={{ marginRight: 8 }}
              onClick={() => setIsAddUtilityFeeModalVisible(false)}
            >
              Trở về
            </Button>
            <Button type="primary" htmlType="submit">
              Thêm
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PaymentUtilitiesManagement;
