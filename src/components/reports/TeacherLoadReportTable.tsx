"use client";

import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface TeacherLoadReportTableProps {
  isRTL: boolean;
  employees: any[];
  assignments: any[];
  subjects: any[];
  classes: any[];
  t: any;
  reportStyles: any;
}

const TeacherLoadReportTable = ({
  isRTL,
  employees,
  assignments,
  subjects,
  classes,
  t,
  reportStyles
}: TeacherLoadReportTableProps) => {
  const getTeacherLoad = (empId: string) => {
    const teacherAsgns = assignments.filter(a => a.employeeId === empId);
    
    // Group by subject and class
    const breakdown: Record<string, { subject: string, className: string, count: number }> = {};
    
    teacherAsgns.forEach(asgn => {
      const subName = subjects.find(s => s.id === asgn.subjectId)?.name || "---";
      const clsName = classes.find(c => c.id === asgn.classId)?.name || "---";
      const key = `${asgn.subjectId}-${asgn.classId}`;
      
      if (!breakdown[key]) {
        breakdown[key] = { subject: subName, className: clsName, count: 0 };
      }
      breakdown[key].count++;
    });

    return {
      items: Object.values(breakdown),
      total: teacherAsgns.length
    };
  };

  const cellStyle = {
    fontSize: `${reportStyles.tableSize}px`,
    fontFamily: reportStyles.fontFamily,
    paddingTop: `${reportStyles.rowPadding}px`,
    paddingBottom: `${reportStyles.rowPadding}px`,
  };

  const headerStyle = {
    fontSize: `${reportStyles.headerSize}px`,
    fontFamily: reportStyles.fontFamily,
  };

  return (
    <div className="w-full">
      <Table className="border-4 border-black w-full table-fixed">
        <TableHeader>
          <TableRow className="bg-slate-100 hover:bg-slate-100 border-b-4 border-black">
            <TableHead style={headerStyle} className={cn("font-black text-black border-e-4 border-black p-2 w-[25%]", isRTL ? "text-right" : "text-left")}>
              {isRTL ? "اسم الأستاذ" : "Teacher Name"}
            </TableHead>
            <TableHead style={headerStyle} className={cn("font-black text-black border-e-4 border-black p-2 w-[35%]", isRTL ? "text-right" : "text-left")}>
              {isRTL ? "المادة المسندة" : "Assigned Subject"}
            </TableHead>
            <TableHead style={headerStyle} className={cn("font-black text-black border-e-4 border-black p-2 w-[25%]", isRTL ? "text-right" : "text-left")}>
              {isRTL ? "الفوج / الفرع" : "Class / Branch"}
            </TableHead>
            <TableHead style={headerStyle} className="text-center font-black text-white bg-black p-2 w-[15%]">
              {isRTL ? "الساعات" : "Hrs"}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((emp) => {
            const load = getTeacherLoad(emp.id);
            if (load.total === 0) return null;

            return load.items.map((item, idx) => (
              <TableRow key={`${emp.id}-${idx}`} className="border-b-2 border-black hover:bg-transparent">
                {idx === 0 && (
                  <TableCell 
                    rowSpan={load.items.length} 
                    style={cellStyle} 
                    className={cn("font-black border-e-4 border-black bg-slate-50/50 align-top", isRTL ? "text-right" : "text-left")}
                  >
                    <div className="space-y-1">
                      <p className="leading-tight">{emp.lastName} {emp.firstName}</p>
                      <p className="text-[9px] opacity-60 uppercase font-bold tracking-tighter">Total: {load.total} hrs/week</p>
                    </div>
                  </TableCell>
                )}
                <TableCell style={cellStyle} className={cn("font-bold border-e-2 border-black", isRTL ? "text-right" : "text-left")}>
                  {item.subject}
                </TableCell>
                <TableCell style={cellStyle} className={cn("font-medium border-e-2 border-black", isRTL ? "text-right" : "text-left")}>
                  {item.className}
                </TableCell>
                <TableCell style={cellStyle} className="text-center font-black bg-slate-50/20">
                  {item.count}
                </TableCell>
              </TableRow>
            ));
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default TeacherLoadReportTable;