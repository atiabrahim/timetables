"use client";

import React, { useState } from "react";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
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
  isAdmin?: boolean;
}

const SUBJECT_COLORS = [
  "bg-emerald-600", "bg-blue-600", "bg-amber-600", "bg-rose-600", 
  "bg-indigo-600", "bg-teal-600", "bg-violet-600", "bg-cyan-600",
  "bg-orange-600", "bg-slate-700"
];

const getSubjectColor = (index: number) => SUBJECT_COLORS[index % SUBJECT_COLORS.length];

const ScheduleTable = ({ 
  isRTL, days, timeSlots, getAssignment, onAddClick, onDeleteClick, 
  subjects, employees, classes, viewMode, isPrint = false, summaryData = [], totalHours = 0, isTransposed = false, allAssignments = [], isAdmin = true
}: ScheduleTableProps) => {
  const [hoveredCell, setHoveredCell] = useState<{ day: number; period: string } | null>(null);

  const hoveredAssignment = hoveredCell ? getAssignment(hoveredCell.day, hoveredCell.period) : null;

  const checkConflict = (day: number, period: string, assignment: any) => {
    if (isPrint || !allAssignments) return null;
    const teacherConflict = allAssignments.find(a => 
      a.id !== assignment.id && a.day === day && a.period === period && a.employeeId === assignment.employeeId
    );
    const roomConflict = assignment.room ? allAssignments.find(a => 
      a.id !== assignment.id && a.day === day && a.period === period && a.room === assignment.room
    ) : null;
    return teacherConflict || roomConflict ? { teacherConflict, roomConflict } : null;
  };
  
  const SummaryTable = () => (
    <div className={cn("shrink-0", isPrint ? "w-[110px]" : "w-auto min-w-[180px] h-fit")}>
      <div className={cn("bg-white border", isPrint ? "border-emerald-950" : "rounded-xl border-slate-200 shadow-sm")}>
        <table className="w-full border-collapse table-auto">
          <thead>
            <tr className={cn(isPrint ? "bg-emerald-50 border-b" : "bg-emerald-950 text-white")}>
              <th className={cn("py-0.5 px-2 font-black uppercase border-b w-[70%] whitespace-nowrap", isPrint ? "text-[7px] text-emerald-950 border-emerald-950" : "text-[10px] border-emerald-900", isRTL ? "text-right" : "text-left")}>{isRTL ? "المادة" : "Subject"}</th>
              <th className={cn("py-0.5 px-2 font-black uppercase text-center border-s border-b w-[30%] whitespace-nowrap", isPrint ? "text-[7px] text-emerald-950 border-emerald-950" : "text-[10px] border-emerald-900")}>{isRTL ? "Total" : "Total"}</th>
            </tr>
          </thead>
          <tbody className={cn(isPrint ? "divide-y divide-emerald-950" : "divide-y divide-slate-100")}>
            {summaryData.map((item, idx) => (
              <tr key={idx}>
                <td className={cn("py-0.5 px-2 leading-none", isRTL ? "text-right" : "text-left")}>
                  <span className={cn("font-bold block whitespace-nowrap", isPrint ? "text-[7px] text-black" : "text-[10px] text-slate-800")}>{item.subject}</span>
                </td>
                <td className="py-0.5 px-2 text-center border-s border-emerald-900/10">
                  <span className={cn("font-black", isPrint ? "text-[7.5px] text-black" : "text-[11px] text-emerald-700")}>{item.count}</span>
                </td>
              </tr>
            ))}
            <tr className={cn("font-black", isPrint ? "bg-emerald-50 border-t" : "bg-emerald-50/50")}>
              <td className={cn("py-0.5 px-2", isPrint ? "text-[7.5px] text-emerald-950" : "text-[10px] text-emerald-900", isRTL ? "text-right" : "text-left")}>{isRTL ? "الحجم الساعي" : "Weekly Total"}</td>
              <td className="py-0.5 px-2 text-center border-s border-emerald-950"><span className={cn("font-black", isPrint ? "text-[8px]" : "text-[12px]")}>{totalHours}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const LessonCard = ({ assignment, day, period, isHovered }: { assignment: any, day: number, period: string, isHovered: boolean }) => {
    const subjectIndex = subjects.findIndex(s => s.id === assignment.subjectId);
    const colorClass = getSubjectColor(subjectIndex);
    const conflict = checkConflict(day, period, assignment);

    return (
      <TooltipProvider>
        <div className={cn(
          "h-full w-full flex flex-col justify-center items-center text-center relative transition-all group/card", 
          isPrint ? "p-0.5 text-black bg-white" : cn("text-white shadow-sm rounded-lg p-1", colorClass, "hover:scale-[1.01]", conflict && "ring-1 ring-red-500", isHovered && "ring-2 ring-emerald-400 scale-[1.02] shadow-md")
        )}>
          <p className={cn("font-bold leading-none truncate w-full mb-0.5", isPrint ? "text-[6.5px] opacity-70" : "text-[8px] opacity-80")}>
            {viewMode === "class" ? employees.find(emp => emp.id === assignment.employeeId)?.lastName : classes.find(c => c.id === assignment.classId)?.name}
          </p>
          <p className={cn("font-black leading-none uppercase w-full truncate", isPrint ? "text-[8px] mb-0.5" : "text-[10px] mb-0.5")}>{subjects.find(s => s.id === assignment.subjectId)?.name || "---"}</p>
          <p className={cn("font-bold leading-none truncate w-full", isPrint ? "text-[6.5px] text-emerald-900" : "text-[8px] opacity-90")}>{assignment.room || "---"}</p>
          {!isPrint && isAdmin && (
            <div className="absolute -top-1 -right-1 flex gap-0.5 opacity-0 group-hover/card:opacity-100 transition-opacity">
              {conflict && (
                <Tooltip><TooltipTrigger asChild><div className="bg-red-500 text-white p-0.5 rounded-full shadow-md"><AlertTriangle size={8} /></div></TooltipTrigger>
                  <TooltipContent className="bg-red-900 text-white border-none rounded-lg p-2 shadow-xl">
                    <p className="font-bold text-[10px]">{isRTL ? "تنبيه تعارض:" : "Conflict Alert:"}</p>
                    <ul className="text-[9px] mt-0.5 list-disc list-inside opacity-90">
                      {conflict.teacherConflict && <li>{isRTL ? "الأستاذ مشغول في فوج آخر" : "Teacher is busy elsewhere"}</li>}
                      {conflict.roomConflict && <li>{isRTL ? "القاعة محجوزة في فوج آخر" : "Room is occupied elsewhere"}</li>}
                    </ul>
                  </TooltipContent>
                </Tooltip>
              )}
              <button className="bg-white text-red-500 p-0.5 rounded-full shadow-md hover:bg-red-50" onClick={(e) => { e.stopPropagation(); onDeleteClick(assignment.id); }}><Trash2 size={8} /></button>
            </div>
          )}
        </div>
      </TooltipProvider>
    );
  };

  const BreakRow = ({ title }: { title: string }) => (
    <tr className={cn(isPrint ? "h-2.5" : "h-4", "bg-emerald-50/30")}>
      <td className={cn("border border-emerald-950 text-center font-black", isPrint ? "text-[6px]" : "text-[8px]")}>---</td>
      <td colSpan={days.length} className={cn("border border-emerald-950 text-center font-black uppercase tracking-wider", isPrint ? "text-[7px] p-0" : "text-[9px] text-emerald-800")}>{title}</td>
    </tr>
  );

  if (isTransposed) {
    return (
      <div className={cn("flex items-stretch w-full gap-0", isPrint ? "overflow-hidden" : "overflow-x-auto pb-1", isRTL ? "flex-row" : "flex-row-reverse")}>
        <div className="flex-1 min-w-0">
          <table className={cn("w-full border-collapse h-full table-fixed", isPrint ? "border border-emerald-950" : "")}>
            <colgroup>
              <col className={isPrint ? "w-[30px]" : "w-[50px]"} />
              {timeSlots.map(slot => (
                <React.Fragment key={slot.id}>
                  <col />
                  {(slot.id === "2" || slot.id === "4") && <col className={isPrint ? "w-[8px]" : "w-[12px]"} />}
                </React.Fragment>
              ))}
            </colgroup>
            <thead>
              <tr className={isPrint ? "h-5" : "h-8"}>
                <th className={cn("font-black text-center", isPrint ? "border border-emerald-950 text-[7.5px] bg-emerald-50" : "rounded-lg bg-slate-50 text-slate-500 p-1 uppercase text-[9px]")}>{isRTL ? "اليوم" : "Day"}</th>
                {timeSlots.map(slot => {
                  const isColHovered = hoveredCell?.period === slot.id;
                  return (
                    <React.Fragment key={slot.id}>
                      <th className={cn(
                        "font-black text-center px-0.5 transition-colors duration-150", 
                        isPrint ? "border border-emerald-950 text-[7.5px] bg-emerald-50" : cn("rounded-lg p-1 text-[9px]", isColHovered ? "bg-emerald-800 text-white" : "bg-emerald-950 text-emerald-400")
                      )}>
                        <div className="flex flex-col items-center justify-center">
                          <span className="whitespace-nowrap">{slot.label}</span>
                          <span className={cn("font-bold opacity-70 mt-0.5 whitespace-nowrap", isPrint ? "text-[4.5px]" : "text-[7px]")}>{slot.time}</span>
                        </div>
                      </th>
                      {(slot.id === "2" || slot.id === "4") && <th className="border border-emerald-950 bg-emerald-50/50 text-[6px] font-black [writing-mode:vertical-rl] rotate-180 p-0.5 text-center">{isRTL ? "راحة" : "BREAK"}</th>}
                    </React.Fragment>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {days.map(day => {
                const isRowHovered = hoveredCell?.day === day.id;
                return (
                  <tr key={day.id} className={cn(isPrint ? "h-8" : "h-12", !isPrint && isRowHovered && "bg-emerald-50/20")}>
                    <td className={cn(
                      "transition-colors duration-150",
                      isPrint ? "border border-emerald-950 p-0.5 bg-emerald-50/10" : cn("p-1 border-e border-slate-100 text-center", isRowHovered && "bg-emerald-50/40")
                    )}>
                      <span className={cn("font-black", isPrint ? "text-[8px]" : "text-[11px] text-slate-600")}>{isRTL ? day.name : day.en.substr(0, 3)}</span>
                    </td>
                    {timeSlots.map(slot => {
                      const currentAssignment = getAssignment(day.id, slot.id);
                      const isSpannedHovered = !!(
                        hoveredAssignment && 
                        currentAssignment && 
                        currentAssignment.day === hoveredAssignment.day &&
                        currentAssignment.subjectId === hoveredAssignment.subjectId &&
                        currentAssignment.employeeId === hoveredAssignment.employeeId &&
                        currentAssignment.classId === hoveredAssignment.classId
                      );
                      const isCellHovered = hoveredCell?.day === day.id || hoveredCell?.period === slot.id || isSpannedHovered;
                      const isExactHovered = (hoveredCell?.day === day.id && hoveredCell?.period === slot.id) || isSpannedHovered;

                      return (
                        <React.Fragment key={slot.id}>
                          <td 
                            className={cn(
                              "relative h-full transition-colors duration-150", 
                              isPrint ? "border border-emerald-950" : cn("p-0.5", isCellHovered && "bg-emerald-50/30", isSpannedHovered && "bg-emerald-100/40")
                            )}
                            onMouseEnter={() => !isPrint && setHoveredCell({ day: day.id, period: slot.id })}
                            onMouseLeave={() => !isPrint && setHoveredCell(null)}
                          >
                            {currentAssignment ? (
                              <LessonCard 
                                assignment={currentAssignment} 
                                day={day.id} 
                                period={slot.id} 
                                isHovered={isExactHovered}
                              />
                            ) : (
                              !isPrint && isAdmin && (
                                <div className="h-full w-full rounded-lg border border-dashed border-slate-100 flex items-center justify-center cursor-pointer hover:bg-emerald-50/50" onClick={() => onAddClick(day.id, slot.id)}>
                                  <Plus size={10} className="text-slate-200" />
                                </div>
                              )
                            )}
                          </td>
                          {(slot.id === "2" || slot.id === "4") && <td className="border border-emerald-950 bg-emerald-50/20"></td>}
                        </React.Fragment>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <SummaryTable />
      </div>
    );
  }

  return (
    <div className={cn("flex items-stretch w-full gap-0", isPrint ? "overflow-hidden" : "overflow-x-auto pb-1", isRTL ? "flex-row" : "flex-row-reverse")}>
      <div className="flex-1 min-w-0">
        <table className={cn("w-full border-collapse h-full table-fixed", isPrint ? "border border-emerald-950" : "")}>
          <colgroup>
            <col className={isPrint ? "w-[30px]" : "w-[50px]"} />
            {days.map(day => <col key={day.id} />)}
          </colgroup>
          <thead>
            <tr className={isPrint ? "h-5" : "h-8"}>
              <th className={cn("font-black text-center", isPrint ? "border border-emerald-950 text-[7.5px] bg-emerald-50" : "rounded-lg bg-emerald-950 text-emerald-400 p-1 text-[9px]")}>{isRTL ? "الحصة" : "Slot"}</th>
              {days.map(day => {
                const isColHovered = hoveredCell?.day === day.id;
                return (
                  <th 
                    key={day.id} 
                    className={cn(
                      "font-black text-center px-0.5 transition-colors duration-150", 
                      isPrint ? "border border-emerald-950 text-[8.5px] bg-emerald-50" : cn("rounded-lg p-1 uppercase text-[9px]", isColHovered ? "bg-emerald-100 text-emerald-900" : "bg-slate-50 text-slate-500")
                    )}
                  >
                    {isRTL ? day.name : day.en.substr(0, 3)}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(slot => {
              const isRowHovered = hoveredCell?.period === slot.id;
              return (
                <React.Fragment key={slot.id}>
                  <tr className={cn(isPrint ? "h-8" : "h-12", !isPrint && isRowHovered && "bg-emerald-50/20")}>
                    <td className={cn(
                      "transition-colors duration-150",
                      isPrint ? "border border-emerald-950 p-0.5 bg-emerald-50/10 text-center" : cn("p-1 border-e border-slate-100 text-center", isRowHovered && "bg-emerald-50/40")
                    )}>
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <span className={cn("font-black leading-none whitespace-nowrap", isPrint ? "text-[8px]" : "text-[11px] text-slate-600")}>{slot.label}</span>
                        <span className={cn("font-bold opacity-60 mt-0.5 whitespace-nowrap", isPrint ? "text-[4.5px]" : "text-[7px]")}>{slot.time}</span>
                      </div>
                    </td>
                    {days.map(day => {
                      const currentAssignment = getAssignment(day.id, slot.id);
                      const isSpannedHovered = !!(
                        hoveredAssignment && 
                        currentAssignment && 
                        currentAssignment.day === hoveredAssignment.day &&
                        currentAssignment.subjectId === hoveredAssignment.subjectId &&
                        currentAssignment.employeeId === hoveredAssignment.employeeId &&
                        currentAssignment.classId === hoveredAssignment.classId
                      );
                      const isCellHovered = hoveredCell?.day === day.id || hoveredCell?.period === slot.id || isSpannedHovered;
                      const isExactHovered = (hoveredCell?.day === day.id && hoveredCell?.period === slot.id) || isSpannedHovered;

                      return (
                        <td 
                          key={day.id} 
                          className={cn(
                            "relative h-full transition-colors duration-150", 
                            isPrint ? "border border-emerald-950" : cn("p-0.5", isCellHovered && "bg-emerald-50/30", isSpannedHovered && "bg-emerald-100/40")
                          )}
                          onMouseEnter={() => !isPrint && setHoveredCell({ day: day.id, period: slot.id })}
                          onMouseLeave={() => !isPrint && setHoveredCell(null)}
                        >
                          {currentAssignment ? (
                            <LessonCard 
                              assignment={currentAssignment} 
                              day={day.id} 
                              period={slot.id} 
                              isHovered={isExactHovered}
                            />
                          ) : (
                            !isPrint && isAdmin && (
                              <div className="h-full w-full rounded-lg border border-dashed border-slate-100 flex items-center justify-center cursor-pointer hover:bg-emerald-50/50" onClick={() => onAddClick(day.id, slot.id)}><Plus size={10} className="text-slate-200" /></div>
                            )
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  {slot.id === "2" && <BreakRow title={isRTL ? "راحة" : "BREAK"} />}
                  {slot.id === "4" && <BreakRow title={isRTL ? "راحة الزوال" : "NOON BREAK"} />}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <SummaryTable />
    </div>
  );
};

export default ScheduleTable;