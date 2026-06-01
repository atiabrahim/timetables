"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Printer, Search, Eye, ClipboardList, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { PeriodPart } from "../types";

const DAYS = [
  { idx: 0, name: "الأحد", en: "Sunday" },
  { idx: 1, name: "الاثنين", en: "Monday" },
  { idx: 2, name: "الثلاثاء", en: "Tuesday" },
  { idx: 3, name: "الأربعاء", en: "Wednesday" },
  { idx: 4, name: "الخميس", en: "Thursday" },
];

const PERIODS: PeriodPart[] = ["Morning", "Afternoon", "Evening"];

const WeeklyWorkSchedule = () => {
  const { 
    employees, 
    templateAssignments, 
    updateTemplateAssignment,
    isRTL,
    t,
    user
  } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const isAdmin = user?.role === "Admin";

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => 
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  const toggleAssignment = (empId: string, dayIdx: number, period: PeriodPart) => {
    if (!isAdmin) return;

    const current = templateAssignments.find(a => a.dayIdx === dayIdx && a.period === period);
    let newIds = current ? [...current.employeeIds] : [];
    
    if (newIds.includes(empId)) {
      newIds = newIds.filter(id => id !== empId);
    } else {
      newIds.push(empId);
    }
    
    updateTemplateAssignment(dayIdx, period, newIds);
  };

  const isAssigned = (empId: string, dayIdx: number, period: PeriodPart) => {
    return templateAssignments.some(a => 
      a.dayIdx === dayIdx && a.period === period && a.employeeIds.includes(empId)
    );
  };

  const ScheduleTable = ({ isPrint = false }: { isPrint?: boolean }) => (
    <div className={cn(
      "bg-white transition-all",
      isPrint ? "p-4 w-full" : "rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-50/50 overflow-hidden"
    )}>
      <Table className={cn("border-collapse", isPrint ? "w-full border-2 border-emerald-950" : "")}>
        <TableHeader>
          <TableRow className="bg-emerald-50/50 hover:bg-emerald-50/50">
            <TableHead className={cn(
              "font-black text-emerald-900 border border-emerald-100",
              isPrint ? "text-xs p-2" : "text-sm p-4"
            )} rowSpan={2}>
              {isRTL ? "اسم الأستاذ" : "Teacher Name"}
            </TableHead>
            {DAYS.map(day => (
              <TableHead 
                key={day.idx} 
                className={cn(
                  "text-center font-black text-emerald-700 border border-emerald-100 bg-emerald-50/30",
                  isPrint ? "text-[10px] p-1" : "text-xs p-2"
                )} 
                colSpan={PERIODS.length}
              >
                {isRTL ? day.name : day.en}
              </TableHead>
            ))}
          </TableRow>
          <TableRow className="bg-emerald-50/20 hover:bg-emerald-50/20">
            {DAYS.map(day => PERIODS.map(p => (
              <TableHead key={`${day.idx}-${p}`} className={cn(
                "text-center font-bold border border-emerald-100",
                isPrint ? "text-[8px] p-0.5" : "text-[10px] p-2"
              )}>
                {p === "Morning" ? (isRTL ? "ص" : "M") : p === "Afternoon" ? (isRTL ? "م" : "A") : (isRTL ? "ل" : "E")}
              </TableHead>
            )))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredEmployees.map(emp => (
            <TableRow key={emp.id} className="hover:bg-emerald-50/30 group transition-colors">
              <TableCell className={cn(
                "font-bold text-emerald-950 border border-emerald-100 bg-white group-hover:bg-emerald-50/30",
                isPrint ? "text-[10px] p-1" : "text-xs p-4"
              )}>
                {emp.lastName} {emp.firstName}
              </TableCell>
              {DAYS.map(day => PERIODS.map(period => {
                const assigned = isAssigned(emp.id, day.idx, period);
                return (
                  <TableCell
                    key={`${emp.id}-${day.idx}-${period}`}
                    onClick={() => toggleAssignment(emp.id, day.idx, period)}
                    className={cn(
                      "text-center border border-emerald-100 p-0 transition-all",
                      !isPrint && isAdmin && "cursor-pointer",
                      assigned ? (isPrint ? "bg-emerald-950 text-white" : "bg-emerald-600 text-white shadow-inner") : "hover:bg-emerald-50/50",
                      isPrint ? "h-6 w-6" : "h-12 w-12"
                    )}
                  >
                    {assigned && (
                      <div className="flex items-center justify-center animate-in fade-in zoom-in duration-200">
                        {isPrint ? <span className="font-black">X</span> : <Check size={18} strokeWidth={3} />}
                      </div>
                    )}
                  </TableCell>
                );
              }))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-3xl font-black text-emerald-950 flex items-center gap-3">
            <ClipboardList className="text-emerald-600" />
            {t.weeklyWorkSchedule}
          </h2>
          <p className="text-emerald-600/70 font-bold mt-1">
            {isRTL ? "توزيع مناوبات ومهام الأساتذة خلال الأسبوع" : "Manage teacher weekly shifts and duties"}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className={cn("absolute top-1/2 -translate-y-1/2 text-gray-400", isRTL ? "right-3" : "left-3")} size={16} />
            <Input 
              placeholder={t.search} 
              className={cn("rounded-2xl border-emerald-100 bg-white h-11", isRTL ? "pr-10" : "pl-10")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="rounded-2xl border-emerald-200 text-emerald-700 gap-2 font-bold px-6 h-11" onClick={() => setIsPreviewOpen(true)}>
            <Eye size={18} /> {t.preview}
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 rounded-2xl gap-2 font-bold px-8 h-11 shadow-lg shadow-emerald-100" onClick={() => window.print()}>
            <Printer size={18} /> {t.print}
          </Button>
        </div>
      </div>

      <ScheduleTable />

      {/* Print Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[95vw] w-full max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-0 border-none bg-emerald-50/30">
          <DialogHeader className="bg-white p-6 border-b border-emerald-100 sticky top-0 z-10">
            <DialogTitle className="flex items-center gap-3 text-emerald-900 font-black">
              <Printer className="text-emerald-600" />
              {isRTL ? "معاينة جدول العمل" : "Work Schedule Preview"}
            </DialogTitle>
          </DialogHeader>
          <div className="p-8 flex justify-center">
            <div className="bg-white shadow-2xl p-12 border border-emerald-100 rounded-lg min-w-full lg:min-w-[1000px] overflow-x-auto">
              <div className="text-center mb-8 border-b-2 border-emerald-900 pb-6">
                <h1 className="text-2xl font-black text-emerald-900 mb-2 uppercase">{t.weeklyWorkSchedule}</h1>
                <p className="text-emerald-700 font-bold">{isRTL ? "للفترة الدراسية الحالية" : "For Current Academic Period"}</p>
              </div>
              <ScheduleTable isPrint={true} />
              <div className="mt-12 grid grid-cols-3 gap-8 text-center font-black text-emerald-900 text-xs">
                <div><p className="mb-12">{isRTL ? "توقيع الأستاذ" : "Teacher Signature"}</p><div className="border-t border-black w-32 mx-auto"></div></div>
                <div><p className="mb-12">{isRTL ? "المسؤول المباشر" : "Direct Supervisor"}</p><div className="border-t border-black w-32 mx-auto"></div></div>
                <div><p className="mb-12">{isRTL ? "ختم المؤسسة" : "Institution Stamp"}</p><div className="border-t border-black w-32 mx-auto"></div></div>
              </div>
            </div>
          </div>
          <DialogFooter className="bg-white p-6 border-t border-emerald-100">
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)} className="rounded-xl">{t.cancel}</Button>
            <Button onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl px-10 font-bold">
              <Printer size={18} className="mr-2" /> {t.print}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            #printable-area, #printable-area * { visibility: visible; }
            #printable-area { position: absolute; left: 0; top: 0; width: 100%; }
            .print\\:hidden { display: none !important; }
          }
        `}
      </style>
    </div>
  );
};

export default WeeklyWorkSchedule;