"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { 
  Wand2, AlertCircle, CheckCircle2, Info, 
  Settings2, LayoutGrid, ListChecks, History,
  Sparkles, ShieldCheck, Timer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { showSuccess, showError } from "../utils/toast";
import RequirementForm from "../components/auto-generator/RequirementForm";
import RequirementTable from "../components/auto-generator/RequirementTable";
import GeneratorRulesCard from "../components/auto-generator/GeneratorRulesCard";
import GenerationStatsCard from "../components/auto-generator/GenerationStatsCard";
import UnplacedLessonsCard from "../components/auto-generator/UnplacedLessonsCard";
import { DAYS, PERIODS, PERIOD_MAP } from "../constants/schedule";
import { PeriodPart } from "@/types";

const AutoGenerator = () => {
  const { 
    isRTL, 
    subjects, 
    employees, 
    classes, 
    rooms,
    assignments, 
    setAssignments,
    teacherConstraints = [],
    classConstraints = []
  } = useApp();

  const [requirements, setRequirements] = useState<any[]>(() => {
    const saved = localStorage.getItem("auto_generator_requirements");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [newReq, setNewReq] = useState({
    employeeId: "",
    subjectId: "",
    classId: "",
    room: "",
    count: 1
  });

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

  const saveRequirements = (newReqs: any[]) => {
    setRequirements(newReqs);
    localStorage.setItem("auto_generator_requirements", JSON.stringify(newReqs));
    // تنبيه المكونات الأخرى (مثل لوحة الحصص المتبقية) بوجود تغيير
    window.dispatchEvent(new Event("storage"));
  };

  const handleAddRequirement = () => {
    if (!newReq.employeeId || !newReq.subjectId || !newReq.classId) {
      showError(isRTL ? "يرجى اختيار الأستاذ والمادة والفوج" : "Please select teacher, subject and class");
      return;
    }
    saveRequirements([...requirements, { ...newReq, id: Math.random().toString(36).substr(2, 9) }]);
    setNewReq({ ...newReq, count: 1 }); // إعادة تعيين العدد فقط للاستمرارية
    showSuccess(isRTL ? "تم إضافة المتطلب" : "Requirement added");
  };

  const handleDeleteRequirement = (id: string) => {
    saveRequirements(requirements.filter(r => r.id !== id));
  };

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

    // قيود الأستاذ
    const tConstraint = teacherConstraints.find(c => c.employeeId === req.employeeId && c.day === day && c.period === period);
    if (tConstraint && !tConstraint.isAvailable) return false;

    // قيود الفوج
    const cConstraint = classConstraints.find(c => c.classId === req.classId && c.day === day && c.period === period);
    if (cConstraint && !cConstraint.isAvailable) return false;

    // التعارضات المباشرة
    if (currentAsgns.some(a => a.day === day && a.period === period && a.employeeId === req.employeeId)) return false;
    if (currentAsgns.some(a => a.day === day && a.period === period && a.classId === req.classId)) return false;
    if (req.room && currentAsgns.some(a => a.day === day && a.period === period && a.room === req.room)) return false;

    // حدود الساعات
    if (currentAsgns.filter(a => a.day === day && a.classId === req.classId).length >= rules.maxClassHoursPerDay) return false;
    if (currentAsgns.filter(a => a.day === day && a.employeeId === req.employeeId).length >= rules.maxTeacherHoursPerDay) return false;

    // الحصص المتتالية
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

    // تفضيل الالتصاق لتقليل الفجوات
    const isAdjacent = currentAsgns.some(a => a.day === day && (a.employeeId === req.employeeId || a.classId === req.classId) && Math.abs(parseInt(a.period) - pNum) === 1);
    if (isAdjacent) score += 100;

    // تفضيل الصباح
    if (pNum <= 4) score += 20;

    // موازنة الأيام
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
      
      // ترتيب المتطلبات حسب الصعوبة
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
                if (score > highestScore) {
                  highestScore = score;
                  bestDay = day;
                  bestPeriod = period;
                }
              }
            }
          }

          if (bestDay !== -1) {
            currentAssignments.push({ id: Math.random().toString(36).substr(2, 9), employeeId: req.employeeId, subjectId: req.subjectId, classId: req.classId, room: req.room || "", department: "", day: bestDay, period: bestPeriod });
            placedCount++;
          } else {
            unplaced.push(req);
          }
        }
      }

      if (placedCount > maxPlaced) {
        maxPlaced = placedCount;
        bestResult = {
          assignments: currentAssignments,
          unplaced: Array.from(new Set(unplaced)),
          successRate: Math.round((placedCount / targetReqs.reduce((s, r) => s + r.count, 0)) * 100),
          total: targetReqs.reduce((s, r) => s + r.count, 0),
          placed: placedCount
        };
      }
      if (bestResult.successRate === 100) break;
      await new Promise(r => setTimeout(r, 10));
    }

    setStats(bestResult);
    setIsGenerating(false);
    setProgress(100);
    showSuccess(isRTL ? `اكتمل التوليد بنسبة ${bestResult.successRate}%` : `Generation completed at ${bestResult.successRate}%`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[2.5rem] border border-emerald-100 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-emerald-950 flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-2xl"><Wand2 className="text-emerald-600" size={28} /></div>
            {isRTL ? "المولد التلقائي الذكي" : "Smart Auto Generator"}
          </h1>
          <p className="text-slate-500 font-medium px-1">
            {isRTL ? "قم بإعداد متطلباتك ودع الذكاء الاصطناعي يبني جدولك المثالي" : "Set your requirements and let AI build your perfect schedule"}
          </p>
        </div>
        <Button 
          onClick={generateSchedule}
          disabled={isGenerating || requirements.length === 0}
          className="h-14 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-lg gap-3 shadow-lg shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50"
        >
          {isGenerating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles size={20} className="fill-white" />}
          {isGenerating ? (isRTL ? "جاري التوليد..." : "Generating...") : (isRTL ? "توليد الجدول الآن" : "Generate Now")}
        </Button>
      </div>

      {isGenerating && (
        <Card className="border-none shadow-xl bg-emerald-600 text-white rounded-[2rem] overflow-hidden">
          <CardContent className="p-8 space-y-4">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <span className="text-emerald-100 text-sm font-bold uppercase tracking-wider">{isRTL ? "جاري تحليل الاحتمالات وتجنب التعارضات..." : "Analyzing possibilities..."}</span>
                <h3 className="text-2xl font-black">{isRTL ? `نسبة الإنجاز: ${progress}%` : `Progress: ${progress}%`}</h3>
              </div>
              <Timer className="text-emerald-400 animate-pulse" size={40} />
            </div>
            <Progress value={progress} className="h-3 bg-white/20" />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <RequirementForm 
            isRTL={isRTL} employees={employees} subjects={subjects} classes={classes} rooms={rooms}
            newReq={newReq} setNewReq={setNewReq} onAdd={handleAddRequirement} 
          />
          <RequirementTable 
            isRTL={isRTL} requirements={requirements} isGenerating={isGenerating}
            onGenerate={generateSchedule} onDelete={handleDeleteRequirement}
            getEmployeeName={getEmployeeName} getSubjectName={getSubjectName} getClassName={getClassName}
          />
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