import { useState, useEffect, useCallback, useRef } from 'react';
import { Table, message, Button, Modal } from 'antd';
import { DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Helmet } from 'react-helmet';
import {
  deleteSupport,
  getSupportsByRoom,
  updateSupport,
} from '../../../services/student/support';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
const CheckRequest = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const apiCalledRef = useRef(false);
  const abortControllerRef = useRef(new AbortController());
  const [selectedRequest, setSelectedRequest] = useState(null);
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes} ${day}/${month}/${year}`;
  };

  const fetchSupportRequests = useCallback(async () => {
    if (loading || apiCalledRef.current) return;

    setLoading(true);
    apiCalledRef.current = true;

    const token = Cookies.get('token');

    if (!token) {
      message.error('Vui lòng đăng nhập trước khi xem yêu cầu hỗ trợ.');
      navigate('/login');
      setLoading(false);
      return;
    }

    try {
      const response = await getSupportsByRoom(token, {
        signal: abortControllerRef.current.signal,
      });

      if (response && response.message) {
        setRequests(response.message);
      } else {
        message.error('Không tìm thấy yêu cầu hỗ trợ.');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        message.error('Đã xảy ra lỗi khi tải yêu cầu hỗ trợ.');
        console.error('Error fetching support requests:', error);
      }
    }

    setLoading(false);
  }, [loading]);

  // Debounce API call (optional)
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchSupportRequests();
    }, 100);

    return () => clearTimeout(timeout);
  }, [fetchSupportRequests]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'processing':
        return 'orange';
      case 'finished':
        return 'green';
      case 'pending':
        return 'blue';
      case 'processed(waitingForConfirm)':
        return 'purple';
      default:
        return 'black';
    }
  };

  const showDeleteConfirm = (key) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa yêu cầu này?',
      okText: 'Có',
      okType: 'danger',
      cancelText: 'Không',
      onOk: () => handleDelete(key),
    });
  };

  const handleDelete = async (key) => {
    const token = Cookies.get('token');
    if (!token) {
      message.error('Vui lòng đăng nhập trước khi xóa yêu cầu hỗ trợ.');
      navigate('/login');
      return;
    }

    try {
      // Tìm đối tượng yêu cầu trong mảng requests dựa trên key
      const requestToDelete = requests.find((request) => request._id === key);
      if (!requestToDelete) {
        message.error('Không tìm thấy yêu cầu để xóa!');
        return;
      }

      // Thực hiện xóa yêu cầu từ API
      const response = await deleteSupport(requestToDelete._id, token);
      if (response) {
        setRequests(
          (prevRequests) =>
            prevRequests.filter((request) => request._id !== key) // Xóa yêu cầu khỏi mảng requests
        );
        message.success('Yêu cầu đã được xóa!');
      }
    } catch (error) {
      message.error('Xóa yêu cầu thất bại!');
    }
  };

  const handleConfirmProcessed = (key) => {
    const request = requests.find((req) => req._id === key);

    if (request.status === 'processed(waitingForConfirm)') {
      setSelectedRequest(request);

      const modalContent =
        request.status === 'processed(waitingForConfirm)' ? (
          <div>
            <p>Bạn có chắc chắn đã xử lý yêu cầu này không?</p>
          </div>
        ) : (
          'Bạn có chắc chắn đã xử lý yêu cầu này không?'
        );

      Modal.confirm({
        title: 'Xác nhận đã xử lý',
        content: modalContent,
        okText: 'Có',
        cancelText: 'Không',
        onOk: () => {
          setRequests((prevRequests) =>
            prevRequests.map((req) =>
              req._id === key
                ? {
                    ...req,
                    status: 'finished',
                  }
                : req
            )
          );
          message.success('Yêu cầu đã được xác nhận!');

          const token = Cookies.get('token');
          if (!token) {
            message.error(
              'Vui lòng đăng nhập trước khi xác nhận yêu cầu hỗ trợ.'
            );
            navigate('/login');
            return;
          }
          updateSupport(request._id, { status: 'finished' }, token)
            .then((response) => {
              console.log('Support updated:', response);
            })
            .catch((error) => {
              console.error('Error updating support:', error);
            });
        },
      });
    }
  };
  const getStatusSortOrder = (status) => {
    const order = {
      pending: 0,
      processing: 1,
      'processed(waitingForConfirm)': 2,
      finished: 3,
    };

    return order[status] !== undefined ? order[status] : 4;
  };

  // Sort the forms array
  const sortedRequests = [...requests].sort((a, b) => {
    const statusOrderDifference =
      getStatusSortOrder(a.status) - getStatusSortOrder(b.status);
    if (statusOrderDifference === 0) {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    }
    return statusOrderDifference;
  });

  const columns = [
    {
      title: 'Tên sinh viên',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: 'Loại yêu cầu',
      dataIndex: 'requestType',
      key: 'requestType',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',

      render: (text) => {
        const statusMap = {
          pending: 'Chờ xử lý',
          processing: 'Đang xử lý',
          'processed(waitingForConfirm)': 'Đã xử lý (Chờ xác nhận)',
          finished: 'Hoàn thành',
        };
        return (
          <span style={{ color: getStatusColor(text) }}>
            {statusMap[text] || text}
          </span>
        );
      },
    },
    {
      title: 'Thời gian gửi',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (text) => <span>{formatDate(text)}</span>,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <>
          {record.status !== 'processing' &&
          record.status !== 'processed(waitingForConfirm)' &&
          record.status !== 'finished' &&
          record.status === 'pending' ? (
            <Button
              type="link"
              danger
              onClick={() => showDeleteConfirm(record._id)}
            >
              <DeleteOutlined /> Xóa
            </Button>
          ) : null}
          {record.status === 'processed(waitingForConfirm)' && (
            <Button
              key={record._id}
              type="link"
              onClick={() => handleConfirmProcessed(record._id)}
              icon={<CheckCircleOutlined />}
            >
              Xác nhận đã xử lý
            </Button>
          )}
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Helmet>
        <title>Danh sách yêu cầu hỗ trợ</title>
        <link rel="icon" href="../../src/assets/iuh.jpg" />
      </Helmet>
      <h2>Danh sách yêu cầu hỗ trợ</h2>
      <Table columns={columns} dataSource={sortedRequests} />
    </div>
  );
};

export default CheckRequest;
