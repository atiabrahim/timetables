"use client";

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { showSuccess, showError } from "../utils/toast";
import PageHeader from "../components/shared/PageHeader";
import { DAYS, PERIODS } from "../constants/schedule";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

// Modular Sub-components
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

  // Rules and Constraints State
  const [rules, setRules] = useState({
    allowedDays: [0, 1, 2, 3, 4], // Sunday to Thursday by default
    allowedPeriods: ["1", "2", "3", "4", "5", "6", "7", "8"], // Default active periods
    maxTeacherHoursPerDay: 6,
    maxTeacherConsecutiveHours: 3,
    maxClassHoursPerDay: 6,
    avoidTeacherGaps: false
  });

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

  // Helper to check maximum consecutive hours for a teacher on a day
  const checkConsecutiveHours = (
    teacherId: string, 
    day: number, 
    newPeriod: string, 
    currentAssignments: any[], 
    maxConsecutive: number
  ): boolean => {
    // Get all periods the teacher has on this day, including the new one
    const periods = currentAssignments
      .filter(a => a.employeeId === teacherId && a.day === day)
      .map(a => parseInt(a.period));
    
    periods.push(parseInt(newPeriod));
    periods.sort((a, b) => a - b);

    // Find the maximum consecutive sequence
    let maxSeq = 0;
    let currentSeq = 0;
    let lastVal = -99;

    for (const p of periods) {
      if (p === lastVal + 1) {
        currentSeq++;
      } else {
        currentSeq = 1;
      }
      maxSeq = Math.max(maxSeq, currentSeq);
      lastVal = p;
    }

    return maxSeq <= maxConsecutive;
  };

  // Helper to check if placing a lesson creates a gap for a teacher on a day
  const checkTeacherGaps = (
    teacherId: string,
    day: number,
    newPeriod: string,
    currentAssignments: any[]
  ): boolean => {
    const existingPeriods = currentAssignments
      .filter(a => a.employeeId === teacherId && a.day === day)
      .map(a => parseInt(a.period));

    if (existingPeriods.length === 0) return true; // First lesson of the day is always fine

    const pNum = parseInt(newPeriod);
    // The new period must be adjacent to at least one existing period to avoid gaps
    return existingPeriods.includes(pNum - 1) || existingPeriods.includes(pNum + 1);
  };

  // Smart Scheduling Algorithm with Rules Enforcement
  const handleGenerate = () => {
    if (requirements.length === 0) {
      showError(isRTL ? "يرجى إضافة متطلبات التدريس أولاً" : "Please add teaching requirements first");
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

      // Get active slots filtered by allowedDays and allowedPeriods
      const activeSlots: { day: number; period: string }[] = [];
      DAYS.forEach(day => {
        if (rules.allowedDays.includes(day.id)) {
          PERIODS.forEach(period => {
            if (rules.allowedPeriods.includes(period)) {
              const config = periodConfigs.find(c => c.day === day.id && c.period === period);
              if (config?.isActive !== false) {
                activeSlots.push({ day: day.id, period });
              }
            }
          });
        }
      });

      if (activeSlots.length === 0) {
        showError(isRTL ? "لا توجد حصص زمنية مفعلة تطابق القواعد المحددة" : "No active periods match the specified rules");
        setIsTransolving(false);
        return;
      }

      // Randomized Greedy Solver with multiple restarts
      let bestAssignments: any[] = [];
      let bestUnplaced: any[] = [];
      let maxPlaced = -1;

      const RESTARTS = 100; // Increased restarts to find better solutions under strict constraints

      for (let run = 0; run < RESTARTS; run++) {
        const currentAssignments: any[] = [];
        const unplaced: any[] = [];

        // Shuffle active slots slightly to introduce randomness
        const shuffledSlots = [...activeSlots].sort(() => Math.random() - 0.5);

        lessonsToPlace.forEach(lesson => {
          let placed = false;

          // Find a valid slot
          for (const slot of shuffledSlots) {
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

            // 4. Max Teacher Hours Per Day Constraint
            const teacherDailyHours = currentAssignments.filter(a => 
              a.employeeId === lesson.employeeId && a.day === slot.day
            ).length;
            if (teacherDailyHours >= rules.maxTeacherHoursPerDay) continue;

            // 5. Max Class Hours Per Day Constraint
            const classDailyHours = currentAssignments.filter(a => 
              a.classId === lesson.classId && a.day === slot.day
            ).length;
            if (classDailyHours >= rules.maxClassHoursPerDay) continue;

            // 6. Max Consecutive Hours Constraint
            const isConsecutiveValid = checkConsecutiveHours(
              lesson.employeeId,
              slot.day,
              slot.period,
              currentAssignments,
              rules.maxTeacherConsecutiveHours
            );
            if (!isConsecutiveValid) continue;

            // 7. Avoid Teacher Gaps Constraint
            if (rules.avoidTeacherGaps) {
              const isGapValid = checkTeacherGaps(
                lesson.employeeId,
                slot.day,
                slot.period,
                currentAssignments
              );
              if (!isGapValid) continue;
            }

            // If all constraints are satisfied, place it!
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

        {/* Right Column: Generation Stats & Actions */}
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