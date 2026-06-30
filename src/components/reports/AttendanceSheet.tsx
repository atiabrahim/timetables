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
  const maxRows = doubleMode ? 12 : 20;
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
        <span>{selectedDepartment}</span>
      </div>
      <div className="flex items-center gap-2">
        <Calendar size={12} className="opacity-40" />
        <span>{format(date, "EEEE, d MMMM yyyy", { locale: currentLocale })}</span>
      </div>
      <div className="flex items-center gap-2">
        <Clock size={12} className="opacity-40" />
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
    >
      <div className="flex-1 w-full overflow-hidden">
        <Table className="w-full border-collapse border-2 border-black">
          <TableHeader>
            <TableRow className="bg-slate-100/50 hover:bg-slate-100/50 border-b-2 border-black h-8">
              <TableHead className="w-[40px] text-center font-black text-black border-e-2 border-black p-0.5 text-[10px]">#</TableHead>
              <TableHead className={cn("font-black text-black border-e-2 border-black px-3 p-0.5 text-[10px]", isRTL ? "text-right" : "text-left")}>{t.employeeName}</TableHead>
              <TableHead className="w-[120px] text-center font-black text-black border-e-2 border-black p-0.5 text-[10px]">{t.signature}</TableHead>
              <TableHead className="text-center font-black text-black p-0.5 text-[10px] w-[140px]">{t.notes}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignedEmployees.map((emp, idx) => (
              <TableRow key={emp?.id} className="hover:bg-transparent border-b border-black">
                <TableCell style={cellStyle} className="text-center font-black border-e border-black text-[10px] bg-slate-50">{idx + 1}</TableCell>
                <TableCell style={cellStyle} className={cn("font-black border-e border-black px-3 text-black whitespace-nowrap", isRTL ? "text-right" : "text-left")}>
                  {emp?.lastName} {emp?.firstName}
                </TableCell>
                <TableCell style={cellStyle} className="border-e border-black"></TableCell>
                <TableCell style={cellStyle}></TableCell>
              </TableRow>
            ))}
            {Array.from({ length: emptyRowsCount }).map((_, i) => (
              <TableRow key={`empty-${i}`} className="hover:bg-transparent border-b border-black">
                <TableCell style={cellStyle} className="text-center border-e border-black text-[10px] font-bold text-black bg-slate-50/20">{assignedEmployees.length + i + 1}</TableCell>
                <TableCell style={cellStyle} className="border-e border-black"></TableCell>
                <TableCell style={cellStyle} className="border-e border-black"></TableCell>
                <TableCell style={cellStyle}></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </OfficialPrintWrapper>
  );
};

export default AttendanceSheet;