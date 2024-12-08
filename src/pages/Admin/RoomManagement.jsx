import React, { useContext, useEffect, useRef, useState } from 'react';
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
import ExcelJS from 'exceljs'; // Import exceljs
import { Helmet } from 'react-helmet';
import { BuildingContext } from '../../context/BuildingContext';
import Cookies from 'js-cookie';
import {
  getStudentsByRoomByAdmin,
  updateStudentBtAdmin,
} from '../../services/admin/studentManager';
import {
  getEquipmentsRoomByAdmin,
  getRoomsAvailableRoomByAdmin,
} from '../../services/admin/equipmentsRoomManager';
const { Option } = Select;
const StudentRoomManagement = () => {
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
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [roomSelectionModalVisible, setRoomSelectionModalVisible] =
    useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [equipmentDatas, setEquipmentDatas] = useState([]);
  const { buildingData, loading } = useContext(BuildingContext);
  const [equipmentData, setEquipmentData] = useState([]);
  const [gender, setGender] = useState('male');
  const [rooms, setRooms] = useState([]);
  const debounceTimeoutRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (roomSelectionModalVisible && selectedStudent) {
      setSelectedRoom(selectedStudent.currentRoom);
    }
  }, [roomSelectionModalVisible, selectedStudent]);
  const handleConfirmChangeRoom = async (roomNumber) => {
    if (roomNumber) {
      try {
        const token = Cookies.get('token');

        if (!token) {
          message.info('Vui lòng đăng nhập để tiếp tục!');
          window.location.reload();
          navigate('/login');
          return;
        }

        const response = await updateStudentBtAdmin(
          selectedStudent.studentId,
          { roomName: roomNumber },
          token
        );

        if (response) {
          message.success('Cập nhật phòng thành công!');
          setRoomSelectionModalVisible(false);

          setStudentModalVisible(false);
        } else {
          message.error('Cập nhật phòng thất bại!');
        }
      } catch (error) {
        console.error('Error updating room:', error);
        message.error('Không thể cập nhật phòng!');
      }
    }
  };

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

  useEffect(() => {
    const gender = selectedStudent?.gender || 'female';

    const fetchRooms = async () => {
      if (loading) return;

      try {
        const token = Cookies.get('token');
        if (!token) {
          message.info('Vui lòng đăng nhập để tiếp tục!');
          window.location.reload();
          navigate('/login');
          return;
        }

        const data = await getRoomsAvailableRoomByAdmin(token, gender);
        setRooms(data);
      } catch (error) {
        console.error('Error fetching rooms:', error);
        message.error('Không thể tải dữ liệu phòng!');
      }
    };

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      fetchRooms();
    }, 300);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [selectedStudent?.gender, navigate]);
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const [forms, setForms] = useState(buildingData);
  const [filteredData, setFilteredData] = useState(buildingData);
  // Filter logic remains the same
  const filteredBuildingData = buildingData
    .filter((building) => {
      if (genderFilter === 'male' && building.key === 'G') return false;
      return true;
    })
    .map((building) => ({
      ...building,
      floors: building.floors
        .filter((floor) => {
          if (genderFilter === 'male' && building.key === 'I') {
            return floor.floor >= 8 && floor.floor <= 12;
          }
          if (genderFilter === 'female') {
            if (building.key === 'I') {
              return floor.floor >= 3 && floor.floor < 8;
            }
            if (building.key === 'G') {
              return true;
            }
          }
          return true;
        })
        .map((floor) => {
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
        .filter((floor) => floor.rooms.length > 0),
    }))
    .filter((building) => building.floors.length > 0);

  const handleViewStudents = async (room, floor, building) => {
    const token = Cookies.get('token');
    if (!token) {
      message.info('Vui lòng đăng nhập để tiếp tục!');
      window.location.reload();
      navigate('/login');
      return;
    }
    try {
      // Fetch students from the API
      const students = await getStudentsByRoomByAdmin(room.roomNumber);

      // Update state with room and student details
      setSelectedRoom(room.roomNumber);
      setSelectedRoomStudents(students); // Update table data
      setSelectedFloor(floor.floor);
      setStudentModalVisible(true); // Show modal
    } catch (error) {
      console.error('Failed to fetch students:', error);
      message.error('Không tìm thấy học sinh nào trong phòng này.');
    }
  };

  const handleChangeRoom = (student) => {
    setSelectedStudent(student);
    setSelectedRoom(student.currentRoom);
    setRoomSelectionModalVisible(true);
  };

  const getAvailableRooms = (gender) => {
    const availableRooms = [];

    buildingData.forEach((building) => {
      building.floors.forEach((floor) => {
        floor.rooms.forEach((room) => {
          if (room.gender === gender && room.availableForRegistration) {
            availableRooms.push({
              roomNumber: room.roomNumber,
              gender: room.gender,
              available: room.available,
            });
          }
        });
      });
    });

    return availableRooms.filter((room) => room.gender === gender);
  };

  const handleOpenRoomSelection = (student) => {
    setSelectedStudent(student); // Set the selected student for room change
    setRoomSelectionModalVisible(true); // Show the room selection modal
  };
  const columns = [
    {
      title: 'Số phòng',
      dataIndex: 'roomNumber',
      key: 'roomNumber',
      align: 'center',
    },
    {
      title: 'Tình trạng',
      dataIndex: 'available', // Available value like "7/10"
      key: 'available',
      align: 'center',
      render: (available) => {
        const [current, total] = available.split('/').map(Number);

        const isFull = current === 0;

        return (
          <Tag color={isFull ? 'red' : 'green'}>
            {isFull ? 'Đã đầy' : `Còn trống`}
          </Tag>
        );
      },
    },
    {
      title: 'Còn trống',
      dataIndex: 'available',
      key: 'available',
      align: 'center',
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center',
      render: (text, record, floor, building) => (
        <Space size="middle">
          <Button
            icon={<EyeOutlined />}
            style={{ color: 'blue', borderColor: 'blue' }}
            onClick={() => handleViewStudents(record, floor, building)}
          ></Button>
          {/* <Button
              icon={<EditOutlined />}
              style={{ color: 'green', borderColor: 'green' }}
              onClick={() => {
                // Handle edit action
              }}
            ></Button> */}
          <Button
            icon={<SettingOutlined />}
            onClick={() => showModal(record)}
          ></Button>
        </Space>
      ),
    },
  ];
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
        let translatedStatus;

        switch (record.status) {
          case 'good':
            color = 'green';
            translatedStatus = 'Tốt';
            break;
          case 'needMaintenance':
            color = 'orange';
            translatedStatus = 'Cần bảo trì';
            break;
          case 'damaged':
            color = 'red';
            translatedStatus = 'Hỏng';
            break;
          case 'liquidated':
            color = 'black';
            translatedStatus = 'Thanh lý';
            break;
          default:
            color = 'black';
            translatedStatus = 'Không xác định';
        }

        return <span style={{ color }}>{translatedStatus}</span>;
      },
    },
  ];

  const buildingColumns = [
    {
      dataIndex: 'key',
      key: 'key',
      render: (text) => <strong> Nhà {text}</strong>,
    },
  ];
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
                room.students.some((student) =>
                  student.name.toLowerCase().includes(value)
                )
            ),
          }))
          .filter((floor) => floor.rooms.length > 0),
      }))
      .filter((building) => building.floors.length > 0);

    setFilteredData(filtered);
  };
  // const exportToExcel = async () => {
  //   const workbook = new ExcelJS.Workbook();
  //   const worksheet = workbook.addWorksheet('Thống kê phòng ở');

  //   // Define columns for the Excel sheet
  //   worksheet.columns = [
  //     { header: 'Phòng', key: 'room', width: 15 },
  //     { header: 'Số lượng SV hiện tại', key: 'studentCount', width: 20 },
  //     { header: 'Danh sách tên SV', key: 'studentNames', width: 30 },
  //     { header: 'Danh sách thiết bị', key: 'equipment', width: 30 },
  //     { header: 'Tình trạng', key: 'status', width: 20 },
  //   ];

  //   let rowCount = 1;

  //   // Safely loop through the filtered data
  //   filteredBuildingData?.forEach((building) => {
  //     building.floors?.forEach((floor) => {
  //       floor.rooms?.forEach((room) => {
  //         // Find the students and equipment for this room
  //         const selectedRoom =
  //           selectedRoomStudents.find(
  //             (student) => student.roomNumber === room.roomNumber
  //           ) || {};
  //         const equipmentInRoom = equipmentData.filter(
  //           (equipment) => equipment.roomNumber === room.roomNumber
  //         );

  //         // Ensure students and equipment exist
  //         const studentNames = Array.isArray(selectedRoom)
  //           ? selectedRoom.map((student) => student.name).join(', ')
  //           : 'N/A';

  //         const equipmentList =
  //           equipmentInRoom && equipmentInRoom.length > 0
  //             ? equipmentInRoom.map((e) => e.name).join(', ')
  //             : 'N/A';

  //         const row = {
  //           id: rowCount++,
  //           room: room.roomNumber || 'N/A',
  //           status:
  //             room.available && room.available.split('/')[0] === '0'
  //               ? 'Đã đầy'
  //               : 'Còn trống',

  //           studentCount: room.available,
  //           studentNames: studentNames,
  //           equipment: equipmentList,
  //         };

  //         worksheet.addRow(row);
  //       });
  //     });
  //   });

  //   // Make the first row bold and centered
  //   worksheet.getRow(1).font = { bold: true };
  //   worksheet.getRow(1).alignment = { horizontal: 'center' };

  //   // Add borders to all cells
  //   worksheet.eachRow((row) => {
  //     row.eachCell((cell) => {
  //       cell.border = {
  //         top: { style: 'thin' },
  //         left: { style: 'thin' },
  //         bottom: { style: 'thin' },
  //         right: { style: 'thin' },
  //       };
  //     });
  //   });

  //   try {
  //     // Generate the Excel file and trigger download
  //     const buffer = await workbook.xlsx.writeBuffer();
  //     const blob = new Blob([buffer], { type: 'application/octet-stream' });
  //     const url = window.URL.createObjectURL(blob);
  //     const a = document.createElement('a');
  //     a.href = url;
  //     a.download = 'thong_ke_phong_o.xlsx';
  //     a.click();
  //     window.URL.revokeObjectURL(url);
  //   } catch (error) {
  //     console.error('Error exporting to Excel:', error);
  //   }
  // };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <Helmet>
          <title>Quản lý phòng ở</title>
          <link rel="icon" href="../../src/assets/iuh.jpg" />
        </Helmet>
        <div style={{ maxWidth: '1200px', width: '100%' }}>
          <h2 style={{ textAlign: 'left' }}>Quản lý phòng ở</h2>
          <Row gutter={16}>
            <Col span={6}>
              <Input.Search
                placeholder="Tìm kiếm phòng..."
                onChange={onSearch}
                style={{ marginBottom: '20px' }}
              />
            </Col>
            {/* <Col span={6}>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={exportToExcel}
                style={{ marginBottom: '16px' }}
              >
                Xuất Excel
              </Button>
            </Col> */}
          </Row>
          <Row gutter={16} style={{ marginTop: '15px' }}>
            <Col span={24}>
              <Table
                columns={buildingColumns}
                expandable={{
                  expandedRowRender: (building) => (
                    <Row gutter={16}>
                      {building.floors.map((floor) => (
                        <Col span={12} key={floor.key}>
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
                              {expandedFloorKeys.includes(floor.key)
                                ? ' ▲'
                                : ' ▼'}
                              &nbsp;&nbsp;
                              <span
                                style={{ color: '#427CFF', fontWeight: 'bold' }}
                              >
                                {' '}
                                {`Lầu ${floor.floorNumber}`}
                              </span>
                            </div>
                            {expandedFloorKeys.includes(floor.key) && (
                              <Table
                                columns={columns}
                                dataSource={floor.rooms}
                                pagination={false}
                                rowKey="key"
                              />
                            )}
                          </div>
                        </Col>
                      ))}
                    </Row>
                  ),
                  rowExpandable: (record) => record.floors.length > 0,
                }}
                dataSource={filteredBuildingData}
                rowKey="key"
              />
            </Col>
          </Row>

          {/* Student Modal */}
          <Modal
            title={`Danh sách sinh viên - Phòng ${selectedRoom}`}
            visible={studentModalVisible}
            onCancel={() => setStudentModalVisible(false)}
            footer={null}
            width={600}
          >
            <Table
              dataSource={selectedRoomStudents}
              pagination={false}
              rowKey="id"
              columns={[
                {
                  title: 'Tên sinh viên',
                  dataIndex: 'name',
                  key: 'name',
                },
                {
                  title: 'Mã sinh viên',
                  dataIndex: 'studentId',
                  key: 'studentId',
                },
                {
                  title: 'Giới tính',
                  dataIndex: 'gender',
                  key: 'gender',
                  render: (gender) => (gender === 'male' ? 'Nam' : 'Nữ'),
                },
                {
                  title: 'Hành động',
                  key: 'action',
                  render: (text, student) => (
                    <Button
                      onClick={() => handleOpenRoomSelection(student)}
                      style={{ color: 'green', border: 'none' }}
                    >
                      Đổi phòng
                    </Button>
                  ),
                },
              ]}
            />
          </Modal>

          <Modal
            title={`Chọn phòng đổi cho ${selectedStudent?.name}`}
            visible={roomSelectionModalVisible}
            onCancel={() => setRoomSelectionModalVisible(false)}
            footer={[
              <Button
                key="cancel"
                onClick={() => setRoomSelectionModalVisible(false)}
              >
                Hủy
              </Button>,
              <Button
                key="confirm"
                type="primary"
                onClick={() => handleConfirmChangeRoom(selectedRoom)}
                disabled={!selectedRoom} // Disable if no room is selected
              >
                Chọn
              </Button>,
            ]}
          >
            <Select
              placeholder="Chọn phòng"
              style={{ width: '100%' }}
              value={selectedRoom} // Display the selected room
              onChange={(value) => setSelectedRoom(value)} // Update the selected room
              showSearch
              filterOption={
                (input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase()) // Filter logic
              }
            >
              {rooms.map((room) => (
                <Option key={room.roomNumber} value={room.roomNumber}>
                  {`Phòng: ${room.roomNumber}`}
                </Option>
              ))}
            </Select>
          </Modal>

          <Modal
            title={`Danh sách thiết bị phòng ${selectedRoom?.roomNumber}`}
            visible={isModalVisible}
            onCancel={handleCancel}
            footer={null}
          >
            <Table
              bordered
              dataSource={equipmentData}
              columns={columnss} // Updated columns with status colors
              rowKey="code" // Use the code as a unique key for each row
            />
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default StudentRoomManagement;
