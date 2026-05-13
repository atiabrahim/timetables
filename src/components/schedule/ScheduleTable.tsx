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

const ScheduleTable = ({ 
  isRTL, days, timeSlots, getAssignment, onAddClick, onDeleteClick, 
  subjects, employees, classes, viewMode, isPrint = false, summaryData, totalHours, isTransposed = false 
}: ScheduleTableProps) => {
  
  const SummaryTable = () => (
    <div className={cn("mr-[-2px] shrink-0", isPrint ? "w-32 md:w-40" : "w-40 md:w-56")}>
      <table className="w-full border-collapse border-2 border-black border-r-0">
        <thead>
          <tr className="bg-gray-50">
            <th className={cn("border border-black p-0.5 font-bold", isPrint ? "text-[7px]" : "text-[8px] md:text-[9px]")}>{isRTL ? "المادة" : "Subject"}</th>
            <th className={cn("border border-black p-0.5 font-bold", isPrint ? "text-[7px]" : "text-[8px] md:text-[9px]")}>
              {viewMode === "class" ? (isRTL ? "الأستاذ" : "Teacher") : (isRTL ? "الفرع" : "Branch")}
            </th>
            <th className={cn("border border-black p-0.5 font-bold w-6", isPrint ? "text-[7px]" : "text-[8px] md:text-[9px]")}>{isRTL ? "س" : "H"}</th>
          </tr>
        </thead>
        <tbody>
          {summaryData?.map((item, idx) => (
            <tr key={idx} className={cn(isPrint ? "h-5" : "h-8")}>
              <td className={cn("border border-black p-0.5 text-center whitespace-normal break-words leading-tight", isPrint ? "text-[6px]" : "text-[7px] md:text-[8px]")}>{item.subject}</td>
              <td className={cn("border border-black p-0.5 text-center whitespace-normal break-words leading-tight", isPrint ? "text-[6px]" : "text-[7px] md:text-[8px]")}>
                {viewMode === "class" ? item.teacher : item.branch}
              </td>
              <td className={cn("border border-black p-0.5 text-center font-bold w-6", isPrint ? "text-[6px]" : "text-[7px] md:text-[8px]")}>{item.count}</td>
            </tr>
          ))}
          <tr className="bg-gray-50 font-bold h-6">
            <td colSpan={2} className={cn("border border-black p-0.5 text-center", isPrint ? "text-[7px]" : "text-[8px] md:text-[9px]")}>{isRTL ? "المجموع" : "Total"}</td>
            <td className={cn("border border-black p-0.5 text-center w-6", isPrint ? "text-[7px]" : "text-[8px] md:text-[9px]")}>{totalHours}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  if (isTransposed) {
    return (
      <div className={cn("flex gap-0 w-full", isPrint ? "items-start" : "overflow-x-auto")}>
        <div className={cn("flex-1", isPrint ? "w-full" : "min-w-[600px]")}>
          <table className="w-full border-collapse border-2 border-black table-fixed">
            <thead>
              <tr>
                <th className={cn("border border-black p-1 bg-gray-50 font-bold", isPrint ? "w-12 text-[8px]" : "w-16 md:w-24 text-[10px]")}>
                  {isRTL ? "الحصص / الأيام" : "Periods / Days"}
                </th>
                {days.map(day => (
                  <th key={day.id} className="border border-black p-1 text-center bg-white">
                    <p className={cn("font-bold", isPrint ? "text-[8px]" : "text-[9px] md:text-[10px]")}>{isRTL ? day.name : day.en}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map(slot => (
                <tr 
                  key={slot.id} 
                  className={cn(
                    slot.id === 'break-am' ? "h-[12px]" : 
                    slot.id === 'break-noon' ? "h-[20px]" : 
                    (isPrint ? "h-12" : "h-20")
                  )}
                >
                  <td className={cn(
                    "border border-black text-center font-bold bg-gray-50",
                    slot.isBreak ? "bg-gray-100" : ""
                  )}>
                    <p className={cn(
                      "font-bold", 
                      slot.id === 'break-am' ? "text-[7px] leading-none" : 
                      slot.id === 'break-noon' ? "text-[8px] leading-tight" : 
                      (isPrint ? "text-[8px]" : "text-[9px] md:text-[10px]")
                    )}>
                      {slot.label}
                    </p>
                    {slot.id !== 'break-am' && slot.id !== 'break-noon' && !slot.isBreak && (
                      <p className={cn("text-gray-500", isPrint ? "text-[6px]" : "text-[7px] md:text-[8px]")}>{slot.time}</p>
                    )}
                  </td>
                  {days.map(day => {
                    if (slot.isBreak) return <td key={day.id} className="border border-black bg-gray-100"></td>;
                    const assignment = getAssignment(day.id, slot.id);
                    return (
                      <td key={day.id} className="border border-black relative p-0.5 group overflow-hidden">
                        {assignment ? (
                          <div className="h-full flex flex-col justify-center items-center text-center">
                            <p className={cn("font-bold leading-tight whitespace-normal break-words w-full", isPrint ? "text-[8px]" : "text-[9px] md:text-[11px]")}>
                              {subjects.find(s => s.id === assignment.subjectId)?.name || "---"}
                            </p>
                            <p className={cn("text-gray-600 mt-0.5 whitespace-normal break-words w-full leading-none", isPrint ? "text-[7px]" : "text-[8px] md:text-[9px]")}>
                              {viewMode === "class" 
                                ? (() => {
                                    const e = employees.find(emp => emp.id === assignment.employeeId);
                                    return e ? `${e.lastName} ${e.firstName}` : "---";
                                  })()
                                : classes.find(c => c.id === assignment.classId)?.name
                              }
                            </p>
                            {assignment.room && (
                              <p className={cn("text-emerald-700 font-medium mt-0.5 leading-none", isPrint ? "text-[6px]" : "text-[7px] md:text-[8px]")}>{assignment.room}</p>
                            )}
                            {!isPrint && (
                              <Button 
                                variant="ghost" size="icon" className="absolute top-0 right-0 h-5 w-5 text-red-400 opacity-0 group-hover:opacity-100"
                                onClick={() => onDeleteClick(assignment.id)}
                              ><Trash2 size={10} /></Button>
                            )}
                          </div>
                        ) : (
                          !isPrint && (
                            <Button variant="ghost" className="w-full h-full opacity-0 group-hover:opacity-100" onClick={() => onAddClick(day.id, slot.id)}>
                              <Plus size={14} />
                            </Button>
                          )
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {isPrint && summaryData && <SummaryTable />}
      </div>
    );
  }

  return (
    <div className={cn("flex gap-0 w-full", isPrint ? "items-start" : "overflow-x-auto")}>
      <div className={cn("flex-1", isPrint ? "w-full" : "min-w-[600px]")}>
        <table className="w-full border-collapse border-2 border-black table-fixed">
          <thead>
            <tr>
              <th className={cn("border border-black p-1 bg-gray-50 font-bold", isPrint ? "w-12 text-[8px]" : "w-16 md:w-24 text-[10px]")}>
                {isRTL ? "الأيام / الحصص" : "Days / Periods"}
              </th>
              {timeSlots.map(slot => (
                <th key={slot.id} className={cn(
                  "border border-black p-1 text-center",
                  slot.isBreak ? (slot.id === 'break-am' ? "bg-gray-100 w-3 md:w-4" : "bg-gray-100 w-6 md:w-8") : "bg-white"
                )}>
                  <p className={cn(
                    "font-bold", 
                    slot.id === 'break-am' ? "text-[7px] leading-none [writing-mode:vertical-rl] rotate-180 mx-auto h-12 flex items-center justify-center" : (isPrint ? "text-[8px]" : "text-[9px] md:text-[10px]")
                  )}>
                    {slot.label}
                  </p>
                  {slot.id !== 'break-am' && !slot.isBreak && (
                    <p className={cn("text-gray-500", isPrint ? "text-[6px]" : "text-[7px] md:text-[8px]")}>{slot.time}</p>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map(day => (
              <tr key={day.id} className={cn(isPrint ? "h-12" : "h-20")}>
                <td className={cn("border border-black text-center font-bold bg-gray-50", isPrint ? "text-[8px]" : "text-xs md:text-sm")}>
                  {isRTL ? day.name : day.en}
                </td>
                {timeSlots.map(slot => {
                  if (slot.isBreak) return <td key={slot.id} className="border border-black bg-gray-100"></td>;
                  const assignment = getAssignment(day.id, slot.id);
                  return (
                    <td key={slot.id} className="border border-black relative p-0.5 group overflow-hidden">
                      {assignment ? (
                        <div className="h-full flex flex-col justify-center items-center text-center">
                          <p className={cn("font-bold leading-tight whitespace-normal break-words w-full", isPrint ? "text-[8px]" : "text-[9px] md:text-[11px]")}>
                            {subjects.find(s => s.id === assignment.subjectId)?.name || "---"}
                          </p>
                          <p className={cn("text-gray-600 mt-0.5 whitespace-normal break-words w-full leading-none", isPrint ? "text-[7px]" : "text-[8px] md:text-[9px]")}>
                            {viewMode === "class" 
                              ? (() => {
                                  const e = employees.find(emp => emp.id === assignment.employeeId);
                                  return e ? `${e.lastName} ${e.firstName}` : "---";
                                })()
                              : classes.find(c => c.id === assignment.classId)?.name
                            }
                          </p>
                          {assignment.room && (
                            <p className={cn("text-emerald-700 font-medium mt-0.5 leading-none", isPrint ? "text-[6px]" : "text-[7px] md:text-[8px]")}>{assignment.room}</p>
                          )}
                          {!isPrint && (
                            <Button 
                              variant="ghost" size="icon" className="absolute top-0 right-0 h-5 w-5 text-red-400 opacity-0 group-hover:opacity-100"
                              onClick={() => onDeleteClick(assignment.id)}
                            ><Trash2 size={10} /></Button>
                          )}
                        </div>
                      ) : (
                        !isPrint && (
                          <Button variant="ghost" className="w-full h-full opacity-0 group-hover:opacity-100" onClick={() => onAddClick(day.id, slot.id)}>
                            <Plus size={14} />
                          </Button>
                        )
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isPrint && summaryData && <SummaryTable />}
    </div>
  );
};

export default ScheduleTable;