"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { format, parseISO, getDay } from "date-fns";
import { 
  UserPlus, 
  Search, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  GraduationCap,
  BookOpen,
  Zap,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import PageHeader from "../components/shared/PageHeader";
import { DAYS, PERIODS } from "../constants/schedule";
import { showSuccess } from "../utils/toast";

const Substitutions = () => {
  const { 
    isRTL, t, employees, assignments, subjects, classes, 
    teacherConstraints = [], dailyAssignments = [] 
  } = useApp();

  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedPeriod, setSelectedPeriod] = useState("1");
  const [absentTeacherId, setAbsentTeacherId] = useState("");

  const dayIdx = useMemo(() => getDay(parseISO(selectedDate)), [selectedDate]);

  // الحصص المجدولة في هذا اليوم وهذا التوقيت
  const activeLessons = useMemo(() => {
    return assignments.filter(a => a.day === dayIdx && a.period === selectedPeriod);
  }, [assignments, dayIdx, selectedPeriod]);

  // قائمة الأساتذة الذين لديهم حصص حالياً (المرشحون للغياب)
  const teachersInClass = useMemo(() => {
    const ids = Array.from(new Set(activeLessons.map(a => a.employeeId)));
    return ids.map(id => employees.find(e => e.id === id)).filter(Boolean);
  }, [activeLessons, employees]);

  // الحصة المختارة للغياب
  const targetLesson = useMemo(() => {
    if (!absentTeacherId) return null;
    return activeLessons.find(a => a.employeeId === absentTeacherId);
  }, [activeLessons, absentTeacherId]);

  // محرك البحث عن البدلاء
  const candidates = useMemo(() => {
    if (!absentTeacherId || !targetLesson) return [];

    return employees.map(emp => {
      if (emp.id === absentTeacherId) return null;

      // 1. هل هو مشغول بحصة أخرى في الجدول الرسمي؟
      const isBusyInTimetable = assignments.some(a => 
        a.employeeId === emp.id && a.day === dayIdx && a.period === selectedPeriod
      );

      // 2. هل لديه قيد يمنعه من الحضور (مغلق)؟
      const isBlockedByConstraint = teacherConstraints.some(c => 
        c.employeeId === emp.id && c.day === dayIdx && c.period === selectedPeriod && !c.isAvailable
      );

      // 3. هل لديه تكليف خارجي (Duty) في هذا الوقت؟
      const pNum = parseInt(selectedPeriod);
      const part = pNum <= 4 ? "Morning" : pNum <= 7 ? "Afternoon" : "Evening";
      const isBusyInDuty = dailyAssignments.some(d => 
        d.date === selectedDate && d.period === part && d.employeeIds.includes(emp.id)
      );

      if (isBusyInTimetable || isBlockedByConstraint || isBusyInDuty) return null;

      // حساب درجة التطابق (Score)
      let score = 0;
      const sameSubject = assignments.some(a => a.employeeId === emp.id && a.subjectId === targetLesson.subjectId);
      if (sameSubject) score += 50;

      const teacherLoadToday = assignments.filter(a => a.employeeId === emp.id && a.day === dayIdx).length;
      score += (10 - teacherLoadToday) * 5; // يفضل الأساتذة الأقل ضغطاً اليوم

      return { ...emp, score, load: teacherLoadToday, reason: sameSubject ? (isRTL ? "نفس المادة" : "Same Subject") : "" };
    })
    .filter(Boolean)
    .sort((a, b) => b!.score - a!.score);
  }, [absentTeacherId, targetLesson, employees, assignments, dayIdx, selectedPeriod, teacherConstraints, dailyAssignments, selectedDate, isRTL]);

  const handleAssignSubstitute = (subId: string) => {
    const sub = employees.find(e => e.id === subId);
    showSuccess(isRTL 
      ? `تم ترشيح ${sub?.lastName} لتعويض الحصة بنجاح` 
      : `${sub?.lastName} successfully recommended for substitution`
    );
  };

  return (
    <div className="space-y-8 pb-20">
      <PageHeader
        title={t.substitutions}
        subtitle={isRTL ? "محرك الذكاء الاصطناعي لإيجاد أفضل البدلاء للأساتذة الغائبين" : "AI engine to find optimal substitutes for absent staff"}
        icon={UserPlus}
        isRTL={isRTL}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Input Selection */}
        <div className="space-y-6">
          <Card className="border-none shadow-xl shadow-emerald-100/20 rounded-[2rem] overflow-hidden bg-white">
            <CardHeader className="bg-emerald-50/50 border-b border-emerald-100">
              <CardTitle className="text-sm font-black text-emerald-900 flex items-center gap-2">
                <Search size={16} className="text-emerald-600" />
                {isRTL ? "تحديد الحصة المتضررة" : "Define Affected Slot"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest px-1">{isRTL ? "تاريخ الغياب" : "Date of Absence"}</label>
                <div className="relative">
                  <CalendarIcon className={cn("absolute top-1/2 -translate-y-1/2 text-emerald-500", isRTL ? "right-3" : "left-3")} size={16} />
                  <Input 
                    type="date" 
                    value={selectedDate} 
                    onChange={(e) => { setSelectedDate(e.target.value); setAbsentTeacherId(""); }} 
                    className={cn("rounded-xl border-emerald-100 h-11 font-bold", isRTL ? "pr-10" : "pl-10")} 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest px-1">{isRTL ? "توقيت الحصة" : "Period Slot"}</label>
                <div className="relative">
                  <Clock className={cn("absolute top-1/2 -translate-y-1/2 text-emerald-500", isRTL ? "right-3" : "left-3")} size={16} />
                  <Select value={selectedPeriod} onValueChange={(v) => { setSelectedPeriod(v); setAbsentTeacherId(""); }}>
                    <SelectTrigger className={cn("rounded-xl border-emerald-100 h-11 font-bold", isRTL ? "pr-10" : "pl-10")}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PERIODS.map(p => <SelectItem key={p} value={p}>{isRTL ? `حصة ${p}` : `Period ${p}`}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-rose-600 uppercase tracking-widest px-1">{isRTL ? "الأستاذ الغائب" : "Absent Teacher"}</label>
                <Select value={absentTeacherId} onValueChange={setAbsentTeacherId}>
                  <SelectTrigger className="rounded-xl border-rose-100 bg-rose-50/20 h-11 font-black">
                    <SelectValue placeholder={isRTL ? "اختر الأستاذ..." : "Select teacher..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {teachersInClass.length > 0 ? teachersInClass.map(e => (
                      <SelectItem key={e!.id} value={e!.id}>{e!.lastName} {e!.firstName}</SelectItem>
                    )) : (
                      <SelectItem value="none" disabled>{isRTL ? "لا توجد حصص مجدولة" : "No lessons found"}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {targetLesson && (
            <Card className="border-none shadow-xl shadow-rose-100/20 rounded-[2rem] overflow-hidden bg-rose-950 text-white animate-in slide-in-from-left duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-white/10 rounded-xl"><AlertTriangle className="text-rose-400" size={20} /></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-300">{isRTL ? "تفاصيل الحصة المعطلة" : "Disrupted Lesson"}</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <BookOpen size={16} className="text-rose-400" />
                    <span className="text-sm font-black">{subjects.find(s => s.id === targetLesson.subjectId)?.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <GraduationCap size={16} className="text-rose-400" />
                    <span className="text-sm font-bold">{classes.find(c => c.id === targetLesson.classId)?.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-rose-400" />
                    <span className="text-sm font-bold">{targetLesson.room || "---"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Results / Candidates */}
        <div className="lg:col-span-2 space-y-6">
          {!absentTeacherId ? (
            <div className="h-full flex flex-col items-center justify-center bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200 py-32 text-center space-y-4">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-200 shadow-sm">
                <Zap size={40} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-400 uppercase tracking-tight">
                  {isRTL ? "بانتظار تحديد الغياب" : "Awaiting Input"}
                </h3>
                <p className="text-xs font-bold text-slate-300">
                  {isRTL ? "اختر التاريخ والتوقيت والأستاذ الغائب لبدء عملية البحث الذكي" : "Select date, slot and teacher to start smart search"}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-4">
                <h3 className="font-black text-emerald-950 uppercase tracking-widest text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  {t.availableAndQualified}
                </h3>
                <span className="text-[10px] font-black text-slate-400">{candidates.length} {isRTL ? "مرشح متوفر" : "Candidates found"}</span>
              </div>

              {candidates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {candidates.map((cand: any, idx) => (
                    <Card key={cand.id} className={cn(
                      "border-none shadow-lg rounded-[2rem] transition-all hover:scale-[1.02] cursor-pointer group",
                      idx === 0 ? "bg-emerald-600 text-white" : "bg-white"
                    )} onClick={() => handleAssignSubstitute(cand.id)}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black shadow-sm",
                              idx === 0 ? "bg-white text-emerald-600" : "bg-emerald-50 text-emerald-600"
                            )}>
                              {cand.lastName[0]}
                            </div>
                            <div>
                              <p className="font-black">{cand.lastName} {cand.firstName}</p>
                              <p className={cn("text-[9px] font-bold uppercase", idx === 0 ? "text-emerald-100" : "text-slate-400")}>
                                {cand.category} • {cand.load} {isRTL ? "حصص اليوم" : "Hours Today"}
                              </p>
                            </div>
                          </div>
                          {idx === 0 && (
                            <div className="bg-white/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                              <Zap size={10} className="fill-white" /> {t.bestMatch}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                          <div className="space-y-1">
                            {cand.reason && (
                              <div className={cn("flex items-center gap-1 text-[10px] font-black", idx === 0 ? "text-emerald-200" : "text-emerald-600")}>
                                <CheckCircle2 size={12} /> {cand.reason}
                              </div>
                            )}
                          </div>
                          <Button variant="ghost" size="sm" className={cn(
                            "rounded-xl h-8 px-4 font-black text-[10px] gap-2",
                            idx === 0 ? "bg-white text-emerald-600 hover:bg-emerald-50" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          )}>
                            {t.assign} <ArrowRight size={12} className={cn(!isRTL && "rotate-0", isRTL && "rotate-180")} />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="bg-rose-50 border border-rose-100 p-12 rounded-[3rem] text-center space-y-3">
                  <div className="w-16 h-16 bg-white rounded-3xl mx-auto flex items-center justify-center text-rose-300 shadow-sm">
                    <Info size={32} />
                  </div>
                  <p className="text-rose-900 font-black">{t.noSubstituteFound}</p>
                  <p className="text-xs font-bold text-rose-700/60 max-w-xs mx-auto">
                    {isRTL 
                      ? "كافة الأساتذة المؤهلين مشغولون حالياً بحصص أخرى أو غير متواجدين حسب قيودهم الزمنية." 
                      : "All qualified teachers are either busy with other lessons or unavailable based on their time constraints."}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Substitutions;