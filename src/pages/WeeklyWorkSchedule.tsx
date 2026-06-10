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
import { Printer, Search, Eye, ClipboardList, BookOpen, ShieldAlert, RotateCw, X } from "lucide-react";
import { Input } from "@/components/ui/input";
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
import { Dialog, DialogContent } from "@/components/ui/dialog";

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
        "border-collapse border-spacing-0 table-fixed", 
        isPrint ? "w-full border-2 border-black" : "w-full min-w-[1000px]"
      )}>
        <colgroup>
          <col className={isPrint ? "w-[18%]" : "w-[180px]"} />
          {Array.from({ length: 15 }).map((_, i) => (
            <col key={i} className={isPrint ? "w-[5.46%]" : "w-auto"} />
          ))}
        </colgroup>
        <TableHeader>
          <TableRow className={cn(isPrint ? "bg-slate-50/50 border-b-2 border-black h-7" : "bg-emerald-50/50 hover:bg-emerald-50/50 h-9")}>
            <TableHead className={cn(
              "font-black text-emerald-900 border text-center sticky left-0 z-20 bg-emerald-50/50",
              isPrint ? "text-[10px] p-1 border-black text-black" : "text-sm p-2 border-emerald-100"
            )} rowSpan={2}>
              {isRTL ? "المعلم" : "Teacher"}
            </TableHead>
            {DAYS.map(day => (
              <TableHead 
                key={day.id} 
                className={cn(
                  "text-center font-black border",
                  isPrint ? "text-[10px] p-0.5 border-black bg-slate-50 text-black" : "text-[12px] p-1.5 bg-emerald-50/30 border-emerald-100 text-emerald-700"
                )} 
                colSpan={PERIODS.length}
              >
                {isRTL ? day.name : day.en.substr(0, 3)}
              </TableHead>
            ))}
          </TableRow>
          <TableRow className={cn(isPrint ? "bg-slate-50/20 border-b-2 border-black h-6" : "bg-emerald-50/20 hover:bg-emerald-50/20 h-8")}>
            {DAYS.map(day => PERIODS.map(p => (
              <TableHead key={`${day.id}-${p}`} className={cn(
                "text-center font-bold border",
                isPrint ? "text-[9px] p-0.5 border-black text-black" : "text-[10px] p-1 border-emerald-100 text-slate-400"
              )}>
                {p === "Morning" ? (isRTL ? "ص" : "M") : p === "Afternoon" ? (isRTL ? "م" : "A") : (isRTL ? "ل" : "E")}
              </TableHead>
            )))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredEmployees.map(emp => (
            <TableRow key={emp.id} className={cn("group transition-colors", isPrint ? "h-7 border-b border-black" : "h-9 hover:bg-emerald-50/30")}>
              <TableCell className={cn(
                "font-bold border bg-white truncate sticky left-0 z-10 shadow-sm",
                isPrint ? "text-[10px] p-1.5 border-black text-black" : "text-[13px] p-2 border-emerald-100 text-emerald-950 group-hover:bg-emerald-50/30"
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
                      isActive ? (isPrint ? "bg-black text-white" : "bg-emerald-600 text-white shadow-inner") : (isPrint ? "bg-white" : "hover:bg-emerald-50/50"),
                      isPrint ? "h-7 border-black" : "h-9 border-emerald-100"
                    )}
                  >
                    {isActive && (
                      <div className="flex flex-col items-center justify-center">
                        {isPrint ? (
                          <span className="font-black text-[11px]">X</span>
                        ) : (
                          <span className="font-black uppercase tracking-tighter text-[11px]">
                            {lessonPresent ? (isRTL ? "ح" : "L") : (isRTL ? "ع" : "W")}
                          </span>
                        )}
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

  const printSubtitle = (
    <span className="font-bold">{isRTL ? "توزيع المهام والحصص الأسبوعية" : "Weekly Tasks & Lessons Distribution"}</span>
  );

  return (
    <div className="space-y-8 pb-20">
      <PageHeader
        title={t.weeklyWorkSchedule}
        subtitle={isRTL ? "مزامنة تلقائية مع جدول الحصص وتكليفات العمل" : "Auto-sync with timetable and work assignments"}
        icon={ClipboardList}
        isRTL={isRTL}
      >
        <div className="flex items-center gap-4 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100 text-[11px] font-bold h-11">
          <div className="flex items-center gap-1.5"><BookOpen size={14} className="text-emerald-600" /> {isRTL ? "حصة دراسية" : "Lesson"}</div>
          <div className="flex items-center gap-1.5"><ShieldAlert size={14} className="text-emerald-600" /> {isRTL ? "مناوبة/عمل" : "Duty"}</div>
        </div>
        
        <Select value={orientation} onValueChange={(v: any) => setOrientation(v)}>
          <SelectTrigger className="w-[140px] rounded-2xl border-emerald-100 bg-white h-11 font-bold">
            <SelectValue placeholder={isRTL ? "اتجاه الصفحة" : "Orientation"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="landscape">{isRTL ? "عرضي" : "Landscape"}</SelectItem>
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

      <div className="print-content-master hidden print:block">
        <OfficialPrintWrapper
          title={t.weeklyWorkSchedule}
          subtitle={printSubtitle}
          orientation={orientation}
          leftSignatureTitle={isRTL ? "توقيع الأستاذ" : "Teacher Signature"}
          rightSignatureTitle={isRTL ? "ختم وتوقيع المدير" : "Director Signature"}
          showSystemFooter={false}
        >
          <ScheduleTable isPrint={true} />
        </OfficialPrintWrapper>
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[98vw] w-full h-[95vh] p-0 bg-zinc-900/95 border-none rounded-none flex flex-col z-[9999] print:bg-white print:h-auto print:block">
          <div className="h-16 bg-black/40 border-b border-white/10 flex items-center justify-between px-8 shrink-0 print:hidden">
            <div className="flex items-center gap-3 text-white">
              <Eye className="text-emerald-500" />
              <h3 className="font-black text-lg">{isRTL ? "معاينة جدول العمل" : "Work Schedule Preview"}</h3>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setOrientation(orientation === "portrait" ? "landscape" : "portrait")} className="text-white border-white/20 bg-transparent rounded-xl">
                <RotateCw size={16} className="mr-2" />
                {isRTL ? (orientation === "portrait" ? "عرضي" : "طولي") : "Orientation"}
              </Button>
              <Button onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black px-8">
                <Printer size={18} className="mr-2" />
                {t.print}
              </Button>
              <Button variant="ghost" onClick={() => setIsPreviewOpen(false)} className="text-white/70 hover:text-white">
                <X size={20} />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-zinc-950/50 print:bg-white p-12 print:p-0">
            <OfficialPrintWrapper
              title={t.weeklyWorkSchedule}
              subtitle={printSubtitle}
              orientation={orientation}
              leftSignatureTitle={isRTL ? "توقيع الأستاذ" : "Teacher Signature"}
              rightSignatureTitle={isRTL ? "ختم وتوقيع المدير" : "Director Signature"}
              showSystemFooter={false}
            >
              <ScheduleTable isPrint={true} />
            </OfficialPrintWrapper>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WeeklyWorkSchedule;