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
import OfficialPrintWrapper from "../shared/OfficialPrintWrapper";

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
  const dayIdx = getDay(date);

  const getSubjectName = (id: string) => ""; // Placeholder if needed

  // عدد الأسطر الأقصى لملء الصفحة بشكل متناسق
  const maxRows = doubleMode ? 10 : 18; 
  const emptyRowsCount = Math.max(0, maxRows - assignedEmployees.length);

  // تنسيق الخلايا العادية (محتوى الجدول)
  const cellStyle = {
    fontSize: `${reportStyles.tableSize}px`,
    fontFamily: reportStyles.fontFamily,
    paddingTop: `${reportStyles.rowPadding + 2}px`,
    paddingBottom: `${reportStyles.rowPadding + 2}px`,
  };

  // تنسيق عناوين الأعمدة
  const headerCellStyle = {
    fontSize: `${reportStyles.headerSize}px`,
    fontFamily: reportStyles.fontFamily,
  };

  const metadata = (
    <>
      <div className="flex items-center gap-2">
        <span className="opacity-70">{isRTL ? "المصلحة:" : "Department:"}</span>
        <span className="font-black">{selectedDepartment}</span>
      </div>
      <div className="flex items-center gap-2">
        <Calendar size={11} className="opacity-50" />
        <span className="font-black">{format(date, "EEEE, d MMMM yyyy", { locale: currentLocale })}</span>
      </div>
      <div className="flex items-center gap-2">
        <Clock size={11} className="opacity-50" />
        <span className="font-black">{period === "Morning" ? t.morning : period === "Afternoon" ? t.afternoon : t.evening}</span>
      </div>
    </>
  );

  return (
    <OfficialPrintWrapper
      title={t.attendanceSheet}
      metadata={metadata}
      orientation={reportStyles.orientation}
      doubleMode={doubleMode}
      showSignatures={true}
      rightSignatureTitle={isRTL ? "رئيس المصلحة" : "Head of Dept"}
      leftSignatureTitle={isRTL ? "المدير" : "Director"}
      fontFamily={reportStyles.fontFamily}
      headerSize={reportStyles.headerSize}
      titleSize={reportStyles.titleSize}
      footerSize={reportStyles.footerSize}
    >
      <div className="w-full">
        <Table className="w-full border-collapse border border-black">
          <TableHeader>
            <TableRow className="bg-slate-100/80 hover:bg-slate-100/80 border-b border-black h-10">
              <TableHead style={headerCellStyle} className="w-[50px] text-center font-black text-black border-e border-black p-1">
                {t.number}
              </TableHead>
              <TableHead style={headerCellStyle} className={cn("font-black text-black border-e border-black p-1", isRTL ? "text-right pr-4" : "text-left pl-4")}>
                {t.employeeName}
              </TableHead>
              <TableHead style={headerCellStyle} className="w-[120px] text-center font-black text-black border-e border-black p-1">
                {t.signature}
              </TableHead>
              <TableHead style={headerCellStyle} className="text-center font-black text-black p-1 w-[140px]">
                {t.notes}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignedEmployees.map((emp, idx) => (
              <TableRow key={emp?.id} className="hover:bg-transparent border-b border-black h-10">
                <TableCell style={cellStyle} className="text-center font-black border-e border-black bg-slate-50/30 p-1">
                  {idx + 1}
                </TableCell>
                <TableCell style={cellStyle} className={cn("font-black border-e border-black text-black whitespace-nowrap overflow-hidden p-1", isRTL ? "text-right pr-4" : "text-left pl-4")}>
                  {emp?.lastName} {emp?.firstName}
                </TableCell>
                <TableCell style={cellStyle} className="border-e border-black p-1"></TableCell>
                <TableCell style={cellStyle} className="p-1"></TableCell>
              </TableRow>
            ))}
            {Array.from({ length: emptyRowsCount }).map((_, i) => (
              <TableRow key={`empty-${i}`} className="hover:bg-transparent border-b border-black h-10">
                <TableCell style={cellStyle} className="text-center border-e border-black font-bold text-slate-400 bg-slate-50/10 p-1">
                  {assignedEmployees.length + i + 1}
                </TableCell>
                <TableCell style={cellStyle} className="border-e border-black p-1"></TableCell>
                <TableCell style={cellStyle} className="border-e border-black p-1"></TableCell>
                <TableCell style={cellStyle} className="p-1"></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </OfficialPrintWrapper>
  );
};

// Helper function to get day index
function getDay(date: Date) {
  return date.getDay();
}

export default AttendanceSheet;