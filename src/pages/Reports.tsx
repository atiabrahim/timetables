"use client";

import React, { useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Printer, FileText, Users, Home, BookOpen, MapPin } from "lucide-react";

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899'];

const Reports = () => {
  const { employees, assignments, classes, rooms, isRTL, t } = useApp();

  // حساب نصاب كل أستاذ
  const teacherLoadData = useMemo(() => {
    return employees.map(emp => ({
      name: `${emp.lastName} ${emp.firstName[0]}.`,
      lessons: assignments.filter(a => a.employeeId === emp.id).length
    })).filter(d => d.lessons > 0).sort((a, b) => b.lessons - a.lessons);
  }, [employees, assignments]);

  // حساب إشغال القاعات
  const roomUsageData = useMemo(() => {
    return rooms.map(room => ({
      name: room,
      value: assignments.filter(a => a.room === room).length
    })).filter(d => d.value > 0);
  }, [rooms, assignments]);

  // حساب الحصص لكل فرع
  const classSummaryData = useMemo(() => {
    return classes.map(cls => ({
      name: cls.name,
      lessons: assignments.filter(a => a.classId === cls.id).length
    })).filter(d => d.lessons > 0);
  }, [classes, assignments]);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-3xl font-bold text-emerald-950">{t.reports_page.title}</h2>
          <p className="text-emerald-600/70 mt-1">
            {isRTL ? "تحليل شامل لتوزيع الموارد والمهام" : "Comprehensive analysis of resource distribution"}
          </p>
        </div>
        <Button onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl">
          <Printer size={18} className={isRTL ? "ml-2" : "mr-2"} />
          {t.reports_page.print_report}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* نصاب الأساتذة */}
        <Card className="border-none shadow-xl shadow-emerald-100/20 rounded-3xl overflow-hidden bg-white">
          <CardHeader className="border-b border-emerald-50 bg-emerald-50/30">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-emerald-900">
              <Users size={20} className="text-emerald-500" />
              {t.reports_page.teacher_load}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teacherLoadData} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0fdf4" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#064e3b', fontSize: 12, fontWeight: 600 }}
                    width={100}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f0fdf4' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="lessons" fill="#10b981" radius={[0, 10, 10, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* إشغال القاعات */}
        <Card className="border-none shadow-xl shadow-emerald-100/20 rounded-3xl overflow-hidden bg-white">
          <CardHeader className="border-b border-emerald-50 bg-emerald-50/30">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-emerald-900">
              <MapPin size={20} className="text-emerald-500" />
              {t.reports_page.room_usage}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex flex-col items-center">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roomUsageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {roomUsageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full mt-4">
              {roomUsageData.map((room, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                  <span className="font-medium text-emerald-900">{room.name}:</span>
                  <span className="text-emerald-600 font-bold">{room.value} {isRTL ? "حصة" : "Lessons"}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ملخص الفروع */}
        <Card className="lg:col-span-2 border-none shadow-xl shadow-emerald-100/20 rounded-3xl overflow-hidden bg-white">
          <CardHeader className="border-b border-emerald-50 bg-emerald-50/30">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-emerald-900">
              <Home size={20} className="text-emerald-500" />
              {t.reports_page.class_summary}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {classSummaryData.map((cls, idx) => (
                <div key={idx} className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex flex-col items-center text-center">
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">{isRTL ? "الفرع" : "Branch"}</p>
                  <p className="font-black text-emerald-950 text-lg mb-2">{cls.name}</p>
                  <div className="w-full h-1.5 bg-emerald-100 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-emerald-500" style={{ width: `${(cls.lessons / 40) * 100}%` }}></div>
                  </div>
                  <p className="text-xs font-bold text-emerald-700">{cls.lessons} {isRTL ? "حصة أسبوعياً" : "Lessons / Week"}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* نسخة الطباعة فقط */}
      <div className="hidden print:block mt-10">
        <h1 className="text-2xl font-bold text-center mb-8">{isRTL ? "تقرير الإحصائيات العام" : "General Statistics Report"}</h1>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2">{isRTL ? "الأستاذ" : "Teacher"}</th>
              <th className="border border-gray-300 p-2">{isRTL ? "عدد الحصص" : "Lessons"}</th>
              <th className="border border-gray-300 p-2">{isRTL ? "المواد" : "Subjects"}</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.id}>
                <td className="border border-gray-300 p-2">{emp.lastName} {emp.firstName}</td>
                <td className="border border-gray-300 p-2 text-center">{assignments.filter(a => a.employeeId === emp.id).length}</td>
                <td className="border border-gray-300 p-2">
                  {Array.from(new Set(assignments.filter(a => a.employeeId === emp.id).map(a => subjects.find(s => s.id === a.subjectId)?.name))).join(", ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;