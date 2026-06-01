"use client";

import React from "react";
import { useApp } from "../context/AppContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings as SettingsIcon, 
  LogOut,
  Home,
  BookOpen,
  UserCog,
  MapPin,
  ListChecks,
  BarChart3,
  Languages,
  Building2,
  ClipboardList,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { t, isRTL, logout, user, language, setLanguage } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = user?.role === "Admin";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { icon: LayoutDashboard, label: t.dashboard, path: "/" },
    { icon: Calendar, label: t.schedule, path: "/schedule" },
    { icon: ClipboardList, label: t.weeklyWorkSchedule, path: "/work-schedule" },
    { icon: ListChecks, label: t.lessons, path: "/lessons" },
    { icon: Users, label: t.employees, path: "/employees" },
    { icon: Home, label: t.classes, path: "/classes" },
    { icon: BookOpen, label: t.subjects, path: "/subjects" },
    { icon: MapPin, label: t.rooms, path: "/rooms" },
    { icon: BarChart3, label: t.reports, path: "/reports" },
    { icon: FileText, label: "تقارير الحضور", path: "/reports-new" },
    { icon: Building2, label: t.institution, path: "/institution" },
    { icon: SettingsIcon, label: t.settings, path: "/settings" },
    ...(isAdmin ? [{ icon: UserCog, label: t.users, path: "/users" }] : []),
  ];

  return (
    <div className={cn("min-h-screen flex flex-col bg-[#FDFDFD]", isRTL ? "font-arabic" : "")}>
      {/* Header */}
      <header className="h-20 border-b bg-white flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="text-start order-first">
          <h1 className="text-2xl font-black text-[#064e3b]">{t.appTitle}</h1>
          <p className="text-gray-400 text-xs font-bold">{t.appSubtitle}</p>
        </div>

        <div className="flex items-center gap-6 order-last">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
            className="text-gray-600 font-bold gap-2"
          >
            <Languages size={18} />
            <span>{language === "ar" ? "EN" : "AR"}</span>
          </Button>

          <div className="flex items-center gap-3">
            <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold">
              {user?.role === "Admin" ? t.admin : user?.role}
            </div>
            <span className="text-gray-500 text-sm font-medium hidden sm:inline">{user?.email || user?.username}</span>
          </div>

          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="rounded-full border-gray-200 text-gray-700 hover:bg-gray-50 gap-2 px-4"
          >
            <LogOut size={18} />
            <span className="font-bold text-sm hidden sm:inline">{t.logout}</span>
          </Button>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className={cn(
          "w-72 bg-white p-6 hidden md:block",
          isRTL ? "border-l" : "border-r"
        )}>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
                    isActive 
                      ? "bg-[#064e3b] text-white shadow-lg" 
                      : "hover:bg-gray-50 text-gray-700"
                  )}
                >
                  <span className="font-bold text-sm">{item.label}</span>
                  <item.icon size={20} className={cn(isActive ? "text-white" : "text-gray-400 group-hover:text-[#064e3b]")} />
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-12 overflow-x-hidden">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;