"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Printer, Search, Eye, ClipboardList, RotateCw, X, ArrowLeftRight, SlidersHorizontal, BookOpen, Clock, GraduationCap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import PageHeader from "../components/shared/PageHeader";
import { DAYS, PERIODS } from "../constants/schedule";
import OfficialPrintWrapper from "../components/shared/OfficialPrintWrapper";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PeriodPart } from "@/types";

const PERIOD_TIMES: Record<string, string> = {
  "1": "08:00-09:00", "2": "09:00-10:00", "3": "10:00-11:00", "4": "11:00-12:00",
  "5": "13:00-14:00", "6": "14:00-15:00", "7": "15:00-16:00", "8": "16:00-17:00",
  "9": "17:00-18:00", "10": "18:00-19:00", "11": "19:00-20:00", "12": "20:00-21:00",
};

const WeeklyWorkSchedule = () => {
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

        // التحقق من تفعيل الفترة في الفلتر
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

  // حساب إجمالي الأعمدة النشطة لتوزيع العرض بالتساوي
  const totalActiveColumns = useMemo(() => {
    return DAYS.reduce((sum, day) => sum + (activePeriodsPerDay[day.id]?.length || 0), 0);
  }, [activePeriodsPerDay]);

  // خوارزمية حساب دمج الخلايا المتتالية لنفس الأستاذ، المادة، والقسم في نفس اليوم (أفقياً)
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
        // دمج إذا كانت نفس المادة ونفس القسم متتاليين
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

  // خوارزمية حساب دمج الخلايا المتتالية لنفس الأستاذ، المادة، والقسم في نفس اليوم (عمودياً للوضع المتبادل)
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
        // دمج إذا كانت نفس المادة ونفس القسم متتاليين
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
        ? (prev.length > 1 ? prev.filter(p => p !== part) : prev) // منع إلغاء تحديد الجميع
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

  const ScheduleTable = ({ isPrint = false }: { isPrint?: boolean }) => {
    if (isTransposed) {
      // الوضع المتبادل (Transposed Mode): الأسطر تمثل الأيام والحصص، والأعمدة تمثل الأساتذة
      return (
        <div className={cn(
          "bg-white",
          isPrint ? "p-0 w-full" : "rounded-2xl border border-emerald-100 shadow-md overflow-hidden"
        )}>
          <div className={cn(!isPrint && "overflow-x-auto")}>
            <Table className={cn(
              "border-collapse border-spacing-0 table-fixed", 
              isPrint ? "w-full border-2 border-black" : "w-full min-w-[1000px]"
            )}>
              <colgroup>
                <col className={isPrint ? "w-[10%]" : "w-[80px]"} />
                <col className={isPrint ? "w-[10%]" : "w-[80px]"} />
                {filteredEmployees.map(emp => (
                  <col key={emp.id} className={isPrint ? `${80 / filteredEmployees.length}%` : "w-[100px]"} />
                ))}
              </colgroup>
              <TableHeader>
                <TableRow className={cn(isPrint ? "bg-slate-50/50 border-b-2 border-black h-6" : "bg-emerald-50/50 hover:bg-emerald-50/50 h-8")}>
                  <TableHead className={cn(
                    "font-black text-emerald-900 border text-center",
                    isPrint ? "text-[8px] p-0.5 border-black text-black" : "text-xs p-1 border-emerald-100"
                  )}>
                    {isRTL ? "اليوم" : "Day"}
                  </TableHead>
                  <TableHead className={cn(
                    "font-black text-emerald-900 border text-center",
                    isPrint ? "text-[8px] p-0.5 border-black text-black" : "text-xs p-1 border-emerald-100"
                  )}>
                    {isRTL ? "الحصة" : "Period"}
                  </TableHead>
                  {filteredEmployees.map(emp => {
                    const isColHovered = hoveredCell?.empId === emp.id;
                    return (
                      <TableHead 
                        key={emp.id} 
                        className={cn(
                          "text-center font-black border truncate transition-colors duration-150",
                          isPrint ? "text-[8px] p-0.5 border-black bg-slate-50 text-black" : cn("text-[10px] p-1 border-emerald-100 text-emerald-700", isColHovered ? "bg-emerald-100 text-emerald-900" : "bg-emerald-50/30")
                        )}
                      >
                        {emp.lastName} {emp.firstName}
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>

              <TableBody>
                {DAYS.map(day => {
                  const activePeriods = activePeriodsPerDay[day.id] || [];
                  if (activePeriods.length === 0) return null;

                  return activePeriods.map((p, pIdx) => {
                    const isRowHovered = hoveredCell?.dayId === day.id && hoveredCell?.period === p;
                    return (
                      <TableRow key={`${day.id}-${p}`} className={cn("group transition-colors duration-150", isPrint ? "h-8 border-b border-black" : "h-10 hover:bg-emerald-50/30", !isPrint && isRowHovered && "bg-emerald-50/20")}>
                        {pIdx === 0 && (
                          <TableCell 
                            rowSpan={activePeriods.length}
                            className={cn(
                              "font-black border bg-slate-50/50 text-center",
                              isPrint ? "text-[8px] p-1 border-black text-black" : "text-[11px] p-1 border-emerald-100 text-emerald-950"
                            )}
                          >
                            {isRTL ? day.name : day.en.substr(0, 3)}
                          </TableCell>
                        )}
                        <TableCell className={cn(
                          "font-bold border bg-white text-center leading-none",
                          isPrint ? "text-[7.5px] p-0.5 border-black text-black" : "text-[9px] p-1 border-emerald-100 text-slate-500"
                        )}>
                          <span className="font-black block">{isRTL ? `ح${p}` : `P${p}`}</span>
                          <span className="text-[7px] font-normal opacity-75 mt-0.5 block">{PERIOD_TIMES[p]}</span>
                        </TableCell>

                        {filteredEmployees.map(emp => {
                          const dayCells = getTransposedDayCells(emp.id, day.id);
                          const cell = dayCells.find(c => c.period === p);
                          if (!cell || cell.skip) return null;

                          const isActive = !!cell.assignment;
                          const subject = cell.assignment ? subjects.find(s => s.id === cell.assignment.subjectId) : null;
                          const cls = cell.assignment ? classes.find(c => c.id === cell.assignment.classId) : null;
                          const isCellHovered = hoveredCell?.empId === emp.id || (hoveredCell?.dayId === day.id && hoveredCell?.period === p);
                          const isExactHovered = hoveredCell?.empId === emp.id && hoveredCell?.dayId === day.id && hoveredCell?.period === p;

                          return (
                            <TableCell
                              key={`${emp.id}-${day.id}-${p}`}
                              rowSpan={cell.rowSpan}
                              className={cn(
                                "text-center border p-0.5 transition-colors duration-150 relative overflow-hidden",
                                isActive ? (isPrint ? "bg-slate-100 text-black border-black" : cn("text-white shadow-inner", isExactHovered ? "bg-emerald-800" : "bg-emerald-600")) : (isPrint ? "bg-white border-black" : cn(isCellHovered ? "bg-emerald-50/30" : "hover:bg-emerald-50/50")),
                                isPrint ? "h-8 border-black" : "h-10 border-emerald-100"
                              )}
                              onMouseEnter={() => !isPrint && setHoveredCell({ empId: emp.id, dayId: day.id, period: p })}
                              onMouseLeave={() => !isPrint && setHoveredCell(null)}
                            >
                              {isActive ? (
                                <div className="flex flex-col items-center justify-center leading-none">
                                  <span className={cn("font-black truncate max-w-full", isPrint ? "text-[7.5px]" : "text-[9.5px]")}>
                                    {subject?.name || "---"}
                                  </span>
                                  <span className={cn("font-bold opacity-80 truncate max-w-full", isPrint ? "text-[6.5px]" : "text-[8px]")}>
                                    {cls?.name || "---"}
                                  </span>
                                  {cell.assignment.room && (
                                    <span className={cn("font-medium opacity-70 truncate max-w-full", isPrint ? "text-[5.5px]" : "text-[7.5px]")}>
                                      {cell.assignment.room}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-200 opacity-20 text-[7px]">---</span>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  });
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      );
    }

    // الوضع العادي (Normal Mode): الأسطر تمثل الأساتذة، والأعمدة تمثل الأيام والحصص
    return (
      <div className={cn(
        "bg-white",
        isPrint ? "p-0 w-full" : "rounded-2xl border border-emerald-100 shadow-md overflow-hidden"
      )}>
        <div className={cn(!isPrint && "overflow-x-auto")}>
          <Table className={cn(
            "border-collapse border-spacing-0 table-fixed", 
            isPrint ? "w-full border-2 border-black" : "w-full min-w-[1000px]"
          )}>
            <colgroup>
              <col className={isPrint ? "w-[15%]" : "w-[140px]"} />
              {Array.from({ length: totalActiveColumns }).map((_, i) => (
                <col key={i} className={isPrint ? `${85 / totalActiveColumns}%` : "w-[70px]"} />
              ))}
            </colgroup>
            <TableHeader>
              <TableRow className={cn(isPrint ? "bg-slate-50/50 border-b-2 border-black h-6" : "bg-emerald-50/50 hover:bg-emerald-50/50 h-8")}>
                <TableHead className={cn(
                  "font-black text-emerald-900 border text-center sticky left-0 z-20 bg-emerald-50/50",
                  isPrint ? "text-[8px] p-0.5 border-black text-black" : "text-xs p-1 border-emerald-100"
                )} rowSpan={2}>
                  {isRTL ? "المعلم" : "Teacher"}
                </TableHead>
                {DAYS.map(day => {
                  const colSpan = activePeriodsPerDay[day.id]?.length || 0;
                  if (colSpan === 0) return null;
                  return (
                    <TableHead 
                      key={day.id} 
                      className={cn(
                        "text-center font-black border",
                        isPrint ? "text-[8px] p-0.5 border-black bg-slate-50 text-black" : "text-[10px] p-1 bg-emerald-50/30 border-emerald-100 text-emerald-700"
                      )} 
                      colSpan={colSpan}
                    >
                      {isRTL ? day.name : day.en.substr(0, 3)}
                    </TableHead>
                  );
                })}
              </TableRow>
              <TableRow className={cn(isPrint ? "bg-slate-50/20 border-b-2 border-black h-6" : "bg-emerald-50/20 hover:bg-emerald-50/20 h-8")}>
                {DAYS.map(day => {
                  const activePeriods = activePeriodsPerDay[day.id] || [];
                  return activePeriods.map(p => {
                    const isColHovered = hoveredCell?.dayId === day.id && hoveredCell?.period === p;
                    return (
                      <TableHead key={`${day.id}-${p}`} className={cn(
                        "text-center font-bold border p-0.5 transition-colors duration-150",
                        isPrint ? "text-[7px] border-black text-black" : cn("border-emerald-100 text-slate-400", isColHovered && "bg-emerald-100 text-emerald-900")
                      )}>
                        <div className="flex flex-col items-center justify-center leading-none">
                          <span className="font-black">{isRTL ? `ح${p}` : `P${p}`}</span>
                          <span className={cn("font-normal opacity-75 mt-0.5 block tracking-tighter", isPrint ? "text-[4.5px]" : "text-[7px]")}>
                            {PERIOD_TIMES[p]}
                          </span>
                        </div>
                      </TableHead>
                    );
                  });
                })}
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredEmployees.map(emp => {
                const isRowHovered = hoveredCell?.empId === emp.id;
                return (
                  <TableRow key={emp.id} className={cn("group transition-colors duration-150", isPrint ? "h-8 border-b border-black" : "h-10 hover:bg-emerald-50/30", !isPrint && isRowHovered && "bg-emerald-50/20")}>
                    <TableCell className={cn(
                      "font-bold border bg-white truncate sticky left-0 z-10 shadow-sm transition-colors duration-150",
                      isPrint ? "text-[8px] p-1 border-black text-black" : cn("text-[11px] p-1 border-emerald-100 text-emerald-950 group-hover:bg-emerald-50/30", isRowHovered && "bg-emerald-50/40")
                    )}>
                      {emp.lastName} {emp.firstName}
                    </TableCell>
                    {DAYS.map(day => {
                      const dayCells = getDayCells(emp.id, day.id);
                      return dayCells.map(cell => {
                        if (cell.skip) return null;
                        const isActive = !!cell.assignment;
                        const subject = cell.assignment ? subjects.find(s => s.id === cell.assignment.subjectId) : null;
                        const cls = cell.assignment ? classes.find(c => c.id === cell.assignment.classId) : null;
                        const isCellHovered = hoveredCell?.empId === emp.id || (hoveredCell?.dayId === day.id && hoveredCell?.period === cell.period);
                        const isExactHovered = hoveredCell?.empId === emp.id && hoveredCell?.dayId === day.id && hoveredCell?.period === cell.period;

                        return (
                          <TableCell
                            key={`${emp.id}-${day.id}-${cell.period}`}
                            colSpan={cell.colSpan}
                            className={cn(
                              "text-center border p-0.5 transition-colors duration-150 relative overflow-hidden",
                              isActive ? (isPrint ? "bg-slate-100 text-black border-black" : cn("text-white shadow-inner", isExactHovered ? "bg-emerald-800" : "bg-emerald-600")) : (isPrint ? "bg-white border-black" : cn(isCellHovered ? "bg-emerald-50/30" : "hover:bg-emerald-50/50")),
                              isPrint ? "h-8 border-black" : "h-10 border-emerald-100"
                            )}
                            onMouseEnter={() => !isPrint && setHoveredCell({ empId: emp.id, dayId: day.id, period: cell.period })}
                            onMouseLeave={() => !isPrint && setHoveredCell(null)}
                          >
                            {isActive ? (
                              <div className="flex flex-col items-center justify-center leading-none">
                                <span className={cn("font-black truncate max-w-full", isPrint ? "text-[7.5px]" : "text-[9.5px]")}>
                                  {subject?.name || "---"}
                                </span>
                                <span className={cn("font-bold opacity-80 truncate max-w-full", isPrint ? "text-[6.5px]" : "text-[8px]")}>
                                  {cls?.name || "---"}
                                </span>
                                {cell.assignment.room && (
                                  <span className={cn("font-medium opacity-70 truncate max-w-full", isPrint ? "text-[5.5px]" : "text-[7.5px]")}>
                                    {cell.assignment.room}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-200 opacity-20 text-[7px]">---</span>
                            )}
                          </TableCell>
                        );
                      });
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  const printSubtitle = (
    <span className="font-bold">{isRTL ? "توزيع المهام والحصص الأسبوعية" : "Weekly Tasks & Lessons Distribution"}</span>
  );

  return (
    <div className="space-y-4 pb-12">
      <PageHeader
        title={t.weeklyWorkSchedule}
        subtitle={isRTL ? "مزامنة تلقائية مع جدول الحصص وتكليفات العمل" : "Auto-sync with timetable and work assignments"}
        icon={ClipboardList}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm transition-all duration-300 print:hidden">
          {/* 1. البحث عن معلم */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-emerald-700 uppercase tracking-widest px-1">
              {isRTL ? "بحث عن معلم" : "Search Teacher"}
            </label>
            <div className="relative">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 text-gray-400", isRTL ? "right-2.5" : "left-2.5")} size={14} />
              <Input 
                placeholder={t.search} 
                className={cn("rounded-xl border-emerald-100 bg-slate-50/30 h-9 text-xs", isRTL ? "pr-8" : "pl-8")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* 2. الفروع المعنية بالعرض (تحديد متعدد) */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-emerald-700 uppercase tracking-widest px-1">
              {isRTL ? "الفروع المعنية بالعرض" : "Target Branches"}
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="rounded-xl border-emerald-100 bg-slate-50/30 h-9 font-bold text-xs w-full justify-between">
                  <span className="truncate">
                    {selectedClassIds.includes("all") 
                      ? (isRTL ? "جميع الفروع" : "All Branches") 
                      : (isRTL ? `محدد (${selectedClassIds.length})` : `Selected (${selectedClassIds.length})`)}
                  </span>
                  <SlidersHorizontal size={12} className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-60 p-2 rounded-2xl bg-white border border-slate-100 shadow-xl max-h-64 overflow-y-auto z-[999]">
                <div className="space-y-1">
                  <div 
                    className="flex items-center gap-2.5 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
                    onClick={() => toggleClassId("all")}
                  >
                    <Checkbox checked={selectedClassIds.includes("all")} />
                    <span className="text-xs font-bold">{isRTL ? "جميع الفروع" : "All Branches"}</span>
                  </div>
                  {classes.map(c => (
                    <div 
                      key={c.id} 
                      className="flex items-center gap-2.5 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
                      onClick={() => toggleClassId(c.id)}
                    >
                      <Checkbox checked={selectedClassIds.includes(c.id)} />
                      <span className="text-xs font-bold">{c.name}</span>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* 3. الحصص المعنية بالعرض */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-emerald-700 uppercase tracking-widest px-1">
              {isRTL ? "الحصص المعنية بالعرض" : "Target Periods"}
            </label>
            <div className="flex items-center gap-3 h-9 px-2 bg-slate-50/30 border border-emerald-100 rounded-xl">
              {[
                { id: "Morning" as PeriodPart, label: isRTL ? "ص" : "M" },
                { id: "Afternoon" as PeriodPart, label: isRTL ? "م" : "A" },
                { id: "Evening" as PeriodPart, label: isRTL ? "ل" : "E" }
              ].map(part => {
                const isChecked = selectedPeriodParts.includes(part.id);
                return (
                  <div key={part.id} className="flex items-center gap-1 cursor-pointer" onClick={() => togglePeriodPart(part.id)}>
                    <Checkbox 
                      checked={isChecked} 
                      className="h-3.5 w-3.5 rounded border-emerald-200 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600" 
                    />
                    <span className="text-[10px] font-black text-slate-700">{part.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. اتجاه الصفحة */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-emerald-700 uppercase tracking-widest px-1">
              {isRTL ? "اتجاه الصفحة" : "Page Orientation"}
            </label>
            <Select value={orientation} onValueChange={(v: any) => setOrientation(v)}>
              <SelectTrigger className="rounded-xl border-emerald-100 bg-slate-50/30 h-9 font-bold text-xs">
                <SelectValue placeholder={isRTL ? "اتجاه الصفحة" : "Orientation"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="landscape">{isRTL ? "عرضي" : "Landscape"}</SelectItem>
                <SelectItem value="portrait">{isRTL ? "طولي" : "Portrait"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 5. تبديل المحاور */}
          <div className="space-y-1 flex flex-col justify-end">
            <Button 
              variant="outline" 
              onClick={() => setIsTransposed(!isTransposed)} 
              className={cn(
                "rounded-xl border-emerald-100 font-bold gap-1.5 h-9 w-full transition-all text-xs",
                isTransposed ? "bg-emerald-600 text-white border-emerald-600" : "bg-slate-50/30 text-emerald-700 hover:bg-emerald-50"
              )}
            >
              <ArrowLeftRight size={14} />
              {isRTL ? "تبديل المحاور" : "Transpose Axes"}
            </Button>
          </div>
        </div>
      )}

      <div className="print:hidden">
        <ScheduleTable />
      </div>

      <div className="print-content-master hidden print:block">
        <OfficialPrintWrapper
          title={t.weeklyWorkSchedule}
          subtitle={printSubtitle}
          orientation={orientation}
          leftSignatureTitle={isRTL ? "توقيع الأستاذ" : "Teacher Signature"}
          rightSignatureTitle={isRTL ? "ختم وتوقيع المدير" : "Director Signature"}
          showSystemFooter={false}
        >
          <ScheduleTable isPrint={true} />
        </OfficialPrintWrapper>
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[98vw] w-full h-[95vh] p-0 bg-zinc-900/95 border-none rounded-none flex flex-col z-[9999] print:bg-white print:h-auto print:block">
          <div className="h-14 bg-black/40 border-b border-white/10 flex items-center justify-between px-6 shrink-0 print:hidden">
            <div className="flex items-center gap-2 text-white">
              <Eye className="text-emerald-500" size={16} />
              <h3 className="font-black text-sm">{isRTL ? "معاينة جدول العمل" : "Work Schedule Preview"}</h3>
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
              title={t.weeklyWorkSchedule}
              subtitle={printSubtitle}
              orientation={orientation}
              leftSignatureTitle={isRTL ? "توقيع الأستاذ" : "Teacher Signature"}
              rightSignatureTitle={isRTL ? "ختم وتوقيع المدير" : "Director Signature"}
              showSystemFooter={false}
            >
              <ScheduleTable isPrint={true} />
            </OfficialPrintWrapper>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WeeklyWorkSchedule;