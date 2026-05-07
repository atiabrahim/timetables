import React from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Building2, TrendingUp, PieChart as PieIcon, MapPin } from "lucide-react";
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

const Dashboard = () => {
  const { t, employees, assignments, departments, rooms, isRTL } = useApp();

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

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-md hover:shadow-xl transition-all hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
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
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bar Chart - Assignments by Dept */}
        <Card className="lg:col-span-2 border-none shadow-lg glass-card overflow-hidden">
          <CardHeader className="bg-emerald-50/50 border-b border-emerald-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-emerald-900 flex items-center gap-2">
                <TrendingUp size={20} className="text-emerald-600" />
                {isRTL ? "توزيع التعيينات حسب المصلحة" : "Assignments by Department"}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="h-80 pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#065f46', fontSize: 12, fontWeight: 600 }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#065f46' }} />
                <Tooltip 
                  cursor={{ fill: '#f0fdf4' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" radius={[10, 10, 0, 0]} barSize={40}>
                  {deptData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart - Room Utilization */}
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
                <Pie
                  data={roomData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
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

      {/* Recent Activity Table */}
      <Card className="border-none shadow-lg glass-card">
        <CardHeader>
          <CardTitle className="text-emerald-900">{isRTL ? "آخر التعيينات المضافة" : "Recently Added Assignments"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {assignments.slice(-5).reverse().map((asgn) => {
              const emp = employees.find(e => e.id === asgn.employeeId);
              return (
                <div key={asgn.id} className="flex items-center justify-between p-4 bg-white/40 rounded-2xl border border-emerald-50 hover:bg-white/60 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                      {emp?.firstName[0]}
                    </div>
                    <div>
                      <p className="font-bold text-emerald-900">{emp?.firstName} {emp?.lastName}</p>
                      <p className="text-xs text-emerald-500">{asgn.subject} • {asgn.department}</p>
                    </div>
                  </div>
                  <div className="text-end">
                    <p className="text-sm font-bold text-emerald-700">{t.days[asgn.day]}</p>
                    <p className="text-[10px] text-emerald-400 uppercase tracking-widest">{t[asgn.period.toLowerCase() as keyof typeof t]}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;