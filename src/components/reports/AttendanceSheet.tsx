"use client";

import React from "react";
import { format } from "date-fns";
import { Clock, Calendar } from "lucide-react";
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
  const dateStr = format(date, "yyyy-MM-dd");
  const isEmpty = assignedEmployees.length === 0;
  const maxRows = 16;
  const emptyRowsCount = Math.max(0, maxRows - assignedEmployees.length);

  const getPeriodRangeHint = (p: PeriodPart) => {
    if (p === "Morning") return "(1 - 4)";
    if (p === "Afternoon") return "(5 - 7)";
    if (p === "Evening") return "(8 - 10)";
    return "";
  };

  return (
    <div 
      className={cn(
        "bg-white p-10 mb-12 mx-auto shadow-2xl border border-slate-100 rounded-[2rem] page-break-container max-w-[210mm]",
        "print:shadow-none print:border-none print:p-0 print:m-0 print:rounded-none print:w-full"
      )}
      dir={isRTL ? "rtl" : "ltr"}
      style={{ fontFamily: reportStyles.fontFamily }}
    >
      {/* Official Algerian Header */}
      <div className="flex flex-col items-center text-center mb-6 space-y-1" style={{ fontSize: `${reportStyles.headerSize}px` }}>
        <p className="font-black text-black tracking-tight">{t.republic}</p>
        <p className="font-bold text-black">{t.centerName}</p>
        <p className="font-bold text-black">{t.centerLocation}</p>
      </div>

      {/* Department & Academic Year Row */}
      <div className={cn("mb-6 flex justify-between items-center border-b-2 border-black pb-3", isRTL ? "flex-row" : "flex-row-reverse")} style={{ fontSize: `${reportStyles.headerSize}px` }}>
        <p className="font-black text-black">
          {t.department}: <span className="font-bold text-black">{departments[0] || "مصلحة التكوين"}</span>
        </p>
        <p className="font-black text-black">
          {isRTL ? "السنة الدراسية:" : "Academic Year:"}: <span className="font-bold text-black">2023/2024</span>
        </p>
      </div>

      {/* Title Section */}
      <div className="text-center mb-8">
        <h1 className="font-black text-black mb-4 underline underline-offset-8 decoration-2" style={{ fontSize: `${reportStyles.titleSize}px` }}>
          {t.attendanceSheet}
        </h1>
        <div className="flex justify-center items-center gap-6 bg-slate-50 py-3 px-8 rounded-2xl inline-flex mx-auto border border-black/10 shadow-sm print:border-black/20">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-black" />
            <p className="text-black font-black" style={{ fontSize: `${reportStyles.headerSize + 2}px` }}>
              {format(date, "EEEE, d MMMM yyyy", { locale: currentLocale })}
            </p>
          </div>
          <span className="text-black/20 h-6 w-px bg-black/20"></span>
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-black" />
            <p className="font-black text-black" style={{ fontSize: `${reportStyles.headerSize + 2}px` }}>
              {period === "Morning" ? t.morning : period === "Afternoon" ? t.afternoon : t.evening}
              <span className="mx-2 opacity-60 text-[10px]">{getPeriodRangeHint(period)}</span>
            </p>
          </div>
        </div>
      </div>
      
      {/* Table Section with Solid Black Borders */}
      <div className="flex-1 overflow-visible">
        {isEmpty ? (
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-black rounded-3xl bg-slate-50/50 print:bg-white">
             <p className="font-bold text-black">{isRTL ? "لا توجد تكليفات حضور لهذه الفترة" : "No attendance assignments"}</p>
          </div>
        ) : (
          <Table className="w-full border-collapse border-2 border-black" style={{ fontSize: `${reportStyles.tableSize}px` }}>
            <TableHeader>
              <TableRow className="bg-slate-100 hover:bg-slate-100 border-b-2 border-black h-12">
                <TableHead className="w-[60px] text-center font-black text-black border-e-2 border-black">{t.number}</TableHead>
                <TableHead className={cn("text-center font-black text-black border-e-2 border-black px-6", isRTL ? "text-right" : "text-left")}>{t.employeeName}</TableHead>
                <TableHead className="w-[160px] text-center font-black text-black border-e-2 border-black">{t.signature}</TableHead>
                <TableHead className="text-center font-black text-black w-[220px]">{t.notes}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignedEmployees.map((emp, idx) => (
                <TableRow key={emp?.id} className="hover:bg-transparent border-b-2 border-black h-11">
                  <TableCell className="text-center font-black border-e-2 border-black p-1 bg-slate-50/30">{idx + 1}</TableCell>
                  <TableCell className={cn("font-black border-e-2 border-black p-1 px-6 text-black", isRTL ? "text-right" : "text-left")}>
                    {emp?.lastName} {emp?.firstName}
                  </TableCell>
                  <TableCell className="border-e-2 border-black p-1"></TableCell>
                  <TableCell className="p-1"></TableCell>
                </TableRow>
              ))}
              {Array.from({ length: emptyRowsCount }).map((_, i) => (
                <TableRow key={`empty-${i}`} className="hover:bg-transparent border-b-2 border-black h-11">
                  <TableCell className="text-center border-e-2 border-black p-1 font-bold text-black bg-slate-50/10">
                    {assignedEmployees.length + i + 1}
                  </TableCell>
                  <TableCell className="border-e-2 border-black p-1"></TableCell>
                  <TableCell className="border-e-2 border-black p-1"></TableCell>
                  <TableCell className="p-1"></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Signatures Footer */}
      <div className="mt-10 grid grid-cols-2 gap-16 pt-6 border-t border-dashed border-black/30" style={{ fontSize: `${reportStyles.footerSize}px` }}>
        <div className="text-center">
          <p className="font-black text-black mb-16 underline underline-offset-4">{supervisors[0]}</p>
          <div className="border-t-2 border-black w-40 mx-auto"></div>
        </div>
        <div className="text-center">
          <p className="font-black text-black mb-16 underline underline-offset-4">{t.managerSignature}</p>
          <div className="border-t-2 border-black w-40 mx-auto"></div>
        </div>
      </div>

      {/* System Timestamp */}
      <div className="mt-8 pt-4 text-center text-[10px] text-black/40 font-bold uppercase tracking-widest border-t border-black/10">
        Generated via EduSchedule Pro v2.5 — {format(new Date(), "yyyy-MM-dd HH:mm")}
      </div>
    </div>
  );
};

export default AttendanceSheet;