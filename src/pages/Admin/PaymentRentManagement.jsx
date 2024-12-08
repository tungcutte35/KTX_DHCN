import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Space, Input, Select, message } from 'antd';
import { DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import ExcelJS from 'exceljs';
import { Helmet } from 'react-helmet';
import { getRoomPaymentDetailsByAdmin } from '../../services/admin/paymentManager';
const { Option } = Select;
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
const PaymentRentManagement = () => {
  const [roomFees, setRoomFees] = useState([]); // State for holding room fees
  const [selectedRoomFee, setSelectedRoomFee] = useState(null);
  const [isRoomFeeModalVisible, setIsRoomFeeModalVisible] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state for API call

  // Filter states
  const [roomFilter, setRoomFilter] = useState('');
  const [descriptionFilter, setDescriptionFilter] = useState('');

  const navigate = useNavigate();
  // Fetch data on component mount
  useEffect(() => {
    const fetchRoomPaymentDetails = async () => {
      setLoading(true);
      try {
        const token = Cookies.get('token');
        if (!token) {
          message.info('Vui lòng đăng nhập để tiếp tục!');
          window.location.reload();
          navigate('/login');
          throw new Error('No token found');
        }
        const data = await getRoomPaymentDetailsByAdmin(token);
        setRoomFees(data); // Update state with the fetched data
      } catch (error) {
        message.error('Failed to load room payment details.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoomPaymentDetails();
  }, []);

  const showRoomFeeModal = (record) => {
    setSelectedRoomFee(record);
    setIsRoomFeeModalVisible(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Filter room fees based on filters
  const filteredRoomFees = roomFees.filter((fee) => {
    return (
      fee.room.includes(roomFilter) &&
      fee.description.includes(descriptionFilter)
    );
  });

  const descriptionOptions = [
    { value: 'Tiền phòng năm học', label: 'Tiền phòng năm học' },
    { value: 'Tiền phòng 2 tháng hè', label: 'Tiền phòng 2 tháng hè' },
  ];

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Tiền Phòng');

    worksheet.columns = [
      { header: 'Phòng', key: 'room', width: 20 },
      { header: 'Mô tả', key: 'description', width: 30 },
      { header: 'Tên Sinh Viên', key: 'studentName', width: 25 },
      { header: 'MSSV', key: 'mssv', width: 15 },
      { header: 'Số tiền còn nợ', key: 'amountOwed', width: 25 },
      { header: 'Hạn đóng', key: 'dueDate', width: 15 },
      { header: 'Trạng thái', key: 'status', width: 15 },
    ];

    // Populate the worksheet with filtered data
    filteredRoomFees.forEach((fee) => {
      fee.students.forEach((student) => {
        worksheet.addRow({
          room: fee.room,
          description: fee.description,
          studentName: student.name,
          mssv: student.studentId,
          amountOwed: formatCurrency(student.amount),
          dueDate: moment(student.dueDate).format('DD/MM/YYYY'),
          status:
            student.status === 'paid'
              ? 'Đã thanh toán'
              : student.status === 'unpaid'
              ? 'Chưa thanh toán'
              : '',
        });
      });
    });

    // Formatting the header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tiền_phòng.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Helmet>
        <title>Quản lý tiền phòng</title>
        <link rel="icon" href="../../src/assets/iuh.jpg" />
      </Helmet>
      <h2>Thống kê tình trạng thanh toán</h2>

      <h3>Tiền phòng</h3>

      <div
        style={{
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <Input
            placeholder="Lọc theo phòng"
            value={roomFilter}
            onChange={(e) => setRoomFilter(e.target.value)}
            style={{ width: 200, marginRight: '8px' }}
          />
          <Select
            placeholder="Lọc theo mô tả"
            value={descriptionFilter}
            onChange={(value) => setDescriptionFilter(value)}
            style={{ width: 200, marginRight: '8px' }}
          >
            <Option value="">Tất cả</Option>
            {descriptionOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </div>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={exportToExcel}
          style={{ marginBottom: '16px', marginRight: '20px' }}
          loading={loading} // Show loading state for the export button
        >
          Xuất Excel
        </Button>
      </div>
      <h3>Tổng số lọc được: {filteredRoomFees.length}</h3>
      <Table dataSource={filteredRoomFees} rowKey="key" loading={loading}>
        <Table.Column title="Phòng" dataIndex="room" key="room" />
        <Table.Column title="Mô tả" dataIndex="description" key="description" />
        <Table.Column
          title="Hành động"
          key="action"
          render={(text, record) => (
            <Space>
              <Button
                type="link"
                onClick={() => showRoomFeeModal(record)}
                icon={<EyeOutlined />}
              >
                Xem chi tiết
              </Button>
            </Space>
          )}
        />
      </Table>

      <Modal
        title="Chi tiết tiền phòng"
        visible={isRoomFeeModalVisible}
        onOk={() => setIsRoomFeeModalVisible(false)}
        onCancel={() => setIsRoomFeeModalVisible(false)}
        width={600}
      >
        {selectedRoomFee && (
          <div>
            <p>
              <strong>Phòng:</strong> {selectedRoomFee.room}
            </p>
            <p>
              <strong>Số tiền chưa thanh toán:</strong>{' '}
              {formatCurrency(selectedRoomFee.unpaidAmount)}
            </p>
            <p>
              <strong>Mô tả:</strong> {selectedRoomFee.description}
            </p>
            <h4>Danh sách sinh viên</h4>
            <Table
              dataSource={selectedRoomFee.students}
              rowKey={(student) => student.mssv}
            >
              <Table.Column title="Tên" dataIndex="name" key="name" />
              <Table.Column
                title="Số tiền"
                key="amount"
                render={(text, record) => (
                  <span>{formatCurrency(record.amount)}</span>
                )}
              />
              <Table.Column
                title="Hạn đóng"
                dataIndex="dueDate"
                key="dueDate"
                render={(dueDate) => {
                  const formattedDate = new Intl.DateTimeFormat('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  }).format(new Date(dueDate));
                  return formattedDate;
                }}
              />
              <Table.Column
                title="Trạng thái"
                key="status"
                render={(text, record) => (
                  <span
                    style={{
                      color: record.status === 'paid' ? 'green' : 'red',
                    }}
                  >
                    {record.status === 'paid'
                      ? 'Đã thanh toán'
                      : 'Chưa thanh toán'}
                  </span>
                )}
              />
            </Table>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PaymentRentManagement;
