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
  const maxRows = 18;
  const emptyRowsCount = Math.max(0, maxRows - assignedEmployees.length);

  return (
    <div 
      className={cn(
        "bg-white py-6 px-[12mm] mb-6 mx-auto shadow-md border border-slate-100 rounded-2xl page-break-container w-full max-w-[210mm]",
        "print:shadow-none print:border-none print:pt-[5mm] print:pb-0 print:px-[10mm] print:my-0 print:mx-auto print:rounded-none print:w-full"
      )}
      dir={isRTL ? "rtl" : "ltr"}
      style={{ fontFamily: reportStyles.fontFamily }}
    >
      <div className="flex flex-col items-center text-center mb-4 space-y-0.5">
        <p className="font-black text-black text-xs tracking-widest uppercase">{t.republic}</p>
        <div className="w-12 h-px bg-black/20 my-0.5"></div>
        <p className="font-bold text-black text-[10px]">{t.centerName}</p>
        <p className="font-bold text-black text-[10px]">{t.centerLocation}</p>
      </div>

      <div className="grid grid-cols-2 border-y-2 border-black py-1.5 mb-4 text-[10px] font-black">
        <div className="flex items-center gap-2">
          <span className="text-black/60">{isRTL ? "المصلحة:" : "Department:"}</span>
          <span className="text-black">{selectedDepartment}</span>
        </div>
        <div className={cn("flex items-center gap-2", isRTL ? "justify-end" : "justify-start")}>
          <span className="text-black/60">{isRTL ? "السنة التكوينية:" : "Training Year:"}</span>
          <span className="text-black">2023 / 2024</span>
        </div>
      </div>

      <div className="text-center mb-4">
        <div className="inline-block relative">
          <h1 className="font-black text-black text-base px-10 py-2 border-2 border-black relative z-10 bg-white">
            {t.attendanceSheet}
          </h1>
          <div className="absolute -bottom-1.5 -right-1.5 w-full h-full bg-black -z-0"></div>
        </div>
        
        <div className="mt-4 flex justify-center items-center gap-8">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-black/40" />
            <p className="text-black font-black text-sm underline decoration-dotted underline-offset-4">
              {format(date, "EEEE, d MMMM yyyy", { locale: currentLocale })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-black/40" />
            <p className="font-black text-black text-sm underline decoration-dotted underline-offset-4">
              {period === "Morning" ? t.morning : period === "Afternoon" ? t.afternoon : t.evening}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 w-full overflow-hidden">
        <Table className="w-full border-collapse border-2 border-black">
          <TableHeader>
            <TableRow className="bg-slate-100/50 hover:bg-slate-100/50 border-b-2 border-black h-8">
              <TableHead className="w-[50px] text-center font-black text-black border-e-2 border-black p-0.5 text-[10px]">
                <div className="flex items-center justify-center gap-0.5"><Hash size={10}/>{t.number}</div>
              </TableHead>
              <TableHead className={cn("font-black text-black border-e-2 border-black px-3 p-0.5 text-[10px] w-[280px] whitespace-nowrap", isRTL ? "text-right" : "text-left")}>
                <div className="flex items-center gap-1.5"><User size={12}/>{t.employeeName}</div>
              </TableHead>
              <TableHead className="w-[140px] text-center font-black text-black border-e-2 border-black p-0.5 text-[10px]">
                <div className="flex items-center justify-center gap-1.5"><PenTool size={12}/>{t.signature}</div>
              </TableHead>
              <TableHead className="text-center font-black text-black p-0.5 text-[10px]">
                <div className="flex items-center justify-center gap-1.5"><FileText size={12}/>{t.notes}</div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignedEmployees.map((emp, idx) => (
              <TableRow key={emp?.id} className="hover:bg-transparent border-b border-black h-9">
                <TableCell className="text-center font-black border-e border-black p-1 text-[10px] bg-slate-50">{idx + 1}</TableCell>
                <TableCell className={cn("font-black border-e border-black px-3 p-1 text-[11px] text-black whitespace-nowrap", isRTL ? "text-right" : "text-left")}>
                  {emp?.lastName} {emp?.firstName}
                </TableCell>
                <TableCell className="border-e border-black p-1"></TableCell>
                <TableCell className="p-1"></TableCell>
              </TableRow>
            ))}
            {Array.from({ length: emptyRowsCount }).map((_, i) => (
              <TableRow key={`empty-${i}`} className="hover:bg-transparent border-b border-black h-9">
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

      <div className="mt-8 grid grid-cols-2 gap-12 pt-6 border-t-2 border-black">
        <div className="text-center space-y-1">
          <p className="font-black text-black text-xs uppercase tracking-wider">{supervisors[0] || (isRTL ? "رئيس المصلحة" : "Head of Dept")}</p>
          <div className="h-16 border border-dashed border-black/20 mt-2 rounded-xl bg-slate-50/10"></div>
        </div>
        <div className="text-center space-y-1">
          <p className="font-black text-black text-xs uppercase tracking-wider">{t.managerSignature}</p>
          <div className="h-16 border border-dashed border-black/20 mt-2 rounded-xl bg-slate-50/10"></div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceSheet;