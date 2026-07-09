"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClassReadiness {
  id: string;
  name: string;
  percentage: number;
  isComplete: boolean;
}

interface ReadinessBreakdownProps {
  data: ClassReadiness[];
  isRTL: boolean;
}

const ReadinessBreakdown = ({ data, isRTL }: ReadinessBreakdownProps) => {
  return (
    <Card className="border-none shadow-2xl shadow-emerald-900/5 rounded-[3rem] bg-white overflow-hidden">
      <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100">
        <CardTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
          <GraduationCap className="text-emerald-600" size={20} />
          {isRTL ? "جاهزية جداول الأفواج" : "Class Schedule Readiness"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {data.length > 0 ? data.map((cls) => (
            <div key={cls.id} className="space-y-2 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {cls.isComplete ? (
                    <CheckCircle2 size={14} className="text-emerald-500" />
                  ) : (
                    <Circle size={14} className="text-slate-200" />
                  )}
                  <span className="text-xs font-black text-slate-700 group-hover:text-emerald-700 transition-colors">
                    {cls.name}
                  </span>
                </div>
                <span className={cn(
                  "text-[10px] font-black px-2 py-0.5 rounded-full",
                  cls.isComplete ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                )}>
                  {cls.percentage}%
                </span>
              </div>
              <div className="relative">
                <Progress value={cls.percentage} className="h-1.5 bg-slate-100" />
                {cls.percentage === 100 && (
                  <div className="absolute inset-0 bg-emerald-400/20 blur-sm rounded-full animate-pulse"></div>
                )}
              </div>
            </div>
          )) : (
            <div className="py-20 text-center text-slate-300 font-bold text-sm italic">
              {isRTL ? "لا توجد أفواج مسجلة حالياً" : "No classes registered yet"}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReadinessBreakdown;