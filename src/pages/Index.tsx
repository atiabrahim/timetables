"use client";

import React from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, 
  BookOpen, 
  Home, 
  Calendar, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { cn } from "@/lib/utils";

const Index = () => {
  const { employees, classes, subjects, assignments, isRTL } = useApp();

  const stats = [
    { label: isRTL ? "الموظفون" : "Employees", value: employees.length, icon: Users, color: "bg-blue-500", shadow: "shadow-blue-100" },
    { label: isRTL ? "الأفواج" : "Classes", value: classes.length, icon: Home, color: "bg-emerald-500", shadow: "shadow-emerald-100" },
    { label: isRTL ? "المواد" : "Subjects", value: subjects.length, icon: BookOpen, color: "bg-amber-500", shadow: "shadow-amber-100" },
    { label: isRTL ? "الحصص" : "Lessons", value: assignments.length, icon: Calendar, color: "bg-purple-500", shadow: "shadow-purple-100" },
  ];

  // بيانات بيانية بسيطة (توزيع الحصص حسب الفوج)
  const chartData = classes.map(c => ({
    name: c.name,
    count: assignments.filter(a => a.classId === c.id).length
  })).slice(0, 8);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-emerald-950 tracking-tight">
            {isRTL ? "مرحباً بك مجدداً!" : "Welcome Back!"}
          </h1>
          <p className="text-emerald-600/70 font-medium mt-1">
            {isRTL ? "نظام الإدارة التربوية والجدول الزمني" : "Educational Management & Scheduling System"}
          </p>
        </div>
        <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 flex items-center gap-2">
          <Clock size={18} />
          <span className="font-bold">{new Date().toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <Card key={idx} className="border-none shadow-xl shadow-gray-100/50 hover:scale-[1.02] transition-transform rounded-3xl overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={cn("p-3 rounded-2xl text-white", stat.color, stat.shadow)}>
                  <stat.icon size={24} />
                </div>
                <div className="flex items-center text-emerald-500 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-lg">
                  <ArrowUpRight size={14} className={isRTL ? "ml-1" : "mr-1"} />
                  +12%
                </div>
              </div>
              <div className="mt-5">
                <p className="text-emerald-600/60 text-sm font-semibold uppercase tracking-wider">{stat.label}</p>
                <p className="text-4xl font-black text-emerald-950 mt-1">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <Card className="lg:col-span-2 border-none shadow-xl shadow-gray-100/50 rounded-3xl p-6 bg-white/80 backdrop-blur-md">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-emerald-950 text-xl">{isRTL ? "توزيع الحصص الأسبوعي" : "Weekly Lesson Distribution"}</h3>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-[10px] text-emerald-600 font-bold">{isRTL ? "نشط" : "Active"}</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#064e3b', fontSize: 12}} />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="count" radius={[8, 8, 8, 8]} barSize={35}>
                  {chartData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#10b981' : '#34d399'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Notifications / Alerts */}
        <Card className="border-none shadow-xl shadow-gray-100/50 rounded-3xl p-6 bg-emerald-900 text-white">
          <h3 className="font-bold text-xl mb-6">{isRTL ? "حالة النظام" : "System Status"}</h3>
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
                <CheckCircle2 className="text-emerald-400" size={20} />
              </div>
              <div>
                <p className="font-bold text-sm">{isRTL ? "البيانات مكتملة" : "Data Complete"}</p>
                <p className="text-xs text-emerald-300/80 mt-1">{isRTL ? "جميع الموظفين مسجلون في النظام" : "All staff members are registered"}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center shrink-0">
                <AlertCircle className="text-amber-400" size={20} />
              </div>
              <div>
                <p className="font-bold text-sm">{isRTL ? "تعارضات محتملة" : "Potential Conflicts"}</p>
                <p className="text-xs text-emerald-300/80 mt-1">{isRTL ? "تم رصد 2 تعارض في القاعات" : "2 room conflicts detected"}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-10 p-5 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-xs font-medium text-emerald-400 uppercase tracking-widest mb-3">{isRTL ? "سعة المؤسسة" : "CAPACITY"}</p>
            <div className="flex items-end justify-between mb-2">
              <span className="text-3xl font-black">78%</span>
              <span className="text-xs text-emerald-400">12/15 {isRTL ? "قاعات" : "Rooms"}</span>
            </div>
            <div className="w-full h-2 bg-emerald-950 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[78%]"></div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;