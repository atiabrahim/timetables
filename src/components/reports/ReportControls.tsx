"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { 
  Layout as LayoutIcon, 
  Clock, 
  Building2, 
  Copy, 
  Type, 
  Rows, 
  Settings2,
  CalendarX,
  TextQuote
} from "lucide-react";
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
  reportStyles: any;
  setReportStyles: (styles: any) => void;
  isOutOfSchedule: boolean;
  onOutOfScheduleChange: (val: boolean) => void;
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
  onTogglePeriod,
  reportStyles,
  setReportStyles,
  isOutOfSchedule,
  onOutOfScheduleChange
}: ReportControlsProps) => {
  return (
    <div className="space-y-4 print:hidden">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
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
              className="h-4 w-4 rounded border-slate-300"
            />
            <Label htmlFor="double-mode" className="text-[10px] font-black text-slate-700 cursor-pointer">
              {isRTL ? "2 في ورقة" : "2 per sheet"}
            </Label>
          </div>
        </div>

        {/* Department Selection */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Building2 size={12} />
            {isRTL ? "المصلحة" : "Department"}
          </Label>
          <Select value={selectedDepartment} onValueChange={onDepartmentChange}>
            <SelectTrigger className="h-9 rounded-xl border-slate-100 bg-slate-50/50 font-bold text-xs">
              <SelectValue placeholder={isRTL ? "اختر المصلحة..." : "Select department..."} />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.name}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Out of Schedule Toggle */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <CalendarX size={12} />
            {isRTL ? "خارج الجدول" : "Out of Schedule"}
          </Label>
          <div
            className="flex items-center gap-2 h-9 px-3 rounded-xl border border-slate-100 bg-slate-50/50 cursor-pointer hover:bg-slate-100/50 transition-colors"
            onClick={() => onOutOfScheduleChange(!isOutOfSchedule)}
          >
            <Checkbox
              id="out-of-schedule"
              checked={isOutOfSchedule}
              onCheckedChange={(v) => onOutOfScheduleChange(v === true)}
              className="h-4 w-4 rounded border-slate-300"
            />
            <Label htmlFor="out-of-schedule" className="text-[10px] font-black text-slate-700 cursor-pointer">
              {isRTL ? "إدراج الجميع" : "Include All"}
            </Label>
          </div>
        </div>
        
        {/* Periods */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm space-y-1.5 md:col-span-2">
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
                  className="h-4 w-4 rounded border-slate-300"
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

      {/* Advanced Style Controls */}
      <div className="bg-emerald-50/30 p-4 rounded-2xl border border-emerald-100/50 space-y-4">
        <div className="flex items-center gap-2 border-b border-emerald-100 pb-2 mb-2">
          <Settings2 size={16} className="text-emerald-600" />
          <span className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">{isRTL ? "تنسيق متقدم للطباعة" : "Advanced Print Styling"}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Font Family Selector */}
          <div className="space-y-2">
            <Label className="text-[9px] font-bold text-slate-500 flex items-center gap-1">
              <TextQuote size={12} /> {isRTL ? "نوع الخط" : "Font Family"}
            </Label>
            <Select value={reportStyles.fontFamily} onValueChange={(v) => setReportStyles({...reportStyles, fontFamily: v})}>
              <SelectTrigger className="h-8 rounded-lg bg-white border-emerald-100 text-[10px] font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="'Cairo', sans-serif">Cairo (رسمي)</SelectItem>
                <SelectItem value="'Arial', sans-serif">Arial (كلاسيكي)</SelectItem>
                <SelectItem value="'Times New Roman', serif">Times (سيريف)</SelectItem>
                <SelectItem value="system-ui">System Default</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table Font Size */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-[9px] font-bold text-slate-500">{isRTL ? "خط الجدول" : "Table Font"}</Label>
              <span className="text-[9px] font-black text-emerald-700">{reportStyles.tableSize}px</span>
            </div>
            <Slider 
              value={[reportStyles.tableSize]} 
              onValueChange={(v) => setReportStyles({...reportStyles, tableSize: v[0]})} 
              min={6} max={18} step={0.5}
            />
          </div>

          {/* Header Font Size */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-[9px] font-bold text-slate-500">{isRTL ? "خط الترويسة" : "Header Font"}</Label>
              <span className="text-[9px] font-black text-emerald-700">{reportStyles.headerSize}px</span>
            </div>
            <Slider 
              value={[reportStyles.headerSize]} 
              onValueChange={(v) => setReportStyles({...reportStyles, headerSize: v[0]})} 
              min={8} max={20} step={1}
            />
          </div>

          {/* Title Font Size */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-[9px] font-bold text-slate-500">{isRTL ? "خط العنوان" : "Title Font"}</Label>
              <span className="text-[9px] font-black text-emerald-700">{reportStyles.titleSize}px</span>
            </div>
            <Slider 
              value={[reportStyles.titleSize]} 
              onValueChange={(v) => setReportStyles({...reportStyles, titleSize: v[0]})} 
              min={12} max={32} step={1}
            />
          </div>

          {/* Footer/Signature Font Size */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-[9px] font-bold text-slate-500">{isRTL ? "خط التوقيعات" : "Footer Font"}</Label>
              <span className="text-[9px] font-black text-emerald-700">{reportStyles.footerSize}px</span>
            </div>
            <Slider 
              value={[reportStyles.footerSize]} 
              onValueChange={(v) => setReportStyles({...reportStyles, footerSize: v[0]})} 
              min={6} max={16} step={1}
            />
          </div>
        </div>

        {/* Row Padding (Legacy but kept) */}
        <div className="pt-2 border-t border-emerald-100/50">
          <div className="flex items-center gap-4 max-w-xs">
            <Label className="text-[9px] font-bold text-slate-500 shrink-0">{isRTL ? "كثافة الأسطر" : "Row Density"}</Label>
            <Slider 
              value={[reportStyles.rowPadding]} 
              onValueChange={(v) => setReportStyles({...reportStyles, rowPadding: v[0]})} 
              min={0} max={12} step={1}
              className="flex-1"
            />
            <span className="text-[9px] font-black text-emerald-700 w-8 text-center">{reportStyles.rowPadding}px</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportControls;