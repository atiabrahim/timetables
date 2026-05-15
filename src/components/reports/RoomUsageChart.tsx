"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { MapPin } from "lucide-react";

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899'];

interface RoomUsageChartProps {
  data: any[];
  isRTL: boolean;
  title: string;
}

const RoomUsageChart = ({ data, isRTL, title }: RoomUsageChartProps) => (
  <Card className="border-none shadow-xl shadow-emerald-100/20 rounded-3xl overflow-hidden bg-white">
    <CardHeader className="border-b border-emerald-50 bg-emerald-50/30">
      <CardTitle className="text-lg font-bold flex items-center gap-2 text-emerald-900">
        <MapPin size={20} className="text-emerald-500" />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="p-6 flex flex-col items-center">
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
              {data.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-4 w-full mt-4">
        {data.map((room, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
            <span className="font-medium text-emerald-900">{room.name}:</span>
            <span className="text-emerald-600 font-bold">{room.value} {isRTL ? "حصة" : "Lessons"}</span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default RoomUsageChart;