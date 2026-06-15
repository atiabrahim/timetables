"use client";

import React from "react";
import { Sparkles, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface GenerationStatsCardProps {
  isRTL: boolean;
  stats: {
    successRate: number;
    total: number;
    placed: number;
  };
  onApply: () => void;
}

const GenerationStatsCard = ({
  isRTL,
  stats,
  onApply
}: GenerationStatsCardProps) => {
  return (
    <Card className="border-none shadow-xl shadow-emerald-100/20 rounded-3xl overflow-hidden bg-emerald-950 text-white">
      <CardHeader className="border-b border-white/5">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Sparkles size={20} className="text-emerald-400" />
          {isRTL ? "نتائج التوليد التلقائي" : "Generation Results"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="text-center space-y-2">
          <p className="text-5xl font-black tracking-tighter text-emerald-400">{stats.successRate}%</p>
          <p className="text-xs font-bold text-emerald-200/60 uppercase tracking-widest">
            {isRTL ? "نسبة نجاح الجدولة" : "Scheduling Success Rate"}
          </p>
        </div>

        <div className="space-y-3 border-t border-white/5 pt-4">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-white/60">{isRTL ? "إجمالي الحصص المطلوبة:" : "Total Lessons:"}</span>
            <span>{stats.total}</span>
          </div>
          <div className="flex justify-between text-xs font-bold">
            <span className="text-white/60">{isRTL ? "الحصص المجدولة بنجاح:" : "Placed Lessons:"}</span>
            <span className="text-emerald-400">{stats.placed}</span>
          </div>
          <div className="flex justify-between text-xs font-bold">
            <span className="text-white/60">{isRTL ? "الحصص المتعذرة:" : "Unplaced Lessons:"}</span>
            <span className={stats.total - stats.placed > 0 ? "text-red-400" : "text-white/40"}>
              {stats.total - stats.placed}
            </span>
          </div>
        </div>

        {stats.placed > 0 && (
          <Button 
            onClick={onApply}
            className="w-full h-12 bg-white text-emerald-950 hover:bg-emerald-50 rounded-xl font-black text-sm shadow-lg transition-all"
          >
            <Check className="mr-2 h-5 w-5" />
            {isRTL ? "تطبيق الجدول المولد على النظام" : "Apply Generated Schedule"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default GenerationStatsCard;