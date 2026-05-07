import React from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Building2, TrendingUp } from "lucide-react";

const Dashboard = () => {
  const { t, employees, data } = useApp();

  const stats = [
    { title: t.stats.totalEmployees, value: employees.length, icon: Users, color: "bg-blue-500" },
    { title: t.stats.activeAssignments, value: "42", icon: Calendar, color: "bg-emerald-500" },
    { title: t.stats.departments, value: data?.departments?.length || 0, icon: Building2, color: "bg-amber-500" },
    { title: "Efficiency", value: "94%", icon: TrendingUp, color: "bg-purple-500" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6 flex items-center space-x-4 rtl:space-x-reverse">
              <div className={`${stat.color} p-4 rounded-2xl text-white`}>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-emerald-900">{t.employees}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {employees.slice(0, 5).map((emp) => (
                <div key={emp.id} className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-xl">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="w-10 h-10 bg-emerald-200 rounded-full flex items-center justify-center text-emerald-700 font-bold">
                      {emp.firstName[0]}
                    </div>
                    <div>
                      <p className="font-medium text-emerald-900">{emp.firstName} {emp.lastName}</p>
                      <p className="text-xs text-emerald-600">{emp.category}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                    {emp.observation}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-emerald-900">{t.timetable} Overview</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-64 text-emerald-400 italic">
            Weekly activity chart placeholder
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;