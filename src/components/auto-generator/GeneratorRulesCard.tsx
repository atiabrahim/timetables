"use client";

import React from "react";
import { Settings2, Calendar, Clock, User, GraduationCap, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { DAYS, PERIODS } from "../../constants/schedule";
import { cn } from "@/lib/utils";

interface GeneratorRulesCardProps {
  isRTL: boolean;
  rules: {
    allowedDays: number[];
    allowedPeriods: string[];
    maxTeacherHoursPerDay: number;
    maxTeacherConsecutiveHours: number;
    maxClassHoursPerDay: number;
    avoidTeacherGaps: boolean;
  };
  setRules: (rules: any) => void;
}

const GeneratorRulesCard = ({ isRTL, rules, setRules }: GeneratorRulesCardProps) => {
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

  return (
    <Card className="border-none shadow-xl shadow-emerald-100/20 rounded-3xl overflow-hidden bg-white">
      <CardHeader className="bg-emerald-50/30 border-b border-emerald-100">
        <CardTitle className="text-lg font-bold text-emerald-900 flex items-center gap-2">
          <Settings2 size={20} className="text-emerald-600" />
          {isRTL ? "قواعد وضوابط التوليد التلقائي" : "Scheduling Rules & Constraints"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* 1. Days of the Week */}
        <div className="space-y-3">
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

        {/* 2. Allowed Periods */}
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

        {/* 3. Teacher Constraints */}
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

        {/* 4. Class Constraints */}
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