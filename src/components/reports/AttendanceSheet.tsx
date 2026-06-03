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
  departments: string[];
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
  departments,
  reportStyles,
  supervisors
}: AttendanceSheetProps) => {
  const isEmpty = assignedEmployees.length === 0;
  const maxRows = 18;
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
        "bg-white p-12 mb-16 mx-auto shadow-2xl border border-slate-100 rounded-[2.5rem] page-break-container max-w-[210mm]",
        "print:shadow-none print:border-none print:p-0 print:m-0 print:rounded-none print:w-full"
      )}
      dir={isRTL ? "rtl" : "ltr"}
      style={{ fontFamily: reportStyles.fontFamily }}
    >
      {/* Official State Header */}
      <div className="flex flex-col items-center text-center mb-8 space-y-1">
        <p className="font-black text-black text-sm tracking-widest uppercase">{t.republic}</p>
        <div className="w-16 h-px bg-black/20 my-1"></div>
        <p className="font-bold text-black text-xs">{t.centerName}</p>
        <p className="font-bold text-black text-xs">{t.centerLocation}</p>
      </div>

      {/* Admin Row */}
      <div className="grid grid-cols-2 border-y-2 border-black py-2 mb-8 text-xs font-black">
        <div className="flex items-center gap-2">
          <span className="text-black/60">{isRTL ? "المصلحة:" : "Department:"}</span>
          <span className="text-black">{departments[0] || "مديرية الدراسات والتربصات"}</span>
        </div>
        <div className={cn("flex items-center gap-2", isRTL ? "justify-end" : "justify-start")}>
          <span className="text-black/60">{isRTL ? "السنة الدراسية:" : "Academic Year:"}</span>
          <span className="text-black">2023 / 2024</span>
        </div>
      </div>

      {/* Main Document Title */}
      <div className="text-center mb-10">
        <div className="inline-block relative">
          <h1 className="font-black text-black text-2xl px-12 py-3 border-4 border-black relative z-10 bg-white">
            {t.attendanceSheet}
          </h1>
          <div className="absolute -bottom-2 -right-2 w-full h-full bg-black -z-0"></div>
        </div>
        
        <div className="mt-8 flex justify-center items-center gap-10">
          <div className="flex items-center gap-3">
            <Calendar size={20} className="text-black/40" />
            <p className="text-black font-black text-lg underline decoration-dotted underline-offset-4">
              {format(date, "EEEE, d MMMM yyyy", { locale: currentLocale })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-black/40" />
            <p className="font-black text-black text-lg underline decoration-dotted underline-offset-4">
              {period === "Morning" ? t.morning : period === "Afternoon" ? t.afternoon : t.evening}
              <span className="ms-3 text-xs opacity-40 font-bold">{getPeriodRangeHint(period)}</span>
            </p>
          </div>
        </div>
      </div>
      
      {/* Attendance Table */}
      <div className="flex-1">
        <Table className="w-full border-collapse border-2 border-black">
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50 border-b-2 border-black h-12">
              <TableHead className="w-[70px] text-center font-black text-black border-e-2 border-black">
                <div className="flex items-center justify-center gap-1"><Hash size={12}/>{t.number}</div>
              </TableHead>
              <TableHead className={cn("font-black text-black border-e-2 border-black px-6", isRTL ? "text-right" : "text-left")}>
                <div className="flex items-center gap-2"><User size={14}/>{t.employeeName}</div>
              </TableHead>
              <TableHead className="w-[180px] text-center font-black text-black border-e-2 border-black">
                <div className="flex items-center justify-center gap-2"><PenTool size={14}/>{t.signature}</div>
              </TableHead>
              <TableHead className="text-center font-black text-black w-[220px]">
                <div className="flex items-center justify-center gap-2"><FileText size={14}/>{t.notes}</div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignedEmployees.map((emp, idx) => (
              <TableRow key={emp?.id} className="hover:bg-transparent border-b-2 border-black h-11">
                <TableCell className="text-center font-black border-e-2 border-black p-0 bg-slate-50/50">{idx + 1}</TableCell>
                <TableCell className={cn("font-black border-e-2 border-black px-6 text-black", isRTL ? "text-right" : "text-left")}>
                  {emp?.lastName} {emp?.firstName}
                </TableCell>
                <TableCell className="border-e-2 border-black p-0"></TableCell>
                <TableCell className="p-0"></TableCell>
              </TableRow>
            ))}
            {Array.from({ length: emptyRowsCount }).map((_, i) => (
              <TableRow key={`empty-${i}`} className="hover:bg-transparent border-b-2 border-black h-11">
                <TableCell className="text-center border-e-2 border-black p-0 font-bold text-black bg-slate-50/20">
                  {assignedEmployees.length + i + 1}
                </TableCell>
                <TableCell className="border-e-2 border-black p-0"></TableCell>
                <TableCell className="border-e-2 border-black p-0"></TableCell>
                <TableCell className="p-0"></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Signature Footer Section */}
      <div className="mt-12 grid grid-cols-2 gap-20 pt-10 border-t-4 border-black">
        <div className="text-center space-y-2">
          <p className="font-black text-black text-sm uppercase tracking-wider">{supervisors[0] || (isRTL ? "رئيس المصلحة" : "Head of Dept")}</p>
          <p className="text-[10px] font-bold text-black/40 italic">({isRTL ? "توقيع وختم" : "Seal & Signature"})</p>
          <div className="h-32 border-2 border-dashed border-black/10 mt-4 rounded-3xl"></div>
        </div>
        <div className="text-center space-y-2">
          <p className="font-black text-black text-sm uppercase tracking-wider">{t.managerSignature}</p>
          <p className="text-[10px] font-bold text-black/40 italic">({isRTL ? "توقيع وختم" : "Seal & Signature"})</p>
          <div className="h-32 border-2 border-dashed border-black/10 mt-4 rounded-3xl"></div>
        </div>
      </div>

      {/* System Integrity Footer */}
      <div className="mt-10 flex justify-between items-center text-[8px] font-black text-black/30 uppercase tracking-[0.2em] border-t border-black/5 pt-4">
        <span>Digital ID: {Math.random().toString(36).substr(2, 12).toUpperCase()}</span>
        <span>Generated by EduSchedule Pro v2.5.4 — {format(new Date(), "yyyy-MM-dd HH:mm:ss")}</span>
      </div>
    </div>
  );
};

export default AttendanceSheet;