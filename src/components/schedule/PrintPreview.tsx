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
          <div 
            id="printable-area"
            className={cn(
              "bg-white shadow-2xl transition-all duration-300 origin-top flex flex-col print:shadow-none print:m-0 print:overflow-visible print:w-full",
              orientation === "portrait" ? "w-[210mm] min-h-[297mm]" : "w-[297mm] min-h-[210mm]"
            )}
            style={{ transform: `scale(${printScale / 100})` }}
          >
            <div className="p-10 flex-1 flex flex-col print:p-[10mm] overflow-hidden h-full border-2 border-transparent">
              {/* Header */}
              <div className="flex justify-between items-center mb-6 shrink-0">
                <div className="w-16 h-16 flex items-center justify-center">
                  <img src={logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="text-center flex-1 mx-4">
                  <h1 className="text-sm md:text-xl font-black text-emerald-950 leading-tight uppercase">{institution.name}</h1>
                  <h2 className="text-xs md:text-base font-bold text-emerald-800 mt-1">{institution.subName}</h2>
                </div>
                <div className="w-16 h-16 flex items-center justify-center">
                  <img src={logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                </div>
              </div>

              {/* Info Bar */}
              <div className="grid grid-cols-3 gap-4 mb-4 text-[10px] md:text-[12px] font-black border-y-2 border-emerald-950 py-3 shrink-0 bg-emerald-50/20">
                <div className={isRTL ? "text-right px-2" : "text-left px-2"}>
                  {viewMode === "teacher" ? (
                    <p>{isRTL ? "الأستاذ(ة):" : "Teacher:"} <span className="text-emerald-900">{selectedEntity?.lastName} {selectedEntity?.firstName}</span></p>
                  ) : (
                    <p>{isRTL ? "الفرع:" : "Branch:"} <span className="text-emerald-900">{selectedEntity?.name}</span></p>
                  )}
                </div>
                <div className="text-center border-x border-emerald-950/20">
                  <p>{isRTL ? "السنة الدراسية:" : "Academic Year:"} {institution.academicYear || "---"}</p>
                </div>
                <div className={isRTL ? "text-left px-2" : "text-right px-2"}>
                  <p>{isRTL ? "الرتبة:" : "Rank:"} {viewMode === "teacher" ? selectedEntity?.category : "---"}</p>
                </div>
              </div>

              {/* Table Area */}
              <div className="flex-1 min-h-0 w-full">
                <ScheduleTable 
                  isRTL={isRTL} days={days} timeSlots={timeSlots} getAssignment={getAssignment} 
                  onAddClick={() => {}} onDeleteClick={() => {}} subjects={subjects} employees={employees} 
                  classes={classes} viewMode={viewMode} isPrint={true} summaryData={summaryData} totalHours={totalHours}
                  isTransposed={isTransposed}
                />
              </div>

              {/* Footer / Signatures */}
              <div className="mt-8 mb-[2cm] grid grid-cols-3 gap-8 text-center shrink-0">
                <div><p className="font-black text-xs mb-10">{isRTL ? "توقيع الأستاذ" : "Teacher Signature"}</p><div className="border-t-2 border-emerald-950 w-32 mx-auto"></div></div>
                <div><p className="font-black text-xs mb-10">{isRTL ? "المسؤول البيداغوجي" : "Pedagogical Supervisor"}</p><div className="border-t-2 border-emerald-950 w-32 mx-auto"></div></div>
                <div><p className="font-black text-xs mb-10">{isRTL ? "ختم وتوقيع المدير" : "Director Signature"}</p><div className="border-t-2 border-emerald-950 w-32 mx-auto"></div></div>
              </div>

              <div className="mt-auto pt-4 text-center text-[8px] text-gray-400 border-t border-emerald-100 shrink-0 font-bold">
                تم إنشاء هذا الجدول آلياً بواسطة نظام EduSchedule — {new Date().toLocaleDateString('ar-DZ')}
              </div>
            </div>
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
              #printable-area {
                visibility: visible !important;
                display: block !important;
                position: static !important;
                width: 100% !important;
                height: auto !important;
                margin: 0 !important;
                padding: 10mm !important;
                border: none !important;
                box-shadow: none !important;
                background: white !important;
                transform: none !important;
              }
            }
          `}
        </style>
      </DialogContent>
    </Dialog>
  );
};

export default PrintPreview;