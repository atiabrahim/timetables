"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { DAYS } from "../../constants/schedule";

const PERIOD_TIMES: Record<string, string> = {
  "1": "08:00-09:00", "2": "09:00-10:00", "3": "10:00-11:00", "4": "11:00-12:00",
  "5": "13:00-14:00", "6": "14:00-15:00", "7": "15:00-16:00", "8": "16:00-17:00",
  "9": "17:00-18:00", "10": "18:00-19:00", "11": "19:00-20:00", "12": "20:00-21:00",
};

interface MasterClassesScheduleTableProps {
  isPrint?: boolean;
  isTransposed: boolean;
  isRTL: boolean;
  filteredClasses: any[];
  activePeriodsPerDay: Record<number, string[]>;
  totalActiveColumns: number;
  getDayCells: (classId: string, dayId: number) => any[];
  getTransposedDayCells: (classId: string, dayId: number) => any[];
  subjects: any[];
  employees: any[];
  classes: any[];
  hoveredCell: { classId: string; dayId: number; period: string } | null;
  setHoveredCell: (cell: { classId: string; dayId: number; period: string } | null) => void;
  orientation: "landscape" | "portrait";
}

const MasterClassesScheduleTable = ({
  isPrint = false,
  isTransposed,
  isRTL,
  filteredClasses,
  activePeriodsPerDay,
  totalActiveColumns,
  getDayCells,
  getTransposedDayCells,
  subjects,
  employees,
  classes,
  hoveredCell,
  setHoveredCell,
  orientation
}: MasterClassesScheduleTableProps) => {
  
  const rowCount = isTransposed 
    ? DAYS.reduce((sum, day) => sum + (activePeriodsPerDay[day.id]?.length || 0), 0)
    : filteredClasses.length;

  const printRowHeight = isPrint ? `${Math.min(20, Math.max(4, 150 / (rowCount + 1)))}mm` : undefined;
  const screenRowHeight = !isPrint ? `${Math.min(96, Math.max(32, 380 / rowCount))}px` : undefined;

  const dynamicRowStyle = { height: isPrint ? printRowHeight : screenRowHeight };

  if (isTransposed) {
    return (
      <div className={cn("bg-white mx-auto w-full", isPrint ? "p-0" : "rounded-2xl border border-emerald-100 shadow-md overflow-hidden")}>
        <div className={cn(!isPrint && "overflow-x-auto")}>
          <table className={cn("border-collapse border-spacing-0 table-fixed w-full", isPrint ? "border-2 border-black" : "min-w-[1000px]")}>
            <colgroup>
              <col className={isPrint ? "w-[6%]" : "w-[80px]"} />
              <col className={isPrint ? "w-[5%]" : "w-[80px]"} />
              {filteredClasses.map(cls => (
                <col key={cls.id} className={isPrint ? `${89 / filteredClasses.length}%` : "w-[100px]"} />
              ))}
            </colgroup>
            <thead>
              <tr className={cn(isPrint ? "bg-slate-50 border-b-2 border-black h-5" : "bg-emerald-50/50 h-7")}>
                <th className={cn("font-black border text-center leading-none", isPrint ? "text-[6.5px] p-0.5 border-black text-black" : "text-xs p-1 border-emerald-100")}>{isRTL ? "اليوم" : "Day"}</th>
                <th className={cn("font-black border text-center leading-none", isPrint ? "text-[6px] p-0.5 border-black text-black" : "text-xs p-1 border-emerald-100")}>{isRTL ? "ح" : "P"}</th>
                {filteredClasses.map(cls => (
                  <th key={cls.id} className={cn("text-center font-black border truncate leading-none", isPrint ? "text-[6.5px] p-0.5 border-black text-black bg-slate-50" : "text-[10px] p-1 border-emerald-100")}>{cls.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map(day => {
                const activePeriods = activePeriodsPerDay[day.id] || [];
                if (activePeriods.length === 0) return null;
                return activePeriods.map((p, pIdx) => (
                  <tr key={`${day.id}-${p}`} style={dynamicRowStyle} className={cn("group", isPrint ? "border-b border-black" : "hover:bg-emerald-50/30")}>
                    {pIdx === 0 && (
                      <td rowSpan={activePeriods.length} className={cn("font-black border bg-slate-50/50 text-center leading-none", isPrint ? "text-[7px] p-0.5 border-black text-black" : "text-[11px] p-1 border-emerald-100 text-emerald-950")}>{isRTL ? day.name : day.en.substr(0, 3)}</td>
                    )}
                    <td className={cn("font-bold border bg-white text-center leading-none", isPrint ? "text-[6px] p-0.5 border-black text-black" : "text-[9px] p-1 border-emerald-100")}>{p}</td>
                    {filteredClasses.map(cls => {
                      const dayCells = getTransposedDayCells(cls.id, day.id);
                      const cell = dayCells.find(c => c.period === p);
                      if (!cell || cell.skip) return null;
                      const isActive = !!cell.assignment;
                      const subject = cell.assignment ? subjects.find(s => s.id === cell.assignment.subjectId) : null;
                      const emp = cell.assignment ? employees.find(e => e.id === cell.assignment.employeeId) : null;
                      return (
                        <td key={`${cls.id}-${day.id}-${p}`} rowSpan={cell.rowSpan} className={cn("text-center border p-0.5 transition-colors relative overflow-hidden leading-tight", isActive ? (isPrint ? "bg-slate-100 text-black border-black" : "text-white bg-emerald-600 shadow-inner") : (isPrint ? "bg-white border-black" : "hover:bg-emerald-50/50"))}>
                          {isActive ? (
                            <div className="flex flex-col items-center justify-center">
                              <span className={cn("font-black truncate max-w-full", isPrint ? "text-[6.5px]" : "text-[9.5px]")}>{subject?.name || "---"}</span>
                              <span className={cn("font-bold opacity-80 truncate max-w-full", isPrint ? "text-[5.5px]" : "text-[8px]")}>{emp ? `${emp.lastName}` : "---"}</span>
                            </div>
                          ) : (
                            <span className={cn("opacity-20", isPrint ? "text-[5px]" : "text-[7px]")}>---</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-white mx-auto w-full", isPrint ? "p-0" : "rounded-2xl border border-emerald-100 shadow-md overflow-hidden")}>
      <div className={cn(!isPrint && "overflow-x-auto")}>
        <table className={cn("border-collapse border-spacing-0 table-fixed w-full", isPrint ? "border-2 border-black" : "min-w-[1000px]")}>
          <colgroup>
            <col className={isPrint ? "w-[12%]" : "w-[140px]"} />
            {Array.from({ length: totalActiveColumns }).map((_, i) => (
              <col key={i} className={isPrint ? `${88 / totalActiveColumns}%` : "w-[70px]"} />
            ))}
          </colgroup>
          <thead>
            <tr className={cn(isPrint ? "bg-slate-50 border-b-2 border-black h-5" : "bg-emerald-50/50 h-7")}>
              <th className={cn("font-black text-emerald-900 border text-center sticky left-0 z-20 bg-emerald-50/50 leading-none", isPrint ? "text-[7px] p-0.5 border-black text-black" : "text-xs p-1 border-emerald-100")} rowSpan={2}>{isRTL ? "الفرع" : "Branch"}</th>
              {DAYS.map(day => {
                const colSpan = activePeriodsPerDay[day.id]?.length || 0;
                if (colSpan === 0) return null;
                return (
                  <th key={day.id} className={cn("text-center font-black border leading-none", isPrint ? "text-[7px] p-0.5 border-black bg-slate-50 text-black" : "text-[10px] p-1 bg-emerald-50/30 border-emerald-100 text-emerald-700")} colSpan={colSpan}>{isRTL ? day.name : day.en.substr(0, 3)}</th>
                );
              })}
            </tr>
            <tr className={cn(isPrint ? "bg-slate-50/20 border-b-2 border-black h-5" : "bg-emerald-50/20 h-7")}>
              {DAYS.map(day => {
                const activePeriods = activePeriodsPerDay[day.id] || [];
                return activePeriods.map(p => (
                  <th key={`${day.id}-${p}`} className={cn("text-center font-bold border p-0.5 transition-colors leading-none", isPrint ? "text-[6px] border-black text-black" : "border-emerald-100 text-slate-400")}>
                    <span className="font-black">{isRTL ? `ح${p}` : `P${p}`}</span>
                  </th>
                ));
              })}
            </tr>
          </thead>
          <tbody>
            {filteredClasses.map(cls => (
              <tr key={cls.id} style={dynamicRowStyle} className={cn("group", isPrint ? "border-b border-black" : "hover:bg-emerald-50/30")}>
                <td className={cn("font-bold border bg-white truncate sticky left-0 z-10 shadow-sm transition-colors leading-tight", isPrint ? "text-[7px] p-0.5 border-black text-black" : cn("text-[11px] p-1 border-emerald-100 text-emerald-950"))}>{cls.name}</td>
                {DAYS.map(day => {
                  const dayCells = getDayCells(cls.id, day.id);
                  return dayCells.map(cell => {
                    if (cell.skip) return null;
                    const isActive = !!cell.assignment;
                    const subject = cell.assignment ? subjects.find(s => s.id === cell.assignment.subjectId) : null;
                    const emp = cell.assignment ? employees.find(e => e.id === cell.assignment.employeeId) : null;
                    return (
                      <td key={`${cls.id}-${day.id}-${cell.period}`} colSpan={cell.colSpan} className={cn("text-center border p-0.5 transition-colors relative overflow-hidden leading-tight", isActive ? (isPrint ? "bg-slate-100 text-black border-black" : "text-white bg-emerald-600 shadow-inner") : (isPrint ? "bg-white border-black" : "hover:bg-emerald-50/50"))}>
                        {isActive ? (
                          <div className="flex flex-col items-center justify-center">
                            <span className={cn("font-black truncate max-w-full", isPrint ? "text-[6.5px]" : "text-[9.5px]")}>{subject?.name || "---"}</span>
                            <span className={cn("font-bold opacity-80 truncate max-w-full", isPrint ? "text-[5px]" : "text-[8px]")}>{emp ? `${emp.lastName}` : "---"}</span>
                          </div>
                        ) : (
                          <span className={cn("opacity-20", isPrint ? "text-[5px]" : "text-[7px]")}>---</span>
                        )}
                      </td>
                    );
                  });
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MasterClassesScheduleTable;