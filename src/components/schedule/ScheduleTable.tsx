"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
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
    <div className={cn("shrink-0", isPrint ? "w-[120px]" : "w-fit max-w-[300px] sticky top-0 h-fit")}>
      <div className={cn(
        "bg-white border overflow-hidden",
        isPrint ? "rounded-none border-black" : "rounded-2xl border-gray-100 shadow-sm"
      )}>
        <table className="w-full border-collapse">
          <thead>
            <tr className={cn(isPrint ? "bg-slate-100 border-b border-black" : "bg-gray-50/50")}>
              <th className={cn("p-1 font-black uppercase text-center", isPrint ? "text-[7px] text-black" : "text-[10px] text-gray-400")}>{isRTL ? "المادة" : "Sub"}</th>
              <th className={cn("p-1 font-black uppercase text-center", isPrint ? "text-[7px] text-black border-x border-black" : "text-[9px] text-gray-400 px-2")}>{isRTL ? "الطرف" : "Side"}</th>
              <th className={cn("p-1 font-black uppercase text-center", isPrint ? "text-[7px] text-black" : "text-[9px] text-gray-400")}>{isRTL ? "س" : "H"}</th>
            </tr>
          </thead>
          <tbody className={cn(isPrint ? "divide-y divide-black" : "divide-y divide-gray-50")}>
            {summaryData?.map((item, idx) => (
              <tr key={idx}>
                <td className="p-0.5 text-center leading-none">
                  <span className={cn("font-bold block truncate", isPrint ? "text-[7px] text-black" : "text-[10px] text-gray-700")}>{item.subject}</span>
                </td>
                <td className={cn("p-0.5 text-center leading-none", isPrint && "border-x border-black")}>
                  <span className={cn("font-medium block truncate", isPrint ? "text-[6px] text-black" : "text-[9px] text-gray-500")}>
                    {viewMode === "class" ? item.teacher : item.branch}
                  </span>
                </td>
                <td className="p-0.5 text-center leading-none">
                  <span className={cn("font-black", isPrint ? "text-[7px] text-black" : "text-[11px] text-gray-900")}>{item.count}</span>
                </td>
              </tr>
            ))}
            <tr className={cn("font-black", isPrint ? "bg-slate-50 border-t border-black" : "bg-emerald-50/30")}>
              <td colSpan={2} className={cn("p-1", isPrint ? "text-[7px] text-black" : "text-[10px] text-emerald-900")}>{isRTL ? "المجموع" : "Total"}</td>
              <td className={cn("p-1 text-center", isPrint ? "text-[8px] text-black" : "text-[12px] text-emerald-600")}>{totalHours}</td>
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
        "h-full w-full flex flex-col justify-center items-center text-center relative transition-transform",
        isPrint ? "p-0 text-black bg-white" : cn("text-white shadow-sm rounded-lg p-1 hover:scale-[1.01]", colorClass)
      )}>
        {/* Subject Name - Boldest */}
        <p className={cn("font-black leading-tight break-words w-full", isPrint ? "text-[8px] mb-0.5" : "text-[10px] mb-0.5")}>
          {subjects.find(s => s.id === assignment.subjectId)?.name || "---"}
        </p>
        
        {/* Teacher/Class Name - Medium */}
        <p className={cn("font-bold leading-tight break-words w-full", isPrint ? "text-[7px] mb-0.5" : "text-[9px] mb-0.5 opacity-90")}>
          {viewMode === "class" 
            ? (() => {
                const e = employees.find(emp => emp.id === assignment.employeeId);
                return e ? `${e.lastName} ${e.firstName}` : "---";
              })()
            : classes.find(c => c.id === assignment.classId)?.name
          }
        </p>
        
        {/* Room - Boxed in print, Subtle in digital */}
        {assignment.room && (
          <div className={cn(
            isPrint ? "border border-black px-1 mt-0.5 leading-none" : "bg-white/20 rounded-sm px-1 py-0 mt-0.5"
          )}>
            <p className={cn("font-black leading-none", isPrint ? "text-[7px] py-0.5" : "text-[8px]")}>{assignment.room}</p>
          </div>
        )}

        {!isPrint && (
          <Button 
            variant="ghost" size="icon" 
            className="absolute -top-1 -right-1 h-4 w-4 bg-white text-red-500 rounded-full shadow-md opacity-0 group-hover/card:opacity-100 transition-opacity hover:bg-red-50"
            onClick={(e) => { e.stopPropagation(); onDeleteClick(assignment.id); }}
          >
            <Trash2 size={8} />
          </Button>
        )}
      </div>
    );
  };

  const tableClasses = cn(
    "w-full border-collapse h-full table-fixed",
    isPrint ? "border border-black" : ""
  );

  const renderStandard = () => (
    <table className={tableClasses}>
      <thead>
        <tr className={isPrint ? "h-6" : "h-8"}>
          <th className={cn(
            "font-black text-center w-12", 
            isPrint ? "border border-black text-[8px] text-black bg-slate-50" : "rounded-md bg-emerald-50 text-emerald-900 p-1 text-xs"
          )}>
            {isRTL ? "الحصة" : "P"}
          </th>
          {days.map(day => (
            <th key={day.id} className={cn(
              "font-black text-center", 
              isPrint ? "border border-black text-[8px] text-black bg-slate-50" : "rounded-md bg-emerald-50 text-emerald-900 p-1 text-xs"
            )}>
              {isRTL ? day.name : day.en}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {timeSlots.map(slot => (
          <tr key={slot.id} className={cn("group", isPrint ? "h-14" : "h-12")}>
            <td className={cn(isPrint ? "border border-black px-1" : "p-0.5")}>
              <div className={cn("flex flex-col items-center justify-center h-full")}>
                <span className={cn("font-black", isPrint ? "text-[8px] text-black" : "text-[10px] text-emerald-600")}>{slot.label}</span>
                {isPrint && <span className="text-[5px] text-black/60 font-bold">{slot.time}</span>}
              </div>
            </td>
            {days.map(day => {
              const assignment = getAssignment(day.id, slot.id);
              return (
                <td key={day.id} className={cn("relative h-full", isPrint ? "border border-black" : "p-0.5")}>
                  {assignment ? <LessonCard assignment={assignment} /> : (
                    !isPrint && (
                      <div className="h-full w-full rounded-lg border-2 border-dashed border-gray-100 flex items-center justify-center cursor-pointer hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group/add" onClick={() => onAddClick(day.id, slot.id)}>
                        <Plus size={12} className="text-gray-200 group-hover/add:text-emerald-400 transition-colors" />
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
        <tr className={isPrint ? "h-6" : "h-8"}>
          <th className={cn(
            "font-black text-center px-4 w-24", 
            isPrint ? "border border-black text-[8px] text-black bg-slate-50" : "rounded-md bg-emerald-50 text-emerald-900 p-1 text-xs"
          )}>
            {isRTL ? "اليوم" : "Day"}
          </th>
          {timeSlots.map(slot => (
            <th key={slot.id} className={cn(
              "font-black text-center px-2", 
              isPrint ? "border border-black text-[8px] text-black bg-slate-50" : cn("rounded-md p-1 text-xs bg-emerald-50 text-emerald-900")
            )}>
              {slot.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {days.map(day => (
          <tr key={day.id} className={cn("group", isPrint ? "h-14" : "h-12")}>
            <td className={cn(isPrint ? "border border-black px-2" : "p-0.5")}>
              <div className={cn("flex flex-col items-center justify-center h-full")}>
                <span className={cn("font-black", isPrint ? "text-[8px] text-black" : "text-[10px] text-emerald-600")}>{isRTL ? day.name : day.en}</span>
              </div>
            </td>
            {timeSlots.map(slot => {
              const assignment = getAssignment(day.id, slot.id);
              return (
                <td key={slot.id} className={cn("relative h-full", isPrint ? "border border-black" : "p-0.5")}>
                  {assignment ? <LessonCard assignment={assignment} /> : (
                    !isPrint && (
                      <div className="h-full w-full rounded-lg border-2 border-dashed border-gray-100 flex items-center justify-center cursor-pointer hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group/add" onClick={() => onAddClick(day.id, slot.id)}>
                        <Plus size={12} className="text-gray-200 group-hover/add:text-emerald-400 transition-colors" />
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
      "flex h-full", 
      isRTL ? "flex-row" : "flex-row-reverse", 
      isPrint ? "gap-4 items-start w-full" : "w-full gap-6 overflow-x-auto pb-4"
    )}>
      <div className={cn("h-full", isPrint ? "flex-1" : "flex-1 min-w-[800px]")}>
        {isTransposed ? renderTransposed() : renderStandard()}
      </div>
      {(isPrint || summaryData) && <SummaryTable />}
    </div>
  );
};

export default ScheduleTable;