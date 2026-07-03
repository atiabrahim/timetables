"use client";

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Calendar, Users, Home, BookOpen, 
  MapPin, BarChart3, FileText, Building2, Settings, UserCog,
  ClipboardList, ListChecks, UserCheck, LayoutGrid, Layers, Sparkles, UserX, CalendarX, ShieldAlert,
  Grid3X3,
  Briefcase
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Sidebar = () => {
  const { t, isRTL, user, isSidebarCollapsed } = useApp();
  const location = useLocation();
  const isAdmin = user?.role === "Admin";

  const groups = [
    {
      title: isRTL ? "الرئيسية" : "Main",
      items: [
        { icon: LayoutDashboard, label: t.dashboard, path: "/" },
      ]
    },
    {
      title: isRTL ? "خرائط الجدولة الكلية" : "Master Views",
      items: [
        { icon: LayoutGrid, label: isRTL ? "الجدول العام (يومي)" : "Daily Master", path: "/master-schedule" },
        { icon: Layers, label: t.masterClassesSchedule, path: "/master-classes-schedule" },
        { icon: ClipboardList, label: t.weeklyWorkSchedule, path: "/work-schedule" },
        { icon: Grid3X3, label: isRTL ? "جدول القاعات الكلي" : "Master Rooms", path: "/master-rooms-schedule" },
      ]
    },
    {
      title: isRTL ? "التخطيط الفردي" : "Planning",
      items: [
        { icon: Calendar, label: t.schedule, path: "/schedule" },
        { icon: Sparkles, label: isRTL ? "المولد التلقائي الذكي" : "Smart Generator", path: "/auto-generator" },
      ]
    },
    {
      title: isRTL ? "العمليات اليومية" : "Operations",
      items: [
        { icon: UserCheck, label: t.assignments, path: "/assignments" },
        { icon: FileText, label: t.attendanceReports, path: "/reports-new" },
        { icon: ListChecks, label: t.lessons, path: "/lessons" },
      ]
    },
    {
      title: isRTL ? "قاعدة البيانات" : "Database",
      items: [
        { icon: Briefcase, label: t.employees, path: "/employees" },
        { icon: Home, label: t.classes, path: "/classes" },
        { icon: BookOpen, label: t.subjects, path: "/subjects" },
        { icon: MapPin, label: t.rooms, path: "/rooms" },
      ]
    },
    {
      title: isRTL ? "القيود والضبط" : "System Control",
      items: [
        { icon: UserX, label: isRTL ? "توافر الأساتذة" : "Teacher Constraints", path: "/constraints" },
        { icon: CalendarX, label: isRTL ? "قيود الأفواج" : "Class Constraints", path: "/class-constraints" },
        { icon: ShieldAlert, label: isRTL ? "قيود القاعات" : "Room Constraints", path: "/room-constraints" },
        { icon: BarChart3, label: isRTL ? "التقارير الإحصائية" : "Statistics", path: "/reports" },
        { icon: Building2, label: t.institution, path: "/institution" },
        { icon: Settings, label: t.settings, path: "/settings" },
        ...(isAdmin ? [{ icon: UserCog, label: t.users, path: "/users" }] : []),
      ]
    }
  ];

  return (
    <TooltipProvider>
      <aside className={cn(
        "bg-white hidden md:block shrink-0 transition-all duration-500 ease-in-out overflow-y-auto border-emerald-50",
        isSidebarCollapsed ? "w-20" : "w-72",
        isRTL ? "border-l" : "border-r"
      )}>
        <div className="p-4 space-y-6">
          {groups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-2">
              {!isSidebarCollapsed && (
                <div className="flex items-center gap-2 px-4 mb-2">
                  <div className="h-px flex-1 bg-emerald-50/50" />
                  <h4 className="text-[9px] font-black text-emerald-900/30 uppercase tracking-[0.2em] whitespace-nowrap">
                    {group.title}
                  </h4>
                  <div className="h-px flex-1 bg-emerald-50/50" />
                </div>
              )}
              
              <nav className="space-y-1">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  
                  const linkContent = (
                    <Link
                      to={item.path}
                      className={cn(
                        "flex items-center rounded-2xl transition-all duration-300 group relative overflow-hidden",
                        isSidebarCollapsed ? "justify-center h-12 w-12 mx-auto" : "justify-between px-4 py-2.5",
                        isActive 
                          ? "bg-emerald-950 text-white shadow-lg shadow-emerald-900/20" 
                          : "hover:bg-emerald-50 text-slate-500 hover:text-emerald-900"
                      )}
                    >
                      {!isSidebarCollapsed && (
                        <span className={cn(
                          "font-bold text-[11px] z-10 truncate transition-colors duration-300",
                          isActive ? "text-white" : "text-slate-600 group-hover:text-emerald-950"
                        )}>{item.label}</span>
                      )}
                      
                      <item.icon size={16} className={cn(
                        "z-10 transition-all duration-300 shrink-0",
                        isActive ? "text-emerald-400 scale-110" : "text-slate-400 group-hover:text-emerald-600"
                      )} />

                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900 to-emerald-950 opacity-100" />
                      )}
                    </Link>
                  );

                  if (isSidebarCollapsed) {
                    return (
                      <Tooltip key={item.path} delayDuration={100}>
                        <TooltipTrigger asChild>
                          {linkContent}
                        </TooltipTrigger>
                        <TooltipContent side={isRTL ? "left" : "right"} className="bg-emerald-950 text-white font-bold text-[10px] rounded-lg border-none shadow-md">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return <React.Fragment key={item.path}>{linkContent}</React.Fragment>;
                })}
              </nav>
            </div>
          ))}
        </div>
      </aside>
    </TooltipProvider>
  );
};

export default Sidebar;