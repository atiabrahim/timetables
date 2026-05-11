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
}

const ScheduleTable = ({ 
  isRTL, days, timeSlots, getAssignment, onAddClick, onDeleteClick, 
  subjects, employees, classes, viewMode, isPrint = false, summaryData, totalHours 
}: ScheduleTableProps) => {
  return (
    <div className={cn("flex gap-0 w-full", isPrint ? "items-stretch" : "overflow-x-auto")}>
      <div className={cn("flex-1", isPrint ? "w-full" : "min-w-[600px]")}>
        <table className="w-full border-collapse border-2 border-black table-fixed">
          <thead>
            <tr>
              <th className="border border-black p-1 bg-gray-50 w-16 md:w-24 text-[10px] font-bold">
                {isRTL ? "الأيام / الحصص" : "Days / Periods"}
              </th>
              {timeSlots.map(slot => (
                <th key={slot.id} className={cn(
                  "border border-black p-1 text-center",
                  slot.isBreak ? "bg-gray-100 w-8 md:w-12" : "bg-white"
                )}>
                  <p className="text-[9px] md:text-[10px] font-bold">{slot.label}</p>
                  <p className="text-[7px] md:text-[8px] text-gray-500">{slot.time}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map(day => (
              <tr key={day.id} className={cn(isPrint ? "h-16" : "h-20")}>
                <td className="border border-black text-center font-bold text-xs md:text-sm bg-gray-50">
                  {isRTL ? day.name : day.en}
                </td>
                {timeSlots.map(slot => {
                  if (slot.isBreak) return <td key={slot.id} className="border border-black bg-gray-100"></td>;
                  const assignment = getAssignment(day.id, slot.id);
                  return (
                    <td key={slot.id} className="border border-black relative p-0.5 md:p-1 group overflow-hidden">
                      {assignment ? (
                        <div className="h-full flex flex-col justify-center items-center text-center">
                          <p className="text-[9px] md:text-[11px] font-bold leading-tight truncate w-full">
                            {subjects.find(s => s.id === assignment.subjectId)?.name || "---"}
                          </p>
                          <p className="text-[8px] md:text-[9px] text-gray-600 mt-0.5 truncate w-full">
                            {viewMode === "class" 
                              ? employees.find(e => e.id === assignment.employeeId)?.lastName 
                              : classes.find(c => c.id === assignment.classId)?.name
                            }
                          </p>
                          {assignment.room && (
                            <p className="text-[7px] md:text-[8px] text-emerald-700 font-medium mt-0.5">{assignment.room}</p>
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

      {isPrint && summaryData && (
        <div className="w-32 md:w-48 mr-[-2px] shrink-0">
          <table className="w-full h-full border-collapse border-2 border-black border-r-0">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-black p-1 text-[9px] md:text-[10px] font-bold">{isRTL ? "المادة" : "Subject"}</th>
                <th className="border border-black p-1 text-[9px] md:text-[10px] font-bold w-10">{isRTL ? "العدد" : "Qty"}</th>
              </tr>
            </thead>
            <tbody>
              {summaryData.map((item, idx) => (
                <tr key={idx} className="h-7 md:h-8">
                  <td className="border border-black p-1 text-[8px] md:text-[9px] text-center truncate">{item.subject}</td>
                  <td className="border border-black p-1 text-[8px] md:text-[9px] text-center font-bold w-10">{item.count}</td>
                </tr>
              ))}
              {Array.from({ length: Math.max(0, 10 - summaryData.length) }).map((_, i) => (
                <tr key={`empty-${i}`} className="h-7 md:h-8">
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1 w-10"></td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-bold">
                <td className="border border-black p-1 text-[9px] md:text-[10px] text-center">{isRTL ? "المجموع" : "Total"}</td>
                <td className="border border-black p-1 text-[9px] md:text-[10px] text-center w-10">{totalHours}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ScheduleTable;