"use client";

import React from "react";
import { FileText, RotateCw, Printer, X, Calendar as CalendarIcon, User, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Dialog, 
  DialogContent 
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import ScheduleTable from "./ScheduleTable";
import OfficialPrintWrapper from "../shared/OfficialPrintWrapper";

interface PrintPreviewProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isRTL: boolean;
  orientation: "landscape" | "portrait";
  setOrientation: (o: "landscape" | "portrait") => void;
  printScale: number;
  setPrintScale: (s: number) => void;
  viewMode: "class" | "teacher";
  selectedId: string;
  employees: any[];
  classes: any[];
  subjects: any[];
  days: any[];
  timeSlots: any[];
  getAssignment: (day: number, period: string) => any;
  summaryData: any[];
  totalHours: number;
  isTransposed?: boolean;
}

const PrintPreview = ({ 
  isOpen, onOpenChange, isRTL, orientation, setOrientation, printScale, setPrintScale, 
  viewMode, selectedId, employees, classes, subjects, days, timeSlots, getAssignment, summaryData, totalHours, isTransposed = false 
}: PrintPreviewProps) => {
  
  const selectedEntity = viewMode === "teacher" 
    ? employees.find(e => e.id === selectedId) 
    : classes.find(c => c.id === selectedId);

  const entityName = viewMode === "teacher"
    ? (selectedEntity ? `${selectedEntity.lastName} ${selectedEntity.firstName}` : "---")
    : (selectedEntity ? selectedEntity.name : "---");

  const title = viewMode === "teacher"
    ? (isRTL ? `جدول توقيت الأستاذ: ${entityName}` : `Teacher Timetable: ${entityName}`)
    : (isRTL ? `جدول توقيت الفوج: ${entityName}` : `Class Timetable: ${entityName}`);

  const subtitle = (
    <div className="flex items-center gap-4 text-xs md:text-sm font-bold text-emerald-800">
      <div className="flex items-center gap-1.5">
        {viewMode === "teacher" ? <User size={14} /> : <GraduationCap size={14} />}
        <span>{entityName}</span>
      </div>
      <span className="text-emerald-200 h-4 w-px bg-emerald-200"></span>
      <div className="flex items-center gap-1.5">
        <CalendarIcon size={14} />
        <span>{isRTL ? "الجدول الأسبوعي" : "Weekly Schedule"}</span>
      </div>
    </div>
  );

  // تحديد مسميات التوقيعات بناءً على نوع الجدول
  const leftSignatureTitle = viewMode === "teacher"
    ? (isRTL ? "توقيع الأستاذ" : "Teacher Signature")
    : (isRTL ? "رئيس مصلحة التكوين" : "Head of Training");

  const rightSignatureTitle = isRTL ? "ختم وتوقيع المدير" : "Director Signature";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[100vw] w-full h-[100vh] p-0 border-none bg-zinc-900/95 flex flex-col rounded-none z-[9999]">
        <div className="h-16 bg-black/40 border-b border-white/10 flex items-center justify-between px-8 shrink-0 print:hidden">
          <div className="flex items-center gap-4 text-white">
            <FileText size={20} />
            <h3 className="font-bold">{isRTL ? "معاينة الطباعة الرسمية" : "Official Print Preview"}</h3>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-xl">
              <Slider value={[printScale]} onValueChange={(v) => setPrintScale(v[0])} min={30} max={150} className="w-32" />
              <span className="text-white text-xs font-bold">{printScale}%</span>
            </div>
            <Button variant="outline" onClick={() => setOrientation(orientation === "portrait" ? "landscape" : "portrait")} className="text-white border-white/20 bg-transparent rounded-xl">
              <RotateCw size={16} className="mr-2" />
              {isRTL ? (orientation === "portrait" ? "عرضي" : "طولي") : "Orientation"}
            </Button>
            <Button onClick={() => window.print()} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold px-8">
              <Printer size={16} className="mr-2" />
              {isRTL ? "طباعة" : "Print"}
            </Button>
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-white/50"><X size={20} /></Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center bg-zinc-950/50 print:p-0 print:bg-white print:block">
          {/* 1. حاوية المعاينة البصرية على الشاشة فقط (تختفي عند الطباعة) */}
          <div 
            id="printable-area"
            className="transition-all duration-300 origin-top print:hidden"
            style={{ transform: `scale(${printScale / 100})` }}
          >
            <OfficialPrintWrapper
              title={title}
              subtitle={subtitle}
              orientation={orientation}
              leftSignatureTitle={leftSignatureTitle}
              rightSignatureTitle={rightSignatureTitle}
            >
              <div className="w-full">
                <ScheduleTable 
                  isRTL={isRTL} days={days} timeSlots={timeSlots} getAssignment={getAssignment} 
                  onAddClick={() => {}} onDeleteClick={() => {}} subjects={subjects} employees={employees} 
                  classes={classes} viewMode={viewMode} isPrint={true} summaryData={summaryData} totalHours={totalHours}
                  isTransposed={isTransposed}
                />
              </div>
            </OfficialPrintWrapper>
          </div>

          {/* 2. حاوية الطباعة الفعلية (تظهر عند الطباعة فقط وتكون غير مقلصة وبأعلى جودة) */}
          <div className="hidden print:block w-full">
            <OfficialPrintWrapper
              title={title}
              subtitle={subtitle}
              orientation={orientation}
              leftSignatureTitle={leftSignatureTitle}
              rightSignatureTitle={rightSignatureTitle}
            >
              <div className="w-full">
                <ScheduleTable 
                  isRTL={isRTL} days={days} timeSlots={timeSlots} getAssignment={getAssignment} 
                  onAddClick={() => {}} onDeleteClick={() => {}} subjects={subjects} employees={employees} 
                  classes={classes} viewMode={viewMode} isPrint={true} summaryData={summaryData} totalHours={totalHours}
                  isTransposed={isTransposed}
                />
              </div>
            </OfficialPrintWrapper>
          </div>
        </div>

        <style>
          {`
            @page {
              size: A4 ${orientation};
              margin: 0;
            }
            @media print {
              body:has(div[role="dialog"]) #root {
                display: none !important;
              }
            }
          `}
        </style>
      </DialogContent>
    </Dialog>
  );
};

export default PrintPreview;