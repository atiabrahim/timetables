"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Layout as LayoutIcon, Clock } from "lucide-react";
import { PeriodPart } from "@/types";

interface ReportControlsProps {
  t: any;
  orientation: "portrait" | "landscape";
  onOrientationChange: (val: "portrait" | "landscape") => void;
  selectedPeriods: PeriodPart[];
  onTogglePeriod: (period: PeriodPart) => void;
}

const ReportControls = ({ 
  t, 
  orientation, 
  onOrientationChange, 
  selectedPeriods, 
  onTogglePeriod 
}: ReportControlsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 print:hidden">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <LayoutIcon size={14} />
          {t.orientation}
        </Label>
        <Select value={orientation} onValueChange={(v: any) => onOrientationChange(v)}>
          <SelectTrigger className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="portrait">{t.portrait}</SelectItem>
            <SelectItem value="landscape">{t.landscape}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 md:col-span-3">
        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Clock size={14} />
          {t.applyToPeriods}
        </Label>
        <div className="flex flex-wrap gap-8 pt-2">
          {[
            { id: "Morning", label: t.morning, range: "1-4" },
            { id: "Afternoon", label: t.afternoon, range: "5-7" },
            { id: "Evening", label: t.evening, range: "8-10" }
          ].map(p => (
            <div key={p.id} className="flex items-center gap-3 cursor-pointer group" onClick={() => onTogglePeriod(p.id as PeriodPart)}>
              <Checkbox 
                id={`filter-${p.id}`} 
                checked={selectedPeriods.includes(p.id as PeriodPart)} 
                className="rounded-md border-slate-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
              />
              <div className="flex flex-col">
                <Label htmlFor={`filter-${p.id}`} className="text-sm font-black text-slate-700 cursor-pointer group-hover:text-emerald-600 transition-colors">
                  {p.label}
                </Label>
                <span className="text-[10px] font-bold text-slate-400">{p.range}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportControls;