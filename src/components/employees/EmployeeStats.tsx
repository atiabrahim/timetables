"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, Award, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmployeeStatsProps {
  isRTL: boolean;
  stats: {
    total: number;
    active: number;
    fullTime: number;
    partTime: number;
  };
}

const EmployeeStats = ({ isRTL, stats }: EmployeeStatsProps) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
      <Card className="border-none shadow-sm rounded-2xl bg-white">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900">{stats.total}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {isRTL ? "إجمالي الأساتذة" : "Total Teachers"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm rounded-2xl bg-white">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <UserCheck size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900">{stats.active}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {isRTL ? "الأساتذة النشطون" : "Active Teachers"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm rounded-2xl bg-white">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Award size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900">{stats.fullTime}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {isRTL ? "دوام كامل" : "Full-time"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm rounded-2xl bg-white">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900">{stats.partTime}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {isRTL ? "دوام جزئي" : "Part-time"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeStats;