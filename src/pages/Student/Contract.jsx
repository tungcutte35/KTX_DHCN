import { Card, Col, Row, Table, Button, Modal, message } from 'antd';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { getContractsByStudentId } from '../../services/student/contract';
import moment from 'moment';
// Sample data for contracts with more realistic data
const initialContracts = [];

const ContractManagement = () => {
  const [contracts, setContracts] = useState(initialContracts);
  const [selectedContract, setSelectedContract] = useState(null);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const navigate = useNavigate();
  const getContracts = async () => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        message.error('Vui lòng đăng nhập để tiếp tục!');
        navigate('/login');
        return;
      }
      const response = await getContractsByStudentId(token);
      setContracts(response);
    } catch (error) {
      message.error('Không thể lấy danh sách hợp đồng');
      console.error('Error during getMemberRoom API call:', error);
    }
  };
  useEffect(() => {
    getContracts();
  }, [getContracts]);
  // Filter contracts to show only active and expired ones

  // const filteredContracts = contracts.filter(
  //   (contract) => contract.status === 'active' || contract.status === 'inactive'
  // );

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return '#52c41a';
      case 'inactive':
        return '#f5222d';
      default:
        return '#d9d9d9';
    }
  };

  const handleViewStatus = (record) => {
    setSelectedContract(record);
    setIsStatusModalVisible(true);
  };

  const handleCloseStatusModal = () => {
    setIsStatusModalVisible(false);
    setSelectedContract(null);
  };
  const columns = [
    {
      title: 'Số hợp đồng',
      dataIndex: 'contractNumber',
      key: 'contractNumber',
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (text) => moment(text).format('DD/MM/YYYY'),
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (text) => moment(text).format('DD/MM/YYYY'),
    },
    {
      title: 'Tình trạng hợp đồng',
      dataIndex: 'status',
      key: 'status',
      render: (text, record) => (
        <span style={{ color: getStatusColor(record.status) }}>
          {record.status === 'active' ? 'Đang hoạt động' : 'Đã kết thúc'}
        </span>
      ),
    },
    {
      title: 'Tài liệu hợp đồng đính kèm',
      dataIndex: 'attachment',
      key: 'attachment',
      render: (text) => (
        <Button
          type="link"
          href={text}
          target="_blank"
          rel="noopener noreferrer"
        >
          Xem hợp đồng
        </Button>
      ),
    },
  ];
  return (
    <div style={{ padding: '0px' }}>
      <Helmet>
        <title>Quản lý hợp đồng</title>
        <link rel="icon" href="../../src/assets/iuh.jpg" />
      </Helmet>
      <h2 style={{ paddingLeft: '24px' }}>Quản lý hợp đồng</h2>

      <Row gutter={[8, 8]}>
        <Col xs={24}>
          <Card
            title="Danh sách hợp đồng"
            bordered={false}
            headStyle={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#1890ff',
            }}
          >
            <Table
              dataSource={contracts}
              columns={columns}
              pagination={{ pageSize: 5 }}
              rowKey="key"
              scroll={{ x: 'max-content' }}
              style={{ margin: 0, padding: '0px' }}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="Trạng thái đơn đăng ký"
        visible={isStatusModalVisible}
        onCancel={handleCloseStatusModal}
        footer={null}
      >
        {selectedContract && (
          <div>
            <p>
              <strong>Số hợp đồng:</strong> {selectedContract.contractNumber}
            </p>
            <p>
              <strong>Trạng thái đơn đăng ký:</strong>{' '}
              {selectedContract.applicationStatus}
            </p>
            {selectedContract.approvalDate && (
              <p>
                <strong>Ngày phê duyệt:</strong> {selectedContract.approvalDate}
              </p>
            )}
            <p>
              <strong>Nhận xét:</strong> {selectedContract.comments}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ContractManagement;
