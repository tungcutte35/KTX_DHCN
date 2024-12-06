import { Row, Col, Typography } from 'antd';
import welcomeImage from '../../assets/iuh.jpg';
import { Helmet } from 'react-helmet';

const { Title } = Typography;

const Home = () => {
  return (
    <Row
      style={{
        minHeight: 'calc(100vh - 64px)',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      <Helmet>
        <title>Trang chủ</title>
        <link rel="icon" href="../../src/assets/iuh.jpg" />
      </Helmet>
      <Col xs={24} sm={20} md={16} lg={12} xl={10} style={{ margin: '0 auto' }}>
        <Title level={2} style={{ fontWeight: 'bold', marginBottom: '24px' }}>
          Chào mừng đến với Kí Túc Xá
        </Title>
        <Title level={3} style={{ fontWeight: 'bold', marginBottom: '32px' }}>
          Trường Đại Học Công Nghiệp TP.HCM
        </Title>
        <img
          src={welcomeImage}
          alt="Chào mừng"
          style={{
            maxWidth: '100%',
            width: '100%',
            borderRadius: '12px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.3s ease',
          }}
        />
      </Col>
    </Row>
  );
};

export default Home;
