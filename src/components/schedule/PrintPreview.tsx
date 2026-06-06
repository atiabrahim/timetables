"use client";

import React, { useState } from "react";
import { FileText, RotateCw, Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Dialog, 
  DialogContent 
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
  isTransposed: boolean;
}

const PrintPreview = ({ 
  isOpen, onOpenChange, isRTL, orientation, setOrientation, printScale, setPrintScale, 
  viewMode, selectedId, employees, classes, subjects, days, timeSlots, getAssignment, summaryData, totalHours, isTransposed
}: PrintPreviewProps) => {
  const [doubleMode, setDoubleMode] = useState(false); 

  const selectedEntity = viewMode === "teacher" 
    ? employees.find(e => e.id === selectedId) 
    : classes.find(c => c.id === selectedId);

  const entityName = viewMode === "teacher"
    ? (selectedEntity ? `${selectedEntity.lastName} ${selectedEntity.firstName}` : "---")
    : (selectedEntity ? selectedEntity.name : "---");

  const title = viewMode === "teacher"
    ? (isRTL ? `للأستاذ : ${entityName}` : `for Teacher: ${entityName}`)
    : (isRTL ? `لفوج : ${entityName}` : `for Branch: ${entityName}`);

  const metadata = (
    <>
      <div className="flex items-center gap-2">
        <span className="opacity-60">{isRTL ? "رمز الفرع:" : "Branch Code:"}</span>
        <span>{viewMode === "class" ? (selectedEntity?.code || "---") : "---"}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="opacity-60">{isRTL ? "مستوى التأهيل:" : "Qual. Level:"}</span>
        <span>{viewMode === "class" ? (selectedEntity?.qualificationLevel || "---") : "---"}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="opacity-60">{isRTL ? "السنة التكوينية:" : "Training Year:"}</span>
        <span>2023 / 2024</span>
      </div>
    </>
  );

  const ScheduleContent = () => (
    <OfficialPrintWrapper
      title={isRTL ? "الجدول الزمني الأسبوعي" : "Weekly Schedule"}
      subtitle={title}
      metadata={metadata}
      orientation={orientation}
    >
      <ScheduleTable 
        isRTL={isRTL} 
        days={days} 
        timeSlots={timeSlots} 
        getAssignment={getAssignment} 
        onAddClick={() => {}} 
        onDeleteClick={() => {}} 
        subjects={subjects} 
        employees={employees} 
        classes={classes} 
        viewMode={viewMode} 
        isPrint={true} 
        summaryData={summaryData} 
        totalHours={totalHours}
        isTransposed={isTransposed}
      />
    </OfficialPrintWrapper>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[100vw] w-full h-[100vh] p-0 border-none bg-zinc-900/95 flex flex-col rounded-none z-[9999] print:bg-white print:h-auto print:block">
        <div className="h-16 bg-black/40 border-b border-white/10 flex items-center justify-between px-8 shrink-0 print:hidden">
          <div className="flex items-center gap-4 text-white">
            <FileText size={20} />
            <h3 className="font-bold">{isRTL ? "معاينة الطباعة الرسمية" : "Official Print Preview"}</h3>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/10">
              <Checkbox id="double-mode" checked={doubleMode} onCheckedChange={(v: boolean) => setDoubleMode(v)} className="border-white/50" />
              <Label htmlFor="double-mode" className="text-white text-xs font-black cursor-pointer">
                {isRTL ? "نسختان" : "2 per sheet"}
              </Label>
            </div>

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

        <div className="flex-1 overflow-auto bg-zinc-950/50 print:bg-white grid place-items-center p-8 print:p-0">
          <div 
            className="transition-all duration-300 flex flex-col gap-8 print:gap-0 print:block"
            style={{ transform: `scale(${printScale / 100})`, transformOrigin: 'center center' }}
          >
            <ScheduleContent />
            {doubleMode && <ScheduleContent />}
          </div>
        </div>

        <style>
          {`
            @page {
              size: A4 ${orientation};
              margin: 0 !important;
            }
          `}
        </style>
      </DialogContent>
    </Dialog>
  );
};

export default PrintPreview;