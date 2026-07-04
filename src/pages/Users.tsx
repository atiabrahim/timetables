"use client";

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Navigate } from "react-router-dom";
import { Users2, UserCog } from "lucide-react";
import { showSuccess, showError } from "../utils/toast";
import PageHeader from "../components/shared/PageHeader";
import AddUserCard from "../components/users/AddUserCard";
import UserCard from "../components/users/UserCard";

const Users = () => {
  const { 
    systemUsers, setSystemUsers, 
    user: currentUser, 
    isRTL 
  } = useApp();
  
  const [newUser, setNewUser] = useState({
    username: "",
    fullName: "",
    email: "",
    role: "Teacher" as "Admin" | "Teacher" | "Student",
    observation: ""
  });

  if (currentUser?.role !== "Admin") {
    return <Navigate to="/" replace />;
  }

  const handleAddUser = () => {
    if (!newUser.username.trim() || !newUser.fullName.trim()) {
      showError(isRTL ? "يرجى ملء الحقول الأساسية" : "Please fill required fields");
      return;
    }
    if (systemUsers.find(u => u.username === newUser.username)) {
      showError(isRTL ? "اسم المستخدم موجود مسبقاً" : "Username already exists");
      return;
    }

    const userToAdd = {
      id: Math.random().toString(36).substr(2, 9),
      ...newUser,
      isActive: true
    };

    setSystemUsers([...systemUsers, userToAdd]);
    setNewUser({ username: "", fullName: "", email: "", role: "Teacher", observation: "" });
    showSuccess(isRTL ? "تم إضافة المستخدم بنجاح" : "User added successfully");
  };

  const toggleUserStatus = (id: string) => {
    setSystemUsers(systemUsers.map(u => 
      u.id === id ? { ...u, isActive: !u.isActive } : u
    ));
    showSuccess(isRTL ? "تم تحديث حالة الحساب" : "Account status updated");
  };

  const handleDeleteUser = (id: string) => {
    if (id === currentUser?.id) {
      showError(isRTL ? "لا يمكنك حذف حسابك الحالي" : "You cannot delete your own account");
      return;
    }
    setSystemUsers(systemUsers.filter(u => u.id !== id));
    showSuccess(isRTL ? "تم حذف المستخدم" : "User deleted");
  };

  return (
    <div className="space-y-8 pb-20">
      <PageHeader
        title={isRTL ? "إدارة المستخدمين" : "User Management"}
        subtitle={isRTL ? "التحكم في حسابات النظام وصلاحيات الوصول" : "Control system accounts and access permissions"}
        icon={UserCog}
        isRTL={isRTL}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Add User Form */}
        <AddUserCard 
          isRTL={isRTL}
          newUser={newUser}
          setNewUser={setNewUser}
          onAdd={handleAddUser}
        />

        {/* Users List */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-emerald-900 flex items-center gap-2">
              <Users2 className="text-emerald-500" size={20} />
              {isRTL ? "قائمة المستخدمين" : "Users List"}
            </h4>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              {systemUsers.length} {isRTL ? "مستخدم" : "Users"}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {systemUsers.map(u => (
              <UserCard 
                key={u.id}
                u={u}
                isRTL={isRTL}
                currentUserId={currentUser?.id || ""}
                onToggleStatus={toggleUserStatus}
                onDelete={handleDeleteUser}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;