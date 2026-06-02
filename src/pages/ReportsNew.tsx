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
      <div className="text-center p-20 bg-white rounded-[2rem] border border-dashed border-slate-200 w-full max-w-4xl">
        <Info className="mx-auto text-slate-200 mb-4" size={48} />
        <p className="text-slate-400 font-bold">{t.noAssignments}</p>
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

    return (
      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl mx-auto w-full max-w-4xl print:border-0 print:shadow-none print:p-0" dir={isRTL ? "rtl" : "ltr"}>
        <div className="text-center mb-8 border-b-2 border-emerald-900 pb-4">
          <h3 className="text-2xl font-black text-slate-950 mb-2">{t.monthlyStats}</h3>
          <div className="inline-flex items-center gap-2 bg-emerald-50 px-4 py-1 rounded-full text-emerald-700 font-bold">
            <Calendar size={16} />
            {format(new Date(year, month - 1, 1), "MMMM yyyy", { locale: currentLocale })}
          </div>
        </div>
        <Table className="border-2 border-slate-950 w-full">
          <TableHeader>
            <TableRow className="bg-slate-100 border-b-2 border-slate-950">
              <TableHead className={cn("font-black text-slate-950 border-e-2 border-slate-950 p-3", isRTL ? "text-right" : "text-left")}>{t.employeeName}</TableHead>
              <TableHead className="text-center font-black text-slate-950 border-e-2 border-slate-950 p-3">ص</TableHead>
              <TableHead className="text-center font-black text-slate-950 border-e-2 border-slate-950 p-3">م</TableHead>
              <TableHead className="text-center font-black text-slate-950 border-e-2 border-slate-950 p-3">ل</TableHead>
              <TableHead className="text-center font-black text-white bg-slate-900 p-3">{t.total}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.map(s => (
              <TableRow key={s.id} className="border-b-2 border-slate-950">
                <TableCell className={cn("font-bold border-e-2 border-slate-950 p-3", isRTL ? "text-right" : "text-left")}>{s.lastName} {s.firstName}</TableCell>
                <TableCell className="text-center border-e-2 border-slate-950 p-3">{s.m}</TableCell>
                <TableCell className="text-center border-e-2 border-slate-950 p-3">{s.a}</TableCell>
                <TableCell className="text-center border-e-2 border-slate-950 p-3">{s.e}</TableCell>
                <TableCell className="text-center font-black p-3 bg-slate-50">{s.total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  const currentContent = () => {
    if (activeTab === "daily") return renderDailyReport();
    if (activeTab === "monthly") return renderMonthlyReport();
    return renderStatsReport();
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 print:hidden">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-950 tracking-tight">{t.reports}</h2>
          <p className="text-slate-500 font-medium">إصدار أوراق حضور وجداول إحصائية رسمية</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="lg" className="rounded-2xl border-slate-200 font-bold gap-2 h-12 px-6" onClick={() => setIsPreviewOpen(true)}>
            <Eye className="h-5 w-5 text-emerald-600" />
            {t.preview}
          </Button>
          <Button size="lg" onClick={() => window.print()} className="bg-emerald-600 text-white rounded-2xl font-black gap-2 h-12 px-8 shadow-lg shadow-emerald-100">
            <Printer className="h-5 w-5" />
            {t.print}
          </Button>
        </div>
      </div>
      
      <ReportControls 
        t={t}
        orientation={reportStyles.orientation}
        onOrientationChange={(v) => setReportStyles({...reportStyles, orientation: v})}
        selectedPeriods={selectedPeriods}
        onTogglePeriod={togglePeriod}
      />

      <Tabs defaultValue="daily" onValueChange={setActiveTab} className="w-full print:hidden">
        <TabsList className="grid w-full grid-cols-3 mb-10 h-16 bg-white border border-slate-200 p-2 rounded-3xl shadow-sm">
          <TabsTrigger value="daily" className="flex items-center gap-2 font-black rounded-2xl data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            <Calendar className="h-5 w-5" /> {t.dailyReport}
          </TabsTrigger>
          <TabsTrigger value="monthly" className="flex items-center gap-2 font-black rounded-2xl data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            <FileText className="h-5 w-5" /> {t.monthlyReport}
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2 font-black rounded-2xl data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            <BarChart2 className="h-5 w-5" /> {t.monthlyStats}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily" className="space-y-8">
          <Input type="date" value={dailyDate} onChange={(e) => setDailyDate(e.target.value)} className="max-w-xs h-12 rounded-2xl" />
          <div className="bg-slate-50/50 p-12 rounded-[3rem] border border-slate-100 flex flex-col items-center">
            {renderDailyReport()}
          </div>
        </TabsContent>
        <TabsContent value="monthly" className="space-y-8">
          <Input type="month" value={monthlyDate} onChange={(e) => setMonthlyDate(e.target.value)} className="max-w-xs h-12 rounded-2xl" />
          <div className="bg-slate-50/50 p-12 rounded-[3rem] border border-slate-100 flex flex-col items-center">
            {renderMonthlyReport()}
          </div>
        </TabsContent>
        <TabsContent value="stats" className="space-y-8">
          <Input type="month" value={monthlyDate} onChange={(e) => setMonthlyDate(e.target.value)} className="max-w-xs h-12 rounded-2xl" />
          <div className="bg-slate-50/50 p-12 rounded-[3rem] border border-slate-100 flex flex-col items-center">
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
            body > div:not([data-radix-portal]), header, aside, main, .print\\:hidden { display: none !important; }
            div[data-radix-portal] { display: block !important; position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; background: white !important; }
            .print-content-master { display: block !important; }
            .page-break-container { page-break-after: always !important; break-after: page !important; min-height: 290mm !important; width: 100% !important; padding: 10mm 15mm !important; }
            @page { size: A4 ${reportStyles.orientation}; margin: 0 !important; }
          }
        `}
      </style>
    </div>
  );
};

export default ReportsNew;