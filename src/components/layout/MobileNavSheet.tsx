"use client";

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Calendar, Home, BookOpen, 
  MapPin, BarChart3, FileText, Building2, Settings, UserCog,
  ClipboardList, ListChecks, UserCheck, LayoutGrid, Layers, Sparkles, UserX, CalendarX, ShieldAlert,
  Grid3X3,
  Briefcase,
  UserPlus,
  Printer,
  CalendarDays
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface MobileNavSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MobileNavSheet = ({ open, onOpenChange }: MobileNavSheetProps) => {
  const { t, isRTL, user } = useApp();
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
      title: isRTL ? "التخطيط والعمليات" : "Planning & Ops",
      items: [
        { icon: Calendar, label: t.schedule, path: "/schedule" },
        { icon: Sparkles, label: isRTL ? "المولد التلقائي الذكي" : "Smart Generator", path: "/auto-generator" },
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
        { icon: Printer, label: t.printingCenter, path: "/printing-center" },
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={isRTL ? "right" : "left"} className="w-80 p-0 overflow-y-auto bg-white border-slate-100">
        <SheetHeader className="p-6 border-b border-emerald-50 bg-emerald-50/40 text-start">
          <SheetTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <CalendarDays size={20} />
            </div>
            <div>
              <p className="text-lg font-black text-emerald-950 leading-tight">EduSchedule</p>
              <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">{t.appSubtitle}</p>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="p-4 space-y-6">
          {groups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-2">
              <div className="flex items-center gap-2 px-3">
                <div className="h-px flex-1 bg-emerald-100/60" />
                <span className="text-[9px] font-black text-emerald-900/40 uppercase tracking-[0.2em]">
                  {group.title}
                </span>
                <div className="h-px flex-1 bg-emerald-100/60" />
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => onOpenChange(false)}
                      className={cn(
                        "flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-bold transition-all",
                        isActive
                          ? "bg-emerald-950 text-white shadow-md"
                          : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-950"
                      )}
                    >
                      <span>{item.label}</span>
                      <item.icon size={16} className={isActive ? "text-emerald-400" : "text-slate-400"} />
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};