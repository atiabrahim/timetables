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
import { Printer, Search, Eye, ClipboardList, BookOpen, ShieldAlert, X } from "lucide-react";
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
    assignments, 
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

  const hasLesson = (empId: string, dayIdx: number, periodPart: PeriodPart) => {
    return assignments.some(asgn => {
      if (asgn.employeeId !== empId || asgn.day !== dayIdx) return false;
      const p = parseInt(asgn.period);
      if (periodPart === "Morning") return p >= 1 && p <= 4;
      if (periodPart === "Afternoon") return p >= 5 && p <= 8;
      return false;
    });
  };

  const hasManualDuty = (empId: string, dayIdx: number, period: PeriodPart) => {
    return templateAssignments.some(a => 
      a.dayIdx === dayIdx && a.period === period && a.employeeIds.includes(empId)
    );
  };

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

  const ScheduleTable = ({ isPrint = false }: { isPrint?: boolean }) => (
    <div className={cn(
      "bg-white",
      isPrint ? "p-0 w-full" : "rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-50/50 overflow-hidden"
    )}>
      <Table className={cn(
        "border-collapse border-spacing-0", 
        isPrint ? "w-full border border-emerald-950 table-fixed" : "min-w-[800px]"
      )}>
        <TableHeader>
          <TableRow className={cn(isPrint ? "bg-emerald-50/50 border-b border-emerald-950" : "bg-emerald-50/50 hover:bg-emerald-50/50")}>
            <TableHead className={cn(
              "font-black text-emerald-900 border border-emerald-100 text-center",
              isPrint ? "text-[10px] p-2 border-emerald-950 w-[150px]" : "text-sm p-4"
            )} rowSpan={2}>
              {isRTL ? "اسم الأستاذ" : "Teacher Name"}
            </TableHead>
            {DAYS.map(day => (
              <TableHead 
                key={day.idx} 
                className={cn(
                  "text-center font-black text-emerald-700 border border-emerald-100",
                  isPrint ? "text-[10px] p-1 border-emerald-950 bg-emerald-50/30" : "text-xs p-2 bg-emerald-50/30"
                )} 
                colSpan={PERIODS.length}
              >
                {isRTL ? day.name : day.en}
              </TableHead>
            ))}
          </TableRow>
          <TableRow className={cn(isPrint ? "bg-emerald-50/20 border-b border-emerald-950" : "bg-emerald-50/20 hover:bg-emerald-50/20")}>
            {DAYS.map(day => PERIODS.map(p => (
              <TableHead key={`${day.idx}-${p}`} className={cn(
                "text-center font-bold border border-emerald-100",
                isPrint ? "text-[8px] p-1 border-emerald-950" : "text-[10px] p-2"
              )}>
                {p === "Morning" ? (isRTL ? "ص" : "M") : p === "Afternoon" ? (isRTL ? "م" : "A") : (isRTL ? "ل" : "E")}
              </TableHead>
            )))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredEmployees.map(emp => (
            <TableRow key={emp.id} className={cn("group transition-colors", isPrint ? "border-b border-emerald-950" : "hover:bg-emerald-50/30")}>
              <TableCell className={cn(
                "font-bold text-emerald-950 border border-emerald-100 bg-white",
                isPrint ? "text-[10px] p-2 border-emerald-950" : "text-xs p-4 group-hover:bg-emerald-50/30 sticky right-0 z-10 shadow-sm"
              )}>
                {emp.lastName} {emp.firstName}
              </TableCell>
              {DAYS.map(day => PERIODS.map(period => {
                const lessonPresent = hasLesson(emp.id, day.idx, period);
                const manualDutyPresent = hasManualDuty(emp.id, day.idx, period);
                const isActive = lessonPresent || manualDutyPresent;

                return (
                  <TableCell
                    key={`${emp.id}-${day.idx}-${period}`}
                    onClick={() => toggleAssignment(emp.id, day.idx, period)}
                    className={cn(
                      "text-center border border-emerald-100 p-0 transition-all relative",
                      !isPrint && isAdmin && "cursor-pointer",
                      isActive ? (isPrint ? "bg-emerald-600 text-white" : "bg-emerald-600 text-white shadow-inner") : "hover:bg-emerald-50/50",
                      isPrint ? "h-8 border-emerald-950" : "h-12 w-12"
                    )}
                  >
                    {isActive && (
                      <div className="flex flex-col items-center justify-center gap-0.5">
                        {lessonPresent ? <BookOpen size={isPrint ? 12 : 14} /> : <ShieldAlert size={isPrint ? 12 : 14} />}
                        <span className={cn("font-black uppercase tracking-tighter", isPrint ? "text-[7px]" : "text-[8px]")}>
                          {lessonPresent ? (isRTL ? "حصة" : "L") : (isRTL ? "عمل" : "W")}
                        </span>
                      </div>
                    )}
                  </TableCell>
                );
              }))}
            </TableRow>
          </TableBody>
        </Table>
      </div>
  );

  const PrintableReport = () => (
    <div id="printable-report" className="bg-white p-12 text-black w-full">
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
  );

  return (
    <div className="space-y-8 pb-20">
      {/* القسم المخفي الذي يظهر فقط عند الطباعة */}
      <div className="hidden print:block absolute inset-0 bg-white z-[9999]">
        <PrintableReport />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-3xl font-black text-emerald-950 flex items-center gap-3">
            <ClipboardList className="text-emerald-600" />
            {t.weeklyWorkSchedule}
          </h2>
          <p className="text-emerald-600/70 font-bold mt-1">
            {isRTL ? "مزامنة تلقائية مع جدول الحصص وتكليفات العمل" : "Auto-sync with timetable and work assignments"}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="flex items-center gap-4 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100 text-[10px] font-bold">
             <div className="flex items-center gap-1.5"><BookOpen size={12} className="text-emerald-600" /> {isRTL ? "حصة دراسية" : "Lesson"}</div>
             <div className="flex items-center gap-1.5"><ShieldAlert size={12} className="text-emerald-600" /> {isRTL ? "مناوبة/عمل" : "Duty"}</div>
          </div>
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

      {/* نافذة المعاينة */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[95vw] w-full max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-0 border-none bg-emerald-50/30">
          <div className="sticky top-0 bg-white border-b border-emerald-100 p-4 flex justify-between items-center z-10">
             <div className="flex items-center gap-2 font-black text-emerald-900">
                <Printer className="text-emerald-600" />
                {isRTL ? "معاينة التقرير" : "Report Preview"}
             </div>
             <Button variant="ghost" size="icon" onClick={() => setIsPreviewOpen(false)} className="rounded-full">
                <X size={20} />
             </Button>
          </div>
          <div className="p-8 flex justify-center">
            <div className="bg-white shadow-2xl border border-emerald-100 rounded-lg min-w-full lg:min-w-[1000px] overflow-x-auto">
              <PrintableReport />
            </div>
          </div>
          <DialogFooter className="bg-white p-6 border-t border-emerald-100 flex gap-3">
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)} className="rounded-xl flex-1 md:flex-none">{t.cancel}</Button>
            <Button onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl px-10 font-bold flex-1 md:flex-none">
              <Printer size={18} className="mr-2" /> {t.print}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style>
        {`
          @media print {
            /* إخفاء كل شيء في الصفحة */
            body > * { display: none !important; }
            /* إظهار فقط حاوية الطباعة الخاصة بنا */
            .print\\:block { display: block !important; position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; }
            
            @page {
              size: A4 landscape;
              margin: 1cm;
            }
            
            #printable-report { 
              visibility: visible !important; 
              -webkit-print-color-adjust: exact !important; 
              print-color-adjust: exact !important;
              width: 100% !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default WeeklyWorkSchedule;