"use client";

import React from "react";
import { Plus, Trash2, Coffee, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
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
}

const SUBJECT_COLORS = [
  "bg-blue-600", "bg-emerald-500", "bg-rose-500", "bg-amber-500", 
  "bg-violet-600", "bg-cyan-500", "bg-orange-500", "bg-indigo-500",
  "bg-pink-500", "bg-teal-600"
];

const getSubjectColor = (index: number) => SUBJECT_COLORS[index % SUBJECT_COLORS.length];

const ScheduleTable = ({ 
  isRTL, days, timeSlots, getAssignment, onAddClick, onDeleteClick, 
  subjects, employees, classes, viewMode, isPrint = false, summaryData, totalHours, isTransposed = false 
}: ScheduleTableProps) => {
  
  const SummaryTable = () => (
    <div className={cn("shrink-0", isPrint ? "w-28" : "w-64")}>
      <div className="bg-white rounded-lg md:rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50/50">
              <th className={cn("p-1 font-black text-gray-400 uppercase text-right", isPrint ? "text-[6px]" : "text-[10px]")}>{isRTL ? "المادة" : "Subject"}</th>
              <th className={cn("p-1 font-black text-gray-400 uppercase text-center", isPrint ? "text-[6px]" : "text-[10px]")}>{isRTL ? (viewMode === "class" ? "المعلم" : "الفوج") : (viewMode === "class" ? "Teacher" : "Class")}</th>
              <th className={cn("p-1 font-black text-gray-400 uppercase text-center", isPrint ? "text-[6px]" : "text-[10px]")}>{isRTL ? "س" : "Hrs"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {summaryData?.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50/30 transition-colors">
                <td className="p-1">
                  <div className="flex items-center gap-1">
                    <div className={cn("rounded-full shrink-0", isPrint ? "w-1 h-1" : "w-2 h-2", getSubjectColor(idx))}></div>
                    <span className={cn("font-bold text-gray-700 break-words leading-tight", isPrint ? "text-[6px]" : "text-[11px]")}>{item.subject}</span>
                  </div>
                </td>
                <td className="p-1 text-center">
                  <span className={cn("font-medium text-gray-500 break-words leading-tight", isPrint ? "text-[5px]" : "text-[10px]")}>{viewMode === "class" ? item.teacher : item.branch}</span>
                </td>
                <td className="p-1 text-center">
                  <span className={cn("font-black text-gray-900", isPrint ? "text-[7px]" : "text-xs")}>{item.count}</span>
                </td>
              </tr>
            ))}
            <tr className="bg-emerald-50/30 font-black">
              <td colSpan={2} className={cn("p-1 text-emerald-900", isPrint ? "text-[7px]" : "text-xs")}>{isRTL ? "المجموع" : "Total"}</td>
              <td className={cn("p-1 text-center text-emerald-600", isPrint ? "text-[8px]" : "text-sm")}>{totalHours}</td>
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
        "h-full w-full flex flex-col justify-center items-center text-center text-white shadow-sm relative group/card transition-transform hover:scale-[1.02]",
        isPrint ? "rounded-sm p-0.5" : "rounded-lg md:rounded-xl p-1 md:p-2",
        colorClass
      )}>
        <p className={cn("font-black leading-tight break-words w-full", isPrint ? "text-[6px] mb-0" : "text-[10px] md:text-[12px] mb-0.5 md:mb-1")}>
          {subjects.find(s => s.id === assignment.subjectId)?.name || "---"}
        </p>
        <p className={cn("opacity-90 font-medium leading-tight break-words w-full", isPrint ? "text-[5px] mb-0" : "text-[8px] md:text-[10px] mb-0.5 md:mb-1")}>
          {viewMode === "class" 
            ? (() => {
                const e = employees.find(emp => emp.id === assignment.employeeId);
                return e ? `${e.lastName} ${e.firstName}` : "---";
              })()
            : classes.find(c => c.id === assignment.classId)?.name
          }
        </p>
        {assignment.room && (
          <div className={cn("bg-white/20 rounded-sm", isPrint ? "px-0.5 py-0" : "px-1 md:px-2 py-0.5")}>
            <p className={cn("font-bold leading-none", isPrint ? "text-[5px]" : "text-[8px] md:text-[9px]")}>{assignment.room}</p>
          </div>
        )}
        {!isPrint && (
          <Button 
            variant="ghost" size="icon" 
            className="absolute -top-1 -right-1 h-5 w-5 md:h-6 md:w-6 bg-white text-red-500 rounded-full shadow-md opacity-0 group-hover/card:opacity-100 transition-opacity hover:bg-red-50"
            onClick={(e) => { e.stopPropagation(); onDeleteClick(assignment.id); }}
          >
            <Trash2 size={10} />
          </Button>
        )}
      </div>
    );
  };

  const renderStandard = () => (
    <table className={cn("w-full border-separate", isPrint ? "border-spacing-0.5" : "border-spacing-1 md:border-spacing-2")}>
      <thead>
        <tr>
          <th className={cn("rounded-md bg-emerald-50 text-emerald-900 font-black", isPrint ? "p-0.5 text-[7px] w-10" : "p-1.5 md:p-3 text-[10px] md:text-xs w-24")}>
            {isRTL ? "الحصة" : "Period"}
          </th>
          {days.map(day => (
            <th key={day.id} className={cn("rounded-md bg-emerald-50 text-emerald-900 font-black text-center", isPrint ? "p-0.5 text-[7px]" : "p-1.5 md:p-3 text-[10px] md:text-xs")}>
              {isRTL ? day.name : day.en}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {timeSlots.map(slot => {
          if (slot.isBreak) {
            return (
              <tr key={slot.id}>
                <td className="p-0.5 text-center">
                  <div className="flex flex-col items-center justify-center text-amber-600">
                    {slot.id === 'break-am' ? <Coffee size={isPrint ? 8 : 14} /> : <Utensils size={isPrint ? 8 : 14} />}
                    <span className={cn("font-black", isPrint ? "text-[5px]" : "text-[8px] md:text-[10px]")}>{slot.label}</span>
                  </div>
                </td>
                <td colSpan={days.length} className="p-0.5">
                  <div className={cn("w-full bg-amber-50/50 rounded-md border border-dashed border-amber-200 flex items-center justify-center", isPrint ? "h-4" : "h-6 md:h-10")}>
                    <span className={cn("text-amber-700 font-bold tracking-widest uppercase", isPrint ? "text-[6px]" : "text-[8px] md:text-xs")}>{slot.label}</span>
                  </div>
                </td>
              </tr>
            );
          }
          return (
            <tr key={slot.id} className={isPrint ? "h-8" : "h-20 md:h-24"}>
              <td className="p-0.5">
                <div className="flex flex-col items-center justify-center h-full bg-white rounded-md border border-gray-100 shadow-sm">
                  <span className={cn("text-emerald-600 font-black", isPrint ? "text-[6px]" : "text-[9px] md:text-xs")}>{isRTL ? "ح" : "P"} {slot.label}</span>
                  <span className={cn("font-bold text-gray-400", isPrint ? "text-[5px]" : "text-[7px] md:text-[9px]")}>{slot.time}</span>
                </div>
              </td>
              {days.map(day => {
                const assignment = getAssignment(day.id, slot.id);
                return (
                  <td key={day.id} className="p-0.5 relative group">
                    {assignment ? <LessonCard assignment={assignment} /> : (
                      !isPrint && (
                        <div className="h-full w-full rounded-lg md:rounded-2xl border-2 border-dashed border-gray-100 flex items-center justify-center cursor-pointer hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group/add" onClick={() => onAddClick(day.id, slot.id)}>
                          <Plus size={16} className="text-gray-200 group-hover/add:text-emerald-400 transition-colors" />
                        </div>
                      )
                    )}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  const renderTransposed = () => (
    <table className={cn("w-full border-separate", isPrint ? "border-spacing-0.5" : "border-spacing-1 md:border-spacing-2")}>
      <thead>
        <tr>
          <th className={cn("rounded-md bg-emerald-50 text-emerald-900 font-black", isPrint ? "p-0.5 text-[7px] w-10" : "p-1.5 md:p-3 text-[10px] md:text-xs w-24")}>
            {isRTL ? "اليوم" : "Day"}
          </th>
          {timeSlots.map(slot => (
            <th key={slot.id} className={cn("rounded-md bg-emerald-50 text-emerald-900 font-black text-center", slot.isBreak && "bg-amber-50 text-amber-700", isPrint ? "p-0.5 text-[7px]" : "p-1.5 md:p-3 text-[10px] md:text-xs")}>
              <div className="flex flex-col items-center">
                {slot.isBreak ? (slot.id === 'break-am' ? <Coffee size={isPrint ? 8 : 12} /> : <Utensils size={isPrint ? 8 : 12} />) : null}
                <span>{slot.label}</span>
                {!slot.isBreak && <span className={cn("opacity-60", isPrint ? "text-[5px]" : "text-[7px] md:text-[8px]")}>{slot.time}</span>}
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {days.map(day => (
          <tr key={day.id} className={isPrint ? "h-8" : "h-20 md:h-24"}>
            <td className="p-0.5">
              <div className="flex flex-col items-center justify-center h-full bg-white rounded-md border border-gray-100 shadow-sm">
                <span className={cn("text-emerald-600 font-black", isPrint ? "text-[7px]" : "text-[9px] md:text-xs")}>{isRTL ? day.name : day.en}</span>
              </div>
            </td>
            {timeSlots.map(slot => {
              if (slot.isBreak) {
                return (
                  <td key={slot.id} className="p-0.5">
                    <div className="h-full w-full bg-amber-50/30 rounded-md border border-dashed border-amber-100 flex items-center justify-center">
                      <span className={cn("text-amber-600/40 font-bold rotate-90", isPrint ? "text-[5px]" : "text-[7px] md:text-[8px]")}>{slot.label}</span>
                    </div>
                  </td>
                );
              }
              const assignment = getAssignment(day.id, slot.id);
              return (
                <td key={slot.id} className="p-0.5 relative group">
                  {assignment ? <LessonCard assignment={assignment} /> : (
                    !isPrint && (
                      <div className="h-full w-full rounded-lg md:rounded-2xl border-2 border-dashed border-gray-100 flex items-center justify-center cursor-pointer hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group/add" onClick={() => onAddClick(day.id, slot.id)}>
                        <Plus size={16} className="text-gray-200 group-hover/add:text-emerald-400 transition-colors" />
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
    <div className={cn("flex w-full", isRTL ? "flex-row" : "flex-row-reverse", isPrint ? "gap-1 items-start" : "gap-2 md:gap-6 overflow-x-auto pb-4")}>
      <div className={cn("flex-1", isPrint ? "w-full" : "min-w-[800px]")}>
        {isTransposed ? renderTransposed() : renderStandard()}
      </div>
      {(isPrint || summaryData) && <SummaryTable />}
    </div>
  );
};

export default ScheduleTable;