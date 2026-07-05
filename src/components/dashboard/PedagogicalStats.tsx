"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, TrendingUp, AlertTriangle, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface PedagogicalStatsProps {
  completionPercentage: number;
  roomsCount: number;
  occupiedRoomsCount: number;
  conflictsCount: number;
  isRTL: boolean;
  onAnalyticsClick: () => void;
}

const PedagogicalStats = ({
  completionPercentage,
  roomsCount,
  occupiedRoomsCount,
  conflictsCount,
  isRTL,
  onAnalyticsClick
}: PedagogicalStatsProps) => {
  const occupancyRate = Math.round((occupiedRoomsCount / (roomsCount || 1)) * 100);

  const indicators = [
    { 
      label: isRTL ? "نسبة إشغال القاعات" : "Room Occupancy", 
      value: `${occupancyRate}%`, 
      icon: TrendingUp, 
      color: "text-blue-400" 
    },
    { 
      label: isRTL ? "حالة التعارضات" : "Conflicts", 
      value: conflictsCount === 0 ? "Perfect" : `${conflictsCount}`, 
      icon: AlertTriangle, 
      color: conflictsCount === 0 ? "text-emerald-400" : "text-amber-400" 
    },
    { 
      label: isRTL ? "استقرار النظام" : "Stability", 
      value: "99.9%", 
      icon: ShieldCheck, 
      color: "text-teal-400" 
    }
  ];

  return (
    <Card className="border-none shadow-2xl shadow-emerald-900/5 rounded-[3rem] bg-emerald-950 text-white h-full overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"></div>
      <CardHeader className="p-10 border-b border-white/5">
        <CardTitle className="text-xl font-black flex items-center gap-3">
          <Activity size={22} className="text-emerald-400" />
          {isRTL ? "مؤشرات بيداغوجية" : "Pedagogical Stats"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-10 space-y-10">
        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.2em]">
              {isRTL ? "جاهزية الجداول" : "Readiness"}
            </span>
            <span className="text-2xl font-black">{completionPercentage}%</span>
          </div>
          <div className="h-4 bg-white/5 rounded-full overflow-hidden p-1 border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full shadow-[0_0_20px_rgba(52,211,153,0.4)] transition-all duration-1000" 
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="space-y-4">
          {indicators.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-5 bg-white/5 rounded-[1.5rem] border border-white/5 group hover:bg-white/10 transition-all">
              <div className="flex items-center gap-4">
                <div className={cn("p-2 rounded-xl bg-white/5", item.color)}>
                  <item.icon size={18} />
                </div>
                <span className="text-[10px] font-black text-white/60 uppercase">{item.label}</span>
              </div>
              <span className="text-xs font-black text-white">{item.value}</span>
            </div>
          ))}
        </div>

        <div className="pt-6">
          <Button onClick={onAnalyticsClick} className="w-full h-16 bg-white text-emerald-950 hover:bg-emerald-50 rounded-2xl font-black text-sm shadow-xl transition-all">
            <TrendingUp className="mr-2 h-5 w-5" />
            {isRTL ? "عرض التحليلات الكاملة" : "Full Analytics"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PedagogicalStats;