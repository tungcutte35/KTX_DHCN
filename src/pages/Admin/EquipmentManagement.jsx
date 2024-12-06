import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Input,
  message,
  Space,
  Select,
  Tag,
  Col,
  Row,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  HistoryOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import ExcelJS from 'exceljs';
import { Helmet } from 'react-helmet';
const { Option } = Select;
import Cookies from 'js-cookie';
import {
  addEquipmentsListByAdmin,
  getAllEquipmentsListByAdmin,
  updateEquipmentsListByAdmin,
} from '../../services/admin/equipmentsManager';
import moment from 'moment';
import { Navigate, useNavigate } from 'react-router-dom';
// Initial data for rooms and equipment

// Lưu ý: Danh sách này có thể được sắp xếp ngẫu nhiên nếu cần thiết.

const EquipmentManagement = () => {
  const [forms, setForms] = useState([]);
  const [warehouse, setWarehouse] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newEquipment, setNewEquipment] = useState({
    name: '',
    quantity: 0,
    status: 'Tốt',
    price: 0,
    location: '', // Default location
  });
  const [filterStatus, setFilterStatus] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editEquipment, setEditEquipment] = useState(null);
  const [equipmentData, setEquipmentData] = useState(warehouse);
  const [searchCode, setSearchCode] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const token = Cookies.get('token');
  const navigate = useNavigate();
  useEffect(() => {
    if (!token) {
      message.info('Vui lòng đăng nhập để tiếp tục!');
      window.location.reload();
      navigate('/login');
      throw new Error('No token found');
    }
    const fetchEquipments = async () => {
      try {
        setLoading(true);
        const data = await getAllEquipmentsListByAdmin(token);
        setWarehouse(data);
      } catch (err) {
        console.error('Error fetching equipment data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchEquipments();
    }
  }, [token]);
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  // Handle adding new equipment
  const handleAddEquipment = async () => {
    if (
      !newEquipment.name ||
      newEquipment.quantity <= 0 ||
      newEquipment.price <= 0
    ) {
      message.error('Vui lòng nhập đầy đủ thông tin hợp lệ!');
      return;
    }

    const newItem = {
      name: newEquipment.name,
      quantity: newEquipment.quantity,
      price: newEquipment.price,
      location: newEquipment.location,
      importDate: formatDate(new Date()),
    };

    console.log(newItem);
    if (!token) {
      message.info('Vui lòng đăng nhập để tiếp tục!');
      window.location.reload();
      navigate('/login');
      throw new Error('No token found');
    }
    try {
      // Send the new item to the backend via the API call
      const response = await addEquipmentsListByAdmin(token, newItem);

      if (response) {
        setWarehouse([...warehouse, newItem]);
        message.success('Đã thêm trang thiết bị mới vào kho thành công!');

        // Reset the form data in modal
        setNewEquipment({
          name: '',
          quantity: 0,
          price: 0,
          location: 'Kho',
          importDate: new Date().toLocaleDateString('en-CA'),
        });

        // Close the modal
        setIsModalVisible(false);
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi thêm trang thiết bị!');
      console.error('Error adding equipment:', error);
    }
  };

  const handleEditEquipment = (equipment) => {
    setEditEquipment(equipment);
    setIsEditModalVisible(true);
  };

  const handleUpdateEquipment = async () => {
    if (!token) {
      message.info('Vui lòng đăng nhập để tiếp tục!');
      window.location.reload();
      navigate('/login');
      throw new Error('No token found');
    }
    if (editEquipment) {
      try {
        const response = await updateEquipmentsListByAdmin(
          token,
          {
            name: editEquipment.name,
            // quantity: editEquipment.quantity,
            price: editEquipment.price,
            status: editEquipment.status,
            location: editEquipment.location, // Ensure this is correct
            importDate: formatDate(new Date()),
          },
          editEquipment.key
        ); // Pass the keyEquipments as the ID of the equipment to be updated

        if (response) {
          const updatedWarehouse = warehouse.map((item) => {
            if (item.key === editEquipment.key) {
              return {
                ...item,
                name: editEquipment.name,
                quantity: editEquipment.quantity,
                price: editEquipment.price,
                status: editEquipment.status,
                location: editEquipment.location,
              };
            }
            return item;
          });

          setWarehouse(updatedWarehouse);
          message.success('Cập nhật trang thiết bị thành công!');
        } else {
          message.error('Cập nhật không thành công!');
        }
      } catch (error) {
        message.error('Có lỗi xảy ra khi cập nhật trang thiết bị!');
        console.error('Error updating equipment:', error);
      }
    }
    setIsEditModalVisible(false);
    setEditEquipment(null);
  };
  // Handle deleting equipment
  const handleDeleteEquipment = (itemKey) => {
    // Find the item by key to check its status
    const itemToLiquidate = warehouse.find((item) => item.key === itemKey);

    if (itemToLiquidate.status !== 'Hư hỏng') {
      message.error('Chỉ có thể thanh lý thiết bị bị hư hỏng.');
      return; // Exit the function if the equipment is not damaged
    }

    Modal.confirm({
      title: 'Xác nhận thanh lý',
      content: 'Bạn có chắc chắn muốn thanh lý trang thiết bị này?',
      onOk: () => {
        const updatedWarehouse = warehouse.map((item) => {
          if (item.key === itemKey) {
            // Change the status to "Thanh lý"
            return { ...item, status: 'Thanh lý' }; // Update the status
          }
          return item; // Return the item unchanged
        });

        setWarehouse(updatedWarehouse);
        message.success('Trang thiết bị đã được thanh lý!');
      },
      onCancel() {
        // User canceled the action
        message.info('Thao tác đã bị hủy.');
      },
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'good':
        return 'green';
      case 'damaged':
        return 'red';
      case 'needMaintenance':
        return 'orange';
      default:
        return 'black';
    }
  };

  // Filter equipment based on status and location
  const filteredWarehouse = warehouse.filter((item) => {
    if (filterStatus && item.status !== filterStatus) return false;

    if (
      searchCode &&
      !item.key.toLowerCase().includes(searchCode.toLowerCase())
    ) {
      return false;
    }

    // Kiểm tra theo nơi lưu trữ
    if (
      filterLocation &&
      !item.location.toLowerCase().includes(filterLocation.toLowerCase())
    ) {
      return false;
    }

    // Nếu không có điều kiện nào bị vi phạm, trả về true
    return true;
  });

  useEffect(() => {
    if (selectedRoom) {
      setEquipmentData(selectedRoom.equipment); // Initialize equipment data
    }
  }, [selectedRoom]);

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Thống kê thiết lưu trữ');

    worksheet.columns = [
      { header: 'Mã thiết bị', key: 'key', width: 15 },
      { header: 'Tên thiết bị', key: 'name', width: 30 },
      // { header: 'Số lượng', key: 'quantity', width: 15 },
      { header: 'Tình trạng', key: 'status', width: 15 },
      { header: 'Giá', key: 'price', width: 15 },
      { header: 'Nơi lưu trữ', key: 'location', width: 20 },
      { header: 'Ngày nhập', key: 'importDate', width: 15 },
    ];

    let rowCount = 1;

    const filteredWarehouse = warehouse.filter((item) => {
      if (filterStatus && item.status !== filterStatus) return false;

      if (
        searchCode &&
        !item.key.toLowerCase().includes(searchCode.toLowerCase())
      ) {
        return false;
      }

      if (
        filterLocation &&
        !item.location.toLowerCase().includes(filterLocation.toLowerCase())
      ) {
        return false;
      }

      return true;
    });

    // Lặp qua dữ liệu đã được lọc
    filteredWarehouse.forEach((item) => {
      const row = {
        key: item.key,
        name: item.name,
        quantity: item.quantity,
        status:
          item.status === 'good'
            ? 'Tốt'
            : item.status === 'damaged'
            ? 'Hư hỏng'
            : item.status === 'needMaintenance'
            ? 'Cần bảo trì'
            : item.status === 'liquidated'
            ? 'Thanh lý'
            : '',
        price: item.price,
        location: item.location,
        importDate: moment(item.importDate).format('DD/MM/YYYY'),
      };

      worksheet.addRow(row);
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { horizontal: 'center' };

    worksheet.getRow(1).eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    worksheet.eachRow({ includeEmpty: true }, (row) => {
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'thong_ke_thiet_bi_luu_tru.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Helmet>
        <title>Quản lý danh sách thiết bị</title>
        <link rel="icon" href="../../src/assets/iuh.jpg" />
      </Helmet>
      <h2>Danh sách trang thiết bị</h2>

      {/* Room Management */}

      {/* Warehouse Management with Filters */}

      {/* Filters */}

      {/* Bộ lọc */}
      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        <Col xs={12} sm={12} md={5} lg={5}>
          <Input
            placeholder="Tìm theo mã thiết bị"
            onChange={(e) => setSearchCode(e.target.value)}
            style={{ width: '100%' }}
          />
        </Col>
        <Col xs={12} sm={12} md={5} lg={5}>
          <Input
            placeholder="Tìm theo nơi lưu trữ"
            onChange={(e) => setFilterLocation(e.target.value)}
            style={{ width: '100%' }}
          />
        </Col>
        <Col xs={12} sm={12} md={5} lg={5}>
          <Select
            placeholder="Lọc theo tình trạng"
            onChange={(value) => setFilterStatus(value)}
            style={{ width: '100%' }}
          >
            <Option value={null}>Tất cả</Option>
            <Option value="good">Tốt</Option>
            <Option value="damaged">Hư hỏng</Option>
            <Option value="needMaintenance">Cần bảo trì</Option>
            <Option value="liquidated">Thanh lý</Option>
          </Select>
        </Col>
        <Col xs={12} sm={12} md={4} lg={3} xl={3}>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={exportToExcel}
          >
            Xuất Excel
          </Button>
        </Col>
        <Col xs={12} sm={12} md={12} lg={4}>
          <Button type="primary" onClick={() => setIsModalVisible(true)}>
            Thêm trang thiết bị mới
          </Button>
        </Col>
      </Row>

      <h3>Tổng danh sách lọc được: {filteredWarehouse.length}</h3>

      <Table
        dataSource={filteredWarehouse}
        rowKey="key"
        scroll={{ x: 'max-content' }}
        size="middle"
      >
        <Table.Column title="Mã thiết bị" dataIndex="key" key="key" />
        <Table.Column title="Tên trang thiết bị" dataIndex="name" key="name" />
        {/* <Table.Column title="Số lượng" dataIndex="quantity" key="quantity" /> */}
        <Table.Column
          title="Tình trạng"
          dataIndex="status"
          key="status"
          render={(text) => (
            <Tag color={getStatusColor(text)}>
              {text === 'good'
                ? 'Tốt'
                : text === 'damaged'
                ? 'Hư hỏng'
                : text === 'needMaintenance'
                ? 'Cần bảo trì'
                : 'Thanh lý'}
            </Tag>
          )}
        />
        <Table.Column
          title="Giá nhập"
          dataIndex="price"
          key="price"
          render={(text) => `${text.toLocaleString('vi-VN')} VND`}
        />
        <Table.Column
          title="Ngày nhập"
          dataIndex="importDate"
          key="importDate"
          render={(text) => moment(text).format('DD/MM/YYYY')}
        />
        <Table.Column title="Nơi lưu trữ" dataIndex="location" key="location" />
        <Table.Column
          title="Hành động"
          key="actions"
          render={(text, record) => (
            <Space>
              <Button
                type="link"
                onClick={() => handleEditEquipment(record)}
                icon={<EditOutlined />}
                disabled={record.status === 'Thanh lý'}
              >
                Sửa
              </Button>
              {/* Only show "Thanh lý" button for equipment with status "Hư hỏng" */}
              {record.status === 'Hư hỏng' && (
                <Button
                  type="link"
                  danger
                  onClick={() => handleDeleteEquipment(record.key)}
                  icon={<DeleteOutlined />}
                >
                  Thanh lý
                </Button>
              )}
              {/* New button to view history */}
              {/* <Button
                type="link"
                onClick={() => handleViewHistory(record.key)} // Call your history viewing function here
                icon={<HistoryOutlined />} // Use a suitable icon for history
              >
                Lịch sử
              </Button> */}
            </Space>
          )}
        />
      </Table>

      <Modal
        title="Thêm trang thiết bị mới"
        visible={isModalVisible}
        onOk={handleAddEquipment}
        onCancel={() => setIsModalVisible(false)}
      >
        <label>Tên trang thiết bị</label>
        <Input
          name="name"
          placeholder="Tên trang thiết bị"
          value={newEquipment.name}
          onChange={(e) =>
            setNewEquipment({ ...newEquipment, name: e.target.value })
          }
          style={{ marginBottom: '14px', marginTop: '8px' }}
        />

        <label>Số lượng</label>
        <Input
          name="quantity"
          type="number"
          placeholder="Số lượng"
          value={newEquipment.quantity}
          onChange={(e) =>
            setNewEquipment({
              ...newEquipment,
              quantity: Number(e.target.value),
            })
          }
          style={{ marginBottom: '14px', marginTop: '8px' }}
        />

        <label>Giá nhập</label>
        <Input
          name="price"
          type="number"
          placeholder="Giá nhập"
          value={newEquipment.price}
          onChange={(e) =>
            setNewEquipment({
              ...newEquipment,
              price: Number(e.target.value),
            })
          }
          style={{ marginBottom: '14px', marginTop: '8px' }}
        />

        {/* <label>Tình trạng</label>
        <Select
          value={newEquipment.status}
          onChange={(value) =>
            setNewEquipment({ ...newEquipment, status: value })
          }
          style={{ marginBottom: '14px', marginTop: '8px', width: '100%' }}
        >
          <Option value="Tốt">Tốt</Option>
          <Option value="Hư hỏng">Hư hỏng</Option>
          <Option value="Cần bảo trì">Cần bảo trì</Option>
        </Select> */}

        <label>Nơi lưu trữ</label>
        <Input
          value={newEquipment.location} // Set value to newEquipment.location
          onChange={(e) =>
            setNewEquipment({ ...newEquipment, location: e.target.value })
          }
          style={{ marginBottom: '14px', marginTop: '8px', width: '100%' }}
          placeholder="Nhập nơi lưu trữ" // Placeholder for guidance
        />
      </Modal>

      {/* Edit Equipment Modal */}
      <Modal
        title="Cập nhật trang thiết bị"
        visible={isEditModalVisible}
        onOk={handleUpdateEquipment}
        onCancel={() => setIsEditModalVisible(false)}
      >
        {editEquipment && (
          <>
            <label>Tên trang thiết bị</label>
            <Input
              name="name"
              placeholder="Tên trang thiết bị"
              value={editEquipment.name}
              onChange={(e) =>
                setEditEquipment({ ...editEquipment, name: e.target.value })
              }
              style={{ marginBottom: '14px', marginTop: '8px' }}
              disabled
            />
            {/* <label>Số lượng</label>
            <Input
              name="quantity"
              type="number"
              placeholder="Số lượng"
              value={editEquipment.quantity}
              onChange={(e) =>
                setEditEquipment({
                  ...editEquipment,
                  quantity: Number(e.target.value),
                })
              }
              style={{ marginBottom: '14px', marginTop: '8px' }}
            /> */}
            <label>Giá nhập</label>
            <Input
              name="price"
              type="number"
              placeholder="Giá nhập"
              value={editEquipment.price}
              onChange={(e) =>
                setEditEquipment({
                  ...editEquipment,
                  price: Number(e.target.value),
                })
              }
              style={{ marginBottom: '14px', marginTop: '8px' }}
            />
            <label>Tình trạng</label>
            <Select
              value={editEquipment.status}
              onChange={(value) =>
                setEditEquipment({ ...editEquipment, status: value })
              }
              style={{ marginBottom: '14px', marginTop: '8px', width: '100%' }}
            >
              <Option value="good">Tốt</Option>
              <Option value="damaged">Hư hỏng</Option>
              <Option value="needsMaintenance">Cần bảo trì</Option>
              <Option value="liquidated">Thanh lý</Option>
            </Select>
            <label>Nơi lưu trữ</label>
            <Input
              value={editEquipment.location}
              onChange={(e) =>
                setNewEquipment({ ...editEquipment, location: e.target.value })
              }
              style={{ marginBottom: '14px', marginTop: '8px', width: '100%' }}
              placeholder="Nhập nơi lưu trữ"
              disabled
            />
          </>
        )}
      </Modal>
    </div>
  );
};

export default EquipmentManagement;
