"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Button } from "@/components/ui/button";
import { Printer, Eye, Layers, RotateCw, X, SlidersHorizontal } from "lucide-react";
import PageHeader from "../components/shared/PageHeader";
import { DAYS, PERIODS } from "../constants/schedule";
import OfficialPrintWrapper from "../components/shared/OfficialPrintWrapper";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import MasterClassesScheduleTable from "../components/schedule/MasterClassesScheduleTable";
import MasterClassesScheduleControls from "../components/schedule/MasterClassesScheduleControls";

const MasterClassesSchedule = () => {
  const { 
    employees, 
    assignments, 
    subjects,
    classes,
    isRTL,
    t,
    user
  } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>(["all"]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [orientation, setOrientation] = useState<"landscape" | "portrait">("landscape");
  const [isTransposed, setIsTransposed] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hoveredCell, setHoveredCell] = useState<{ classId: string; dayId: number; period: string } | null>(null);

  // تصفية الفروع بناءً على البحث والتحديد المتعدد
  const filteredClasses = useMemo(() => {
    return classes.filter(cls => 
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedClassIds.includes("all") || selectedClassIds.includes(cls.id))
    );
  }, [classes, searchTerm, selectedClassIds]);

  // تحديد الحصص النشطة لكل يوم (التي تحتوي على حصة واحدة على الأقل لأي من الفروع المفلترة)
  const activePeriodsPerDay = useMemo(() => {
    const map: Record<number, string[]> = {};
    DAYS.forEach(day => {
      const activePeriods = PERIODS.filter(p => 
        assignments.some(a => 
          a.day === day.id && 
          a.period === p && 
          filteredClasses.some(cls => cls.id === a.classId)
        )
      );
      map[day.id] = activePeriods;
    });
    return map;
  }, [assignments, filteredClasses]);

  // حساب إجمالي الأعمدة النشطة لتوزيع العرض بالتساوي
  const totalActiveColumns = useMemo(() => {
    return DAYS.reduce((sum, day) => sum + (activePeriodsPerDay[day.id]?.length || 0), 0);
  }, [activePeriodsPerDay]);

  // خوارزمية حساب دمج الخلايا المتتالية لنفس الفرع، المادة، والأستاذ في نفس اليوم (أفقياً)
  const getDayCells = (classId: string, dayId: number) => {
    const activePeriods = activePeriodsPerDay[dayId] || [];
    const cells = activePeriods.map(p => ({
      period: p,
      colSpan: 1,
      assignment: assignments.find(a => a.classId === classId && a.day === dayId && a.period === p),
      skip: false
    }));

    for (let i = 0; i < cells.length; i++) {
      if (cells[i].skip) continue;
      const asgn1 = cells[i].assignment;
      if (!asgn1) continue;

      for (let j = i + 1; j < cells.length; j++) {
        const asgn2 = cells[j].assignment;
        // دمج إذا كانت نفس المادة ونفس الأستاذ متتاليين
        if (asgn2 && asgn2.subjectId === asgn1.subjectId && asgn2.employeeId === asgn1.employeeId) {
          cells[i].colSpan++;
          cells[j].skip = true;
        } else {
          break;
        }
      }
    }
    return cells;
  };

  // خوارزمية حساب دمج الخلايا المتتالية لنفس الفرع، المادة، والأستاذ في نفس اليوم (عمودياً للوضع المتبادل)
  const getTransposedDayCells = (classId: string, dayId: number) => {
    const activePeriods = activePeriodsPerDay[dayId] || [];
    const cells = activePeriods.map(p => ({
      period: p,
      rowSpan: 1,
      assignment: assignments.find(a => a.classId === classId && a.day === dayId && a.period === p),
      skip: false
    }));

    for (let i = 0; i < cells.length; i++) {
      if (cells[i].skip) continue;
      const asgn1 = cells[i].assignment;
      if (!asgn1) continue;

      for (let j = i + 1; j < cells.length; j++) {
        const asgn2 = cells[j].assignment;
        // دمج إذا كانت نفس المادة ونفس الأستاذ متتاليين
        if (asgn2 && asgn2.subjectId === asgn1.subjectId && asgn2.employeeId === asgn1.employeeId) {
          cells[i].rowSpan++;
          cells[j].skip = true;
        } else {
          break;
        }
      }
    }
    return cells;
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
    <span className="font-bold">{isRTL ? "توزيع الحصص الأسبوعية لكافة الفروع" : "Weekly Lessons Distribution for All Classes"}</span>
  );

  return (
    <div className="space-y-4 pb-12">
      <PageHeader
        title={t.masterClassesSchedule}
        subtitle={isRTL ? "مزامنة تلقائية مع جدول الحصص وتكليفات الفروع" : "Auto-sync with timetable and classes assignments"}
        icon={Layers}
        isRTL={isRTL}
      >
        <Button 
          variant="outline" 
          onClick={() => setShowControls(!showControls)} 
          className={cn(
            "rounded-xl border-emerald-100 font-bold gap-1.5 h-9 px-3 transition-all text-xs",
            showControls ? "bg-emerald-50 text-emerald-900 border-emerald-300" : "bg-white text-slate-700"
          )}
        >
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

      {/* Collapsible Control Panel */}
      {showControls && (
        <MasterClassesScheduleControls
          isRTL={isRTL}
          t={t}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedClassIds={selectedClassIds}
          toggleClassId={toggleClassId}
          classes={classes}
          orientation={orientation}
          setOrientation={setOrientation}
          isTransposed={isTransposed}
          setIsTransposed={setIsTransposed}
        />
      )}

      <div className="print:hidden">
        <MasterClassesScheduleTable
          isTransposed={isTransposed}
          isRTL={isRTL}
          filteredClasses={filteredClasses}
          activePeriodsPerDay={activePeriodsPerDay}
          totalActiveColumns={totalActiveColumns}
          getDayCells={getDayCells}
          getTransposedDayCells={getTransposedDayCells}
          subjects={subjects}
          employees={employees}
          classes={classes}
          hoveredCell={hoveredCell}
          setHoveredCell={setHoveredCell}
          orientation={orientation}
        />
      </div>

      <div className="print-content-master hidden print:block">
        <OfficialPrintWrapper
          title={t.masterClassesSchedule}
          subtitle={printSubtitle}
          orientation={orientation}
          leftSignatureTitle={isRTL ? "توقيع الأستاذ" : "Teacher Signature"}
          rightSignatureTitle={isRTL ? "ختم وتوقيع المدير" : "Director Signature"}
          showSystemFooter={false}
        >
          <MasterClassesScheduleTable
            isPrint={true}
            isTransposed={isTransposed}
            isRTL={isRTL}
            filteredClasses={filteredClasses}
            activePeriodsPerDay={activePeriodsPerDay}
            totalActiveColumns={totalActiveColumns}
            getDayCells={getDayCells}
            getTransposedDayCells={getTransposedDayCells}
            subjects={subjects}
            employees={employees}
            classes={classes}
            hoveredCell={hoveredCell}
            setHoveredCell={setHoveredCell}
            orientation={orientation}
          />
        </OfficialPrintWrapper>
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[98vw] w-full h-[95vh] p-0 bg-zinc-900/95 border-none rounded-none flex flex-col z-[9999] print:bg-white print:h-auto print:block">
          <div className="h-14 bg-black/40 border-b border-white/10 flex items-center justify-between px-6 shrink-0 print:hidden">
            <div className="flex items-center gap-2 text-white">
              <Eye className="text-emerald-500" size={16} />
              <h3 className="font-black text-sm">{isRTL ? "معاينة جدول الفروع" : "Classes Schedule Preview"}</h3>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setOrientation(orientation === "portrait" ? "landscape" : "portrait")} className="text-white border-white/20 bg-transparent rounded-xl h-9 text-xs">
                <RotateCw size={14} className="mr-1.5" />
                {isRTL ? (orientation === "portrait" ? "عرضي" : "طولي") : "Orientation"}
              </Button>
              <Button onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black px-6 h-9 text-xs">
                <Printer size={14} className="mr-1.5" />
                {t.print}
              </Button>
              <Button variant="ghost" onClick={() => setIsPreviewOpen(false)} className="text-white/70 hover:text-white">
                <X size={18} />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-zinc-950/50 print:bg-white p-6 print:p-0">
            <OfficialPrintWrapper
              title={t.masterClassesSchedule}
              subtitle={printSubtitle}
              orientation={orientation}
              leftSignatureTitle={isRTL ? "توقيع الأستاذ" : "Teacher Signature"}
              rightSignatureTitle={isRTL ? "ختم وتوقيع المدير" : "Director Signature"}
              showSystemFooter={false}
            >
              <MasterClassesScheduleTable
                isPrint={true}
                isTransposed={isTransposed}
                isRTL={isRTL}
                filteredClasses={filteredClasses}
                activePeriodsPerDay={activePeriodsPerDay}
                totalActiveColumns={totalActiveColumns}
                getDayCells={getDayCells}
                getTransposedDayCells={getTransposedDayCells}
                subjects={subjects}
                employees={employees}
                classes={classes}
                hoveredCell={hoveredCell}
                setHoveredCell={setHoveredCell}
                orientation={orientation}
              />
            </OfficialPrintWrapper>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MasterClassesSchedule;