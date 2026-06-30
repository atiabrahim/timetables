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
  // Adjusted max rows to compensate for increased height (h-9)
  const maxRows = doubleMode ? 8 : 15; 
  const emptyRowsCount = Math.max(0, maxRows - assignedEmployees.length);

  const cellStyle = {
    fontSize: `${reportStyles.tableSize}px`,
    paddingTop: `${reportStyles.rowPadding}px`,
    paddingBottom: `${reportStyles.rowPadding}px`,
  };

  const metadata = (
    <>
      <div className="flex items-center gap-2">
        <span className="opacity-60">{isRTL ? "المصلحة:" : "Department:"}</span>
        <span className="truncate max-w-[150px]">{selectedDepartment}</span>
      </div>
      <div className="flex items-center gap-2">
        <Calendar size={11} className="opacity-40" />
        <span>{format(date, "EEEE, d MMMM yyyy", { locale: currentLocale })}</span>
      </div>
      <div className="flex items-center gap-2">
        <Clock size={11} className="opacity-40" />
        <span>{period === "Morning" ? t.morning : period === "Afternoon" ? t.afternoon : t.evening}</span>
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
      // تمرير إعدادات الخطوط المخصصة لتطبيقها على الترويسة وسطر المصلحة والتوقيعات
      fontFamily={reportStyles.fontFamily}
      headerSize={reportStyles.headerSize}
      titleSize={reportStyles.titleSize}
      footerSize={reportStyles.footerSize}
    >
      <div className="w-full">
        <Table className="w-full border-collapse border-2 border-black">
          <TableHeader>
            <TableRow className="bg-slate-100/50 hover:bg-slate-100/50 border-b-2 border-black h-9">
              <TableHead className="w-[30px] text-center font-black text-black border-e-2 border-black p-0.5 text-[9px]">#</TableHead>
              <TableHead className={cn("font-black text-black border-e-2 border-black px-2 p-0.5 text-[9px] w-[176px]", isRTL ? "text-right" : "text-left")}>{t.employeeName}</TableHead>
              <TableHead className="w-[100px] text-center font-black text-black border-e-2 border-black p-0.5 text-[9px]">{t.signature}</TableHead>
              <TableHead className="text-center font-black text-black p-0.5 text-[9px] w-[120px]">{t.notes}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignedEmployees.map((emp, idx) => (
              <TableRow key={emp?.id} className="hover:bg-transparent border-b border-black h-9">
                <TableCell style={cellStyle} className="text-center font-black border-e border-black text-[9px] bg-slate-50/50 p-0.5">{idx + 1}</TableCell>
                <TableCell style={cellStyle} className={cn("font-black border-e border-black px-2 text-black whitespace-nowrap overflow-hidden p-0.5", isRTL ? "text-right" : "text-left")}>
                  {emp?.lastName} {emp?.firstName}
                </TableCell>
                <TableCell style={cellStyle} className="border-e border-black p-0.5"></TableCell>
                <TableCell style={cellStyle} className="p-0.5"></TableCell>
              </TableRow>
            ))}
            {Array.from({ length: emptyRowsCount }).map((_, i) => (
              <TableRow key={`empty-${i}`} className="hover:bg-transparent border-b border-black h-9">
                <TableCell style={cellStyle} className="text-center border-e border-black text-[9px] font-bold text-black bg-slate-50/10 p-0.5">{assignedEmployees.length + i + 1}</TableCell>
                <TableCell style={cellStyle} className="border-e border-black p-0.5"></TableCell>
                <TableCell style={cellStyle} className="border-e border-black p-0.5"></TableCell>
                <TableCell style={cellStyle} className="p-0.5"></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </OfficialPrintWrapper>
  );
};

export default AttendanceSheet;