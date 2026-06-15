"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { 
  Sparkles, 
  Play, 
  Check, 
  AlertTriangle, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Calendar,
  User,
  BookOpen,
  Home,
  MapPin,
  HelpCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { showSuccess, showError } from "../utils/toast";
import PageHeader from "../components/shared/PageHeader";
import { DAYS, PERIODS } from "../constants/schedule";

interface Requirement {
  id: string;
  employeeId: string;
  subjectId: string;
  classId: string;
  room: string;
  count: number; // Number of periods per week
}

const AutoGenerator = () => {
  const { 
    employees, classes, subjects, rooms, assignments, setAssignments, isRTL, t, periodConfigs 
  } = useApp();

  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [isGenerating, setIsTransolving] = useState(false);
  const [generatedAssignments, setGeneratedAssignments] = useState<any[]>([]);
  const [unplacedLessons, setUnplacedLessons] = useState<any[]>([]);
  const [generationStats, setGenerationStats] = useState<{ successRate: number; total: number; placed: number } | null>(null);

  // Form state for adding a new requirement manually
  const [newReq, setNewReq] = useState({
    employeeId: "",
    subjectId: "",
    classId: "",
    room: "",
    count: 1
  });

  // Extract requirements from current schedule
  const handleExtractFromCurrent = () => {
    if (assignments.length === 0) {
      showError(isRTL ? "لا توجد حصص في الجدول الحالي لاستخراجها" : "No lessons in current schedule to extract");
      return;
    }

    // Group current assignments to find weekly counts
    const groups: Record<string, { req: Omit<Requirement, 'id' | 'count'>; count: number }> = {};
    
    assignments.forEach(asgn => {
      const key = `${asgn.employeeId}-${asgn.subjectId}-${asgn.classId}-${asgn.room || ""}`;
      if (!groups[key]) {
        groups[key] = {
          req: {
            employeeId: asgn.employeeId,
            subjectId: asgn.subjectId,
            classId: asgn.classId,
            room: asgn.room || ""
          },
          count: 0
        };
      }
      groups[key].count++;
    });

    const extracted: Requirement[] = Object.entries(groups).map(([key, val]) => ({
      id: `req-${Math.random().toString(36).substr(2, 9)}`,
      ...val.req,
      count: val.count
    }));

    setRequirements(extracted);
    showSuccess(isRTL ? `تم استخراج ${extracted.length} متطلبات تدريس بنجاح` : `Extracted ${extracted.length} teaching requirements`);
  };

  const handleAddRequirement = () => {
    if (!newReq.employeeId || !newReq.subjectId || !newReq.classId) {
      showError(isRTL ? "يرجى ملء الحقول الأساسية (الأستاذ، المادة، الفوج)" : "Please fill required fields");
      return;
    }

    const id = `req-${Math.random().toString(36).substr(2, 9)}`;
    setRequirements([...requirements, { id, ...newReq }]);
    setNewReq({ employeeId: "", subjectId: "", classId: "", room: "", count: 1 });
    showSuccess(isRTL ? "تم إضافة متطلب التدريس" : "Requirement added");
  };

  const handleDeleteRequirement = (id: string) => {
    setRequirements(requirements.filter(r => r.id !== id));
  };

  const handleClearRequirements = () => {
    setRequirements([]);
    setGeneratedAssignments([]);
    setUnplacedLessons([]);
    setGenerationStats(null);
  };

  // Smart Scheduling Algorithm
  const handleGenerate = () => {
    if (requirements.length === 0) {
      showError(isRTL ? "يرجى إضافة متطلبات التدريس أولاً" : "Please add teaching requirements first");
      return;
    }

    setIsTransolving(true);
    
    // Run in a timeout to allow UI to render loading state
    setTimeout(() => {
      // Flatten requirements into individual lessons to place
      let lessonsToPlace: any[] = [];
      requirements.forEach(req => {
        for (let i = 0; i < req.count; i++) {
          lessonsToPlace.push({
            id: `gen-${Math.random().toString(36).substr(2, 9)}`,
            employeeId: req.employeeId,
            subjectId: req.subjectId,
            classId: req.classId,
            room: req.room
          });
        }
      });

      // Sort lessons to place: place harder ones first (e.g., teachers with most lessons)
      const teacherCounts: Record<string, number> = {};
      lessonsToPlace.forEach(l => {
        teacherCounts[l.employeeId] = (teacherCounts[l.employeeId] || 0) + 1;
      });
      lessonsToPlace.sort((a, b) => (teacherCounts[b.employeeId] || 0) - (teacherCounts[a.employeeId] || 0));

      // Get active slots from periodConfigs
      const activeSlots: { day: number; period: string }[] = [];
      DAYS.forEach(day => {
        PERIODS.forEach(period => {
          const config = periodConfigs.find(c => c.day === day.id && c.period === period);
          if (config?.isActive !== false) {
            activeSlots.push({ day: day.id, period });
          }
        });
      });

      if (activeSlots.length === 0) {
        showError(isRTL ? "لا توجد حصص زمنية مفعلة في الإعدادات" : "No active periods in settings");
        setIsTransolving(false);
        return;
      }

      // Randomized Greedy Solver with multiple restarts
      let bestAssignments: any[] = [];
      let bestUnplaced: any[] = [];
      let maxPlaced = -1;

      const RESTARTS = 50; // Try 50 times to find the best conflict-free layout

      for (let run = 0; run < RESTARTS; run++) {
        const currentAssignments: any[] = [];
        const unplaced: any[] = [];

        // Shuffle active slots slightly to introduce randomness
        const shuffledSlots = [...activeSlots].sort(() => Math.random() - 0.5);

        lessonsToPlace.forEach(lesson => {
          let placed = false;

          // Find a valid slot
          for (const slot of shuffledSlots) {
            // Check constraints:
            // 1. Teacher is free
            const teacherBusy = currentAssignments.some(a => 
              a.day === slot.day && a.period === slot.period && a.employeeId === lesson.employeeId
            );
            if (teacherBusy) continue;

            // 2. Class is free
            const classBusy = currentAssignments.some(a => 
              a.day === slot.day && a.period === slot.period && a.classId === lesson.classId
            );
            if (classBusy) continue;

            // 3. Room is free (if specified)
            if (lesson.room) {
              const roomBusy = currentAssignments.some(a => 
                a.day === slot.day && a.period === slot.period && a.room === lesson.room
              );
              if (roomBusy) continue;
            }

            // If all clear, place it!
            currentAssignments.push({
              ...lesson,
              day: slot.day,
              period: slot.period
            });
            placed = true;
            break;
          }

          if (!placed) {
            unplaced.push(lesson);
          }
        });

        if (currentAssignments.length > maxPlaced) {
          maxPlaced = currentAssignments.length;
          bestAssignments = currentAssignments;
          bestUnplaced = unplaced;
        }

        // Perfect solution found!
        if (unplaced.length === 0) break;
      }

      setGeneratedAssignments(bestAssignments);
      setUnplacedLessons(bestUnplaced);
      
      const total = lessonsToPlace.length;
      const placed = bestAssignments.length;
      const successRate = Math.round((placed / total) * 100);
      
      setGenerationStats({ successRate, total, placed });
      setIsTransolving(false);

      if (bestUnplaced.length === 0) {
        showSuccess(isRTL ? "تم توليد جدول متكامل وخالٍ من التعارضات بنجاح!" : "Successfully generated a perfect conflict-free schedule!");
      } else {
        showError(isRTL ? `تم جدولة ${placed} من أصل ${total} حصة. بعض الحصص تعذر جدولتها بسبب ضيق الوقت أو تعارض الموارد.` : `Scheduled ${placed} of ${total} lessons. Some could not be placed due to resource constraints.`);
      }
    }, 600);
  };

  const handleApplyToSystem = () => {
    if (generatedAssignments.length === 0) return;
    setAssignments(generatedAssignments);
    showSuccess(isRTL ? "تم تطبيق الجدول المولد على النظام بنجاح!" : "Generated schedule applied to system successfully!");
  };

  const getEmployeeName = (id: string) => {
    const emp = employees.find(e => e.id === id);
    return emp ? `${emp.lastName} ${emp.firstName}` : "---";
  };

  const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || "---";
  const getClassName = (id: string) => classes.find(c => c.id === id)?.name || "---";

  return (
    <div className="space-y-8 pb-20">
      <PageHeader
        title={isRTL ? "المولد التلقائي للجداول" : "Auto Schedule Generator"}
        subtitle={isRTL ? "توليد جدول دراسي ذكي وخالٍ من التعارضات بضغطة زر" : "Generate a smart, conflict-free schedule instantly"}
        icon={Sparkles}
        isRTL={isRTL}
      >
        <Button 
          variant="outline" 
          onClick={handleExtractFromCurrent}
          className="rounded-xl border-emerald-200 text-emerald-700 bg-white h-11 font-bold"
        >
          {isRTL ? "استخراج من الجدول الحالي" : "Extract from Current"}
        </Button>
        {requirements.length > 0 && (
          <Button 
            variant="ghost" 
            onClick={handleClearRequirements}
            className="rounded-xl text-red-500 hover:bg-red-50 h-11 font-bold"
          >
            {isRTL ? "مسح الكل" : "Clear All"}
          </Button>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column: Requirements Input & List */}
        <div className="xl:col-span-2 space-y-6">
          {/* Add Requirement Form */}
          <Card className="border-none shadow-xl shadow-emerald-100/20 rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-emerald-50/30 border-b border-emerald-100">
              <CardTitle className="text-lg font-bold text-emerald-900 flex items-center gap-2">
                <Plus size={20} className="text-emerald-600" />
                {isRTL ? "إضافة متطلب تدريس (حصة أسبوعية)" : "Add Teaching Requirement"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-emerald-700 uppercase">{isRTL ? "الأستاذ" : "Teacher"}</label>
                  <Select value={newReq.employeeId} onValueChange={v => setNewReq({...newReq, employeeId: v})}>
                    <SelectTrigger className="rounded-xl border-emerald-100 h-10">
                      <SelectValue placeholder={isRTL ? "اختر الأستاذ..." : "Select..."} />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.lastName} {e.firstName}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-emerald-700 uppercase">{isRTL ? "المادة" : "Subject"}</label>
                  <Select value={newReq.subjectId} onValueChange={v => setNewReq({...newReq, subjectId: v})}>
                    <SelectTrigger className="rounded-xl border-emerald-100 h-10">
                      <SelectValue placeholder={isRTL ? "اختر المادة..." : "Select..."} />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-emerald-700 uppercase">{isRTL ? "الفوج" : "Class"}</label>
                  <Select value={newReq.classId} onValueChange={v => setNewReq({...newReq, classId: v})}>
                    <SelectTrigger className="rounded-xl border-emerald-100 h-10">
                      <SelectValue placeholder={isRTL ? "اختر الفوج..." : "Select..."} />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-emerald-700 uppercase">{isRTL ? "القاعة" : "Room"}</label>
                  <Select value={newReq.room} onValueChange={v => setNewReq({...newReq, room: v})}>
                    <SelectTrigger className="rounded-xl border-emerald-100 h-10">
                      <SelectValue placeholder={isRTL ? "اختياري..." : "Optional..."} />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms.map((r, idx) => <SelectItem key={idx} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-emerald-700 uppercase">{isRTL ? "الحصص أسبوعياً" : "Weekly Hours"}</label>
                  <div className="flex gap-2">
                    <Input 
                      type="number" 
                      min={1} 
                      max={10} 
                      value={newReq.count} 
                      onChange={e => setNewReq({...newReq, count: parseInt(e.target.value) || 1})}
                      className="rounded-xl border-emerald-100 h-10 w-20 text-center font-bold"
                    />
                    <Button onClick={handleAddRequirement} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl h-10 flex-1 font-bold">
                      {isRTL ? "إضافة" : "Add"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requirements List */}
          <Card className="border-none shadow-xl shadow-emerald-100/20 rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-emerald-50/30 border-b border-emerald-100 flex flex-row justify-between items-center">
              <CardTitle className="text-lg font-bold text-emerald-900">
                {isRTL ? `قائمة متطلبات التدريس (${requirements.length})` : `Teaching Requirements (${requirements.length})`}
              </CardTitle>
              {requirements.length > 0 && (
                <Button 
                  onClick={handleGenerate} 
                  disabled={isGenerating}
                  className="bg-emerald-600 hover:bg-emerald-700 rounded-xl gap-2 font-bold shadow-lg shadow-emerald-100"
                >
                  {isGenerating ? <RefreshCw className="animate-spin" size={18} /> : <Play size={18} />}
                  {isRTL ? "توليد الجدول الآن" : "Generate Schedule"}
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className={cn("w-full border-collapse", isRTL ? "text-right" : "text-left")}>
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="p-4 text-slate-700 font-black text-[10px] uppercase">{isRTL ? "الأستاذ" : "Teacher"}</th>
                      <th className="p-4 text-slate-700 font-black text-[10px] uppercase">{isRTL ? "المادة" : "Subject"}</th>
                      <th className="p-4 text-slate-700 font-black text-[10px] uppercase">{isRTL ? "الفوج" : "Class"}</th>
                      <th className="p-4 text-slate-700 font-black text-[10px] uppercase text-center">{isRTL ? "القاعة" : "Room"}</th>
                      <th className="p-4 text-slate-700 font-black text-[10px] uppercase text-center">{isRTL ? "الحصص" : "Hours"}</th>
                      <th className="p-4 text-slate-700 font-black text-[10px] uppercase text-center w-20">{isRTL ? "إجراء" : "Action"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {requirements.map((req) => (
                      <tr key={req.id} className="hover:bg-emerald-50/10 transition-colors">
                        <td className="p-4 font-bold text-emerald-950 text-xs flex items-center gap-2">
                          <User size={14} className="text-emerald-500" />
                          {getEmployeeName(req.employeeId)}
                        </td>
                        <td className="p-4 text-slate-700 text-xs">
                          <span className="flex items-center gap-2">
                            <BookOpen size={14} className="text-blue-500" />
                            {getSubjectName(req.subjectId)}
                          </span>
                        </td>
                        <td className="p-4 text-slate-700 text-xs">
                          <span className="flex items-center gap-2">
                            <Home size={14} className="text-amber-500" />
                            {getClassName(req.classId)}
                          </span>
                        </td>
                        <td className="p-4 text-center text-xs font-bold">
                          {req.room ? (
                            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                              <MapPin size={10} />
                              {req.room}
                            </span>
                          ) : "---"}
                        </td>
                        <td className="p-4 text-center text-xs font-black text-emerald-700">{req.count}</td>
                        <td className="p-4 text-center">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            onClick={() => handleDeleteRequirement(req.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {requirements.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-slate-400 font-bold text-xs">
                          <HelpCircle className="mx-auto text-slate-300 mb-2" size={32} />
                          {isRTL ? "لا توجد متطلبات تدريس مضافة حالياً. يمكنك استخراجها من الجدول الحالي أو إضافتها يدوياً." : "No teaching requirements added yet. Extract from current schedule or add manually."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Generation Stats & Actions */}
        <div className="space-y-6">
          {generationStats && (
            <Card className="border-none shadow-xl shadow-emerald-100/20 rounded-3xl overflow-hidden bg-emerald-950 text-white">
              <CardHeader className="border-b border-white/5">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Sparkles size={20} className="text-emerald-400" />
                  {isRTL ? "نتائج التوليد التلقائي" : "Generation Results"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="text-center space-y-2">
                  <p className="text-5xl font-black tracking-tighter text-emerald-400">{generationStats.successRate}%</p>
                  <p className="text-xs font-bold text-emerald-200/60 uppercase tracking-widest">
                    {isRTL ? "نسبة نجاح الجدولة" : "Scheduling Success Rate"}
                  </p>
                </div>

                <div className="space-y-3 border-t border-white/5 pt-4">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-white/60">{isRTL ? "إجمالي الحصص المطلوبة:" : "Total Lessons:"}</span>
                    <span>{generationStats.total}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-white/60">{isRTL ? "الحصص المجدولة بنجاح:" : "Placed Lessons:"}</span>
                    <span className="text-emerald-400">{generationStats.placed}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-white/60">{isRTL ? "الحصص المتعذرة:" : "Unplaced Lessons:"}</span>
                    <span className={generationStats.total - generationStats.placed > 0 ? "text-red-400" : "text-white/40"}>
                      {generationStats.total - generationStats.placed}
                    </span>
                  </div>
                </div>

                {generationStats.placed > 0 && (
                  <Button 
                    onClick={handleApplyToSystem}
                    className="w-full h-12 bg-white text-emerald-950 hover:bg-emerald-50 rounded-xl font-black text-sm shadow-lg transition-all"
                  >
                    <Check className="mr-2 h-5 w-5" />
                    {isRTL ? "تطبيق الجدول المولد على النظام" : "Apply Generated Schedule"}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Unplaced Lessons Alert */}
          {unplacedLessons.length > 0 && (
            <Card className="border-none shadow-xl shadow-red-100/20 rounded-3xl overflow-hidden bg-red-50/50 border border-red-100">
              <CardHeader className="border-b border-red-100 bg-red-100/20">
                <CardTitle className="text-sm font-bold text-red-900 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-red-600" />
                  {isRTL ? `حصص تعذر جدولتها (${unplacedLessons.length})` : `Unplaced Lessons (${unplacedLessons.length})`}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 max-h-[300px] overflow-y-auto space-y-2">
                <p className="text-[10px] font-bold text-red-700/70 mb-2">
                  {isRTL 
                    ? "تعذر جدولة هذه الحصص بسبب تعارض في أوقات الأساتذة أو القاعات المحددة. يرجى زيادة الحصص الزمنية المتاحة أو مراجعة المتطلبات." 
                    : "These lessons couldn't be placed due to resource overlaps. Try activating more periods or reviewing requirements."}
                </p>
                {unplacedLessons.map((lesson, idx) => (
                  <div key={idx} className="p-2.5 bg-white rounded-xl border border-red-100 text-[11px] font-bold text-slate-700 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-emerald-900">{getEmployeeName(lesson.employeeId)}</span>
                      <span className="text-blue-600">{getSubjectName(lesson.subjectId)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>{getClassName(lesson.classId)}</span>
                      {lesson.room && <span>{lesson.room}</span>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutoGenerator;