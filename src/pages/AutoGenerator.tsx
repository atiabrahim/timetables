"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { showSuccess, showError } from "../utils/toast";
import PageHeader from "../components/shared/PageHeader";
import { DAYS, PERIODS } from "../constants/schedule";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PeriodPart } from "@/types";

import RequirementForm from "../components/auto-generator/RequirementForm";
import RequirementTable from "../components/auto-generator/RequirementTable";
import GenerationStatsCard from "../components/auto-generator/GenerationStatsCard";
import UnplacedLessonsCard from "../components/auto-generator/UnplacedLessonsCard";
import GeneratorRulesCard from "../components/auto-generator/GeneratorRulesCard";

interface Requirement {
  id: string;
  employeeId: string;
  subjectId: string;
  classId: string;
  room: string;
  count: number;
}

interface GeneratorRules {
  allowedDays: number[];
  allowedPeriods: string[];
  maxTeacherHoursPerDay: number;
  maxTeacherConsecutiveHours: number;
  maxClassHoursPerDay: number;
  avoidTeacherGaps: boolean;
  selectedClassIds: string[];
  respectExistingLessons: boolean;
  selectedPeriodParts: PeriodPart[];
  allowSingleHour: boolean;
}

interface CandidateSchedule {
  assignments: any[];
  unplaced: any[];
  conflictCount: number;
  placed: number;
}

const shuffle = <T,>(items: T[]): T[] => {
  return [...items].sort(() => Math.random() - 0.5);
};

const AutoGenerator = () => {
  const { 
    employees, classes, subjects, rooms, assignments, setAssignments, isRTL, periodConfigs 
  } = useApp();

  const [requirements, setRequirements] = useState<Requirement[]>(() => {
    const saved = localStorage.getItem("auto_generator_requirements");
    return saved ? JSON.parse(saved) : [];
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAssignments, setGeneratedAssignments] = useState<any[]>([]);
  const [unplacedLessons, setUnplacedLessons] = useState<any[]>([]);
  const [generationStats, setGenerationStats] = useState<{ successRate: number; total: number; placed: number } | null>(null);

  const [rules, setRules] = useState<GeneratorRules>(() => {
    const saved = localStorage.getItem("auto_generator_rules");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          allowSingleHour: parsed.allowSingleHour ?? true,
        };
      } catch (error) {
        console.error("Failed to parse generator rules", error);
      }
    }

    return {
      allowedDays: [0, 1, 2, 3, 4],
      allowedPeriods: ["1", "2", "3", "4", "5", "6", "7", "8"],
      maxTeacherHoursPerDay: 6,
      maxTeacherConsecutiveHours: 3,
      maxClassHoursPerDay: 6,
      avoidTeacherGaps: false,
      selectedClassIds: ["all"],
      respectExistingLessons: true,
      selectedPeriodParts: ["Morning", "Afternoon", "Evening"],
      allowSingleHour: true,
    };
  });

  const [newReq, setNewReq] = useState({
    employeeId: "",
    subjectId: "",
    classId: "",
    room: "",
    count: 1,
  });

  useEffect(() => {
    localStorage.setItem("auto_generator_rules", JSON.stringify(rules));
  }, [rules]);

  useEffect(() => {
    localStorage.setItem("auto_generator_requirements", JSON.stringify(requirements));
  }, [requirements]);

  const handleExtractFromCurrent = () => {
    if (assignments.length === 0) {
      showError(isRTL ? "لا توجد حصص في الجدول الحالي لاستخراجها" : "No lessons in current schedule to extract");
      return;
    }

    const targetAssignments = rules.selectedClassIds.includes("all")
      ? assignments
      : assignments.filter(a => rules.selectedClassIds.includes(a.classId));

    if (targetAssignments.length === 0) {
      showError(isRTL ? "لا توجد حصص للفروع المحددة لاستخراجها" : "No lessons found for the selected branches to extract");
      return;
    }

    const groups: Record<string, { req: Omit<Requirement, "id" | "count">; count: number }> = {};

    targetAssignments.forEach(asgn => {
      const key = `${asgn.employeeId}-${asgn.subjectId}-${asgn.classId}-${asgn.room || ""}`;
      if (!groups[key]) {
        groups[key] = {
          req: {
            employeeId: asgn.employeeId,
            subjectId: asgn.subjectId,
            classId: asgn.classId,
            room: asgn.room || "",
          },
          count: 0,
        };
      }
      groups[key].count++;
    });

    const extracted: Requirement[] = Object.entries(groups).map(([, val]) => ({
      id: `req-${Math.random().toString(36).slice(2, 11)}`,
      ...val.req,
      count: val.count,
    }));

    setRequirements(extracted);
    showSuccess(isRTL ? `تم استخراج ${extracted.length} متطلبات تدريس بنجاح` : `Extracted ${extracted.length} teaching requirements`);
  };

  const handleAddRequirement = () => {
    if (!newReq.employeeId || !newReq.subjectId || !newReq.classId) {
      showError(isRTL ? "يرجى ملء الحقول الأساسية" : "Please fill required fields");
      return;
    }

    if (!rules.selectedClassIds.includes("all") && !rules.selectedClassIds.includes(newReq.classId)) {
      showError(isRTL ? "الفوج المحدد ليس من ضمن الفروع المستهدفة" : "The selected class is not in the target branches list");
      return;
    }

    const id = `req-${Math.random().toString(36).slice(2, 11)}`;
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

  const checkConsecutiveHours = (
    teacherId: string,
    day: number,
    newPeriod: string,
    currentAssignments: any[],
    maxConsecutive: number,
  ): boolean => {
    const periods = currentAssignments
      .filter(a => a.employeeId === teacherId && a.day === day)
      .map(a => parseInt(a.period, 10));

    periods.push(parseInt(newPeriod, 10));
    periods.sort((a, b) => a - b);

    let maxSeq = 0;
    let currentSeq = 0;
    let lastVal = -99;

    for (const period of periods) {
      if (period === lastVal + 1) {
        currentSeq++;
      } else {
        currentSeq = 1;
      }
      maxSeq = Math.max(maxSeq, currentSeq);
      lastVal = period;
    }

    return maxSeq <= maxConsecutive;
  };

  const checkTeacherGaps = (
    teacherId: string,
    day: number,
    newPeriod: string,
    currentAssignments: any[],
  ): boolean => {
    const existingPeriods = currentAssignments
      .filter(a => a.employeeId === teacherId && a.day === day)
      .map(a => parseInt(a.period, 10));

    if (existingPeriods.length === 0) return true;

    const pNum = parseInt(newPeriod, 10);
    return existingPeriods.includes(pNum - 1) || existingPeriods.includes(pNum + 1);
  };

  const hasAdjacentSlotForTeacher = (
    teacherId: string,
    day: number,
    period: string,
    activeSlots: { day: number; period: string }[],
    currentAssignments: any[],
  ): boolean => {
    const pNum = parseInt(period, 10);

    return activeSlots.some(slot => {
      const slotPeriod = parseInt(slot.period, 10);
      if (slot.day !== day || Math.abs(slotPeriod - pNum) !== 1) return false;

      return !currentAssignments.some(a => 
        a.employeeId === teacherId && a.day === slot.day && a.period === slot.period
      );
    });
  };

  const calculateConflicts = (assignmentList: any[]) => {
    const teacherMap: Record<string, any[]> = {};
    const roomMap: Record<string, any[]> = {};

    assignmentList.forEach(a => {
      if (a.employeeId) {
        teacherMap[a.employeeId] = teacherMap[a.employeeId] || [];
        teacherMap[a.employeeId].push(a);
      }

      if (a.room) {
        roomMap[a.room] = roomMap[a.room] || [];
        roomMap[a.room].push(a);
      }
    });

    const teacherConflicts = Object.values(teacherMap)
      .filter(list => list.length > 1)
      .map(list => ({
        day: list[0].day,
        period: list[0].period,
        employeeId: list[0].employeeId,
        assignments: list,
      }));

    const roomConflicts = Object.values(roomMap)
      .filter(list => list.length > 1)
      .map(list => ({
        day: list[0].day,
        period: list[0].period,
        room: list[0].room,
        assignments: list,
      }));

    return {
      teacherConflicts,
      roomConflicts,
      total: teacherConflicts.length + roomConflicts.length,
    };
  };

  const enforceNoSingleHourRule = (
    currentAssignments: any[],
    unplaced: any[],
    baseAssignmentIds: Set<string>,
  ) => {
    let changed = true;

    while (changed) {
      changed = false;

      const counts: Record<string, number> = {};
      currentAssignments.forEach(a => {
        const key = `${a.employeeId}-${a.day}`;
        counts[key] = (counts[key] || 0) + 1;
      });

      const violationIndex = currentAssignments.findIndex(a => {
        if (baseAssignmentIds.has(a.id)) return false;
        return counts[`${a.employeeId}-${a.day}`] === 1;
      });

      if (violationIndex !== -1) {
        const removed = currentAssignments.splice(violationIndex, 1)[0];
        if (!unplaced.some(l => l.id === removed.id)) {
          unplaced.push(removed);
        }
        changed = true;
      }
    }
  };

  const canPlaceLesson = (
    lesson: any,
    slot: { day: number; period: string },
    currentAssignments: any[],
    activeSlots: { day: number; period: string }[],
  ): boolean => {
    const teacherBusy = currentAssignments.some(a => 
      a.employeeId === lesson.employeeId && a.day === slot.day && a.period === slot.period
    );
    if (teacherBusy) return false;

    const classBusy = currentAssignments.some(a => 
      a.classId === lesson.classId && a.day === slot.day && a.period === slot.period
    );
    if (classBusy) return false;

    if (lesson.room && currentAssignments.some(a => 
      a.room === lesson.room && a.day === slot.day && a.period === slot.period
    )) {
      return false;
    }

    const teacherHours = currentAssignments.filter(a => 
      a.employeeId === lesson.employeeId && a.day === slot.day
    ).length;

    if (teacherHours >= rules.maxTeacherHoursPerDay) return false;

    const classHours = currentAssignments.filter(a => 
      a.classId === lesson.classId && a.day === slot.day
    ).length;

    if (classHours >= rules.maxClassHoursPerDay) return false;

    const consecutiveValid = checkConsecutiveHours(
      lesson.employeeId,
      slot.day,
      slot.period,
      currentAssignments,
      rules.maxTeacherConsecutiveHours,
    );

    if (!consecutiveValid) return false;

    if (rules.avoidTeacherGaps) {
      const gapValid = checkTeacherGaps(lesson.employeeId, slot.day, slot.period, currentAssignments);
      if (!gapValid) return false;
    }

    if (!rules.allowSingleHour && teacherHours === 0) {
      const hasAdjacent = hasAdjacentSlotForTeacher(
        lesson.employeeId,
        slot.day,
        slot.period,
        activeSlots,
        currentAssignments,
      );

      if (!hasAdjacent) return false;
    }

    return true;
  };

  const isBetterCandidate = (candidate: CandidateSchedule, best: CandidateSchedule | null): boolean => {
    if (!best) return true;
    if (candidate.conflictCount !== best.conflictCount) return candidate.conflictCount < best.conflictCount;
    if (candidate.placed !== best.placed) return candidate.placed > best.placed;
    return candidate.unplaced.length < best.unplaced.length;
  };

  const handleGenerate = () => {
    const activeRequirements = rules.selectedClassIds.includes("all")
      ? requirements
      : requirements.filter(r => rules.selectedClassIds.includes(r.classId));

    if (activeRequirements.length === 0) {
      showError(isRTL ? "لا توجد متطلبات تدريس للفروع المحددة" : "No teaching requirements found for the selected branches");
      return;
    }

    if (rules.allowedDays.length === 0) {
      showError(isRTL ? "يرجى تفعيل يوم واحد على الأقل في القواعد" : "Please select at least one active day");
      return;
    }

    if (rules.allowedPeriods.length === 0) {
      showError(isRTL ? "يرجى تفعيل حصة واحدة على الأقل في القواعد" : "Please select at least one active period");
      return;
    }

    if (rules.selectedPeriodParts.length === 0) {
      showError(isRTL ? "يرجى تفعيل فترة واحدة على الأقل" : "Please select at least one active period part");
      return;
    }

    setIsGenerating(true);

    setTimeout(() => {
      const lessonsToPlace = activeRequirements.flatMap(req => {
        const count = Math.max(1, Math.min(12, Number(req.count) || 1));
        return Array.from({ length: count }, () => ({
          id: `gen-${Math.random().toString(36).slice(2, 11)}`,
          employeeId: req.employeeId,
          subjectId: req.subjectId,
          classId: req.classId,
          room: req.room,
        }));
      });

      const activeSlots: { day: number; period: string }[] = [];

      DAYS.forEach(day => {
        if (!rules.allowedDays.includes(day.id)) return;

        PERIODS.forEach(period => {
          if (!rules.allowedPeriods.includes(period)) return;

          const pNum = parseInt(period, 10);
          let part: PeriodPart = "Morning";
          if (pNum >= 5 && pNum <= 7) part = "Afternoon";
          if (pNum >= 8) part = "Evening";

          if (!rules.selectedPeriodParts.includes(part)) return;

          const config = periodConfigs.find(c => c.day === day.id && c.period === period);
          if (config?.isActive !== false) {
            activeSlots.push({ day: day.id, period });
          }
        });
      });

      if (activeSlots.length === 0) {
        showError(isRTL ? "لا توجد حصص زمنية مفعلة تطابق القواعد المحددة" : "No active periods match the specified rules");
        setIsGenerating(false);
        return;
      }

      const baseAssignments = rules.respectExistingLessons ? [...assignments] : [];
      const baseAssignmentIds = new Set(baseAssignments.map(a => a.id));

      let best: CandidateSchedule | null = null;
      const attempts = 120;

      for (let run = 0; run < attempts; run++) {
        const currentAssignments = [...baseAssignments];
        const unplaced: any[] = [];
        const shuffledLessons = shuffle(lessonsToPlace);
        const shuffledSlots = shuffle(activeSlots);

        for (const lesson of shuffledLessons) {
          let placed = false;

          for (const slot of shuffledSlots) {
            if (!canPlaceLesson(lesson, slot, currentAssignments, activeSlots)) {
              continue;
            }

            currentAssignments.push({
              ...lesson,
              day: slot.day,
              period: slot.period,
            });
            placed = true;
            break;
          }

          if (!placed) {
            unplaced.push(lesson);
          }
        }

        if (!rules.allowSingleHour) {
          enforceNoSingleHourRule(currentAssignments, unplaced, baseAssignmentIds);
        }

        const { total: conflictCount } = calculateConflicts(currentAssignments);
        const placed = currentAssignments.length - baseAssignments.length;

        const candidate: CandidateSchedule = {
          assignments: currentAssignments.slice(baseAssignments.length),
          unplaced,
          conflictCount,
          placed,
        };

        if (isBetterCandidate(candidate, best)) {
          best = candidate;
        }

        if (conflictCount === 0 && placed === lessonsToPlace.length) {
          break;
        }
      }

      if (!best || best.assignments.length === 0) {
        showError(isRTL ? "لم يتم العثور على جدول مناسب" : "No suitable schedule found");
        setIsGenerating(false);
        return;
      }

      setGeneratedAssignments(best.assignments);
      setUnplacedLessons(best.unplaced);

      const total = lessonsToPlace.length;
      const placed = best.placed;
      const successRate = total > 0 ? Math.round((placed / total) * 100) : 0;

      setGenerationStats({
        successRate,
        total,
        placed,
      });

      if (best.conflictCount === 0) {
        showSuccess(isRTL ? "تم توليد جدول جديد بأقل عدد من التعارضات" : "Generated a new schedule with the lowest conflicts");
      } else {
        showError(isRTL ? `تم توليد جدول جديد بأقل تعارضات ممكنة (${best.conflictCount})` : `Generated a new schedule with the lowest conflicts (${best.conflictCount})`);
      }

      setIsGenerating(false);
    }, 600);
  };

  const handleApplyToSystem = () => {
    if (generatedAssignments.length === 0) return;

    const generatedIds = new Set(generatedAssignments.map(a => a.id));
    const assignmentsWithoutOldGenerated = assignments.filter(a => !generatedIds.has(a.id));

    let finalAssignments: any[] = [];

    if (rules.respectExistingLessons) {
      finalAssignments = [...assignmentsWithoutOldGenerated, ...generatedAssignments];
    } else if (rules.selectedClassIds.includes("all")) {
      finalAssignments = generatedAssignments;
    } else {
      const nonSelectedAssignments = assignmentsWithoutOldGenerated.filter(a => !rules.selectedClassIds.includes(a.classId));
      finalAssignments = [...nonSelectedAssignments, ...generatedAssignments];
    }

    setAssignments(finalAssignments);
    showSuccess(isRTL ? "تم تطبيق الجدول المولد على النظام بنجاح" : "Generated schedule applied successfully");
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
        <div className="xl:col-span-2 space-y-6">
          <RequirementForm
            isRTL={isRTL}
            employees={employees}
            subjects={subjects}
            classes={classes}
            rooms={rooms}
            newReq={newReq}
            setNewReq={setNewReq}
            onAdd={handleAddRequirement}
          />

          <GeneratorRulesCard
            isRTL={isRTL}
            classes={classes}
            rules={rules}
            setRules={setRules}
          />

          <RequirementTable
            isRTL={isRTL}
            requirements={requirements}
            isGenerating={isGenerating}
            onGenerate={handleGenerate}
            onDelete={handleDeleteRequirement}
            getEmployeeName={getEmployeeName}
            getSubjectName={getSubjectName}
            getClassName={getClassName}
          />
        </div>

        <div className="space-y-6">
          {generationStats && (
            <GenerationStatsCard
              isRTL={isRTL}
              stats={generationStats}
              onApply={handleApplyToSystem}
            />
          )}

          {unplacedLessons.length > 0 && (
            <UnplacedLessonsCard
              isRTL={isRTL}
              unplacedLessons={unplacedLessons}
              getEmployeeName={getEmployeeName}
              getSubjectName={getSubjectName}
              getClassName={getClassName}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AutoGenerator;