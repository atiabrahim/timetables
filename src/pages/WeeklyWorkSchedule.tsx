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
import { Printer, Search, Eye, ClipboardList, BookOpen, ShieldAlert, RotateCw, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { PeriodPart } from "../types";
import PageHeader from "../components/shared/PageHeader";
import { DAYS } from "../constants/schedule";
import OfficialPrintWrapper from "../components/shared/OfficialPrintWrapper";

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
  const [orientation, setOrientation] = useState<"landscape" | "portrait">("landscape");

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
      if (periodPart === "Afternoon") return p >= 5 && p <= 7;
      if (periodPart === "Evening") return p >= 8 && p <= 10;
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
        isPrint ? "w-full border-2 border-emerald-950 table-fixed" : "min-w-[800px]"
      )}>
        {isPrint && (
          <colgroup>
            <col className="w-[16%]" />
            {Array.from({ length: 15 }).map((_, i) => (
              <col key={i} className="w-[5.6%]" />
            ))}
          </colgroup>
        )}
        <TableHeader>
          <TableRow className={cn(isPrint ? "bg-emerald-50/50 border-b-2 border-emerald-950" : "bg-emerald-50/50 hover:bg-emerald-50/50")}>
            <TableHead className={cn(
              "font-black text-emerald-900 border text-center",
              isPrint ? "text-[9px] p-1 border-emerald-950 text-black" : "text-sm p-4 border-emerald-100"
            )} rowSpan={2}>
              {isRTL ? "اسم الأستاذ" : "Teacher Name"}
            </TableHead>
            {DAYS.map(day => (
              <TableHead 
                key={day.id} 
                className={cn(
                  "text-center font-black border",
                  isPrint ? "text-[9px] p-0.5 border-emerald-950 bg-emerald-50/30 text-black" : "text-xs p-2 bg-emerald-50/30 border-emerald-100 text-emerald-700"
                )} 
                colSpan={PERIODS.length}
              >
                {isRTL ? day.name : day.en}
              </TableHead>
            ))}
          </TableRow>
          <TableRow className={cn(isPrint ? "bg-emerald-50/20 border-b-2 border-emerald-950" : "bg-emerald-50/20 hover:bg-emerald-50/20")}>
            {DAYS.map(day => PERIODS.map(p => (
              <TableHead key={`${day.id}-${p}`} className={cn(
                "text-center font-bold border",
                isPrint ? "text-[8px] p-0.5 border-emerald-950 text-black" : "text-[10px] p-2 border-emerald-100"
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
                "font-bold border bg-white truncate",
                isPrint ? "text-[8px] p-1 border-emerald-950 text-black" : "text-xs p-4 border-emerald-100 text-emerald-950 group-hover:bg-emerald-50/30 sticky right-0 z-10 shadow-sm"
              )}>
                {emp.lastName} {emp.firstName}
              </TableCell>
              {DAYS.map(day => PERIODS.map(period => {
                const lessonPresent = hasLesson(emp.id, day.id, period);
                const manualDutyPresent = hasManualDuty(emp.id, day.id, period);
                const isActive = lessonPresent || manualDutyPresent;

                return (
                  <TableCell
                    key={`${emp.id}-${day.id}-${period}`}
                    onClick={() => toggleAssignment(emp.id, day.id, period)}
                    className={cn(
                      "text-center border p-0 transition-all relative",
                      !isPrint && isAdmin && "cursor-pointer",
                      isActive ? (isPrint ? "bg-emerald-800 text-white" : "bg-emerald-600 text-white shadow-inner") : "hover:bg-emerald-50/50",
                      isPrint ? "h-6 border-emerald-950" : "h-12 w-12 border-emerald-100"
                    )}
                  >
                    {isActive && (
                      <div className="flex flex-col items-center justify-center gap-0.5">
                        {lessonPresent ? <BookOpen size={isPrint ? 9 : 14} /> : <ShieldAlert size={isPrint ? 9 : 14} />}
                        <span className={cn("font-black uppercase tracking-tighter", isPrint ? "text-[6px]" : "text-[8px]")}>
                          {lessonPresent ? (isRTL ? "ح" : "L") : (isRTL ? "ع" : "W")}
                        </span>
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

  const subtitle = (
    <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-emerald-800">
      <Calendar size={14} />
      <span>{isRTL ? "للفترة الدراسية الحالية" : "For Current Academic Period"}</span>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <PageHeader
        title={t.weeklyWorkSchedule}
        subtitle={isRTL ? "مزامنة تلقائية مع جدول الحصص وتكليفات العمل" : "Auto-sync with timetable and work assignments"}
        icon={ClipboardList}
        isRTL={isRTL}
      >
        <div className="flex items-center gap-4 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100 text-[10px] font-bold h-11">
          <div className="flex items-center gap-1.5"><BookOpen size={12} className="text-emerald-600" /> {isRTL ? "حصة دراسية" : "Lesson"}</div>
          <div className="flex items-center gap-1.5"><ShieldAlert size={12} className="text-emerald-600" /> {isRTL ? "مناوبة/عمل" : "Duty"}</div>
        </div>
        
        <Select value={orientation} onValueChange={(v: any) => setOrientation(v)}>
          <SelectTrigger className="w-[140px] rounded-2xl border-emerald-100 bg-white h-11 font-bold">
            <SelectValue placeholder={isRTL ? "اتجاه الصفحة" : "Orientation"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="landscape">{isRTL ? "عرضي (موصى به)" : "Landscape (Rec.)"}</SelectItem>
            <SelectItem value="portrait">{isRTL ? "طولي" : "Portrait"}</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative w-full md:w-48">
          <Search className={cn("absolute top-1/2 -translate-y-1/2 text-gray-400", isRTL ? "right-3" : "left-3")} size={16} />
          <Input 
            placeholder={t.search} 
            className={cn("rounded-2xl border-emerald-100 bg-white h-11", isRTL ? "pr-10" : "pl-10")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="rounded-2xl border-emerald-200 text-emerald-700 gap-2 font-bold px-6 h-11 bg-white" onClick={() => setIsPreviewOpen(true)}>
          <Eye size={18} /> {t.preview}
        </Button>
        <Button className="bg-emerald-600 hover:bg-emerald-700 rounded-2xl gap-2 font-bold px-8 h-11 shadow-lg shadow-emerald-100 text-white" onClick={() => window.print()}>
          <Printer size={18} /> {t.print}
        </Button>
      </PageHeader>

      <div className="print:hidden">
        <ScheduleTable />
      </div>

      {/* Print Content Master */}
      <div className="print-content-master hidden print:block">
        <OfficialPrintWrapper
          title={t.weeklyWorkSchedule}
          subtitle={subtitle}
          orientation={orientation}
          leftSignatureTitle={isRTL ? "توقيع الأستاذ" : "Teacher Signature"}
          rightSignatureTitle={isRTL ? "ختم وتوقيع المدير" : "Director Signature"}
        >
          <ScheduleTable isPrint={true} />
        </OfficialPrintWrapper>
      </div>

      {/* Print Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[95vw] w-full max-h-[95vh] overflow-hidden rounded-[2.5rem] p-0 border-none bg-emerald-50/30 flex flex-col">
          <DialogHeader className="bg-white p-6 border-b border-emerald-100 sticky top-0 z-10 shrink-0">
            <DialogTitle className="flex items-center justify-between w-full text-emerald-900 font-black">
              <div className="flex items-center gap-3">
                <Printer className="text-emerald-600" />
                {isRTL ? "معاينة جدول العمل" : "Work Schedule Preview"}
              </div>
              <div className="flex items-center gap-2 print:hidden">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setOrientation(orientation === "portrait" ? "landscape" : "portrait")}
                  className="rounded-xl border-emerald-100 text-emerald-700 font-bold gap-2"
                >
                  <RotateCw size={14} />
                  {isRTL ? (orientation === "portrait" ? "تحويل لعرضي" : "تحويل لطولي") : "Toggle Orientation"}
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-zinc-950/10 print:bg-white print:p-0">
            <div className="w-full">
              <OfficialPrintWrapper
                title={t.weeklyWorkSchedule}
                subtitle={subtitle}
                orientation={orientation}
                leftSignatureTitle={isRTL ? "توقيع الأستاذ" : "Teacher Signature"}
                rightSignatureTitle={isRTL ? "ختم وتوقيع المدير" : "Director Signature"}
              >
                <ScheduleTable isPrint={true} />
              </OfficialPrintWrapper>
            </div>
          </div>
          <DialogFooter className="bg-white p-6 border-t border-emerald-100 shrink-0">
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)} className="rounded-xl px-8 h-12 font-bold">{t.cancel}</Button>
            <Button onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl px-12 h-12 font-black shadow-lg shadow-emerald-100 text-white">
              <Printer size={20} className="mr-2" /> {t.print}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style>
        {`
          @media print {
            body:has(div[role="dialog"]) #root {
              display: none !important;
            }
            @page {
              size: A4 ${orientation};
              margin: 0 !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default WeeklyWorkSchedule;