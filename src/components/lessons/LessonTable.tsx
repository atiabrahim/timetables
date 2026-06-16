"use client";

import React from "react";
import { 
  BookOpen, 
  User, 
  GraduationCap, 
  Building2, 
  Clock, 
  Edit2, 
  Trash2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LessonTableProps {
  lessons: any[];
  isRTL: boolean;
  isAdmin: boolean;
  getSubjectName: (id: string) => string;
  getTeacherName: (id: string) => string;
  getClassName: (id: string) => string;
  getDayName: (id: number) => string;
  onEdit: (lesson: any) => void;
  onDelete: (id: string) => void;
  onReset: () => void;
}

const LessonTable = ({
  lessons, isRTL, isAdmin, getSubjectName, getTeacherName,
  getClassName, getDayName, onEdit, onDelete, onReset
}: LessonTableProps) => {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className={cn("w-full border-collapse", isRTL ? "text-right" : "text-left")}>
          <thead>
            <tr className="bg-slate-50">
              <th className={cn("p-1.5 text-slate-700 font-black text-[10px] uppercase border border-slate-200", isRTL ? "text-right" : "text-left")}>
                {isRTL ? "المادة" : "Subject"}
              </th>
              <th className={cn("p-1.5 text-slate-700 font-black text-[10px] uppercase border border-slate-200", isRTL ? "text-right" : "text-left")}>
                {isRTL ? "الأستاذ" : "Teacher"}
              </th>
              <th className="p-1.5 text-slate-700 font-black text-[10px] uppercase border border-slate-200 text-center">
                {isRTL ? "الفوج" : "Class"}
              </th>
              <th className={cn("p-1.5 text-slate-700 font-black text-[10px] uppercase border border-slate-200", isRTL ? "text-right" : "text-left")}>
                {isRTL ? "القاعة" : "Room"}
              </th>
              <th className={cn("p-1.5 text-slate-700 font-black text-[10px] uppercase border border-slate-200", isRTL ? "text-right" : "text-left")}>
                {isRTL ? "التوقيت" : "Timing"}
              </th>
              {isAdmin && (
                <th className="p-1.5 text-slate-700 font-black text-[10px] uppercase border border-slate-200 text-center">
                  {isRTL ? "إجراءات" : "Actions"}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {lessons.map((asgn) => (
              <tr key={asgn.id} className="hover:bg-emerald-50/30 transition-colors group">
                {/* عمود المادة */}
                <td className="p-0.5 border border-slate-100">
                  <div className={cn("flex items-center gap-2 px-2", isRTL ? "flex-row" : "flex-row-reverse justify-end")}>
                    <span className="font-bold text-emerald-900 text-xs">{getSubjectName(asgn.subjectId)}</span>
                    <BookOpen size={12} className="text-emerald-500 shrink-0" />
                  </div>
                </td>
                {/* عمود الأستاذ */}
                <td className="p-0.5 border border-slate-100">
                  <div className={cn("flex items-center gap-2 px-2", isRTL ? "flex-row" : "flex-row-reverse justify-end")}>
                    <span className="text-slate-700 font-medium text-xs">{getTeacherName(asgn.employeeId)}</span>
                    <User size={12} className="text-slate-400 shrink-0" />
                  </div>
                </td>
                {/* عمود الفوج - يبقى في المنتصف */}
                <td className="p-0.5 border border-slate-100 text-center">
                  <div className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-black">
                    <GraduationCap size={10} />
                    {getClassName(asgn.classId)}
                  </div>
                </td>
                {/* عمود القاعة */}
                <td className="p-0.5 border border-slate-100">
                  <div className={cn("flex items-center gap-1 px-2 text-slate-600 text-[10px] font-bold", isRTL ? "flex-row" : "flex-row-reverse justify-end")}>
                    {asgn.room || "---"}
                    <Building2 size={10} className="text-slate-400 shrink-0" />
                  </div>
                </td>
                {/* عمود التوقيت */}
                <td className="p-0.5 border border-slate-100">
                  <div className={cn("flex items-center gap-2 px-2", isRTL ? "flex-row" : "flex-row-reverse justify-end")}>
                    <div className="flex items-center gap-1 text-[9px] text-slate-500 font-bold shrink-0">
                      <Clock size={10} />
                      {isRTL ? "ح" : "P"}{asgn.period}
                    </div>
                    <span className="text-[10px] font-black text-slate-900 truncate">{getDayName(asgn.day)}</span>
                  </div>
                </td>
                {isAdmin && (
                  <td className="p-0.5 border border-slate-100 text-center">
                    <div className="flex justify-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5 text-emerald-600 hover:bg-emerald-50 rounded-md"
                        onClick={() => onEdit(asgn)}
                      >
                        <Edit2 size={12} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5 text-red-400 hover:bg-red-50 rounded-md"
                        onClick={() => onDelete(asgn.id)}
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            
            {/* سطر المجموع الكلي */}
            {lessons.length > 0 && (
              <tr className="bg-emerald-50/50 border-t-2 border-emerald-200">
                <td colSpan={isAdmin ? 6 : 5} className="p-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xs font-black text-emerald-900">
                      {isRTL ? "المجموع الكلي:" : "Total:"}
                    </span>
                    <span className="text-lg font-black text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
                      {lessons.length} {isRTL ? "حصة" : "Lessons"}
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {lessons.length === 0 && (
        <div className="text-center py-12 bg-slate-50/50">
          <p className="text-slate-400 font-bold text-sm">{isRTL ? "لا توجد حصص مطابقة" : "No lessons match"}</p>
          <Button variant="link" onClick={onReset} className="text-emerald-600 font-bold mt-1 h-auto p-0 text-xs">
            {isRTL ? "إظهار كافة الحصص" : "Show all lessons"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default LessonTable;
</dyad-chat-summary>

<dyad-write path="src/components/schedule/WeeklyWorkScheduleTable.tsx" description="إكمال ملف WeeklyWorkScheduleTable.tsx مع إصلاح جميع الأخطاء وإضافة ميزة الترتيب.">
"use client";

import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { DAYS } from "../../constants/schedule";
import { PeriodPart } from "@/types";

interface WeeklyWorkScheduleTableProps {
  isPrint?: boolean;
  isTransposed: boolean;
  isRTL: boolean;
  filteredEmployees: any[];
  activePeriodsPerDay: Record<number, string[]>;
  totalActiveColumns: number;
  getDayCells: (empId: string, dayId: number) => any[];
  getTransposedDayCells: (empId: string, dayId: number) => any[];
  subjects: any[];
  employees: any[];
  classes: any[];
  assignments: any[];
  selectedClassIds: string[];
  selectedPeriodParts: PeriodPart[];
  periodTimings: Record<string, string>;
  hoveredCell: { empId: string; dayId: number; period: string } | null;
  setHoveredCell: (cell: { empId: string; dayId: number; period: string } | null) => void;
}

type SortConfig = {
  key: "name" | "totalHours";
  direction: "asc" | "desc";
};

const WeeklyWorkScheduleTable = ({
  isPrint = false,
  isTransposed,
  isRTL,
  filteredEmployees,
  activePeriodsPerDay,
  totalActiveColumns,
  getDayCells,
  getTransposedDayCells,
  subjects,
  employees,
  classes,
  assignments,
  selectedClassIds,
  selectedPeriodParts,
  periodTimings,
  hoveredCell,
  setHoveredCell
}: WeeklyWorkScheduleTableProps) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "name", direction: "asc" });

  const sortedEmployees = useMemo(() => {
    const sorted = [...filteredEmployees];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        if (sortConfig.key === "name") {
          const nameA = `${a.lastName} ${a.firstName}`.toLowerCase();
          const nameB = `${b.lastName} ${b.firstName}`.toLowerCase();
          if (nameA < nameB) return sortConfig.direction === "asc" ? -1 : 1;
          if (nameA > nameB) return sortConfig.direction === "asc" ? 1 : -1;
          return 0;
        } else if (sortConfig.key === "totalHours") {
          const totalA = assignments.filter(a => 
            a.employeeId === a.id && 
            (selectedClassIds.includes("all") || selectedClassIds.includes(a.classId)) &&
            selectedPeriodParts.includes(parseInt(a.period) <= 4 ? "Morning" : parseInt(a.period) <= 7 ? "Afternoon" : "Evening")
          ).length;
          const totalB = assignments.filter(a => 
            a.employeeId === b.id && 
            (selectedClassIds.includes("all") || selectedClassIds.includes(a.classId)) &&
            selectedPeriodParts.includes(parseInt(a.period) <= 4 ? "Morning" : parseInt(a.period) <= 7 ? "Afternoon" : "Evening")
          ).length;
          if (totalA < totalB) return sortConfig.direction === "asc" ? -1 : 1;
          if (totalA > totalB) return sortConfig.direction === "asc" ? 1 : -1;
          return 0;
        }
        return 0;
      });
    }
    return sorted;
  }, [filteredEmployees, sortConfig, assignments, selectedClassIds, selectedPeriodParts]);

  const handleSort = (key: SortConfig["key"]) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ column }: { column: SortConfig["key"] }) => {
    if (sortConfig.key !== column) return <ArrowUpDown size={14} className="text-slate-400" />;
    return sortConfig.direction === "asc" ? <ArrowUp size={14} className="text-emerald-600" /> : <ArrowDown size={14} className="text-emerald-600" />;
  };

  if (isTransposed) {
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
              {sortedEmployees.map(emp => (
                <col key={emp.id} className={isPrint ? `${75 / sortedEmployees.length}%` : "w-[100px]"} />
              ))}
              <col className={isPrint ? "w-[5%]" : "w-[60px]"} />
            </colgroup>
            <TableHeader>
              <TableRow className={cn(isPrint ? "bg-slate-100/50 border-b-2 border-black h-5" : "bg-emerald-50/50 hover:bg-emerald-50/50 h-7")}>
                <TableHead className={cn("font-black text-emerald-900 border text-center", isPrint ? "text-[8px] p-0.5 border-black text-black" : "text-xs p-1 border-emerald-100")}>
                  {isRTL ? "اليوم" : "Day"}
                </TableHead>
                <TableHead className={cn("font-black text-emerald-900 border text-center", isPrint ? "text-[8px] p-0.5 border-black text-black" : "text-xs p-1 border-emerald-100")}>
                  {isRTL ? "الحصة" : "Period"}
                </TableHead>
                {sortedEmployees.map(emp => (
                  <TableHead                     key={emp.id} 
                    className={cn(
                      "text-center font-black border truncate transition-colors duration-150",
                      isPrint ? "text-[8px] p-0.5 border-black text-black" : cn("text-[10px] p-1 border-emerald-100 text-emerald-700", hoveredCell?.empId === emp.id ? "bg-emerald-100 text-emerald-900" : "bg-emerald-50/30")
                    )}
                  >
                    {emp.lastName} {emp.firstName}
                  </TableHead>
                ))}
                <TableHead className={cn("font-black text-emerald-900 border text-center", isPrint ? "text-[8px] p-0.5 border-black text-black" : "text-[10px] p-1 border-emerald-100")}>
                  {isRTL ? "کلی" : "Sum"}
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {DAYS.map(day => {
                const activePeriods = activePeriodsPerDay[day.id] || [];
                if (activePeriods.length === 0) return null;

                return activePeriods.map((p, pIdx) => (
                  <TableRow key={`${day.id}-${p}`} className={cn("group transition-colors duration-150", isPrint ? "h-6 border-b border-black" : "h-8 hover:bg-emerald-50/30", !isPrint && hoveredCell?.dayId === day.id && hoveredCell?.period === p && "bg-emerald-50/20")}>
                    {pIdx === 0 && (
                      <TableCell rowSpan={activePeriods.length} className={cn("font-black border bg-slate-50/50 text-center", isPrint ? "text-[8px] p-1 border-black text-black" : "text-[11px] p-1 border-emerald-100 text-emerald-950")}>
                        {isRTL ? day.name : day.en.substr(0, 3)}
                      </TableCell>
                    )}
                    <TableCell className={cn("font-bold border bg-white text-center leading-none", isPrint ? "text-[7.5px] p-0.5 border-black text-black" : "text-[9px] p-1 border-emerald-100 text-slate-500")}>
                      <span className="font-black block">{isRTL ? `ح${p}` : `P${p}`}</span>
                      <span className="text-[7px] font-normal opacity-75 mt-0.5 block">{periodTimings[p]}</span>
                    </TableCell>

                    {sortedEmployees.map(emp => {
                      const dayCells = getTransposedDayCells(emp.id, day.id);
                      const cell = dayCells.find(c => c.period === p);
                      if (!cell || cell.skip) return null;

                      const isActive = !!cell.assignment;
                      const subject = cell.assignment ? subjects.find(s => s.id === cell.assignment.subjectId) : null;
                      const cls = cell.assignment ? classes.find(c => c.id === cell.assignment.classId) : null;

                      return (
                        <TableCell                          key={`${emp.id}-${day.id}-${p}`}
                          rowSpan={cell.rowSpan}
                          className={cn(
                            "text-center border p-0.5 transition-colors duration-150 relative overflow-hidden",
                            isActive ? (isPrint ? "bg-slate-100 text-black border-black" : cn("text-white shadow-inner", (hoveredCell?.empId === emp.id && hoveredCell?.dayId === day.id && hoveredCell?.period === p) ? "bg-emerald-800" : "bg-emerald-600")) : (isPrint ? "bg-white border-black" : cn((hoveredCell?.empId === emp.id || (hoveredCell?.dayId === day.id && hoveredCell?.period === p)) ? "bg-emerald-50/30" : "hover:bg-emerald-50/50")),
                            isPrint ? "h-6 border-black" : "h-8 border-emerald-100"
                          )}
                          onMouseEnter={() => !isPrint && setHoveredCell({ empId: emp.id, dayId: day.id, period: p })}
                          onMouseLeave={() => !isPrint && setHoveredCell(null)}
                        >
                          {isActive ? (
                            <div className="flex flex-col items-center justify-center leading-none">
                              <span className={cn("font-black truncate max-w-full", isPrint ? "text-[7.5px]" : "text-[9.5px]")}>{subject?.name || "---"}</span>
                              <span className={cn("font-bold opacity-80 truncate max-w-full", isPrint ? "text-[6.5px]" : "text-[8px]")}>{cls?.name || "---"}</span>
                            </div>
                          ) : (
                            <span className="text-slate-200 opacity-20 text-[7px]">---</span>
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell className={cn("text-center border bg-slate-50/30 font-black", isPrint ? "text-[7.5px] border-black text-black" : "text-[10px] border-emerald-100 text-emerald-900")}>
                      {assignments.filter(a => a.day === day.id && a.period === p && (selectedClassIds.includes("all") || selectedClassIds.includes(a.classId))).length}
                    </TableCell>
                  </TableRow>
                ));
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-white",
      isPrint ? "p-0 w-full" : "rounded-2xl border border-emerald-100 shadow-md overflow-hidden"
    )}>
      {/* Sorting Controls - Only visible on screen */}
      {!isPrint && (
        <div className="p-4 bg-slate-50/50 border-b border-emerald-100 flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">
            {isRTL ? "الترتيب حسب:" : "Sort by:"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSort("name")}
            className={cn("h-7 px-3 text-xs font-bold", sortConfig.key === "name" && "bg-emerald-100 text-emerald-700")}
          >
            <SortIcon column="name" />
            {isRTL ? "اسم المعلم" : "Teacher Name"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSort("totalHours")}
            className={cn("h-7 px-3 text-xs font-bold", sortConfig.key === "totalHours" && "bg-emerald-100 text-emerald-700")}
          >
            <SortIcon column="totalHours" />
            {isRTL ? "إجمالي الساعات" : "Total Hours"}
          </Button>
        </div>
      )}

      <div className={cn(!isPrint && "overflow-x-auto")}>
        <Table className={cn(
          "border-collapse border-spacing-0 table-fixed",
          isPrint ? "w-full border-2 border-black" : "w-full min-w-[1000px]"
        )}>
          <colgroup>
            <col className={isPrint ? "w-[12%]" : "w-[140px]"} />
            {Array.from({ length: totalActiveColumns }).map((_, i) => (
              <col key={i} className={isPrint ? `${80 / totalActiveColumns}%` : "w-[70px]"} />
            ))}
            <col className={isPrint ? "w-[8%]" : "w-[80px]"} />
          </colgroup>
          <TableHeader>
            <TableRow className={cn(isPrint ? "bg-slate-50/50 border-b-2 border-black h-5" : "bg-emerald-50/50 hover:bg-emerald-50/50 h-7")}>
              <TableHead className={cn("font-black text-emerald-900 border text-center sticky left-0 z-20 bg-emerald-50/50", isPrint ? "text-[8px] p-0.5 border-black text-black" : "text-xs p-1 border-emerald-100")} rowSpan={2}>
                {isRTL ? "المعلم" : "Teacher"}
              </TableHead>
              {DAYS.map(day => {
                const colSpan = activePeriodsPerDay[day.id]?.length || 0;
                if (colSpan === 0) return null;
                return (
                  <TableHead key={day.id} className={cn("text-center font-black border", isPrint ? "text-[8px] p-0.5 border-black bg-slate-50 text-black" : "text-[10px] p-1 border-emerald-100 text-emerald-700")} colSpan={colSpan}>
                    {isRTL ? day.name : day.en.substr(0, 3)}
                  </TableHead>
                );
              })}
              <TableHead className={cn("text-center font-black border bg-emerald-900 text-white", isPrint ? "text-[8px] p-0.5 border-black" : "text-xs p-1")} rowSpan={2}>
                {isRTL ? "المجموع" : "Total"}
              </TableHead>
            </TableRow>
            <TableRow className={cn(isPrint ? "bg-slate-50/20 border-b-2 border-black h-5" : "bg-emerald-50/20 hover:bg-emerald-50/20 h-7")}>
              {DAYS.map(day => {
                const activePeriods = activePeriodsPerDay[day.id] || [];
                return activePeriods.map(p => (
                  <TableHead key={`${day.id}-${p}`} className={cn("text-center font-bold border p-0.5 transition-colors duration-150", isPrint ? "text-[7px] border-black text-black" : cn("border-emerald-100 text-slate-400", (hoveredCell?.dayId === day.id && hoveredCell?.period === p) && "bg-emerald-100 text-emerald-900"))}>
                    <div className="flex flex-col items-center justify-center leading-none">
                      <span className="font-black">{isRTL ? `ح${p}` : `P${p}`}</span>
                      <span className={cn("font-normal opacity-75 mt-0.5 block tracking-tighter", isPrint ? "text-[4.5px]" : "text-[7px]")}>{periodTimings[p]}</span>
                    </div>
                  </TableHead>
                ));
              })}
            </TableRow>
          </TableHeader>

          <TableBody>
            {sortedEmployees.map(emp => {
              const totalHours = assignments.filter(a => 
                a.employeeId === emp.id && 
                (selectedClassIds.includes("all") || selectedClassIds.includes(a.classId)) &&
                selectedPeriodParts.includes(parseInt(a.period) <= 4 ? "Morning" : parseInt(a.period) <= 7 ? "Afternoon" : "Evening")
              ).length;

              return (
                <TableRow key={emp.id} className={cn("group transition-colors duration-150", isPrint ? "h-6 border-b border-black" : "h-8 hover:bg-emerald-50/30", !isPrint && hoveredCell?.empId === emp.id && "bg-emerald-50/20")}>
                  <TableCell className={cn("font-bold border bg-white truncate sticky left-0 z-10 shadow-sm transition-colors duration-150", isPrint ? "text-[8px] p-1 border-black text-black" : cn("text-[11px] p-1 border-emerald-100 text-emerald-950 group-hover:bg-emerald-50/30", hoveredCell?.empId === emp.id && "bg-emerald-50/40") )}>
                    {emp.lastName} {emp.firstName}
                  </TableCell>
                  {DAYS.map(day => {
                    const dayCells = getDayCells(emp.id, day.id);
                    return dayCells.map(cell => {
                      if (cell.skip) return null;
                      const isActive = !!cell.assignment;
                      const subject = cell.assignment ? subjects.find(s => s.id === cell.assignment.subjectId) : null;
                      const cls = cell.assignment ? classes.find(c => c.id === cell.assignment.classId) : null;

                      return (
                        <TableCell
                          key={`${emp.id}-${day.id}-${cell.period}`}
                          colSpan={cell.colSpan}
                          className={cn(
                            "text-center border p-0.5 transition-colors duration-150 relative overflow-hidden",
                            isActive ? (isPrint ? "bg-slate-100 text-black border-black" : cn("text-white shadow-inner", (hoveredCell?.empId === emp.id && hoveredCell?.dayId === day.id && hoveredCell?.period === cell.period) ? "bg-emerald-800" : "bg-emerald-600")) : (isPrint ? "bg-white border-black" : cn((hoveredCell?.empId === emp.id || (hoveredCell?.dayId === day.id && hoveredCell?.period === cell.period)) ? "bg-emerald-50/30" : "hover:bg-emerald-50/50")),
                            isPrint ? "h-6 border-black" : "h-8 border-emerald-100"
                          )}
                          onMouseEnter={() => !isPrint && setHoveredCell({ empId: emp.id, dayId: day.id, period: cell.period })}
                          onMouseLeave={() => !isPrint && setHoveredCell(null)}
                        >
                          {isActive ? (
                            <div className="flex flex-col items-center justify-center leading-none">
                              <span className={cn("font-black truncate max-w-full", isPrint ? "text-[7.5px]" : "text-[9.5px]")}>{subject?.name || "---"}</span>
                              <span className={cn("font-bold opacity-80 truncate max-w-full", isPrint ? "text-[6.5px]" : "text-[8px]")}>{cls?.name || "---"}</span>
                            </div>
                          ) : (
                            <span className="text-slate-200 opacity-20 text-[7px]">---</span>
                          )}
                        </TableCell>
                      );
                    });
                  })}
                  <TableCell className={cn("text-center border bg-emerald-50 font-black", isPrint ? "text-[9px] border-black text-black" : "text-sm border-emerald-200 text-emerald-700")}>
                    {totalHours}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default WeeklyWorkScheduleTable;