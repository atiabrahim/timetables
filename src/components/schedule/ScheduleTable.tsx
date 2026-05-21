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
    <div className={cn("shrink-0", isPrint ? "w-full mt-4" : "w-64")}>
      <div className="bg-white rounded-lg md:rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50/50">
              <th className={cn("p-1 font-black text-gray-400 uppercase text-right", isPrint ? "text-[8px]" : "text-[10px]")}>{isRTL ? "المادة" : "Subject"}</th>
              <th className={cn("p-1 font-black text-gray-400 uppercase text-center", isPrint ? "text-[8px]" : "text-[10px]")}>{isRTL ? (viewMode === "class" ? "المعلم" : "الفوج") : (viewMode === "class" ? "Teacher" : "Class")}</th>
              <th className={cn("p-1 font-black text-gray-400 uppercase text-center", isPrint ? "text-[8px]" : "text-[10px]")}>{isRTL ? "س" : "Hrs"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {summaryData?.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50/30 transition-colors">
                <td className="p-1">
                  <div className="flex items-center gap-1">
                    <div className={cn("rounded-full shrink-0", isPrint ? "w-1.5 h-1.5" : "w-2 h-2", getSubjectColor(idx))}></div>
                    <span className={cn("font-bold text-gray-700 break-words whitespace-normal leading-tight", isPrint ? "text-[8px]" : "text-[11px]")}>{item.subject}</span>
                  </div>
                </td>
                <td className="p-1 text-center">
                  <span className={cn("font-medium text-gray-500 break-words whitespace-normal leading-tight", isPrint ? "text-[7px]" : "text-[10px]")}>{viewMode === "class" ? item.teacher : item.branch}</span>
                </td>
                <td className="p-1 text-center">
                  <span className={cn("font-black text-gray-900", isPrint ? "text-[9px]" : "text-xs")}>{item.count}</span>
                </td>
              </tr>
            ))}
            <tr className="bg-emerald-50/30 font-black">
              <td colSpan={2} className={cn("p-1 text-emerald-900", isPrint ? "text-[9px]" : "text-xs")}>{isRTL ? "المجموع" : "Total"}</td>
              <td className={cn("p-1 text-center text-emerald-600", isPrint ? "text-[10px]" : "text-sm")}>{totalHours}</td>
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
        "h-full w-full flex flex-col justify-center items-center text-center text-white shadow-sm relative group/card transition-transform",
        isPrint ? "rounded-sm p-1" : "rounded-lg md:rounded-xl p-1 md:p-2 hover:scale-[1.02]",
        colorClass
      )}>
        <p className={cn("font-black leading-tight break-words whitespace-normal w-full", isPrint ? "text-[8px] mb-0" : "text-[10px] md:text-[12px] mb-0.5 md:mb-1")}>
          {subjects.find(s => s.id === assignment.subjectId)?.name || "---"}
        </p>
        <p className={cn("opacity-90 font-medium leading-tight break-words whitespace-normal w-full", isPrint ? "text-[7px] mb-0" : "text-[8px] md:text-[10px] mb-0.5 md:mb-1")}>
          {viewMode === "class" 
            ? (() => {
                const e = employees.find(emp => emp.id === assignment.employeeId);
                return e ? `${e.lastName} ${e.firstName}` : "---";
              })()
            : classes.find(c => c.id === assignment.classId)?.name
          }
        </p>
        {assignment.room && (
          <div className={cn("bg-white/20 rounded-sm", isPrint ? "px-1 py-0" : "px-1 md:px-2 py-0.5")}>
            <p className={cn("font-bold leading-none", isPrint ? "text-[7px]" : "text-[8px] md:text-[9px]")}>{assignment.room}</p>
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
    <table className={cn("w-full border-separate border-spacing-0 border border-gray-300", isPrint ? "table-fixed" : "md:border-spacing-1")}>
      <thead>
        <tr>
          <th className={cn("bg-emerald-50 text-emerald-900 font-black border border-gray-300", isPrint ? "p-1 text-[8px] w-12" : "p-3 text-xs w-24")}>
            {isRTL ? "الحصة" : "Period"}
          </th>
          {days.map(day => (
            <th key={day.id} className={cn("bg-emerald-50 text-emerald-900 font-black text-center border border-gray-300", isPrint ? "p-1 text-[8px]" : "p-3 text-xs")}>
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
                <td className="p-1 text-center border border-gray-300 bg-amber-50/20">
                  <div className="flex flex-col items-center justify-center text-amber-600">
                    <span className={cn("font-black", isPrint ? "text-[7px]" : "text-[10px]")}>{slot.label}</span>
                  </div>
                </td>
                <td colSpan={days.length} className="p-1 border border-gray-300 bg-amber-50/30">
                  <div className={cn("w-full flex items-center justify-center h-4 md:h-8")}>
                    <span className={cn("text-amber-700 font-bold tracking-widest uppercase", isPrint ? "text-[8px]" : "text-xs")}>{slot.label}</span>
                  </div>
                </td>
              </tr>
            );
          }
          return (
            <tr key={slot.id} className={isPrint ? "h-12" : "h-24"}>
              <td className="p-1 border border-gray-300">
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <span className={cn("text-emerald-600 font-black", isPrint ? "text-[8px]" : "text-xs")}>{isRTL ? "ح" : "P"} {slot.label}</span>
                  <span className={cn("font-bold text-gray-400", isPrint ? "text-[6px]" : "text-[9px]")}>{slot.time}</span>
                </div>
              </td>
              {days.map(day => {
                const assignment = getAssignment(day.id, slot.id);
                return (
                  <td key={day.id} className="p-0 border border-gray-300 relative">
                    <div className="h-full w-full">
                      {assignment ? <LessonCard assignment={assignment} /> : (
                        !isPrint && (
                          <div className="h-full w-full min-h-[4rem] border-2 border-dashed border-gray-50 flex items-center justify-center cursor-pointer hover:bg-emerald-50/30 transition-all group/add" onClick={() => onAddClick(day.id, slot.id)}>
                            <Plus size={16} className="text-gray-200 group-hover/add:text-emerald-400 transition-colors" />
                          </div>
                        )
                      )}
                    </div>
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
    <table className={cn("w-full border-separate border-spacing-0 border border-gray-300", isPrint ? "table-fixed" : "md:border-spacing-1")}>
      <thead>
        <tr>
          <th className={cn("bg-emerald-50 text-emerald-900 font-black border border-gray-300", isPrint ? "p-1 text-[8px] w-12" : "p-3 text-xs w-24")}>
            {isRTL ? "اليوم" : "Day"}
          </th>
          {timeSlots.map(slot => (
            <th key={slot.id} className={cn("bg-emerald-50 text-emerald-900 font-black text-center border border-gray-300", slot.isBreak && "bg-amber-50 text-amber-700", isPrint ? "p-1 text-[8px]" : "p-3 text-xs")}>
              <div className="flex flex-col items-center">
                <span>{slot.label}</span>
                {!slot.isBreak && <span className={cn("opacity-60", isPrint ? "text-[6px]" : "text-[8px]")}>{slot.time}</span>}
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {days.map(day => (
          <tr key={day.id} className={isPrint ? "h-12" : "h-24"}>
            <td className="p-1 border border-gray-300">
              <div className="flex flex-col items-center justify-center h-full text-center">
                <span className={cn("text-emerald-600 font-black", isPrint ? "text-[8px]" : "text-xs")}>{isRTL ? day.name : day.en}</span>
              </div>
            </td>
            {timeSlots.map(slot => {
              if (slot.isBreak) {
                return (
                  <td key={slot.id} className="p-0 border border-gray-300 bg-amber-50/20">
                    <div className="h-full w-full flex items-center justify-center">
                      <span className={cn("text-amber-600/40 font-bold rotate-90", isPrint ? "text-[6px]" : "text-[8px]")}>{slot.label}</span>
                    </div>
                  </td>
                );
              }
              const assignment = getAssignment(day.id, slot.id);
              return (
                <td key={slot.id} className="p-0 border border-gray-300 relative">
                  <div className="h-full w-full">
                    {assignment ? <LessonCard assignment={assignment} /> : (
                      !isPrint && (
                        <div className="h-full w-full min-h-[4rem] border-2 border-dashed border-gray-50 flex items-center justify-center cursor-pointer hover:bg-emerald-50/30 transition-all group/add" onClick={() => onAddClick(day.id, slot.id)}>
                          <Plus size={16} className="text-gray-200 group-hover/add:text-emerald-400 transition-colors" />
                        </div>
                      )
                    )}
                  </div>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );

  if (isPrint) {
    return (
      <div className="w-full flex flex-col gap-4">
        <div className="w-full overflow-hidden">
          {isTransposed ? renderTransposed() : renderStandard()}
        </div>
        <div className="w-full flex justify-end">
          <div className="w-1/2">
            <SummaryTable />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex w-full gap-4 md:gap-6 overflow-x-auto pb-4", isRTL ? "flex-row" : "flex-row-reverse")}>
      <div className="flex-1 min-w-[800px]">
        {isTransposed ? renderTransposed() : renderStandard()}
      </div>
      {summaryData && <SummaryTable />}
    </div>
  );
};

export default ScheduleTable;