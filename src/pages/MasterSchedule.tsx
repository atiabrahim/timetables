"use client";

import React, { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  LayoutGrid, 
  Search, 
  Printer, 
  Eye, 
  Settings2,
  ChevronRight,
  ChevronLeft,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageHeader from "../components/shared/PageHeader";
import { DAYS, PERIODS } from "../constants/schedule";
import { cn } from "@/lib/utils";
import OfficialPrintWrapper from "../components/shared/OfficialPrintWrapper";

const MasterSchedule = () => {
  const { classes, assignments, subjects, employees, isRTL, t } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDay, setSelectedDay] = useState(0); // الأحد افتراضياً

  const filteredClasses = useMemo(() => {
    return classes.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [classes, searchTerm]);

  const getLesson = (classId: string, period: string) => {
    return assignments.find(a => a.classId === classId && a.day === selectedDay && a.period === period);
  };

  const MasterTable = ({ isPrint = false }: { isPrint?: boolean }) => (
    <div className={cn(
      "bg-white overflow-x-auto pb-4",
      isPrint ? "p-0" : "rounded-[2rem] border border-emerald-100 shadow-xl shadow-emerald-50/50"
    )}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-emerald-950 text-white">
            <th className={cn(
              "p-4 border-e border-white/10 text-center sticky left-0 z-20 bg-emerald-950",
              isPrint ? "text-[10px] w-24" : "text-xs w-40 uppercase tracking-widest font-black"
            )}>
              {isRTL ? "الفوج / الفرع" : "Class / Branch"}
            </th>
            {PERIODS.map(p => (
              <th key={p} className={cn(
                "p-4 border-e border-white/10 text-center font-black",
                isPrint ? "text-[10px]" : "text-xs min-w-[120px]"
              )}>
                {isRTL ? `الحصة ${p}` : `P. ${p}`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredClasses.map((cls, idx) => (
            <tr key={cls.id} className={cn(
              "group transition-colors",
              idx % 2 === 0 ? "bg-white" : "bg-emerald-50/20",
              !isPrint && "hover:bg-emerald-100/30"
            )}>
              <td className={cn(
                "p-4 font-black border-e sticky left-0 z-10 transition-colors shadow-sm",
                idx % 2 === 0 ? "bg-white" : "bg-[#f9fdfb]",
                isPrint ? "text-[10px] border-black" : "text-xs text-emerald-950 border-emerald-50"
              )}>
                {cls.name}
              </td>
              {PERIODS.map(p => {
                const lesson = getLesson(cls.id, p);
                const teacher = lesson ? employees.find(e => e.id === lesson.employeeId) : null;
                const subject = lesson ? subjects.find(s => s.id === lesson.subjectId) : null;

                return (
                  <td key={p} className={cn(
                    "p-2 text-center border-e",
                    isPrint ? "border-black" : "border-emerald-50"
                  )}>
                    {lesson ? (
                      <div className={cn(
                        "flex flex-col gap-0.5",
                        isPrint ? "text-[8px]" : "text-[10px]"
                      )}>
                        <span className="font-black text-emerald-700 truncate">{subject?.name}</span>
                        <span className="text-slate-500 font-bold truncate opacity-80">
                          {teacher ? `${teacher.lastName} ${teacher.firstName}` : "---"}
                        </span>
                        {lesson.room && (
                          <span className="text-emerald-500 font-black text-[8px] bg-emerald-50 rounded px-1 self-center">
                            {lesson.room}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-200">---</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <PageHeader
        title={isRTL ? "الجدول العام للمؤسسة" : "Master Institution Schedule"}
        subtitle={isRTL ? "عرض بانورامي شامل لكافة الأفواج في لحظة واحدة" : "Panoramic view of all classes in one screen"}
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
              {isRTL ? day.name : day.en}
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