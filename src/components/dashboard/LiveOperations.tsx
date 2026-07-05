"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCheck, Clock } from "lucide-react";

interface DutyItem {
  period: string;
  label: string;
  employees: any[];
  count: number;
}

interface LiveOperationsProps {
  todayFriendlyName: string;
  todayDuties: DutyItem[];
  isRTL: boolean;
  onAssignClick: () => void;
}

const LiveOperations = ({
  todayFriendlyName,
  todayDuties,
  isRTL,
  onAssignClick
}: LiveOperationsProps) => {
  return (
    <Card className="border-none shadow-2xl shadow-emerald-900/5 rounded-[3rem] bg-white overflow-hidden">
      <CardHeader className="bg-slate-50/50 p-10 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <UserCheck size={20} />
              </div>
              <CardTitle className="text-2xl font-black text-slate-900">
                {isRTL ? "عمليات اليوم الجارية" : "Live Operations"}
              </CardTitle>
            </div>
            <p className="text-sm font-bold text-slate-400 px-1">{todayFriendlyName}</p>
          </div>
          <Button onClick={onAssignClick} className="rounded-2xl h-12 px-8 bg-slate-900 hover:bg-black font-black text-xs text-white">
            {isRTL ? "تخصيص المهام" : "Assign Duties"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {todayDuties.map((duty, idx) => (
            <div key={idx} className="group relative">
              <div className="absolute -inset-2 bg-emerald-50 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-all"></div>
              <div className="relative space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-4 py-1.5 rounded-full uppercase tracking-widest">
                    {duty.label}
                  </span>
                  <span className="text-[10px] font-black text-slate-300">{duty.count} Active</span>
                </div>
                <div className="space-y-3">
                  {duty.employees.length > 0 ? duty.employees.map((emp: any) => (
                    <div key={emp.id} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center font-black text-emerald-700 text-xs">
                        {emp.lastName[0]}{emp.firstName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-slate-800 truncate">{emp.lastName} {emp.firstName}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{emp.category}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="py-12 flex flex-col items-center justify-center text-slate-300 gap-2 border-2 border-dashed border-slate-100 rounded-[3rem]">
                      <Clock size={24} className="opacity-20" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Idle State</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveOperations;