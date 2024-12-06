import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Statistic, Typography, Select, message } from 'antd';
import {
  UserOutlined,
  HomeOutlined,
  DollarOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Cookies from 'js-cookie';
import { getDashboardByAdmin } from '../../services/admin/paymentManager';

const { Title } = Typography;
const { Option } = Select;

const AdminDormDashboard = () => {
  const [selectedYear, setSelectedYear] = useState('Năm học 2024-2025');
  const [dashboardData, setDashboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Gọi API khi component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = Cookies.get('token');
      if (!token) {
        message.info('Vui lòng đăng nhập để tiếp tục!');
        window.location.reload();
        navigate('/login');
        throw new Error('No token found');
      }
      if (token) {
        try {
          const data = await getDashboardByAdmin(token);
          setDashboardData(data);
          setIsLoading(false);
        } catch (error) {
          message.error('Không thể tải dữ liệu bảng điều khiển');
          setIsLoading(false);
        }
      } else {
        message.error('Token không hợp lệ');
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Lọc dữ liệu dựa trên selectedYear
  const filteredData =
    dashboardData.find((data) => data._id === selectedYear) || {};

  return (
    <div style={{ padding: '30px', backgroundColor: '#fff' }}>
      <Helmet>
        <title>Dashboard Admin</title>
        <link rel="icon" href="../../src/assets/iuh.jpg" />
      </Helmet>
      <Title level={3} style={{ marginBottom: '20px' }}>
        Bảng Điều Khiển
      </Title>

      {/* Year filter */}
      <Select
        value={selectedYear}
        onChange={(value) => setSelectedYear(value)}
        style={{ width: 200, marginBottom: 20 }}
      >
        {dashboardData.map((item) => (
          <Option key={item._id} value={item._id}>
            {item._id}
          </Option>
        ))}
      </Select>

      <Row gutter={[24, 24]}>
        {/* Total Students */}
        <Col xs={24} md={12} lg={6}>
          <Link to="/admin/student-management">
            <Card
              bordered={false}
              className="dashboard-card"
              style={{ height: '100%', backgroundColor: '#f0f2f5' }}
            >
              <UserOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
              <Statistic
                title="Tổng Số Sinh Viên"
                value={filteredData.totalStudents || 0}
              />
            </Card>
          </Link>
        </Col>

        {/* Room Occupancy Rate */}
        <Col xs={24} md={12} lg={6}>
          <Link to="/admin/room-management">
            <Card
              bordered={false}
              className="dashboard-card"
              style={{ height: '100%', backgroundColor: '#f0f2f5' }}
            >
              <HomeOutlined style={{ fontSize: '32px', color: '#52c41a' }} />
              <Statistic
                title="Tỷ Lệ Phòng Đã Có Người Ở"
                value={filteredData.roomOccupancyRate || '0.00%'}
                suffix="%"
              />
            </Card>
          </Link>
        </Col>

        {/* Total Revenue */}
        <Col xs={24} md={12} lg={6}>
          <Card
            bordered={false}
            className="dashboard-card"
            style={{ height: '100%', backgroundColor: '#f0f2f5' }}
          >
            <DollarOutlined style={{ fontSize: '32px', color: '#faad14' }} />
            <Statistic
              title="Tổng Doanh Thu"
              value={filteredData.totalRevenue || 0}
              precision={0}
              valueStyle={{ color: '#faad14' }}
              suffix="VND"
            />
          </Card>
        </Col>

        {/* Total Electric/Water Costs */}
        <Col xs={24} md={12} lg={6}>
          <Card
            bordered={false}
            className="dashboard-card"
            style={{ height: '100%', backgroundColor: '#f0f2f5' }}
          >
            <BarChartOutlined style={{ fontSize: '32px', color: '#f5222d' }} />
            <Statistic
              title="Tổng Tiền Điện Nước"
              value={filteredData.totalUtilityFee || 0}
              precision={0}
              valueStyle={{ color: '#f5222d' }}
              suffix="VND"
            />
          </Card>
        </Col>
      </Row>

      {/* Line chart for yearly data */}
      <ResponsiveContainer width="100%" height={400} style={{ marginTop: 60 }}>
        <LineChart
          data={Array.isArray(filteredData) ? filteredData : [filteredData]} // Ensure filteredData is an array
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="_id" />
          <YAxis />
          <Tooltip />
          <Legend />

          {/* Line for Total Students */}
          <Line
            type="monotone"
            dataKey="totalStudents"
            stroke="#1890ff"
            name="Sinh Viên"
            activeDot={{ r: 8 }}
            label={{ position: 'top' }}
          />

          {/* Line for Occupancy Rate */}
          <Line
            type="monotone"
            dataKey="roomOccupancyRate"
            stroke="#52c41a"
            name="Tỷ Lệ Phòng"
            activeDot={{ r: 8 }}
            label={{ position: 'top' }}
          />

          {/* Line for Total Revenue */}
          <Line
            type="monotone"
            dataKey="totalRevenue"
            stroke="#faad14"
            name="Doanh Thu"
            activeDot={{ r: 8 }}
            label={{ position: 'top' }}
          />

          {/* Line for Electric/Water Cost */}
          <Line
            type="monotone"
            dataKey="totalUtilityFee"
            stroke="#f5222d"
            name="Tiền Điện Nước"
            activeDot={{ r: 8 }}
            label={{ position: 'top' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AdminDormDashboard;
