"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Button } from "@/components/ui/button";
import { Printer, Eye, ClipboardList, RotateCw, X, SlidersHorizontal } from "lucide-react";
import PageHeader from "../components/shared/PageHeader";
import { DAYS, PERIODS } from "../constants/schedule";
import OfficialPrintWrapper from "../components/shared/OfficialPrintWrapper";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { PeriodPart } from "@/types";
import WeeklyWorkScheduleTable from "../components/schedule/WeeklyWorkScheduleTable";
import WeeklyWorkScheduleControls from "../components/schedule/WeeklyWorkScheduleControls";

const WeeklyWorkSchedule = () => {
  const { 
    employees, 
    assignments, 
    subjects,
    classes,
    isRTL,
    t,
    user,
    periodTimings
  } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>(["all"]);
  const [selectedPeriodParts, setSelectedPeriodParts] = useState<PeriodPart[]>(["Morning", "Afternoon", "Evening"]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [orientation, setOrientation] = useState<"landscape" | "portrait">("landscape");
  const [isTransposed, setIsTransposed] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hoveredCell, setHoveredCell] = useState<{ empId: string; dayId: number; period: string } | null>(null);

  // تصفية الأساتذة بناءً على البحث والفروع المختارة
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClass = selectedClassIds.includes("all") || assignments.some(a => a.employeeId === emp.id && selectedClassIds.includes(a.classId));
      return matchesSearch && matchesClass;
    });
  }, [employees, searchTerm, selectedClassIds, assignments]);

  // تحديد الحصص النشطة لكل يوم بناءً على الفترات والفروع المحددة
  const activePeriodsPerDay = useMemo(() => {
    const map: Record<number, string[]> = {};
    DAYS.forEach(day => {
      const activePeriods = PERIODS.filter(p => {
        const pNum = parseInt(p);
        let part: PeriodPart = "Morning";
        if (pNum >= 5 && pNum <= 7) part = "Afternoon";
        else if (pNum >= 8) part = "Evening";

        if (!selectedPeriodParts.includes(part)) return false;

        return assignments.some(a => 
          a.day === day.id && 
          a.period === p && 
          filteredEmployees.some(emp => emp.id === a.employeeId) &&
          (selectedClassIds.includes("all") || selectedClassIds.includes(a.classId))
        );
      });
      map[day.id] = activePeriods;
    });
    return map;
  }, [assignments, filteredEmployees, selectedPeriodParts, selectedClassIds]);

  const totalActiveColumns = useMemo(() => {
    return DAYS.reduce((sum, day) => sum + (activePeriodsPerDay[day.id]?.length || 0), 0);
  }, [activePeriodsPerDay]);

  const getDayCells = (empId: string, dayId: number) => {
    const activePeriods = activePeriodsPerDay[dayId] || [];
    const cells = activePeriods.map(p => ({
      period: p,
      colSpan: 1,
      assignment: assignments.find(a => a.employeeId === empId && a.day === dayId && a.period === p && (selectedClassIds.includes("all") || selectedClassIds.includes(a.classId))),
      skip: false
    }));

    for (let i = 0; i < cells.length; i++) {
      if (cells[i].skip) continue;
      const asgn1 = cells[i].assignment;
      if (!asgn1) continue;

      for (let j = i + 1; j < cells.length; j++) {
        const asgn2 = cells[j].assignment;
        if (asgn2 && asgn2.subjectId === asgn1.subjectId && asgn2.classId === asgn1.classId) {
          cells[i].colSpan++;
          cells[j].skip = true;
        } else {
          break;
        }
      }
    }
    return cells;
  };

  const getTransposedDayCells = (empId: string, dayId: number) => {
    const activePeriods = activePeriodsPerDay[dayId] || [];
    const cells = activePeriods.map(p => ({
      period: p,
      rowSpan: 1,
      assignment: assignments.find(a => a.employeeId === empId && a.day === dayId && a.period === p && (selectedClassIds.includes("all") || selectedClassIds.includes(a.classId))),
      skip: false
    }));

    for (let i = 0; i < cells.length; i++) {
      if (cells[i].skip) continue;
      const asgn1 = cells[i].assignment;
      if (!asgn1) continue;

      for (let j = i + 1; j < cells.length; j++) {
        const asgn2 = cells[j].assignment;
        if (asgn2 && asgn2.subjectId === asgn1.subjectId && asgn2.classId === asgn1.classId) {
          cells[i].rowSpan++;
          cells[j].skip = true;
        } else {
          break;
        }
      }
    }
    return cells;
  };

  const togglePeriodPart = (part: PeriodPart) => {
    setSelectedPeriodParts(prev => 
      prev.includes(part) 
        ? (prev.length > 1 ? prev.filter(p => p !== part) : prev)
        : [...prev, part]
    );
  };

  const toggleClassId = (id: string) => {
    if (id === "all") {
      setSelectedClassIds(["all"]);
    } else {
      setSelectedClassIds(prev => {
        const filtered = prev.filter(x => x !== "all");
        if (filtered.includes(id)) {
          const next = filtered.filter(x => x !== id);
          return next.length === 0 ? ["all"] : next;
        } else {
          return [...filtered, id];
        }
      });
    }
  };

  const printSubtitle = (
    <span className="font-bold">{isRTL ? "توزيع المهام والحصص الأسبوعية" : "Weekly Tasks & Lessons Distribution"}</span>
  );

  return (
    <div className="space-y-4 pb-12">
      <PageHeader title={t.weeklyWorkSchedule} subtitle={isRTL ? "مزامنة تلقائية مع جدول الحصص وتكليفات العمل" : "Auto-sync with timetable and work assignments"} icon={ClipboardList} isRTL={isRTL}>
        <Button variant="outline" onClick={() => setShowControls(!showControls)} className={cn("rounded-xl border-emerald-100 font-bold gap-1.5 h-9 px-3 transition-all text-xs", showControls ? "bg-emerald-50 text-emerald-900 border-emerald-300" : "bg-white text-slate-700")}>
          <SlidersHorizontal size={14} />
          {isRTL ? "أدوات التحكم" : "Controls"}
        </Button>
        <Button variant="outline" className="rounded-xl border-emerald-200 text-emerald-700 gap-1.5 font-bold px-4 h-9 bg-white text-xs" onClick={() => setIsPreviewOpen(true)}>
          <Eye size={14} /> {t.preview}
        </Button>
        <Button className="bg-emerald-600 hover:bg-emerald-700 rounded-xl gap-1.5 font-bold px-4 h-9 shadow-md shadow-emerald-100 text-white text-xs" onClick={() => window.print()}>
          <Printer size={14} /> {t.print}
        </Button>
      </PageHeader>

      {showControls && (
        <WeeklyWorkScheduleControls
          isRTL={isRTL}
          t={t}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedClassIds={selectedClassIds}
          toggleClassId={toggleClassId}
          classes={classes}
          selectedPeriodParts={selectedPeriodParts}
          togglePeriodPart={togglePeriodPart}
          orientation={orientation}
          setOrientation={setOrientation}
          isTransposed={isTransposed}
          setIsTransposed={setIsTransposed}
        />
      )}

      <div className="print:hidden">
        <WeeklyWorkScheduleTable 
          isTransposed={isTransposed}
          isRTL={isRTL}
          filteredEmployees={filteredEmployees}
          activePeriodsPerDay={activePeriodsPerDay}
          totalActiveColumns={totalActiveColumns}
          getDayCells={getDayCells}
          getTransposedDayCells={getTransposedDayCells}
          subjects={subjects}
          employees={employees}
          classes={classes}
          assignments={assignments}
          selectedClassIds={selectedClassIds}
          selectedPeriodParts={selectedPeriodParts}
          periodTimings={periodTimings}
          hoveredCell={hoveredCell}
          setHoveredCell={setHoveredCell}
        />
      </div>

      <div className="print-content-master hidden print:block">
        <OfficialPrintWrapper title={t.weeklyWorkSchedule} subtitle={printSubtitle} orientation={orientation} leftSignatureTitle={isRTL ? "توقيع الأستاذ" : "Teacher Signature"} rightSignatureTitle={isRTL ? "ختم وتوقيع المدير" : "Director Signature"} showSystemFooter={false}>
          <WeeklyWorkScheduleTable 
            isPrint={true}
            isTransposed={isTransposed}
            isRTL={isRTL}
            filteredEmployees={filteredEmployees}
            activePeriodsPerDay={activePeriodsPerDay}
            totalActiveColumns={totalActiveColumns}
            getDayCells={getDayCells}
            getTransposedDayCells={getTransposedDayCells}
            subjects={subjects}
            employees={employees}
            classes={classes}
            assignments={assignments}
            selectedClassIds={selectedClassIds}
            selectedPeriodParts={selectedPeriodParts}
            periodTimings={periodTimings}
            hoveredCell={hoveredCell}
            setHoveredCell={setHoveredCell}
          />
        </OfficialPrintWrapper>
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[98vw] w-full h-[95vh] p-0 bg-zinc-900/95 border-none rounded-none flex flex-col z-[9999] print:bg-white print:h-auto print:block">
          <div className="h-14 bg-black/40 border-b border-white/10 flex items-center justify-between px-6 shrink-0 print:hidden">
            <div className="flex items-center gap-2 text-white"><Eye className="text-emerald-500" size={16} /><h3 className="font-black text-sm">{isRTL ? "معاينة جدول العمل" : "Work Schedule Preview"}</h3></div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setOrientation(orientation === "portrait" ? "landscape" : "portrait")} className="text-white border-white/20 bg-transparent rounded-xl h-9 text-xs"><RotateCw size={14} className="mr-1.5" />{isRTL ? (orientation === "portrait" ? "عرضي" : "طولي") : "Orientation"}</Button>
              <Button onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black px-6 h-9 text-xs"><Printer size={14} className="mr-1.5" />{t.print}</Button>
              <Button variant="ghost" onClick={() => setIsPreviewOpen(false)} className="text-white/70 hover:text-white"><X size={18} /></Button>
            </div>
          </div>
          <div className="flex-1 overflow-auto bg-zinc-950/50 print:bg-white p-6 print:p-0">
            <OfficialPrintWrapper title={t.weeklyWorkSchedule} subtitle={printSubtitle} orientation={orientation} leftSignatureTitle={isRTL ? "توقيع الأستاذ" : "Teacher Signature"} rightSignatureTitle={isRTL ? "ختم وتوقيع المدير" : "Director Signature"} showSystemFooter={false}>
              <WeeklyWorkScheduleTable 
                isPrint={true}
                isTransposed={isTransposed}
                isRTL={isRTL}
                filteredEmployees={filteredEmployees}
                activePeriodsPerDay={activePeriodsPerDay}
                totalActiveColumns={totalActiveColumns}
                getDayCells={getDayCells}
                getTransposedDayCells={getTransposedDayCells}
                subjects={subjects}
                employees={employees}
                classes={classes}
                assignments={assignments}
                selectedClassIds={selectedClassIds}
                selectedPeriodParts={selectedPeriodParts}
                periodTimings={periodTimings}
                hoveredCell={hoveredCell}
                setHoveredCell={setHoveredCell}
              />
            </OfficialPrintWrapper>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WeeklyWorkSchedule;