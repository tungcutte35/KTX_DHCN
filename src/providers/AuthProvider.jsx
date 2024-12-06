import React, { createContext, useContext, useState } from 'react';

// Tạo context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Lưu thông tin người dùng
  const [role, setRole] = useState(''); // Có thể là 'admin' hoặc 'student'

  const login = (userData) => {
    setUser(userData);
    setRole(userData.role); // Giả sử userData có trường role
  };

  const logout = () => {
    setUser(null);
    setRole('');
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook để sử dụng context dễ dàng hơn
export const useAuth = () => useContext(AuthContext);
