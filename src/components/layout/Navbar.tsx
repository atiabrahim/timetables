"use client";

import React from "react";
import { Languages, LogOut, Palette, Check, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp, ThemeType } from "../../context/AppContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const { t, language, setLanguage, logout, user, theme, setTheme, isRTL, isSidebarCollapsed, setIsSidebarCollapsed } = useApp();

  const themesList: { id: ThemeType; nameAr: string; nameEn: string; colorClass: string }[] = [
    { id: "emerald", nameAr: "زمردي", nameEn: "Emerald", colorClass: "bg-emerald-600" },
    { id: "blue", nameAr: "أزرق", nameEn: "Blue", colorClass: "bg-blue-600" },
    { id: "purple", nameAr: "بنفسجي", nameEn: "Purple", colorClass: "bg-purple-600" },
    { id: "amber", nameAr: "عسلي", nameEn: "Amber", colorClass: "bg-amber-600" },
    { id: "rose", nameAr: "وردي", nameEn: "Rose", colorClass: "bg-rose-600" }
  ];

  return (
    <header className="h-20 border-b bg-white/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="text-slate-600 hover:bg-emerald-50 rounded-xl h-10 w-10"
        >
          <Menu size={20} />
        </Button>
        <div className="flex flex-col text-start">
          <h1 className="text-xl font-black text-emerald-900 leading-none">{t.appTitle}</h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">{t.appSubtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Switcher Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-slate-600 font-bold gap-2 hover:bg-emerald-50 rounded-xl h-10 px-3"
            >
              <Palette size={18} className="text-emerald-600" />
              <span className="hidden sm:inline">{isRTL ? "المظهر" : "Theme"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-2xl p-2 min-w-[150px] bg-white border border-slate-100 shadow-xl">
            {themesList.map((tItem) => {
              const isSelected = theme === tItem.id;
              return (
                <DropdownMenuItem
                  key={tItem.id}
                  onClick={() => setTheme(tItem.id)}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-xs font-bold transition-colors",
                    isSelected ? "bg-emerald-50 text-emerald-900" : "hover:bg-slate-50 text-slate-700"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={cn("w-4 h-4 rounded-full", tItem.colorClass)} />
                    <span>{isRTL ? tItem.nameAr : tItem.nameEn}</span>
                  </div>
                  {isSelected && <Check size={14} className="text-emerald-600" />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
          className="text-slate-600 font-bold gap-2 hover:bg-emerald-50 rounded-xl h-10 px-3"
        >
          <Languages size={18} className="text-emerald-600" />
          <span>{language === "ar" ? "EN" : "AR"}</span>
        </Button>

        <div className="h-8 w-px bg-slate-100 mx-1" />

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-black text-slate-900">{user?.fullName || user?.username}</span>
            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter bg-emerald-50 px-2 rounded-full">
              {user?.role}
            </span>
          </div>
          <Button 
            variant="outline" 
            size="icon"
            onClick={logout}
            className="rounded-xl border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-100"
          >
            <LogOut size={18} />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
</dyad-file>

<dyad-write path="src/components/layout/Sidebar.tsx" description="Make the sidebar collapsible with smooth transition animations">
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
    <aside className={cn(
      "bg-white hidden md:block shrink-0 transition-all duration-300 ease-in-out",
      isSidebarCollapsed ? "w-0 p-0 opacity-0 overflow-hidden border-none" : "w-72 p-6",
      isRTL ? "border-l" : "border-r"
    )}>
      <nav className="space-y-1.5">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                isActive 
                  ? "bg-emerald-950 text-white shadow-lg shadow-emerald-900/20" 
                  : "hover:bg-emerald-50 text-slate-600 hover:text-emerald-900"
              )}
            >
              <span className="font-bold text-sm z-10 whitespace-nowrap">{item.label}</span>
              <item.icon size={18} className={cn(
                "z-10 transition-transform duration-300 group-hover:scale-110",
                isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-emerald-600"
              )} />
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-900 to-emerald-950 opacity-100" />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;