"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { 
  Wand2, AlertCircle, CheckCircle2, Info, 
  Settings2, LayoutGrid, ListChecks, History,
  Sparkles, ShieldCheck, Timer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { showSuccess, showError } from "../utils/toast";
import RequirementForm from "../components/generator/RequirementForm";
import RequirementTable from "../components/generator/RequirementTable";
import GeneratorRulesCard from "../components/generator/GeneratorRulesCard";
import GenerationStatsCard from "../components/generator/GenerationStatsCard";
import UnplacedLessonsCard from "../components/generator/UnplacedLessonsCard";
import { DAYS, PERIODS } from "../constants/schedule";

const AutoGenerator = () => {
  const { isRTL, subjects, employees, classes, assignments, setAssignments } = useApp();
  const [requirements, setRequirements] = useState<any[]>(() => {
    const saved = localStorage.getItem("auto_generator_requirements");
    return saved ? JSON.parse(saved) : [];
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<any>(null);

  // قواعد التوليد
  const [rules, setRules] = useState({
    maxLessonsPerDay: 6,
    preventGaps: true,
    allowSingleLessons: false,
    preferMornings: true,
    balanceTeacherLoad: true
  });

  const saveRequirements = (newReqs: any[]) => {
    setRequirements(newReqs);
    localStorage.setItem("auto_generator_requirements", JSON.stringify(newReqs));
  };

  const handleAddRequirement = (req: any) => {
    saveRequirements([...requirements, { ...req, id: Math.random().toString(36).substr(2, 9) }]);
  };

  const handleDeleteRequirement = (id: string) => {
    saveRequirements(requirements.filter(r => r.id !== id));
  };

  /**
   * الخوارزمية المحسنة: Heuristic Greedy with Weighted Slots
   */
  const generateSchedule = async () => {
    setIsGenerating(true);
    setProgress(0);
    setStats(null);

    // محاكاة تأخير بسيط للواجهة
    await new Promise(r => setTimeout(r, 500));

    let bestResult: any = null;
    let minConflicts = Infinity;
    const iterations = 50; // تقليل الدورات لأن كل دورة أصبحت أذكى

    for (let i = 0; i < iterations; i++) {
      setProgress(Math.round((i / iterations) * 100));
      
      // 1. ترتيب المتطلبات حسب الصعوبة (الأستاذ الأكثر انشغالاً أولاً)
      const teacherLoad: Record<string, number> = {};
      requirements.forEach(r => {
        teacherLoad[r.employeeId] = (teacherLoad[r.employeeId] || 0) + r.count;
      });

      const sortedReqs = [...requirements].sort((a, b) => {
        const loadA = teacherLoad[a.employeeId] || 0;
        const loadB = teacherLoad[b.employeeId] || 0;
        return loadB - loadA || b.count - a.count;
      });

      const currentAssignments: any[] = [];
      const unplaced: any[] = [];

      // 2. توزيع المتطلبات
      for (const req of sortedReqs) {
        for (let c = 0; c < req.count; c++) {
          const bestSlot = findHeuristicBestSlot(req, currentAssignments);
          if (bestSlot) {
            currentAssignments.push({
              id: Math.random().toString(36).substr(2, 9),
              ...req,
              day: bestSlot.day,
              period: bestSlot.period
            });
          } else {
            unplaced.push({ ...req, lessonIndex: c });
          }
        }
      }

      const conflictCount = calculateConflicts(currentAssignments) + (unplaced.length * 10);
      
      if (conflictCount < minConflicts) {
        minConflicts = conflictCount;
        bestResult = { assignments: currentAssignments, unplaced, conflictCount };
      }

      if (minConflicts === 0) break;
      await new Promise(r => setTimeout(r, 10)); // منع تجمد المتصفح
    }

    setAssignments(bestResult.assignments);
    setStats(bestResult);
    setIsGenerating(false);
    setProgress(100);

    if (bestResult.unplaced.length === 0 && bestResult.conflictCount === 0) {
      showSuccess(isRTL ? "تم توليد الجدول بنجاح تام!" : "Schedule generated perfectly!");
    } else {
      showError(isRTL ? "تم التوليد مع وجود بعض التحديات." : "Generated with some unplaced lessons.");
    }
  };

  /**
   * تقييم الخانة بناءً على معايير الجودة (Heuristics)
   */
  const findHeuristicBestSlot = (req: any, currentAsgns: any[]) => {
    let bestSlot = null;
    let highestScore = -Infinity;

    // تجميع الخانات الممكنة وتقييمها
    const possibleSlots = [];
    for (const day of DAYS) {
      for (const period of PERIODS) {
        // فحص المقيدات الصارمة (Hard Constraints)
        if (hasHardConflict(req, day, period, currentAsgns)) continue;

        let score = Math.random() * 10; // قاعدة عشوائية لكسر التعادل

        // 1. تفضيل الصباح (Soft Constraint)
        if (rules.preferMornings && parseInt(period) <= 4) score += 20;

        // 2. تجنب الفجوات (Gap Prevention)
        if (rules.preventGaps) {
          const hasAdjacent = currentAsgns.some(a => 
            a.day === day && a.classId === req.classId && 
            (parseInt(a.period) === parseInt(period) - 1 || parseInt(a.period) === parseInt(period) + 1)
          );
          if (hasAdjacent) score += 30;
        }

        // 3. موازنة حمل الأستاذ (توزيع الحصص على الأيام)
        const dayCountForTeacher = currentAsgns.filter(a => a.day === day && a.employeeId === req.employeeId).length;
        score -= (dayCountForTeacher * 15);

        // 4. مقيد "الحصة الوحيدة"
        if (!rules.allowSingleLessons) {
           // يفضل أن تكون بجانب حصة أخرى من نفس المادة أو لنفس الفوج
        }

        if (score > highestScore) {
          highestScore = score;
          bestSlot = { day, period };
        }
      }
    }

    return bestSlot;
  };

  const hasHardConflict = (req: any, day: number, period: string, currentAsgns: any[]) => {
    // 1. تعارض الأستاذ (هل يدرس في مكان آخر في نفس الوقت؟)
    const teacherBusy = currentAsgns.some(a => a.day === day && a.period === period && a.employeeId === req.employeeId);
    if (teacherBusy) return true;

    // 2. تعارض الفوج (هل لديهم حصة أخرى؟)
    const classBusy = currentAsgns.some(a => a.day === day && a.period === period && a.classId === req.classId);
    if (classBusy) return true;

    // 3. الحد الأقصى للحصص في اليوم للفوج
    const classDayCount = currentAsgns.filter(a => a.day === day && a.classId === req.classId).length;
    if (classDayCount >= rules.maxLessonsPerDay) return true;

    return false;
  };

  const calculateConflicts = (asgns: any[]) => {
    let conflicts = 0;
    asgns.forEach((a, i) => {
      for (let j = i + 1; j < asgns.length; j++) {
        const b = asgns[j];
        if (a.day === b.day && a.period === b.period) {
          if (a.employeeId === b.employeeId || a.classId === b.classId) conflicts++;
        }
      }
    });
    return conflicts;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[2.5rem] border border-emerald-100 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-emerald-950 flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-2xl">
              <Wand2 className="text-emerald-600" size={28} />
            </div>
            {isRTL ? "المولد التلقائي الذكي" : "Smart Auto Generator"}
          </h1>
          <p className="text-slate-500 font-medium px-1">
            {isRTL ? "قم بإعداد متطلباتك ودع الذكاء الاصطناعي يبني جدولك المثالي" : "Set your requirements and let AI build your perfect schedule"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={generateSchedule}
            disabled={isGenerating || requirements.length === 0}
            className="h-14 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-lg gap-3 shadow-lg shadow-emerald-200 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {isRTL ? "جاري التوليد..." : "Generating..."}
              </>
            ) : (
              <>
                <Sparkles size={20} className="fill-white" />
                {isRTL ? "توليد الجدول الآن" : "Generate Now"}
              </>
            )}
          </Button>
        </div>
      </div>

      {isGenerating && (
        <Card className="border-none shadow-xl bg-emerald-600 text-white rounded-[2rem] overflow-hidden">
          <CardContent className="p-8 space-y-4">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <span className="text-emerald-100 text-sm font-bold uppercase tracking-wider">
                  {isRTL ? "جاري تحليل مليارات الاحتمالات..." : "Analyzing billions of possibilities..."}
                </span>
                <h3 className="text-2xl font-black">
                  {isRTL ? `نسبة الإنجاز: ${progress}%` : `Progress: ${progress}%`}
                </h3>
              </div>
              <Timer className="text-emerald-400 animate-pulse" size={40} />
            </div>
            <Progress value={progress} className="h-3 bg-white/20" />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Config & Requirements */}
        <div className="lg:col-span-8 space-y-8">
          <RequirementForm 
            isRTL={isRTL} 
            subjects={subjects} 
            employees={employees} 
            classes={classes} 
            onAdd={handleAddRequirement} 
          />

          <RequirementTable 
            isRTL={isRTL} 
            requirements={requirements} 
            onDelete={handleDeleteRequirement}
            subjects={subjects}
            employees={employees}
            classes={classes}
          />
        </div>

        {/* Right Column: Rules & Status */}
        <div className="lg:col-span-4 space-y-8">
          {stats && <GenerationStatsCard isRTL={isRTL} stats={stats} />}
          
          {stats?.unplaced.length > 0 && (
            <UnplacedLessonsCard 
              isRTL={isRTL} 
              unplaced={stats.unplaced}
              subjects={subjects}
              employees={employees}
              classes={classes}
            />
          )}

          <GeneratorRulesCard 
            isRTL={isRTL} 
            rules={rules} 
            setRules={setRules} 
          />

          <Card className="rounded-[2rem] border-none shadow-lg bg-blue-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black text-blue-900 flex items-center gap-2">
                <Info size={16} className="text-blue-600" />
                {isRTL ? "نصيحة تقنية" : "Pro Tip"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-blue-800/70 font-bold leading-relaxed">
                {isRTL 
                  ? "للحصول على أفضل النتائج، ابدأ بإضافة الأساتذة الذين لديهم أكبر عدد من الساعات أولاً. الخوارزمية ستحاول تلقائياً تجنب الفجوات الزمنية في جدول الطلاب." 
                  : "For best results, add teachers with the most hours first. The algorithm will automatically try to minimize gaps in student schedules."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AutoGenerator;