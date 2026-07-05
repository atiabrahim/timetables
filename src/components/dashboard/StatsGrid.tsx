"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatItem {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bg: string;
  path: string;
}

interface StatsGridProps {
  stats: StatItem[];
  onStatClick: (path: string) => void;
}

const StatsGrid = ({ stats, onStatClick }: StatsGridProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <Card 
          key={idx} 
          onClick={() => onStatClick(stat.path)} 
          className="group border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden hover:shadow-2xl transition-all cursor-pointer bg-white"
        >
          <CardContent className="p-8 flex flex-col items-center text-center">
            <div className={cn("w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-lg", stat.bg, stat.color)}>
              <stat.icon size={32} />
            </div>
            <p className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{stat.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsGrid;