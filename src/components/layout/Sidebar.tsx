"use client";

import React from "react";
import { useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Calendar, Users, Home, BookOpen, 
  MapPin, BarChart3, FileText, Building2, Settings, UserCog,
  ClipboardList, ListChecks, UserCheck, LayoutGrid, Layers, Sparkles, UserX, CalendarX, ShieldAlert,
  Grid3X3,
  Briefcase,
  UserPlus
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import SidebarGroup from "./SidebarGroup";

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
        { icon: UserPlus, label: t.substitutions, path: "/substitutions" },
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
            <SidebarGroup
              key={gIdx}
              group={group}
              isSidebarCollapsed={isSidebarCollapsed}
              isRTL={isRTL}
              locationPathname={location.pathname}
            />
          ))}
        </div>
      </aside>
    </TooltipProvider>
  );
};

export default Sidebar;