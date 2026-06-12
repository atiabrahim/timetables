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
  doubleMode?: boolean;
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
  doubleMode = false,
  supervisors
}: AttendanceSheetProps) => {
  const maxRows = doubleMode ? 14 : 20;
  const emptyRowsCount = Math.max(0, maxRows - assignedEmployees.length);
  const isLandscape = reportStyles.orientation === "landscape";

  return (
    <div
      className={cn(
        "bg-white mb-6 mx-auto shadow-md border border-slate-100 rounded-2xl page-break-container w-full max-w-[210mm]",
        doubleMode ? "py-2 px-[8mm]" : "py-6 px-[12mm]",
        "print:shadow-none print:border-none print:my-0 print:mx-auto print:rounded-none print:w-full",
        doubleMode
          ? (isLandscape ? "print:h-[105mm]" : "print:h-[148.5mm]") + " print:pt-[2mm] print:pb-0 print:px-[4mm]"
          : "print:pt-[4mm] print:pb-0 print:px-[4mm] print:min-h-[296mm] page-break-always"
      )}
      dir={isRTL ? "rtl" : "ltr"}
      style={{ fontFamily: reportStyles.fontFamily }}
    >
      <div className={cn("flex flex-col items-center text-center space-y-0.5", doubleMode ? "mb-2" : "mb-4")}>
        <p className={cn("font-black text-black tracking-widest uppercase", doubleMode ? "text-[10px]" : "text-xs")}>
          {t.republic}
        </p>
        <div className="w-12 h-px bg-black/20 my-0.5"></div>
        <p className="font-bold text-black text-[9px]">{t.centerName}</p>
      </div>

      <div className={cn("grid grid-cols-2 border-y-2 border-black py-1 font-black", doubleMode ? "mb-2 text-[9px]" : "mb-4 text-[10px]")}>
        <div className="flex items-center gap-2">
          <span className="text-black/60">{isRTL ? "المصلحة:" : "Department:"}</span>
          <span className="text-black">{selectedDepartment}</span>
        </div>
        <div className={cn("flex items-center gap-2", isRTL ? "justify-end" : "justify-start")}>
          <span className="text-black/60">{isRTL ? "السنة التكوينية:" : "Training Year:"}</span>
          <span className="text-black">2023 / 2024</span>
        </div>
      </div>

      <div className={cn(doubleMode ? "mb-2" : "mb-4", "text-center")}>
        <div className="inline-block relative">
          <h1 className={cn("font-black text-black border-2 border-black relative z-10 bg-white", doubleMode ? "text-sm px-6 py-1" : "text-base px-10 py-2")}>
            {t.attendanceSheet}
          </h1>
          <div className="absolute -bottom-1.5 -right-1.5 w-full h-full bg-black -z-0"></div>
        </div>

        <div className={cn("flex justify-center items-center gap-8", doubleMode ? "mt-2" : "mt-4")}>
          <div className="flex items-center gap-2">
            <Calendar size={doubleMode ? 14 : 18} className="text-black/40" />
            <p className={cn("text-black font-black underline decoration-dotted underline-offset-4", doubleMode ? "text-xs" : "text-sm")}>
              {format(date, "EEEE, d MMMM yyyy", { locale: currentLocale })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={doubleMode ? 14 : 18} className="text-black/40" />
            <p className={cn("font-black text-black underline decoration-dotted underline-offset-4", doubleMode ? "text-xs" : "text-sm")}>
              {period === "Morning" ? t.morning : period === "Afternoon" ? t.afternoon : t.evening}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full overflow-hidden">
        <Table className="w-full border-collapse border-2 border-black">
          <TableHeader>
            <TableRow className={cn("bg-slate-100/50 hover:bg-slate-100/50 border-b-2 border-black", doubleMode ? "h-5" : "h-6")}>
              <TableHead className="w-[36px] text-center font-black text-black border-e-2 border-black p-0.5 text-[9px]">
                <div className="flex items-center justify-center gap-0.5">
                  <Hash size={9} />
                  {t.number}
                </div>
              </TableHead>

              <TableHead className={cn("font-black text-black border-e-2 border-black px-3 p-0.5 text-[9px] w-[180px] whitespace-nowrap", isRTL ? "text-right" : "text-left")}>
                <div className="flex items-center justify-center gap-1.5">
                  <User size={10} />
                  {t.employeeName}
                </div>
              </TableHead>

              <TableHead className="w-[110px] text-center font-black text-black border-e-2 border-black p-0.5 text-[9px]">
                <div className="flex items-center justify-center gap-1.5">
                  <PenTool size={13} className="text-black/40" />
                  {t.signature}
                </div>
              </TableHead>

              <TableHead className="text-center font-black text-black p-0.5 text-[9px] w-[140px]">
                <div className="flex items-center justify-center gap-1.5">
                  <FileText size={10} />
                  {t.notes}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {assignedEmployees.map((emp, idx) => (
              <TableRow key={emp?.id} className={cn("hover:bg-transparent border-b border-black", doubleMode ? "h-5" : "h-7")}>
                <TableCell className="text-center font-black border-e border-black p-1 text-[9px] bg-slate-50">
                  {idx + 1}
                </TableCell>

                <TableCell className={cn("font-black border-e border-black px-3 p-1 text-black whitespace-nowrap", isRTL ? "text-right" : "text-left", doubleMode ? "text-[10px]" : "text-[11px]")}>
                  {emp?.lastName} {emp?.firstName}
                </TableCell>

                <TableCell className="border-e border-black p-1"></TableCell>
                <TableCell className="p-1"></TableCell>
              </TableRow>
            ))}

            {Array.from({ length: emptyRowsCount }).map((_, i) => (
              <TableRow key={`empty-${i}`} className={cn("hover:bg-transparent border-b border-black", doubleMode ? "h-5" : "h-7")}>
                <TableCell className="text-center border-e border-black p-1 text-[9px] font-bold text-black bg-slate-50/20">
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

      <div className={cn("grid grid-cols-2 gap-12 pt-4 border-t-2 border-black", doubleMode ? "mt-4" : "mt-8")}>
        <div className="text-center space-y-1">
          <p className="font-black text-black text-[10px] uppercase tracking-wider">
            {supervisors[0] || (isRTL ? "رئيس المصلحة" : "Head of Dept")}
          </p>
          <div className={cn("border border-dashed border-black/20 mt-1 rounded-xl bg-slate-50/10", doubleMode ? "h-12" : "h-16")}></div>
        </div>

        <div className="text-center space-y-1">
          <p className="font-black text-black text-[10px] uppercase tracking-wider">{t.managerSignature}</p>
          <div className={cn("border border-dashed border-black/20 mt-1 rounded-xl bg-slate-50/10", doubleMode ? "h-12" : "h-16")}></div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceSheet;