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
        "print:shadow-none print:border print:border-slate-300 print:rounded-[2rem] print:p-10 print:mx-auto print:my-4"
      )}
      dir={isRTL ? "rtl" : "ltr"}
      style={{ fontFamily: reportStyles.fontFamily }}
    >
      <div className="flex flex-col items-center text-center mb-6 space-y-1" style={{ fontSize: `${reportStyles.headerSize}px` }}>
        <p className="font-black text-slate-900 tracking-tight">{t.republic}</p>
        <p className="font-bold text-slate-800">{t.centerName}</p>
        <p className="font-bold text-slate-700">{t.centerLocation}</p>
      </div>

      <div className={cn("mb-6 flex justify-between items-center border-b-2 border-slate-900 pb-3", isRTL ? "flex-row" : "flex-row-reverse")} style={{ fontSize: `${reportStyles.headerSize}px` }}>
        <p className="font-black text-slate-950">
          {t.department}: <span className="font-bold text-emerald-800">{departments[0] || "مصلحة التكوين"}</span>
        </p>
        <p className="font-black text-slate-950">
          {isRTL ? "السنة الدراسية:" : "Academic Year:"}: <span className="font-bold text-emerald-800">2023/2024</span>
        </p>
      </div>

      <div className="text-center mb-8">
        <h1 className="font-black text-slate-900 mb-4 underline underline-offset-8 decoration-2" style={{ fontSize: `${reportStyles.titleSize}px` }}>
          {t.attendanceSheet}
        </h1>
        <div className="flex justify-center items-center gap-6 bg-emerald-50/50 py-3 px-8 rounded-2xl inline-flex mx-auto border border-emerald-100 shadow-sm">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-emerald-600" />
            <p className="text-slate-900 font-black" style={{ fontSize: `${reportStyles.headerSize + 2}px` }}>
              {format(date, "EEEE, d MMMM yyyy", { locale: currentLocale })}
            </p>
          </div>
          <span className="text-emerald-200 h-6 w-px bg-emerald-200"></span>
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-emerald-600" />
            <p className="font-black text-emerald-800" style={{ fontSize: `${reportStyles.headerSize + 2}px` }}>
              {period === "Morning" ? t.morning : period === "Afternoon" ? t.afternoon : t.evening}
              <span className="mx-2 opacity-50 text-[10px]">{getPeriodRangeHint(period)}</span>
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-visible">
        {isEmpty ? (
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 print:border-slate-950 print:bg-white">
             <p className="font-bold text-slate-400 print:text-slate-950">{isRTL ? "لا توجد تكليفات حضور لهذه الفترة" : "No attendance assignments"}</p>
          </div>
        ) : (
          <Table className="w-full border-collapse border-2 border-slate-950" style={{ fontSize: `${reportStyles.tableSize}px` }}>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50 border-b-2 border-slate-950 h-12">
                <TableHead className="w-[60px] text-center font-black text-slate-950 border-e-2 border-slate-950">{t.number}</TableHead>
                <TableHead className={cn("text-center font-black text-slate-950 border-e-2 border-slate-950 px-6", isRTL ? "text-right" : "text-left")}>{t.employeeName}</TableHead>
                <TableHead className="w-[160px] text-center font-black text-slate-950 border-e-2 border-slate-950">{t.signature}</TableHead>
                <TableHead className="text-center font-black text-slate-950 w-[220px]">{t.notes}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignedEmployees.map((emp, idx) => (
                <TableRow key={emp?.id} className="hover:bg-transparent border-b-2 border-slate-950 h-11">
                  <TableCell className="text-center font-black border-e-2 border-slate-950 p-1 bg-slate-50/30">{idx + 1}</TableCell>
                  <TableCell className={cn("font-black border-e-2 border-slate-950 p-1 px-6 text-slate-900", isRTL ? "text-right" : "text-left")}>
                    {emp?.lastName} {emp?.firstName}
                  </TableCell>
                  <TableCell className="border-e-2 border-slate-950 p-1"></TableCell>
                  <TableCell className="p-1"></TableCell>
                </TableRow>
              ))}
              {Array.from({ length: emptyRowsCount }).map((_, i) => (
                <TableRow key={`empty-${i}`} className="hover:bg-transparent border-b-2 border-slate-950 h-11">
                  <TableCell className="text-center border-e-2 border-slate-950 p-1 font-bold text-slate-400 bg-slate-50/10">
                    {assignedEmployees.length + i + 1}
                  </TableCell>
                  <TableCell className="border-e-2 border-slate-950 p-1"></TableCell>
                  <TableCell className="border-e-2 border-slate-950 p-1"></TableCell>
                  <TableCell className="p-1"></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="mt-10 grid grid-cols-2 gap-16 pt-6 border-t border-dashed border-slate-300" style={{ fontSize: `${reportStyles.footerSize}px` }}>
        <div className="text-center">
          <p className="font-black text-slate-950 mb-16 underline underline-offset-4">{supervisors[0]}</p>
          <div className="border-t-2 border-slate-900 w-40 mx-auto"></div>
        </div>
        <div className="text-center">
          <p className="font-black text-slate-950 mb-16 underline underline-offset-4">{t.managerSignature}</p>
          <div className="border-t-2 border-slate-900 w-40 mx-auto"></div>
        </div>
      </div>

      <div className="mt-8 pt-4 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest border-t border-slate-50">
        Generated via EduSchedule Pro v2.5 — {format(new Date(), "yyyy-MM-dd HH:mm")}
      </div>
    </div>
  );
};

export default AttendanceSheet;