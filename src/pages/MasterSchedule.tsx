"use client";

import React, { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  LayoutGrid, 
  Search, 
  Printer, 
  Filter,
  Rows,
  Columns,
  Eye,
  X,
  RotateCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import PageHeader from "../components/shared/PageHeader";
import { DAYS, PERIODS } from "../constants/schedule";
import { cn } from "@/lib/utils";
import OfficialPrintWrapper from "../components/shared/OfficialPrintWrapper";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const MasterSchedule = () => {
  const { classes, assignments, subjects, employees, isRTL, t } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDay, setSelectedDay] = useState(0);
  const [hideEmptyRows, setHideEmptyRows] = useState(false);
  const [hideEmptyPeriods, setHideEmptyPeriods] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [orientation, setOrientation] = useState<"landscape" | "portrait">("landscape");

  const visibleClasses = useMemo(() => {
    let list = classes.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (hideEmptyRows) {
      list = list.filter(c => 
        assignments.some(a => a.classId === c.id && a.day === selectedDay)
      );
    }
    
    return list;
  }, [classes, searchTerm, hideEmptyRows, selectedDay, assignments]);

  const visiblePeriods = useMemo(() => {
    if (!hideEmptyPeriods) return PERIODS;
    
    return PERIODS.filter(p => 
      assignments.some(a => a.day === selectedDay && a.period === p)
    );
  }, [hideEmptyPeriods, selectedDay, assignments]);

  const getLesson = (classId: string, period: string) => {
    return assignments.find(a => a.classId === classId && a.day === selectedDay && a.period === period);
  };

  const MasterTable = ({ isPrint = false }: { isPrint?: boolean }) => {
    const classColWidth = isPrint ? "15%" : "110px";
    const periodColWidth = isPrint ? `${85 / visiblePeriods.length}%` : "auto";

    return (
      <div className={cn(
        "bg-white overflow-x-auto pb-2",
        isPrint ? "p-0" : "rounded-2xl border border-emerald-100 shadow-md"
      )}>
        <table className={cn(
          "w-full border-collapse table-fixed",
          isPrint ? "border-2 border-black" : ""
        )}>
          <colgroup>
            <col style={{ width: classColWidth }} />
            {visiblePeriods.map(p => (
              <col key={p} style={{ width: periodColWidth }} />
            ))}
          </colgroup>
          <thead>
            <tr className={cn(isPrint ? "bg-slate-100 h-6" : "bg-emerald-950 text-white h-8")}>
              <th className={cn(
                "p-0.5 border sticky left-0 z-20 text-center",
                isPrint ? "text-[8px] font-black border-black text-black bg-slate-100" : "text-[10px] uppercase tracking-tighter font-black border-white/10 bg-emerald-950"
              )}>
                {isRTL ? "الفوج" : "Class"}
              </th>
              {visiblePeriods.map(p => (
                <th key={p} className={cn(
                  "p-0.5 border text-center font-black",
                  isPrint ? "text-[8px] border-black text-black" : "text-[10px] border-white/10"
                )}>
                  {isRTL ? `ح${p}` : `P${p}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleClasses.map((cls, idx) => (
              <tr key={cls.id} className={cn(
                "group transition-colors",
                isPrint ? "h-6" : "h-9",
                idx % 2 === 0 ? "bg-white" : "bg-emerald-50/10",
                !isPrint && "hover:bg-emerald-100/20"
              )}>
                <td className={cn(
                  "p-0.5 font-black border sticky left-0 z-10 transition-colors shadow-sm whitespace-normal break-words text-center",
                  idx % 2 === 0 ? "bg-white" : "bg-[#fcfdfd]",
                  isPrint ? "text-[7.5px] p-0.5 border-black text-black" : "text-[10px] text-emerald-950 border-emerald-50"
                )}>
                  {cls.name}
                </td>
                {visiblePeriods.map(p => {
                  const lesson = getLesson(cls.id, p);
                  const teacher = lesson ? employees.find(e => e.id === lesson.employeeId) : null;
                  const subject = lesson ? subjects.find(s => s.id === lesson.subjectId) : null;

                  return (
                    <td key={p} className={cn(
                      "p-0.5 text-center border",
                      isPrint ? "border-black" : "border-emerald-50"
                    )}>
                      {lesson ? (
                        <div className={cn(
                          "flex flex-col gap-0 overflow-hidden leading-none",
                          isPrint ? "text-[7px] text-black" : "text-[9px]"
                        )}>
                          <span className={cn("font-black truncate", isPrint ? "" : "text-emerald-700")}>{subject?.name}</span>
                          <span className={cn("font-bold opacity-80 truncate", isPrint ? "text-[6.5px]" : "text-slate-500")}>
                            {teacher ? `${teacher.lastName}` : "---"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-200 opacity-20 text-[7px]">---</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {visibleClasses.length === 0 && (
          <div className="p-12 text-center text-slate-400 font-bold text-xs">
            {isRTL ? "لا توجد بيانات" : "No data"}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 pb-12">
      <PageHeader
        title={isRTL ? "الجدول العام للمؤسسة" : "Master Institution Schedule"}
        subtitle={isRTL ? "عرض بانورامي شامل لكافة الأفواج" : "Panoramic view of all classes"}
        icon={LayoutGrid}
        isRTL={isRTL}
      >
        <div className="flex bg-white p-0.5 rounded-xl border border-emerald-100 shadow-sm h-9">
          {DAYS.map(day => (
            <Button
              key={day.id}
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDay(day.id)}
              className={cn(
                "rounded-lg px-3 font-black text-[9px] uppercase transition-all h-8",
                selectedDay === day.id 
                  ? "bg-emerald-600 text-white shadow-md" 
                  : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
              )}
            >
              {isRTL ? day.name : day.en.substr(0, 3)}
            </Button>
          ))}
        </div>
        
        <div className="relative w-full md:w-48">
          <Search className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400", isRTL ? "right-2.5" : "left-2.5")} size={14} />
          <Input 
            placeholder={isRTL ? "بحث عن فوج..." : "Search class..."} 
            className={cn("rounded-xl border-emerald-100 bg-white h-9 text-xs", isRTL ? "pr-8" : "pl-8")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Button variant="outline" onClick={() => setIsPreviewOpen(true)} className="rounded-xl gap-1.5 font-black h-9 border-emerald-200 text-emerald-700 bg-white px-4 text-xs">
          <Eye size={14} />
          {isRTL ? "معاينة" : "Preview"}
        </Button>

        <Button onClick={() => window.print()} className="bg-emerald-950 hover:bg-black text-white rounded-xl gap-1.5 font-black h-9 px-4 text-xs">
          <Printer size={14} />
          {t.print}
        </Button>
      </PageHeader>

      <div className="flex flex-wrap gap-4 bg-white p-3 rounded-2xl border border-emerald-100 shadow-sm mb-4 print:hidden">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded-lg border border-emerald-100">
          <Filter size={14} className="text-emerald-600" />
          <span className="text-[10px] font-black text-emerald-900 uppercase tracking-tighter">{isRTL ? "تصفية الجدول:" : "Table Filter:"}</span>
        </div>

        <div className="flex items-center space-x-2 space-x-reverse group cursor-pointer" onClick={() => setHideEmptyRows(!hideEmptyRows)}>
          <Checkbox 
            id="hide-rows" 
            checked={hideEmptyRows} 
            onCheckedChange={(v: boolean) => setHideEmptyRows(v)}
            className="rounded border-emerald-200 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 h-3.5 w-3.5"
          />
          <Label htmlFor="hide-rows" className="text-[10px] font-bold text-slate-600 cursor-pointer flex items-center gap-1.5">
            <Rows size={12} className="text-slate-400" />
            {isRTL ? "إخفاء الأفواج الفارغة اليوم" : "Hide empty classes today"}
          </Label>
        </div>

        <div className="w-px h-4 bg-emerald-100 mx-1 hidden md:block" />

        <div className="flex items-center space-x-2 space-x-reverse group cursor-pointer" onClick={() => setHideEmptyPeriods(!hideEmptyPeriods)}>
          <Checkbox 
            id="hide-periods" 
            checked={hideEmptyPeriods} 
            onCheckedChange={(v: boolean) => setHideEmptyPeriods(v)}
            className="rounded border-emerald-200 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 h-3.5 w-3.5"
          />
          <Label htmlFor="hide-periods" className="text-[10px] font-bold text-slate-600 cursor-pointer flex items-center gap-1.5">
            <Columns size={12} className="text-slate-400" />
            {isRTL ? "إخفاء الحصص الفارغة اليوم" : "Hide empty periods today"}
          </Label>
        </div>
      </div>

      <div className="print:hidden">
        <MasterTable />
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[98vw] w-full h-[95vh] p-0 bg-zinc-900/95 border-none rounded-none flex flex-col z-[9999] print:bg-white print:h-auto print:block">
          <div className="h-14 bg-black/40 border-b border-white/10 flex items-center justify-between px-6 shrink-0 print:hidden">
            <div className="flex items-center gap-2 text-white">
              <Eye className="text-emerald-500" size={16} />
              <h3 className="font-black text-sm">{isRTL ? "معاينة الجدول العام" : "Master Schedule Preview"}</h3>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setOrientation(orientation === "portrait" ? "landscape" : "portrait")} className="text-white border-white/20 bg-transparent rounded-xl h-9 text-xs">
                <RotateCw size={14} className="mr-1.5" />
                {isRTL ? (orientation === "portrait" ? "عرضي" : "طولي") : "Orientation"}
              </Button>
              <Button onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black px-6 h-9 text-xs">
                <Printer size={14} className="mr-1.5" />
                {t.print}
              </Button>
              <Button variant="ghost" onClick={() => setIsPreviewOpen(false)} className="text-white/50"><X size={18} /></Button>
            </div>
          </div>
          <div className="flex-1 overflow-auto bg-zinc-950/50 print:bg-white p-6 print:p-0">
            <OfficialPrintWrapper
              title={isRTL ? `الجدول العام - يوم ${DAYS.find(d => d.id === selectedDay)?.name}` : `Master Schedule - ${DAYS.find(d => d.id === selectedDay)?.en}`}
              subtitle={isRTL ? "خارطة الحصص الأسبوعية للمؤسسة" : "Institutional weekly lesson map"}
              orientation={orientation}
              showSystemFooter={false}
            >
              <MasterTable isPrint={true} />
            </OfficialPrintWrapper>
          </div>
        </DialogContent>
      </Dialog>

      {/* حاوية الطباعة الموحدة الخلفية */}
      <div className="print-content-master hidden print:block">
        <OfficialPrintWrapper
          title={isRTL ? `الجدول العام - يوم ${DAYS.find(d => d.id === selectedDay)?.name}` : `Master Schedule - ${DAYS.find(d => d.id === selectedDay)?.en}`}
          subtitle={isRTL ? "خارطة الحصص الأسبوعية للمؤسسة" : "Institutional weekly lesson map"}
          orientation={orientation}
          showSystemFooter={false}
        >
          <MasterTable isPrint={true} />
        </OfficialPrintWrapper>
      </div>
    </div>
  );
};

export default MasterSchedule;