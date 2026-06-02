"use client";

import React, { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { Button } from "@/components/ui/button";
import { Printer, Eye, X, RotateCw, Home, BarChart3 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import TeacherLoadChart from "../components/reports/TeacherLoadChart";
import RoomUsageChart from "../components/reports/RoomUsageChart";
import PageHeader from "../components/shared/PageHeader";

const Reports = () => {
  const { employees, assignments, classes, rooms, isRTL, t } = useApp();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [printScale, setPrintScale] = useState(100);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");

  const teacherLoadData = useMemo(() => 
    employees.map(emp => ({
      name: `${emp.lastName} ${emp.firstName}`,
      lessons: assignments.filter(a => a.employeeId === emp.id).length
    })).filter(d => d.lessons > 0).sort((a, b) => b.lessons - a.lessons)
  , [employees, assignments]);

  const roomUsageData = useMemo(() => 
    rooms.map(room => ({
      name: room,
      value: assignments.filter(a => a.room === room).length
    })).filter(d => d.value > 0)
  , [rooms, assignments]);

  const classSummaryData = useMemo(() => 
    classes.map(cls => ({
      name: cls.name,
      lessons: assignments.filter(a => a.classId === cls.id).length
    })).filter(d => d.lessons > 0)
  , [classes, assignments]);

  const ReportContent = ({ isPreview = false }: { isPreview?: boolean }) => (
    <div className={cn("space-y-8", isPreview && "p-4")}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TeacherLoadChart data={teacherLoadData} isRTL={isRTL} title={t.reports_page.teacher_load} />
        <RoomUsageChart data={roomUsageData} isRTL={isRTL} title={t.reports_page.room_usage} />
        
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-xl shadow-emerald-100/20">
          <h3 className="text-lg font-bold flex items-center gap-2 text-emerald-900 mb-6">
            <Home size={20} className="text-emerald-500" />
            {t.reports_page.class_summary}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {classSummaryData.map((cls, idx) => (
              <div key={idx} className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex flex-col items-center text-center">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">{isRTL ? "الفرع" : "Branch"}</p>
                <p className="font-black text-emerald-950 text-lg mb-2">{cls.name}</p>
                <div className="w-full h-1.5 bg-emerald-100 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-emerald-500" style={{ width: `${(cls.lessons / 40) * 100}%` }}></div>
                </div>
                <p className="text-xs font-bold text-emerald-700">{cls.lessons} {isRTL ? "حصة أسبوعياً" : "Lessons / Week"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <PageHeader
        title={t.reports_page.title}
        subtitle={isRTL ? "تحليل شامل لتوزيع الموارد والمهام" : "Comprehensive analysis"}
        icon={BarChart3}
        isRTL={isRTL}
      >
        <Button variant="outline" onClick={() => setIsPreviewOpen(true)} className="rounded-xl border-emerald-100 text-emerald-700 bg-white h-11">
          <Eye size={18} className={isRTL ? "ml-2" : "mr-2"} />
          {isRTL ? "معاينة الطباعة" : "Print Preview"}
        </Button>
        <Button onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white h-11 px-6">
          <Printer size={18} className={isRTL ? "ml-2" : "mr-2"} />
          {t.reports_page.print_report}
        </Button>
      </PageHeader>

      <ReportContent />

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[95vw] w-full h-[90vh] overflow-y-auto rounded-3xl p-0 border-none bg-zinc-900/95 flex flex-col">
          <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10 print:hidden">
            <div className="flex items-center gap-3"><Eye className="text-emerald-600" /><h3 className="font-bold">{isRTL ? "معاينة التقرير" : "Report Preview"}</h3></div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOrientation(orientation === "portrait" ? "landscape" : "portrait")} className="rounded-xl">
                <RotateCw size={18} className="mr-2" /> {orientation}
              </Button>
              <Button onClick={() => window.print()} className="bg-emerald-600 rounded-xl text-white"><Printer size={18} className="mr-2" /> {isRTL ? "طباعة" : "Print"}</Button>
              <Button variant="ghost" onClick={() => setIsPreviewOpen(false)}><X size={18} /></Button>
            </div>
          </div>
          <div className="p-8 bg-gray-50 min-h-full flex justify-center print:p-0 print:bg-white">
            <div 
              id="printable-report-area"
              className={cn(
                "bg-white shadow-2xl p-10 border transition-all origin-top print:shadow-none print:border-0 print:p-0", 
                orientation === "portrait" ? "w-[210mm] min-h-[297mm]" : "w-[297mm] min-h-[210mm]"
              )} 
              style={{ transform: `scale(${printScale / 100})` }}
            >
              <ReportContent isPreview={true} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <style>
        {`
          @media print {
            body > div:not([data-radix-portal]),
            #root,
            header,
            aside,
            main,
            .print\\:hidden {
              display: none !important;
            }

            div[data-radix-portal] {
              display: block !important;
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              width: 100% !important;
              height: 100% !important;
              background: white !important;
            }

            div[role="dialog"] {
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              width: 100% !important;
              height: 100% !important;
              background: white !important;
              padding: 0 !important;
              margin: 0 !important;
              box-shadow: none !important;
              border: none !important;
              overflow: visible !important;
            }

            div[role="dialog"] > button,
            div[role="dialog"] .sticky,
            div[role="dialog"] [class*="DialogHeader"],
            div[role="dialog"] [class*="DialogFooter"] {
              display: none !important;
            }

            #printable-report-area {
              visibility: visible !important;
              display: block !important;
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              width: 100% !important;
              height: 100% !important;
              margin: 0 !important;
              padding: 15mm !important;
              border: none !important;
              box-shadow: none !important;
              background: white !important;
              transform: none !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            @page {
              size: A4 ${orientation};
              margin: 0 !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Reports;