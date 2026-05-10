"use client";

import React, { useMemo, useState } from "react";
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
import { 
  Printer, 
  FileText, 
  Users, 
  Home, 
  BookOpen, 
  MapPin, 
  Eye, 
  X, 
  RotateCw, 
  Maximize2 
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899'];

const Reports = () => {
  const { employees, assignments, classes, rooms, subjects, isRTL, t } = useApp();
  
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [printScale, setPrintScale] = useState(100);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");

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

  const ReportContent = ({ isPreview = false }: { isPreview?: boolean }) => (
    <div className={cn("space-y-8", isPreview && "p-4")}>
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

      {/* نسخة الجدول التفصيلي */}
      <div className="mt-10">
        <h3 className="text-xl font-bold text-emerald-950 mb-4 text-center">{isRTL ? "تقرير الإحصائيات العام" : "General Statistics Report"}</h3>
        <div className="overflow-hidden rounded-2xl border border-gray-200">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border-b border-gray-200 p-3 text-sm font-bold text-emerald-900">{isRTL ? "الأستاذ" : "Teacher"}</th>
                <th className="border-b border-gray-200 p-3 text-sm font-bold text-emerald-900">{isRTL ? "عدد الحصص" : "Lessons"}</th>
                <th className="border-b border-gray-200 p-3 text-sm font-bold text-emerald-900">{isRTL ? "المواد" : "Subjects"}</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.id} className="hover:bg-gray-50/50">
                  <td className="border-b border-gray-100 p-3 text-sm">{emp.lastName} {emp.firstName}</td>
                  <td className="border-b border-gray-100 p-3 text-sm text-center font-bold">{assignments.filter(a => a.employeeId === emp.id).length}</td>
                  <td className="border-b border-gray-100 p-3 text-xs text-gray-600">
                    {Array.from(new Set(assignments.filter(a => a.employeeId === emp.id).map(a => subjects.find(s => s.id === a.subjectId)?.name))).join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-3xl font-bold text-emerald-950">{t.reports_page.title}</h2>
          <p className="text-emerald-600/70 mt-1">
            {isRTL ? "تحليل شامل لتوزيع الموارد والمهام" : "Comprehensive analysis of resource distribution"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsPreviewOpen(true)} className="rounded-xl border-emerald-100 text-emerald-700">
            <Eye size={18} className={isRTL ? "ml-2" : "mr-2"} />
            {isRTL ? "معاينة الطباعة" : "Print Preview"}
          </Button>
          <Button onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl">
            <Printer size={18} className={isRTL ? "ml-2" : "mr-2"} />
            {t.reports_page.print_report}
          </Button>
        </div>
      </div>

      <ReportContent />

      {/* Dialog معاينة قبل الطباعة */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[95vw] w-full h-[90vh] overflow-y-auto rounded-3xl p-0 border-none">
          <div className="sticky top-0 bg-white border-b p-4 flex flex-col md:flex-row justify-between items-center gap-4 z-10">
            <div className="flex items-center gap-3">
              <Eye className="text-emerald-600" />
              <h3 className="font-bold text-lg">{isRTL ? "معاينة تقرير الإحصائيات" : "Statistics Report Preview"}</h3>
            </div>
            
            <div className="flex flex-1 max-w-xs items-center gap-4 px-4">
              <Maximize2 size={16} className="text-gray-400" />
              <Slider 
                value={[printScale]} 
                onValueChange={(v) => setPrintScale(v[0])} 
                min={30} 
                max={150} 
                step={1}
                className="flex-1"
              />
              <span className="text-xs font-bold text-emerald-700 w-10">{printScale}%</span>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setOrientation(orientation === "portrait" ? "landscape" : "portrait")}
                className="rounded-xl border-emerald-100 text-emerald-700"
              >
                <RotateCw size={18} className={isRTL ? "ml-2" : "mr-2"} />
                {isRTL ? (orientation === "portrait" ? "عرضي" : "طولي") : (orientation === "portrait" ? "Landscape" : "Portrait")}
              </Button>
              <Button onClick={() => window.print()} className="bg-emerald-600 rounded-xl">
                <Printer size={18} className={isRTL ? "ml-2" : "mr-2"} />
                {isRTL ? "طباعة الآن" : "Print Now"}
              </Button>
              <Button variant="ghost" onClick={() => setIsPreviewOpen(false)} className="rounded-xl">
                <X size={18} />
              </Button>
            </div>
          </div>
          <div className="p-8 bg-gray-50 min-h-full flex justify-center overflow-auto">
            <div className={cn(
              "bg-white shadow-2xl p-10 border border-gray-200 transition-all duration-300 origin-top",
              orientation === "portrait" ? "w-[210mm] min-h-[297mm]" : "w-[297mm] min-h-[210mm]"
            )} style={{ transform: `scale(${printScale / 100})` }}>
              <style>
                {`
                  @media print {
                    @page { size: ${orientation}; margin: 10mm; }
                    body * { visibility: hidden; }
                    .print-report-content, .print-report-content * { visibility: visible; }
                    .print-report-content { 
                      position: absolute; 
                      left: 0; 
                      top: 0; 
                      width: 100%; 
                      transform: scale(${printScale / 100});
                      transform-origin: top center;
                    }
                  }
                `}
              </style>
              <div className="print-report-content">
                <div className="text-center mb-8 border-b-2 border-emerald-900 pb-6">
                  <h1 className="text-2xl font-black text-emerald-950 mb-2">EduSchedule</h1>
                  <p className="text-sm font-bold text-emerald-700 uppercase tracking-widest">
                    {isRTL ? "تقرير الإحصائيات والتحليل العام" : "General Statistics & Analysis Report"}
                  </p>
                  <div className="mt-4 flex justify-center gap-8 text-xs font-bold text-gray-600">
                    <p>{isRTL ? "التاريخ:" : "Date:"} {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
                <ReportContent isPreview={true} />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reports;