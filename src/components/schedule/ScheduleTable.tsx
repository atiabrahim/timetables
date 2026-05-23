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
    <div className={cn("shrink-0", isPrint ? "w-24" : "w-64 sticky top-0 h-fit")}>
      <div className={cn(
        "bg-white border shadow-sm overflow-hidden",
        isPrint ? "rounded-none border-black" : "rounded-lg md:rounded-2xl border-gray-100"
      )}>
        <table className={cn("w-full table-fixed", isPrint ? "border-collapse" : "border-collapse")}>
          <thead className="sticky top-0 bg-white z-10">
            <tr className={cn(isPrint ? "bg-transparent border-b border-black" : "bg-gray-50/50")}>
              <th className={cn("p-1 font-black uppercase text-right w-[45%] truncate", isPrint ? "text-[6px] text-black" : "text-[10px] text-gray-400")}>{isRTL ? "المادة" : "Subject"}</th>
              <th className={cn("p-1 font-black uppercase text-center w-[40%] truncate", isPrint ? "text-[6px] text-black border-x border-black" : "text-[10px] text-gray-400")}>{isRTL ? (viewMode === "class" ? "المعلم" : "الفوج") : (viewMode === "class" ? "Teacher" : "Class")}</th>
              <th className={cn("p-1 font-black uppercase text-center w-[15%]", isPrint ? "text-[6px] text-black" : "text-[10px] text-gray-400")}>{isRTL ? "س" : "Hrs"}</th>
            </tr>
          </thead>
          <tbody className={cn(isPrint ? "divide-y divide-black" : "divide-y divide-gray-50")}>
            {summaryData?.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50/30 transition-colors">
                <td className="p-1 overflow-hidden">
                  <div className="flex items-center gap-1 w-full overflow-hidden">
                    {!isPrint && <div className={cn("rounded-full shrink-0 w-2 h-2", getSubjectColor(idx))}></div>}
                    <span className={cn("font-bold truncate", isPrint ? "text-[6.5px] text-black" : "text-[11px] text-gray-700")} title={item.subject}>{item.subject}</span>
                  </div>
                </td>
                <td className={cn("p-1 text-center overflow-hidden", isPrint && "border-x border-black")}>
                  <span className={cn("font-medium truncate block w-full", isPrint ? "text-[6px] text-black" : "text-[10px] text-gray-500")} title={viewMode === "class" ? item.teacher : item.branch}>
                    {viewMode === "class" ? item.teacher : item.branch}
                  </span>
                </td>
                <td className="p-1 text-center">
                  <span className={cn("font-black", isPrint ? "text-[7px] text-black" : "text-xs text-gray-900")}>{item.count}</span>
                </td>
              </tr>
            ))}
            <tr className={cn("font-black", isPrint ? "bg-transparent border-t border-black" : "bg-emerald-50/30")}>
              <td colSpan={2} className={cn("p-1 truncate", isPrint ? "text-[7px] text-black" : "text-xs text-emerald-900")}>{isRTL ? "المجموع" : "Total"}</td>
              <td className={cn("p-1 text-center", isPrint ? "text-[8px] text-black" : "text-sm text-emerald-600")}>{totalHours}</td>
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
        "h-full w-full flex flex-col justify-center items-center text-center relative group/card transition-transform",
        isPrint ? "p-0.5 text-black bg-white" : cn("text-white shadow-sm rounded-lg p-1 hover:scale-[1.01]", colorClass)
      )}>
        <p className={cn("font-black leading-tight break-words whitespace-normal w-full", isPrint ? "text-[7.5px] mb-0" : "text-[10px] md:text-[11px] mb-0.5")}>
          {subjects.find(s => s.id === assignment.subjectId)?.name || "---"}
        </p>
        <p className={cn("font-medium leading-tight break-words whitespace-normal w-full", isPrint ? "text-[6.5px] mb-0 text-black/80" : "text-[8px] md:text-[9px] mb-0.5 opacity-90")}>
          {viewMode === "class" 
            ? (() => {
                const e = employees.find(emp => emp.id === assignment.employeeId);
                return e ? `${e.lastName} ${e.firstName}` : "---";
              })()
            : classes.find(c => c.id === assignment.classId)?.name
          }
        </p>
        {assignment.room && (
          <div className={cn(isPrint ? "border border-black px-1 mt-0.5" : "bg-white/20 rounded-sm px-1.5 py-0.5")}>
            <p className={cn("font-bold leading-none", isPrint ? "text-[6.5px]" : "text-[8px]")}>{assignment.room}</p>
          </div>
        )}
        {!isPrint && (
          <Button 
            variant="ghost" size="icon" 
            className="absolute -top-1 -right-1 h-5 w-5 bg-white text-red-500 rounded-full shadow-md opacity-0 group-hover/card:opacity-100 transition-opacity hover:bg-red-50"
            onClick={(e) => { e.stopPropagation(); onDeleteClick(assignment.id); }}
          >
            <Trash2 size={10} />
          </Button>
        )}
      </div>
    );
  };

  const tableStyles = isPrint 
    ? "w-max border-collapse h-full table-auto border border-black mx-auto" 
    : "w-full border-separate border-spacing-1 h-full table-fixed";

  const renderStandard = () => (
    <table className={tableStyles}>
      <thead className={cn(!isPrint && "sticky top-0 bg-white z-10 shadow-sm")}>
        <tr className={isPrint ? "h-6" : "h-10"}>
          <th className={cn(
            "font-black text-center", 
            isPrint ? "border border-black text-[7px] text-black bg-transparent px-2" : "rounded-md bg-emerald-50 text-emerald-900 p-1 text-xs w-14"
          )}>
            {isRTL ? "الحصة" : "Period"}
          </th>
          {days.map(day => (
            <th key={day.id} className={cn(
              "font-black text-center", 
              isPrint ? "border border-black text-[7px] text-black bg-transparent px-3" : "rounded-md bg-emerald-50 text-emerald-900 p-2 text-xs"
            )}>
              {isRTL ? day.name : day.en}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {timeSlots.map(slot => {
          if (slot.isBreak) {
            return (
              <tr key={slot.id} className={isPrint ? "h-4" : "h-8"}>
                <td className={cn("text-center", isPrint ? "border border-black" : "p-0.5")}>
                  <div className="flex flex-col items-center justify-center">
                    <span className={cn("font-black", isPrint ? "text-[5px] text-black" : "text-[9px] text-amber-600")}>{slot.label}</span>
                  </div>
                </td>
                <td colSpan={days.length} className={cn(isPrint ? "border border-black" : "p-0.5")}>
                  <div className={cn(
                    "w-full flex items-center justify-center h-full",
                    isPrint ? "bg-transparent" : "bg-amber-50/50 rounded-md border border-dashed border-amber-200"
                  )}>
                    <span className={cn("font-bold tracking-widest uppercase", isPrint ? "text-[6px] text-black" : "text-[9px] text-amber-700")}>{slot.label}</span>
                  </div>
                </td>
              </tr>
            );
          }
          return (
            <tr key={slot.id} className={cn("group", isPrint ? "h-14" : "h-16")}>
              <td className={cn(isPrint ? "border border-black px-1" : "p-0.5")}>
                <div className={cn("flex flex-col items-center justify-center h-full", !isPrint && "bg-white rounded-md border border-gray-100 shadow-sm")}>
                  <span className={cn("font-black", isPrint ? "text-[7px] text-black" : "text-[11px] text-emerald-600")}>{isRTL ? "ح" : "P"}{slot.label}</span>
                  {!isPrint && <span className="font-bold text-[8px] text-gray-400">{slot.time}</span>}
                  {isPrint && <span className="text-[5px] text-black/60">{slot.time}</span>}
                </div>
              </td>
              {days.map(day => {
                const assignment = getAssignment(day.id, slot.id);
                return (
                  <td key={day.id} className={cn("relative group/cell h-full min-w-[60px]", isPrint ? "border border-black" : "p-0.5")}>
                    {assignment ? <LessonCard assignment={assignment} /> : (
                      !isPrint && (
                        <div className="h-full w-full rounded-lg border-2 border-dashed border-gray-100 flex items-center justify-center cursor-pointer hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group/add" onClick={() => onAddClick(day.id, slot.id)}>
                          <Plus size={14} className="text-gray-200 group-hover/add:text-emerald-400 transition-colors" />
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
    <table className={tableStyles}>
      <thead className={cn(!isPrint && "sticky top-0 bg-white z-10 shadow-sm")}>
        <tr className={isPrint ? "h-6" : "h-10"}>
          <th className={cn(
            "font-black text-center px-4", 
            isPrint ? "border border-black text-[7px] text-black bg-transparent" : "rounded-md bg-emerald-50 text-emerald-900 p-2 text-xs"
          )}>
            {isRTL ? "اليوم" : "Day"}
          </th>
          {timeSlots.map(slot => (
            <th key={slot.id} className={cn(
              "font-black text-center px-2", 
              isPrint ? "border border-black text-[7px] text-black bg-transparent" : cn("rounded-md p-2 text-xs bg-emerald-50 text-emerald-900", slot.isBreak && "bg-amber-50 text-amber-700")
            )}>
              <div className="flex flex-col items-center">
                <span>{slot.label}</span>
                {!slot.isBreak && <span className={cn("opacity-60", isPrint ? "text-[5px]" : "text-[8px]")}>{slot.time}</span>}
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {days.map(day => (
          <tr key={day.id} className={cn("group", isPrint ? "h-14" : "h-16")}>
            <td className={cn(isPrint ? "border border-black px-2" : "p-0.5")}>
              <div className={cn("flex flex-col items-center justify-center h-full", !isPrint && "bg-white rounded-md border border-gray-100 shadow-sm")}>
                <span className={cn("font-black", isPrint ? "text-[7px] text-black" : "text-[11px] text-emerald-600")}>{isRTL ? day.name : day.en}</span>
              </div>
            </td>
            {timeSlots.map(slot => {
              if (slot.isBreak) {
                return (
                  <td key={slot.id} className={cn(isPrint ? "border border-black" : "p-0.5")}>
                    <div className={cn(
                      "h-full w-full flex items-center justify-center",
                      !isPrint && "bg-amber-50/30 rounded-md border border-dashed border-amber-100"
                    )}>
                      <span className={cn("font-bold rotate-90", isPrint ? "text-[5px] text-black" : "text-[7px] text-amber-600/40")}>{slot.label}</span>
                    </div>
                  </td>
                );
              }
              const assignment = getAssignment(day.id, slot.id);
              return (
                <td key={slot.id} className={cn("relative group/cell h-full min-w-[60px]", isPrint ? "border border-black" : "p-0.5")}>
                  {assignment ? <LessonCard assignment={assignment} /> : (
                    !isPrint && (
                      <div className="h-full w-full rounded-lg border-2 border-dashed border-gray-100 flex items-center justify-center cursor-pointer hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group/add" onClick={() => onAddClick(day.id, slot.id)}>
                        <Plus size={14} className="text-gray-200 group-hover/add:text-emerald-400 transition-colors" />
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
    <div className={cn("flex w-full h-full", isRTL ? "flex-row" : "flex-row-reverse", isPrint ? "gap-1 items-stretch justify-center" : "gap-6 overflow-x-auto pb-4 relative")}>
      <div className={cn("h-full", isPrint ? "" : "flex-1 min-w-[800px]")}>
        {isTransposed ? renderTransposed() : renderStandard()}
      </div>
      {(isPrint || summaryData) && <SummaryTable />}
    </div>
  );
};

export default ScheduleTable;