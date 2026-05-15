"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users } from "lucide-react";

interface TeacherLoadChartProps {
  data: any[];
  isRTL: boolean;
  title: string;
}

const TeacherLoadChart = ({ data, isRTL, title }: TeacherLoadChartProps) => (
  <Card className="border-none shadow-xl shadow-emerald-100/20 rounded-3xl overflow-hidden bg-white">
    <CardHeader className="border-b border-emerald-50 bg-emerald-50/30">
      <CardTitle className="text-lg font-bold flex items-center gap-2 text-emerald-900">
        <Users size={20} className="text-emerald-500" />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="p-6">
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: isRTL ? 30 : 20, left: isRTL ? 20 : 30, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0fdf4" />
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#064e3b', fontSize: 11, fontWeight: 600, textAnchor: isRTL ? 'start' : 'end' }}
              width={120}
              orientation={isRTL ? "right" : "left"}
            />
            <Tooltip 
              cursor={{ fill: '#f0fdf4' }}
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', textAlign: isRTL ? 'right' : 'left' }}
            />
            <Bar dataKey="lessons" fill="#10b981" radius={isRTL ? [10, 0, 0, 10] : [0, 10, 10, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
);

export default TeacherLoadChart;