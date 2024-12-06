import React, { useContext, useEffect, useState } from 'react';
import {
  Table,
  Input,
  Button,
  message,
  Modal,
  Radio,
  Row,
  Col,
  Tag,
  Space,
  Select,
  List,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import ExcelJS from 'exceljs';
import { Helmet } from 'react-helmet';
import { BuildingContext } from '../../context/BuildingContext';
import { getEquipmentsRoomByAdmin } from '../../services/admin/equipmentsRoomManager';
import Cookies from 'js-cookie';
import { updateEquipmentsListByAdmin } from '../../services/admin/equipmentsManager';
const { Option } = Select;
const EquipmentManagement = () => {
  const [searchText, setSearchText] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [expandedBuildingKeys, setExpandedBuildingKeys] = useState([]);
  const [expandedFloorKeys, setExpandedFloorKeys] = useState([]);
  const [studentModalVisible, setStudentModalVisible] = useState(false);
  const [selectedRoomStudents, setSelectedRoomStudents] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [roomSelectionModalVisible, setRoomSelectionModalVisible] =
    useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [equipmentData, setEquipmentData] = useState([]); //
  const [error, setError] = useState('');
  const statuses = ['Tốt', 'Hư hỏng', 'Cần bảo trì']; // Define possible statuses for beds
  const { buildingData, loading } = useContext(BuildingContext);

  const navigate = useNavigate();

  // useEffect(() => {
  //   if (roomSelectionModalVisible && selectedStudent) {
  //     setSelectedRoom(selectedStudent.currentRoom);
  //   }
  // }, [roomSelectionModalVisible, selectedStudent]);

  const showModal = async (room) => {
    setSelectedRoom(room);
    setIsModalVisible(true);
    const token = Cookies.get('token');

    if (!token) {
      message.info('Vui lòng đăng nhập để tiếp tục!');
      window.location.reload();
      navigate('/login');
      throw new Error('No token found');
    }

    try {
      const data = await getEquipmentsRoomByAdmin(token, room.roomNumber);
      console.log('Fetched equipment data:', data);
      setEquipmentData(data); // Set the fetched data
    } catch (err) {
      console.error('Error fetching equipment data:', err);
      setError('Error fetching equipment data');
    }
  };
  useEffect(() => {
    if (selectedRoom) {
      console.log('Selected room updated:', selectedRoom);
    }
  }, [selectedRoom]);
  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedRoom(null);
    setEquipmentData([]); // Clear equipment data
  };

  const [forms, setForms] = useState(buildingData);
  const [filteredData, setFilteredData] = useState(buildingData);

  // Filter logic remains the same
  const filteredBuildingData = buildingData
    .filter((building) => {
      // Exclude building G for male students
      if (genderFilter === 'male' && building.key === 'G') return false;
      return true;
    })
    .map((building) => ({
      ...building,
      floors: building.floors
        .filter((floor) => {
          // Apply gender-based filtering for floors in Building I
          if (genderFilter === 'male' && building.key === 'I') {
            // Show floors 8 to 12 for male students in Building I
            return floor.floor >= 8 && floor.floor <= 12;
          }
          if (genderFilter === 'female') {
            if (building.key === 'I') {
              // Show floors 3 to 7 for female students in Building I
              return floor.floor >= 3 && floor.floor < 8;
            }
            if (building.key === 'G') {
              // Show all floors in Building G for female students
              return true;
            }
          }
          return true; // No filter for other cases
        })
        .map((floor) => {
          // Filter rooms based on search text and availability
          const filteredRooms = floor.rooms.filter((room) => {
            const matchesSearch = room.roomNumber
              .toLowerCase()
              .includes(searchText.toLowerCase());
            const matchesAvailability =
              availabilityFilter === 'all' ||
              (availabilityFilter === 'available' &&
                room.availableForRegistration);
            return matchesSearch && matchesAvailability;
          });

          return {
            ...floor,
            rooms: filteredRooms,
          };
        })
        .filter((floor) => floor.rooms.length > 0), // Only keep floors with matching rooms
    }))
    .filter((building) => building.floors.length > 0); // Only keep buildings with floors that have matching rooms

  const columns = [
    {
      title: 'Số phòng',
      dataIndex: 'roomNumber',
      key: 'roomNumber',
      align: 'center',
    },
    {
      title: 'Số lượng SV hiện tại',
      dataIndex: 'available',
      key: 'available',
      align: 'center',
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center',
      render: (record) => (
        <Button icon={<SettingOutlined />} onClick={() => showModal(record)}>
          {' '}
          Xem chi tiết
        </Button>
      ),
    },
  ];

  const statusMapping = {
    good: 'Tốt',
    damaged: 'Hư hỏng',
    needMaintenance: 'Cần bảo trì',
    liquidated: 'Thanh lý',
  };
  const columnss = [
    {
      title: 'Mã thiết bị',
      dataIndex: 'key',
      key: 'key',
    },
    {
      title: 'Tên thiết bị',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (text, record) => {
        let color;
        let statusText;

        switch (record.status) {
          case 'good':
            color = 'green';
            statusText = 'Tốt';
            break;
          case 'needMaintenance':
            color = 'orange';
            statusText = 'Cần bảo trì';
            break;
          case 'damaged':
            color = 'red';
            statusText = 'Hư hỏng';
            break;
          case 'liquidated':
            color = 'black';
            statusText = 'Thanh lý';
            break;
          default:
            color = 'black';
            translatedStatus = 'Không xác định';
        }

        return <span style={{ color }}>{statusText}</span>;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (text, record) => (
        <Select
          defaultValue={statusMapping[record.status]}
          style={{ width: 120 }}
          onChange={(value) => handleStatusChange(record.key, value)}
        >
          {Object.keys(statusMapping).map((status) => (
            <Option key={status} value={status}>
              {statusMapping[status]}{' '}
            </Option>
          ))}
        </Select>
      ),
    },
  ];
  const handleStatusChange = async (key, newStatus) => {
    console.log('Key:', key); // Kiểm tra giá trị key nhận được
    console.log('New Status:', newStatus); // Kiểm tra giá trị newStatus nhận được

    const token = Cookies.get('token');
    if (!token) {
      message.info('Vui lòng đăng nhập để tiếp tục!');
      window.location.reload();
      navigate('/login');
      throw new Error('No token found');
    }

    try {
      const response = await updateEquipmentsListByAdmin(
        token,
        {
          status: newStatus,
        },
        key
      );

      if (response) {
        const updatedData = equipmentData.map((item) =>
          item.key === key ? { ...item, status: newStatus } : item
        );
        setEquipmentData(updatedData);
        message.success('Cập nhật trạng thái thiết bị thành công!');
      } else {
        message.error('Cập nhật trạng thái thiết bị thất bại!');
      }
    } catch (error) {
      console.error('Error updating equipment status:', error);
      message.error('Đã xảy ra lỗi khi cập nhật trạng thái thiết bị.');
    }
  };

  const buildingColumns = [
    {
      dataIndex: 'key',
      key: 'key',
      render: (text) => <strong>Nhà {text}</strong>,
    },
  ];
  // const exportToExcel = async () => {
  //   const workbook = new ExcelJS.Workbook();
  //   const worksheet = workbook.addWorksheet('Thống kê thiết bị');

  //   // Define the columns for the worksheet
  //   worksheet.columns = [
  //     { header: 'Phòng', key: 'room', width: 15 },
  //     { header: 'Mã thiết bị', key: 'equipmentCode', width: 20 },
  //     { header: 'Tên thiết bị', key: 'equipmentName', width: 30 },
  //     { header: 'Trạng thái thiết bị', key: 'equipmentStatus', width: 20 },
  //   ];

  //   let startRow = 2; // Start from the second row after the header
  //   let roomSpanStart = startRow; // Track the starting row for merging rooms

  //   // Use the current filtered data for export
  //   filteredData.forEach((building) => {
  //     building.floors.forEach((floor) => {
  //       floor.rooms.forEach((room) => {
  //         const equipmentCount = room.equipment.length;

  //         // Check if room has no equipment
  //         if (equipmentCount === 0) {
  //           const emptyRow = {
  //             room: room.roomNumber,
  //             equipmentCode: '', // No equipment data
  //             equipmentName: '',
  //             equipmentStatus: '',
  //           };
  //           worksheet.addRow(emptyRow);
  //           roomSpanStart = startRow++; // Move to the next row
  //           return;
  //         }

  //         // Loop through equipment and add rows
  //         room.equipment.forEach((equipment, index) => {
  //           const row = {
  //             room: room.roomNumber,
  //             equipmentCode: equipment.code,
  //             equipmentName: equipment.name,
  //             equipmentStatus: equipment.status,
  //           };

  //           // Add the row for each equipment
  //           worksheet.addRow(row);

  //           // Check if we are at the last equipment for the room
  //           if (index === equipmentCount - 1) {
  //             // Merge room cells vertically from start to current row
  //             if (equipmentCount > 1) {
  //               worksheet.mergeCells(
  //                 `A${roomSpanStart}:A${startRow + equipmentCount - 1}`
  //               );
  //             }

  //             // Center align the merged room cell
  //             worksheet.getCell(`A${roomSpanStart}`).alignment = {
  //               vertical: 'middle',
  //               horizontal: 'center',
  //             };

  //             // Move to the next room
  //             roomSpanStart = startRow + equipmentCount;
  //           }
  //         });

  //         // Adjust row tracking to move to the next room
  //         startRow += equipmentCount;
  //       });
  //     });
  //   });

  //   // Format the header row (bold text and centered alignment)
  //   worksheet.getRow(1).font = { bold: true };
  //   worksheet.getRow(1).alignment = { horizontal: 'center' };

  //   // Apply border to all cells in the sheet
  //   worksheet.eachRow({ includeEmpty: true }, (row) => {
  //     row.eachCell({ includeEmpty: true }, (cell) => {
  //       cell.border = {
  //         top: { style: 'thin' },
  //         left: { style: 'thin' },
  //         bottom: { style: 'thin' },
  //         right: { style: 'thin' },
  //       };
  //     });
  //   });

  //   // Generate Excel file and trigger download
  //   const buffer = await workbook.xlsx.writeBuffer();
  //   const blob = new Blob([buffer], { type: 'application/octet-stream' });
  //   const url = window.URL.createObjectURL(blob);
  //   const a = document.createElement('a');
  //   a.href = url;
  //   a.download = 'thong_ke_thiet_bi.xlsx';
  //   a.click();
  //   window.URL.revokeObjectURL(url);
  // };

  const onSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);

    const filtered = buildingData
      .map((building) => ({
        ...building,
        floors: building.floors
          .map((floor) => ({
            ...floor,
            rooms: floor.rooms.filter(
              (room) =>
                room.roomNumber.toLowerCase().includes(value) ||
                room.equipment.some((equipment) =>
                  equipment.name.toLowerCase().includes(value)
                )
            ),
          }))
          .filter((floor) => floor.rooms.length > 0),
      }))
      .filter((building) => building.floors.length > 0);

    setFilteredData(filtered);
  };

  return (
    <div>
      <div style={{ padding: '24px' }}>
        <Helmet>
          <title>Quản lý thiết bị phòng ở</title>
          <link rel="icon" href="../../src/assets/iuh.jpg" />
        </Helmet>
        <Col xs={24} sm={24} md={24} lg={20} xl={18}>
          <h2>Quản lý thiết bị phòng ktx</h2>
          <Row gutter={[16, 16]}>
            <Col xs={16} sm={12} md={8} lg={6}>
              <Input.Search
                placeholder="Tìm kiếm phòng..."
                onChange={onSearch}
                style={{ width: '100%' }}
              />
            </Col>
            {/* <Col xs={8} sm={12} md={8} lg={6}>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={exportToExcel}
                style={{ width: '100%' }}
              >
                Xuất Excel
              </Button>
            </Col> */}
          </Row>
        </Col>
        <Row gutter={16} style={{ marginTop: '15px' }}>
          <Col span={24}>
            <Table
              columns={buildingColumns}
              expandable={{
                expandedRowRender: (building) => (
                  <Row gutter={[16, 16]}>
                    {building.floors.map((floor) => (
                      <Col xs={24} sm={24} md={24} lg={12} key={floor.key}>
                        <div
                          style={{
                            marginBottom: '20px',
                            backgroundColor: '#f5f5f5',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            padding: '10px',
                          }}
                        >
                          <div
                            style={{
                              fontSize: '16px',
                              cursor: 'pointer',
                              marginBottom: '10px',
                            }}
                            onClick={() => {
                              const newExpandedKeys =
                                expandedFloorKeys.includes(floor.key)
                                  ? expandedFloorKeys.filter(
                                      (key) => key !== floor.key
                                    )
                                  : [...expandedFloorKeys, floor.key];
                              setExpandedFloorKeys(newExpandedKeys);
                            }}
                          >
                            <Space size={[8, 16]} align="center">
                              {expandedFloorKeys.includes(floor.key)
                                ? '▲'
                                : '▼'}
                              <span
                                style={{
                                  color: '#427CFF',
                                  fontWeight: 'bold',
                                }}
                              >
                                {`Lầu ${floor.floorNumber}`}
                              </span>
                            </Space>
                          </div>
                          {expandedFloorKeys.includes(floor.key) && (
                            <Table
                              columns={columns}
                              dataSource={floor.rooms}
                              pagination={false}
                              scroll={{ x: '100px' }}
                              size="small"
                            />
                          )}
                        </div>
                      </Col>
                    ))}
                  </Row>
                ),
                rowExpandable: (record) => record.floors.length > 0,
                expandedRowKeys: expandedBuildingKeys,
                onExpand: (expanded, record) => {
                  const newExpandedKeys = expanded
                    ? [...expandedBuildingKeys, record.key]
                    : expandedBuildingKeys.filter((key) => key !== record.key);
                  setExpandedBuildingKeys(newExpandedKeys);
                },
              }}
              dataSource={filteredBuildingData}
              pagination={false}
            />
          </Col>
        </Row>

        <Modal
          title="Danh sách thiết bị"
          visible={isModalVisible}
          onCancel={handleCancel}
          footer={null}
          width="90%"
          style={{ maxWidth: '1000px' }}
        >
          {selectedRoom ? (
            <Table
              bordered
              dataSource={equipmentData}
              columns={columnss}
              rowKey="key"
              scroll={{ x: 'max-content' }}
            />
          ) : (
            <div>
              No room selected. Please select a room to see the details.
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default EquipmentManagement;
