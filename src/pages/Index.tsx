"use client";

import React from "react";
import { useApp } from "../context/AppContext";
import { 
  Users, 
  BookOpen, 
  Home, 
  Calendar, 
  MapPin,
  ListChecks,
  Clock,
  GraduationCap
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  const { employees, classes, subjects, assignments, rooms, isRTL, t, user } = useApp();

  const stats = [
    { label: t.stats.teachers, value: employees.length, icon: Users },
    { label: t.stats.classes, value: classes.length, icon: GraduationCap },
    { label: t.stats.subjects, value: subjects.length, icon: BookOpen },
    { label: t.stats.rooms, value: rooms.length, icon: Home },
    { label: t.stats.lessons, value: assignments.length, icon: ListChecks },
    { label: t.stats.periods, value: 10, icon: Clock },
  ];

  return (
    <div className="space-y-12">
      {/* Welcome Section */}
      <div className="text-right">
        <h2 className="text-5xl font-black text-gray-900 flex items-center justify-end gap-4">
          {user?.email || "atiabrahim@gmail.com"} ,{t.welcome}
        </h2>
        <p className="text-gray-500 text-xl font-bold mt-2">
          {t.role} {t.admin}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <Card key={idx} className="border border-gray-100 shadow-sm rounded-[2rem] overflow-hidden bg-white hover:shadow-md transition-shadow">
            <CardContent className="p-8 flex items-center justify-between">
              <div className="text-right">
                <p className="text-4xl font-black text-gray-900">{stat.value}</p>
                <p className="text-gray-500 font-bold text-sm mt-1">{stat.label}</p>
              </div>
              <div className="w-16 h-16 bg-[#f0fdf4] rounded-2xl flex items-center justify-center text-[#064e3b]">
                <stat.icon size={32} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Index;