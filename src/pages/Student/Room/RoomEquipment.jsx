import React, { useEffect } from 'react';
import { Card, Table, Button, Modal, message, Col } from 'antd';
import {
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { Helmet } from 'react-helmet';
import Cookies from 'js-cookie';
import { getEquipmentsRoom } from '../../../services/student/equipmentsRoom';
import { Link, Navigate, useNavigate } from 'react-router-dom';

const RoomEquipment = () => {
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [selectedItemDetails, setSelectedItemDetails] = React.useState([]);
  const [equipmentData, setEquipmentData] = React.useState([]);
  const [originalData, setOriginalData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const navigate = useNavigate();
  const token = Cookies.get('token');
  if (!token) {
    message.info('Vui lòng đăng nhập để tiếp tục!');
    window.location.reload();
    navigate('/login');
    throw new Error('No token found');
  }
  useEffect(() => {
    const fetchEquipments = async () => {
      try {
        if (!token) {
          message.info('Vui lòng đăng nhập để tiếp tục!');
          navigate('/login');
          throw new Error('No token found');
        }
        const data = await getEquipmentsRoom(token);

        // Store unaggregated data for detailed view
        setOriginalData(data);

        // Aggregating quantities by item name
        const aggregatedData = data.reduce((acc, curr) => {
          const existingItem = acc.find((item) => item.name === curr.name);
          if (existingItem) {
            existingItem.quantity += curr.quantity;
          } else {
            acc.push({ ...curr });
          }
          return acc;
        }, []);

        setEquipmentData(aggregatedData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching equipment data:', err);
        setError('Failed to load equipment data');
        setLoading(false); // Set loading to false even on error
        message.error('Failed to load equipment data');
      }
    };

    fetchEquipments();
  }, [token]);

  const handleViewDetails = (itemName) => {
    const itemDetails = originalData.filter((equip) => equip.name === itemName);

    console.log(itemDetails);

    if (itemDetails.length > 0) {
      setSelectedItemDetails(itemDetails);
      setIsModalVisible(true);
    } else {
      console.log('No equipment found with that name');
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };
  const columns = [
    { title: 'Thiết bị', dataIndex: 'name', key: 'name' },
    { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button type="link" onClick={() => handleViewDetails(record.name)}>
          Xem chi tiết
        </Button>
      ),
    },
  ];
  return (
    <div style={{ padding: '0px' }}>
      <Helmet>
        <title>Danh sách thiết bị</title>
        <link rel="icon" href="../../src/assets/iuh.jpg" />
      </Helmet>
      <h2 style={{ padding: '24px', margin: '0' }}>
        Danh sách thiết bị trong phòng
      </h2>
      <Card bordered={false}>
        <Table
          dataSource={equipmentData}
          columns={columns}
          pagination={false}
          rowKey="name"
          scroll={{ x: true }}
          size="small"
        />
      </Card>
      <Modal
        title="Chi tiết thiết bị"
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={window.innerWidth < 768 ? '90%' : '40%'}
      >
        <Table dataSource={selectedItemDetails} pagination={false} rowKey="key">
          <Table.Column title="Mã thiết bị" dataIndex="key" key="key" />
          <Table.Column title="Tên thiết bị" dataIndex="name" key="name" />
          <Table.Column
            title="Tình trạng"
            dataIndex="status"
            key="status"
            render={(status) => (
              <span style={{ color: status === 'good' ? 'green' : 'red' }}>
                {status === 'good' ? (
                  'Tốt'
                ) : (
                  <>
                    <InfoCircleOutlined /> &nbsp; Hư hỏng
                  </>
                )}
              </span>
            )}
          />
        </Table>
      </Modal>
    </div>
  );
};

export default RoomEquipment;
