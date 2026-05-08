"use client";

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Trash2, 
  Users2, 
  UserCog, 
  Shield, 
  User, 
  Mail, 
  Info, 
  Power, 
  PowerOff,
  ShieldAlert
} from "lucide-react";
import { showSuccess, showError } from "../utils/toast";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Navigate } from "react-router-dom";

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

  // حماية الصفحة: إذا لم يكن المستخدم مديراً، يتم توجيهه للرئيسية
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-emerald-950">{isRTL ? "إدارة المستخدمين" : "User Management"}</h2>
          <p className="text-emerald-600/70 mt-1">{isRTL ? "التحكم في صلاحيات وحسابات مستخدمي النظام" : "Control system user permissions and accounts"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Add User Form */}
        <Card className="border-none shadow-xl shadow-emerald-100/20 rounded-3xl overflow-hidden h-fit">
          <CardHeader className="bg-emerald-50/50 border-b border-emerald-100">
            <CardTitle className="text-lg font-bold text-emerald-900 flex items-center gap-2">
              <Plus size={20} />
              {isRTL ? "إضافة مستخدم جديد" : "Add New User"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-emerald-700 uppercase">{isRTL ? "اسم المستخدم" : "Username"}</label>
                <Input 
                  value={newUser.username} 
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  className="rounded-xl border-emerald-100 h-10"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-emerald-700 uppercase">{isRTL ? "الصلاحية" : "Role"}</label>
                <Select value={newUser.role} onValueChange={(v: any) => setNewUser({...newUser, role: v})}>
                  <SelectTrigger className="rounded-xl border-emerald-100 h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">{isRTL ? "مدير" : "Admin"}</SelectItem>
                    <SelectItem value="Teacher">{isRTL ? "أستاذ" : "Teacher"}</SelectItem>
                    <SelectItem value="Student">{isRTL ? "طالب" : "Student"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-emerald-700 uppercase">{isRTL ? "الاسم الكامل" : "Full Name"}</label>
              <Input 
                value={newUser.fullName} 
                onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                className="rounded-xl border-emerald-100 h-10"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-emerald-700 uppercase">{isRTL ? "البريد الإلكتروني" : "Email"}</label>
              <Input 
                type="email"
                value={newUser.email} 
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                className="rounded-xl border-emerald-100 h-10"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-emerald-700 uppercase">{isRTL ? "ملاحظة" : "Observation"}</label>
              <Input 
                value={newUser.observation} 
                onChange={(e) => setNewUser({...newUser, observation: e.target.value})}
                className="rounded-xl border-emerald-100 h-10"
              />
            </div>
            <Button onClick={handleAddUser} className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-xl mt-4 h-11">
              {isRTL ? "تأكيد الإضافة" : "Confirm Add"}
            </Button>
          </CardContent>
        </Card>

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
              <Card key={u.id} className={cn(
                "border-none shadow-lg transition-all group relative overflow-hidden rounded-3xl",
                u.isActive ? "bg-white" : "bg-gray-50 opacity-75"
              )}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm",
                        u.role === "Admin" ? "bg-emerald-100 text-emerald-700" : "bg-blue-50 text-blue-600"
                      )}>
                        {u.role === "Admin" ? <Shield size={24} /> : <User size={24} />}
                      </div>
                      <div>
                        <p className="font-bold text-emerald-950 leading-tight">{u.fullName}</p>
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter mt-0.5">
                          @{u.username} • {u.role === "Admin" ? (isRTL ? "مدير" : "Admin") : u.role === "Teacher" ? (isRTL ? "أستاذ" : "Teacher") : (isRTL ? "طالب" : "Student")}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={cn("h-8 w-8 rounded-lg", u.isActive ? "text-emerald-500" : "text-amber-500")}
                        onClick={() => toggleUserStatus(u.id)}
                      >
                        {u.isActive ? <Power size={16} /> : <PowerOff size={16} />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteUser(u.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 border-t border-emerald-50 pt-4">
                    <div className="flex items-center gap-2 text-xs text-emerald-600/70">
                      <Mail size={12} />
                      <span className="truncate">{u.email || "---"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-emerald-600/70">
                      <Info size={12} />
                      <span className="truncate italic">{u.observation || "---"}</span>
                    </div>
                  </div>

                  {!u.isActive && (
                    <div className="absolute inset-0 bg-gray-100/10 backdrop-blur-[1px] pointer-events-none flex items-center justify-center">
                      <div className="bg-gray-800/90 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-2">
                        <ShieldAlert size={12} />
                        {isRTL ? "الحساب موقوف" : "Account Suspended"}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;