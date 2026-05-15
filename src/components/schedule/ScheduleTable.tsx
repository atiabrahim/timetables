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
    <div className={cn("shrink-0", isPrint ? "w-28 md:w-32" : "w-64")}>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="p-1 md:p-2 text-[7px] md:text-[9px] font-black text-gray-400 uppercase text-right">{isRTL ? "المادة" : "Subject"}</th>
              <th className="p-1 md:p-2 text-[7px] md:text-[9px] font-black text-gray-400 uppercase text-center">{isRTL ? (viewMode === "class" ? "المعلم" : "الفوج") : (viewMode === "class" ? "Teacher" : "Class")}</th>
              <th className="p-1 md:p-2 text-[7px] md:text-[9px] font-black text-gray-400 uppercase text-center">{isRTL ? "س" : "Hrs"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {summaryData?.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50/30 transition-colors">
                <td className="p-1 md:p-2">
                  <div className="flex items-center gap-1">
                    <div className={cn("w-1 h-1 md:w-1.5 md:h-1.5 rounded-full shrink-0", getSubjectColor(idx))}></div>
                    <span className="text-[8px] md:text-[10px] font-bold text-gray-700 break-words leading-tight">{item.subject}</span>
                  </div>
                </td>
                <td className="p-1 md:p-2 text-center">
                  <span className="text-[7px] md:text-[9px] font-medium text-gray-500 break-words leading-tight">{viewMode === "class" ? item.teacher : item.<dyad-write path="src/components/schedule/ScheduleTable.tsx" description="Completing the ScheduleTable component with optimized font sizes for A4 printing.">
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
    <div className={cn("shrink-0", isPrint ? "w-24 md:w-28" : "w-64")}>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="p-1 md:p-1.5 text-[6px] md:text-[8px] font-black text-gray-400 uppercase text-right">{isRTL ? "المادة" : "Subject"}</th>
              <th className="p-1 md:p-1.5 text-[6px] md:text-[8px] font-black text-gray-400 uppercase text-center">{isRTL ? (viewMode === "class" ? "المعلم" : "الفوج") : (viewMode === "class" ? "Teacher" : "Class")}</th>
              <th className="p-1 md:p-1.5 text-[6px] md:text-[8px] font-black text-gray-400 uppercase text-center">{isRTL ? "س" : "Hrs"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {summaryData?.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50/30 transition-colors">
                <td className="p-1 md:p-1.5">
                  <div className="flex items-center gap-0.5 md:gap-1">
                    <div className={cn("w-1 h-1 rounded-full shrink-0", getSubjectColor(idx))}></div>
                    <span className="text-[7px] md:text-[9px] font-bold text-gray-700 break-words leading-tight">{item.subject}</span>
                  </div>
                </td>
                <td className="p-1 md:p-1.5 text-center">
                  <span className="text-[6px] md:text-[8px] font-medium text-gray-500 break-words leading-tight">{viewMode === "class" ? item.teacher : item.branch}</span>
                </td>
                <td className="p-1 md:p-1.5 text-center">
                  <span className="text-[8px] md:text-[10px] font-black text-gray-900">{item.count}</span>
                </td>
              </tr>
            ))}
            <tr className="bg-emerald-50/30 font-black">
              <td colSpan={2} className="p-1 md:p-1.5 text-[8px] md:text-[10px] text-emerald-900">{isRTL ? "المجموع" : "Total"}</td>
              <td className="p-1 md:p-1.5 text-center text-emerald-600 text-[9px] md:text-[11px]">{totalHours}</td>
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
        "h-full w-full rounded-md md:rounded-lg p-0.5 md:p-1 flex flex-col justify-center items-center text-center text-white shadow-sm relative group/card transition-transform hover:scale-[1.02]",
        colorClass
      )}>
        <p className={cn("font-black leading-tight mb-0.5 break-words w-full", isPrint ? "text-[7px]" : "text-[9px] md:text-[11px]")}>
          {subjects.find(s => s.id === assignment.subjectId)?.name || "---"}
        </p>
        <p className={cn("opacity-90 font-medium leading-tight mb-0.5 break-words w-full", isPrint ? "text-[6px]" : "text-[8px] md:text-[9px]")}>
          {viewMode === "class" 
            ? (() => {
                const e = employees.find(emp => emp.id === assignment.employeeId);
                return e ? `${e.lastName} ${e.firstName}` : "---";
              })()
            : classes.find(c => c.id === assignment.classId)?.name
          }
        </p>
        {assignment.room && (
          <div className="bg-white/20 px-1 py-0 rounded-sm">
            <p className={cn("font-bold leading-none", isPrint ? "text-[6px]" : "text-[7px] md:text-[8px]")}>{assignment.room}</p>
          </div>
        )}
        {!isPrint && (
          <Button 
            variant="ghost" size="icon" 
            className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 bg-white text-red-500 rounded-full shadow-md opacity-0 group-hover/card:opacity-100 transition-opacity hover:bg-red-50"
            onClick={(e) => { e.stopPropagation(); onDeleteClick(assignment.id); }}
          >
            <Trash2 size={8} />
          </Button>
        )}
      </div>
    );
  };

  const renderStandard = () => (
    <table className="w-full border-separate border-spacing-0.5 md:border-spacing-1">
      <thead>
        <tr>
          <th className={cn("p-1 md:p-2 rounded-md md:rounded-xl bg-emerald-50 text-emerald-900 font-black text-[8px] md:text-[10px]", isPrint ? "w-10 md:w-12" : "w-24")}>
            {isRTL ? "الحصة" : "Period"}
          </th>
          {days.map(day => (
            <th key={day.id} className="p-1 md:p-2 rounded-md md:rounded-xl bg-emerald-50 text-emerald-900 font-black text-[8px] md:text-[10px] text-center">
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
                <td className="p-0.5 md:p-1 text-center">
                  <div className="flex flex-col items-center justify-center text-amber-600">
                    {slot.id === 'break-am' ? <Coffee size={10} /> : <Utensils size={10} />}
                    <span className="text-[6px] md:text-[8px] font-black mt-0.5">{slot.label}</span>
                  </div>
                </td>
                <td colSpan={days.length} className="p-0.5 md:p-1">
                  <div className="w-full h-4 md:h-6 bg-amber-50/50 rounded-md md:rounded-xl border border-dashed border-amber-200 flex items-center justify-center">
                    <span className="text-amber-700 font-bold text-[6px] md:text-[8px] tracking-widest uppercase">{slot.label}</span>
                  </div>
                </td>
              </tr>
            );
          }
          return (
            <tr key={slot.id} className={isPrint ? "h-10 md:h-12" : "h-20 md:h-24"}>
              <td className="p-0.5 md:p-1">
                <div className="flex flex-col items-center justify-center h-full bg-white rounded-md md:rounded-xl border border-gray-100 shadow-sm">
                  <span className="text-emerald-600 font-black text-[7px] md:text-[9px]">{isRTL ? "ح" : "P"} {slot.label}</span>
                  <span className="text-[6px] md:text-[8px] font-bold text-gray-400 mt-0.5">{slot.time}</span>
                </div>
              </td>
              {days.map(day => {
                const assignment = getAssignment(day.id, slot.id);
                return (
                  <td key={day.id} className="p-0.5 relative group">
                    {assignment ? <LessonCard assignment={assignment} /> : (
                      !isPrint && (
                        <div className="h-full w-full rounded-md md:rounded-xl border-2 border-dashed border-gray-100 flex items-center justify-center cursor-pointer hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group/add" onClick={() => onAddClick(day.id, slot.id)}>
                          <Plus size={12} className="text-gray-200 group-hover/add:text-emerald-400 transition-colors" />
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
    <table className="w-full border-separate border-spacing-0.5 md:border-spacing-1">
      <thead>
        <tr>
          <th className={cn("p-1 md:p-2 rounded-md md:rounded-xl bg-emerald-50 text-emerald-900 font-black text-[8px] md:text-[10px]", isPrint ? "w-10 md:w-12" : "w-24")}>
            {isRTL ? "اليوم" : "Day"}
          </th>
          {timeSlots.map(slot => (
            <th key={slot.id} className={cn("p-1 md:p-2 rounded-md md:rounded-xl bg-emerald-50 text-emerald-900 font-black text-[8px] md:text-[10px] text-center", slot.isBreak && "bg-amber-50 text-amber-700")}>
              <div className="flex flex-col items-center">
                {slot.isBreak ? (slot.id === 'break-am' ? <Coffee size={8} /> : <Utensils size={8} />) : null}
                <span>{slot.label}</span>
                {!slot.isBreak && <span className="text-[6px] md:text-[7px] opacity-60">{slot.time}</span>}
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {days.map(day => (
          <tr key={day.id} className={isPrint ? "h-10 md:h-12" : "h-20 md:h-24"}>
            <td className="p-0.5 md:p-1">
              <div className="flex flex-col items-center justify-center h-full bg-white rounded-md md:rounded-xl border border-gray-100 shadow-sm">
                <span className="text-emerald-600 font-black text-[7px] md:text-[9px]">{isRTL ? day.name : day.en}</span>
              </div>
            </td>
            {timeSlots.map(slot => {
              if (slot.isBreak) {
                return (
                  <td key={slot.id} className="p-0.5">
                    <div className="h-full w-full bg-amber-50/30 rounded-md border border-dashed border-amber-100 flex items-center justify-center">
                      <span className="text-amber-600/40 text-[6px] md:text-[7px] font-bold rotate-90">{slot.label}</span>
                    </div>
                  </td>
                );
              }
              const assignment = getAssignment(day.id, slot.id);
              return (
                <td key={slot.id} className="p-0.5 relative group">
                  {assignment ? <LessonCard assignment={assignment} /> : (
                    !isPrint && (
                      <div className="h-full w-full rounded-md md:rounded-xl border-2 border-dashed border-gray-100 flex items-center justify-center cursor-pointer hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group/add" onClick={() => onAddClick(day.id, slot.id)}>
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
    <div className={cn("flex gap-1 md:gap-4 w-full", isRTL ? "flex-row" : "flex-row-reverse", isPrint ? "items-start" : "overflow-x-auto pb-4")}>
      <div className={cn("flex-1", isPrint ? "w-full" : "min-w-[800px]")}>
        {isTransposed ? renderTransposed() : renderStandard()}
      </div>
      {(isPrint || summaryData) && <SummaryTable />}
    </div>
  );
};

export default ScheduleTable;