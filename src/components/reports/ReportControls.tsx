"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Layout as LayoutIcon, Clock, Building2, Copy } from "lucide-react";
import { PeriodPart, Department } from "@/types";

interface ReportControlsProps {
  t: any;
  isRTL: boolean;
  orientation: "portrait" | "landscape";
  onOrientationChange: (val: "portrait" | "landscape") => void;
  doubleMode: boolean;
  onDoubleModeChange: (val: boolean) => void;
  departments: Department[];
  selectedDepartment: string;
  onDepartmentChange: (dept: string) => void;
  selectedPeriods: PeriodPart[];
  onTogglePeriod: (period: PeriodPart) => void;
}

const ReportControls = ({ 
  t, 
  isRTL,
  orientation,
  onOrientationChange,
  doubleMode,
  onDoubleModeChange,
  departments,
  selectedDepartment,
  onDepartmentChange,
  selectedPeriods, 
  onTogglePeriod 
}: ReportControlsProps) => {
  // Fallback list of departments if empty
  const deptList = departments.length > 0 
    ? departments.map(d => d.name) 
    : [
        isRTL ? "مديرية الدراسات والتربصات" : "Studies Directorate",
        isRTL ? "مصلحة التكوين" : "Training Department",
        isRTL ? "مصلحة التمهين" : "Apprenticeship Department",
        isRTL ? "مصلحة المالية" : "Finance Department"
      ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-2 print:hidden">
      {/* Orientation */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <LayoutIcon size={12} />
          {t.orientation}
        </Label>
        <Select value={orientation} onValueChange={(v: any) => onOrientationChange(v)}>
          <SelectTrigger className="h-9 rounded-xl border-slate-100 bg-slate-50/50 font-bold text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="portrait">{t.portrait}</SelectItem>
            <SelectItem value="landscape">{t.landscape}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Double Mode */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <Copy size={12} />
          {isRTL ? "نسختان" : "Double"}
        </Label>
        <div
          className="flex items-center gap-2 h-9 px-3 rounded-xl border border-slate-100 bg-slate-50/50 cursor-pointer hover:bg-slate-100/50 transition-colors"
          onClick={() => onDoubleModeChange(!doubleMode)}
        >
          <Checkbox
            id="double-mode"
            checked={doubleMode}
            onCheckedChange={(v) => onDoubleModeChange(v === true)}
            className="h-4 w-4 rounded border-slate-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
          />
          <Label htmlFor="double-mode" className="text-[10px] font-black text-slate-700 cursor-pointer">
            {isRTL ? "2 في ورقة" : "2 per sheet"}
          </Label>
        </div>
      </div>

      {/* Department Selection */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm space-y-1.5 md:col-span-1">
        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <Building2 size={12} />
          {isRTL ? "المصلحة" : "Department"}
        </Label>
        <Select value={selectedDepartment} onValueChange={onDepartmentChange}>
          <SelectTrigger className="h-9 rounded-xl border-slate-100 bg-slate-50/50 font-bold text-xs">
            <SelectValue placeholder={isRTL ? "اختر المصلحة..." : "Select department..."} />
          </SelectTrigger>
          <SelectContent>
            {deptList.map((deptName, idx) => (
              <SelectItem key={idx} value={deptName}>
                {deptName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Periods */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm space-y-1.5 md:col-span-3">
        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <Clock size={12} />
          {t.applyToPeriods}
        </Label>
        <div className="flex flex-wrap gap-4 pt-0.5">
          {[
            { id: "Morning", label: t.morning, range: "1-4" },
            { id: "Afternoon", label: t.afternoon, range: "5-7" },
            { id: "Evening", label: t.evening, range: "8-10" }
          ].map(p => (
            <div key={p.id} className="flex items-center gap-2 cursor-pointer group" onClick={() => onTogglePeriod(p.id as PeriodPart)}>
              <Checkbox 
                id={`filter-${p.id}`} 
                checked={selectedPeriods.includes(p.id as PeriodPart)} 
                className="h-4 w-4 rounded border-slate-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
              />
              <div className="flex flex-col leading-none">
                <Label htmlFor={`filter-${p.id}`} className="text-xs font-black text-slate-700 cursor-pointer group-hover:text-emerald-600 transition-colors">
                  {p.label}
                </Label>
                <span className="text-[8px] font-bold text-slate-400">{p.range}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportControls;