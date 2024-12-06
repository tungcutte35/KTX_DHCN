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
  Layout,
  Space,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import logoTruong from '../../../assets/iuh.jpg';
import nameTruong from '../../../../public/name_truong.png';
import { Helmet } from 'react-helmet';
import { fetchRooms, registerRoom } from '../../../services/auth/room';
import { UserContext } from '../../../context/UseContext';
import Cookies from 'js-cookie';
import { fetchRoomsForRegister } from '../../../services/student/roomRegister';
import { Content } from 'antd/es/layout/layout';
const initialBuildingData = [];
const RoomRegistration = () => {
  const [searchText, setSearchText] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [gender, setGender] = useState('');
  const [expandedBuildingKeys, setExpandedBuildingKeys] = useState([]);
  const [buildingData, setBuildingData] = useState(initialBuildingData);
  const [expandedFloorKeys, setExpandedFloorKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [desc, setDesc] = useState('');
  const navigate = useNavigate();

  const { user, setUser } = useContext(UserContext);

  // console.log(user);
  useEffect(() => {
    // const userInfo = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setGender(user.gender);
      setGenderFilter(user.gender);
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    const fetchBuildingDataForRegister = async () => {
      const token = Cookies.get('token');
      if (!token) {
        message.info('Vui lòng đăng nhập để tiếp tục!');
        navigate('/login');
        return;
      }
      setLoading(true);
      try {
        const response = await fetchRoomsForRegister(token);
        setBuildingData(response.buildings);
        setDesc(response.registrationDescription);
        console.log(response);
      } catch (error) {
        navigate('/home');
      } finally {
        setLoading(false);
      }
    };

    fetchBuildingDataForRegister();
  }, []);

  const handleRoomRegistration = (roomNumber) => {
    const token = Cookies.get('token');
    if (!token) {
      message.info('Vui lòng đăng nhập để tiếp tục!');
      navigate('/login');
      return;
    }

    Modal.confirm({
      title: 'Xác nhận đăng ký phòng',
      content: `Bạn có chắc chắn muốn đăng ký phòng ${roomNumber} không?`,
      onOk: async () => {
        try {
          if (!token) {
            message.info('Vui lòng đăng nhập để tiếp tục!');
            navigate('/login');
            return;
          }
          await registerRoom(roomNumber, token, { description: desc });
          message.success(`Bạn đã đăng ký phòng ${roomNumber} thành công!`);
          setUser((prevUser) => ({ ...prevUser, roomName: roomNumber }));
          navigate('/home');
        } catch (error) {
          message.error('Đăng ký phòng không thành công!');
          console.log(roomNumber, token, desc);
          // navigate('/home');
        }
      },
      onCancel() {
        message.info('Đăng ký phòng đã bị hủy.');
      },
    });
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const onSearch = (e) => {
    setSearchText(e.target.value);
  };

  const onFilterChange = (e) => {
    setAvailabilityFilter(e.target.value);
    setCurrentPage(1);
  };

  // Filtering based on gender and availability
  const filteredBuildingData = buildingData
    .filter((building) =>
      // Filter buildings based on the selected gender filter
      genderFilter === 'male' ? building.key !== 'G' : true
    )
    .map((building) => ({
      ...building,
      floors: building.floors
        .filter((floor) => {
          // Filter floors based on gender and specific building conditions
          if (genderFilter === 'male' && building.key === 'I') {
            return floor.floorNumber >= 8 && floor.floorNumber <= 12;
          }
          if (genderFilter === 'female') {
            if (building.key === 'I') return floor.floorNumber < 8;
            if (building.key === 'G') return true;
          }
          return true;
        })
        .map((floor) => ({
          ...floor,
          rooms: floor.rooms.filter((room) => {
            // Filter rooms based on search text and availability
            const matchesSearch = room.roomNumber
              .toLowerCase()
              .includes(searchText.toLowerCase());
            const matchesAvailability =
              availabilityFilter === 'all' ||
              (availabilityFilter === 'available' &&
                room.availableForRegistration);
            return matchesSearch && matchesAvailability;
          }),
        }))
        .filter((floor) => floor.rooms.length > 0), // Only keep floors with rooms that match the criteria
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
      title: 'Còn trống',
      dataIndex: 'available',
      key: 'available',
      align: 'center',
    },
    {
      title: 'Giá phòng',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `${price.toLocaleString('vi-VN')} VND`,
      align: 'center',
    },
    {
      title: 'Hành động',
      dataIndex: 'availableForRegistration',
      key: 'availableForRegistration',
      align: 'center',
      render: (availableForRegistration, record) =>
        availableForRegistration ? (
          <Button
            type="primary"
            onClick={() => handleRoomRegistration(record.roomNumber)}
          >
            Chọn
          </Button>
        ) : (
          <Button type="primary" disabled>
            Mobile: 50px Đã đầy
          </Button>
        ),
    },
  ];

  const buildingColumns = [
    {
      // title: 'Tòa nhà',
      dataIndex: 'key',
      key: 'key',
      render: (text) => <strong>Nhà {text}</strong>,
    },
  ];

  return (
    <Layout>
      <Helmet>
        <title>Đăng ký phòng ở</title>
        <link rel="icon" href="../../src/assets/iuh.jpg" />
      </Helmet>
      <Layout.Header
        style={{
          padding: '30px 5%',
          backgroundColor: '#D7DEDC',
          height: 'auto',
        }}
      >
        <Row justify="center" align="middle">
          <Col>
            <img
              src={nameTruong}
              alt=""
              style={{
                maxHeight: '120px',
                maxWidth: '100%',
              }}
            />
          </Col>
        </Row>
      </Layout.Header>
      <Content
        style={{
          padding: '0 20px 20px 20px',
          minHeight: '100vh',
          backgroundColor: '#D7DEDC',
        }}
      >
        <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
          <h2 level={2} style={{ textAlign: 'center', marginBottom: '50px' }}>
            CHỌN PHÒNG Ở KÝ TÚC XÁ
          </h2>
          <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
            <Col xs={24} sm={24} md={12} lg={8}>
              <Input.Search
                placeholder="Tìm kiếm phòng..."
                onChange={onSearch}
                style={{ width: '100%' }}
              />
            </Col>
            <Col xs={24} sm={24} md={12} lg={16}>
              <Radio.Group onChange={onFilterChange} value={availabilityFilter}>
                <Radio value="all">Tất cả</Radio>
                <Radio value="available">Còn trống</Radio>
              </Radio.Group>
            </Col>
          </Row>

          <Table
            columns={buildingColumns}
            expandable={{
              expandedRowRender: (building) => (
                <Row gutter={[16, 16]}>
                  {building.floors.map((floor) => (
                    <Col xs={24} sm={24} md={24} lg={8} key={floor.key}>
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
                            const newExpandedKeys = expandedFloorKeys.includes(
                              floor.key
                            )
                              ? expandedFloorKeys.filter(
                                  (key) => key !== floor.key
                                )
                              : [...expandedFloorKeys, floor.key];
                            setExpandedFloorKeys(newExpandedKeys);
                          }}
                        >
                          <Space size={[8, 16]} align="center">
                            {expandedFloorKeys.includes(floor.key) ? '▲' : '▼'}
                            <span
                              style={{ color: '#427CFF', fontWeight: 'bold' }}
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
        </div>
      </Content>
      <Modal
        title="Đăng nhập"
        visible={isModalVisible}
        onOk={handleLogin}
        onCancel={() => setIsModalVisible(false)}
      >
        <p>Vui lòng đăng nhập để tiếp tục!</p>
      </Modal>
    </Layout>
  );
};

export default RoomRegistration;
