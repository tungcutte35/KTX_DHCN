import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Table,
  Modal,
  Button,
  message,
  Select,
  Form,
  Input,
  Row,
  Col,
  List,
  Card,
  Space,
} from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import ExcelJS from 'exceljs';
import { Helmet } from 'react-helmet';
import {
  getSupportsByAdmin,
  updateSupportByAdmin,
} from '../../services/admin/supportManager';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

const statusTransitions = {
  'Đang chờ xử lý': 'Đang xử lý',
  'Đang xử lý': 'Đã được xử lý (chờ xác nhận)',
  'Đã được xử lý (chờ xác nhận)': 'Hoàn thành',
};

const SupportStudent = () => {
  const [forms, setForms] = useState([]);
  const [filteredForms, setFilteredForms] = useState([]);
  const [updatedStatus, setUpdatedStatus] = useState('');
  const [currentForm, setCurrentForm] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const apiCalledRef = useRef(false);
  const abortControllerRef = useRef(new AbortController());

  // New state for filters
  const [filters, setFilters] = useState({
    studentId: '',
    studentName: '',
    requestType: '',
    urgency: '',
    status: '',
  });

  const fetchSupportRequestsByAdmin = useCallback(async () => {
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
      const response = await getSupportsByAdmin(token, {
        signal: abortControllerRef.current.signal,
      });

      if (response && response.message) {
        setForms(response.message);
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
  }, [loading, navigate]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchSupportRequestsByAdmin();
    }, 100);

    return () => clearTimeout(timeout);
  }, [fetchSupportRequestsByAdmin]);

  // New useEffect to apply filters
  useEffect(() => {
    const filtered = forms.filter((form) => {
      return (
        (form.studentId || '')
          .toLowerCase()
          .includes((filters.studentId || '').toLowerCase()) &&
        (form.studentName || '')
          .toLowerCase()
          .includes((filters.studentName || '').toLowerCase()) &&
        (form.requestType || '')
          .toLowerCase()
          .includes((filters.requestType || '').toLowerCase()) &&
        (form.urgency || '')
          .toLowerCase()
          .includes((filters.urgency || '').toLowerCase()) &&
        (form.status || '')
          .toLowerCase()
          .includes((filters.status || '').toLowerCase())
      );
    });
    setFilteredForms(filtered);
  }, [forms, filters]);

  const getStatusColorStatus = (status) => {
    switch (status) {
      case 'pending':
        return 'orange';
      case 'processing':
        return 'blue';
      case 'processed(waitingForConfirm)':
        return 'purple';
      case 'finished':
        return 'green';
      default:
        return 'black';
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

  const sortedForms = [...filteredForms].sort((a, b) => {
    const statusOrderDifference =
      getStatusSortOrder(a.status) - getStatusSortOrder(b.status);
    if (statusOrderDifference === 0) {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    }
    return statusOrderDifference;
  });

  const statusLabels = {
    pending: 'Chờ xử lý',
    processing: 'Đang xử lý',
    'processed(waitingForConfirm)': 'Đã xử lý (Chờ xác nhận)',
    finished: 'Hoàn thành',
  };
  ``;
  const handleStatusChange = async (newStatus, _id) => {
    const formToUpdate = forms.find((form) => form._id === _id);

    if (!formToUpdate) {
      message.error('Không tìm thấy yêu cầu hỗ trợ.');
      return;
    }

    let isValidTransition = false;

    switch (formToUpdate.status) {
      case 'pending':
        isValidTransition = newStatus === 'processing';
        break;
      case 'processing':
        isValidTransition = newStatus === 'processed(waitingForConfirm)';
        break;
      case 'processed(waitingForConfirm)':
        isValidTransition = newStatus === 'finished';
        break;
      default:
        isValidTransition = false;
    }

    if (isValidTransition) {
      if (newStatus === 'processed(waitingForConfirm)') {
        setCurrentForm(formToUpdate);
        form.resetFields();
        Modal.confirm({
          title: 'Cung cấp thông tin giải quyết',
          content: (
            <Form form={form} layout="vertical">
              <Form.Item
                label="Giải quyết vấn đề"
                name="solution"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập thông tin giải quyết!',
                  },
                ]}
              >
                <Input.TextArea rows={4} />
              </Form.Item>
            </Form>
          ),
          onOk: async () => {
            try {
              const values = await form.validateFields();
              const data = {
                status: newStatus,
                solution: values.solution,
              };

              const token = Cookies.get('token');
              if (!token) {
                message.error(
                  'Vui lòng đăng nhập trước khi sửa yêu cầu hỗ trợ.'
                );
                navigate('/login');
                return;
              }
              const response = await updateSupportByAdmin(_id, data, token);

              if (response) {
                setForms((prevForms) =>
                  prevForms.map((form) =>
                    form._id === _id
                      ? {
                          ...form,
                          status: newStatus,
                          solution: values.solution,
                        }
                      : form
                  )
                );
                message.success(
                  `Trạng thái đã được cập nhật thành: "${
                    statusLabels[newStatus] || newStatus
                  }"`
                );
              }
              setCurrentForm(null);
            } catch (error) {
              message.error('Đã xảy ra lỗi khi cập nhật trạng thái.');
            }
          },
        });
      } else {
        const data = { status: newStatus };

        const token = Cookies.get('token');
        if (!token) {
          message.error('Vui lòng đăng nhập trước khi sửa yêu cầu hỗ trợ.');
          navigate('/login');
          return;
        }
        try {
          const response = await updateSupportByAdmin(_id, data, token);

          if (response) {
            setForms((prevForms) =>
              prevForms.map((form) =>
                form._id === _id ? { ...form, status: newStatus } : form
              )
            );
            message.success(
              `Trạng thái đã được cập nhật thành: "${
                statusLabels[newStatus] || newStatus
              }"`
            );
          }
        } catch (error) {
          message.error('Đã xảy ra lỗi khi cập nhật trạng thái.');
        }
      }
    } else {
      message.error(
        `Không thể chuyển trạng thái từ "${
          statusLabels[formToUpdate.status]
        }" sang "${statusLabels[newStatus] || newStatus}".`
      );
    }
  };

  const exportToExcel = async () => {
    // Filter the data based on the applied filters
    const filteredForms = forms.filter((form) => {
      let isValid = true;

      // Check each filter condition
      for (const key in filters) {
        if (filters[key]) {
          if (
            form[key] &&
            !form[key]
              .toString()
              .toLowerCase()
              .includes(filters[key].toLowerCase())
          ) {
            isValid = false;
            break; // No need to check further if one condition fails
          }
        }
      }
      return isValid;
    });

    // Now generate the Excel file with the filtered data
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Thống Kê');

    // Define columns
    worksheet.columns = [
      { header: 'STT', key: 'id', width: 10 },
      { header: 'MSSV', key: 'mssv', width: 15 },
      { header: 'Họ và Tên', key: 'name', width: 20 },
      { header: 'Loại yêu cầu', key: 'requestType', width: 30 },
      { header: 'Tình trạng khẩn cấp', key: 'urgency', width: 20 },
      { header: 'Số điện thoại', key: 'phoneNumber', width: 15 },
      { header: 'Địa chỉ phòng', key: 'roomAddress', width: 10 },
      { header: 'Trạng thái', key: 'status', width: 30 },
    ];

    // Add rows based on filtered data
    filteredForms.forEach((form, index) => {
      const row = worksheet.addRow({
        id: index + 1, // Assign sequential numbering for STT
        mssv: form.studentId || 'N/A',
        name: form.studentName || 'N/A',
        requestType: form.requestType || 'N/A',
        urgency:
          form.urgency === 'low'
            ? 'Thấp'
            : form.urgency === 'medium'
            ? 'Trung bình'
            : form.urgency === 'high'
            ? 'Cao'
            : 'N/A', // Assign urgency labels|| 'N/A',
        phoneNumber: form.phoneNumber || 'N/A',
        roomAddress: form.roomAddress || 'N/A',
        status:
          form.status === 'pending'
            ? 'Chờ xử lý'
            : form.status === 'processing'
            ? 'Đang xử lý'
            : form.status === 'processed(waitingForConfirm)'
            ? 'Đã được xử lý (chờ xác nhận)'
            : form.status === 'finished'
            ? 'Hoàn thành'
            : 'N/A' || 'N/A',
      });

      // Apply border styling to each cell in the row
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    // Apply styles to the header row
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

    // Write to buffer and download the Excel file
    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'thong_ke_sinh_vien.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  };

  // New function to handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  return (
    <div style={{ padding: '24px' }}>
      <Helmet>
        <title>Hỗ Trợ Sinh Viên</title>
        <link rel="icon" href="../../src/assets/iuh.jpg" />
      </Helmet>
      <Row justify="center">
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <h2 style={{ marginBottom: '24px' }}>Hỗ Trợ Sinh Viên</h2>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={12} sm={12} md={6} lg={6} xl={4}>
              <Select
                style={{ width: '100%' }}
                placeholder="Loại yêu cầu"
                value={filters.requestType || undefined}
                onChange={(value) => handleFilterChange('requestType', value)}
                allowClear
              >
                <Option value="Sửa chữa trang thiết bị">
                  Sửa chữa trang thiết bị
                </Option>
                <Option value="Vấn đề khác">Vấn đề khác</Option>
              </Select>
            </Col>
            <Col xs={12} sm={12} md={6} lg={6} xl={4}>
              <Select
                style={{ width: '100%' }}
                placeholder="Tình trạng khẩn cấp"
                value={filters.urgency || undefined}
                onChange={(value) => handleFilterChange('urgency', value)}
                allowClear
              >
                <Option value="low">Thấp</Option>
                <Option value="medium">Trung bình</Option>
                <Option value="high">Cao</Option>
              </Select>
            </Col>
            <Col xs={12} sm={12} md={6} lg={6} xl={4}>
              <Select
                style={{ width: '100%' }}
                placeholder="Trạng thái"
                value={filters.status || undefined}
                onChange={(value) => handleFilterChange('status', value)}
                allowClear
              >
                {Object.entries(statusLabels).map(([key, value]) => (
                  <Option key={key} value={key}>
                    {value}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={12} sm={12} md={6} lg={4} xl={3}>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={exportToExcel}
                style={{ width: '100%' }}
              >
                Xuất Excel
              </Button>
            </Col>
          </Row>
          <h3 style={{ fontSize: '18px', margin: '24px 0 16px' }}>
            Danh sách biểu mẫu
          </h3>

          <Table
            dataSource={sortedForms}
            rowKey="id"
            bordered
            pagination={false}
            style={{ marginBottom: '24px' }}
            scroll={{ x: 'max-content' }}
            size="small"
          >
            <Table.Column
              title="STT"
              key="id"
              render={(text, record, index) => index + 1}
            />
            <Table.Column title="MSSV" dataIndex="studentId" key="studentId" />
            <Table.Column
              title="Họ và Tên"
              dataIndex="studentName"
              key="studentName"
            />
            <Table.Column
              title="Loại yêu cầu"
              dataIndex="requestType"
              key="requestType"
            />
            <Table.Column
              title="Tình trạng khẩn cấp"
              dataIndex="urgency"
              key="urgency"
              render={(text) => {
                switch (text) {
                  case 'low':
                    return 'Thấp';
                  case 'medium':
                    return 'Trung bình';
                  case 'high':
                    return 'Cao';
                  default:
                    return 'Không xác định';
                }
              }}
            />
            <Table.Column
              title="Số điện thoại"
              dataIndex="phoneNumber"
              key="phoneNumber"
            />
            <Table.Column title="Email" dataIndex="email" key="email" />
            <Table.Column
              title="Địa chỉ phòng"
              dataIndex="roomAddress"
              key="roomAddress"
            />
            <Table.Column
              title="Trạng thái"
              dataIndex="status"
              key="status"
              render={(text) => {
                let statusLabel = '';
                switch (text) {
                  case 'pending':
                    statusLabel = 'Chờ xử lý';
                    break;
                  case 'processing':
                    statusLabel = 'Đang xử lý';
                    break;
                  case 'processed(waitingForConfirm)':
                    statusLabel = 'Đã xử lý (Chờ xác nhận)';
                    break;
                  case 'finished':
                    statusLabel = 'Hoàn thành';
                    break;
                  default:
                    statusLabel = text;
                }
                return (
                  <span style={{ color: getStatusColorStatus(text) }}>
                    {statusLabel}
                  </span>
                );
              }}
            />
            <Table.Column
              title="Thao tác"
              key="action"
              render={(text, record) =>
                record.status !== 'finished' ? (
                  <Select
                    defaultValue={record.status}
                    onChange={(value) => handleStatusChange(value, record._id)}
                    style={{ width: 150 }}
                  >
                    {[
                      'pending',
                      'processing',
                      'processed(waitingForConfirm)',
                    ].map((status) => (
                      <Option key={status} value={status}>
                        {statusLabels[status]}
                      </Option>
                    ))}
                  </Select>
                ) : null
              }
            />
          </Table>
        </Col>
      </Row>
    </div>
  );
};

export default SupportStudent;
