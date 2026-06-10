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
import { Printer, Search, Eye, Layers, RotateCw, X, ArrowLeftRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import PageHeader from "../components/shared/PageHeader";
import { DAYS, PERIODS } from "../constants/schedule";
import OfficialPrintWrapper from "../components/shared/OfficialPrintWrapper";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const PERIOD_TIMES: Record<string, string> = {
  "1": "08:00-09:00", "2": "09:00-10:00", "3": "10:00-11:00", "4": "11:00-12:00",
  "5": "13:00-14:00", "6": "14:00-15:00", "7": "15:00-16:00", "8": "16:00-17:00",
  "9": "17:00-18:00", "10": "18:00-19:00", "11": "19:00-20:00", "12": "20:00-21:00",
};

const MasterClassesSchedule = () => {
  const { 
    employees, 
    assignments, 
    subjects,
    classes,
    isRTL,
    t,
    user
  } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [orientation, setOrientation] = useState<"landscape" | "portrait">("landscape");
  const [isTransposed, setIsTransposed] = useState(false);

  const filteredClasses = useMemo(() => {
    return classes.filter(cls => 
      cls.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [classes, searchTerm]);

  // تحديد الحصص النشطة فقط لكل يوم (التي تحتوي على حصة واحدة على الأقل لأي من الفروع المفلترة)
  const activePeriodsPerDay = useMemo(() => {
    const map: Record<number, string[]> = {};
    DAYS.forEach(day => {
      const activePeriods = PERIODS.filter(p => 
        assignments.some(a => 
          a.day === day.id && 
          a.period === p && 
          filteredClasses.some(cls => cls.id === a.classId)
        )
      );
      map[day.id] = activePeriods;
    });
    return map;
  }, [assignments, filteredClasses]);

  // حساب إجمالي الأعمدة النشطة لتوزيع العرض بالتساوي
  const totalActiveColumns = useMemo(() => {
    return DAYS.reduce((sum, day) => sum + (activePeriodsPerDay[day.id]?.length || 0), 0);
  }, [activePeriodsPerDay]);

  // خوارزمية حساب دمج الخلايا المتتالية لنفس الفرع، المادة، والأستاذ في نفس اليوم (أفقياً)
  const getDayCells = (classId: string, dayId: number) => {
    const activePeriods = activePeriodsPerDay[dayId] || [];
    const cells = activePeriods.map(p => ({
      period: p,
      colSpan: 1,
      assignment: assignments.find(a => a.classId === classId && a.day === dayId && a.period === p),
      skip: false
    }));

    for (let i = 0; i < cells.length; i++) {
      if (cells[i].skip) continue;
      const asgn1 = cells[i].assignment;
      if (!asgn1) continue;

      for (let j = i + 1; j < cells.length; j++) {
        const asgn2 = cells[j].assignment;
        // دمج إذا كانت نفس المادة ونفس الأستاذ متتاليين
        if (asgn2 && asgn2.subjectId === asgn1.subjectId && asgn2.employeeId === asgn1.employeeId) {
          cells[i].colSpan++;
          cells[j].skip = true;
        } else {
          break;
        }
      }
    }
    return cells;
  };

  // خوارزمية حساب دمج الخلايا المتتالية لنفس الفرع، المادة، والأستاذ في نفس اليوم (عمودياً للوضع المتبادل)
  const getTransposedDayCells = (classId: string, dayId: number) => {
    const activePeriods = activePeriodsPerDay[dayId] || [];
    const cells = activePeriods.map(p => ({
      period: p,
      rowSpan: 1,
      assignment: assignments.find(a => a.classId === classId && a.day === dayId && a.period === p),
      skip: false
    }));

    for (let i = 0; i < cells.length; i++) {
      if (cells[i].skip) continue;
      const asgn1 = cells[i].assignment;
      if (!asgn1) continue;

      for (let j = i + 1; j < cells.length; j++) {
        const asgn2 = cells[j].assignment;
        // دمج إذا كانت نفس المادة ونفس الأستاذ متتاليين
        if (asgn2 && asgn2.subjectId === asgn1.subjectId && asgn2.employeeId === asgn1.employeeId) {
          cells[i].rowSpan++;
          cells[j].skip = true;
        } else {
          break;
        }
      }
    }
    return cells;
  };

  const ScheduleTable = ({ isPrint = false }: { isPrint?: boolean }) => {
    if (isTransposed) {
      // الوضع المتبادل (Transposed Mode): الأسطر تمثل الأيام والحصص، والأعمدة تمثل الفروع
      return (
        <div className={cn(
          "bg-white",
          isPrint ? "p-0 w-full" : "rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-50/50 overflow-hidden"
        )}>
          <div className={cn(!isPrint && "overflow-x-auto")}>
            <Table className={cn(
              "border-collapse border-spacing-0 table-fixed", 
              isPrint ? "w-full border-2 border-black" : "w-full min-w-[1200px]"
            )}>
              <colgroup>
                <col className={isPrint ? "w-[10%]" : "w-[100px]"} />
                <col className={isPrint ? "w-[10%]" : "w-[100px]"} />
                {filteredClasses.map(cls => (
                  <col key={cls.id} className={isPrint ? `${80 / filteredClasses.length}%` : "w-[120px]"} />
                ))}
              </colgroup>
              <TableHeader>
                <TableRow className={cn(isPrint ? "bg-slate-50/50 border-b-2 border-black h-8" : "bg-emerald-50/50 hover:bg-emerald-50/50 h-10")}>
                  <TableHead className={cn(
                    "font-black text-emerald-900 border text-center",
                    isPrint ? "text-[10px] p-1 border-black text-black" : "text-sm p-2 border-emerald-100"
                  )}>
                    {isRTL ? "اليوم" : "Day"}
                  </TableHead>
                  <TableHead className={cn(
                    "font-black text-emerald-900 border text-center",
                    isPrint ? "text-[10px] p-1 border-black text-black" : "text-sm p-2 border-emerald-100"
                  )}>
                    {isRTL ? "الحصة" : "Period"}
                  </TableHead>
                  {filteredClasses.map(cls => (
                    <TableHead 
                      key={cls.id} 
                      className={cn(
                        "text-center font-black border truncate",
                        isPrint ? "text-[10px] p-1 border-black bg-slate-50 text-black" : "text-[12px] p-1.5 bg-emerald-50/30 border-emerald-100 text-emerald-700"
                      )}
                    >
                      {cls.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {DAYS.map(day => {
                  const activePeriods = activePeriodsPerDay[day.id] || [];
                  if (activePeriods.length === 0) return null;

                  return activePeriods.map((p, pIdx) => (
                    <TableRow key={`${day.id}-${p}`} className={cn("group transition-colors", isPrint ? "h-10 border-b border-black" : "h-14 hover:bg-emerald-50/30")}>
                      {pIdx === 0 && (
                        <TableCell 
                          rowSpan={activePeriods.length}
                          className={cn(
                            "font-black border bg-slate-50/50 text-center",
                            isPrint ? "text-[10px] p-1.5 border-black text-black" : "text-[13px] p-2 border-emerald-100 text-emerald-950"
                          )}
                        >
                          {isRTL ? day.name : day.en}
                        </TableCell>
                      )}
                      <TableCell className={cn(
                        "font-bold border bg-white text-center leading-none",
                        isPrint ? "text-[9px] p-1 border-black text-black" : "text-[11px] p-2 border-emerald-100 text-slate-500"
                      )}>
                        <span className="font-black block">{isRTL ? `ح${p}` : `P${p}`}</span>
                        <span className="text-[8px] font-normal opacity-75 mt-0.5 block">{PERIOD_TIMES[p]}</span>
                      </TableCell>

                      {filteredClasses.map(cls => {
                        const dayCells = getTransposedDayCells(cls.id, day.id);
                        const cell = dayCells.find(c => c.period === p);
                        if (!cell || cell.skip) return null;

                        const isActive = !!cell.assignment;
                        const subject = cell.assignment ? subjects.find(s => s.id === cell.assignment.subjectId) : null;
                        const emp = cell.assignment ? employees.find(e => e.id === cell.assignment.employeeId) : null;

                        return (
                          <TableCell
                            key={`${cls.id}-${day.id}-${p}`}
                            rowSpan={cell.rowSpan}
                            className={cn(
                              "text-center border p-1 transition-all relative overflow-hidden",
                              isActive ? (isPrint ? "bg-slate-100 text-black border-black" : "bg-emerald-600 text-white shadow-inner") : (isPrint ? "bg-white border-black" : "hover:bg-emerald-50/50"),
                              isPrint ? "h-10 border-black" : "h-14 border-emerald-100"
                            )}
                          >
                            {isActive ? (
                              <div className="flex flex-col items-center justify-center leading-tight">
                                <span className={cn("font-black truncate max-w-full", isPrint ? "text-[8px]" : "text-[11px]")}>
                                  {subject?.name || "---"}
                                </span>
                                <span className={cn("font-bold opacity-80 truncate max-w-full", isPrint ? "text-[7px]" : "text-[9px]")}>
                                  {emp ? `${emp.lastName} ${emp.firstName}` : "---"}
                                </span>
                                {cell.assignment.room && (
                                  <span className={cn("font-medium opacity-70 truncate max-w-full", isPrint ? "text-[6px]" : "text-[8px]")}>
                                    {cell.assignment.room}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-200 opacity-20 text-[8px]">---</span>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ));
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      );
    }

    // الوضع العادي (Normal Mode): الأسطر تمثل الفروع، والأعمدة تمثل الأيام والحصص
    return (
      <div className={cn(
        "bg-white",
        isPrint ? "p-0 w-full" : "rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-50/50 overflow-hidden"
      )}>
        <div className={cn(!isPrint && "overflow-x-auto")}>
          <Table className={cn(
            "border-collapse border-spacing-0 table-fixed", 
            isPrint ? "w-full border-2 border-black" : "w-full min-w-[1200px]"
          )}>
            <colgroup>
              <col className={isPrint ? "w-[15%]" : "w-[180px]"} />
              {Array.from({ length: totalActiveColumns }).map((_, i) => (
                <col key={i} className={isPrint ? `${85 / totalActiveColumns}%` : "w-[85px]"} />
              ))}
            </colgroup>
            <TableHeader>
              <TableRow className={cn(isPrint ? "bg-slate-50/50 border-b-2 border-black h-7" : "bg-emerald-50/50 hover:bg-emerald-50/50 h-9")}>
                <TableHead className={cn(
                  "font-black text-emerald-900 border text-center sticky left-0 z-20 bg-emerald-50/50",
                  isPrint ? "text-[10px] p-1 border-black text-black" : "text-sm p-2 border-emerald-100"
                )} rowSpan={2}>
                  {isRTL ? "الفرع" : "Branch"}
                </TableHead>
                {DAYS.map(day => {
                  const colSpan = activePeriodsPerDay[day.id]?.length || 0;
                  if (colSpan === 0) return null;
                  return (
                    <TableHead 
                      key={day.id} 
                      className={cn(
                        "text-center font-black border",
                        isPrint ? "text-[10px] p-0.5 border-black bg-slate-50 text-black" : "text-[12px] p-1.5 bg-emerald-50/30 border-emerald-100 text-emerald-700"
                      )} 
                      colSpan={colSpan}
                    >
                      {isRTL ? day.name : day.en.substr(0, 3)}
                    </TableHead>
                  );
                })}
              </TableRow>
              <TableRow className={cn(isPrint ? "bg-slate-50/20 border-b-2 border-black h-8" : "bg-emerald-50/20 hover:bg-emerald-50/20 h-10")}>
                {DAYS.map(day => {
                  const activePeriods = activePeriodsPerDay[day.id] || [];
                  return activePeriods.map(p => (
                    <TableHead key={`${day.id}-${p}`} className={cn(
                      "text-center font-bold border p-1",
                      isPrint ? "text-[8px] border-black text-black" : "text-[10px] border-emerald-100 text-slate-400"
                    )}>
                      <div className="flex flex-col items-center justify-center leading-none">
                        <span className="font-black">{isRTL ? `ح${p}` : `P${p}`}</span>
                        <span className={cn("font-normal opacity-75 mt-0.5 block tracking-tighter", isPrint ? "text-[5px]" : "text-[8px]")}>
                          {PERIOD_TIMES[p]}
                        </span>
                      </div>
                    </TableHead>
                  ));
                })}
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredClasses.map(cls => (
                <TableRow key={cls.id} className={cn("group transition-colors", isPrint ? "h-10 border-b border-black" : "h-14 hover:bg-emerald-50/30")}>
                  <TableCell className={cn(
                    "font-bold border bg-white truncate sticky left-0 z-10 shadow-sm",
                    isPrint ? "text-[10px] p-1.5 border-black text-black" : "text-[13px] p-2 border-emerald-100 text-emerald-950 group-hover:bg-emerald-50/30"
                  )}>
                    {cls.name}
                  </TableCell>
                  {DAYS.map(day => {
                    const dayCells = getDayCells(cls.id, day.id);
                    return dayCells.map(cell => {
                      if (cell.skip) return null;
                      const isActive = !!cell.assignment;
                      const subject = cell.assignment ? subjects.find(s => s.id === cell.assignment.subjectId) : null;
                      const emp = cell.assignment ? employees.find(e => e.id === cell.assignment.employeeId) : null;

                      return (
                        <TableCell
                          key={`${cls.id}-${day.id}-${cell.period}`}
                          colSpan={cell.colSpan}
                          className={cn(
                            "text-center border p-1 transition-all relative overflow-hidden",
                            isActive ? (isPrint ? "bg-slate-100 text-black border-black" : "bg-emerald-600 text-white shadow-inner") : (isPrint ? "bg-white border-black" : "hover:bg-emerald-50/50"),
                            isPrint ? "h-10 border-black" : "h-14 border-emerald-100"
                          )}
                        >
                          {isActive ? (
                            <div className="flex flex-col items-center justify-center leading-tight">
                              <span className={cn("font-black truncate max-w-full", isPrint ? "text-[8px]" : "text-[11px]")}>
                                {subject?.name || "---"}
                              </span>
                              <span className={cn("font-bold opacity-80 truncate max-w-full", isPrint ? "text-[7px]" : "text-[9px]")}>
                                {emp ? `${emp.lastName} ${emp.firstName}` : "---"}
                              </span>
                              {cell.assignment.room && (
                                <span className={cn("font-medium opacity-70 truncate max-w-full", isPrint ? "text-[6px]" : "text-[8px]")}>
                                  {cell.assignment.room}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-200 opacity-20 text-[8px]">---</span>
                          )}
                        </TableCell>
                      );
                    });
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  const printSubtitle = (
    <span className="font-bold">{isRTL ? "توزيع الحصص الأسبوعية لكافة الفروع" : "Weekly Lessons Distribution for All Classes"}</span>
  );

  return (
    <div className="space-y-8 pb-20">
      <PageHeader
        title={t.masterClassesSchedule}
        subtitle={isRTL ? "مزامنة تلقائية مع جدول الحصص وتكليفات الفروع" : "Auto-sync with timetable and classes assignments"}
        icon={Layers}
        isRTL={isRTL}
      >
        <Button 
          variant="outline" 
          onClick={() => setIsTransposed(!isTransposed)} 
          className="rounded-2xl border-emerald-100 text-emerald-700 font-bold gap-2 h-11 bg-white px-4"
        >
          <ArrowLeftRight size={16} />
          {isRTL ? "تبديل المحاور" : "Transpose"}
        </Button>

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
          title={t.masterClassesSchedule}
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
              <h3 className="font-black text-lg">{isRTL ? "معاينة جدول الفروع" : "Classes Schedule Preview"}</h3>
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
              title={t.masterClassesSchedule}
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

export default MasterClassesSchedule;