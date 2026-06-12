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
  if (isTransposed) {
    return (
      <div className={cn(
        "bg-white mx-auto w-full",
        isPrint ? "p-0 flex-1 flex flex-col justify-center" : "rounded-2xl border border-emerald-100 shadow-md overflow-hidden w-full"
      )}>
        <div className={cn(!isPrint && "overflow-x-auto", isPrint && "w-full")}>
          <table className={cn(
            "border-collapse border-spacing-0 table-fixed w-full", 
            isPrint ? "border-2 border-black" : "min-w-[1000px]"
          )}>
            <colgroup>
              <col className={isPrint ? "w-[10%]" : "w-[80px]"} />
              <col className={isPrint ? "w-[10%]" : "w-[80px]"} />
              {filteredClasses.map(cls => (
                <col key={cls.id} className={isPrint ? `${80 / filteredClasses.length}%` : "w-[100px]"} />
              ))}
            </colgroup>
            <thead>
              <tr className={cn(isPrint ? "bg-slate-50/50 border-b-2 border-black h-5" : "bg-emerald-50/50 hover:bg-emerald-50/50 h-7")}>
                <th className={cn(
                  "font-black text-emerald-900 border text-center",
                  isPrint ? "text-[7.5px] p-0.5 border-black text-black" : "text-xs p-1 border-emerald-100"
                )}>
                  {isRTL ? "اليوم" : "Day"}
                </th>
                <th className={cn(
                  "font-black text-emerald-900 border text-center",
                  isPrint ? "text-[7.5px] p-0.5 border-black text-black" : "text-xs p-1 border-emerald-100"
                )}>
                  {isRTL ? "الحصة" : "Period"}
                </th>
                {filteredClasses.map(cls => {
                  const isColHovered = hoveredCell?.classId === cls.id;
                  return (
                    <th 
                      key={cls.id} 
                      className={cn(
                        "text-center font-black border truncate transition-colors duration-150",
                        isPrint ? "text-[7.5px] p-0.5 border-black bg-slate-50 text-black" : cn("text-[10px] p-1 border-emerald-100 text-emerald-700", isColHovered ? "bg-emerald-100 text-emerald-900" : "bg-emerald-50/30")
                      )}
                    >
                      {cls.name}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {DAYS.map(day => {
                const activePeriods = activePeriodsPerDay[day.id] || [];
                if (activePeriods.length === 0) return null;

                return activePeriods.map((p, pIdx) => {
                  const isRowHovered = hoveredCell?.dayId === day.id && hoveredCell?.period === p;
                  return (
                    <tr key={`${day.id}-${p}`} className={cn("group transition-colors duration-150", isPrint ? "border-b border-black" : "h-8 hover:bg-emerald-50/30", !isPrint && isRowHovered && "bg-emerald-50/20")}>
                      {pIdx === 0 && (
                        <td 
                          rowSpan={activePeriods.length}
                          className={cn(
                            "font-black border bg-slate-50/50 text-center",
                            isPrint ? "text-[7.5px] p-0.5 border-black text-black" : "text-[11px] p-1 border-emerald-100 text-emerald-950"
                          )}
                        >
                          {isRTL ? day.name : day.en.substr(0, 3)}
                        </td>
                      )}
                      <td className={cn(
                        "font-bold border bg-white text-center leading-none",
                        isPrint ? "text-[7px] p-0.5 border-black text-black" : "text-[9px] p-1 border-emerald-100 text-slate-500"
                      )}>
                        <span className="font-black block">{isRTL ? `ح${p}` : `P${p}`}</span>
                        <span className="text-[6px] font-normal opacity-75 mt-0.5 block">{PERIOD_TIMES[p]}</span>
                      </td>

                      {filteredClasses.map(cls => {
                        const dayCells = getTransposedDayCells(cls.id, day.id);
                        const cell = dayCells.find(c => c.period === p);
                        if (!cell || cell.skip) return null;

                        const isActive = !!cell.assignment;
                        const subject = cell.assignment ? subjects.find(s => s.id === cell.assignment.subjectId) : null;
                        const emp = cell.assignment ? employees.find(e => e.id === cell.assignment.employeeId) : null;
                        const isCellHovered = hoveredCell?.classId === cls.id || (hoveredCell?.dayId === day.id && hoveredCell?.period === p);
                        const isExactHovered = hoveredCell?.classId === cls.id && hoveredCell?.dayId === day.id && hoveredCell?.period === p;

                        return (
                          <td
                            key={`${cls.id}-${day.id}-${p}`}
                            rowSpan={cell.rowSpan}
                            className={cn(
                              "text-center border transition-colors duration-150 relative overflow-hidden",
                              isActive ? (isPrint ? "bg-slate-100 text-black border-black" : cn("text-white shadow-inner", isExactHovered ? "bg-emerald-800" : "bg-emerald-600")) : (isPrint ? "bg-white border-black" : cn(isCellHovered ? "bg-emerald-50/30" : "hover:bg-emerald-50/50")),
                              isPrint ? "p-[1px] border-black" : "p-0.5 h-8 border-emerald-100"
                            )}
                            onMouseEnter={() => !isPrint && setHoveredCell({ classId: cls.id, dayId: day.id, period: p })}
                            onMouseLeave={() => !isPrint && setHoveredCell(null)}
                          >
                            {isActive ? (
                              <div className="flex flex-col items-center justify-center leading-none">
                                <span className={cn("font-black truncate max-w-full", isPrint ? "text-[6.5px]" : "text-[9.5px]")}>
                                  {subject?.name || "---"}
                                </span>
                                <span className={cn("font-bold opacity-80 truncate max-w-full", isPrint ? "text-[5.5px]" : "text-[8px]")}>
                                  {emp ? `${emp.lastName} ${emp.firstName}` : "---"}
                                </span>
                                {cell.assignment.room && (
                                  <span className={cn("font-medium opacity-70 truncate max-w-full", isPrint ? "text-[5px]" : "text-[7.5px]")}>
                                    {cell.assignment.room}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-200 opacity-20 text-[7px]">---</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-white mx-auto w-full",
      isPrint ? "p-0 flex-1 flex flex-col justify-center" : "rounded-2xl border border-emerald-100 shadow-md overflow-hidden w-full"
    )}>
      <div className={cn(!isPrint && "overflow-x-auto", isPrint && "w-full")}>
        <table className={cn(
          "border-collapse border-spacing-0 table-fixed w-full", 
          isPrint ? "border-2 border-black" : "min-w-[1000px]"
        )}>
          <colgroup>
            <col className={isPrint ? "w-[15%]" : "w-[140px]"} />
            {Array.from({ length: totalActiveColumns }).map((_, i) => (
              <col key={i} className={isPrint ? `${85 / totalActiveColumns}%` : "w-[70px]"} />
            ))}
          </colgroup>
          <thead>
            <tr className={cn(isPrint ? "bg-slate-50/50 border-b-2 border-black h-5" : "bg-emerald-50/50 hover:bg-emerald-50/50 h-7")}>
              <th className={cn(
                "font-black text-emerald-900 border text-center sticky left-0 z-20 bg-emerald-50/50",
                isPrint ? "text-[7.5px] p-0.5 border-black text-black" : "text-xs p-1 border-emerald-100"
              )} rowSpan={2}>
                {isRTL ? "الفرع" : "Branch"}
              </th>
              {DAYS.map(day => {
                const colSpan = activePeriodsPerDay[day.id]?.length || 0;
                if (colSpan === 0) return null;
                return (
                  <th 
                    key={day.id} 
                    className={cn(
                      "text-center font-black border",
                      isPrint ? "text-[7.5px] p-0.5 border-black bg-slate-50 text-black" : "text-[10px] p-1 bg-emerald-50/30 border-emerald-100 text-emerald-700"
                    )} 
                    colSpan={colSpan}
                  >
                    {isRTL ? day.name : day.en.substr(0, 3)}
                  </th>
                );
              })}
            </tr>
            <tr className={cn(isPrint ? "bg-slate-50/20 border-b-2 border-black h-5" : "bg-emerald-50/20 hover:bg-emerald-50/20 h-7")}>
              {DAYS.map(day => {
                const activePeriods = activePeriodsPerDay[day.id] || [];
                return activePeriods.map(p => {
                  const isColHovered = hoveredCell?.dayId === day.id && hoveredCell?.period === p;
                  return (
                    <th key={`${day.id}-${p}`} className={cn(
                      "text-center font-bold border p-0.5 transition-colors duration-150",
                      isPrint ? "text-[6.5px] border-black text-black" : cn("border-emerald-100 text-slate-400", isColHovered && "bg-emerald-100 text-emerald-900")
                    )}>
                      <div className="flex flex-col items-center justify-center leading-none">
                        <span className="font-black">{isRTL ? `ح${p}` : `P${p}`}</span>
                        <span className={cn("font-normal opacity-75 mt-0.5 block tracking-tighter", isPrint ? "text-[4.5px]" : "text-[7px]")}>
                          {PERIOD_TIMES[p]}
                        </span>
                      </div>
                    </th>
                  );
                });
              })}
            </tr>
          </thead>

          <tbody>
            {filteredClasses.map(cls => {
              const isRowHovered = hoveredCell?.classId === cls.id;
              return (
                <tr key={cls.id} className={cn("group transition-colors duration-150", isPrint ? "border-b border-black" : "h-8 hover:bg-emerald-50/30", !isPrint && isRowHovered && "bg-emerald-50/20")}>
                  <td className={cn(
                    "font-bold border bg-white truncate sticky left-0 z-10 shadow-sm transition-colors duration-150",
                    isPrint ? "text-[7.5px] p-1 border-black text-black" : cn("text-[11px] p-1 border-emerald-100 text-emerald-950 group-hover:bg-emerald-50/30", isRowHovered && "bg-emerald-50/40")
                  )}>
                    {cls.name}
                  </td>
                  {DAYS.map(day => {
                    const dayCells = getDayCells(cls.id, day.id);
                    return dayCells.map(cell => {
                      if (cell.skip) return null;
                      const isActive = !!cell.assignment;
                      const subject = cell.assignment ? subjects.find(s => s.id === cell.assignment.subjectId) : null;
                      const emp = cell.assignment ? employees.find(e => e.id === cell.assignment.employeeId) : null;
                      const isCellHovered = hoveredCell?.classId === cls.id || (hoveredCell?.dayId === day.id && hoveredCell?.period === cell.period);
                      const isExactHovered = hoveredCell?.classId === cls.id && hoveredCell?.dayId === day.id && hoveredCell?.period === cell.period;

                      return (
                        <td
                          key={`${cls.id}-${day.id}-${cell.period}`}
                          colSpan={cell.colSpan}
                          className={cn(
                            "text-center border transition-colors duration-150 relative overflow-hidden",
                            isActive ? (isPrint ? "bg-slate-100 text-black border-black" : cn("text-white shadow-inner", isExactHovered ? "bg-emerald-800" : "bg-emerald-600")) : (isPrint ? "bg-white border-black" : cn(isCellHovered ? "bg-emerald-50/30" : "hover:bg-emerald-50/50")),
                            isPrint ? "p-[1px] border-black" : "p-0.5 h-8 border-emerald-100"
                          )}
                          onMouseEnter={() => !isPrint && setHoveredCell({ classId: cls.id, dayId: day.id, period: cell.period })}
                          onMouseLeave={() => !isPrint && setHoveredCell(null)}
                        >
                          {isActive ? (
                            <div className="flex flex-col items-center justify-center leading-none">
                              <span className={cn("font-black truncate max-w-full", isPrint ? "text-[6.5px]" : "text-[9.5px]")}>
                                {subject?.name || "---"}
                              </span>
                              <span className={cn("font-bold opacity-80 truncate max-w-full", isPrint ? "text-[5.5px]" : "text-[8px]")}>
                                {emp ? `${emp.lastName} ${emp.firstName}` : "---"}
                              </span>
                              {cell.assignment.room && (
                                <span className={cn("font-medium opacity-70 truncate max-w-full", isPrint ? "text-[5px]" : "text-[7.5px]")}>
                                  {cell.assignment.room}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-200 opacity-20 text-[7px]">---</span>
                          )}
                        </td>
                      );
                    });
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MasterClassesScheduleTable;