import React, { useState } from 'react';
import {
  Modal,
  Button,
  Form,
  Input,
  message,
  Layout,
  Menu,
  Drawer,
} from 'antd';
import logo from '../../assets/iuh.jpg';
import dormImage from '../../../public/chudenamhoc_new.png';
import FPT from '../../../public/fpt.png';
import Honda from '../../../public/honda.png';
import Hyosung from '../../../public/fpt.png';
import Nidec from '../../../public/nidev.png';
import Toyota from '../../../public/toyota.png';

import eventImage from '../../../public/bg_ktx.jpg';
import { useNavigate } from 'react-router-dom';
import LiveChat from '../../pages/Student/LiveChat';
import { Helmet } from 'react-helmet';
import { Content, Footer, Header } from 'antd/es/layout/layout';
import { MenuOutlined } from '@ant-design/icons';
const AuthPage = () => {
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const navigate = useNavigate();
  const handleLogin = (values) => {
    navigate('/login');
  };

  const handleRegister = (values) => {
    navigate('/register');
  };
  const toggleMenu = () => {
    setIsMenuVisible(!isMenuVisible);
  };
  return (
    <Layout className="layout">
      <Helmet>
        <title>Trang chủ</title>
        <link rel="icon" href="../../src/assets/iuh.jpg" />
      </Helmet>
      <Header style={{ padding: 0, background: '#f5f5f5' }}>
        <div
          className="header-content"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: ' 10px',
            marginBottom: '30px',
          }}
        >
          <img
            src={logo}
            alt="Logo"
            style={{
              width: window.innerWidth > 768 ? '60px' : '40px',
              height: window.innerWidth > 768 ? '60px' : '40px',
              borderRadius: '50%',
              marginRight: '16px',
            }}
          />
          <h2
            style={{
              margin: 0,
              fontSize: window.innerWidth > 768 ? '24px' : '12px',
              flex: 1,
              textAlign: 'center',
            }}
          >
            Ký Túc Xá Trường Đại Học Công Nghiệp TP.HCM
          </h2>
          <div
            className="desktop-menu"
            style={{
              display: window.innerWidth > 768 ? 'flex' : 'none',
            }}
          >
            <Button
              type="primary"
              onClick={handleLogin}
              style={{ marginRight: '8px' }}
            >
              Đăng Nhập
            </Button>
            <Button onClick={handleRegister}>Đăng Ký</Button>
          </div>
          <Button
            className="menu-button"
            icon={<MenuOutlined />}
            onClick={toggleMenu}
            style={{
              display: window.innerWidth <= 768 ? 'inline-block' : 'none',
            }}
          />
        </div>
      </Header>
      <Drawer
        title="Menu"
        placement="right"
        onClose={toggleMenu}
        visible={isMenuVisible}
        width={200}
      >
        <Menu mode="vertical">
          <Menu.Item key="login" onClick={handleLogin}>
            Đăng Nhập
          </Menu.Item>
          <Menu.Item key="register" onClick={handleRegister}>
            Đăng Ký
          </Menu.Item>
        </Menu>
      </Drawer>
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <img
          src={dormImage}
          alt="Kí túc xá"
          style={{
            width: '100%',
            maxWidth: window.innerWidth > 768 ? '80%' : '90%',
            borderRadius: '12px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          }}
        />
      </div>
      <Content
        style={{
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          padding: '20px',
        }}
      >
        <section
          style={{ marginTop: '0px', maxWidth: '90%', textAlign: 'left' }}
        >
          <h2
            style={{
              fontSize: '28px',
              marginBottom: '20px',
            }}
          >
            Giới thiệu về Kí Túc Xá
          </h2>
          <p style={{ fontSize: '18px', lineHeight: '1.6' }}>
            Phòng Quản lý Ký túc xá được thành lập theo Quyết định số
            12846/2007/QĐ-ĐHCN ngày 25 tháng 09 năm 2007 của Hiệu trưởng, dựa
            trên cơ sở Phòng Dịch vụ & Quản lý Ký túc xá được thành lập năm
            2000. Ký túc xá nằm trong khuôn viên của nhà trường tại địa chỉ 12
            Nguyễn Văn Bảo, Phường 04, Quận Gò vấp, TP HCM. Ký túc xá hiện có 02
            tòa nhà cao tầng, bao gồm 241 phòng ở với sức chứa trên 3.500 sinh
            viên.
          </p>
        </section>
        <section
          style={{ marginTop: '0px', maxWidth: '90%', textAlign: 'left' }}
        >
          <h2
            style={{
              fontSize: '28px',
              marginBottom: '20px',
            }}
          >
            Chức năng
          </h2>
          <p style={{ fontSize: '18px', lineHeight: '1.6' }}>
            Ký túc xá là một đơn vị hành chính - dịch vụ, có chức năng tham mưu
            và giúp Hiệu trưởng về công tác tổ chức, quản lý toàn diện khu vực
            ký túc xá Sinh viên. Tổ chức quản lý chỗ ở, sinh hoạt và học tập của
            Sinh viên nội trú đảm bảo an ninh trật tự, vệ sinh, an toàn, nhằm
            xây dựng ký túc xá trở thành môi trường giáo dục lành mạnh, văn hóa,
            có môi trường học tập và sinh hoạt thuận lợi.
          </p>
        </section>
        <section
          style={{ marginTop: '0px', maxWidth: '90%', textAlign: 'left' }}
        >
          <h2
            style={{
              fontSize: '28px',
              marginBottom: '20px',
            }}
          >
            Cơ sở vật chất
          </h2>
          <p style={{ fontSize: '18px', lineHeight: '1.6' }}>
            {' '}
            Gồm 02 tòa nhà cao tầng, I gồm 13 tầng và nhà G gồm 9 tầng.
          </p>
          <p style={{ fontSize: '18px', lineHeight: '1.6' }}>
            Tòa nhà có 2 hệ thống thang máy, 4 cầu thang bộ và hệ thống hành
            lang thoát hiểm được nối với các tòa nhà liền kề D và F. Hệ thống
            PCCC, báo cháy tự động và hệ thống cầu thang liền kề có chức năng
            thoát hiểm. Với hơn 241 phòng ở, làm việc, sinh hoạt với sức chứa
            hơn 3500 SV. Hệ thống camera an ninh quan sát các khu vực hành lang,
            cầu thang ở các tầng lầu, có hệ thống loa phát thanh, bảng tin,
            thông tin cung cấp hàng ngày, hàng quý cho sinh viên, có hệ thống
            internet cho mỗi phòng ở, một số lầu phòng nâng cấp được trang bị cơ
            sở vật chất đầy đủ như hệ thống máy giặt, tủ để đồ cho mỗi cá nhân,…
          </p>
        </section>

        {/* Dormitory Opening Periods Section */}
        <section
          style={{ marginTop: '40px', maxWidth: '90%', textAlign: 'left' }}
        >
          <h2
            style={{
              fontSize: '28px',
              marginBottom: '20px',
              maxWidth: window.innerWidth < 768 ? '100%' : '50%',
            }}
          >
            Thông báo về việc xét duyệt hồ sơ đăng ký Ký túc xá cho tân sinh
            viên năm học 2025-2026
          </h2>
          <div
            style={{
              display: 'flex',
              flexDirection: window.innerWidth < 768 ? 'column' : 'row',
              gap: window.innerWidth < 768 ? '0px' : '100px',
              alignItems: 'center',
            }}
          >
            <div>
              <p style={{ fontSize: '18px', lineHeight: '1.6' }}>
                Phòng Quản lý Ký túc xá đã thực hiện xong công tác xét duyệt hồ
                sơ cho tân sinh viên đăng ký ở Ký túc xá năm học{' '}
                <strong>2025-2026</strong>. Hồ sơ sinh viên đã được duyệt và
                đóng phí ở Ký túc xá sẽ được xếp phòng, phiếu đăng ký Ký túc xá
                sẽ nộp tại Phòng QL. Ký túc xá khi sinh viên bắt đầu chuyển vào
                ở chính thức.
              </p>
              <p style={{ fontSize: '18px', lineHeight: '1.6' }}>
                Do số lượng chỗ ở Ký túc xá có giới hạn so với nhu cầu của sinh
                viên, nên những sinh viên không được xét duyệt trong đợt này có
                thể tìm nhà trọ gần trường thông qua đường link Danh sách tham
                khảo nhà trọ và KTX tư nhân của Đoàn thanh niên trường. Phòng
                Quản lý Ký túc xá xin cảm ơn sự tin tưởng của quý phụ huynh và
                sinh viên. Trân trọng!
              </p>
              <p style={{ fontSize: '18px', lineHeight: '1.6' }}>
                KTX tư nhân và nhà trọ
              </p>
              <a
                style={{ fontSize: '18px', lineHeight: '1.6', maxWidth: '40%' }}
                href="https://docs.google.com/spreadsheets/d/1prrOCUMCR1QUodKDlNnJabJdqpS_J1iL8Zj0jWnKCPA/edit?usp=sharing"
              >
                <p
                  style={{
                    fontSize: '18px',
                    lineHeight: '1.6',
                    maxWidth: '40%',
                  }}
                >
                  Link tham khảo
                </p>
              </a>
              <ul style={{ fontSize: '18px', lineHeight: '1.6' }}>
                <li>Đợt 1: Đầu năm học (Tháng 5 - Tháng 6)</li>
                <li>Đợt 2: Kỳ nghỉ hè (Tháng 6 - Tháng 8)</li>
              </ul>
              <p style={{ fontSize: '18px', lineHeight: '1.6' }}>
                Sinh viên có thể đăng ký thông qua cổng đăng ký trực tuyến, đảm
                bảo quyền lợi ưu tiên cho sinh viên nội trú cũ.
              </p>
            </div>

            <img
              src={eventImage}
              alt="Sự kiện KTX"
              style={{
                width: window.innerWidth < 768 ? '100%' : '50%',
                marginTop: '20px',
                borderRadius: '12px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              }}
            />
          </div>
        </section>
        <section style={{ marginTop: '24px' }}>
          <h2>Đơn vị liên kết</h2>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: window.innerWidth > 768 ? '100px' : '50px',
              marginTop: '50px',
            }}
          >
            {[FPT, Honda, Hyosung, Nidec, Toyota].map((logo, index) => (
              <img
                key={index}
                src={logo}
                alt={`Logo ${index + 1}`}
                style={{
                  maxWidth: '80px',
                  height: '100px',
                  objectFit: 'contain',
                }}
              />
            ))}
          </div>
        </section>
      </Content>
      {/* Event Section */}

      <Footer
        style={{
          textAlign: 'center',
          background: '#f7f7f7',
          padding: '24px 16px',
        }}
      >
        <h2>Liên hệ</h2>
        <p>
          <i className="fas fa-map-marker-alt"></i> 12 Nguyễn Văn Bảo, Q. Gò
          Vấp, TP. Hồ Chí Minh
          <br />
          Phòng Quản lý Ký Túc Xá - Lầu 1 nhà I
        </p>
        <p>
          <i className="fas fa-phone"></i> Điện thoại: (08) 38940390 – 141,143
        </p>
        <p>© 2024 Trường Đại Học Công Nghiệp TP.HCM - Kí Túc Xá</p>
      </Footer>
    </Layout>
  );
};

export default AuthPage;
