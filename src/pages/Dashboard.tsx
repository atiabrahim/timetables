import React from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Calendar, 
  Building2, 
  TrendingUp, 
  PieChart as PieIcon, 
  MapPin,
  Clock,
  ArrowRight
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const { t, employees, assignments, departments, rooms, isRTL, user } = useApp();

  const stats = [
    { title: t.stats.totalEmployees, value: employees.length, icon: Users, color: "bg-blue-500" },
    { title: t.stats.activeAssignments, value: assignments.length, icon: Calendar, color: "bg-emerald-500" },
    { title: t.stats.departments, value: departments.length, icon: Building2, color: "bg-amber-500" },
    { title: isRTL ? "القاعات" : "Rooms", value: rooms.length, icon: MapPin, color: "bg-purple-500" },
  ];

  const deptData = departments.map(dept => ({
    name: dept,
    count: assignments.filter(a => a.department === dept).length
  }));

  const roomData = rooms.map(room => ({
    name: room,
    value: assignments.filter(a => a.room === room).length
  })).filter(r => r.value > 0);

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];

  // تصفية التعيينات الخاصة بالأستاذ الحالي
  const teacherAssignments = assignments.filter(asgn => {
    const emp = employees.find(e => e.id === asgn.employeeId);
    return emp && emp.firstName.includes(user?.username || "");
  });

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-emerald-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl"
      >
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">{t.welcome}, {user?.username}!</h1>
          <p className="text-emerald-100 opacity-80">
            {user?.role === "Admin" 
              ? (isRTL ? "لديك نظرة كاملة على سير العمل اليوم." : "You have a full overview of today's operations.")
              : (isRTL ? `لديك ${teacherAssignments.length} تعيينات مجدولة.` : `You have ${teacherAssignments.length} scheduled assignments.`)}
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800 rounded-full -mr-20 -mt-20 opacity-50 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-700 rounded-full -ml-10 -mb-10 opacity-30 blur-2xl" />
      </motion.div>

      {/* Stats Grid - Only for Admin */}
      {user?.role === "Admin" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-none shadow-md hover:shadow-xl transition-all hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 flex items-center space-x-4 rtl:space-x-reverse">
                  <div className={`${stat.color} p-4 rounded-2xl text-white shadow-lg`}>
                    <stat.icon size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">{stat.title}</p>
                    <h3 className="text-3xl font-black text-emerald-900">{stat.value}</h3>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Teacher Specific View */}
      {user?.role === "Teacher" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-none shadow-xl glass-card rounded-3xl overflow-hidden">
            <CardHeader className="bg-emerald-600 text-white p-6">
              <CardTitle className="flex items-center gap-2">
                <Clock size={20} />
                {isRTL ? "جدولك الشخصي" : "Your Personal Schedule"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {teacherAssignments.length > 0 ? (
                  teacherAssignments.map((asgn, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                          <Calendar size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-emerald-900">{asgn.subject}</p>
                          <p className="text-xs text-emerald-500">{asgn.department} • {asgn.room}</p>
                        </div>
                      </div>
                      <div className="text-end">
                        <p className="text-sm font-bold text-emerald-700">{t.days[asgn.day]}</p>
                        <p className="text-[10px] text-emerald-400 uppercase tracking-widest">{t[asgn.period.toLowerCase() as keyof typeof t]}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-emerald-400">{isRTL ? "لا توجد تعيينات مجدولة لك حالياً." : "No assignments scheduled for you yet."}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl glass-card rounded-3xl overflow-hidden flex flex-col justify-center items-center p-8 text-center bg-gradient-to-br from-emerald-50 to-white">
            <div className="bg-emerald-100 p-6 rounded-full mb-6">
              <TrendingUp size={48} className="text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-emerald-900 mb-2">
              {isRTL ? "أداء متميز!" : "Great Performance!"}
            </h3>
            <p className="text-emerald-600 mb-6">
              {isRTL ? "أنت تساهم في نجاح المؤسسة من خلال التزامك بالجدول الزمني." : "You are contributing to the institution's success through your commitment."}
            </p>
            <button className="flex items-center gap-2 text-emerald-700 font-bold hover:gap-4 transition-all">
              {isRTL ? "عرض الجدول الكامل" : "View Full Timetable"}
              <ArrowRight size={18} className={isRTL ? "rotate-180" : ""} />
            </button>
          </Card>
        </div>
      )}

      {/* Admin Charts */}
      {user?.role === "Admin" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-none shadow-lg glass-card overflow-hidden">
            <CardHeader className="bg-emerald-50/50 border-b border-emerald-100">
              <CardTitle className="text-emerald-900 flex items-center gap-2">
                <TrendingUp size={20} className="text-emerald-600" />
                {isRTL ? "توزيع التعيينات حسب المصلحة" : "Assignments by Department"}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80 pt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#065f46', fontSize: 12, fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#065f46' }} />
                  <Tooltip cursor={{ fill: '#f0fdf4' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="count" radius={[10, 10, 0, 0]} barSize={40}>
                    {deptData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg glass-card overflow-hidden">
            <CardHeader className="bg-emerald-50/50 border-b border-emerald-100">
              <CardTitle className="text-emerald-900 flex items-center gap-2">
                <PieIcon size={20} className="text-emerald-600" />
                {isRTL ? "إشغال القاعات" : "Room Occupancy"}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80 flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={roomData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {roomData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 w-full mt-4">
                {roomData.slice(0, 4).map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-[10px] font-medium text-emerald-800 truncate">{entry.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;