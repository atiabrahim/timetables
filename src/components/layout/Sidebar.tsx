"use client";

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Calendar, Users, Home, BookOpen, 
  MapPin, BarChart3, FileText, Building2, Settings, UserCog,
  ClipboardList, ListChecks, UserCheck, LayoutGrid, Layers
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

  const menuItems = [
    { icon: LayoutDashboard, label: t.dashboard, path: "/" },
    { icon: LayoutGrid, label: isRTL ? "الجدول العام" : "Master Schedule", path: "/master-schedule" },
    { icon: Calendar, label: t.schedule, path: "/schedule" },
    { icon: ClipboardList, label: t.weeklyWorkSchedule, path: "/work-schedule" },
    { icon: Layers, label: t.masterClassesSchedule, path: "/master-classes-schedule" },
    { icon: UserCheck, label: t.assignments, path: "/assignments" },
    { icon: ListChecks, label: t.lessons, path: "/lessons" },
    { icon: Users, label: t.employees, path: "/employees" },
    { icon: Home, label: t.classes, path: "/classes" },
    { icon: BookOpen, label: t.subjects, path: "/subjects" },
    { icon: MapPin, label: t.rooms, path: "/rooms" },
    { icon: BarChart3, label: t.reports, path: "/reports" },
    { icon: FileText, label: "تقارير الحضور", path: "/reports-new" },
    { icon: Building2, label: t.institution, path: "/institution" },
    { icon: Settings, label: t.settings, path: "/settings" },
    ...(isAdmin ? [{ icon: UserCog, label: t.users, path: "/users" }] : []),
  ];

  return (
    <TooltipProvider>
      <aside className={cn(
        "bg-white p-4 hidden md:block shrink-0 transition-all duration-300",
        isSidebarCollapsed ? "w-20" : "w-72",
        isRTL ? "border-l" : "border-r"
      )}>
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            const linkContent = (
              <Link
                to={item.path}
                className={cn(
                  "flex items-center rounded-2xl transition-all duration-300 group relative overflow-hidden",
                  isSidebarCollapsed ? "justify-center h-12 w-12 mx-auto" : "justify-between px-4 py-3",
                  isActive 
                    ? "bg-emerald-950 text-white shadow-lg shadow-emerald-900/20" 
                    : "hover:bg-emerald-50 text-slate-600 hover:text-emerald-900"
                )}
              >
                {!isSidebarCollapsed && (
                  <span className="font-bold text-sm z-10 truncate">{item.label}</span>
                )}
                <item.icon size={18} className={cn(
                  "z-10 transition-transform duration-300 group-hover:scale-110 shrink-0",
                  isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-emerald-600"
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
                  <TooltipContent side={isRTL ? "left" : "right"} className="bg-emerald-950 text-white font-bold text-xs rounded-lg border-none shadow-md">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <React.Fragment key={item.path}>{linkContent}</React.Fragment>;
          })}
        </nav>
      </aside>
    </TooltipProvider>
  );
};

export default Sidebar;