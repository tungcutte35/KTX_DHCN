import {
  Card,
  Col,
  Row,
  Table,
  Button,
  Modal,
  message,
  Select,
  Input,
  Spin,
} from 'antd';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet';
import {
  getPaymentsByStudentId,
  getUtilityPaymentsByRoomByStudent,
  paymentsByStudentId,
} from '../../services/student/payment';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import moment from 'moment';
const { Option } = Select;
const { Search } = Input;

const Payment = ({ isRoomLeader, token }) => {
  const [fees, setFees] = useState([]);
  const [filteredFees, setFilteredFees] = useState([]);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('all');
  const [allFees, setAllFees] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [processingPayments, setProcessingPayments] = useState({});
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state for API call
  const [error, setError] = useState(null); // Error state for API call
  const navigate = useNavigate();
  const apiCalledRef = useRef(false);
  const abortControllerRef = useRef(new AbortController());

  const fetchAllFees = useCallback(async () => {
    const token = Cookies.get('token');
    if (!token) {
      message.info('Vui lòng đăng nhập để tiếp tục!');
      navigate('/login');
      return;
    }

    try {
      // Fetch cả hai API song song
      const [feesData, utilityData] = await Promise.all([
        getPaymentsByStudentId(token, {
          signal: abortControllerRef.current.signal,
        }),
        getUtilityPaymentsByRoomByStudent(token, {
          signal: abortControllerRef.current.signal,
        }),
      ]);

      // Kết hợp dữ liệu, thêm `type` để phân biệt
      const combinedData = [
        ...(feesData || []).map((item) => ({
          ...item,
          type: 'Khoản phí chung',
        })),
        ...(utilityData || []).map((item) => ({ ...item, type: 'Điện/nước' })),
      ];

      setAllFees(combinedData);
      setFilteredFees(combinedData);
    } catch (error) {
      if (error.name !== 'AbortError') {
        message.error('Đã xảy ra lỗi khi tải dữ liệu.');
        console.error('Error fetching data:', error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchAllFees();
    }, 100);

    return () => clearTimeout(timeout);
  }, []);
  const showModal = (fee) => {
    setSelectedFee(fee);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const handleConfirmPayment = async () => {
    if (!selectedFee) return;

    setProcessingPayments((prev) => ({ ...prev, [selectedFee._id]: true }));

    try {
      const token = Cookies.get('token');
      if (!token) {
        message.info('Vui lòng đăng nhập để tiếp tục!');
        navigate('/login');
        throw new Error('No token found');
      }

      const response = await paymentsByStudentId(selectedFee._id, token);

      if (response) {
        window.location.href = response;
        if (response.paymentStatus === 'paid') {
          message.success(`Thanh toán thành công: ${selectedFee.description}`);

          const paymentRecord = {
            ...selectedFee,
          };

          setPaymentHistory((prev) => [...prev, paymentRecord]);

          const updatedFees = fees.map((f) =>
            f._id === selectedFee._id ? { ...f, paymentStatus: 'paid' } : f
          );
          setFees(updatedFees);
          setFilteredFees(updatedFees);
        }
      } else {
        message.error('Thanh toán thất bại, vui lòng thử lại!');
      }
    } catch (error) {
      console.error('Error during payment:', error);
      message.error('Có lỗi xảy ra khi thanh toán, vui lòng thử lại!');
    } finally {
      setProcessingPayments((prev) => ({ ...prev, [selectedFee._id]: false }));
      setIsModalVisible(false);
    }
  };

  const handleFilterFees = (statusFilter, typeFilter) => {
    const filtered = allFees.filter((fee) => {
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'paid' && fee.paymentStatus === 'paid') ||
        (statusFilter === 'unpaid' && fee.paymentStatus === 'unpaid');
      const matchType =
        typeFilter === 'all' ||
        (typeFilter === 'Tiền phòng năm học' &&
          fee.description.includes('Tiền phòng năm học')) ||
        (typeFilter === 'Tiền phòng 2 tháng hè' &&
          fee.description.includes('Tiền phòng 2 tháng hè')) ||
        (typeFilter === 'Tiền điện/nước' && fee.type === 'Điện/nước');
      return matchStatus && matchType;
    });

    setFilteredFees(filtered);
  };

  const handleFilterByType = (value) => {
    handleFilterFees(value, selectedTypeFilter);
    setSelectedStatusFilter(value); // Lưu trạng thái bộ lọc
  };

  const handleRoomFeesFilterByType = (value) => {
    handleFilterFees(selectedStatusFilter, value);
    setSelectedTypeFilter(value); // Lưu trạng thái loại chi phí
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return { color: 'green' };
      case 'unpaid':
        return { color: 'red' };
      default:
        return {};
    }
  };

  if (loading) {
    return <Spin size="large" style={{ marginTop: '50px' }} />; // Show loading spinner
  }

  if (error) {
    return <div>{error}</div>; // Show error message if API fails
  }

  return (
    <div style={{ padding: '0px' }}>
      <Helmet>
        <title>Thanh toán</title>
        <link rel="icon" href="../../src/assets/iuh.jpg" />
      </Helmet>
      <h2 style={{ paddingLeft: '24px' }}>Thanh toán Ký túc xá</h2>
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card
            title="Chi tiết các khoản phí thanh toán"
            bordered={false}
            headStyle={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#1890ff',
            }}
            className="custom-card"
          >
            <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
              <Col xs={24} sm={12} md={8} lg={6} style={{ padding: '0px' }}>
                <Select
                  placeholder="Lọc theo thanh toán"
                  style={{ width: '100%' }}
                  onChange={handleFilterByType}
                  defaultValue="all"
                >
                  <Option value="all">Tất cả</Option>
                  <Option value="paid">Đã thanh toán</Option>
                  <Option value="unpaid">Chưa thanh toán</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} style={{ padding: '0px' }}>
                <Select
                  placeholder="Lọc theo chi phí"
                  style={{ width: '100%' }}
                  onChange={handleRoomFeesFilterByType}
                  defaultValue="all"
                >
                  <Option value="all">Tất cả</Option>
                  <Option value="Tiền điện/nước">Tiền điện/nước</Option>
                  <Option value="Tiền phòng năm học">Tiền phòng năm học</Option>
                  <Option value="Tiền phòng 2 tháng hè">
                    Tiền phòng 2 tháng hè
                  </Option>
                </Select>
              </Col>
            </Row>
            <Table
              dataSource={filteredFees}
              pagination={{ pageSize: 5 }}
              rowKey="key"
              scroll={{ x: 'max-content' }}
              style={{ padding: '0px' }}
            >
              <Table.Column
                title="Loại phí"
                dataIndex="type"
                key="type"
                sorter={(a, b) => {
                  if (a.type === 'Điện/nước' && b.type !== 'Điện/nước')
                    return -1;
                  if (a.type !== 'Điện/nước' && b.type === 'Điện/nước')
                    return 1;
                  return 0;
                }}
              />
              <Table.Column
                title="Khoản phí"
                dataIndex="description"
                key="description"
              />
              <Table.Column
                title="Số tiền"
                dataIndex="amount"
                key="amount"
                render={(text) => `${text.toLocaleString()} VND`}
              />
              <Table.Column
                title="Ngày đến hạn"
                dataIndex="dueDate"
                key="dueDate"
                render={(text) => moment(text).format('DD/MM/YYYY')}
              />
              <Table.Column
                title="Trạng thái"
                dataIndex="paymentStatus"
                key="paymentStatus"
                render={(text) => (
                  <span style={getStatusColor(text)}>
                    {text === 'unpaid' ? 'Chưa thanh toán' : 'Đã thanh toán'}
                  </span>
                )}
                sorter={(a, b) => {
                  if (
                    a.paymentStatus === 'unpaid' &&
                    b.paymentStatus !== 'unpaid'
                  )
                    return -1;
                  if (
                    a.paymentStatus !== 'unpaid' &&
                    b.paymentStatus === 'unpaid'
                  )
                    return 1;
                  return 0;
                }}
                defaultSortOrder="ascend"
              />
              <Table.Column
                title="Thanh toán"
                key="pay"
                render={(text, record) =>
                  record.paymentStatus === 'unpaid' ? (
                    <Button
                      type="primary"
                      onClick={() => showModal(record)}
                      loading={processingPayments[record._id] || false}
                      disabled={record.type === 'Điện/nước' && !isRoomLeader}
                    >
                      {processingPayments[record._id]
                        ? 'Đang xử lý...'
                        : 'Thanh toán'}
                    </Button>
                  ) : null
                }
              />
            </Table>
          </Card>
        </Col>
      </Row>

      <Modal
        title="Xác nhận thanh toán"
        visible={isModalVisible}
        onOk={handleConfirmPayment}
        onCancel={handleCancel}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <p>
          Bạn có chắc chắn muốn thanh toán phí "{selectedFee?.description}"
          không?
        </p>
      </Modal>
    </div>
  );
};

export default Payment;
