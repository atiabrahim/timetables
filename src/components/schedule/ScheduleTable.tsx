"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
  subjects, employees, classes, viewMode, isPrint = false, summaryData = [], totalHours = 0, isTransposed = false,
  allAssignments = []
}: ScheduleTableProps) => {
  
  const SummaryTable = () => (
    <div className={cn("shrink-0", isPrint ? "w-[130px]" : "w-[180px] h-fit")}>
      <div className={cn(
        "bg-white border-2",
        isPrint ? "border-black" : "rounded-2xl border-slate-200 shadow-lg"
      )}>
        <table className="w-full border-collapse table-fixed">
          <thead>
            <tr className={cn(isPrint ? "bg-slate-100 border-b border-black" : "bg-emerald-950 text-white")}>
              <th className={cn(
                "p-2 font-black uppercase border-b w-[65%]", 
                isPrint ? "text-[9px] text-black border-black" : "text-[11px] border-emerald-900",
                isRTL ? "text-right" : "text-left"
              )}>
                {isRTL ? "المادة" : "Subject"}
              </th>
              <th className={cn(
                "p-2 font-black uppercase text-center border-s-2 border-b w-[35%]", 
                isPrint ? "text-[9px] text-black border-black" : "text-[11px] border-emerald-900"
              )}>
                {isRTL ? "الزمن" : "Time"}
              </th>
            </tr>
          </thead>
          <tbody className={cn(isPrint ? "divide-y divide-black" : "divide-y divide-slate-100")}>
            {summaryData.map((item, idx) => (
              <tr key={idx}>
                <td className={cn(
                  "p-2 leading-tight border-b", 
                  isRTL ? "text-right" : "text-left",
                  isPrint ? "border-black" : "border-slate-50"
                )}>
                  <span className={cn("font-bold block truncate", isPrint ? "text-[9px] text-black" : "text-[12px] text-slate-800")}>
                    {item.subject}
                  </span>
                </td>
                <td className={cn(
                  "p-2 text-center leading-none border-s-2 border-b", 
                  isPrint ? "border-black" : "border-slate-50"
                )}>
                  <span className={cn("font-black", isPrint ? "text-[9px] text-black" : "text-[13px] text-emerald-700")}>
                    {item.count}
                  </span>
                </td>
              </tr>
            ))}
            <tr className={cn("font-black bg-slate-50", isPrint ? "border-t-2 border-black" : "bg-emerald-50/50")}>
              <td className={cn(
                "p-2", 
                isPrint ? "text-[9px] text-black" : "text-[12px] text-emerald-900",
                isRTL ? "text-right" : "text-left"
              )}>
                {isRTL ? "المجموع" : "Total"}
              </td>
              <td className={cn(
                "p-2 text-center border-s-2", 
                isPrint ? "text-[10px] text-black border-black" : "text-[14px] text-emerald-600")}>
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

    return (
      <div className={cn(
        "h-full w-full flex flex-col justify-center items-center text-center relative transition-all group/card",
        isPrint ? "p-1 text-black bg-white" : cn(
          "text-white shadow-sm rounded-xl p-2", 
          colorClass,
          "hover:scale-[1.02]"
        )
      )}>
        <p className={cn("font-black leading-tight truncate w-full", isPrint ? "text-[10px] mb-0.5" : "text-[11px] mb-1")}>
          {subjects.find(s => s.id === assignment.subjectId)?.name || "---"}
        </p>
        <p className={cn("font-bold leading-tight truncate w-full", isPrint ? "text-[8px]" : "text-[9px] opacity-90")}>
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
      <colgroup>
        <col className={isPrint ? "w-[50px]" : "w-[70px]"} />
        {days.map(day => <col key={day.id} className="w-auto" />)}
      </colgroup>
      <thead>
        <tr className={isPrint ? "h-10" : "h-14"}>
          <th className={cn("font-black text-center", isPrint ? "border border-black text-[10px] bg-slate-100" : "rounded-2xl bg-emerald-950 text-emerald-400 p-2 text-[11px]")}>
            {isRTL ? "الحصة" : "Slot"}
          </th>
          {days.map(day => (
            <th key={day.id} className={cn("font-black text-center px-2", isPrint ? "border border-black text-[11px] bg-slate-100" : "rounded-2xl bg-slate-50 text-slate-500 p-2 uppercase text-[11px]")}>
              {isRTL ? day.name : day.en}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {timeSlots.map(slot => (
          <tr key={slot.id} className={isPrint ? "h-16" : "h-20"}>
            <td className={cn(isPrint ? "border border-black p-1" : "p-2 border-e border-slate-100")}>
              <div className="flex flex-col items-center justify-center h-full">
                <span className={cn("font-black leading-none", isPrint ? "text-[11px]" : "text-[13px] text-slate-600")}>{slot.label}</span>
                {slot.time && <span className={cn("font-bold opacity-30 mt-1", isPrint ? "text-[7px]" : "text-[8px]")}>{slot.time}</span>}
              </div>
            </td>
            {days.map(day => {
              const assignment = getAssignment(day.id, slot.id);
              return (
                <td key={day.id} className={cn("relative h-full", isPrint ? "border border-black" : "p-1")}>
                  {assignment ? <LessonCard assignment={assignment} /> : (
                    !isPrint && (
                      <div className="h-full w-full rounded-xl border border-dashed border-slate-100 flex items-center justify-center cursor-pointer hover:bg-emerald-50/50 transition-all" onClick={() => onAddClick(day.id, slot.id)}>
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
      <colgroup>
        <col className={isPrint ? "w-[70px]" : "w-[100px]"} />
        {timeSlots.map(slot => <col key={slot.id} className="w-auto" />)}
      </colgroup>
      <thead>
        <tr className={isPrint ? "h-10" : "h-14"}>
          <th className={cn("font-black text-center", isPrint ? "border border-black text-[11px] bg-slate-100" : "rounded-2xl bg-emerald-950 text-emerald-400 p-2 text-[11px]")}>
            {isRTL ? "اليوم" : "DAY"}
          </th>
          {timeSlots.map(slot => (
            <th key={slot.id} className={cn("font-black text-center px-2", isPrint ? "border border-black text-[10px] bg-slate-100" : "rounded-2xl bg-slate-50 text-slate-500 p-2 text-[11px]")}>
              <div className="flex flex-col items-center">
                <span className="leading-none">{slot.label}</span>
                {slot.time && <span className="text-[7px] font-bold opacity-30 lowercase leading-none mt-1">{slot.time}</span>}
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {days.map(day => (
          <tr key={day.id} className={isPrint ? "h-16" : "h-20"}>
            <td className={cn(isPrint ? "border border-black p-1" : "p-2 border-e border-slate-100")}>
              <div className="flex items-center justify-center h-full">
                <span className={cn("font-black", isPrint ? "text-[11px]" : "text-[12px] text-slate-600")}>{isRTL ? day.name : day.en}</span>
              </div>
            </td>
            {timeSlots.map(slot => {
              const assignment = getAssignment(day.id, slot.id);
              return (
                <td key={slot.id} className={cn("relative h-full", isPrint ? "border border-black" : "p-1")}>
                  {assignment ? <LessonCard assignment={assignment} /> : (
                    !isPrint && (
                      <div className="h-full w-full rounded-xl border border-dashed border-slate-100 flex items-center justify-center cursor-pointer hover:bg-emerald-50/50 transition-all" onClick={() => onAddClick(day.id, slot.id)}>
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
      "flex items-start w-full overflow-x-auto pb-4 gap-4", 
      isRTL ? "flex-row" : "flex-row-reverse"
    )}>
      <div className="flex-1 min-w-0">
        {isTransposed ? renderTransposed() : renderStandard()}
      </div>
      <SummaryTable />
    </div>
  );
};

export default ScheduleTable;