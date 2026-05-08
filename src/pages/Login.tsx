"use client";

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar, Shield, User, GraduationCap } from "lucide-react";
import { showError } from "../utils/toast";

const Login = () => {
  const { login, isRTL, systemUsers } = useApp();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState(""); // في هذا النموذج البسيط لا نستخدم كلمة سر حقيقية

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // البحث عن المستخدم في قائمة مستخدمي النظام
    const foundUser = systemUsers.find(u => u.username === username && u.isActive);
    
    if (foundUser==0) {
      login(foundUser.username, foundUser.role);
      navigate("/");
    } else {
      showError(isRTL ? "اسم المستخدم غير موجود أو الحساب معطل" : "Username not found or account inactive");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
      <Card className="w-full max-w-md border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
        <CardHeader className="bg-emerald-950 text-white p-10 text-center relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/20 rotate-3">
            <Calendar size={40} className="text-white -rotate-3" />
          </div>
          <CardTitle className="text-3xl font-black tracking-tight">EduSchedule</CardTitle>
          <p className="text-emerald-400/80 text-sm mt-2 font-medium">
            {isRTL ? "نظام الإدارة والجدول الزمني" : "Management & Scheduling System"}
          </p>
        </CardHeader>
        <CardContent className="p-10">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-emerald-900 uppercase tracking-widest ml-1">
                {isRTL ? "اسم المستخدم" : "Username"}
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                <Input 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin..."
                  className="pl-12 h-14 rounded-2xl border-emerald-100 bg-emerald-50/30 focus:bg-white transition-all text-lg"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-lg font-bold shadow-lg shadow-emerald-100 transition-all active:scale-[0.98]">
              {isRTL ? "دخول للنظام" : "Login to System"}
            </Button>

            <div className="pt-6 border-t border-emerald-50">
              <p className="text-center text-[10px] text-emerald-600/50 font-bold uppercase tracking-widest">
                {isRTL ? "صلاحيات الوصول المتاحة" : "Available Access Roles"}
              </p>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center"><Shield size={16} /></div>
                  <span className="text-[9px] font-bold text-emerald-800">{isRTL ? "مدير" : "Admin"}</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center"><User size={16} /></div>
                  <span className="text-[9px] font-bold text-emerald-800">{isRTL ? "أستاذ" : "Teacher"}</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center"><GraduationCap size={16} /></div>
                  <span className="text-[9px] font-bold text-emerald-800">{isRTL ? "طالب" : "Student"}</span>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;