"use client";

import React from "react";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ScheduleTableProps {
  isRTL: boolean;
  days: any[];
  timeSlots: any[];
  getAssignment: (day: number, period: string) => any;
  onAddClick: (day: number, period: string) => void;
  onDeleteClick: (id: string) => void;
  subjects: any[];
  employees: any[];
  classes: any[];
  viewMode: "class" | "teacher";
  isPrint?: boolean;
  summaryData?: any[];
  totalHours?: number;
  isTransposed?: boolean;
  allAssignments?: any[]; 
}

const SUBJECT_COLORS = [
  "bg-emerald-600", "bg-blue-600", "bg-amber-600", "bg-rose-600", 
  "bg-indigo-600", "bg-teal-600", "bg-violet-600", "bg-cyan-600",
  "bg-orange-600", "bg-slate-700"
];

const getSubjectColor = (index: number) => SUBJECT_COLORS[index % SUBJECT_COLORS.length];

const ScheduleTable = ({ 
  isRTL, days, timeSlots, getAssignment, onAddClick, onDeleteClick, 
  subjects, employees, classes, viewMode, isPrint = false, summaryData, totalHours, isTransposed = false,
  allAssignments = []
}: ScheduleTableProps) => {
  
  const checkConflict = (asgn: any) => {
    if (!asgn || isPrint) return null;
    const conflicts = allAssignments.filter(a => 
      a.id !== asgn.id && a.day === asgn.day && a.period === asgn.period &&
      (a.employeeId === asgn.employeeId || (asgn.room && a.room === asgn.room))
    );
    if (conflicts.length > 0) {
      const type = conflicts[0].employeeId === asgn.employeeId ? "Teacher" : "Room";
      return {
        type,
        with: type === "Teacher" ? (isRTL ? "الأستاذ مشغول" : "Teacher occupied") : (isRTL ? "القاعة مشغولة" : "Room occupied")
      };
    }
    return null;
  };

  const SummaryTable = () => (
    <div className={cn("shrink-0", isPrint ? "w-[120px]" : "w-[200px] sticky top-0 h-fit")}>
      <div className={cn(
        "bg-white border overflow-hidden",
        isPrint ? "rounded-none border-black" : "rounded-3xl border-slate-100 shadow-xl shadow-slate-900/5"
      )}>
        <table className="w-full border-collapse">
          <thead>
            <tr className={cn(isPrint ? "bg-slate-100 border-b border-black" : "bg-emerald-950 text-white")}>
              <th className={cn(
                "p-2 font-black uppercase", 
                isPrint ? "text-[8px] text-black" : "text-[11px]",
                isRTL ? "text-right" : "text-left"
              )}>
                {isRTL ? "المادة" : "Subject"}
              </th>
              <th className={cn(
                "p-2 font-black uppercase text-center border-s", 
                isPrint ? "text-[8px] text-black border-black" : "text-[11px] border-white/10"
              )}>
                {isRTL ? "الزمن" : "Time"}
              </th>
            </tr>
          </thead>
          <tbody className={cn(isPrint ? "divide-y divide-black" : "divide-y divide-slate-100")}>
            {summaryData?.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className={cn(
                  "p-2 leading-none", 
                  isRTL ? "text-right" : "text-left"
                )}>
                  <span className={cn("font-bold block truncate", isPrint ? "text-[8px] text-black" : "text-[12px] text-slate-800")}>
                    {item.subject}
                  </span>
                </td>
                <td className={cn(
                  "p-2 text-center leading-none border-s", 
                  isPrint ? "border-black" : "border-slate-100"
                )}>
                  <span className={cn("font-black", isPrint ? "text-[8px] text-black" : "text-[13px] text-emerald-700")}>
                    {item.count}
                  </span>
                </td>
              </tr>
            ))}
            <tr className={cn("font-black", isPrint ? "bg-slate-50 border-t-2 border-black" : "bg-emerald-50")}>
              <td className={cn(
                "p-2", 
                isPrint ? "text-[8px] text-black" : "text-[12px] text-emerald-900",
                isRTL ? "text-right" : "text-left"
              )}>
                {isRTL ? "المجموع الكلي" : "Total Sum"}
              </td>
              <td className={cn("p-2 text-center border-s", isPrint ? "text-[9px] text-black border-black" : "text-[14px] text-emerald-600 font-black border-emerald-100")}>
                {totalHours}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const LessonCard = ({ assignment }: { assignment: any }) => {
    const subjectIndex = subjects.findIndex(s => s.id === assignment.subjectId);
    const colorClass = getSubjectColor(subjectIndex);
    const conflict = checkConflict(assignment);

    return (
      <div className={cn(
        "h-full w-full flex flex-col justify-center items-center text-center relative transition-all group/card",
        isPrint ? "p-0 text-black bg-white" : cn(
          "text-white shadow-md rounded-xl p-2", 
          conflict ? "bg-amber-500" : colorClass,
          "hover:scale-[1.02]"
        )
      )}>
        <p className={cn("font-black leading-none truncate w-full", isPrint ? "text-[8px] mb-0.5" : "text-[11px] mb-1")}>
          {subjects.find(s => s.id === assignment.subjectId)?.name || "---"}
        </p>
        <p className={cn("font-bold leading-tight truncate w-full", isPrint ? "text-[7px]" : "text-[8px] opacity-90")}>
          {viewMode === "class" 
            ? (() => {
                const e = employees.find(emp => emp.id === assignment.employeeId);
                return e ? `${e.lastName} ${e.firstName}` : "---";
              })()
            : classes.find(c => c.id === assignment.classId)?.name
          }
        </p>
        {!isPrint && (
          <button 
            className="absolute -top-1 -right-1 opacity-0 group-hover/card:opacity-100 bg-white text-red-500 p-1 rounded-full shadow-lg"
            onClick={(e) => { e.stopPropagation(); onDeleteClick(assignment.id); }}
          >
            <Trash2 size={10} />
          </button>
        )}
      </div>
    );
  };

  const tableClasses = cn(
    "w-full border-collapse h-full table-fixed",
    isPrint ? "border-2 border-black" : ""
  );

  const renderStandard = () => (
    <table className={tableClasses}>
      <thead>
        <tr className={isPrint ? "h-6" : "h-14"}>
          <th className={cn("font-black text-center w-14", isPrint ? "border border-black text-[9px] bg-slate-100" : "rounded-2xl bg-emerald-950 text-emerald-400 p-2 text-[10px]")}>
            {isRTL ? "الحصة" : "PERIOD"}
          </th>
          {days.map(day => (
            <th key={day.id} className={cn("font-black text-center px-1", isPrint ? "border border-black text-[9px] bg-slate-100" : "rounded-2xl bg-slate-100 text-slate-500 p-1 uppercase text-[10px]")}>
              {isRTL ? day.name : day.en}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {timeSlots.map(slot => (
          <tr key={slot.id} className={cn(isPrint ? "h-14" : "h-20")}>
            <td className={cn(isPrint ? "border border-black px-1" : "p-1")}>
              <div className="flex flex-col items-center justify-center h-full">
                <span className={cn("font-black", isPrint ? "text-[9px]" : "text-sm text-slate-400")}>{slot.label}</span>
                {slot.time && <span className={cn("font-bold opacity-60", isPrint ? "text-[6px]" : "text-[8px]")}>{slot.time}</span>}
              </div>
            </td>
            {days.map(day => {
              const assignment = getAssignment(day.id, slot.id);
              return (
                <td key={day.id} className={cn("relative h-full", isPrint ? "border border-black" : "p-1")}>
                  {assignment ? <LessonCard assignment={assignment} /> : (
                    !isPrint && (
                      <div className="h-full w-full rounded-xl border-2 border-dashed border-slate-100 flex items-center justify-center cursor-pointer hover:bg-emerald-50 transition-all" onClick={() => onAddClick(day.id, slot.id)}>
                        <Plus size={14} className="text-slate-200" />
                      </div>
                    )
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderTransposed = () => (
    <table className={tableClasses}>
      <thead>
        <tr className={isPrint ? "h-6" : "h-14"}>
          <th className={cn("font-black text-center w-24", isPrint ? "border border-black text-[9px] bg-slate-100" : "rounded-2xl bg-emerald-950 text-emerald-400 p-2 text-[10px]")}>
            {isRTL ? "اليوم" : "DAY"}
          </th>
          {timeSlots.map(slot => (
            <th key={slot.id} className={cn("font-black text-center px-1", isPrint ? "border border-black text-[9px] bg-slate-100" : "rounded-2xl bg-slate-100 text-slate-500 p-1 text-[10px]")}>
              <div className="flex flex-col items-center">
                <span>{slot.label}</span>
                {slot.time && <span className="text-[7px] font-bold opacity-60 lowercase">{slot.time}</span>}
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {days.map(day => (
          <tr key={day.id} className={cn(isPrint ? "h-14" : "h-20")}>
            <td className={cn(isPrint ? "border border-black px-1" : "p-1")}>
              <div className="flex items-center justify-center h-full">
                <span className={cn("font-black", isPrint ? "text-[9px]" : "text-[11px] text-slate-500")}>{isRTL ? day.name : day.en}</span>
              </div>
            </td>
            {timeSlots.map(slot => {
              const assignment = getAssignment(day.id, slot.id);
              return (
                <td key={slot.id} className={cn("relative h-full", isPrint ? "border border-black" : "p-1")}>
                  {assignment ? <LessonCard assignment={assignment} /> : (
                    !isPrint && (
                      <div className="h-full w-full rounded-xl border-2 border-dashed border-slate-100 flex items-center justify-center cursor-pointer hover:bg-emerald-50 transition-all" onClick={() => onAddClick(day.id, slot.id)}>
                        <Plus size={14} className="text-slate-200" />
                      </div>
                    )
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className={cn(
      "flex", 
      isRTL ? "flex-row" : "flex-row-reverse", 
      "gap-1 items-start w-full overflow-x-auto pb-6"
    )}>
      <div className={cn("h-full", isPrint ? "flex-1" : "flex-1 min-w-[800px]")}>
        {isTransposed ? renderTransposed() : renderStandard()}
      </div>
      <SummaryTable />
    </div>
  );
};

export default ScheduleTable;