"use client";

import React from "react";
import { FileText, RotateCw, Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Dialog, 
  DialogContent 
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import ScheduleTable from "./ScheduleTable";

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
}

const PrintPreview = ({ 
  isOpen, onOpenChange, isRTL, orientation, setOrientation, printScale, setPrintScale, 
  viewMode, selectedId, employees, classes, subjects, days, timeSlots, getAssignment, summaryData, totalHours 
}: PrintPreviewProps) => {
  const selectedEntity = viewMode === "teacher" 
    ? employees.find(e => e.id === selectedId) 
    : classes.find(c => c.id === selectedId);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[100vw] w-full h-[100vh] p-0 border-none bg-zinc-900/95 flex flex-col">
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
            <Button variant="outline" onClick={() => setOrientation(orientation === "portrait" ? "landscape" : "portrait")} className="text-white border-white/20 bg-transparent">
              <RotateCw size={16} className="mr-2" />
              {isRTL ? (orientation === "portrait" ? "عرضي" : "طولي") : "Orientation"}
            </Button>
            <Button onClick={() => window.print()} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl">
              <Printer size={16} className="mr-2" />
              {isRTL ? "طباعة" : "Print"}
            </Button>
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-white/50"><X size={20} /></Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-12 flex justify-center bg-zinc-950/50 print:p-0 print:bg-white">
          <div 
            className={cn(
              "bg-white shadow-2xl transition-all duration-300 origin-top flex flex-col print:shadow-none print:m-0 print-area-wrapper",
              orientation === "portrait" ? "w-[210mm] min-h-[297mm]" : "w-[297mm] min-h-[210mm]"
            )}
            style={{ transform: `scale(${printScale / 100})` }}
          >
            <div className="p-10 flex-1 flex flex-col print-container">
              <div className="flex justify-between items-center mb-6">
                <div className="w-20 h-20 border border-gray-200 rounded-full flex items-center justify-center text-[8px] text-gray-400">LOGO</div>
                <div className="text-center flex-1">
                  <h1 className="text-xl font-bold text-emerald-900">مركز التكوين المهني والتمهين</h1>
                  <h2 className="text-lg font-bold text-emerald-800">المجاهد لمقدم مبروك بالدبيلة</h2>
                </div>
                <div className="w-20 h-20 border border-gray-200 rounded-full flex items-center justify-center text-[8px] text-gray-400">LOGO</div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6 text-sm font-bold border-y-2 border-black py-3">
                <div className="text-right">
                  {viewMode === "teacher" ? (
                    <p>{isRTL ? "الأستاذ(ة):" : "Teacher:"} {selectedEntity?.lastName} {selectedEntity?.firstName}</p>
                  ) : (
                    <p>{isRTL ? "الفرع:" : "Branch:"} {selectedEntity?.name}</p>
                  )}
                </div>
                <div className="text-center">
                  <p>{isRTL ? "الشعبة المهنية:" : "Specialty:"} {viewMode === "teacher" ? selectedEntity?.observation : "---"}</p>
                </div>
                <div className="text-left">
                  <p>{isRTL ? "الرتبة:" : "Rank:"} {viewMode === "teacher" ? selectedEntity?.category : "---"}</p>
                </div>
              </div>

              <div className="flex-1 w-full">
                <ScheduleTable 
                  isRTL={isRTL} days={days} timeSlots={timeSlots} getAssignment={getAssignment} 
                  onAddClick={() => {}} onDeleteClick={() => {}} subjects={subjects} employees={employees} 
                  classes={classes} viewMode={viewMode} isPrint={true} summaryData={summaryData} totalHours={totalHours}
                />
              </div>

              <div className="mt-12 grid grid-cols-3 gap-8 text-center">
                <div><p className="font-bold text-sm mb-16">{isRTL ? "المدير" : "Director"}</p><div className="border-t border-black w-32 mx-auto"></div></div>
                <div><p className="font-bold text-sm mb-16">{isRTL ? "المسؤول البيداغوجي" : "Pedagogical Supervisor"}</p><div className="border-t border-black w-32 mx-auto"></div></div>
                <div><p className="font-bold text-sm mb-16">{isRTL ? "الأستاذ" : "Teacher"}</p><div className="border-t border-black w-32 mx-auto"></div></div>
              </div>

              <div className="mt-auto pt-4 text-center text-[8px] text-gray-400 border-t border-gray-100">
                تم إنشاء الجدول بتاريخ: {new Date().toLocaleDateString()} - نظام EduSchedule
              </div>
            </div>
          </div>
        </div>

        <style>
          {`
            @media print {
              @page { size: A4 ${orientation}; margin: 10mm; }
              html, body { width: 100%; height: 100%; margin: 0 !important; padding: 0 !important; background: white; }
              body { display: flex; justify-content: center; align-items: flex-start; }
              .print-area-wrapper { position: relative !important; width: 100% !important; height: auto !important; background: white !important; transform: none !important; padding: 0 !important; margin: 0 !important; display: flex !important; justify-content: center !important; }
              .print-container { width: 98% !important; margin: 0 auto !important; box-sizing: border-box !important; }
              table { width: 100% !important; table-layout: fixed !important; border-collapse: collapse !important; }
              .print\\:hidden { display: none !important; }
            }
          `}
        </style>
      </DialogContent>
    </Dialog>
  );
};

export default PrintPreview;