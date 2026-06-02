"use client";

import React, { useMemo } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  BookOpen, 
  Calendar, 
  MapPin,
  ListChecks,
  Clock,
  GraduationCap,
  FileText,
  ArrowUpRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  UserCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";

const Index = () => {
  const { 
    employees, classes, subjects, assignments, rooms, isRTL, t, user, 
    getEffectiveAssignment, language 
  } = useApp();
  const navigate = useNavigate();

  const todayDateStr = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);
  const todayFriendlyName = useMemo(() => {
    const locale = language === "ar" ? ar : enUS;
    return format(new Date(), "EEEE, d MMMM yyyy", { locale });
  }, [language]);

  // جلب المكلفين لليوم الحالي في الفترات الثلاث
  const todayDuties = useMemo(() => {
    const periods: ("Morning" | "Afternoon" | "Evening")[] = ["Morning", "Afternoon", "Evening"];
    return periods.map(period => {
      const ids = getEffectiveAssignment(todayDateStr, period);
      const assignedEmployees = ids
        .map(id => employees.find(e => e.id === id))
        .filter(Boolean);
      return {
        period,
        label: period === "Morning" ? t.morning : period === "Afternoon" ? t.afternoon : t.evening,
        employees: assignedEmployees,
        count: assignedEmployees.length
      };
    });
  }, [todayDateStr, employees, getEffectiveAssignment, t, language]);

  // حساب الإحصائيات الحقيقية
  const stats = useMemo(() => [
    { label: t.stats.teachers, value: employees.length, icon: Users, color: "text-blue-600", bg: "bg-blue-50", path: "/employees" },
    { label: t.stats.classes, value: classes.length, icon: GraduationCap, color: "text-emerald-600", bg: "bg-emerald-50", path: "/classes" },
    { label: t.stats.subjects, value: subjects.length, icon: BookOpen, color: "text-amber-600", bg: "bg-amber-50", path: "/subjects" },
    { label: t.stats.rooms, value: rooms.length, icon: MapPin, color: "text-rose-600", bg: "bg-rose-50", path: "/rooms" },
  ], [employees, classes, subjects, rooms, t]);

  // حساب نسبة اكتمال الجدول (بافتراض متوسط 30 حصة لكل فرع)
  const completionPercentage = useMemo(() => {
    if (classes.length === 0) return 0;
    const totalPotentialLessons = classes.length * 30; // تقديري
    const percentage = Math.min(Math.round((assignments.length / totalPotentialLessons) * 100), 100);
    return percentage || 0;
  }, [assignments, classes]);

  // حساب أعلى نصاب تدريسي
  const highestLoad = useMemo(() => {
    if (employees.length === 0) return "0";
    const loads = employees.map(emp => assignments.filter(a => a.employeeId === emp.id).length);
    return Math.max(...loads).toString();
  }, [employees, assignments]);

  const quickActions = [
    { label: isRTL ? "إدارة الجدول" : "Manage Schedule", icon: Calendar, path: "/schedule", color: "bg-emerald-600" },
    { label: isRTL ? "قائمة الحصص" : "Lessons List", icon: ListChecks, path: "/lessons", color: "bg-blue-600" },
    { label: isRTL ? "عرض التقارير" : "View Reports", icon: TrendingUp, path: "/reports", color: "bg-indigo-600" },
    { label: isRTL ? "بيانات المؤسسة" : "Institution", icon: FileText, path: "/institution", color: "bg-amber-600" },
  ];

  return (
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-[3rem] bg-emerald-950 p-10 md:p-16 text-white shadow-2xl shadow-emerald-200/50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full -ml-20 -mb-20 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
              <Activity size={16} className="text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100">
                {isRTL ? "نظام الجدولة الذكي v2.0" : "Smart Scheduling System v2.0"}
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
              {t.welcome} <br />
              <span className="text-emerald-400">{user?.fullName || "Admin"}</span>
            </h2>
            <p className="text-emerald-100/60 font-bold text-lg max-w-xl leading-relaxed">
              {isRTL 
                ? "مرحباً بك في لوحة القيادة المركزية. تم تحديث كافة البيانات بناءً على آخر التغييرات في النظام." 
                : "Welcome to your central dashboard. All data has been updated based on the latest system changes."}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 text-center min-w-[140px]">
              <p className="text-3xl font-black">{assignments.length}</p>
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-1">{t.stats.lessons}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 text-center min-w-[140px]">
              <p className="text-3xl font-black">{subjects.length}</p>
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-1">{t.stats.subjects}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Stats and Actions */}
        <div className="xl:col-span-2 space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
              <Card 
                key={idx} 
                onClick={() => navigate(stat.path)}
                className="group border-none shadow-sm rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-emerald-100/50 transition-all cursor-pointer bg-white active:scale-95"
              >
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors", stat.bg, stat.color, "group-hover:bg-emerald-600 group-hover:text-white")}>
                    <stat.icon size={24} />
                  </div>
                  <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Today's Active Duties Section */}
          <Card className="border-none shadow-xl shadow-emerald-100/10 rounded-[2.5rem] bg-white overflow-hidden">
            <CardHeader className="border-b border-gray-50 bg-emerald-50/20 p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="text-xl font-black text-emerald-950 flex items-center gap-2">
                    <UserCheck size={22} className="text-emerald-600" />
                    {isRTL ? "تكليفات حضور اليوم" : "Today's Active Duties"}
                  </CardTitle>
                  <p className="text-xs font-bold text-emerald-600/70 mt-1">{todayFriendlyName}</p>
                </div>
                <Button 
                  onClick={() => navigate("/assignments")} 
                  variant="outline" 
                  className="rounded-xl border-emerald-100 text-emerald-700 hover:bg-emerald-50 font-bold text-xs h-9"
                >
                  {isRTL ? "تعديل التكليفات" : "Edit Assignments"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {todayDuties.map((duty, idx) => (
                  <div key={idx} className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-black text-emerald-900 bg-emerald-50 px-3 py-1 rounded-full">
                        {duty.label}
                      </span>
                      <span className="text-xs font-black text-slate-400">
                        {duty.count} {isRTL ? "مكلف" : "Staff"}
                      </span>
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      {duty.employees.length > 0 ? (
                        duty.employees.map((emp: any) => (
                          <div key={emp.id} className="text-xs font-bold text-slate-700 flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-100">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <span className="truncate">{emp.lastName} {emp.firstName}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-slate-400 text-xs italic">
                          {isRTL ? "لا توجد تكليفات مسجلة" : "No duties assigned"}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Grid */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-emerald-950 px-2">{isRTL ? "الوصول السريع" : "Quick Access"}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action, idx) => (
                <Button
                  key={idx}
                  onClick={() => navigate(action.path)}
                  variant="ghost"
                  className="h-20 justify-start px-6 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all group"
                >
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white mr-4", action.color)}>
                    <action.icon size={20} />
                  </div>
                  <span className="font-bold text-gray-700 flex-1 text-right">{action.label}</span>
                  <ArrowUpRight size={18} className="text-gray-300 group-hover:text-emerald-600 transition-colors" />
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity / Overview */}
        <div className="space-y-8">
          <Card className="border-none shadow-xl shadow-emerald-100/20 rounded-[2.5rem] bg-white h-full">
            <CardHeader className="border-b border-gray-50">
              <CardTitle className="text-lg font-black text-emerald-950 flex items-center gap-2">
                <Activity size={20} className="text-emerald-500" />
                {isRTL ? "حالة النظام" : "System Status"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full", completionPercentage > 80 ? "bg-emerald-500" : "bg-amber-500")}></div>
                    <span className="text-sm font-bold text-gray-700">{isRTL ? "جاهزية الجداول" : "Schedule Readiness"}</span>
                  </div>
                  <span className="text-sm font-black text-emerald-600">{completionPercentage}%</span>
                </div>
                <div className="w-full h-3 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                  <div 
                    className="h-full bg-emerald-500 shadow-lg shadow-emerald-200 transition-all duration-1000" 
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isRTL ? "مؤشرات بيداغوجية" : "Pedagogical Insights"}</p>
                <div className="space-y-3">
                  {[
                    { label: isRTL ? "أعلى نصاب تدريس" : "Highest Teacher Load", value: `${highestLoad} ${isRTL ? 'حصة' : 'Hrs'}`, icon: TrendingUp, color: "text-blue-500" },
                    { label: isRTL ? "القاعات المشغولة" : "Occupied Rooms", value: `${rooms.filter(r => assignments.some(a => a.room === r)).length} / ${rooms.length}`, icon: MapPin, color: "text-rose-500" },
                    { label: isRTL ? "مزامنة البيانات" : "Data Sync Status", value: assignments.length > 0 ? (isRTL ? "متزامن" : "Synced") : (isRTL ? "انتظار" : "Idle"), icon: CheckCircle2, color: "text-emerald-500" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-50">
                      <div className="flex items-center gap-3">
                        <item.icon size={16} className={item.color} />
                        <span className="text-xs font-bold text-gray-600">{item.label}</span>
                      </div>
                      <span className="text-xs font-black text-gray-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                onClick={() => navigate("/schedule")}
                className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 rounded-2xl font-bold shadow-lg shadow-emerald-100 active:scale-95 transition-all text-white"
              >
                {isRTL ? "فتح الجدول الدراسي" : "Open Schedule"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;