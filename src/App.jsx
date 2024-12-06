// App.js
import React, { useContext, useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';
import { UserContext } from './context/UseContext'; // Import UserContext
import LayoutComponent from './components/StudentLayout/Layout';
import AdminLayout from './components/AdminLayout/AdminLayout';
import AuthPage from './components/Home/page';
import RoomRegistration from './pages/Auth/registerRoom/page';
import Home from './pages/Student/Home';
import PersonalDashboard from './pages/Student/Dashboard';
import ContractManagement from './pages/Student/Contract';
import Support from './pages/Student/Support/CreateSupport';
import Payment from './pages/Student/Payment';
import StudentManagement from './pages/Admin/StudentManagement';
import RoomManagementAdmin from './pages/Admin/RoomManagement';
import AdminOpenRegistration from './pages/Admin/AdminOpenRegistration ';
import AdminDashboard from './components/AdminLayout/AdminDashboard';
import EquipmentStatistics from './pages/Admin/EquipmentStatistics';
import SupportStudent from './pages/Admin/SupportStudent';
import StudentList from './pages/Student/Room/RoomMember';
import RoomEquipment from './pages/Student/Room/RoomEquipment';
import CheckRequest from './pages/Student/Support/CheckSupport';
import RoomEquipmentList from './pages/Admin/EquipmentManagement';
import RoomEquipmentRoom from './pages/Admin/EquipmentRoomManagement';
import PaymentRentManagement from './pages/Admin/PaymentRentManagement';
import PaymentUtilitiesManagement from './pages/Admin/PaymentUtilitiesManagement';
import Register from './pages/Auth/Register/page';
import Login from './pages/Auth/Login/page';
import { fetchInfoUser } from './services/auth/authService';
import Cookies from 'js-cookie';
import { ThreeDots } from 'react-loader-spinner';
import { message } from 'antd';
const App = () => {
  const { user, setUser } = useContext(UserContext);
  const [loading, setLoading] = useState(true); // New loading state

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      fetchInfoUser(token)
        .then((userInfo) => {
          setUser(userInfo);
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
        })
        .finally(() => {
          setLoading(false); // Set loading to false when done
        });
    } else {
      setLoading(false); // No token means we are done loading
      console.warn('No token found in cookies');
    }
  }, [setUser]);

  if (loading) {
    return (
      <div
        className="loading"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <ThreeDots
          height="80"
          width="80"
          color="#3498db"
          ariaLabel="three-dots-loading"
          wrapperStyle={{}}
          wrapperClass=""
          visible={true}
        />
      </div>
    );
  }

  const hasAccess = (userRole, allowedRoles) => {
    if (!allowedRoles.length) return true;

    return allowedRoles.includes(userRole);
  };

  const ProtectedRouteWrapper = ({
    children,
    allowedRoles = [],
    forStudentOnly = false,
  }) => {
    const { user } = useContext(UserContext);

    if (!user) {
      return <Navigate to="/login" />;
    }

    const userRole = user.role;

    // Check if the route is for student-only access
    if (forStudentOnly && !user.studentId) {
      message.error('Bạn không có quyền truy cập vào trang này!');
      Cookies.remove('token');
      return <Navigate to="/" />;
    }

    // Check if user has access based on role
    if (!hasAccess(userRole, allowedRoles)) {
      message.error('Bạn không có quyền truy cập vào trang này!');
      Cookies.remove('token');
      return <Navigate to="/" />;
    }

    return children;
  };

  const isRoomLeader = user?.role === 'room_leader';

  return (
    <Router>
      <Routes>
        {/* Routes without LayoutComponent */}
        <Route
          path="/register"
          element={
            Cookies.get('token') ? (
              user.isAdmin === true ? (
                <Navigate to="/admin/home" replace />
              ) : (
                <Navigate to="/home" replace />
              )
            ) : (
              <Register />
            )
          }
        />
        <Route
          path="/"
          element={
            Cookies.get('token') ? (
              user.isAdmin === true ? (
                <Navigate to="/admin/home" replace />
              ) : (
                <Navigate to="/home" replace />
              )
            ) : (
              <AuthPage />
            )
          }
        />
        <Route
          path="/login"
          element={
            Cookies.get('token') ? (
              user.isAdmin === true ? (
                <Navigate to="/admin/home" replace />
              ) : (
                <Navigate to="/home" replace />
              )
            ) : (
              <Login />
            )
          }
        />
        <Route
          path="/registerRoom"
          element={
            <ProtectedRouteWrapper forStudentOnly={true}>
              <RoomRegistration />
            </ProtectedRouteWrapper>
          }
        />

        {/* Student Layout Routes */}
        <Route element={<LayoutComponent />}>
          <Route
            path="/home"
            element={
              <ProtectedRouteWrapper forStudentOnly={true}>
                <Home />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="/personal-dashboard"
            element={
              <ProtectedRouteWrapper forStudentOnly={true}>
                <PersonalDashboard />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="/room-member"
            element={
              <ProtectedRouteWrapper forStudentOnly={true}>
                <StudentList />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="/room-equipment"
            element={
              <ProtectedRouteWrapper forStudentOnly={true}>
                <RoomEquipment />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="/contract-management"
            element={
              <ProtectedRouteWrapper forStudentOnly={true}>
                <ContractManagement />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="/payment"
            element={
              <ProtectedRouteWrapper forStudentOnly={true}>
                <Payment isRoomLeader={user?.isLeader === true} />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="/support/create-request"
            element={
              <ProtectedRouteWrapper forStudentOnly={true}>
                <Support />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="/support/check-request"
            element={
              <ProtectedRouteWrapper forStudentOnly={true}>
                <CheckRequest />
              </ProtectedRouteWrapper>
            }
          />
        </Route>

        {/* Admin Layout Routes */}
        <Route element={<AdminLayout />}>
          <Route
            path="/admin/home"
            element={
              <ProtectedRouteWrapper
                allowedRoles={['generalManager', 'cashier', 'maintenanceStaff']}
              >
                <Home />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRouteWrapper
                allowedRoles={['generalManager', 'cashier', 'maintenanceStaff']}
              >
                <AdminDashboard />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="/admin/open-registration"
            element={
              <ProtectedRouteWrapper allowedRoles={['generalManager']}>
                <AdminOpenRegistration />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="/admin/student-management"
            element={
              <ProtectedRouteWrapper
                allowedRoles={['generalManager', 'cashier']}
              >
                <StudentManagement />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="/admin/room-management"
            element={
              <ProtectedRouteWrapper allowedRoles={['generalManager']}>
                <RoomManagementAdmin />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="/admin/equipment-room-management"
            element={
              <ProtectedRouteWrapper
                allowedRoles={['generalManager', 'maintenanceStaff']}
              >
                <RoomEquipmentRoom />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="/admin/equipment-management"
            element={
              <ProtectedRouteWrapper
                allowedRoles={['generalManager', 'maintenanceStaff']}
              >
                <RoomEquipmentList />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="/admin/equipment-statistics"
            element={
              <ProtectedRouteWrapper allowedRoles={['generalManager']}>
                <EquipmentStatistics />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="/admin/payment-status/rent"
            element={
              <ProtectedRouteWrapper
                allowedRoles={['generalManager', 'cashier']}
              >
                <PaymentRentManagement />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="/admin/payment-status/utilities"
            element={
              <ProtectedRouteWrapper
                allowedRoles={['generalManager', 'cashier']}
              >
                <PaymentUtilitiesManagement />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="/admin/support-management"
            element={
              <ProtectedRouteWrapper
                allowedRoles={['generalManager', 'maintenanceStaff']}
              >
                <SupportStudent />
              </ProtectedRouteWrapper>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
