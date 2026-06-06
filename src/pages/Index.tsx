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
  UserCheck,
  Zap,
  ShieldCheck,
  BarChart3,
  MousePointer2,
  Settings2
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

  const stats = useMemo(() => [
    { label: t.stats.teachers, value: employees.length, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50", path: "/employees", trend: "+2" },
    { label: t.stats.classes, value: classes.length, icon: GraduationCap, color: "text-blue-600", bg: "bg-blue-50", path: "/classes", trend: "Stable" },
    { label: t.stats.subjects, value: subjects.length, icon: BookOpen, color: "text-amber-600", bg: "bg-amber-50", path: "/subjects", trend: "Full" },
    { label: t.stats.rooms, value: rooms.length, icon: MapPin, color: "text-rose-600", bg: "bg-rose-50", path: "/rooms", trend: "Active" },
  ], [employees, classes, subjects, rooms, t]);

  const quickActions = [
    { label: isRTL ? "إضافة حصة" : "Add Lesson", icon: Calendar, path: "/schedule", color: "bg-emerald-100 text-emerald-700" },
    { label: isRTL ? "تكليف يومي" : "Assign Duty", icon: UserCheck, path: "/assignments", color: "bg-blue-100 text-blue-700" },
    { label: isRTL ? "تقرير الحضور" : "Attendance", icon: FileText, path: "/reports-new", color: "bg-amber-100 text-amber-700" },
    { label: isRTL ? "ضبط النظام" : "Config", icon: Settings2, path: "/settings", color: "bg-purple-100 text-purple-700" },
  ];

  const completionPercentage = useMemo(() => {
    if (classes.length === 0) return 0;
    const totalPotentialLessons = classes.length * 30;
    return Math.min(Math.round((assignments.length / totalPotentialLessons) * 100), 100) || 0;
  }, [assignments, classes]);

  return (
    <div className="space-y-10 pb-20">
      {/* Hero Management Console */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-[3.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative overflow-hidden rounded-[3.5rem] bg-emerald-950 p-12 md:p-20 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-emerald-500/10 rounded-full -mr-40 -mt-40 blur-3xl animate-pulse"></div>
          
          <div className="relative z-10 grid grid-cols-1 xl:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="px-4 py-1.5 bg-emerald-500/20 rounded-full border border-emerald-400/30 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-100">System Secure</span>
                </div>
                <div className="px-4 py-1.5 bg-blue-500/20 rounded-full border border-blue-400/30 flex items-center gap-2">
                  <Zap size={14} className="text-blue-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100">Live Sync</span>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1]">
                  {t.welcome} <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                    {user?.fullName || "Administrator"}
                  </span>
                </h2>
                <p className="text-emerald-100/60 font-bold text-xl max-w-lg leading-relaxed">
                  {isRTL 
                    ? "نظام الإدارة المتكامل للجدول الدراسي والمهام البيداغوجية. تحكم كامل في الموارد البشرية والمادية بضغطة واحدة." 
                    : "Integrated management system for schedule and pedagogical tasks. Full control over human and material resources."}
                </p>
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <Button onClick={() => navigate("/schedule")} className="h-16 px-10 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black rounded-3xl text-lg shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95">
                  {isRTL ? "بدء الجدولة" : "Start Scheduling"}
                </Button>
                <Button onClick={() => navigate("/reports-new")} variant="outline" className="h-16 px-10 border-white/20 bg-white/5 hover:bg-white/10 text-white font-black rounded-3xl text-lg backdrop-blur-md">
                  <FileText className="mr-2 h-6 w-6" /> {isRTL ? "التقارير" : "Reports"}
                </Button>
              </div>
            </div>

            <div className="hidden xl:grid grid-cols-2 gap-6">
              {[
                { label: t.stats.lessons, value: assignments.length, sub: "Total Assignments", icon: ListChecks, color: "text-emerald-400" },
                { label: t.stats.subjects, value: subjects.length, sub: "Active Curriculum", icon: BookOpen, color: "text-blue-400" },
                { label: "Today Active", value: todayDuties.reduce((acc, d) => acc + d.count, 0), sub: "Staff on Duty", icon: UserCheck, color: "text-amber-400" },
                { label: "Completion", value: `${completionPercentage}%`, sub: "Schedule Status", icon: BarChart3, color: "text-rose-400" },
              ].map((box, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-2xl p-8 rounded-[3rem] border border-white/10 group/box hover:bg-white/10 transition-all">
                  <box.icon className={cn("mb-4 transition-transform group-hover/box:scale-110", box.color)} size={32} />
                  <p className="text-4xl font-black tracking-tighter mb-1">{box.value}</p>
                  <p className="text-[10px] font-black text-emerald-400/60 uppercase tracking-widest">{box.label}</p>
                  <p className="text-[8px] font-bold text-white/30 uppercase mt-2">{box.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          {/* Quick Actions Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, idx) => (
              <Button
                key={idx}
                variant="ghost"
                onClick={() => navigate(action.path)}
                className={cn(
                  "h-auto flex flex-col items-center gap-3 p-6 rounded-[2.5rem] border border-slate-100 bg-white hover:bg-emerald-50 transition-all shadow-sm hover:shadow-md",
                )}
              >
                <div className={cn("p-4 rounded-2xl", action.color)}>
                  <action.icon size={24} />
                </div>
                <span className="font-black text-xs text-slate-700">{action.label}</span>
              </Button>
            ))}
          </div>

          {/* Real-time Monitor Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
              <Card 
                key={idx} 
                onClick={() => navigate(stat.path)}
                className="group border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:shadow-emerald-200/50 transition-all cursor-pointer bg-white"
              >
                <CardContent className="p-8 flex flex-col items-center text-center">
                  <div className={cn("w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-6 transition-all group-hover:scale-110 group-hover:rotate-3 shadow-lg", stat.bg, stat.color)}>
                    <stat.icon size={32} />
                  </div>
                  <p className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed Today's Operations */}
          <Card className="border-none shadow-2xl shadow-emerald-900/5 rounded-[3rem] bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50 p-10 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                      <UserCheck size={20} />
                    </div>
                    <CardTitle className="text-2xl font-black text-slate-900">
                      {isRTL ? "عمليات اليوم الجارية" : "Live Today's Operations"}
                    </CardTitle>
                  </div>
                  <p className="text-sm font-bold text-slate-400 px-1">{todayFriendlyName}</p>
                </div>
                <Button onClick={() => navigate("/assignments")} className="rounded-2xl h-12 px-8 bg-slate-900 hover:bg-black font-black text-xs text-white">
                  {isRTL ? "تخصيص المهام" : "Assign Duties"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {todayDuties.map((duty, idx) => (
                  <div key={idx} className="group relative">
                    <div className="absolute -inset-2 bg-emerald-50 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-all"></div>
                    <div className="relative space-y-6">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-4 py-1.5 rounded-full uppercase tracking-widest">
                          {duty.label}
                        </span>
                        <span className="text-[10px] font-black text-slate-300">
                          {duty.count} Active
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        {duty.employees.length > 0 ? (
                          duty.employees.map((emp: any) => (
                            <div key={emp.id} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center font-black text-emerald-700 text-xs">
                                {emp.lastName[0]}{emp.firstName[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-black text-slate-800 truncate">{emp.lastName} {emp.firstName}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">{emp.category}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-12 flex flex-col items-center justify-center text-slate-300 gap-2 border-2 border-dashed border-slate-100 rounded-[2rem]">
                            <Clock size={24} className="opacity-20" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{isRTL ? "لا يوجد مكلفين" : "Idle State"}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          {/* System Integrity & Health */}
          <Card className="border-none shadow-2xl shadow-emerald-900/5 rounded-[3rem] bg-emerald-950 text-white h-full overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"></div>
            <CardHeader className="p-10 border-b border-white/5">
              <CardTitle className="text-xl font-black flex items-center gap-3">
                <Activity size={22} className="text-emerald-400" />
                {isRTL ? "مؤشرات بيداغوجية" : "System Integrity"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-10">
              <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.2em]">{isRTL ? "جاهزية الجداول" : "Data Readiness"}</span>
                  <span className="text-2xl font-black">{completionPercentage}%</span>
                </div>
                <div className="h-4 bg-white/5 rounded-full overflow-hidden p-1 border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full shadow-[0_0_20px_rgba(52,211,153,0.4)] transition-all duration-1000" 
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { label: isRTL ? "نسبة إشغال القاعات" : "Room Occupancy", value: `${Math.round((rooms.filter(r => assignments.some(a => a.room === r)).length / rooms.length) * 100 || 0)}%`, icon: TrendingUp, color: "text-blue-400" },
                  { label: isRTL ? "مزامنة التكليفات" : "Assignment Sync", value: "Optimal", icon: CheckCircle2, color: "text-emerald-400" },
                  { label: isRTL ? "استقرار النظام" : "System Uptime", value: "99.9%", icon: ShieldCheck, color: "text-teal-400" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-5 bg-white/5 rounded-[1.5rem] border border-white/5 group hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={cn("p-2 rounded-xl bg-white/5", item.color)}>
                        <item.icon size={18} />
                      </div>
                      <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{item.label}</span>
                    </div>
                    <span className="text-xs font-black text-white">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="pt-6">
                <Button 
                  onClick={() => navigate("/reports")}
                  className="w-full h-16 bg-white text-emerald-950 hover:bg-emerald-50 rounded-2xl font-black text-sm shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <TrendingUp className="mr-2 h-5 w-5" /> {isRTL ? "عرض التحليلات الكاملة" : "Full Analytics"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;