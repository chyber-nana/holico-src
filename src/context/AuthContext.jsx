import { createContext, useContext, useState } from "react";
import { loginAdmin } from "../api/adminApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    const raw = localStorage.getItem("adminData");
    return raw ? JSON.parse(raw) : null;
  });

  const handleLogin = async (email, password) => {
    const data = await loginAdmin({ email, password });
    localStorage.setItem("adminToken", data.token);
    localStorage.setItem("adminData", JSON.stringify(data.admin));
    setAdmin(data.admin);
    return data;
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        handleLogin,
        handleLogout,
        isAuthenticated: !!localStorage.getItem("adminToken"),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);