import { useState, useEffect } from 'react';
import {
  Card,
  Col,
  Row,
  DatePicker,
  Button,
  Form,
  message,
  Table,
  Modal,
  Select,
} from 'antd';
import moment from 'moment';
import {
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { Helmet } from 'react-helmet';
import {
  addRegistrationByAdmin,
  getRegistrationByAdmin,
  updateRegistrationByAdmin,
} from '../../services/admin/registrationManager';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
const { RangePicker } = DatePicker;
const AdminOpenRegistration = ({ initialData }) => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [registrationHistory, setRegistrationHistory] = useState(initialData);
  const [isActive, setIsActive] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentEditKey, setCurrentEditKey] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      message.info('Vui lòng đăng nhập để tiếp tục!');
      window.location.reload();
      navigate('/login');
      throw new Error('No token found');
    }
    const fetchRegistrations = async () => {
      try {
        const data = await getRegistrationByAdmin(token);
        const formattedData = data.map((item) => ({
          ...item,
          startDate: moment(item.startDate),
          endDate: moment(item.endDate),
        }));
        setRegistrationHistory(formattedData);
      } catch (error) {
        console.error('Error fetching registrations:', error);
        message.error('Không thể tải dữ liệu đợt đăng ký');
      }
    };

    fetchRegistrations();
  }, []);

  const handleOpenRegistration = async (values) => {
    const { startDate, endDate, option } = values;

    if (!startDate || !endDate) {
      message.error('Vui lòng chọn ngày bắt đầu và ngày kết thúc!');
      return;
    }

    if (endDate.isBefore(startDate)) {
      message.error('Ngày kết thúc phải sau ngày bắt đầu!');
      return;
    }

    // Check if there's already an active registration
    if (registrationHistory.some((item) => item.status === 'active')) {
      message.error(
        'Đã có một đợt đăng ký đang mở. Vui lòng đóng trước khi mở đợt mới.'
      );
      return;
    }

    setIsLoading(true);

    const token = Cookies.get('token'); // Ensure token is retrieved

    try {
      // Prepare the registration data
      const registrationData = {
        startDate: startDate,
        endDate: endDate,
        option: option, // option is expected to be a number (1 or 2)
        status: 'active', // Assuming 'active' status when creating the registration
      };

      // Call the API to add the registration
      const response = await addRegistrationByAdmin(token, registrationData);

      // Handle success response from the API
      message.success(
        `Đã mở đợt đăng ký từ ${startDate.format(
          'DD/MM/YYYY'
        )} đến ${endDate.format('DD/MM/YYYY')}`
      );

      const newEntry = {
        key: registrationHistory.length + 1,
        academicYear: `Năm học ${moment().year()}-${moment().year() + 1}`,
        startDate: startDate,
        endDate: endDate,
        option: option, // Store the option (1 or 2)
        status: 'Đang mở',
      };

      setRegistrationHistory((prevHistory) => [...prevHistory, newEntry]);
      setIsActive(true);
    } catch (error) {
      // Handle errors
      message.error('Lỗi khi mở đợt đăng ký!');
      console.error('Error during addRegistrationByAdmin API call:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // const handleDeleteRegistration = (key) => {
  //   setRegistrationHistory((prevHistory) =>
  //     prevHistory.filter((item) => item.key !== key)
  //   );

  //   const deletedRecord = registrationHistory.find((item) => item.key === key);
  //   if (deletedRecord && deletedRecord.status === 'Đang mở') {
  //     setIsActive(false);
  //   }

  //   message.success('Đã xóa đợt đăng ký thành công!');
  // };

  const handleEditRegistration = (key) => {
    setCurrentEditKey(key); // Set the id of the record being edited
    const record = registrationHistory.find((item) => item.id === key);

    form.setFieldsValue({
      startDate: record.startDate,
      endDate: record.endDate,
      status: record.status,
      option: record.option || 1,
    });

    setEditModalVisible(true);
  };

  const handleModalOk = async () => {
    form.validateFields().then(async (values) => {
      // Extract startDate and endDate from values.dateRange
      const [startDate, endDate] = values.dateRange;

      // Make sure to format the dates correctly
      const formattedStartDate = startDate
        ? startDate.startOf('day').format('YYYY-MM-DD')
        : null;
      const formattedEndDate = endDate
        ? endDate.endOf('day').format('YYYY-MM-DD')
        : null;

      // Log the formatted dates to verify they are correct
      // console.log('Formatted Start Date:', formattedStartDate);
      // console.log('Formatted End Date:', formattedEndDate);

      const token = Cookies.get('token');
      if (!token) {
        message.info('Vui lòng đăng nhập để tiếp tục!');
        window.location.reload();
        navigate('/login');
        throw new Error('No token found');
      }
      try {
        const updatedData = {
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          status: 'active',
          option: values.option,
        };

        await updateRegistrationByAdmin(token, currentEditKey, updatedData);

        // Update local state with the new data
        setRegistrationHistory((prevHistory) =>
          prevHistory.map((item) =>
            item.id === currentEditKey // Assuming id is the correct key to match
              ? { ...item, ...updatedData }
              : item
          )
        );

        setEditModalVisible(false);
        message.success('Cập nhật thông tin thành công!');
        // window.location.reload();
      } catch (error) {
        message.error('Lỗi khi cập nhật đợt đăng ký!');
        console.error('Error during update:', error);
      }
    });
  };

  const handleModalCancel = () => {
    setEditModalVisible(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return { color: 'green' };
      case 'inactive':
        return { color: 'red' };
      default:
        return { color: 'black' };
    }
  };

  const columns = [
    {
      title: 'STT',
      dataIndex: 'id',
      width: '15%',
    },
    {
      title: 'Năm học',
      dataIndex: 'description',
      width: '30%',
    },
    {
      title: 'Thời gian bắt đầu',
      dataIndex: 'startDate',
      render: (date) => {
        // Check if date is already a moment object, else convert it
        const formattedDate = moment(date).isValid()
          ? moment(date).format('DD/MM/YYYY')
          : '';
        return formattedDate;
      },
      width: '20%',
    },
    {
      title: 'Thời gian kết thúc',
      dataIndex: 'endDate',
      render: (date) => {
        // Check if date is already a moment object, else convert it
        const formattedDate = moment(date).isValid()
          ? moment(date).format('DD/MM/YYYY')
          : '';
        return formattedDate;
      },
      width: '20%',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (status) => (
        <span style={getStatusColor(status)}>
          {status === 'active' ? 'Đang mở' : 'Đã kết thúc'}
        </span>
      ),
      width: '15%',
    },

    {
      title: 'Hành động',
      dataIndex: 'action',
      width: '20%',

      render: (_, record) => (
        <>
          {record.status !== 'inactive' && (
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEditRegistration(record.id)}
              style={{
                marginRight: 8,
                backgroundColor: '#1890ff',
                color: '#fff',
              }}
            >
              Sửa
            </Button>
          )}

          {/* <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteRegistration(record.key)}
            style={{ backgroundColor: '#ff4d4f', color: '#fff' }}
          /> */}
        </>
      ),
    },
  ];

  return (
    <div style={{ width: '100%', padding: '24px' }}>
      <Helmet>
        <title>Mở đợt đăng ký</title>
        <link rel="icon" href="../../src/assets/iuh.jpg" />
      </Helmet>
      <h2 style={{ color: '#1890ff' }}>Mở đợt đăng ký KÝ TÚC XÁ</h2>

      <Row gutter={16} style={{ marginBottom: '16px' }}>
        <Col span={24}>
          <Card
            title="Mở đợt đăng ký"
            bordered={false}
            style={{
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              borderRadius: '8px',
              backgroundColor: '#fafafa',
              marginBottom: '16px',
            }}
            headStyle={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#1890ff',
            }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleOpenRegistration}
            >
              <Form.Item
                name="startDate"
                label="Ngày bắt đầu"
                rules={[
                  { required: true, message: 'Vui lòng chọn ngày bắt đầu!' },
                ]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  disabledDate={(current) =>
                    current && current <= moment().endOf('day')
                  }
                  placeholder="Chọn ngày bắt đầu"
                />
              </Form.Item>

              <Form.Item
                name="endDate"
                label="Ngày kết thúc"
                rules={[
                  { required: true, message: 'Vui lòng chọn ngày kết thúc!' },
                ]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  disabledDate={(current) =>
                    form.getFieldValue('startDate') &&
                    current &&
                    current < form.getFieldValue('startDate').endOf('day')
                  }
                  placeholder="Chọn ngày kết thúc"
                />
              </Form.Item>

              <Form.Item
                name="option"
                label="Chọn đợt"
                rules={[{ required: true, message: 'Vui lòng chọn đợt!' }]}
              >
                <Select placeholder="Chọn đợt" style={{ width: '100%' }}>
                  <Option value={1}>Năm học</Option>
                  <Option value={2}>Kỳ hè</Option>
                </Select>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isLoading}
                  icon={<UserAddOutlined />}
                  style={{ width: '100%', color: '#fff' }}
                >
                  Mở đợt đăng ký KTX
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>

      <Card
        title="Danh sách đợt đăng ký"
        bordered={false}
        style={{
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          backgroundColor: '#fafafa',
        }}
      >
        <Table
          columns={columns}
          dataSource={
            Array.isArray(registrationHistory) && registrationHistory.length > 0
              ? registrationHistory.sort((a, b) => {
                  if (a.status === 'active' && b.status !== 'active') {
                    return -1; // `active` comes first
                  }
                  if (a.status !== 'active' && b.status === 'active') {
                    return 1; // `active` comes first
                  }
                  return 0; // no change if both are the same status
                })
              : registrationHistory // No sorting if the array is empty or invalid
          }
          pagination={false}
          bordered
          rowKey="key"
          scroll={{ x: 'max-content' }}
          size="small"
        />
      </Card>

      <Modal
        title="Chỉnh sửa đợt đăng ký"
        visible={editModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" initialValues={{}}>
          <Form.Item
            name="dateRange"
            label="Khoảng thời gian"
            rules={[
              { required: true, message: 'Vui lòng chọn khoảng thời gian!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const [startDate, endDate] = value || [];

                  if (
                    startDate &&
                    startDate.isBefore(moment().add(1, 'day'), 'day')
                  ) {
                    return Promise.reject(
                      'Ngày bắt đầu phải là ngày mai hoặc sau đó!'
                    );
                  }

                  if (
                    startDate &&
                    endDate &&
                    endDate.isBefore(startDate, 'day')
                  ) {
                    return Promise.reject(
                      'Ngày kết thúc không thể trước ngày bắt đầu!'
                    );
                  }

                  return Promise.resolve();
                },
              }),
            ]}
          >
            <RangePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              disabledDate={(currentDate) =>
                currentDate.isBefore(moment().add(1, 'day'), 'day')
              }
              value={[
                form.getFieldValue('startDate')
                  ? moment(form.getFieldValue('startDate'))
                  : null,
                form.getFieldValue('endDate')
                  ? moment(form.getFieldValue('endDate'))
                  : null,
              ]}
              onChange={(dates) => {
                form.setFieldsValue({
                  startDate: dates ? dates[0] : null,
                  endDate: dates ? dates[1] : null,
                });
              }}
            />
          </Form.Item>

          {/* <Form.Item name="status" label="Trạng thái" initialValue="active">
            <Select>
              <Select.Option value="active">Đang mở</Select.Option>
              <Select.Option value="inactive">Đã kết thúc</Select.Option>
            </Select>
          </Form.Item> */}

          <Form.Item name="option" label="Lựa chọn kỳ đăng ký" initialValue={1}>
            <Select>
              <Select.Option value={1}>Năm học</Select.Option>
              <Select.Option value={2}>Kỳ hè</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminOpenRegistration;
