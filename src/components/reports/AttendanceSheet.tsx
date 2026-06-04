"use client";

import React from "react";
import { format } from "date-fns";
import { Clock, Calendar, Hash, User, PenTool, FileText } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { PeriodPart } from "@/types";

interface AttendanceSheetProps {
  date: Date;
  period: PeriodPart;
  assignedEmployees: any[];
  t: any;
  isRTL: boolean;
  currentLocale: any;
  selectedDepartment: string;
  reportStyles: any;
  supervisors: string[];
}

const AttendanceSheet = ({
  date,
  period,
  assignedEmployees,
  t,
  isRTL,
  currentLocale,
  selectedDepartment,
  reportStyles,
  supervisors
}: AttendanceSheetProps) => {
  const isEmpty = assignedEmployees.length === 0;
  const maxRows = 21;
  const emptyRowsCount = Math.max(0, maxRows - assignedEmployees.length);

  const getPeriodRangeHint = (p: PeriodPart) => {
    if (p === "Morning") return "(08:00 - 12:00)";
    if (p === "Afternoon") return "(13:00 - 17:00)";
    if (p === "Evening") return "(17:00 - 21:00)";
    return "";
  };

  return (
    <div 
      className={cn(
        "bg-white p-6 mb-6 mx-auto shadow-md border border-slate-100 rounded-2xl page-break-container max-w-[210mm]",
        "print:shadow-none print:border-none print:p-0 print:m-0 print:rounded-none print:w-full"
      )}
      dir={isRTL ? "rtl" : "ltr"}
      style={{ fontFamily: reportStyles.fontFamily }}
    >
      {/* Official State Header */}
      <div className="flex flex-col items-center text-center mb-2 space-y-0.5">
        <p className="font-black text-black text-xs tracking-widest uppercase">{t.republic}</p>
        <div className="w-12 h-px bg-black/20 my-0.5"></div>
        <p className="font-bold text-black text-[10px]">{t.centerName}</p>
        <p className="font-bold text-black text-[10px]">{t.centerLocation}</p>
      </div>

      {/* Admin Row */}
      <div className="grid grid-cols-2 border-y border-black py-1 mb-2 text-[10px] font-black">
        <div className="flex items-center gap-2">
          <span className="text-black/60">{isRTL ? "المصلحة:" : "Department:"}</span>
          <span className="text-black">{selectedDepartment}</span>
        </div>
        <div className={cn("flex items-center gap-2", isRTL ? "justify-end" : "justify-start")}>
          <span className="text-black/60">{isRTL ? "السنة التكوينية:" : "Training Year:"}</span>
          <span className="text-black">2023 / 2024</span>
        </div>
      </div>

      {/* Main Document Title */}
      <div className="text-center mb-1">
        <div className="inline-block relative">
          <h1 className="font-black text-black text-base px-8 py-1.5 border-2 border-black relative z-10 bg-white">
            {t.attendanceSheet}
          </h1>
          <div className="absolute -bottom-1 -right-1 w-full h-full bg-black -z-0"></div>
        </div>
        
        <div className="mt-2 flex justify-center items-center gap-6">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-black/40" />
            <p className="text-black font-black text-sm underline decoration-dotted underline-offset-2">
              {format(date, "EEEE, d MMMM yyyy", { locale: currentLocale })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-black/40" />
            <p className="font-black text-black text-sm underline decoration-dotted underline-offset-2">
              {period === "Morning" ? t.morning : period === "Afternoon" ? t.afternoon : t.evening}
              <span className="ms-2 text-[10px] opacity-40 font-bold">{getPeriodRangeHint(period)}</span>
            </p>
          </div>
        </div>
      </div>
      
      {/* Attendance Table */}
      <div className="flex-1">
        <Table className="w-[96%] mx-auto border-collapse border border-black">
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-black h-6">
              <TableHead className="w-[50px] text-center font-black text-black border-e border-black p-0.5 text-[10px]">
                <div className="flex items-center justify-center gap-0.5"><Hash size={10}/>{t.number}</div>
              </TableHead>
              <TableHead className={cn("font-black text-black border-e border-black px-3 p-0.5 text-[10px]", isRTL ? "text-right" : "text-left")}>
                <div className="flex items-center gap-1.5"><User size={12}/>{t.employeeName}</div>
              </TableHead>
              <TableHead className="w-[130px] text-center font-black text-black border-e border-black p-0.5 text-[10px]">
                <div className="flex items-center justify-center gap-1.5"><PenTool size={12}/>{t.signature}</div>
              </TableHead>
              <TableHead className="text-center font-black text-black w-[160px] p-0.5 text-[10px]">
                <div className="flex items-center justify-center gap-1.5"><FileText size={12}/>{t.notes}</div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignedEmployees.map((emp, idx) => (
              <TableRow key={emp?.id} className="hover:bg-transparent border-b border-black h-8">
                <TableCell className="text-center font-black border-e border-black p-1 text-[10px] bg-slate-50/50">{idx + 1}</TableCell>
                <TableCell className={cn("font-black border-e border-black px-3 p-1 text-[11px] text-black", isRTL ? "text-right" : "text-left")}>
                  {emp?.lastName} {emp?.firstName}
                </TableCell>
                <TableCell className="border-e border-black p-1"></TableCell>
                <TableCell className="p-1"></TableCell>
              </TableRow>
            ))}
            {Array.from({ length: emptyRowsCount }).map((_, i) => (
              <TableRow key={`empty-${i}`} className="hover:bg-transparent border-b border-black h-8">
                <TableCell className="text-center border-e border-black p-1 text-[10px] font-bold text-black bg-slate-50/20">
                  {assignedEmployees.length + i + 1}
                </TableCell>
                <TableCell className="border-e border-black p-1"></TableCell>
                <TableCell className="border-e border-black p-1"></TableCell>
                <TableCell className="p-1"></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Signature Footer Section */}
      <div className="mt-6 grid grid-cols-2 gap-10 pt-4 border-t border-black">
        <div className="text-center space-y-1">
          <p className="font-black text-black text-xs uppercase tracking-wider">{supervisors[0] || (isRTL ? "رئيس المصلحة" : "Head of Dept")}</p>
          <p className="text-[9px] font-bold text-black/40 italic">({isRTL ? "توقيع وختم" : "Seal & Signature"})</p>
          <div className="h-14 border border-dashed border-black/10 mt-2 rounded-xl"></div>
        </div>
        <div className="text-center space-y-1">
          <p className="font-black text-black text-xs uppercase tracking-wider">{t.managerSignature}</p>
          <p className="text-[9px] font-bold text-black/40 italic">({isRTL ? "توقيع وختم" : "Seal & Signature"})</p>
          <div className="h-14 border border-dashed border-black/10 mt-2 rounded-xl"></div>
        </div>
      </div>

      {/* System Integrity Footer */}
      <div className="mt-6 flex justify-between items-center text-[7px] font-black text-black/30 uppercase tracking-[0.2em] border-t border-black/5 pt-2">
        <span>Digital ID: {Math.random().toString(36).substr(2, 12).toUpperCase()}</span>
        <span>Generated by EduSchedule Pro v2.5.4 — {format(new Date(), "yyyy-MM-dd HH:mm:ss")}</span>
      </div>
    </div>
  );
};

export default AttendanceSheet;