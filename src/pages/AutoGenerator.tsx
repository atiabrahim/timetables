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
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<any>(null);

  // قواعد التوليد المتوافقة بالكامل مع واجهة المستخدم
  const [rules, setRules] = useState({
    allowedDays: [0, 1, 2, 3, 4], // الأحد إلى الخميس افتراضياً
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
  };

  const handleAddRequirement = (req: any) => {
    saveRequirements([...requirements, { ...req, id: Math.random().toString(36).substr(2, 9) }]);
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

  /**
   * التحقق من القيود الصارمة (Hard Constraints)
   */
  const checkHardConstraints = (
    req: any, 
    day: number, 
    period: string, 
    currentAsgns: any[]
  ): boolean => {
    // 1. التحقق من الأيام والفترات المسموحة
    if (!rules.allowedDays.includes(day)) return false;
    if (!rules.allowedPeriods.includes(period)) return false;

    // 2. التحقق من تصنيف الفترة (صباح، مساء، زوال)
    const part = PERIOD_MAP[period];
    if (!rules.selectedPeriodParts.includes(part)) return false;

    // 3. التحقق من توافر الأستاذ (القيود الزمنية للأستاذ)
    const tConstraint = teacherConstraints.find(
      c => c.employeeId === req.employeeId && c.day === day && c.period === period
    );
    if (tConstraint && !tConstraint.isAvailable) return false;

    // 4. التحقق من توافر الفوج (القيود الزمنية للفوج)
    const cConstraint = classConstraints.find(
      c => c.classId === req.classId && c.day === day && c.period === period
    );
    if (cConstraint && !cConstraint.isAvailable) return false;

    // 5. تعارض الأستاذ (هل يدرس في مكان آخر في نفس الوقت؟)
    const isTeacherBusy = currentAsgns.some(
      a => a.day === day && a.period === period && a.employeeId === req.employeeId
    );
    if (isTeacherBusy) return false;

    // 6. تعارض الفوج (هل لديهم حصة أخرى؟)
    const isClassBusy = currentAsgns.some(
      a => a.day === day && a.period === period && a.classId === req.classId
    );
    if (isClassBusy) return false;

    // 7. تعارض القاعة (إذا كانت محددة)
    if (req.room) {
      const isRoomBusy = currentAsgns.some(
        a => a.day === day && a.period === period && a.room === req.room
      );
      if (isRoomBusy) return false;
    }

    // 8. الحد الأقصى لحصص الفوج في اليوم
    const classDayCount = currentAsgns.filter(
      a => a.day === day && a.classId === req.classId
    ).length;
    if (classDayCount >= rules.maxClassHoursPerDay) return false;

    // 9. الحد الأقصى لحصص الأستاذ في اليوم
    const teacherDayCount = currentAsgns.filter(
      a => a.day === day && a.employeeId === req.employeeId
    ).length;
    if (teacherDayCount >= rules.maxTeacherHoursPerDay) return false;

    // 10. الحد الأقصى للحصص المتتالية للأستاذ
    const pNum = parseInt(period);
    let consecutiveBefore = 0;
    let consecutiveAfter = 0;

    // حساب الحصص المتتالية قبل الفترة الحالية
    let checkP = pNum - 1;
    while (checkP >= 1) {
      const hasLesson = currentAsgns.some(
        a => a.day === day && a.period === checkP.toString() && a.employeeId === req.employeeId
      );
      if (hasLesson) {
        consecutiveBefore++;
        checkP--;
      } else {
        break;
      }
    }

    // حساب الحصص المتتالية بعد الفترة الحالية
    checkP = pNum + 1;
    while (checkP <= 12) {
      const hasLesson = currentAsgns.some(
        a => a.day === day && a.period === checkP.toString() && a.employeeId === req.employeeId
      );
      if (hasLesson) {
        consecutiveAfter++;
        checkP++;
      } else {
        break;
      }
    }

    if (consecutiveBefore + consecutiveAfter + 1 > rules.maxTeacherConsecutiveHours) {
      return false;
    }

    return true;
  };

  /**
   * تقييم جودة الخانة الزمنية (Heuristic Scoring)
   */
  const scoreSlot = (
    req: any, 
    day: number, 
    period: string, 
    currentAsgns: any[]
  ): number => {
    let score = 0;

    const pNum = parseInt(period);

    // 1. تجنب الفراغات للأستاذ (Avoid Teacher Gaps)
    if (rules.avoidTeacherGaps) {
      const hasAdjacentTeacher = currentAsgns.some(
        a => a.day === day && 
             a.employeeId === req.employeeId && 
             Math.abs(parseInt(a.period) - pNum) === 1
      );
      if (hasAdjacentTeacher) score += 50; // مكافأة عالية للالتصاق
    }

    // 2. تجنب الفراغات للفوج (Avoid Class Gaps)
    const hasAdjacentClass = currentAsgns.some(
      a => a.day === day && 
           a.classId === req.classId && 
           Math.abs(parseInt(a.period) - pNum) === 1
    );
    if (hasAdjacentClass) score += 40;

    // 3. تفضيل الفترات الصباحية بشكل طفيف للتوازن البيداغوجي
    if (pNum <= 4) score += 10;

    // 4. موازنة توزيع الحصص للأستاذ على مدار الأسبوع
    const teacherDayCount = currentAsgns.filter(
      a => a.day === day && a.employeeId === req.employeeId
    ).length;
    score -= (teacherDayCount * 15); // عقوبة لزيادة الحصص في نفس اليوم لتشجيع التوزيع

    // 5. عامل عشوائي طفيف لكسر التعادل والسماح باستكشاف حلول مختلفة في كل دورة
    score += Math.random() * 5;

    return score;
  };

  /**
   * خوارزمية التوليد الذكية المحسنة
   */
  const generateSchedule = async () => {
    setIsGenerating(true);
    setProgress(0);
    setStats(null);

    await new Promise(r => setTimeout(r, 400));

    let bestResult: any = null;
    let maxPlaced = -1;
    const iterations = 40;

    // تصفية المتطلبات بناءً على الفروع المحددة
    const targetReqs = requirements.filter(req => 
      rules.selectedClassIds.includes("all") || rules.selectedClassIds.includes(req.classId)
    );

    if (targetReqs.length === 0) {
      showError(isRTL ? "لا توجد متطلبات تدريس للفروع المحددة" : "No requirements for selected classes");
      setIsGenerating(false);
      return;
    }

    for (let iter = 0; i < iterations; iter++) {
      setProgress(Math.round((iter / iterations) * 100));

      // البدء بالحصص الحالية إذا تم تفعيل خيار احترام الحصص المعينة مسبقاً
      let currentAssignments = rules.respectExistingLessons ? [...assignments] : [];

      // ترتيب المتطلبات تنازلياً حسب الصعوبة (الأستاذ الأكثر انشغالاً أولاً)
      const teacherLoad: Record<string, number> = {};
      targetReqs.forEach(r => {
        teacherLoad[r.employeeId] = (teacherLoad[r.employeeId] || 0) + r.count;
      });

      const sortedReqs = [...targetReqs].sort((a, b) => {
        const loadA = teacherLoad[a.employeeId] || 0;
        const loadB = teacherLoad[b.employeeId] || 0;
        return loadB - loadA || b.count - a.count;
      });

      const unplaced: any[] = [];
      let placedCount = 0;

      for (const req of sortedReqs) {
        for (let c = 0; c < req.count; c++) {
          let bestDay = -1;
          let bestPeriod = "";
          let highestScore = -Infinity;

          // البحث عن أفضل خانة زمنية متاحة
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

          if (bestDay !== -1 && bestPeriod !== "") {
            currentAssignments.push({
              id: Math.random().toString(36).substr(2, 9),
              employeeId: req.employeeId,
              subjectId: req.subjectId,
              classId: req.classId,
              room: req.room || "",
              department: "",
              day: bestDay,
              period: bestPeriod
            });
            placedCount++;
          } else {
            unplaced.push(req);
          }
        }
      }

      // التحقق من شرط "الساعة المنفردة" للأستاذ إذا تم تفعيله
      if (!rules.allowSingleHour) {
        // تصفية الحصص التي تم توليدها في هذه الدورة فقط (باستثناء الحصص القديمة)
        const newlyPlaced = currentAssignments.filter(a => 
          !assignments.some(old => old.id === a.id)
        );

        // التحقق من وجود أساتذة لديهم ساعة واحدة فقط في يوم حضورهم
        employees.forEach(emp => {
          rules.allowedDays.forEach(day => {
            const dayLessons = newlyPlaced.filter(a => a.employeeId === emp.id && a.day === day);
            if (dayLessons.length === 1) {
              // حذف هذه الحصة المنفردة وإعادتها لقائمة غير المجدولة لضمان جودة الجدول
              const singleLesson = dayLessons[0];
              currentAssignments = currentAssignments.filter(a => a.id !== singleLesson.id);
              unplaced.push(targetReqs.find(r => r.employeeId === emp.id && r.subjectId === singleLesson.subjectId && r.classId === singleLesson.classId));
              placedCount--;
            }
          });
        });
      }

      if (placedCount > maxPlaced) {
        maxPlaced = placedCount;
        bestResult = {
          assignments: currentAssignments,
          unplaced: Array.from(new Set(unplaced)), // إزالة التكرار
          successRate: Math.round((placedCount / targetReqs.reduce((sum, r) => sum + r.count, 0)) * 100),
          total: targetReqs.reduce((sum, r) => sum + r.count, 0),
          placed: placedCount
        };
      }

      if (bestResult.successRate === 100) break;
      await new Promise(r => setTimeout(r, 15));
    }

    setStats(bestResult);
    setIsGenerating(false);
    setProgress(100);

    if (bestResult.successRate === 100) {
      showSuccess(isRTL ? "تم توليد الجدول بنجاح تام وبدون أي تعارضات!" : "Schedule generated perfectly with 100% success!");
    } else {
      showSuccess(isRTL ? `تم التوليد بنسبة نجاح ${bestResult.successRate}%` : `Generated with ${bestResult.successRate}% success rate`);
    }
  };

  const handleApplySchedule = () => {
    if (!stats) return;
    setAssignments(stats.assignments);
    showSuccess(isRTL ? "تم تطبيق الجدول المولد على النظام بنجاح" : "Generated schedule applied successfully");
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
                  {isRTL ? "جاري تحليل مليارات الاحتمالات وتجنب التعارضات..." : "Analyzing billions of possibilities..."}
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
            rooms={rooms}
            newReq={{
              employeeId: "",
              subjectId: "",
              classId: "",
              room: "",
              count: 1
            }}
            setNewReq={() => {}}
            onAdd={handleAddRequirement} 
          />

          <RequirementTable 
            isRTL={isRTL} 
            requirements={requirements} 
            isGenerating={isGenerating}
            onGenerate={generateSchedule}
            onDelete={handleDeleteRequirement}
            getEmployeeName={getEmployeeName}
            getSubjectName={getSubjectName}
            getClassName={getClassName}
          />
        </div>

        {/* Right Column: Rules & Status */}
        <div className="lg:col-span-4 space-y-8">
          {stats && (
            <GenerationStatsCard 
              isRTL={isRTL} 
              stats={stats} 
              onApply={handleApplySchedule} 
            />
          )}
          
          {stats?.unplaced.length > 0 && (
            <UnplacedLessonsCard 
              isRTL={isRTL} 
              unplacedLessons={stats.unplaced}
              getEmployeeName={getEmployeeName}
              getSubjectName={getSubjectName}
              getClassName={getClassName}
            />
          )}

          <GeneratorRulesCard 
            isRTL={isRTL} 
            classes={classes}
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