"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types";

interface AuthContextType {
  user: User | null;
  systemUsers: User[];
  setSystemUsers: React.Dispatch<React.SetStateAction<User[]>>;
  login: (username: string, role: User["role"]) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_ADMIN: User = { 
  id: "admin-id", 
  username: "Admin", 
  fullName: "مدير النظام", 
  email: "admin@edu.com", 
  role: "Admin", 
  observation: "الحساب الرئيسي", 
  isActive: true 
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("scheduler_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [systemUsers, setSystemUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem("academic_scheduler_v2_data");
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.systemUsers || [DEFAULT_ADMIN];
    }
    return [DEFAULT_ADMIN];
  });

  const login = (username: string, role: User["role"]) => {
    const found = systemUsers.find(u => u.username === username);
    const userToLogin = found || { 
      id: Math.random().toString(36).substr(2, 9), 
      username, 
      fullName: username, 
      email: "", 
      role, 
      observation: "", 
      isActive: true 
    };
    setUser(userToLogin);
    localStorage.setItem("scheduler_user", JSON.stringify(userToLogin));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("scheduler_user");
  };

  return (
    <AuthContext.Provider value={{ user, systemUsers, setSystemUsers, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};