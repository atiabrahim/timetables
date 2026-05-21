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
import logo from "@/assets/logo.png";
import { useApp } from "../../context/AppContext";

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
  const { institution } = useApp();
  
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

        <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center bg-zinc-950/50 print:p-0 print:bg-white">
          <div 
            id="printable-area"
            className={cn(
              "bg-white shadow-2xl transition-all duration-300 origin-top flex flex-col print:shadow-none print:m-0 print:w-full print:h-full",
              orientation === "portrait" ? "w-[210mm] min-h-[297mm]" : "w-[297mm] min-h-[210mm]"
            )}
            style={{ transform: `scale(${printScale / 100})` }}
          >
            <div className="p-8 md:p-12 flex-1 flex flex-col print:p-6 h-full">
              <div className="flex justify-between items-center mb-6">
                <div className="w-16 h-16 flex items-center justify-center">
                  <img src={logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="text-center flex-1">
                  <h1 className="text-base md:text-xl font-bold text-emerald-900 leading-tight">{institution.name}</h1>
                  <h2 className="text-sm md:text-base font-bold text-emerald-800">{institution.subName}</h2>
                </div>
                <div className="w-16 h-16 flex items-center justify-center">
                  <img src={logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4 text-[10px] md:text-xs font-bold border-y border-black py-2">
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

              <div className="flex-1 w-full overflow-hidden">
                <ScheduleTable 
                  isRTL={isRTL} days={days} timeSlots={timeSlots} getAssignment={getAssignment} 
                  onAddClick={() => {}} onDeleteClick={() => {}} subjects={subjects} employees={employees} 
                  classes={classes} viewMode={viewMode} isPrint={true} summaryData={summaryData} totalHours={totalHours}
                  isTransposed={isTransposed}
                />
              </div>

              <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                <div><p className="font-bold text-xs mb-10">{isRTL ? "الأستاذ" : "Teacher"}</p><div className="border-t border-black w-32 mx-auto"></div></div>
                <div><p className="font-bold text-xs mb-10">{isRTL ? "المسؤول البيداغوجي" : "Pedagogical Supervisor"}</p><div className="border-t border-black w-32 mx-auto"></div></div>
                <div><p className="font-bold text-xs mb-10">{isRTL ? "المدير" : "Director"}</p><div className="border-t border-black w-32 mx-auto"></div></div>
              </div>

              <div className="mt-4 pt-2 text-center text-[8px] text-gray-400 border-t border-gray-100">
                تم إنشاء الجدول بتاريخ: {new Date().toLocaleDateString()} - نظام EduSchedule
              </div>
            </div>
          </div>
        </div>

        <style>
          {`
            @media print {
              @page { 
                size: A4 ${orientation}; 
                margin: 0 !important; 
              }
              html, body { 
                width: 100% !important; 
                height: 100% !important; 
                margin: 0 !important; 
                padding: 0 !important; 
                background: white; 
                overflow: visible !important;
              }
              #printable-area {
                width: 100% !important;
                height: 100% !important;
                margin: 0 !important;
                transform: none !important;
              }
              .print\\:hidden { display: none !important; }
            }
          `}
        </style>
      </DialogContent>
    </Dialog>
  );
};

export default PrintPreview;