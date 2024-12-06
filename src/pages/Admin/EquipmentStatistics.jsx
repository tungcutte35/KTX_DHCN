import React, { useState } from 'react';
import { Table, Button, Modal, Select, Input, Tag } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const { Option } = Select;

// Initial equipment data
const initialEquipmentData = [
  // Hư hỏng
  {
    key: '1',
    name: 'Giường',
    code: 'TH002',
    brokenCount: 2,
    year: 2024,
    status: 'Hư hỏng',
    date: '2024-10-01',
    quantity: 5,
    action: 'Nhập',
  },
  {
    key: '2',
    name: 'Ghế',
    code: 'GS001',
    brokenCount: 3,
    year: 2024,
    status: 'Hư hỏng',
    date: '2024-10-01',
    quantity: 2,
    action: 'Nhập',
  },
  {
    key: '3',
    name: 'Máy lạnh',
    code: 'ML001',
    brokenCount: 1,
    year: 2024,
    status: 'Hư hỏng',
    date: '2024-10-01',
    quantity: 1,
    action: 'Nhập',
  },

  // Nguyên vẹn
  {
    key: '4',
    name: 'Tủ',
    code: 'T002',
    brokenCount: 0,
    year: 2024,
    status: 'Nguyên vẹn',
    date: '2024-10-01',
    quantity: 8,
    action: 'Nhập',
  },
  {
    key: '5',
    name: 'Bàn',
    code: 'B002',
    brokenCount: 0,
    year: 2024,
    status: 'Nguyên vẹn',
    date: '2024-10-01',
    quantity: 4,
    action: 'Nhập',
  },

  // Cần bảo trì
  {
    key: '6',
    name: 'Ghế nhựa',
    code: 'GN009',
    brokenCount: 1,
    year: 2024,
    status: 'Cần bảo trì',
    date: '2024-10-01',
    quantity: 3,
    action: 'Nhập',
  },
  {
    key: '7',
    name: 'Đèn trần',
    code: 'DT001',
    brokenCount: 0,
    year: 2024,
    status: 'Cần bảo trì',
    date: '2024-10-01',
    quantity: 10,
    action: 'Nhập',
  },

  // Thanh lý
  {
    key: '8',
    name: 'Ghế nhựa',
    code: 'GN012',
    brokenCount: 10,
    year: 2024,
    status: 'Thanh lý',
    date: '2024-10-01',
    quantity: 0,
    action: 'Thanh lý',
  },
  {
    key: '9',
    name: 'Bình nước',
    code: 'TH002',
    brokenCount: 2,
    year: 2024,
    status: 'Thanh lý',
    date: '2024-10-01',
    quantity: 0,
    action: 'Thanh lý',
  },
];

const EquipmentStatistics = () => {
  const [selectedYear, setSelectedYear] = useState('');
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedDetailStatus, setSelectedDetailStatus] = useState('');
  const [equipmentNameFilter, setEquipmentNameFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const handleYearChange = (value) => {
    setSelectedYear(value);
  };

  const showDetail = (status) => {
    setSelectedDetailStatus(status);
    setDetailVisible(true);
  };

  // Create a summary of the equipment statistics
  const equipmentSummary = initialEquipmentData
    .filter((item) => !selectedYear || item.year === parseInt(selectedYear))
    .reduce((acc, item) => {
      const existing = acc.find(
        (summary) =>
          summary.status === item.status && summary.year === item.year
      );

      if (existing) {
        existing.count += 1; // Increment the count if the status and year already exist
      } else {
        acc.push({
          key: `${item.status}-${item.year}`, // Create a unique key for each combination
          status: item.status,
          count: 1, // Start count at 1
          year: item.year, // Use the item's year
        });
      }

      return acc;
    }, []);

  const filteredEquipmentData = initialEquipmentData.filter(
    (item) =>
      (selectedYear ? item.year === selectedYear : true) &&
      (statusFilter ? item.status === statusFilter : true) &&
      item.name.toLowerCase().includes(equipmentNameFilter.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Nguyên vẹn':
        return 'green';
      case 'Hư hỏng':
        return 'red';
      case 'Cần bảo trì':
        return 'orange';
      case 'Thanh lý':
        return 'gray';
      default:
        return 'black';
    }
  };

  // Columns for Equipment Summary Table
  const summaryColumns = [
    {
      title: 'Năm',
      dataIndex: 'year',
      key: 'year',
    },
    {
      title: 'Tình trạng',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: 'Số lượng',
      dataIndex: 'count',
      key: 'count',
    },
    {
      title: 'Chi tiết',
      key: 'detail',
      render: (text, record) => (
        <Button onClick={() => showDetail(record.status)}>Xem chi tiết</Button>
      ),
    },
  ];

  // Columns for Detailed Inventory Table
  const inventoryColumns = [
    {
      title: 'Mã thiết bị',
      dataIndex: 'code', // Add the code property for device code
      key: 'code',
    },
    {
      title: 'Tên thiết bị',
      dataIndex: 'name',
      key: 'name',
    },

    // {
    //   title: 'Số lượng',
    //   dataIndex: 'quantity',
    //   key: 'quantity',
    // },
    {
      title: 'Trạng thái',
      dataIndex: 'action',
      key: 'action',
      render: (text, record) => (
        <Tag color={getStatusColor(record.status)}>{record.status}</Tag>
      ),
    },
  ];

  // Export to Excel function
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Thống kê thiết bị');

    sheet.columns = [
      { header: 'Tên thiết bị', key: 'name', width: 30 },
      { header: 'Số lượng hư hỏng', key: 'brokenCount', width: 20 },
      { header: 'Năm', key: 'year', width: 15 },
      { header: 'Tình trạng', key: 'status', width: 20 },
    ];

    initialEquipmentData.forEach((item) => {
      sheet.addRow(item);
    });

    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).alignment = { horizontal: 'center' };
    sheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), 'thongke_thietbi.xlsx');
  };

  return (
    <div style={{ padding: '24px' }}>
      <h2>Thống kê thiết bị</h2>
      <div>
        <Select
          placeholder="Chọn năm"
          onChange={handleYearChange}
          style={{ width: 120, marginRight: 10 }}
        >
          <Option value="2024">2024</Option>
          <Option value="2023">2023</Option>
          <Option value="2022">2022</Option>
          {/* Add more years as needed */}
        </Select>

        <Button
          type="primary"
          onClick={exportToExcel}
          icon={<ExportOutlined />}
          style={{ marginLeft: 10 }}
        >
          Xuất Excel
        </Button>
      </div>
      <Table
        dataSource={equipmentSummary}
        columns={summaryColumns}
        style={{ marginTop: '20px' }}
        pagination={false}
      />
      <Modal
        title={`Chi tiết thiết bị - ${selectedDetailStatus}`}
        visible={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
      >
        <Table
          dataSource={filteredEquipmentData.filter(
            (item) => item.status === selectedDetailStatus
          )}
          columns={inventoryColumns}
          pagination={false}
        />
      </Modal>
    </div>
  );
};

export default EquipmentStatistics;
