import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Settings, 
  LogOut, 
  Languages,
  Menu,
  X
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, isRTL, user, logout, language, setLanguage } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  if (!user) return <>{children}</>;

  const navItems = [
    { path: "/", icon: LayoutDashboard, label: t.dashboard, roles: ["Admin", "Teacher", "Student"] },
    { path: "/timetable", icon: Calendar, label: t.timetable, roles: ["Admin", "Teacher", "Student"] },
    { path: "/employees", icon: Users, label: t.employees, roles: ["Admin"] },
    { path: "/settings", icon: Settings, label: t.settings, roles: ["Admin", "Teacher", "Student"] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-emerald-50/30 flex">
      {/* Sidebar */}
      <aside className={cn(
        "bg-white border-e border-emerald-100 transition-all duration-300 z-50",
        isSidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && <h1 className="text-xl font-bold text-emerald-800">{t.title}</h1>}
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>

        <nav className="mt-6 px-3 space-y-2">
          {filteredNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center p-3 rounded-xl transition-colors",
                location.pathname === item.path 
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" 
                  : "text-emerald-700 hover:bg-emerald-50"
              )}
            >
              <item.icon size={22} className={cn(isRTL ? "ml-3" : "mr-3")} />
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-6 w-full px-3 space-y-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-emerald-700 hover:bg-emerald-50"
            onClick={() => setLanguage(language === "en" ? "ar" : "en")}
          >
            <Languages size={22} className={cn(isRTL ? "ml-3" : "mr-3")} />
            {isSidebarOpen && <span>{language === "en" ? "العربية" : "English"}</span>}
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-600 hover:bg-red-50"
            onClick={() => { logout(); navigate("/login"); }}
          >
            <LogOut size={22} className={cn(isRTL ? "ml-3" : "mr-3")} />
            {isSidebarOpen && <span>{t.logout}</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-emerald-900">{t.welcome}, {user.username}</h2>
            <p className="text-emerald-600">{t[user.role.toLowerCase() as keyof typeof t]}</p>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
};

export default Layout;