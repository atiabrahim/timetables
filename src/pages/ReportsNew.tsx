"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { 
  format, 
  parseISO, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  getDay,
  isValid
} from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Printer, Calendar, FileText, Eye, BarChart2, Info } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { PeriodPart } from "@/types";
import AttendanceSheet from "@/components/reports/AttendanceSheet";
import ReportControls from "@/components/reports/ReportControls";
import PrintPreviewDialog from "@/components/reports/PrintPreviewDialog";
import PageHeader from "../components/shared/PageHeader";
import OfficialPrintWrapper from "../components/shared/OfficialPrintWrapper";

const ReportsNew = () => {
  const { 
    employees, 
    periodConfigs, 
    getEffectiveAssignment,
    departments,
    isRTL,
    t,
    language
  } = useApp();

  const [dailyDate, setDailyDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [monthlyDate, setMonthlyDate] = useState(format(new Date(), "yyyy-MM"));
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("daily");
  const [selectedPeriods, setSelectedPeriods] = useState<PeriodPart[]>(["Morning", "Afternoon", "Evening"]);
  const [reportStyles, setReportStyles] = useState({
    fontFamily: "'Cairo', sans-serif",
    headerSize: 14,
    titleSize: 22,
    tableSize: 13,
    footerSize: 14,
    orientation: "portrait" as "portrait" | "landscape"
  });

  const currentLocale = language === "ar" ? ar : enUS;
  const supervisors = useMemo(() => [isRTL ? "رئيس مصلحة التكوين" : "Head of Training"], [isRTL]);

  const togglePeriod = (period: PeriodPart) => {
    setSelectedPeriods(prev => 
      prev.includes(period) ? prev.filter(p => p !== period) : [...prev, period]
    );
  };

  const getSheetData = (date: Date, period: PeriodPart) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const assignedIds = getEffectiveAssignment(dateStr, period);
    return assignedIds
      .map(id => employees.find(e => e.id === id))
      .filter(Boolean)
      .sort((a, b) => {
        const nameA = `${a!.lastName} ${a!.firstName}`.toLowerCase();
        const nameB = `${b!.lastName} ${b!.firstName}`.toLowerCase();
        return nameA.localeCompare(nameB, language === "ar" ? "ar" : "en");
      });
  };

  const renderDailyReport = () => {
    const date = parseISO(dailyDate);
    if (!isValid(date)) return null;
    const dayIdx = getDay(date);
    const periods: PeriodPart[] = ["Morning", "Afternoon", "Evening"];
    const activePeriods = periods.filter(p => 
      selectedPeriods.includes(p) && 
      periodConfigs.find(c => c.day === dayIdx && c.period === p)?.isActive
    );
    return activePeriods.map(p => (
      <AttendanceSheet 
        key={`${dailyDate}-${p}`}
        date={date}
        period={p}
        assignedEmployees={getSheetData(date, p)}
        t={t}
        isRTL={isRTL}
        currentLocale={currentLocale}
        departments={departments}
        reportStyles={reportStyles}
        supervisors={supervisors}
      />
    ));
  };

  const renderMonthlyReport = () => {
    const [year, month] = monthlyDate.split("-").map(Number);
    const date = new Date(year, month - 1, 1);
    if (!isValid(date)) return null;
    const days = eachDayOfInterval({ start: startOfMonth(date), end: endOfMonth(date) });
    const periods: PeriodPart[] = ["Morning", "Afternoon", "Evening"];
    const sheets: React.ReactNode[] = [];
    
    days.forEach((day) => {
      const dayIdx = getDay(day);
      periods.forEach((p) => {
        if (selectedPeriods.includes(p) && periodConfigs.find(c => c.day === dayIdx && c.period === p)?.isActive) {
          sheets.push(
            <AttendanceSheet 
              key={`${format(day, 'yyyy-MM-dd')}-${p}`}
              date={day}
              period={p}
              assignedEmployees={getSheetData(day, p)}
              t={t}
              isRTL={isRTL}
              currentLocale={currentLocale}
              departments={departments}
              reportStyles={reportStyles}
              supervisors={supervisors}
            />
          );
        }
      });
    });
    
    return sheets.length > 0 ? sheets : (
      <div className="text-center p-10 bg-white rounded-2xl border border-dashed border-slate-200 w-full max-w-4xl">
        <Info className="mx-auto text-slate-200 mb-2" size={36} />
        <p className="text-slate-400 font-bold text-sm">{t.noAssignments}</p>
      </div>
    );
  };

  const renderStatsReport = () => {
    const [year, month] = monthlyDate.split("-").map(Number);
    const days = eachDayOfInterval({ start: startOfMonth(new Date(year, month - 1, 1)), end: endOfMonth(new Date(year, month - 1, 1)) });
    
    const stats = employees.map(emp => {
      let m = 0, a = 0, e = 0;
      days.forEach(day => {
        const dateStr = format(day, "yyyy-MM-dd");
        ["Morning", "Afternoon", "Evening"].forEach(p => {
          if (selectedPeriods.includes(p as PeriodPart) && getEffectiveAssignment(dateStr, p as PeriodPart).includes(emp.id)) {
            if (p === "Morning") m++; else if (p === "Afternoon") a++; else e++;
          }
        });
      });
      return { ...emp, m, a, e, total: m + a + e };
    }).sort((a, b) => b.total - a.total);

    const subtitle = (
      <div className="inline-flex items-center gap-2 text-emerald-700 font-bold">
        <Calendar size={16} />
        {format(new Date(year, month - 1, 1), "MMMM yyyy", { locale: currentLocale })}
      </div>
    );

    return (
      <OfficialPrintWrapper
        title={t.monthlyStats}
        subtitle={subtitle}
        orientation={reportStyles.orientation}
        leftSignatureTitle={isRTL ? "المسؤول البيداغوجي" : "Pedagogical Supervisor"}
        rightSignatureTitle={isRTL ? "ختم وتوقيع المدير" : "Director Signature"}
      >
        <Table className="border-4 border-slate-950 w-full">
          <TableHeader>
            <TableRow className="bg-slate-100 border-b-4 border-slate-950">
              <TableHead className={cn("font-black text-slate-950 border-e-4 border-slate-950 p-4", isRTL ? "text-right" : "text-left")}>{t.employeeName}</TableHead>
              <TableHead className="text-center font-black text-slate-950 border-e-4 border-slate-950 p-4">ص</TableHead>
              <TableHead className="text-center font-black text-slate-950 border-e-4 border-slate-950 p-4">م</TableHead>
              <TableHead className="text-center font-black text-slate-950 border-e-4 border-slate-950 p-4">ل</TableHead>
              <TableHead className="text-center font-black text-white bg-slate-950 p-4">{t.total}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.map(s => (
              <TableRow key={s.id} className="border-b-2 border-slate-950">
                <TableCell className={cn("font-bold border-e-2 border-slate-950 p-4", isRTL ? "text-right" : "text-left")}>{s.lastName} {s.firstName}</TableCell>
                <TableCell className="text-center border-e-2 border-slate-950 p-4">{s.m}</TableCell>
                <TableCell className="text-center border-e-2 border-slate-950 p-4">{s.a}</TableCell>
                <TableCell className="text-center border-e-2 border-slate-950 p-4">{s.e}</TableCell>
                <TableCell className="text-center font-black p-4 bg-slate-50">{s.total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </OfficialPrintWrapper>
    );
  };

  const currentContent = () => {
    if (activeTab === "daily") return renderDailyReport();
    if (activeTab === "monthly") return renderMonthlyReport();
    return renderStatsReport();
  };

  return (
    <div className="space-y-4 pb-6">
      <PageHeader
        title={t.reports}
        subtitle="إصدار أوراق حضور وجداول إحصائية رسمية"
        icon={FileText}
        isRTL={isRTL}
      >
        <Button variant="outline" size="lg" className="rounded-2xl border-slate-200 font-bold gap-2 h-12 px-6 bg-white" onClick={() => setIsPreviewOpen(true)}>
          <Eye className="h-5 w-5 text-emerald-600" />
          {t.preview}
        </Button>
        <Button size="lg" onClick={() => window.print()} className="bg-emerald-600 text-white rounded-2xl font-black gap-2 h-12 px-8 shadow-lg shadow-emerald-100">
          <Printer className="h-5 w-5" />
          {t.print}
        </Button>
      </PageHeader>
      
      <ReportControls 
        t={t}
        orientation={reportStyles.orientation}
        onOrientationChange={(v) => setReportStyles({...reportStyles, orientation: v})}
        selectedPeriods={selectedPeriods}
        onTogglePeriod={togglePeriod}
      />

      <Tabs defaultValue="daily" onValueChange={setActiveTab} className="w-full print:hidden">
        <TabsList className="grid w-full grid-cols-3 mb-4 h-14 bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm">
          <TabsTrigger value="daily" className="flex items-center gap-2 font-black rounded-xl data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-xs">
            <Calendar className="h-4 w-4" /> {t.dailyReport}
          </TabsTrigger>
          <TabsTrigger value="monthly" className="flex items-center gap-2 font-black rounded-xl data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-xs">
            <FileText className="h-4 w-4" /> {t.monthlyReport}
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2 font-black rounded-xl data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-xs">
            <BarChart2 className="h-4 w-4" /> {t.monthlyStats}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily" className="space-y-3">
          <Input type="date" value={dailyDate} onChange={(e) => setDailyDate(e.target.value)} className="max-w-xs h-10 rounded-xl" />
          <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center">
            {renderDailyReport()}
          </div>
        </TabsContent>
        <TabsContent value="monthly" className="space-y-3">
          <Input type="month" value={monthlyDate} onChange={(e) => setMonthlyDate(e.target.value)} className="max-w-xs h-10 rounded-xl" />
          <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center">
            {renderMonthlyReport()}
          </div>
        </TabsContent>
        <TabsContent value="stats" className="space-y-3">
          <Input type="month" value={monthlyDate} onChange={(e) => setMonthlyDate(e.target.value)} className="max-w-xs h-10 rounded-xl" />
          <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center">
            {renderStatsReport()}
          </div>
        </TabsContent>
      </Tabs>

      <div className="print-content-master hidden print:block">
        {currentContent()}
      </div>

      <PrintPreviewDialog 
        isOpen={isPreviewOpen} 
        onOpenChange={setIsPreviewOpen}
        t={t}
        orientation={reportStyles.orientation}
        onToggleOrientation={() => setReportStyles({...reportStyles, orientation: reportStyles.orientation === 'portrait' ? 'landscape' : 'portrait'})}
        onPrint={() => window.print()}
      >
        {currentContent()}
      </PrintPreviewDialog>

      <style>
        {`
          @media print {
            body:has(div[role="dialog"]) #root {
              display: none !important;
            }
            .print-content-master { display: block !important; }
            .page-break-container { 
              page-break-after: always !important; 
              break-after: page !important; 
              width: 100% !important; 
              padding: 10mm 8mm !important;
              transform: none !important;
              margin: 0 auto !important;
              box-shadow: none !important;
              border: none !important;
              max-width: none !important;
              box-sizing: border-box !important;
            }
            .page-break-container:last-child {
              page-break-after: avoid !important;
              break-after: avoid !important;
            }
            @page { 
              size: A4 ${reportStyles.orientation}; 
              margin: 0 !important; 
            }
          }
        `}
      </style>
    </div>
  );
};

export default ReportsNew;