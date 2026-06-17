"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { 
  Wand2, Sparkles, Timer, FileDown, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { showSuccess, showError } from "../utils/toast";
import RequirementForm from "../components/auto-generator/RequirementForm";
import RequirementTable from "../components/auto-generator/RequirementTable";
import GeneratorRulesCard from "../components/auto-generator/GeneratorRulesCard";
import GenerationStatsCard from "../components/auto-generator/GenerationStatsCard";
import UnplacedLessonsCard from "../components/auto-generator/UnplacedLessonsCard";
import { PERIODS, PERIOD_MAP } from "../constants/schedule";
import { PeriodPart, Requirement } from "@/types";

const AutoGenerator = () => {
  const { 
    isRTL, subjects, employees, classes, rooms, 
    assignments, setAssignments, requirements, setRequirements,
    teacherConstraints = [], classConstraints = [], roomConstraints = []
  } = useApp();

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<any>(null);

  const [rules, setRules] = useState({
    allowedDays: [0, 1, 2, 3, 4],
    allowedPeriods: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    maxTeacherHoursPerDay: 6,
    maxTeacherConsecutiveHours: 3,
    maxClassHoursPerDay: 6,
    avoidTeacherGaps: true,
    selectedClassIds: ["all"],
    respectExistingLessons: true,
    selectedPeriodParts: ["Morning", "Afternoon"] as PeriodPart[],
    allowSingleHour: false
  });

  const [newReq, setNewReq] = useState({
    employeeId: "",
    subjectId: "",
    classId: "",
    room: "",
    count: 1
  });

  const extractFromSchedule = () => {
    if (assignments.length === 0) {
      showError(isRTL ? "الجدول الحالي فارغ، لا توجد حصص لاستخراجها" : "Current schedule is empty");
      return;
    }

    const groups: Record<string, any> = {};
    assignments.forEach(asgn => {
      const key = `${asgn.employeeId}-${asgn.subjectId}-${asgn.classId}-${asgn.room || ''}`;
      if (!groups[key]) {
        groups[key] = { employeeId: asgn.employeeId, subjectId: asgn.subjectId, classId: asgn.classId, room: asgn.room || '', count: 0 };
      }
      groups[key].count++;
    });

    const extracted = Object.values(groups).map(g => ({
      ...g,
      id: Math.random().toString(36).substr(2, 9)
    })) as Requirement[];

    setRequirements(extracted);
    showSuccess(isRTL ? `تم استخراج ${extracted.length} متطلبات من الجدول بنجاح` : `Extracted ${extracted.length} requirements successfully`);
  };

  const handleAddRequirement = () => {
    if (!newReq.employeeId || !newReq.subjectId || !newReq.classId) {
      showError(isRTL ? "يرجى اختيار الأستاذ والمادة والفوج" : "Please select teacher, subject and class");
      return;
    }
    setRequirements([...requirements, { ...newReq, id: Math.random().toString(36).substr(2, 9) } as Requirement]);
    setNewReq({ ...newReq, count: 1 });
    showSuccess(isRTL ? "تم إضافة المتطلب" : "Requirement added");
  };

  const handleDeleteRequirement = (id: string) => setRequirements(requirements.filter(r => r.id !== id));
  const handleClearAll = () => setRequirements([]);

  const getEmployeeName = (id: string) => {
    const emp = employees.find(e => e.id === id);
    return emp ? `${emp.lastName} ${emp.firstName}` : "---";
  };

  const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || "---";
  const getClassName = (id: string) => classes.find(c => c.id === id)?.name || "---";

  const checkHardConstraints = (req: any, day: number, period: string, currentAsgns: any[]): boolean => {
    if (!rules.allowedDays.includes(day)) return false;
    if (!rules.allowedPeriods.includes(period)) return false;
    const part = PERIOD_MAP[period];
    if (!rules.selectedPeriodParts.includes(part)) return false;
    
    const tConstraint = teacherConstraints.find(c => c.employeeId === req.employeeId && c.day === day && c.period === period);
    if (tConstraint && !tConstraint.isAvailable) return false;
    
    const cConstraint = classConstraints.find(c => c.classId === req.classId && c.day === day && c.period === period);
    if (cConstraint && !cConstraint.isAvailable) return false;

    if (req.room) {
      const rConstraint = roomConstraints.find(c => c.roomName === req.room && c.day === day && c.period === period);
      if (rConstraint && !rConstraint.isAvailable) return false;
    }

    if (currentAsgns.some(a => a.day === day && a.period === period && a.employeeId === req.employeeId)) return false;
    if (currentAsgns.some(a => a.day === day && a.period === period && a.classId === req.classId)) return false;
    if (req.room && currentAsgns.some(a => a.day === day && a.period === period && a.room === req.room)) return false;
    
    if (currentAsgns.filter(a => a.day === day && a.classId === req.classId).length >= rules.maxClassHoursPerDay) return false;
    if (currentAsgns.filter(a => a.day === day && a.employeeId === req.employeeId).length >= rules.maxTeacherHoursPerDay) return false;
    
    const pNum = parseInt(period);
    let consecutive = 1;
    [pNum-1, pNum+1].forEach(p => {
      let check = p;
      while(currentAsgns.some(a => a.day === day && a.period === check.toString() && a.employeeId === req.employeeId)) {
        consecutive++;
        if (p < pNum) check--; else check++;
      }
    });
    if (consecutive > rules.maxTeacherConsecutiveHours) return false;
    return true;
  };

  const scoreSlot = (req: any, day: number, period: string, currentAsgns: any[]): number => {
    let score = 0;
    const pNum = parseInt(period);
    const isAdjacent = currentAsgns.some(a => a.day === day && (a.employeeId === req.employeeId || a.classId === req.classId) && Math.abs(parseInt(a.period) - pNum) === 1);
    if (isAdjacent) score += 100;
    if (pNum <= 4) score += 20;
    const teacherDayCount = currentAsgns.filter(a => a.day === day && a.employeeId === req.employeeId).length;
    score -= (teacherDayCount * 30);
    return score + (Math.random() * 10);
  };

  const generateSchedule = async () => {
    if (requirements.length === 0) return;
    setIsGenerating(true);
    setProgress(0);
    const targetReqs = requirements.filter(req => rules.selectedClassIds.includes("all") || rules.selectedClassIds.includes(req.classId));
    let bestResult: any = null;
    let maxPlaced = -1;
    const iterations = 50;
    for (let iter = 0; iter < iterations; iter++) {
      setProgress(Math.round((iter / iterations) * 100));
      let currentAssignments = rules.respectExistingLessons ? [...assignments] : [];
      const sortedReqs = [...targetReqs].sort((a, b) => {
        const loadA = targetReqs.filter(r => r.employeeId === a.employeeId).reduce((s, r) => s + r.count, 0);
        const loadB = targetReqs.filter(r => r.employeeId === b.employeeId).reduce((s, r) => s + r.count, 0);
        return loadB - loadA;
      });
      let placedCount = 0;
      const unplaced: any[] = [];
      for (const req of sortedReqs) {
        for (let c = 0; c < req.count; c++) {
          let bestDay = -1, bestPeriod = "", highestScore = -Infinity;
          for (const day of rules.allowedDays) {
            for (const period of rules.allowedPeriods) {
              if (checkHardConstraints(req, day, period, currentAssignments)) {
                const score = scoreSlot(req, day, period, currentAssignments);
                if (score > highestScore) { highestScore = score; bestDay = day; bestPeriod = period; }
              }
            }
          }
          if (bestDay !== -1) {
            currentAssignments.push({ id: Math.random().toString(36).substr(2, 9), employeeId: req.employeeId, subjectId: req.subjectId, classId: req.classId, room: req.room || "", department: "", day: bestDay, period: bestPeriod });
            placedCount++;
          } else { unplaced.push(req); }
        }
      }
      if (placedCount > maxPlaced) {
        maxPlaced = placedCount;
        bestResult = { assignments: currentAssignments, unplaced: Array.from(new Set(unplaced)), successRate: Math.round((placedCount / targetReqs.reduce((s, r) => s + r.count, 0)) * 100), total: targetReqs.reduce((s, r) => s + r.count, 0), placed: placedCount };
      }
      if (bestResult.successRate === 100) break;
      await new Promise(r => setTimeout(r, 10));
    }
    setStats(bestResult); setIsGenerating(false); setProgress(100);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[2.5rem] border border-emerald-100 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-emerald-950 flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-2xl"><Wand2 className="text-emerald-600" size={28} /></div>
            {isRTL ? "المولد التلقائي الذكي" : "Smart Auto Generator"}
          </h1>
          <p className="text-slate-500 font-medium px-1">{isRTL ? "قم بإعداد متطلباتك ودع الذكاء الاصطناعي يبني جدولك المثالي" : "Set your requirements and let AI build your perfect schedule"}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={extractFromSchedule} className="h-14 px-6 rounded-2xl font-bold border-emerald-100 text-emerald-700 gap-2 hover:bg-emerald-50"><FileDown size={20} />{isRTL ? "استخراج من الجدول" : "Extract from Table"}</Button>
          <Button onClick={generateSchedule} disabled={isGenerating || requirements.length === 0} className="h-14 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-lg gap-3 shadow-lg shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50">{isGenerating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles size={20} className="fill-white" />}{isGenerating ? (isRTL ? "جاري التوليد..." : "Generating...") : (isRTL ? "توليد الجدول الآن" : "Generate Now")}</Button>
        </div>
      </div>

      {isGenerating && (
        <Card className="border-none shadow-xl bg-emerald-600 text-white rounded-[2rem] overflow-hidden">
          <CardContent className="p-8 space-y-4">
            <div className="flex justify-between items-end">
              <div className="space-y-1"><span className="text-emerald-100 text-sm font-bold uppercase tracking-wider">{isRTL ? "جاري تحليل الاحتمالات وتجنب التعارضات..." : "Analyzing possibilities..."}</span><h3 className="text-2xl font-black">{isRTL ? `نسبة الإنجاز: ${progress}%` : `Progress: ${progress}%`}</h3></div>
              <Timer className="text-emerald-400 animate-pulse" size={40} />
            </div>
            <Progress value={progress} className="h-3 bg-white/20" />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <RequirementForm isRTL={isRTL} employees={employees} subjects={subjects} classes={classes} rooms={rooms} newReq={newReq} setNewReq={setNewReq} onAdd={handleAddRequirement} />
          <div className="space-y-4">
            <div className="flex justify-between items-center px-4">
              <h3 className="font-black text-emerald-900 uppercase tracking-widest text-xs">{isRTL ? "قائمة المتطلبات" : "Requirements List"}</h3>
              {requirements.length > 0 && <Button variant="ghost" size="sm" onClick={handleClearAll} className="text-red-500 hover:text-red-600 font-bold gap-1 text-[10px]"><Trash2 size={12} /> {isRTL ? "مسح القائمة" : "Clear All"}</Button>}
            </div>
            <RequirementTable isRTL={isRTL} requirements={requirements} isGenerating={isGenerating} onGenerate={generateSchedule} onDelete={handleDeleteRequirement} getEmployeeName={getEmployeeName} getSubjectName={getSubjectName} getClassName={getClassName} />
          </div>
        </div>
        <div className="lg:col-span-4 space-y-8">
          {stats && <GenerationStatsCard isRTL={isRTL} stats={stats} onApply={() => { setAssignments(stats.assignments); showSuccess(isRTL ? "تم تطبيق الجدول" : "Schedule applied"); }} />}
          {stats?.unplaced.length > 0 && <UnplacedLessonsCard isRTL={isRTL} unplacedLessons={stats.unplaced} getEmployeeName={getEmployeeName} getSubjectName={getSubjectName} getClassName={getClassName} />}
          <GeneratorRulesCard isRTL={isRTL} classes={classes} rules={rules} setRules={setRules} />
        </div>
      </div>
    </div>
  );
};

export default AutoGenerator;