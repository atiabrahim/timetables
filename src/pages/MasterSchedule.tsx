"use client";

import React, { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  LayoutGrid, 
  Search, 
  Printer, 
  Filter,
  Rows,
  Columns
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import PageHeader from "../components/shared/PageHeader";
import { DAYS, PERIODS } from "../constants/schedule";
import { cn } from "@/lib/utils";
import OfficialPrintWrapper from "../components/shared/OfficialPrintWrapper";

const MasterSchedule = () => {
  const { classes, assignments, subjects, employees, isRTL, t } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDay, setSelectedDay] = useState(0);
  const [hideEmptyRows, setHideEmptyRows] = useState(false);
  const [hideEmptyPeriods, setHideEmptyPeriods] = useState(false);

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
    const classColWidth = isPrint ? "w-[75px]" : "w-[90px]";

    return (
      <div className={cn(
        "bg-white overflow-x-auto pb-4",
        isPrint ? "p-0" : "rounded-[2rem] border border-emerald-100 shadow-xl shadow-emerald-50/50"
      )}>
        <table className="w-full border-collapse table-fixed">
          <colgroup>
            <col className={classColWidth} />
            {visiblePeriods.map(p => <col key={p} className="w-auto" />)}
          </colgroup>
          <thead>
            <tr className="bg-emerald-950 text-white">
              <th className={cn(
                "p-2 border-e border-white/10 text-center sticky left-0 z-20 bg-emerald-950",
                isPrint ? "text-[8px]" : "text-[10px] uppercase tracking-tighter font-black"
              )}>
                {isRTL ? "الفوج" : "Class"}
              </th>
              {visiblePeriods.map(p => (
                <th key={p} className={cn(
                  "p-2 border-e border-white/10 text-center font-black",
                  isPrint ? "text-[8px]" : "text-[10px]"
                )}>
                  {isRTL ? `ح${p}` : `P${p}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleClasses.map((cls, idx) => (
              <tr key={cls.id} className={cn(
                "group transition-colors h-10",
                idx % 2 === 0 ? "bg-white" : "bg-emerald-50/10",
                !isPrint && "hover:bg-emerald-100/30"
              )}>
                <td className={cn(
                  "p-1.5 font-black border-e sticky left-0 z-10 transition-colors shadow-sm truncate",
                  idx % 2 === 0 ? "bg-white" : "bg-[#fcfdfd]",
                  isPrint ? "text-[8px] border-black" : "text-[10px] text-emerald-950 border-emerald-50"
                )}>
                  {cls.name}
                </td>
                {visiblePeriods.map(p => {
                  const lesson = getLesson(cls.id, p);
                  const teacher = lesson ? employees.find(e => e.id === lesson.employeeId) : null;
                  const subject = lesson ? subjects.find(s => s.id === lesson.subjectId) : null;

                  return (
                    <td key={p} className={cn(
                      "p-1 text-center border-e",
                      isPrint ? "border-black" : "border-emerald-50"
                    )}>
                      {lesson ? (
                        <div className={cn(
                          "flex flex-col gap-0 overflow-hidden leading-none",
                          isPrint ? "text-[7px]" : "text-[8.5px]"
                        )}>
                          <span className="font-black text-emerald-700 truncate">{subject?.name}</span>
                          <span className="text-slate-500 font-bold truncate opacity-80 scale-[0.85] origin-center">
                            {teacher ? `${teacher.lastName}` : "---"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-100 opacity-10 text-[7px]">---</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {visibleClasses.length === 0 && (
          <div className="p-20 text-center text-slate-400 font-bold">
            {isRTL ? "لا توجد بيانات" : "No data"}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-20">
      <PageHeader
        title={isRTL ? "الجدول العام للمؤسسة" : "Master Institution Schedule"}
        subtitle={isRTL ? "عرض بانورامي شامل لكافة الأفواج" : "Panoramic view of all classes"}
        icon={LayoutGrid}
        isRTL={isRTL}
      >
        <div className="flex bg-white p-1 rounded-2xl border border-emerald-100 shadow-sm h-11">
          {DAYS.map(day => (
            <Button
              key={day.id}
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDay(day.id)}
              className={cn(
                "rounded-xl px-4 font-black text-[10px] uppercase transition-all",
                selectedDay === day.id 
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" 
                  : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
              )}
            >
              {isRTL ? day.name : day.en.substr(0, 3)}
            </Button>
          ))}
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400", isRTL ? "right-3" : "left-3")} size={16} />
          <Input 
            placeholder={isRTL ? "بحث عن فوج..." : "Search class..."} 
            className={cn("rounded-2xl border-emerald-100 bg-white h-11", isRTL ? "pr-10" : "pl-10")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Button onClick={() => window.print()} className="bg-emerald-950 hover:bg-black text-white rounded-2xl gap-2 font-black h-11 px-6">
          <Printer size={18} />
          {t.print}
        </Button>
      </PageHeader>

      <div className="flex flex-wrap gap-6 bg-white p-5 rounded-3xl border border-emerald-100 shadow-sm mb-6 print:hidden">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-100">
          <Filter size={16} className="text-emerald-600" />
          <span className="text-xs font-black text-emerald-900 uppercase tracking-tighter">{isRTL ? "تصفية الجدول:" : "Table Filter:"}</span>
        </div>

        <div className="flex items-center space-x-2 space-x-reverse group cursor-pointer" onClick={() => setHideEmptyRows(!hideEmptyRows)}>
          <Checkbox 
            id="hide-rows" 
            checked={hideEmptyRows} 
            onCheckedChange={(v: boolean) => setHideEmptyRows(v)}
            className="rounded-md border-emerald-200 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
          />
          <Label htmlFor="hide-rows" className="text-xs font-bold text-slate-600 cursor-pointer flex items-center gap-2">
            <Rows size={14} className="text-slate-400" />
            {isRTL ? "إخفاء الأفواج الفارغة اليوم" : "Hide empty classes today"}
          </Label>
        </div>

        <div className="w-px h-6 bg-emerald-100 mx-2 hidden md:block" />

        <div className="flex items-center space-x-2 space-x-reverse group cursor-pointer" onClick={() => setHideEmptyPeriods(!hideEmptyPeriods)}>
          <Checkbox 
            id="hide-periods" 
            checked={hideEmptyPeriods} 
            onCheckedChange={(v: boolean) => setHideEmptyPeriods(v)}
            className="rounded-md border-emerald-200 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
          />
          <Label htmlFor="hide-periods" className="text-xs font-bold text-slate-600 cursor-pointer flex items-center gap-2">
            <Columns size={14} className="text-slate-400" />
            {isRTL ? "إخفاء الحصص الفارغة اليوم" : "Hide empty periods today"}
          </Label>
        </div>
      </div>

      <div className="print:hidden">
        <MasterTable />
      </div>

      <div className="hidden print:block">
        <OfficialPrintWrapper
          title={isRTL ? `الجدول العام - يوم ${DAYS.find(d => d.id === selectedDay)?.name}` : `Master Schedule - ${DAYS.find(d => d.id === selectedDay)?.en}`}
          subtitle={isRTL ? "خارطة الحصص الأسبوعية للمؤسسة" : "Institutional weekly lesson map"}
          orientation="landscape"
        >
          <MasterTable isPrint={true} />
        </OfficialPrintWrapper>
      </div>

      <style>
        {`
          @media print {
            @page { size: A4 landscape; margin: 10mm; }
          }
        `}
      </style>
    </div>
  );
};

export default MasterSchedule;