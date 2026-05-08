"use client";

import React, { useMemo } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, 
  BookOpen, 
  Home, 
  Calendar, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  ShieldAlert
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { cn } from "@/lib/utils";

const Index = () => {
  const { employees, classes, subjects, assignments, rooms, isRTL } = useApp();
  const navigate = useNavigate();

  const stats = [
    { 
      label: isRTL ? "الموظفون" : "Employees", 
      value: employees.length, 
      icon: Users, 
      color: "bg-blue-500", 
      shadow: "shadow-blue-100",
      path: "/employees"
    },
    { 
      label: isRTL ? "الأفواج" : "Classes", 
      value: classes.length, 
      icon: Home, 
      color: "bg-emerald-500", 
      shadow: "shadow-emerald-100",
      path: "/classes"
    },
    { 
      label: isRTL ? "المواد" : "Subjects", 
      value: subjects.length, 
      icon: BookOpen, 
      color: "bg-amber-500", 
      shadow: "shadow-amber-100",
      path: "/subjects"
    },
    { 
      label: isRTL ? "الحصص" : "Lessons", 
      value: assignments.length, 
      icon: Calendar, 
      color: "bg-purple-500", 
      shadow: "shadow-purple-100",
      path: "/schedule"
    },
  ];

  // Conflict Detection Logic
  const conflicts = useMemo(() => {
    const roomConflicts: any[] = [];
    const teacherConflicts: any[] = [];
    
    const grouped = assignments.reduce((acc: any, curr) => {
      const key = `${curr.day}-${curr.period}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(curr);
      return acc;
    }, {});

    Object.values(grouped).forEach((periodAssignments: any) => {
      // Room conflicts
      const roomMap: any = {};
      periodAssignments.forEach((a: any) => {
        if (a.room) {
          if (roomMap[a.room]) roomConflicts.push({ room: a.room, day: a.day, period: a.period });
          roomMap[a.room] = true;
        }
      });

      // Teacher conflicts
      const teacherMap: any = {};
      periodAssignments.forEach((a: any) => {
        if (a.employeeId) {
          if (teacherMap[a.employeeId]) teacherConflicts.push({ teacher: a.employeeId, day: a.day, period: a.period });
          teacherMap[a.employeeId] = true;
        }
      });
    });

    return { roomConflicts, teacherConflicts };
  }, [assignments]);

  const chartData = classes.map(c => ({
    name: c.name,
    count: assignments.filter(a => a.classId === c.id).length
  })).slice(0, 8);

  const roomCapacity = rooms.length > 0 ? Math.round((new Set(assignments.map(a => a.room)).size / rooms.length) * 100) : 0;

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
        <div className="px-4 py-2 bg-white text-emerald-700 rounded-2xl border border-emerald-100 flex items-center gap-2 shadow-sm">
          <Clock size={18} className="text-emerald-500" />
          <span className="font-bold">{new Date().toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <Card 
            key={idx} 
            onClick={() => navigate(stat.path)}
            className="border-none shadow-xl shadow-emerald-100/20 hover:translate-y-[-4px] transition-all duration-300 rounded-3xl overflow-hidden group bg-white cursor-pointer active:scale-95"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={cn("p-3 rounded-2xl text-white", stat.color, stat.shadow)}>
                  <stat.icon size={24} />
                </div>
                <div className="flex items-center text-emerald-500 text-[10px] font-bold bg-emerald-50 px-2 py-1 rounded-lg">
                  <ArrowUpRight size={12} className={isRTL ? "ml-1" : "mr-1"} />
                  {isRTL ? "عرض الكل" : "VIEW ALL"}
                </div>
              </div>
              <div className="mt-5">
                <p className="text-emerald-600/60 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                <p className="text-4xl font-black text-emerald-950 mt-1">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <Card className="lg:col-span-2 border-none shadow-xl shadow-emerald-100/20 rounded-3xl p-6 bg-white">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-bold text-emerald-950 text-xl">{isRTL ? "توزيع الحصص الأسبوعي" : "Weekly Lesson Distribution"}</h3>
              <p className="text-xs text-emerald-600/60 mt-1">{isRTL ? "عدد الحصص لكل فوج تربوي" : "Number of lessons per academic class"}</p>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] text-emerald-700 font-bold uppercase">{isRTL ? "مباشر" : "Live"}</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#064e3b', fontSize: 11, fontWeight: 600}} />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: '#f0fdf4'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px'}}
                />
                <Bar dataKey="count" radius={[10, 10, 10, 10]} barSize={40}>
                  {chartData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#10b981' : '#34d399'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Notifications / Alerts */}
        <Card className="border-none shadow-xl shadow-emerald-900/20 rounded-3xl p-6 bg-emerald-950 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <h3 className="font-bold text-xl mb-6 relative z-10">{isRTL ? "حالة النظام" : "System Status"}</h3>
          
          <div className="space-y-5 relative z-10">
            <div className="flex items-start gap-4 p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
                <CheckCircle2 className="text-emerald-400" size={20} />
              </div>
              <div>
                <p className="font-bold text-sm">{isRTL ? "البيانات" : "Data Integrity"}</p>
                <p className="text-xs text-emerald-300/70 mt-1">
                  {employees.length > 0 ? (isRTL ? "قاعدة البيانات نشطة" : "Database is active") : (isRTL ? "لا توجد بيانات" : "No data found")}
                </p>
              </div>
            </div>

            {(conflicts.roomConflicts.length > 0 || conflicts.teacherConflicts.length > 0) ? (
              <div className="flex items-start gap-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/20">
                <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center shrink-0">
                  <ShieldAlert className="text-red-400" size={20} />
                </div>
                <div>
                  <p className="font-bold text-sm text-red-200">{isRTL ? "تعارضات مكتشفة" : "Conflicts Detected"}</p>
                  <p className="text-xs text-red-300/70 mt-1">
                    {isRTL 
                      ? `تم رصد ${conflicts.roomConflicts.length + conflicts.teacherConflicts.length} تعارض في الجدول` 
                      : `${conflicts.roomConflicts.length + conflicts.teacherConflicts.length} conflicts found in schedule`
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
                  <CheckCircle2 className="text-emerald-400" size={20} />
                </div>
                <div>
                  <p className="font-bold text-sm text-emerald-200">{isRTL ? "لا توجد تعارضات" : "No Conflicts"}</p>
                  <p className="text-xs text-emerald-300/70 mt-1">{isRTL ? "الجدول الزمني متناسق حالياً" : "Schedule is currently consistent"}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-10 p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-3">{isRTL ? "إشغال القاعات" : "ROOM OCCUPANCY"}</p>
            <div className="flex items-end justify-between mb-2">
              <span className="text-3xl font-black">{roomCapacity}%</span>
              <span className="text-xs text-emerald-400 font-medium">{new Set(assignments.map(a => a.room)).size}/{rooms.length} {isRTL ? "قاعات" : "Rooms"}</span>
            </div>
            <div className="w-full h-2 bg-emerald-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-400 transition-all duration-1000 ease-out" 
                style={{ width: `${roomCapacity}%` }}
              ></div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;