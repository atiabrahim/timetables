"use client";

import React from "react";
import { useApp } from "../context/AppContext";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings as SettingsIcon, 
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { t, isRTL, logout, user } = useApp();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: isRTL ? "لوحة التحكم" : "Dashboard", path: "/" },
    { icon: Users, label: isRTL ? "الموظفون" : "Employees", path: "/employees" },
    { icon: Calendar, label: isRTL ? "الجدول الزمني" : "Schedule", path: "/schedule" },
    { icon: SettingsIcon, label: t.settings, path: "/settings" },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-emerald-950 text-white p-4">
      <div className="flex items-center gap-3 px-2 py-6 mb-6">
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Calendar className="text-white" size={24} />
        </div>
        {!isCollapsed && (
          <span className="font-bold text-xl tracking-tight">EduSchedule</span>
        )}
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                  : "hover:bg-emerald-900/50 text-emerald-100/70 hover:text-white"
              )}
            >
              <item.icon size={22} className={cn(isActive ? "text-white" : "group-hover:text-emerald-400")} />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-emerald-900/50">
        <div className={cn("flex items-center gap-3 px-3 py-4 mb-4", isCollapsed && "justify-center")}>
          <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center text-xs font-bold">
            {user?.username?.[0]?.toUpperCase() || "U"}
          </div>
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.username || "Admin"}</p>
              <p className="text-[10px] text-emerald-400/70 truncate">{user?.role || "Manager"}</p>
            </div>
          )}
        </div>
        <Button 
          variant="ghost" 
          onClick={logout}
          className={cn(
            "w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-xl",
            isCollapsed && "justify-center px-0"
          )}
        >
          <LogOut size={20} />
          {!isCollapsed && <span>{isRTL ? "تسجيل الخروج" : "Logout"}</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <div className={cn("min-h-screen flex bg-[#F8FAFC]", isRTL ? "font-arabic" : "")}>
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "hidden md:flex flex-col sticky top-0 h-screen transition-all duration-300 z-50",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <SidebarContent />
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "absolute -left-3 top-10 w-6 h-6 bg-white border border-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-sm hover:bg-emerald-50 transition-all",
            isRTL ? "-right-3 left-auto" : "-left-3"
          )}
        >
          {isCollapsed ? (isRTL ? <ChevronLeft size={14} /> : <ChevronRight size={14} />) : (isRTL ? <ChevronRight size={14} /> : <ChevronLeft size={14} />)}
        </button>
      </aside>

      {/* Mobile Sidebar */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-white/80 backdrop-blur-sm border-emerald-100 text-emerald-700 rounded-xl shadow-sm">
              <Menu size={24} />
            </Button>
          </SheetTrigger>
          <SheetContent side={isRTL ? "right" : "left"} className="p-0 border-none w-72">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;