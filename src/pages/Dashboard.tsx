import React from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Building2, TrendingUp, PieChart as PieIcon } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";

const Dashboard = () => {
  const { t, employees, assignments, departments, isRTL } = useApp();

  const stats = [
    { title: t.stats.totalEmployees, value: employees.length, icon: Users, color: "bg-blue-500" },
    { title: t.stats.activeAssignments, value: assignments.length, icon: Calendar, color: "bg-emerald-500" },
    { title: t.stats.departments, value: departments.length, icon: Building2, color: "bg-amber-500" },
    { title: "Utilization", value: `${Math.round((assignments.length / 14) * 100)}%`, icon: TrendingUp, color: "bg-purple-500" },
  ];

  const chartData = departments.map(dept => ({
    name: dept,
    count: assignments.filter(a => a.department === dept).length
  }));

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444"];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
            <CardContent className="p-6 flex items-center space-x-4 rtl:space-x-reverse">
              <div className={`${stat.color} p-4 rounded-2xl text-white shadow-lg`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm text-emerald-600 font-medium">{stat.title}</p>
                <h3 className="text-2xl font-bold text-emerald-900">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-md glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-emerald-900">Assignments by Department</CardTitle>
            <PieIcon className="text-emerald-400" size={20} />
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout={isRTL ? "vertical" : "horizontal"}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
                <XAxis dataKey="name" hide={isRTL} />
                <YAxis hide={!isRTL} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md glass-card">
          <CardHeader>
            <CardTitle className="text-emerald-900">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assignments.slice(-4).reverse().map((asgn) => {
                const emp = employees.find(e => e.id === asgn.employeeId);
                return (
                  <div key={asgn.id} className="flex items-start space-x-3 rtl:space-x-reverse p-3 bg-white/50 rounded-xl border border-emerald-50">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-xs font-bold">
                      {emp?.firstName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-emerald-900">
                        {emp?.firstName} assigned to {asgn.subject}
                      </p>
                      <p className="text-[10px] text-emerald-500">{t.days[asgn.day]} - {t[asgn.period.toLowerCase() as keyof typeof t]}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;