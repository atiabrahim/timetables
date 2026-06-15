"use client";

import React from "react";
import { Settings2, Calendar, Clock, User, GraduationCap, SlidersHorizontal, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DAYS, PERIODS } from "../../constants/schedule";
import { cn } from "@/lib/utils";

interface GeneratorRulesCardProps {
  isRTL: boolean;
  classes: any[];
  rules: {
    allowedDays: number[];
    allowedPeriods: string[];
    maxTeacherHoursPerDay: number;
    maxTeacherConsecutiveHours: number;
    maxClassHoursPerDay: number;
    avoidTeacherGaps: boolean;
    selectedClassIds: string[];
    respectExistingLessons: boolean;
  };
  setRules: (rules: any) => void;
}

const GeneratorRulesCard = ({ isRTL, classes, rules, setRules }: GeneratorRulesCardProps) => {
  const toggleDay = (dayId: number) => {
    const allowedDays = rules.allowedDays.includes(dayId)
      ? rules.allowedDays.filter(d => d !== dayId)
      : [...rules.allowedDays, dayId];
    setRules({ ...rules, allowedDays });
  };

  const togglePeriod = (periodId: string) => {
    const allowedPeriods = rules.allowedPeriods.includes(periodId)
      ? rules.allowedPeriods.filter(p => p !== periodId)
      : [...rules.allowedPeriods, periodId];
    setRules({ ...rules, allowedPeriods });
  };

  const toggleClassId = (id: string) => {
    if (id === "all") {
      setRules({ ...rules, selectedClassIds: ["all"] });
    } else {
      const filtered = rules.selectedClassIds.filter(x => x !== "all");
      if (filtered.includes(id)) {
        const next = filtered.filter(x => x !== id);
        setRules({ ...rules, selectedClassIds: next.length === 0 ? ["all"] : next });
      } else {
        setRules({ ...rules, selectedClassIds: [...filtered, id] });
      }
    }
  };

  return (
    <Card className="border-none shadow-xl shadow-emerald-100/20 rounded-3xl overflow-hidden bg-white">
      <CardHeader className="bg-emerald-50/30 border-b border-emerald-100">
        <CardTitle className="text-lg font-bold text-emerald-900 flex items-center gap-2">
          <Settings2 size={20} className="text-emerald-600" />
          {isRTL ? "قواعد وضوابط التوليد التلقائي" : "Scheduling Rules & Constraints"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* 1. Target Branches Selection */}
        <div className="space-y-3">
          <Label className="text-xs font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
            <GraduationCap size={14} className="text-emerald-600" />
            {isRTL ? "الفروع المستهدفة بالجدولة" : "Target Branches for Scheduling"}
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="rounded-xl border-emerald-100 bg-slate-50/30 h-11 font-bold text-xs w-full justify-between">
                <span className="truncate">
                  {rules.selectedClassIds.includes("all") 
                    ? (isRTL ? "جميع الفروع" : "All Branches") 
                    : (isRTL ? `محدد (${rules.selectedClassIds.length})` : `Selected (${rules.selectedClassIds.length})`)}
                </span>
                <SlidersHorizontal size={14} className="opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-2 rounded-2xl bg-white border border-slate-100 shadow-xl max-h-64 overflow-y-auto z-[999]">
              <div className="space-y-1">
                <div 
                  className="flex items-center gap-2.5 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
                  onClick={() => toggleClassId("all")}
                >
                  <Checkbox checked={rules.selectedClassIds.includes("all")} />
                  <span className="text-xs font-bold">{isRTL ? "جميع الفروع" : "All Branches"}</span>
                </div>
                {classes.map(c => (
                  <div 
                    key={c.id} 
                    className="flex items-center gap-2.5 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
                    onClick={() => toggleClassId(c.id)}
                  >
                    <Checkbox checked={rules.selectedClassIds.includes(c.id)} />
                    <span className="text-xs font-bold">{c.name}</span>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* 2. Respect Existing Lessons Switch */}
        <div className="flex items-center justify-between p-4 bg-emerald-50/20 rounded-2xl border border-emerald-100/50">
          <div className="space-y-0.5">
            <Label className="text-xs font-bold text-emerald-900">
              {isRTL ? "احترام الحصص المعينة مسبقاً" : "Respect Existing Scheduled Lessons"}
            </Label>
            <p className="text-[10px] text-emerald-700/70">
              {isRTL 
                ? "تجنب الكتابة فوق الحصص الموجودة حالياً في النظام وحماية أوقات الأساتذة والقاعات المشغولة."
                : "Do not overwrite currently scheduled lessons and protect busy teachers/rooms."}
            </p>
          </div>
          <Switch
            checked={rules.respectExistingLessons}
            onCheckedChange={v => setRules({ ...rules, respectExistingLessons: v })}
          />
        </div>

        {/* 3. Days of the Week */}
        <div className="space-y-3 border-t border-slate-100 pt-4">
          <Label className="text-xs font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar size={14} className="text-emerald-600" />
            {isRTL ? "أيام الأسبوع المعنية" : "Active Days of the Week"}
          </Label>
          <div className="flex flex-wrap gap-2">
            {DAYS.map(day => {
              const isChecked = rules.allowedDays.includes(day.id);
              return (
                <div
                  key={day.id}
                  onClick={() => toggleDay(day.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all text-xs font-bold",
                    isChecked
                      ? "bg-emerald-50 border-emerald-500 text-emerald-900"
                      : "bg-slate-50/50 border-slate-200 text-slate-500"
                  )}
                >
                  <Checkbox checked={isChecked} className="pointer-events-none" />
                  <span>{isRTL ? day.name : day.en}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Allowed Periods */}
        <div className="space-y-3">
          <Label className="text-xs font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
            <Clock size={14} className="text-emerald-600" />
            {isRTL ? "مجال الحصص المسموحة" : "Allowed Periods Range"}
          </Label>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {PERIODS.map(p => {
              const isChecked = rules.allowedPeriods.includes(p);
              return (
                <div
                  key={p}
                  onClick={() => togglePeriod(p)}
                  className={cn(
                    "flex flex-col items-center justify-center p-2 rounded-xl border cursor-pointer transition-all text-xs font-bold",
                    isChecked
                      ? "bg-emerald-50 border-emerald-500 text-emerald-900"
                      : "bg-slate-50/50 border-slate-200 text-slate-400"
                  )}
                >
                  <span className="text-[10px] text-slate-400 mb-1">{isRTL ? `حصة ${p}` : `P${p}`}</span>
                  <Checkbox checked={isChecked} className="pointer-events-none" />
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. Teacher Constraints */}
        <div className="space-y-4 border-t border-slate-100 pt-4">
          <Label className="text-xs font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
            <User size={14} className="text-emerald-600" />
            {isRTL ? "ضوابط وقواعد الأساتذة" : "Teacher Constraints"}
          </Label>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-slate-600">
                {isRTL ? "أقصى عدد حصص للأستاذ في اليوم" : "Max Hours Per Day"}
              </Label>
              <Input
                type="number"
                min={1}
                max={12}
                value={rules.maxTeacherHoursPerDay}
                onChange={e => setRules({ ...rules, maxTeacherHoursPerDay: parseInt(e.target.value) || 6 })}
                className="rounded-xl border-slate-200 h-10 font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-slate-600">
                {isRTL ? "أقصى عدد حصص متتالية للأستاذ" : "Max Consecutive Hours"}
              </Label>
              <Input
                type="number"
                min={1}
                max={6}
                value={rules.maxTeacherConsecutiveHours}
                onChange={e => setRules({ ...rules, maxTeacherConsecutiveHours: parseInt(e.target.value) || 3 })}
                className="rounded-xl border-slate-200 h-10 font-bold"
              />
            </div>
          </div>

          {/* Avoid Gaps Switch */}
          <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
            <div className="space-y-0.5">
              <Label className="text-xs font-bold text-slate-800">
                {isRTL ? "تجنب الفراغات (الساعات الشاغرة)" : "Avoid Schedule Gaps (Windows)"}
              </Label>
              <p className="text-[10px] text-slate-400">
                {isRTL 
                  ? "تجميع حصص الأستاذ اليومية متتالية لمنع وجود ساعات انتظار فارغة في منتصف يومه."
                  : "Keep teacher's daily lessons adjacent to prevent empty waiting hours in their day."}
              </p>
            </div>
            <Switch
              checked={rules.avoidTeacherGaps}
              onCheckedChange={v => setRules({ ...rules, avoidTeacherGaps: v })}
            />
          </div>
        </div>

        {/* 6. Class Constraints */}
        <div className="space-y-4 border-t border-slate-100 pt-4">
          <Label className="text-xs font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
            <GraduationCap size={14} className="text-emerald-600" />
            {isRTL ? "ضوابط وقواعد الأفواج" : "Class Constraints"}
          </Label>

          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-slate-600">
              {isRTL ? "أقصى عدد حصص للفوج في اليوم" : "Max Hours Per Day for Classes"}
            </Label>
            <Input
              type="number"
              min={1}
              max={12}
              value={rules.maxClassHoursPerDay}
              onChange={e => setRules({ ...rules, maxClassHoursPerDay: parseInt(e.target.value) || 6 })}
              className="rounded-xl border-slate-200 h-10 font-bold max-w-xs"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneratorRulesCard;